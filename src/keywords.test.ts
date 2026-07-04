import { describe, expect, it } from "vitest";
import {
  MAX_CARD_KEYWORDS,
  formatKeywordLineFromIds,
  normalizeCardKeywords,
  parseKeywordLine,
  resolveCardKeywordIds,
} from "./keywords";

describe("card keywords", () => {
  it("parses legacy keyword lines into known player-facing keyword ids", () => {
    expect(parseKeywordLine("GUARD, BLITZ, HEAVYARMOR2")).toEqual(["guard", "blitz", "heavyArmor2"]);
    expect(parseKeywordLine("Armor 1")).toEqual(["heavyArmor1"]);
  });

  it("deduplicates selected keywords and enforces the card keyword limit", () => {
    expect(normalizeCardKeywords(["guard", "guard", "blitz", "shock", "fury", "ambush"])).toEqual([
      "guard",
      "blitz",
      "shock",
      "fury",
    ]);
    expect(normalizeCardKeywords(["unknown"])).toEqual([]);
    expect(MAX_CARD_KEYWORDS).toBe(4);
  });

  it("prefers structured keyword ids over the legacy text line", () => {
    expect(resolveCardKeywordIds({ keywords: ["shock"], keywordLine: "GUARD" })).toEqual(["shock"]);
    expect(resolveCardKeywordIds({ keywords: [], keywordLine: "GUARD" })).toEqual([]);
    expect(resolveCardKeywordIds({ keywordLine: "GUARD, BLITZ" })).toEqual(["guard", "blitz"]);
  });

  it("formats selected ids back to the compatibility keyword line", () => {
    expect(formatKeywordLineFromIds(["guard", "heavyArmor3"])).toBe("GUARD, HEAVY ARMOR 3");
  });
});
