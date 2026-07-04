import { normalizeCardSpec } from "./cardModel";
import type { CardSpec, CardUpdate } from "./types";

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

export function shouldApplyDevPreviewSampleResult(state: DevPreviewSampleRequestState): boolean {
  return (
    state.isMounted &&
    state.requestId === state.activeRequestId &&
    state.cardEditVersionAtStart === state.currentCardEditVersion
  );
}
