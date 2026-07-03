import type { CardKind, CardSpec } from "./types";
import { CARD_KINDS, NATIONS, RARITIES, SETS } from "./presets";
import { BODY_MAX_LENGTH, isAllowedImageDataUrl, KEYWORD_MAX_LENGTH, TITLE_MAX_LENGTH } from "./limits";

const VALID_KINDS = new Set(CARD_KINDS.map((kind) => kind.id));
const VALID_NATIONS = new Set(NATIONS.map((nation) => nation.id));
const VALID_RARITIES = new Set(RARITIES.map((rarity) => rarity.id));
const VALID_SETS = new Set(SETS.map((set) => set.id));

export const DEFAULT_CARD: CardSpec = {
  version: 1,
  kind: "tank",
  nation: "us",
  rarity: "limited",
  set: "base",
  title: "CUSTOM TANK",
  body: "When this unit advances, it deals 1 damage to a target.",
  keywordLine: "ARMOR 1",
  costs: {
    deployment: 4,
    operation: 2,
  },
  stats: {
    attack: 3,
    defense: 5,
    hqDefense: 20,
  },
  artwork: {
    source: "none",
    crop: {
      x: 0,
      y: 0,
      scale: 1,
    },
  },
};

export function sanitizeInteger(value: unknown, min: number, max: number): number | undefined {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

export function normalizeCardSpec(input: unknown): CardSpec {
  const raw = isRecord(input) ? input : {};
  const costs = isRecord(raw.costs) ? raw.costs : {};
  const stats = isRecord(raw.stats) ? raw.stats : {};
  const artwork = isRecord(raw.artwork) ? raw.artwork : {};
  const crop = isRecord(artwork.crop) ? artwork.crop : {};

  const kind = typeof raw.kind === "string" && VALID_KINDS.has(raw.kind as CardKind)
    ? (raw.kind as CardKind)
    : DEFAULT_CARD.kind;

  return {
    version: 1,
    kind,
    nation: choosePreset(raw.nation, VALID_NATIONS, DEFAULT_CARD.nation),
    rarity: choosePreset(raw.rarity, VALID_RARITIES, DEFAULT_CARD.rarity),
    set: choosePreset(raw.set, VALID_SETS, DEFAULT_CARD.set),
    title: limitText(raw.title, DEFAULT_CARD.title, TITLE_MAX_LENGTH),
    body: limitText(raw.body, DEFAULT_CARD.body, BODY_MAX_LENGTH),
    keywordLine: limitText(raw.keywordLine, "", KEYWORD_MAX_LENGTH),
    costs: {
      deployment: sanitizeInteger(costs.deployment, 0, 12),
      operation: sanitizeInteger(costs.operation, 0, 12),
    },
    stats: {
      attack: sanitizeInteger(stats.attack, 0, 20),
      defense: sanitizeInteger(stats.defense, 0, 30),
      hqDefense: sanitizeInteger(stats.hqDefense, 1, 40),
    },
    artwork: normalizeArtwork(artwork, crop),
  };
}

function normalizeArtwork(artwork: Record<string, unknown>, crop: Record<string, unknown>): CardSpec["artwork"] {
  const dataUrl = artwork.source === "upload" && typeof artwork.dataUrl === "string" && isAllowedImageDataUrl(artwork.dataUrl)
    ? artwork.dataUrl
    : undefined;

  return {
    source: artwork.source === "upload" && dataUrl ? "upload" : "none",
    crop: {
      x: clampNumber(crop.x, -300, 300, 0),
      y: clampNumber(crop.y, -300, 300, 0),
      scale: clampNumber(crop.scale, 0.6, 3, 1),
    },
    dataUrl,
  };
}

function choosePreset(value: unknown, validSet: Set<string>, fallback: string): string {
  return typeof value === "string" && validSet.has(value) ? value : fallback;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function limitText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
