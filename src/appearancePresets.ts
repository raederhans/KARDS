import { DEFAULT_CARD_APPEARANCE, normalizeCardSpec } from "./cardModel";
import type { Language } from "./i18n";
import type { CardAppearance, CardSpec } from "./types";

export type AppearancePreset = {
  id: string;
  labels: Record<Language, string>;
  descriptions: Record<Language, string>;
  appearance: CardAppearance;
};

type AppearanceOverrides = {
  texture?: Partial<CardAppearance["texture"]>;
  text?: {
    title?: Partial<CardAppearance["text"]["title"]>;
    keywords?: Partial<CardAppearance["text"]["keywords"]>;
    body?: Partial<CardAppearance["text"]["body"]>;
  };
};

export const APPEARANCE_PRESETS: readonly AppearancePreset[] = [
  {
    id: "balanced-paper",
    labels: { en: "Balanced paper", zh: "平衡纸感" },
    descriptions: {
      en: "The current balanced texture and text proportions.",
      zh: "当前默认的平衡纹理与文字比例。",
    },
    appearance: createAppearance(),
  },
  {
    id: "weathered-stock",
    labels: { en: "Weathered stock", zh: "旧化纸张" },
    descriptions: {
      en: "Stronger grain, variation, and mottling for an aged print feel.",
      zh: "增强颗粒、随机变化和斑驳，形成旧印刷品的感觉。",
    },
    appearance: createAppearance({
      texture: { seed: 0x57454154, intensity: 2.65, randomness: 2.35, mottle: 2.5 },
    }),
  },
  {
    id: "headline-forward",
    labels: { en: "Headline forward", zh: "标题突出" },
    descriptions: {
      en: "A larger title with slightly quieter supporting copy.",
      zh: "放大标题，并略微收紧辅助文字。",
    },
    appearance: createAppearance({
      texture: { seed: 0x48454144, intensity: 1.25, randomness: 1.1, mottle: 0.85 },
      text: {
        title: { fontScale: 1.16, scaleX: 1.04, bold: true },
        keywords: { fontScale: 0.96 },
        body: { fontScale: 0.94 },
      },
    }),
  },
  {
    id: "clear-reading",
    labels: { en: "Clear reading", zh: "清晰阅读" },
    descriptions: {
      en: "Larger copy over a restrained texture for easier reading.",
      zh: "弱化纹理并放大文字，便于阅读。",
    },
    appearance: createAppearance({
      texture: { seed: 0x434c4541, intensity: 0.45, randomness: 0.6, mottle: 0.45 },
      text: {
        title: { fontScale: 1.08, bold: true },
        keywords: { fontScale: 1.1 },
        body: { fontScale: 1.12 },
      },
    }),
  },
  {
    id: "compact-copy",
    labels: { en: "Compact copy", zh: "紧凑文字" },
    descriptions: {
      en: "Condensed title, keyword, and body text for dense drafts.",
      zh: "压缩标题、关键词和正文，适合文字较多的草稿。",
    },
    appearance: createAppearance({
      texture: { seed: 0x434f4d50, intensity: 1.5, randomness: 1.4, mottle: 1.2 },
      text: {
        title: { fontScale: 0.95, scaleX: 0.95 },
        keywords: { fontScale: 0.88, scaleX: 0.9 },
        body: { fontScale: 0.82, scaleX: 0.88, scaleY: 0.96 },
      },
    }),
  },
];

export function getAppearancePresetLabel(preset: AppearancePreset, language: Language): string {
  return preset.labels[language];
}

export function applyAppearancePreset(card: CardSpec, preset: AppearancePreset): CardSpec {
  return normalizeCardSpec({
    ...card,
    appearance: preset.appearance,
  });
}

function createAppearance(overrides: AppearanceOverrides = {}): CardAppearance {
  return {
    texture: {
      ...DEFAULT_CARD_APPEARANCE.texture,
      ...overrides.texture,
    },
    text: {
      title: {
        ...DEFAULT_CARD_APPEARANCE.text.title,
        ...overrides.text?.title,
      },
      keywords: {
        ...DEFAULT_CARD_APPEARANCE.text.keywords,
        ...overrides.text?.keywords,
      },
      body: {
        ...DEFAULT_CARD_APPEARANCE.text.body,
        ...overrides.text?.body,
      },
    },
  };
}
