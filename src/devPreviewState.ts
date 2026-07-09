import { normalizeCardSpec } from "./cardModel";
import type { CardSpec, CardUpdate } from "./types";

export type DevPreviewReferenceSample = {
  id: string;
  referenceUrl: string;
};

export type DevPreviewReferenceSelection = {
  selectedReferenceSampleId: string;
  referenceImageUrl: string;
};

export function applyCardUpdate(currentCard: CardSpec, update: CardUpdate): CardSpec {
  const normalizedCurrent = normalizeCardSpec(currentCard);
  return normalizeCardSpec(typeof update === "function" ? update(normalizedCurrent) : update);
}

export function resolveDevPreviewReferenceSelection(
  sample: DevPreviewReferenceSample,
): DevPreviewReferenceSelection {
  return {
    selectedReferenceSampleId: sample.id,
    referenceImageUrl: sample.referenceUrl,
  };
}
