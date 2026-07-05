import { describe, expect, it } from "vitest";
import {
  getExportDimensions,
  getExportExtension,
  getExportMimeType,
  normalizeExportOptions,
} from "./exportCard";

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
});
