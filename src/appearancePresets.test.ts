import { describe, expect, it } from "vitest";
import { DEFAULT_CARD, normalizeCardSpec } from "./cardModel";
import {
  APPEARANCE_PRESETS,
  applyAppearancePreset,
  getAppearancePresetLabel,
} from "./appearancePresets";

describe("appearance preset library", () => {
  it("provides a small library with stable ids and bilingual names", () => {
    expect(APPEARANCE_PRESETS).toHaveLength(5);
    expect(new Set(APPEARANCE_PRESETS.map((preset) => preset.id)).size).toBe(APPEARANCE_PRESETS.length);
    for (const preset of APPEARANCE_PRESETS) {
      expect(preset.labels.en.length).toBeGreaterThan(0);
      expect(preset.labels.zh.length).toBeGreaterThan(0);
      expect(getAppearancePresetLabel(preset, "en")).toBe(preset.labels.en);
      expect(getAppearancePresetLabel(preset, "zh")).toBe(preset.labels.zh);
    }
  });

  it("keeps every preset inside the existing normalized appearance contract", () => {
    for (const preset of APPEARANCE_PRESETS) {
      const normalized = normalizeCardSpec({
        ...DEFAULT_CARD,
        appearance: preset.appearance,
      });
      expect(normalized.appearance).toEqual(preset.appearance);
    }
  });

  it("applies only appearance and does not serialize preset identity", () => {
    const card = normalizeCardSpec({
      ...DEFAULT_CARD,
      title: "Preserve me",
      body: "Preserve this body too",
      nation: "britain",
    });
    const preset = APPEARANCE_PRESETS[3];
    const applied = applyAppearancePreset(card, preset);

    expect(applied.appearance).toEqual(preset.appearance);
    expect({ ...applied, appearance: card.appearance }).toEqual(card);
    expect(applied).not.toHaveProperty("presetId");
  });

  it("survives project JSON round-trip without hidden runtime state", () => {
    for (const preset of APPEARANCE_PRESETS) {
      const applied = applyAppearancePreset(DEFAULT_CARD, preset);
      expect(normalizeCardSpec(JSON.parse(JSON.stringify(applied)))).toEqual(applied);
    }
  });
});
