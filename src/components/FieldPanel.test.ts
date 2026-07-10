import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "../cardModel";
import { UI_TEXT } from "../i18n";
import { readBrowserFile } from "../browserFiles";
import {
  FieldPanel,
  hasDraggedFiles,
  isImportableArtworkFile,
  normalizeArtworkCropInput,
  toggleFieldPanelSection,
} from "./FieldPanel";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("FieldPanel collapsible sections", () => {
  it("toggles one section without changing the other collapsed sections", () => {
    const collapsed = toggleFieldPanelSection({ title: true }, "artwork");

    expect(collapsed).toEqual({
      title: true,
      artwork: true,
    });
    expect(toggleFieldPanelSection(collapsed, "artwork")).toEqual({
      title: true,
      artwork: false,
    });
  });
});

describe("FieldPanel value fields", () => {
  it("shows only HQ defense for headquarters cards", () => {
    const markup = renderToStaticMarkup(
      createElement(FieldPanel, {
        card: {
          ...DEFAULT_CARD,
          kind: "hq",
          costs: {},
          stats: { hqDefense: 20 },
        },
        language: "zh",
        text: UI_TEXT.zh.fieldPanel,
        onCardChange: vi.fn(),
        onCardKindChange: vi.fn(),
      }),
    );

    expect(markup).toContain('name="card-hq-defense"');
    expect(markup).not.toContain('name="card-deployment-cost"');
    expect(markup).not.toContain('name="card-operation-cost"');
    expect(markup).not.toContain('name="card-attack"');
    expect(markup).not.toContain('name="card-defense"');
    expect(markup).not.toContain('id="field-section-keywords"');
    expect(markup).not.toContain('name="card-keyword-add"');
    expect(markup.match(/<select[^>]*name="card-rarity"[^>]*>/)?.[0]).toContain('disabled=""');
    expect(markup.match(/<select[^>]*name="card-set"[^>]*>/)?.[0]).toContain('disabled=""');
  });

  it("keeps ordinary unit values without showing HQ defense", () => {
    const markup = renderToStaticMarkup(
      createElement(FieldPanel, {
        card: DEFAULT_CARD,
        language: "zh",
        text: UI_TEXT.zh.fieldPanel,
        onCardChange: vi.fn(),
        onCardKindChange: vi.fn(),
      }),
    );

    expect(markup).toContain('name="card-deployment-cost"');
    expect(markup).toContain('name="card-operation-cost"');
    expect(markup).toContain('name="card-attack"');
    expect(markup).toContain('name="card-defense"');
    expect(markup).not.toContain('name="card-hq-defense"');
    expect(markup).toContain('id="field-section-keywords"');
    expect(markup).toContain('name="card-keyword-add"');
    expect(markup.match(/<select[^>]*name="card-rarity"[^>]*>/)?.[0]).not.toContain('disabled=""');
    expect(markup.match(/<select[^>]*name="card-set"[^>]*>/)?.[0]).not.toContain('disabled=""');
  });
});

describe("FieldPanel artwork drop import", () => {
  it("uses the same file conditions as artwork upload", async () => {
    await expect(isImportableArtworkFile(createImageFile("art.png", pngHeader(), "image/png"))).resolves.toBe(true);
    await expect(isImportableArtworkFile(createImageFile("art.webp", webpHeader(), "image/webp"))).resolves.toBe(true);
    await expect(isImportableArtworkFile(createImageFile("art.png", pngHeader(), ""))).resolves.toBe(true);
    await expect(isImportableArtworkFile(createImageFile("art.gif", new Uint8Array([0x47, 0x49]), "image/gif"))).resolves.toBe(false);
    await expect(
      isImportableArtworkFile(createImageFile("art.png", new Uint8Array(5 * 1024 * 1024 + 1), "image/png")),
    ).resolves.toBe(false);
    await expect(isImportableArtworkFile(createImageFile("fake.png", new Uint8Array([1, 2, 3]), "image/png"))).resolves.toBe(false);
    await expect(isImportableArtworkFile({
      name: "unreadable.png",
      type: "image/png",
      size: 8,
      slice: () => ({ arrayBuffer: async () => { throw new Error("read failed"); } }) as unknown as Blob,
    })).resolves.toBe(false);
  });

  it("recognizes file drags without treating text drags as artwork drops", () => {
    const fileItem = { kind: "file" };
    const textItem = { kind: "string" };

    expect(hasDraggedFiles({ items: [fileItem], files: [] } as unknown as DataTransfer)).toBe(true);
    expect(hasDraggedFiles({ items: [textItem], files: [] } as unknown as DataTransfer)).toBe(false);
    expect(hasDraggedFiles({ items: [], files: [{}] } as unknown as DataTransfer)).toBe(true);
  });

  it("reports FileReader error and abort outcomes for artwork data URLs", async () => {
    const file = createImageFile("art.png", pngHeader(), "image/png");

    stubFileReaderFailure("error");
    await expect(readBrowserFile(file, "data-url")).rejects.toThrow();

    stubFileReaderFailure("abort");
    await expect(readBrowserFile(file, "data-url")).rejects.toThrow();
  });
});

describe("FieldPanel artwork crop values", () => {
  it("preserves small intentional artwork offsets while still clamping the supported range", () => {
    expect(normalizeArtworkCropInput("x", "1")).toBe(1);
    expect(normalizeArtworkCropInput("x", "-4")).toBe(-4);
    expect(normalizeArtworkCropInput("y", "3")).toBe(3);
    expect(normalizeArtworkCropInput("x", "301")).toBe(300);
    expect(normalizeArtworkCropInput("y", "-301")).toBe(-300);
    expect(normalizeArtworkCropInput("scale", "0.5")).toBe(0.6);
    expect(normalizeArtworkCropInput("scale", "4")).toBe(3);
  });
});

function createImageFile(name: string, content: Uint8Array, type: string): File {
  return new File([toBlobPart(content)], name, { type });
}

function toBlobPart(content: Uint8Array): BlobPart {
  const buffer = new ArrayBuffer(content.byteLength);
  new Uint8Array(buffer).set(content);
  return buffer;
}

function pngHeader(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function webpHeader(): Uint8Array {
  return new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
}

function stubFileReaderFailure(outcome: "error" | "abort"): void {
  vi.stubGlobal("FileReader", class {
    result: string | ArrayBuffer | null = null;
    private readonly listeners = new Map<string, () => void>();

    addEventListener(type: string, listener: () => void): void {
      this.listeners.set(type, listener);
    }

    readAsDataURL(): void {
      queueMicrotask(() => this.listeners.get(outcome)?.());
    }
  });
}
