import { describe, expect, it } from "vitest";
import { createWrappedTextLines, getFittedFontSize, truncateToWidth } from "./cardRenderer";

function createMeasureContext() {
  return {
    font: "400 24px Georgia, serif",
    measureText(text: string) {
      const sizeMatch = /(\d+)px/.exec(this.font);
      const size = sizeMatch ? Number(sizeMatch[1]) : 16;
      return { width: text.length * size * 0.58 } as TextMetrics;
    },
  };
}

describe("card renderer text fitting", () => {
  it("splits long body tokens so every rendered line fits the target width", () => {
    const ctx = createMeasureContext();
    const lines = createWrappedTextLines(ctx, "SUPERCALIFRAGILISTICEXPIALIDOCIOUS", 120, 4);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((line) => ctx.measureText(line).width <= 120)).toBe(true);
  });

  it("shrinks and truncates long titles within the title area", () => {
    const ctx = createMeasureContext();
    const title = "EXTREMELYLONGTITLEWITHOUTSPACES";
    const size = getFittedFontSize(ctx, title, 160, 39, 18);
    ctx.font = `700 ${size}px Georgia, serif`;
    const fittedTitle = truncateToWidth(ctx, title, 160);

    expect(size).toBeGreaterThanOrEqual(18);
    expect(ctx.measureText(fittedTitle).width).toBeLessThanOrEqual(160);
  });

  it("marks overflowing body copy with an ellipsis on the last visible line", () => {
    const ctx = createMeasureContext();
    const lines = createWrappedTextLines(
      ctx,
      "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron",
      90,
      2,
    );

    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("...")).toBe(true);
    expect(lines.every((line) => ctx.measureText(line).width <= 90)).toBe(true);
  });
});
