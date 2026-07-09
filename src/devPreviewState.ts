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

export type DevPreviewSampleCardSource =
  | { card: CardSpec }
  | { cardUrl: string };

export type DevPreviewSampleRequestState = {
  isMounted: boolean;
  requestId: number;
  activeRequestId: number;
  cardEditVersionAtStart: number;
  currentCardEditVersion: number;
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

export async function resolveDevPreviewSampleCard(
  sample: DevPreviewSampleCardSource,
  readCardUrl: (cardUrl: string) => Promise<unknown>,
): Promise<CardSpec> {
  return normalizeCardSpec("card" in sample ? sample.card : await readCardUrl(sample.cardUrl));
}

export function shouldApplyDevPreviewSampleResult(state: DevPreviewSampleRequestState): boolean {
  return (
    state.isMounted &&
    state.requestId === state.activeRequestId &&
    state.cardEditVersionAtStart === state.currentCardEditVersion
  );
}
