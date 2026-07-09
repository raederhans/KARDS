import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const PRIVATE_MARKERS = [
  ".runtime",
  "kards-private-assets",
  "stage5",
  "stage6",
  "DEV_PREVIEW",
  "Washington.png",
  "t70.card",
  "dingo.card",
];

const lowerCaseMarkers = PRIVATE_MARKERS.map((marker) => marker.toLowerCase());
const findings = [];

try {
  await scanPath(DIST_DIR);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (findings.length > 0) {
  console.error("Private asset markers were found in dist:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("dist private boundary verified.");

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

  const content = await readFile(targetPath);
  const contentMatch = findMarker(content.toString("utf8"));
  if (contentMatch) {
    findings.push(`${relativePath} content contains ${contentMatch}`);
  }
}

function findMarker(value) {
  const normalizedValue = value.toLowerCase();
  const markerIndex = lowerCaseMarkers.findIndex((marker) => normalizedValue.includes(marker));
  return markerIndex >= 0 ? PRIVATE_MARKERS[markerIndex] : null;
}
