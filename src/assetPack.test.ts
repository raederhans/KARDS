import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import { loadAssetPackFromFiles, loadAssetPackFromUrl } from "./assetPack";
import type { CardRenderAssetContext } from "./canvas/renderAssets";

const assetContext: CardRenderAssetContext = {
  card: DEFAULT_CARD,
  kind: DEFAULT_CARD.kind,
  nationId: DEFAULT_CARD.nation,
  rarityId: DEFAULT_CARD.rarity,
  setId: DEFAULT_CARD.set,
  template: "unit",
};

const NativeURL = globalThis.URL;
let objectUrlCounter = 0;
let createdUrls: string[] = [];
let revokedUrls: string[] = [];
let deletedFonts: unknown[] = [];

class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 1;
  height = 1;
  naturalWidth = 1;
  naturalHeight = 1;

  set src(value: string) {
    this.naturalWidth = value.includes("huge-pixels") ? 5000 : 1;
    this.naturalHeight = value.includes("huge-pixels") ? 5000 : 1;
    queueMicrotask(() => {
      if (value.includes("bad-image")) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

class FakeFontFace {
  family: string;

  constructor(family: string) {
    this.family = family;
  }

  async load() {
    return this;
  }
}

describe("local asset pack loader", () => {
  beforeEach(() => {
    objectUrlCounter = 0;
    createdUrls = [];
    revokedUrls = [];
    deletedFonts = [];
    vi.stubGlobal("Image", FakeImage);
    vi.stubGlobal("FontFace", FakeFontFace);
    vi.stubGlobal("document", {
      fonts: {
        add: vi.fn(),
        delete: vi.fn((font: unknown) => {
          deletedFonts.push(font);
          return true;
        }),
      },
    });
    vi.stubGlobal(
      "URL",
      class TestURL extends NativeURL {
        static createObjectURL(file: File) {
          const url = `blob:${file.name}:${objectUrlCounter}`;
          objectUrlCounter += 1;
          createdUrls.push(url);
          return url;
        }

        static revokeObjectURL(url: string) {
          revokedUrls.push(url);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads manifest images and fonts from a selected local folder", async () => {
    const pack = await loadAssetPackFromFiles([
      createFile(
        "kards-asset-pack.json",
        JSON.stringify({
          version: 1,
          name: "Test pack",
          images: [{ slot: "frame", file: "images/FRAME.PNG", template: "unit" }],
          fonts: [{ role: "title", family: "Kards Test", file: "fonts/HEADER.TTF" }],
        }),
        "pack/kards-asset-pack.json",
      ),
      createFile("FRAME.PNG", pngHeader(), "pack/images/FRAME.PNG"),
      createFile("HEADER.TTF", "font", "pack/fonts/HEADER.TTF"),
    ]);

    expect(pack.name).toBe("Test pack");
    expect(pack.imageCount).toBe(1);
    expect(pack.fontCount).toBe(1);
    expect(pack.requiresPrivateExportConfirm).toBe(false);
    expect(pack.warnings).toEqual([]);
    expect(pack.resolveImage("frame", assetContext)).toBeInstanceOf(FakeImage);

    pack.dispose();

    expect(revokedUrls).toEqual(createdUrls);
    expect(deletedFonts).toHaveLength(1);
  });

  it("reports missing assets as warnings instead of guessing replacements", async () => {
    const pack = await loadAssetPackFromFiles([
      createFile(
        "kards-asset-pack.json",
        JSON.stringify({
          version: 1,
          images: [{ slot: "frame", file: "images/missing.png" }],
        }),
        "pack/kards-asset-pack.json",
      ),
    ]);

    expect(pack.imageCount).toBe(0);
    expect(pack.resolveImage("frame", assetContext)).toBeUndefined();
    expect(pack.warnings).toEqual(["Missing image: images/missing.png"]);
  });

  it("skips unsupported or oversized local asset pack files", async () => {
    const pack = await loadAssetPackFromFiles([
      createFile(
        "kards-asset-pack.json",
        JSON.stringify({
          version: 1,
          images: [
            { slot: "frame", file: "images/frame.gif" },
            { slot: "cost-board", file: "images/huge.png" },
          ],
          fonts: [
            { role: "title", family: "Bad Font", file: "fonts/font.exe" },
            { role: "body", family: "Huge Font", file: "fonts/huge.ttf" },
          ],
        }),
        "pack/kards-asset-pack.json",
      ),
      createFile("frame.gif", "gif", "pack/images/frame.gif", "image/gif"),
      createFile("huge.png", new Uint8Array(5 * 1024 * 1024 + 1), "pack/images/huge.png", "image/png"),
      createFile("font.exe", "font", "pack/fonts/font.exe"),
      createFile("huge.ttf", new Uint8Array(8 * 1024 * 1024 + 1), "pack/fonts/huge.ttf"),
    ]);

    expect(pack.imageCount).toBe(0);
    expect(pack.fontCount).toBe(0);
    expect(pack.warnings).toEqual([
      "Unsupported image: images/frame.gif",
      "Image too large: images/huge.png",
      "Unsupported font: fonts/font.exe",
      "Font too large: fonts/huge.ttf",
    ]);
  });

  it("rejects local asset pack images with fake signatures or excessive decoded pixels", async () => {
    const fakeSignaturePack = await loadAssetPackFromFiles([
      createFile(
        "kards-asset-pack.json",
        JSON.stringify({
          version: 1,
          images: [{ slot: "frame", file: "images/fake.png" }],
        }),
        "pack/kards-asset-pack.json",
      ),
      createFile("fake.png", new Uint8Array([1, 2, 3]), "pack/images/fake.png", "image/png"),
    ]);

    expect(fakeSignaturePack.imageCount).toBe(0);
    expect(fakeSignaturePack.warnings).toEqual(["Unsupported image: images/fake.png"]);

    await expect(
      loadAssetPackFromFiles([
        createFile(
          "kards-asset-pack.json",
          JSON.stringify({
            version: 1,
            images: [{ slot: "frame", file: "images/huge-pixels.png" }],
          }),
          "pack/kards-asset-pack.json",
        ),
        createFile("huge-pixels.png", pngHeader(), "pack/images/huge-pixels.png", "image/png"),
      ]),
    ).rejects.toThrow("Image dimensions are too large");
  });

  it("loads manifest images from a dev-server URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            version: 1,
            name: "Dev pack",
            images: [{ slot: "type-icon", kind: "tank", file: "images/tank.png" }],
          }),
        );
      }),
    );
    vi.stubGlobal("window", { location: { href: "http://127.0.0.1:5174/" } });

    const pack = await loadAssetPackFromUrl(
      "http://127.0.0.1:5174/.runtime/kards-private-assets/stage6/kards-asset-pack.json",
    );

    expect(pack.name).toBe("Dev pack");
    expect(pack.imageCount).toBe(1);
    expect(pack.requiresPrivateExportConfirm).toBe(true);
    expect(pack.resolveImage("type-icon", assetContext)).toBeInstanceOf(FakeImage);
  });

  it("rejects manifest paths that escape the selected pack", async () => {
    await expect(
      loadAssetPackFromFiles([
        createFile(
          "kards-asset-pack.json",
          JSON.stringify({
            version: 1,
            images: [{ slot: "frame", file: "../private/frame.png" }],
          }),
          "pack/kards-asset-pack.json",
        ),
      ]),
    ).rejects.toThrow("Asset manifest paths must stay relative");

    await expect(
      loadAssetPackFromFiles([
        createFile(
          "kards-asset-pack.json",
          JSON.stringify({
            version: 1,
            images: [{ slot: "frame", file: "%2e%2e/private/frame.png" }],
          }),
          "pack/kards-asset-pack.json",
        ),
      ]),
    ).rejects.toThrow("Asset manifest paths must stay relative");
  });

  it("rejects absolute URLs in dev-server manifests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            version: 1,
            images: [{ slot: "type-icon", kind: "tank", file: "https://example.test/tank.png" }],
          }),
        );
      }),
    );
    vi.stubGlobal("window", { location: { href: "http://127.0.0.1:5174/" } });

    await expect(
      loadAssetPackFromUrl(
        "http://127.0.0.1:5174/.runtime/kards-private-assets/stage6/kards-asset-pack.json",
      ),
    ).rejects.toThrow("Asset manifest paths must stay relative");
  });

  it("rejects encoded traversal in dev-server manifests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            version: 1,
            images: [{ slot: "type-icon", kind: "tank", file: "%2e%2e/private/tank.png" }],
          }),
        );
      }),
    );
    vi.stubGlobal("window", { location: { href: "http://127.0.0.1:5174/" } });

    await expect(
      loadAssetPackFromUrl(
        "http://127.0.0.1:5174/.runtime/kards-private-assets/stage6/kards-asset-pack.json",
      ),
    ).rejects.toThrow("Asset manifest paths must stay relative");
  });

  it("skips dev-server images that decode to excessive pixels", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            version: 1,
            images: [{ slot: "frame", file: "images/huge-pixels.png" }],
          }),
        );
      }),
    );
    vi.stubGlobal("window", { location: { href: "http://127.0.0.1:5174/" } });

    const pack = await loadAssetPackFromUrl(
      "http://127.0.0.1:5174/.runtime/kards-private-assets/stage6/kards-asset-pack.json",
    );

    expect(pack.imageCount).toBe(0);
    expect(pack.warnings).toEqual(["Could not load image: images/huge-pixels.png"]);
  });

  it("releases already loaded URLs when a later image fails", async () => {
    await expect(
      loadAssetPackFromFiles([
        createFile(
          "kards-asset-pack.json",
          JSON.stringify({
            version: 1,
            images: [
              { slot: "frame", file: "images/good.png" },
              { slot: "cost-board", file: "images/bad-image.png" },
            ],
          }),
          "pack/kards-asset-pack.json",
        ),
        createFile("good.png", pngHeader(), "pack/images/good.png"),
        createFile("bad-image.png", pngHeader(), "pack/images/bad-image.png"),
      ]),
    ).rejects.toThrow("Could not read bad-image.png as an image");

    expect(new Set(revokedUrls)).toEqual(new Set(createdUrls));
  });
});

function createFile(
  name: string,
  content: string | Uint8Array,
  webkitRelativePath: string,
  type = "",
): File {
  const file = new File([toBlobPart(content)], name, { type });
  Object.defineProperty(file, "webkitRelativePath", {
    value: webkitRelativePath,
  });
  return file;
}

function toBlobPart(content: string | Uint8Array): BlobPart {
  if (typeof content === "string") {
    return content;
  }

  const buffer = new ArrayBuffer(content.byteLength);
  new Uint8Array(buffer).set(content);
  return buffer;
}

function pngHeader(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}
