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

export const LOCAL_ASSET_PACK_MANIFEST = "kards-asset-pack.json";
const FONT_ROLES = new Set(["title", "body", "keyword", "cost", "stat", "utility"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_FONT_EXTENSIONS = new Set([".ttf", ".otf", ".woff", ".woff2"]);
const MAX_ASSET_PACK_FONT_BYTES = 8 * 1024 * 1024;

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
  const manifestFile = files.find((file) => getBaseName(getFilePath(file)) === LOCAL_ASSET_PACK_MANIFEST);

  if (!manifestFile) {
    throw new Error(`Select a folder that contains ${LOCAL_ASSET_PACK_MANIFEST}.`);
  }

  const manifest = parseAssetPackManifest(JSON.parse(await manifestFile.text()));
  const objectUrls: string[] = [];
  const loadedFonts: FontFace[] = [];
  const warnings: string[] = [];
  const imageEntries: CardRenderAssetEntry[] = [];
  const fonts: CardRenderFontSet = {};

  try {
    for (const entry of manifest.images ?? []) {
      const imageFile = filesByPath.get(normalizePath(entry.file));
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

      const loadedImage = await loadImageFile(imageFile);
      objectUrls.push(loadedImage.url);
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

  const manifest = parseAssetPackManifest(await manifestResponse.json());
  const baseUrl = new URL(manifestUrl, window.location.href);
  const loadedFonts: FontFace[] = [];
  const warnings: string[] = [];
  const imageEntries: CardRenderAssetEntry[] = [];
  const fonts: CardRenderFontSet = {};

  const imageResults = await Promise.all(
    (manifest.images ?? []).map(async (entry): Promise<
      { asset: CardRenderAssetEntry } | { warning: string }
    > => {
      try {
        return {
          asset: {
            ...entry,
            image: await loadImageUrl(resolveManifestUrl(baseUrl, entry.file)),
          } satisfies CardRenderAssetEntry,
        };
      } catch {
        return { warning: `Could not load image: ${entry.file}` };
      }
    }),
  );
  for (const result of imageResults) {
    if ("asset" in result) {
      imageEntries.push(result.asset);
    } else {
      warnings.push(result.warning);
    }
  }

  for (const entry of manifest.fonts ?? []) {
    try {
      const loadedFont = await loadFontUrl(entry.family, resolveManifestUrl(baseUrl, entry.file));
      loadedFonts.push(loadedFont);
      fonts[entry.role ?? "body"] = quoteFontFamily(entry.family);
    } catch {
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
      loadedFonts.forEach((font) => document.fonts.delete(font));
    },
  };
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
  if (
    manifest.requiresPrivateExportConfirm !== undefined &&
    typeof manifest.requiresPrivateExportConfirm !== "boolean"
  ) {
    throw new Error(`${LOCAL_ASSET_PACK_MANIFEST} requiresPrivateExportConfirm must be a boolean.`);
  }

  for (const entry of manifest.images ?? []) {
    if (!isCardRenderAssetSlot(entry.slot)) {
      throw new Error(`Unknown render asset slot: ${entry.slot}`);
    }
    if (!entry.file) {
      throw new Error(`Asset slot ${entry.slot} is missing a file path.`);
    }
    validateManifestRelativePath(entry.file);
  }

  for (const entry of manifest.fonts ?? []) {
    if (!entry.family || !entry.file) {
      throw new Error("Every font entry needs both family and file.");
    }
    validateManifestRelativePath(entry.file);
    if (entry.role && !FONT_ROLES.has(entry.role)) {
      throw new Error(`Unknown font role: ${entry.role}`);
    }
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

function indexFilesByPath(files: File[]): Map<string, File> {
  const filesByPath = new Map<string, File>();
  for (const file of files) {
    const fullPath = normalizePath(getFilePath(file));
    filesByPath.set(fullPath, file);
    filesByPath.set(getBaseName(fullPath), file);
    const pathAfterRoot = fullPath.split("/").slice(1).join("/");
    if (pathAfterRoot) {
      filesByPath.set(pathAfterRoot, file);
    }
  }
  return filesByPath;
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

function loadImageUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (!isAllowedImageDimensions(image)) {
        reject(new Error(`Image dimensions are too large for ${url}.`));
        return;
      }
      resolve(image);
    };
    image.onerror = () => reject(new Error(`Could not read ${url} as an image.`));
    image.src = url;
  });
}

async function loadFontFile(family: string, file: File): Promise<FontFace> {
  const font = new FontFace(family, await file.arrayBuffer());
  await font.load();
  document.fonts.add(font);
  return font;
}

async function loadFontUrl(family: string, url: string): Promise<FontFace> {
  const font = new FontFace(family, `url("${url.replace(/"/g, '\\"')}")`);
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
