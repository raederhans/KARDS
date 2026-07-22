export type TextFitState = "fits" | "adjusted" | "truncated";

export type TextFitReport = {
  state: TextFitState;
  requestedFontSize: number;
  resolvedFontSize: number;
  lineCount: number;
  maxLines: number;
};

const graphemeSegmenter = createGraphemeSegmenter();

function createGraphemeSegmenter(): Intl.Segmenter {
  if (typeof Intl.Segmenter !== "function") {
    throw new Error("KARDS Card Forge requires Intl.Segmenter for Unicode-safe text fitting.");
  }
  return new Intl.Segmenter(undefined, { granularity: "grapheme" });
}

export function splitTextGraphemes(text: string): string[] {
  if (!text) {
    return [];
  }
  return Array.from(graphemeSegmenter.segment(text), (segment) => segment.segment);
}

export function removeLastTextGrapheme(text: string): string {
  const graphemes = splitTextGraphemes(text);
  graphemes.pop();
  return graphemes.join("");
}
