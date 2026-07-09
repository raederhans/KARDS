import { afterEach, describe, expect, it, vi } from "vitest";
import { CARD_TEXTURE_BOUNDS } from "../cardModel";
import {
  TEXTURE_CONTROL_LIMITS,
  canStartCardExport,
  downloadBlob,
  isImportableReferenceImageFile,
  safeFileName,
} from "./ProjectPanel";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ProjectPanel file names", () => {
  it("keeps readable Unicode titles instead of falling back to a generic file name", () => {
    expect(safeFileName("自定义坦克")).toBe("自定义坦克");
    expect(safeFileName("CUSTOM TANK")).toBe("custom-tank");
    expect(safeFileName("  T-70 / Elite  ")).toBe("t-70-elite");
  });

  it("uses the generic file name only when a title has no usable letters or numbers", () => {
    expect(safeFileName("!!!")).toBe("custom-card");
  });

  it("keeps the object URL alive until after the browser download click is queued", () => {
    vi.useFakeTimers();
    const revokeObjectUrl = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const append = vi.fn();
    let href = "";
    let download = "";

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:card-export"),
      revokeObjectURL: revokeObjectUrl,
    });
    vi.stubGlobal("document", {
      body: { append },
      createElement: vi.fn(() => ({
        click,
        remove,
        set href(value: string) {
          href = value;
        },
        set download(value: string) {
          download = value;
        },
      })),
    });
    vi.stubGlobal("window", {
      setTimeout: (callback: () => void, delay?: number) => setTimeout(callback, delay),
    });

    downloadBlob(new Blob(["card"]), "card.png");

    expect(href).toBe("blob:card-export");
    expect(download).toBe("card.png");
    expect(append).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();

    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:card-export");
  });
});

describe("ProjectPanel texture controls", () => {
  it("uses the same texture range as imported card normalization", () => {
    expect(TEXTURE_CONTROL_LIMITS).toEqual(CARD_TEXTURE_BOUNDS);
  });
});

describe("ProjectPanel private export gate", () => {
  it("does not ask for confirmation for ordinary local asset packs", () => {
    const confirmPrivateExport = vi.fn(() => false);

    expect(canStartCardExport({ requiresPrivateExportConfirm: false }, confirmPrivateExport)).toBe(true);
    expect(canStartCardExport(null, confirmPrivateExport)).toBe(true);
    expect(confirmPrivateExport).not.toHaveBeenCalled();
  });

  it("blocks private preview exports when confirmation is cancelled", () => {
    const confirmPrivateExport = vi.fn(() => false);

    expect(canStartCardExport({ requiresPrivateExportConfirm: true }, confirmPrivateExport)).toBe(false);
    expect(confirmPrivateExport).toHaveBeenCalledTimes(1);
  });

  it("allows private preview exports after confirmation", () => {
    const confirmPrivateExport = vi.fn(() => true);

    expect(canStartCardExport({ requiresPrivateExportConfirm: true }, confirmPrivateExport)).toBe(true);
    expect(confirmPrivateExport).toHaveBeenCalledTimes(1);
  });
});

describe("ProjectPanel reference comparison import", () => {
  it("uses the same bounded image conditions as artwork import", async () => {
    await expect(isImportableReferenceImageFile(createImageFile("reference.png", pngHeader(), "image/png"))).resolves.toBe(true);
    await expect(isImportableReferenceImageFile(createImageFile("reference.webp", webpHeader(), "image/webp"))).resolves.toBe(true);
    await expect(isImportableReferenceImageFile(createImageFile("reference.jpg", jpegHeader(), ""))).resolves.toBe(true);
    await expect(
      isImportableReferenceImageFile(createImageFile("reference.gif", new Uint8Array([0x47, 0x49]), "image/gif")),
    ).resolves.toBe(false);
    await expect(
      isImportableReferenceImageFile(createImageFile("reference.png", new Uint8Array(5 * 1024 * 1024 + 1), "image/png")),
    ).resolves.toBe(false);
    await expect(
      isImportableReferenceImageFile(createImageFile("fake.png", new Uint8Array([1, 2, 3]), "image/png")),
    ).resolves.toBe(false);
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

function jpegHeader(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff]);
}
