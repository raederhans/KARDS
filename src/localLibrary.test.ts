import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import {
  createCardLibraryEntry,
  normalizeCardLibrary,
  readLocalLibrary,
  saveCardToLocalLibrary,
  saveLibraryDirectoryHandle,
  type LocalDirectoryHandle,
} from "./localLibrary";
import type { CardSpec } from "./types";

describe("local card library records", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores card fields without embedding uploaded artwork data", () => {
    const card: CardSpec = {
      ...DEFAULT_CARD,
      title: "Library Tank",
      appearance: {
        ...DEFAULT_CARD.appearance,
        texture: {
          seed: 789,
          intensity: 2,
          randomness: 1.6,
          mottle: 1.4,
        },
        text: {
          ...DEFAULT_CARD.appearance.text,
          title: {
            ...DEFAULT_CARD.appearance.text.title,
            fontScale: 1.15,
            scaleX: 0.9,
            offsetX: 12,
          },
        },
      },
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
    expect(entry.card.appearance.texture).toEqual(card.appearance.texture);
    expect(entry.card.appearance.text.title).toEqual(card.appearance.text.title);
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
          card: {
            ...DEFAULT_CARD,
            title: "Saved Card",
            costs: { deployment: 99 },
            artwork: {
              source: "upload",
              dataUrl: "data:image/png;base64,legacy-library-image",
              crop: { x: 2, y: 3, scale: 1.2 },
            },
          },
        },
        null,
      ],
    });

    expect(library.cards).toHaveLength(1);
    expect(library.cards[0].id).toBe("saved-card");
    expect(library.cards[0].card.costs.deployment).toBe(99);
    expect(library.cards[0].card.artwork.source).toBe("none");
    expect(library.cards[0].card.artwork.dataUrl).toBeUndefined();
    expect(library.cards[0].card.artwork.crop).toEqual({ x: 2, y: 3, scale: 1.2 });
  });

  it("keeps only the most recent 200 cards when normalizing large local libraries", () => {
    const cards = Array.from({ length: 205 }, (_, index) => ({
      id: `card-${index}`,
      title: `Card ${index}`,
      updatedAt: "2026-07-04T00:00:00.000Z",
      card: {
        ...DEFAULT_CARD,
        title: `Card ${index}`,
      },
    }));

    const library = normalizeCardLibrary({ version: 1, cards });

    expect(library.cards).toHaveLength(200);
    expect(library.cards[0].id).toBe("card-5");
    expect(library.cards[199].id).toBe("card-204");
  });

  it("rejects oversized local library files before parsing JSON", async () => {
    const directory = {
      name: "Cards",
      getFileHandle: vi.fn(async () => ({
        getFile: async () => ({
          size: 2 * 1024 * 1024 + 1,
          text: vi.fn(async () => "{}"),
        }),
        createWritable: async () => ({
          write: vi.fn(async () => undefined),
          close: vi.fn(async () => undefined),
        }),
      })),
    } as unknown as LocalDirectoryHandle;

    await expect(readLocalLibrary(directory)).rejects.toThrow("Local library file is too large");
  });

  it("serializes overlapping saves to the same directory without losing either card", async () => {
    let libraryJson = JSON.stringify({
      version: 1,
      updatedAt: "2026-07-09T00:00:00.000Z",
      cards: [],
    });
    const fileHandle = {
      getFile: vi.fn(async () => {
        const snapshot = libraryJson;
        return new File([snapshot], "card-forge-library.json", { type: "application/json" });
      }),
      createWritable: vi.fn(async () => ({
        write: vi.fn(async (data: Blob | string) => {
          libraryJson = typeof data === "string" ? data : await data.text();
        }),
        close: vi.fn(async () => undefined),
      })),
    };
    const directory = {
      name: "Cards",
      getFileHandle: vi.fn(async () => fileHandle),
    } as unknown as LocalDirectoryHandle;

    let lockTail = Promise.resolve();
    const requestLock = vi.fn(<T>(_name: string, operation: () => Promise<T>): Promise<T> => {
      const result = lockTail.then(operation);
      lockTail = result.then(() => undefined, () => undefined);
      return result;
    });
    vi.stubGlobal("navigator", { locks: { request: requestLock } });

    await Promise.all([
      saveCardToLocalLibrary(directory, { ...DEFAULT_CARD, title: "First Save" }),
      saveCardToLocalLibrary(directory, { ...DEFAULT_CARD, title: "Second Save" }),
    ]);

    const savedLibrary = normalizeCardLibrary(JSON.parse(libraryJson));
    expect(savedLibrary.cards.map((entry) => entry.title)).toEqual(["First Save", "Second Save"]);
    expect(requestLock).toHaveBeenCalledTimes(2);
  });

  it("fails explicitly when the browser cannot provide cross-tab write locking", async () => {
    vi.stubGlobal("navigator", {});
    const directory = { name: "Cards" } as LocalDirectoryHandle;

    await expect(saveCardToLocalLibrary(directory, DEFAULT_CARD)).rejects.toThrow(/Web Locks/i);
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
