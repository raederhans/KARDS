import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateImageDataDiff, compareCanvasToReferenceFile } from "./visualDiff";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("visual pixel diff", () => {
  it("returns zero deltas for identical image data", () => {
    const data = new Uint8ClampedArray([0, 10, 20, 255, 30, 40, 50, 255]);
    const metrics = calculateImageDataDiff({ width: 2, height: 1, data }, { width: 2, height: 1, data });

    expect(metrics.meanAbsoluteError).toBe(0);
    expect(metrics.rootMeanSquareError).toBe(0);
    expect(metrics.changedPixels).toBe(0);
  });

  it("reports changed pixels when any channel exceeds the threshold", () => {
    const actual = new Uint8ClampedArray([0, 0, 0, 255, 30, 40, 50, 255]);
    const expected = new Uint8ClampedArray([20, 0, 0, 255, 30, 40, 50, 255]);
    const metrics = calculateImageDataDiff(
      { width: 2, height: 1, data: actual },
      { width: 2, height: 1, data: expected },
      12,
    );

    expect(metrics.maxChannelDelta).toBe(20);
    expect(metrics.changedPixels).toBe(1);
    expect(metrics.changedPixelRatio).toBe(0.5);
  });

  it("rejects mismatched dimensions before comparing channels", () => {
    expect(() =>
      calculateImageDataDiff(
        { width: 1, height: 1, data: new Uint8ClampedArray(4) },
        { width: 2, height: 1, data: new Uint8ClampedArray(8) },
      ),
    ).toThrow("dimensions must match");
  });

  it("rejects empty dimensions and short channel arrays", () => {
    expect(() =>
      calculateImageDataDiff(
        { width: 0, height: 1, data: new Uint8ClampedArray(0) },
        { width: 0, height: 1, data: new Uint8ClampedArray(0) },
      ),
    ).toThrow("dimensions must be positive");

    expect(() =>
      calculateImageDataDiff(
        { width: 1, height: 1, data: new Uint8ClampedArray(3) },
        { width: 1, height: 1, data: new Uint8ClampedArray(4) },
      ),
    ).toThrow("RGBA values");
  });

  it("rejects reference files that decode to excessive pixels", async () => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:huge-reference"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal(
      "Image",
      class HugeImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 5000;
        naturalHeight = 5000;
        width = 5000;
        height = 5000;

        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );

    const canvas = {
      getContext: vi.fn(() => ({ getImageData: vi.fn() })),
    } as unknown as HTMLCanvasElement;

    await expect(compareCanvasToReferenceFile(canvas, new File([new Uint8Array([1])], "huge.png"))).rejects.toThrow(
      "Image dimensions are too large",
    );
  });
});
