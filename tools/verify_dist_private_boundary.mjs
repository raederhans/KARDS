import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const REFERENCE_PACK_DIR = path.join(DIST_DIR, "reference-pack", "v1");
const CATALOG_SOURCE = path.resolve("src", "devPreviewCatalog.ts");
const FORBIDDEN_MARKERS = [
  ".runtime",
  "kards-private-assets",
  "private local validation only",
  "must not be committed, bundled, or redistributed",
  "source-snapshots",
  "calibration-report",
  "stage5",
  "stage6",
  "stage6-source-inventory",
  "stage6-private-assets-manifest",
  "\\users\\raede\\",
  "/users/raede/",
  "steamapps",
];
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".map", ".svg", ".txt"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SENSITIVE_PATTERNS = [
  { label: "Windows user path", pattern: /[a-z]:[\\/]+users[\\/]+[^\\/]+[\\/]+/i },
  { label: "Unix user path", pattern: /\/users\/[^/]+\//i },
  { label: "Unix home path", pattern: /\/home\/[^/]+\//i },
  { label: "sourcePath field", pattern: /["']sourcePath["']\s*:/i },
  { label: "credential field", pattern: /["'](?:apiKey|password|secret|token)["']\s*:/i },
  { label: "credential assignment", pattern: /(?:API_KEY|GITHUB_TOKEN|VERCEL_TOKEN)\s*=/i },
  { label: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { label: "secret key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
];

const lowerCaseMarkers = FORBIDDEN_MARKERS.map((marker) => marker.toLowerCase());
const findings = [];

try {
  await scanPath(DIST_DIR);
  await verifyPublicReferencePack();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (findings.length > 0) {
  console.error("Private or intermediate asset markers were found in dist:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("dist private boundary and authorized reference pack verified.");

async function scanPath(targetPath) {
  const targetStat = await stat(targetPath);
  if (targetStat.isDirectory()) {
    const entries = await readdir(targetPath);
    await Promise.all(entries.map((entry) => scanPath(path.join(targetPath, entry))));
    return;
  }

  const relativePath = path.relative(DIST_DIR, targetPath).replace(/\\/g, "/");
  const pathMatch = findMarker(relativePath);
  if (pathMatch) {
    findings.push(`${relativePath} path contains ${pathMatch}`);
  }

  if (TEXT_EXTENSIONS.has(path.extname(targetPath).toLowerCase())) {
    const content = await readFile(targetPath, "utf8");
    const contentMatch = findMarker(content);
    if (contentMatch) {
      findings.push(`${relativePath} content contains ${contentMatch}`);
    }
    addSensitiveFindings(relativePath, content);
  } else if (IMAGE_EXTENSIONS.has(path.extname(targetPath).toLowerCase())) {
    addSensitiveFindings(relativePath, (await readFile(targetPath)).toString("latin1"));
  }
}

async function verifyPublicReferencePack() {
  const manifestPath = path.join(REFERENCE_PACK_DIR, "kards-asset-pack.json");
  const noticePath = path.join(REFERENCE_PACK_DIR, "RIGHTS-NOTICE.txt");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const rightsNotice = await readFile(noticePath, "utf8");
  const catalogSource = await readFile(CATALOG_SOURCE, "utf8");
  const sampleIds = [...catalogSource.matchAll(/cardSample\("([^"]+)"/g)].map((match) => match[1]);
  const hqFiles = catalogSource
    .split(/\r?\n/)
    .filter((line) => /^\s{2}hqSample\("/.test(line))
    .map((line) => [...line.matchAll(/"([^"]+)"/g)][4]?.[1]);

  if (manifest.version !== 1) {
    throw new Error("The bundled authorized pack must use manifest version 1.");
  }
  if (manifest.requiresPrivateExportConfirm !== false) {
    throw new Error("The bundled authorized pack must disable private export confirmation explicitly.");
  }
  if (!Array.isArray(manifest.images) || manifest.images.length === 0) {
    throw new Error("The bundled authorized pack must list its images.");
  }
  if (manifest.fonts !== undefined && (!Array.isArray(manifest.fonts) || manifest.fonts.length > 0)) {
    throw new Error("The bundled authorized pack must not contain undeclared font files.");
  }
  if (!/separate authorization/i.test(rightsNotice) || !/rights holders/i.test(rightsNotice)) {
    throw new Error("The public rights notice must state the authorization and retained ownership.");
  }
  if (sampleIds.length === 0 || new Set(sampleIds).size !== sampleIds.length) {
    throw new Error("The reference catalog must contain a unique card sample list.");
  }
  if (hqFiles.length === 0 || hqFiles.some((file) => !file) || new Set(hqFiles).size !== hqFiles.length) {
    throw new Error("The reference catalog must contain a unique HQ reference list.");
  }

  await assertDirectoryShape(
    REFERENCE_PACK_DIR,
    ["RIGHTS-NOTICE.txt", "kards-asset-pack.json"],
    ["images", "references", "samples"],
  );
  await assertDirectoryShape(
    path.join(REFERENCE_PACK_DIR, "references"),
    [],
    ["cards", "hq"],
  );

  const manifestFiles = new Set();
  for (const entry of manifest.images) {
    if (
      !entry.file ||
      path.isAbsolute(entry.file) ||
      entry.file.split(/[\\/]+/).includes("..") ||
      !entry.file.startsWith("images/") ||
      path.extname(entry.file).toLowerCase() !== ".png"
    ) {
      throw new Error(`Unsafe public manifest path: ${entry.file ?? "<missing>"}`);
    }
    if (manifestFiles.has(entry.file)) {
      throw new Error(`Duplicate public manifest path: ${entry.file}`);
    }
    manifestFiles.add(entry.file);
    const imagePath = path.join(REFERENCE_PACK_DIR, entry.file);
    const imageStat = await stat(imagePath);
    if (!imageStat.isFile() || !(await hasPngSignature(imagePath))) {
      throw new Error(`Invalid public manifest image: ${entry.file}`);
    }
  }

  await assertExactFiles(
    path.join(REFERENCE_PACK_DIR, "images"),
    [...manifestFiles].map((file) => file.slice("images/".length)),
    "manifest images",
    true,
  );
  await assertExactFiles(
    path.join(REFERENCE_PACK_DIR, "samples"),
    sampleIds.map((id) => `${id}.card.json`),
    "sample cards",
  );
  await assertExactFiles(
    path.join(REFERENCE_PACK_DIR, "references", "cards"),
    sampleIds.map((id) => `${id}.png`),
    "card references",
  );
  await assertExactFiles(
    path.join(REFERENCE_PACK_DIR, "references", "hq"),
    hqFiles,
    "HQ references",
  );

  for (const sampleId of sampleIds) {
    const sample = JSON.parse(
      await readFile(path.join(REFERENCE_PACK_DIR, "samples", `${sampleId}.card.json`), "utf8"),
    );
    if (sample.version !== 1 || !sample.artwork?.dataUrl?.startsWith("data:image/png;base64,")) {
      throw new Error(`Invalid bundled sample card: ${sampleId}`);
    }
  }
}

async function assertExactFiles(directory, expectedFiles, label, recursive = false) {
  const actualFiles = recursive
    ? await listRelativeFiles(directory)
    : (await readdir(directory, { withFileTypes: true })).map((entry) => {
        if (!entry.isFile()) {
          throw new Error(`Unexpected directory in ${label}: ${entry.name}`);
        }
        return entry.name;
      });
  const expected = [...expectedFiles].sort();
  const actual = actualFiles.sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} do not match the reference catalog.`);
  }
}

async function assertDirectoryShape(directory, expectedFiles, expectedDirectories) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const unsupported = entries.filter((entry) => !entry.isFile() && !entry.isDirectory());
  if (
    unsupported.length > 0 ||
    JSON.stringify(files) !== JSON.stringify([...expectedFiles].sort()) ||
    JSON.stringify(directories) !== JSON.stringify([...expectedDirectories].sort())
  ) {
    throw new Error(`Unexpected public pack structure under ${path.relative(DIST_DIR, directory)}.`);
  }
}

async function listRelativeFiles(directory, root = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listRelativeFiles(entryPath, root));
    } else if (entry.isFile()) {
      files.push(path.relative(root, entryPath).replace(/\\/g, "/"));
    } else {
      throw new Error(`Unsupported link or device in the public pack: ${entryPath}`);
    }
  }
  return files;
}

async function hasPngSignature(filePath) {
  const content = await readFile(filePath);
  return content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
}

function addSensitiveFindings(relativePath, content) {
  for (const { label, pattern } of SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      findings.push(`${relativePath} content contains ${label}`);
    }
  }
}

function findMarker(value) {
  const normalizedValue = value.toLowerCase();
  const markerIndex = lowerCaseMarkers.findIndex((marker) => normalizedValue.includes(marker));
  return markerIndex >= 0 ? FORBIDDEN_MARKERS[markerIndex] : null;
}
