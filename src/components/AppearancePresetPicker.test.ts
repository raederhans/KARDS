import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { APPEARANCE_PRESETS } from "../appearancePresets";
import { UI_TEXT } from "../i18n";
import { AppearancePresetPicker } from "./ProjectPanel";

describe("AppearancePresetPicker", () => {
  it("uses native controls and exposes every localized built-in preset", () => {
    const markup = renderToStaticMarkup(createElement(AppearancePresetPicker, {
      language: "en",
      text: UI_TEXT.en.projectPanel,
      presets: APPEARANCE_PRESETS,
      selectedPresetId: "clear-reading",
      onPresetSelect: vi.fn(),
      onApply: vi.fn(),
    }));

    expect(markup).toContain('name="appearance-preset"');
    expect(markup).toContain("Balanced paper");
    expect(markup).toContain("Weathered stock");
    expect(markup).toContain("Clear reading");
    expect(markup).toContain("Larger copy over a restrained texture for easier reading.");
    expect(markup).toContain(">Apply appearance preset<");
  });
});
