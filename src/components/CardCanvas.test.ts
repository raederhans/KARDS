import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CARD } from "../cardModel";
import { UI_TEXT } from "../i18n";
import { CardCanvas } from "./CardCanvas";

describe("CardCanvas accessibility fallback", () => {
  it("associates the canvas preview with a readable card-content summary", () => {
    const markup = renderToStaticMarkup(createElement(CardCanvas, {
      card: DEFAULT_CARD,
      language: "en",
      text: UI_TEXT.en.canvas,
      artworkImage: null,
      onCropChange: vi.fn(),
      canvasRef: createRef<HTMLCanvasElement>(),
    }));

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-describedby="card-preview-summary canvas-hint"');
    expect(markup).toContain('id="card-preview-summary"');
    expect(markup).toContain("CUSTOM TANK");
    expect(markup).toContain("When this unit advances");
    expect(markup).toContain("Use the Artwork crop number fields or sliders for keyboard control.");
  });
});
