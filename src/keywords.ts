import type { CardSpec, KeywordPreset } from "./types";

export const MAX_CARD_KEYWORDS = 4;

export const KEYWORD_PRESETS: KeywordPreset[] = [
  { id: "guard", label: "Guard" },
  { id: "blitz", label: "Blitz" },
  { id: "shock", label: "Shock" },
  { id: "smokescreen", label: "Smokescreen" },
  { id: "fury", label: "Fury" },
  { id: "ambush", label: "Ambush" },
  { id: "heavyArmor1", label: "Heavy Armor 1" },
  { id: "heavyArmor2", label: "Heavy Armor 2" },
  { id: "heavyArmor3", label: "Heavy Armor 3" },
  { id: "bond", label: "Bond" },
  { id: "alpine", label: "Alpine" },
  { id: "pincer", label: "Pincer" },
  { id: "covert", label: "Covert" },
  { id: "intel1", label: "Intel 1" },
  { id: "intel2", label: "Intel 2" },
  { id: "intel3", label: "Intel 3" },
  { id: "salvage", label: "Salvage" },
  { id: "mobilize", label: "Mobilize" },
];

const KEYWORD_BY_ID = new Map(KEYWORD_PRESETS.map((keyword) => [keyword.id, keyword]));
const KEYWORD_ALIASES = new Map(
  KEYWORD_PRESETS.flatMap((keyword) => [
    [normalizeKeywordToken(keyword.id), keyword.id],
    [normalizeKeywordToken(keyword.label), keyword.id],
  ]),
);

KEYWORD_ALIASES.set("armor1", "heavyArmor1");
KEYWORD_ALIASES.set("armor2", "heavyArmor2");
KEYWORD_ALIASES.set("armor3", "heavyArmor3");
KEYWORD_ALIASES.set("heavyarmor", "heavyArmor1");
KEYWORD_ALIASES.set("intel", "intel1");

export function getKeywordPreset(id: string): KeywordPreset | undefined {
  return KEYWORD_BY_ID.get(id);
}

export function normalizeCardKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return dedupeKeywordIds(value.map(resolveKeywordId).filter(Boolean) as string[]);
}

export function parseKeywordLine(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return dedupeKeywordIds(value.split(/[,;/|]+/).map(resolveKeywordId).filter(Boolean) as string[]);
}

export function resolveCardKeywordIds(card: Pick<CardSpec, "keywords" | "keywordLine">): string[] {
  if (Array.isArray(card.keywords)) {
    return normalizeCardKeywords(card.keywords);
  }

  return parseKeywordLine(card.keywordLine);
}

export function formatKeywordLineFromIds(keywordIds: string[]): string {
  return keywordIds
    .map((keywordId) => getKeywordPreset(keywordId)?.label.toUpperCase())
    .filter(Boolean)
    .join(", ");
}

function resolveKeywordId(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return KEYWORD_ALIASES.get(normalizeKeywordToken(stripInternalKeywordPayload(value)));
}

function stripInternalKeywordPayload(value: string): string {
  return value.includes(":") ? value.slice(0, value.indexOf(":")) : value;
}

function dedupeKeywordIds(keywordIds: string[]): string[] {
  return [...new Set(keywordIds)].slice(0, MAX_CARD_KEYWORDS);
}

function normalizeKeywordToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
