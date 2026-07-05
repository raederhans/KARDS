import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import { createCardLibraryEntry, normalizeCardLibrary, saveLibraryDirectoryHandle } from "./localLibrary";
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
    expect(library.cards[0].card.costs.deployment).toBe(99);
  });

  it("waits for IndexedDB transaction completion before resolving saved handles", async () => {
    const putRequest = { result: "library-directory" } as IDBRequest<IDBValidKey>;
    const store = { put: vi.fn(() => putRequest) };
    const transaction = {
      objectStore: vi.fn(() => store),
      oncomplete: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onabort: null as (() => void) | null,
      error: null,
    };
    const database = {
      transaction: vi.fn(() => transaction),
      close: vi.fn(),
    };
    const openRequest = {
      result: database,
      onsuccess: null as ((event: Event) => void) | null,
    } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", {
      open: vi.fn(() => openRequest),
    });

    let resolved = false;
    const savePromise = saveLibraryDirectoryHandle({
      name: "Cards",
      getFileHandle: vi.fn(),
    }).then(() => {
      resolved = true;
    });

    openRequest.onsuccess?.({} as Event);
    await Promise.resolve();
    putRequest.onsuccess?.({} as Event);
    await Promise.resolve();

    expect(resolved).toBe(false);

    transaction.oncomplete?.();
    await savePromise;

    expect(resolved).toBe(true);
    expect(store.put).toHaveBeenCalledWith(expect.objectContaining({ name: "Cards" }), "library-directory");
    expect(database.close).toHaveBeenCalledTimes(1);
  });
});
