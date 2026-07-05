import { describe, expect, it } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import { createCardLibraryEntry, normalizeCardLibrary } from "./localLibrary";
import type { CardSpec } from "./types";

describe("local card library records", () => {
  it("stores card fields without embedding uploaded artwork data", () => {
    const card: CardSpec = {
      ...DEFAULT_CARD,
      title: "Library Tank",
      artwork: {
        source: "upload",
        dataUrl: "data:image/png;base64,large-image",
        crop: { x: 4, y: 5, scale: 1.1 },
      },
    };

    const entry = createCardLibraryEntry(card);

    expect(entry.title).toBe("Library Tank");
    expect(entry.card.artwork.source).toBe("none");
    expect(entry.card.artwork.dataUrl).toBeUndefined();
    expect(entry.card.artwork.crop).toEqual({ x: 4, y: 5, scale: 1.1 });
  });

  it("normalizes old or damaged library files instead of trusting raw JSON", () => {
    const library = normalizeCardLibrary({
      version: 1,
      updatedAt: "2026-07-04T00:00:00.000Z",
      cards: [
        {
          id: "saved-card",
          title: "Saved Card",
          updatedAt: "2026-07-04T00:00:00.000Z",
          card: { ...DEFAULT_CARD, title: "Saved Card", costs: { deployment: 99 } },
        },
        null,
      ],
    });

    expect(library.cards).toHaveLength(1);
    expect(library.cards[0].id).toBe("saved-card");
    expect(library.cards[0].card.costs.deployment).toBe(12);
  });
});
