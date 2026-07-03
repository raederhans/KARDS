import { getKind, getNation, getRarity, getSet } from "../presets";
import type { CardSpec } from "../types";

export const CARD_WIDTH = 500;
export const CARD_HEIGHT = 702;

export const ART_RECT = {
  x: 52,
  y: 144,
  width: 396,
  height: 258,
};

const BODY_RECT = {
  x: 58,
  y: 458,
  width: 384,
  height: 134,
};

type TextMeasureContext = Pick<CanvasRenderingContext2D, "font" | "measureText">;

export function renderCard(
  canvas: HTMLCanvasElement,
  card: CardSpec,
  artworkImage?: HTMLImageElement | null,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const nation = getNation(card.nation);
  const rarity = getRarity(card.rarity);
  const set = getSet(card.set);
  const kind = getKind(card.kind);

  drawCardBase(ctx, nation.accent);
  drawHeader(ctx, card, nation);
  drawArtwork(ctx, card, artworkImage, nation.deep);
  drawSeparator(ctx, rarity.color);
  drawBody(ctx, card, rarity.color);
  drawFooter(ctx, card, kind, set, rarity.color);
  drawGrain(ctx);
}

function drawCardBase(ctx: CanvasRenderingContext2D, accent: string): void {
  ctx.save();
  roundRect(ctx, 12, 10, 476, 682, 24);
  ctx.fillStyle = "#1b1710";
  ctx.fill();

  roundRect(ctx, 22, 20, 456, 662, 18);
  const frame = ctx.createLinearGradient(22, 20, 478, 682);
  frame.addColorStop(0, "#d3bd86");
  frame.addColorStop(0.52, "#756036");
  frame.addColorStop(1, "#e2d5ab");
  ctx.fillStyle = frame;
  ctx.fill();

  roundRect(ctx, 30, 28, 440, 646, 14);
  const paper = ctx.createLinearGradient(30, 28, 470, 674);
  paper.addColorStop(0, "#e9dbb7");
  paper.addColorStop(0.48, "#d1bd8d");
  paper.addColorStop(1, "#efe3c1");
  ctx.fillStyle = paper;
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = accent;
  ctx.fillRect(34, 32, 432, 638);
  ctx.globalAlpha = 1;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#33291a";
  roundRect(ctx, 30, 28, 440, 646, 14);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  card: CardSpec,
  nation: { accent: string; deep: string; shortLabel: string; emblem: string },
): void {
  drawValueBadge(ctx, 53, 48, card.costs.deployment, nation.deep);

  if (card.costs.operation !== undefined) {
    ctx.save();
    ctx.fillStyle = "#e7d6a7";
    ctx.font = "700 20px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(card.costs.operation), 116, 82);
    ctx.font = "700 12px Arial, sans-serif";
    ctx.fillText("OP", 116, 97);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = "#17130e";
  ctx.font = "700 39px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fitText(ctx, card.title.toUpperCase(), 252, 80, 222, 39);
  ctx.restore();

  drawNationEmblem(ctx, 404, 78, 42, nation);
}

function drawArtwork(
  ctx: CanvasRenderingContext2D,
  card: CardSpec,
  artworkImage: HTMLImageElement | null | undefined,
  deepColor: string,
): void {
  ctx.save();
  roundRect(ctx, ART_RECT.x, ART_RECT.y, ART_RECT.width, ART_RECT.height, 4);
  ctx.clip();

  if (artworkImage) {
    const baseScale = Math.max(
      ART_RECT.width / artworkImage.naturalWidth,
      ART_RECT.height / artworkImage.naturalHeight,
    );
    const scale = baseScale * card.artwork.crop.scale;
    const width = artworkImage.naturalWidth * scale;
    const height = artworkImage.naturalHeight * scale;
    const x = ART_RECT.x + (ART_RECT.width - width) / 2 + card.artwork.crop.x;
    const y = ART_RECT.y + (ART_RECT.height - height) / 2 + card.artwork.crop.y;
    ctx.drawImage(artworkImage, x, y, width, height);
  } else {
    const backdrop = ctx.createLinearGradient(ART_RECT.x, ART_RECT.y, ART_RECT.x, ART_RECT.y + ART_RECT.height);
    backdrop.addColorStop(0, "#6b6a5a");
    backdrop.addColorStop(0.5, deepColor);
    backdrop.addColorStop(1, "#17130f");
    ctx.fillStyle = backdrop;
    ctx.fillRect(ART_RECT.x, ART_RECT.y, ART_RECT.width, ART_RECT.height);
    ctx.globalAlpha = 0.24;
    for (let i = 0; i < 12; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? "#d5c18d" : "#0c0b09";
      ctx.fillRect(ART_RECT.x + i * 38, ART_RECT.y, 22, ART_RECT.height);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ead9ad";
    ctx.font = "700 22px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UPLOAD ARTWORK", ART_RECT.x + ART_RECT.width / 2, ART_RECT.y + ART_RECT.height / 2);
  }

  ctx.restore();

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#352819";
  roundRect(ctx, ART_RECT.x, ART_RECT.y, ART_RECT.width, ART_RECT.height, 4);
  ctx.stroke();
  ctx.restore();
}

function drawSeparator(ctx: CanvasRenderingContext2D, rarityColor: string): void {
  ctx.save();
  ctx.fillStyle = "#7b332b";
  ctx.fillRect(68, 424, 145, 6);
  ctx.fillRect(287, 424, 145, 6);
  ctx.fillStyle = rarityColor;
  ctx.beginPath();
  ctx.arc(250, 427, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#33251a";
  ctx.font = "700 23px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("*", 250, 429);
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, card: CardSpec, rarityColor: string): void {
  ctx.save();
  if (card.keywordLine) {
    ctx.fillStyle = rarityColor;
    ctx.font = "700 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.keywordLine.toUpperCase(), 250, BODY_RECT.y + 20);
  }

  ctx.fillStyle = "#17120d";
  ctx.font = "400 24px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  drawWrappedText(ctx, card.body, 250, BODY_RECT.y + (card.keywordLine ? 54 : 26), BODY_RECT.width, 30, 4);
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  card: CardSpec,
  kind: { label: string; symbol: string; hasStats: boolean },
  set: { mark: string },
  rarityColor: string,
): void {
  ctx.save();
  ctx.fillStyle = "#1c1711";
  ctx.font = "700 18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(kind.symbol, 250, 642);

  ctx.fillStyle = rarityColor;
  ctx.font = "700 14px Arial, sans-serif";
  ctx.fillText(set.mark, 250, 662);

  if (card.kind === "hq") {
    drawShield(ctx, 250, 604, card.stats.hqDefense, "#1d1811");
    ctx.font = "700 13px Arial, sans-serif";
    ctx.fillStyle = "#34291b";
    ctx.fillText("HQ DEFENSE", 250, 662);
  } else if (kind.hasStats) {
    drawShield(ctx, 87, 612, card.stats.attack, "#1d1811");
    drawShield(ctx, 413, 612, card.stats.defense, "#1d1811");
  } else {
    ctx.font = "700 15px Arial, sans-serif";
    ctx.fillStyle = "#34291b";
    ctx.fillText(kind.label.toUpperCase(), 250, 613);
  }
  ctx.restore();
}

function drawValueBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number | undefined,
  color: string,
): void {
  ctx.save();
  roundRect(ctx, x, y, 68, 72, 4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#0d0b08";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#e9d5a0";
  ctx.font = "700 54px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(value ?? 0), x + 34, y + 40);
  ctx.restore();
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, value: number | undefined, color: string): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 36, y - 38);
  ctx.lineTo(x + 36, y - 38);
  ctx.lineTo(x + 32, y + 20);
  ctx.lineTo(x, y + 44);
  ctx.lineTo(x - 32, y + 20);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#0d0b08";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#efe2bd";
  ctx.font = "700 46px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(value ?? 0), x, y - 2);
  ctx.restore();
}

function drawNationEmblem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  nation: { accent: string; shortLabel: string; emblem: string },
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = nation.accent;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#20170f";
  ctx.stroke();

  ctx.fillStyle = "#ead7a4";
  ctx.font = nation.emblem === "star" ? "700 48px Arial, sans-serif" : "700 22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(nation.emblem === "star" ? "*" : nation.shortLabel, x, y + 2);
  ctx.restore();
}

function drawGrain(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 520; i += 1) {
    const x = (i * 37) % CARD_WIDTH;
    const y = (i * 73) % CARD_HEIGHT;
    const size = 1 + (i % 3);
    ctx.fillStyle = i % 2 === 0 ? "#f9edcf" : "#19130d";
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  const lines = createWrappedTextLines(ctx, text, maxWidth, maxLines);

  lines.forEach((wrappedLine, index) => {
    ctx.fillText(wrappedLine, x, y + index * lineHeight);
  });
}

export function createWrappedTextLines(
  ctx: TextMeasureContext,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean).flatMap((word) => splitLongToken(ctx, word, maxWidth));
  const lines: string[] = [];
  let line = "";
  let usedWordCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) {
        break;
      }
    } else {
      line = testLine;
    }
    usedWordCount += 1;
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  const wrappedLines = lines.map((wrappedLine) => truncateToWidth(ctx, wrappedLine, maxWidth));
  if (usedWordCount < words.length && wrappedLines.length > 0) {
    const lastLineIndex = wrappedLines.length - 1;
    wrappedLines[lastLineIndex] = appendEllipsisToWidth(ctx, wrappedLines[lastLineIndex], maxWidth);
  }

  return wrappedLines;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  initialSize: number,
): void {
  const size = getFittedFontSize(ctx, text, maxWidth, initialSize, 18);
  ctx.font = `700 ${size}px Georgia, 'Times New Roman', serif`;
  ctx.fillText(truncateToWidth(ctx, text, maxWidth), x, y);
}

export function getFittedFontSize(
  ctx: TextMeasureContext,
  text: string,
  maxWidth: number,
  initialSize: number,
  minimumSize: number,
): number {
  let size = initialSize;
  while (size > minimumSize) {
    ctx.font = `700 ${size}px Georgia, 'Times New Roman', serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    size -= 1;
  }
  return size;
}

export function truncateToWidth(ctx: TextMeasureContext, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  return appendEllipsisToWidth(ctx, text, maxWidth);
}

function appendEllipsisToWidth(ctx: TextMeasureContext, text: string, maxWidth: number): string {
  let truncatedText = text;
  while (truncatedText.length > 1 && ctx.measureText(`${truncatedText}...`).width > maxWidth) {
    truncatedText = truncatedText.slice(0, -1);
  }
  return `${truncatedText}...`;
}

function splitLongToken(ctx: TextMeasureContext, token: string, maxWidth: number): string[] {
  if (ctx.measureText(token).width <= maxWidth) {
    return [token];
  }

  const chunks: string[] = [];
  let chunk = "";
  for (const char of token) {
    const testChunk = `${chunk}${char}`;
    if (chunk && ctx.measureText(testChunk).width > maxWidth) {
      chunks.push(chunk);
      chunk = char;
    } else {
      chunk = testChunk;
    }
  }

  if (chunk) {
    chunks.push(chunk);
  }
  return chunks;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 8,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
