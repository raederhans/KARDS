import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UI_TEXT } from "../i18n";
import { ImageDiffSummary } from "./ReferenceWorkbench";

describe("ImageDiffSummary", () => {
  it("describes severity, threshold, and changed coordinates without relying on color", () => {
    const markup = renderToStaticMarkup(createElement(ImageDiffSummary, {
      metrics: {
        width: 100,
        height: 200,
        comparedPixels: 20_000,
        meanAbsoluteError: 2.5,
        rootMeanSquareError: 4.75,
        maxChannelDelta: 30,
        changedPixels: 1_200,
        changedPixelRatio: 0.06,
        changedBounds: { x: 10, y: 20, width: 30, height: 40 },
        reviewLevel: "noticeable",
        threshold: 12,
      },
      text: UI_TEXT.en.projectPanel,
    }));

    expect(markup).toContain("Noticeable");
    expect(markup).toContain("Channel threshold: 12");
    expect(markup).toContain("x 10–39, y 20–59");
    expect(markup).toContain('role="img"');
    expect(markup).toContain("left:10%");
    expect(markup).toContain("height:20%");
  });
});
