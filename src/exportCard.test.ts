import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "./cardModel";
import {
  createCardExportBlob,
  getExportDimensions,
  getExportExtension,
  getExportMimeType,
  normalizeExportOptions,
} from "./exportCard";

const renderCardMock = vi.hoisted(() =>
  vi.fn(
    (
      _canvas: HTMLCanvasElement,
      _card: unknown,
      _artworkImage: unknown,
      _options?: { pixelScale?: number },
    ) => {},
  ),
);

vi.mock("./canvas/cardRenderer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./canvas/cardRenderer")>();
  renderCardMock.mockImplementation((canvas, _card, _artworkImage, options) => {
    const pixelScale = options?.pixelScale ?? 1;
    canvas.width = actual.CARD_WIDTH * pixelScale;
    canvas.height = actual.CARD_HEIGHT * pixelScale;
  });
  return {
    ...actual,
    renderCard: renderCardMock,
  };
});

beforeEach(() => {
  renderCardMock.mockClear();
  vi.unstubAllGlobals();
});

describe("card export options", () => {
  it("resolves the supported card export dimensions", () => {
    expect(getExportDimensions(1)).toEqual({ width: 500, height: 702 });
    expect(getExportDimensions(2)).toEqual({ width: 1000, height: 1404 });
    expect(getExportDimensions(3)).toEqual({ width: 1500, height: 2106 });
    expect(getExportDimensions(9)).toEqual({ width: 500, height: 702 });
  });

  it("maps export formats to file extensions and mime types", () => {
    expect(getExportExtension("png")).toBe("png");
    expect(getExportExtension("jpg")).toBe("jpg");
    expect(getExportExtension("pdf")).toBe("pdf");
    expect(getExportMimeType("png")).toBe("image/png");
    expect(getExportMimeType("jpg")).toBe("image/jpeg");
    expect(getExportMimeType("pdf")).toBe("application/pdf");
  });

  it("clamps adjustment controls before export rendering", () => {
    expect(
      normalizeExportOptions({
        format: "jpg",
        scale: 4,
        exposure: 99,
        contrast: -99,
        jpegQuality: 2,
      }),
    ).toEqual({
      format: "jpg",
      scale: 1,
      exposure: 30,
      contrast: -30,
      jpegQuality: 0.98,
    });
  });

  it("rerenders source cards at the requested backing resolution", async () => {
    let exportCanvas: HTMLCanvasElement | null = null;
    const getExportCanvas = () => {
      if (!exportCanvas) {
        throw new Error("Expected export canvas to be created.");
      }
      return exportCanvas;
    };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => {
        const canvas = {
          width: 0,
          height: 0,
          toBlob(callback: BlobCallback, mimeType: string) {
            callback(new Blob([`${this.width}x${this.height}`], { type: mimeType }));
          },
        } as HTMLCanvasElement;
        exportCanvas = canvas;
        return canvas;
      }),
    });

    const blob = await createCardExportBlob(
      {} as HTMLCanvasElement,
      { format: "png", scale: 2, exposure: 0, contrast: 0, jpegQuality: 0.92 },
      { card: DEFAULT_CARD },
    );

    expect(renderCardMock).toHaveBeenCalledWith(getExportCanvas(), DEFAULT_CARD, undefined, { pixelScale: 2 });
    expect(getExportCanvas().width).toBe(1000);
    expect(getExportCanvas().height).toBe(1404);
    expect(blob.type).toBe("image/png");
    expect(await blob.text()).toBe("1000x1404");
  });
});
