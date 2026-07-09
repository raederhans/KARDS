import { describe, expect, it } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import {
  DEV_PREVIEW_ASSET_PACK_URL,
  DEV_PREVIEW_HQ_SAMPLE,
  DEV_PREVIEW_HQ_SAMPLES,
  DEV_PREVIEW_REFERENCE_SAMPLES,
  DEV_PREVIEW_SET_SAMPLES,
  getDefaultDevPreviewSample,
  getDevPreviewHqSampleById,
  getDevPreviewReferenceForCard,
  getDevPreviewSampleById,
  getDevPreviewSampleByKind,
  getDevPreviewSampleForCard,
  getDevPreviewSampleBySet,
} from "./devPreviewCatalog";
import {
  applyCardUpdate,
  resolveDevPreviewReferenceSelection,
} from "./devPreviewState";
import { SETS } from "./presets";

describe("dev preview sample catalog", () => {
  it("loads the renderer-ready Stage6 multisource asset pack", () => {
    expect(DEV_PREVIEW_ASSET_PACK_URL).toBe(
      "/.runtime/kards-private-assets/stage6-multisource-clean-extraction/kards-asset-pack.json",
    );
  });

  it("covers every implemented official set with a reference sample", () => {
    const sampleSets = new Set(DEV_PREVIEW_SET_SAMPLES.map((sample) => sample.set));
    const implementedOfficialSets = SETS.filter((set) => set.id !== "custom");

    expect(DEV_PREVIEW_SET_SAMPLES).toHaveLength(implementedOfficialSets.length);
    expect(DEV_PREVIEW_REFERENCE_SAMPLES.length).toBeGreaterThan(DEV_PREVIEW_SET_SAMPLES.length);
    for (const set of implementedOfficialSets) {
      expect(sampleSets.has(set.id)).toBe(true);
    }
  });

  it("returns the expected default, set, and HQ samples", () => {
    expect(getDefaultDevPreviewSample().id).toBe("t70");
    expect(getDevPreviewSampleById("hold_the_line")?.labelZh).toBe("坚守阵线");
    expect(getDevPreviewSampleBySet("allegiance")?.id).toBe("a26_invader");
    expect(getDevPreviewSampleBySet("blood-and-iron")?.id).toBe("macchi_c_200");
    expect(getDevPreviewSampleBySet("oceania-storm")?.id).toBe("dingo");

    expect(getDevPreviewSampleByKind("hq")).toBe(DEV_PREVIEW_HQ_SAMPLE);
    expect(getDevPreviewSampleByKind("tank")).toBeUndefined();
    expect(getDevPreviewSampleForCard({ kind: "hq", set: "base" })?.label).toBe("WASHINGTON");
    expect(DEV_PREVIEW_HQ_SAMPLES.map((sample) => sample.label)).toEqual([
      "WASHINGTON",
      "LONDON",
      "MOSCOW",
      "TRUK",
      "DANZIG",
    ]);
    expect(getDevPreviewHqSampleById("london_hq")?.referenceUrl).toContain("London.png");
    expect(DEV_PREVIEW_HQ_SAMPLE.referenceUrl).toContain("Washington.png");
    expect("card" in DEV_PREVIEW_HQ_SAMPLE ? DEV_PREVIEW_HQ_SAMPLE.card.title : "").toBe("WASHINGTON");
  });

  it("resolves the reference image from the current card type and set", () => {
    expect(getDevPreviewReferenceForCard({ kind: "tank", set: "blood-and-iron" })).toContain("macchi_c_200.png");
    expect(getDevPreviewReferenceForCard({ kind: "tank", set: "oceania-storm" })).toContain("dingo.png");
    expect(getDevPreviewReferenceForCard({ kind: "hq", set: "blood-and-iron" })).toContain("Washington.png");
    expect(getDevPreviewReferenceForCard({ kind: "tank", set: "custom" })).toBeUndefined();
  });

  it("keeps visible sample labels aligned with the card-face titles", () => {
    expect(DEV_PREVIEW_HQ_SAMPLE.label).toBe("WASHINGTON");
    expect(DEV_PREVIEW_SET_SAMPLES.map((sample) => [sample.id, sample.label])).toEqual([
      ["t70", "T-70"],
      ["a26_invader", "A-26 INVADER"],
      ["macchi_c_200", "MACCHI C.200"],
      ["royal_scots", "ROYAL SCOTS"],
      ["plan_d", "PLAN D"],
      ["katalina", "KATALINA"],
      ["m2a4", "M2A4"],
      ["kikka", "KIKKA"],
      ["gordon_highlanders", "GORDON HIGHLANDERS"],
      ["dingo", "DINGO"],
      ["routed_troops", "ROUTED TROOPS"],
      ["the_regulars_vet", "THE REGULARS"],
      ["wespe", "WESPE"],
      ["jet_prototype", "JET PROTOTYPE"],
      ["hold_the_line", "HOLD THE LINE"],
    ]);
  });

  it("keeps set edits local until the selected set sample is explicitly loaded", () => {
    const draftCard = {
      ...DEFAULT_CARD,
      title: "Custom draft",
      body: "Do not replace me",
      set: "base",
    };

    const setOnlyEdit = applyCardUpdate(draftCard, (currentCard) => ({
      ...currentCard,
      set: "oceania-storm",
    }));
    const selectedSample = getDevPreviewSampleBySet(setOnlyEdit.set);

    expect(setOnlyEdit.title).toBe("Custom draft");
    expect(setOnlyEdit.body).toBe("Do not replace me");
    expect(setOnlyEdit.set).toBe("oceania-storm");
    expect(selectedSample?.id).toBe("dingo");
    expect(selectedSample?.label).toBe("DINGO");
  });

  it("keeps right-panel reference selection separate from the editable card", () => {
    const draftCard = {
      ...DEFAULT_CARD,
      title: "Custom draft",
      body: "Do not replace me",
      artwork: {
        source: "upload" as const,
        dataUrl: "data:image/png;base64,user-art",
        crop: { x: 12, y: -8, scale: 1.4 },
      },
    };
    const selectedSample = DEV_PREVIEW_REFERENCE_SAMPLES.find((sample) => sample.id === "dingo");

    expect(selectedSample).toBeDefined();
    expect(resolveDevPreviewReferenceSelection(selectedSample!)).toEqual({
      selectedReferenceSampleId: "dingo",
      referenceImageUrl: selectedSample!.referenceUrl,
    });
    expect(draftCard.title).toBe("Custom draft");
    expect(draftCard.body).toBe("Do not replace me");
    expect(draftCard.artwork.dataUrl).toBe("data:image/png;base64,user-art");
  });
});
