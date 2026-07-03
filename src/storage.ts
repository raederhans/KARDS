import { normalizeCardSpec } from "./cardModel";
import type { CardSpec } from "./types";

export const STORAGE_KEY = "card-forge:card:v1";

type DraftStorage = Pick<Storage, "getItem" | "setItem">;

export function toAutosaveCard(card: CardSpec): CardSpec {
  const normalizedCard = normalizeCardSpec(card);

  if (normalizedCard.artwork.source !== "upload") {
    return normalizedCard;
  }

  return {
    ...normalizedCard,
    artwork: {
      source: "none",
      crop: normalizedCard.artwork.crop,
    },
  };
}

export function loadDraftCard(storage: DraftStorage, fallbackCard: CardSpec): CardSpec {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) {
      return fallbackCard;
    }
    return normalizeCardSpec(JSON.parse(saved));
  } catch {
    return fallbackCard;
  }
}

export function saveDraftCard(storage: DraftStorage, card: CardSpec): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(toAutosaveCard(card)));
    return true;
  } catch {
    return false;
  }
}
