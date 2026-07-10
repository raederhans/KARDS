import {
  createStaticAssetResolver,
  isCardRenderAssetSlot,
  type CardRenderAssetEntry,
  type CardRenderAssetSlot,
  type CardRenderAssets,
  type CardRenderFontSet,
} from "./canvas/renderAssets";
import {
  hasAllowedImageSignature,
  isAllowedImageDimensions,
  isAllowedImageType,
  MAX_IMAGE_FILE_BYTES,
} from "./limits";
import type { CardKind } from "./types";
import type { CardTemplate } from "./canvas/layout";
import { CARD_KINDS, NATIONS, RARITIES, SETS } from "./presets";

export const LOCAL_ASSET_PACK_MANIFEST = "kards-asset-pack.json";
const FONT_ROLES = new Set(["title", "body", "keyword", "cost", "stat", "utility"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_FONT_EXTENSIONS = new Set([".ttf", ".otf", ".woff", ".woff2"]);
const MAX_ASSET_PACK_FONT_BYTES = 8 * 1024 * 1024;
const MAX_ASSET_PACK_MANIFEST_BYTES = 256 * 1024;
const MAX_ASSET_PACK_IMAGE_ENTRIES = 256;
const MAX_ASSET_PACK_FONT_ENTRIES = 6;
const MAX_ASSET_PACK_FILE_BYTES = 64 * 1024 * 1024;
const MAX_ASSET_PACK_IMAGE_PIXELS = 64_000_000;
const MAX_ASSET_PACK_IMAGE_LOADS = 4;
const CARD_KIND_IDS = new Set(CARD_KINDS.map((kind) => kind.id));
const NATION_IDS = new Set(NATIONS.map((nation) => nation.id));
const RARITY_IDS = new Set(RARITIES.map((rarity) => rarity.id));
const SET_IDS = new Set(SETS.map((set) => set.id));
const CARD_TEMPLATES = new Set<CardTemplate>(["unit", "command", "hq"]);

class AssetPackBudgetError extends Error {}

type AssetPackImageManifestEntry = {
  slot: CardRenderAssetSlot;
  file: string;
  kind?: CardKind;
  nationId?: string;
  rarityId?: string;
  setId?: string;
  template?: CardTemplate;
};

type AssetPackFontManifestEntry = {
  family: string;
  file: string;
  role?: keyof CardRenderFontSet;
};

type AssetPackManifest = {
  version: 1;
  name?: string;
  rightsNotice?: string;
  requiresPrivateExportConfirm?: boolean;
  images?: AssetPackImageManifestEntry[];
  fonts?: AssetPackFontManifestEntry[];
};

export type LoadedAssetPack = CardRenderAssets & {
  name: string;
  imageCount: number;
  fontCount: number;
  requiresPrivateExportConfirm: boolean;
  warnings: string[];
  fonts: CardRenderFontSet;
  dispose: () => void;
};

export async function loadAssetPackFromFiles(fileList: FileList | File[]): Promise<LoadedAssetPack> {
  const files = Array.from(fileList);
  const filesByPath = indexFilesByPath(files);
  const manifestFiles = files.filter(
    (file) => getBaseName(getFilePath(file)) === LOCAL_ASSET_PACK_MANIFEST,
  );
  const manifestFile = manifestFiles[0];

  if (!manifestFile) {
    throw new Error(`Select a folder that contains ${LOCAL_ASSET_PACK_MANIFEST}.`);
  }
  if (manifestFiles.length > 1) {
    throw new Error(`Selected folder contains multiple ${LOCAL_ASSET_PACK_MANIFEST} files.`);
  }
  if (manifestFile.size > MAX_ASSET_PACK_MANIFEST_BYTES) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} manifest is too large.`);
  }

  const manifest = parseAssetPackManifest(JSON.parse(await manifestFile.text()));
  assertLocalPackByteBudget(manifest, filesByPath);
  const objectUrls: string[] = [];
  const loadedFonts: FontFace[] = [];
  const warnings: string[] = [];
  const imageEntries: CardRenderAssetEntry[] = [];
  const fonts: CardRenderFontSet = {};
  const loadedImagesByFile = new Map<File, { image: HTMLImageElement; url: string }>();
  let decodedImagePixels = 0;

  try {
    for (const entry of manifest.images ?? []) {
      const normalizedFile = normalizePath(entry.file);
      const imageFile = filesByPath.get(normalizedFile);
      if (!imageFile) {
        warnings.push(`Missing image: ${entry.file}`);
        continue;
      }
      if (!isAllowedAssetPackImageType(imageFile)) {
        warnings.push(`Unsupported image: ${entry.file}`);
        continue;
      }
      if (imageFile.size > MAX_IMAGE_FILE_BYTES) {
        warnings.push(`Image too large: ${entry.file}`);
        continue;
      }
      if (!(await hasAllowedImageSignature(imageFile))) {
        warnings.push(`Unsupported image: ${entry.file}`);
        continue;
      }

      let loadedImage = loadedImagesByFile.get(imageFile);
      if (!loadedImage) {
        loadedImage = await loadImageFile(imageFile);
        decodedImagePixels += getImagePixels(loadedImage.image);
        if (decodedImagePixels > MAX_ASSET_PACK_IMAGE_PIXELS) {
          URL.revokeObjectURL(loadedImage.url);
          throw new Error("Asset pack image pixel budget is too large.");
        }
        loadedImagesByFile.set(imageFile, loadedImage);
        objectUrls.push(loadedImage.url);
      }
      imageEntries.push({ ...entry, image: loadedImage.image });
    }

    for (const entry of manifest.fonts ?? []) {
      const fontFile = filesByPath.get(normalizePath(entry.file));
      if (!fontFile) {
        warnings.push(`Missing font: ${entry.file}`);
        continue;
      }
      if (!isAllowedAssetPackFont(fontFile)) {
        warnings.push(`Unsupported font: ${entry.file}`);
        continue;
      }
      if (fontFile.size > MAX_ASSET_PACK_FONT_BYTES) {
        warnings.push(`Font too large: ${entry.file}`);
        continue;
      }

      try {
        loadedFonts.push(await loadFontFile(entry.family, fontFile));
        fonts[entry.role ?? "body"] = quoteFontFamily(entry.family);
      } catch {
        warnings.push(`Could not load font: ${entry.file}`);
      }
    }
  } catch (error) {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    throw error;
  }

  const resolver = createStaticAssetResolver(imageEntries, manifest.name ?? "Local KARDS asset pack");
  return {
    ...resolver,
    name: manifest.name ?? "Local KARDS asset pack",
    imageCount: imageEntries.length,
    fontCount: Object.keys(fonts).length,
    requiresPrivateExportConfirm: false,
    warnings,
    fonts,
    dispose() {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      loadedFonts.forEach((font) => document.fonts.delete(font));
    },
  };
}

export async function loadAssetPackFromUrl(manifestUrl: string): Promise<LoadedAssetPack> {
  const manifestResponse = await fetch(manifestUrl, { cache: "no-store" });
  if (!manifestResponse.ok) {
    throw new Error(`Could not load ${LOCAL_ASSET_PACK_MANIFEST} from ${manifestUrl}.`);
  }
  const manifestText = new TextDecoder().decode(
    await readBoundedResponse(manifestResponse, MAX_ASSET_PACK_MANIFEST_BYTES, "Asset pack manifest"),
  );
  const manifest = parseAssetPackManifest(JSON.parse(manifestText));
  const baseUrl = new URL(manifestUrl, window.location.href);
  const loadedFonts: FontFace[] = [];
  const warnings: string[] = [];
  const imageEntries: CardRenderAssetEntry[] = [];
  const fonts: CardRenderFontSet = {};
  const objectUrls: string[] = [];
  let downloadedResourceBytes = 0;
  let decodedImagePixels = 0;

  const loadedImagesByUrl = new Map<string, Promise<{ image: HTMLImageElement; url: string }>>();
  let imageResults: Array<{ asset: CardRenderAssetEntry } | { warning: string }>;
  try {
    imageResults = await mapWithConcurrency(
      manifest.images ?? [],
      MAX_ASSET_PACK_IMAGE_LOADS,
      async (entry): Promise<{ asset: CardRenderAssetEntry } | { warning: string }> => {
        try {
          const imageUrl = resolveManifestUrl(baseUrl, entry.file);
          let loadedImage = loadedImagesByUrl.get(imageUrl);
          if (!loadedImage) {
            loadedImage = (async () => {
              const imageFile = await fetchBoundedResource(
                imageUrl,
                MAX_IMAGE_FILE_BYTES,
                "image",
                reserveResourceBytes,
              );
              if (!isAllowedAssetPackImageType(imageFile) || !(await hasAllowedImageSignature(imageFile))) {
                throw new Error(`Unsupported image: ${entry.file}`);
              }
              const decoded = await loadImageFile(imageFile);
              decodedImagePixels += getImagePixels(decoded.image);
              if (decodedImagePixels > MAX_ASSET_PACK_IMAGE_PIXELS) {
                URL.revokeObjectURL(decoded.url);
                throw new AssetPackBudgetError("Asset pack image pixel budget is too large.");
              }
              objectUrls.push(decoded.url);
              return decoded;
            })();
            loadedImagesByUrl.set(imageUrl, loadedImage);
          }
          const { image } = await loadedImage;
          return { asset: { ...entry, image } satisfies CardRenderAssetEntry };
        } catch (error) {
          if (error instanceof AssetPackBudgetError) {
            throw error;
          }
          return { warning: `Could not load image: ${entry.file}` };
        }
      },
    );
  } catch (error) {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    throw error;
  }
  for (const result of imageResults) {
    if ("asset" in result) {
      imageEntries.push(result.asset);
    } else {
      warnings.push(result.warning);
    }
  }

  const loadedFontFilesByUrl = new Map<string, Promise<File>>();
  for (const entry of manifest.fonts ?? []) {
    try {
      const fontUrl = resolveManifestUrl(baseUrl, entry.file);
      let loadedFontFile = loadedFontFilesByUrl.get(fontUrl);
      if (!loadedFontFile) {
        loadedFontFile = fetchBoundedResource(
          fontUrl,
          MAX_ASSET_PACK_FONT_BYTES,
          "font",
          reserveResourceBytes,
        );
        loadedFontFilesByUrl.set(fontUrl, loadedFontFile);
      }
      const fontFile = await loadedFontFile;
      if (!isAllowedAssetPackFont(fontFile)) {
        throw new Error(`Unsupported font: ${entry.file}`);
      }
      const loadedFont = await loadFontFile(entry.family, fontFile);
      loadedFonts.push(loadedFont);
      fonts[entry.role ?? "body"] = quoteFontFamily(entry.family);
    } catch (error) {
      if (error instanceof AssetPackBudgetError) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        loadedFonts.forEach((font) => document.fonts.delete(font));
        throw error;
      }
      warnings.push(`Could not load font: ${entry.file}`);
    }
  }

  const resolver = createStaticAssetResolver(imageEntries, manifest.name ?? "Local KARDS asset pack");
  return {
    ...resolver,
    name: manifest.name ?? "Local KARDS asset pack",
    imageCount: imageEntries.length,
    fontCount: Object.keys(fonts).length,
    requiresPrivateExportConfirm: manifest.requiresPrivateExportConfirm ?? true,
    warnings,
    fonts,
    dispose() {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      loadedFonts.forEach((font) => document.fonts.delete(font));
    },
  };

  function reserveResourceBytes(bytes: number): void {
    downloadedResourceBytes += bytes;
    assertAssetPackByteBudget(downloadedResourceBytes);
  }
}

function parseAssetPackManifest(value: unknown): AssetPackManifest {
  if (!value || typeof value !== "object") {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} must contain a JSON object.`);
  }

  const manifest = value as Partial<AssetPackManifest>;
  if (manifest.version !== 1) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} must use version 1.`);
  }
  if (manifest.images !== undefined && !Array.isArray(manifest.images)) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} images must be an array.`);
  }
  if (manifest.fonts !== undefined && !Array.isArray(manifest.fonts)) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} fonts must be an array.`);
  }
  if ((manifest.images?.length ?? 0) > MAX_ASSET_PACK_IMAGE_ENTRIES) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} has too many image entries.`);
  }
  if ((manifest.fonts?.length ?? 0) > MAX_ASSET_PACK_FONT_ENTRIES) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} has too many font entries.`);
  }
  if (manifest.name !== undefined && typeof manifest.name !== "string") {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} name must be a string.`);
  }
  if (manifest.rightsNotice !== undefined && typeof manifest.rightsNotice !== "string") {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} rightsNotice must be a string.`);
  }
  if (
    manifest.requiresPrivateExportConfirm !== undefined &&
    typeof manifest.requiresPrivateExportConfirm !== "boolean"
  ) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} requiresPrivateExportConfirm must be a boolean.`);
  }

  const imageSelectors = new Set<string>();
  for (const entry of manifest.images ?? []) {
    if (!entry || typeof entry !== "object") {
      throw new Error("Every image entry must be an object.");
    }
    if (!isCardRenderAssetSlot(entry.slot)) {
      throw new Error(`Unknown render asset slot: ${entry.slot}`);
    }
    if (typeof entry.file !== "string" || !entry.file) {
      throw new Error(`Asset slot ${entry.slot} is missing a file path.`);
    }
    for (const key of ["kind", "nationId", "rarityId", "setId", "template"] as const) {
      if (entry[key] !== undefined && typeof entry[key] !== "string") {
        throw new Error(`Asset selector ${key} must be a string.`);
      }
    }
    if (entry.kind !== undefined && !CARD_KIND_IDS.has(entry.kind as CardKind)) {
      throw new Error(`Unknown card kind: ${entry.kind}.`);
    }
    if (entry.nationId !== undefined && !NATION_IDS.has(entry.nationId)) {
      throw new Error(`Unknown nation selector: ${entry.nationId}.`);
    }
    if (entry.rarityId !== undefined && !RARITY_IDS.has(entry.rarityId)) {
      throw new Error(`Unknown rarity selector: ${entry.rarityId}.`);
    }
    if (entry.setId !== undefined && !SET_IDS.has(entry.setId)) {
      throw new Error(`Unknown set selector: ${entry.setId}.`);
    }
    if (entry.template !== undefined && !CARD_TEMPLATES.has(entry.template as CardTemplate)) {
      throw new Error(`Unknown asset template: ${entry.template}.`);
    }
    validateManifestRelativePath(entry.file);
    const selector = getImageSelectorKey(entry);
    if (imageSelectors.has(selector)) {
      throw new Error(`Duplicate asset selector: ${selector}.`);
    }
    imageSelectors.add(selector);
  }

  const fontRoles = new Set<string>();
  for (const entry of manifest.fonts ?? []) {
    if (!entry || typeof entry !== "object") {
      throw new Error("Every font entry must be an object.");
    }
    if (typeof entry.family !== "string" || !entry.family || typeof entry.file !== "string" || !entry.file) {
      throw new Error("Every font entry needs both family and file.");
    }
    validateManifestRelativePath(entry.file);
    if (entry.role !== undefined && typeof entry.role !== "string") {
      throw new Error("Font role must be a string.");
    }
    if (entry.role !== undefined && !FONT_ROLES.has(entry.role)) {
      throw new Error(`Unknown font role: ${entry.role}`);
    }
    const role = entry.role ?? "body";
    if (fontRoles.has(role)) {
      throw new Error(`Duplicate font role: ${role}.`);
    }
    fontRoles.add(role);
  }

  return {
    version: 1,
    name: manifest.name,
    rightsNotice: manifest.rightsNotice,
    requiresPrivateExportConfirm: manifest.requiresPrivateExportConfirm,
    images: manifest.images ?? [],
    fonts: manifest.fonts ?? [],
  };
}

function getImageSelectorKey(entry: AssetPackImageManifestEntry): string {
  return [
    entry.slot,
    entry.kind ?? "",
    entry.nationId ?? "",
    entry.rarityId ?? "",
    entry.setId ?? "",
    entry.template ?? "",
  ].join("|");
}

function assertLocalPackByteBudget(manifest: AssetPackManifest, filesByPath: Map<string, File | null>): void {
  const referencedFiles = new Set<File>();
  for (const entry of [...(manifest.images ?? []), ...(manifest.fonts ?? [])]) {
    const file = filesByPath.get(normalizePath(entry.file));
    if (file) {
      referencedFiles.add(file);
    }
  }
  const totalBytes = Array.from(referencedFiles).reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_ASSET_PACK_FILE_BYTES) {
    throw new Error("Asset pack file budget is too large.");
  }
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  let failure: unknown;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (failure === undefined && nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await mapper(values[index]);
      } catch (error) {
        failure = error;
      }
    }
  });
  await Promise.all(workers);
  if (failure !== undefined) {
    throw failure;
  }
  return results;
}

function getImagePixels(image: Pick<HTMLImageElement, "naturalWidth" | "naturalHeight" | "width" | "height">): number {
  return (image.naturalWidth || image.width) * (image.naturalHeight || image.height);
}

async function fetchBoundedResource(
  url: string,
  maxBytes: number,
  label: "image" | "font",
  reserveBytes: (bytes: number) => void,
): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load asset pack ${label}: ${url}`);
  }
  const bytes = await readBoundedResponse(response, maxBytes, `Asset pack ${label}`, reserveBytes);
  const fileName = getBaseName(new URL(url).pathname);
  return new File([copyToArrayBuffer(bytes)], fileName, {
    type: response.headers.get("content-type")?.split(";", 1)[0] ?? "",
  });
}

async function readBoundedResponse(
  response: Response,
  maxBytes: number,
  label: string,
  reserveBytes?: (bytes: number) => void,
): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) {
    assertDeclaredResourceSize(response, maxBytes, label);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) {
      throw new Error(`${label} is too large.`);
    }
    reserveBytes?.(bytes.byteLength);
    return bytes;
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let reservedBytes = 0;
  try {
    assertDeclaredResourceSize(response, maxBytes, label);
    const declaredBytes = getDeclaredResourceSize(response);
    if (declaredBytes !== null) {
      reserveBytes?.(declaredBytes);
      reservedBytes = declaredBytes;
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error(`${label} is too large.`);
      }
      if (totalBytes > reservedBytes) {
        reserveBytes?.(totalBytes - reservedBytes);
        reservedBytes = totalBytes;
      }
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function assertDeclaredResourceSize(response: Response, maxBytes: number, label: string): void {
  const declaredBytes = getDeclaredResourceSize(response);
  if (declaredBytes !== null && declaredBytes > maxBytes) {
    throw new Error(`${label} is too large.`);
  }
}

function getDeclaredResourceSize(response: Response): number | null {
  const value = response.headers.get("content-length");
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function assertAssetPackByteBudget(bytes: number): void {
  if (bytes > MAX_ASSET_PACK_FILE_BYTES) {
    throw new AssetPackBudgetError("Asset pack file budget is too large.");
  }
}

function indexFilesByPath(files: File[]): Map<string, File | null> {
  const filesByPath = new Map<string, File | null>();
  for (const file of files) {
    const fullPath = normalizePath(getFilePath(file));
    addFilePath(filesByPath, fullPath, file);
    addFilePath(filesByPath, getBaseName(fullPath), file);
    const pathAfterRoot = fullPath.split("/").slice(1).join("/");
    if (pathAfterRoot) {
      addFilePath(filesByPath, pathAfterRoot, file);
    }
  }
  return filesByPath;
}

function addFilePath(filesByPath: Map<string, File | null>, path: string, file: File): void {
  if (!filesByPath.has(path)) {
    filesByPath.set(path, file);
  } else if (filesByPath.get(path) !== file) {
    filesByPath.set(path, null);
  }
}

function getFilePath(file: File): string {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
}

function getBaseName(path: string): string {
  return normalizePath(path).split("/").at(-1) ?? path;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
}

function isAllowedAssetPackImageType(file: File): boolean {
  return isAllowedImageType(file.type) || (!file.type && ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name)));
}

function isAllowedAssetPackFont(file: File): boolean {
  return ALLOWED_FONT_EXTENSIONS.has(getFileExtension(file.name));
}

function getFileExtension(path: string): string {
  const baseName = getBaseName(path);
  const dotIndex = baseName.lastIndexOf(".");
  return dotIndex >= 0 ? baseName.slice(dotIndex).toLowerCase() : "";
}

function validateManifestRelativePath(path: string): void {
  const normalizedPath = path.replace(/\\/g, "/");
  const pathSegments = normalizedPath.split("/");
  if (
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(normalizedPath) ||
    normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//") ||
    pathSegments.some((part) => !isSafeManifestPathSegment(part, path))
  ) {
    throw new Error(`Asset manifest paths must stay relative to the selected pack: ${path}`);
  }
}

function isSafeManifestPathSegment(segment: string, fullPath: string): boolean {
  let decodedSegment: string;
  try {
    decodedSegment = decodeManifestPathSegment(segment);
  } catch {
    throw new Error(`Asset manifest paths must stay relative to the selected pack: ${fullPath}`);
  }
  return (
    segment !== "" &&
    decodedSegment !== "" &&
    decodedSegment !== "." &&
    decodedSegment !== ".." &&
    !decodedSegment.includes("/") &&
    !decodedSegment.includes("\\")
  );
}

function decodeManifestPathSegment(segment: string): string {
  let decodedSegment = segment;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const nextSegment = decodeURIComponent(decodedSegment);
    if (nextSegment === decodedSegment) {
      return decodedSegment;
    }
    decodedSegment = nextSegment;
  }
  return decodedSegment;
}

function loadImageFile(file: File): Promise<{ image: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (!isAllowedImageDimensions(image)) {
        URL.revokeObjectURL(url);
        reject(new Error(`Image dimensions are too large for ${file.name}.`));
        return;
      }
      resolve({ image, url });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name} as an image.`));
    };
    image.src = url;
  });
}

async function loadFontFile(family: string, file: File): Promise<FontFace> {
  const font = new FontFace(family, await file.arrayBuffer());
  await font.load();
  document.fonts.add(font);
  return font;
}

function resolveManifestUrl(baseUrl: URL, relativePath: string): string {
  return new URL(relativePath, baseUrl).toString();
}

function quoteFontFamily(family: string): string {
  return `"${family.replace(/"/g, '\\"')}"`;
}
