import { useEffect, useRef, useState } from "react";
import { CARD_HEIGHT, CARD_WIDTH, isPointInsideArtwork, renderCard } from "../canvas/cardRenderer";
import type { RenderCardOptions } from "../canvas/renderAssets";
import {
  translateKeywordLabel,
  translatePresetLabel,
  type Language,
  type UiText,
} from "../i18n";
import { getKind, getNation, getRarity, getSet } from "../presets";
import { KEYWORD_PRESETS } from "../keywords";
import type { CardSpec } from "../types";

type CardCanvasProps = {
  card: CardSpec;
  language: Language;
  text: UiText["canvas"];
  artworkImage: HTMLImageElement | null;
  onCropChange: (crop: CardSpec["artwork"]["crop"]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  renderOptions?: RenderCardOptions;
  referenceImageUrl?: string | null;
  referenceLabel?: string | null;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  cropX: number;
  cropY: number;
};

export function CardCanvas({
  card,
  language,
  text,
  artworkImage,
  onCropChange,
  canvasRef,
  renderOptions,
  referenceImageUrl,
  referenceLabel,
}: CardCanvasProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const kindLabel = translatePresetLabel(language, "kind", card.kind, getKind(card.kind).label);
  const nationLabel = translatePresetLabel(language, "nation", card.nation, getNation(card.nation).label);
  const rarityLabel = translatePresetLabel(language, "rarity", card.rarity, getRarity(card.rarity).label);
  const setLabel = translatePresetLabel(language, "set", card.set, getSet(card.set).label);
  const keywordLabels = (card.keywords ?? [])
    .map((keywordId) => {
      const keyword = KEYWORD_PRESETS.find((candidate) => candidate.id === keywordId);
      return translateKeywordLabel(language, keywordId, keyword?.label ?? keywordId);
    })
    .join(", ") || text.summaryEmpty;
  const displayValue = (value: number | undefined) => value === undefined ? text.summaryEmpty : String(value);

  useEffect(() => {
    if (canvasRef.current) {
      renderCard(canvasRef.current, card, artworkImage, renderOptions);
    }
  }, [artworkImage, canvasRef, card, renderOptions]);

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CARD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CARD_HEIGHT,
    };
  }

  function isInsideArtwork(x: number, y: number): boolean {
    return isPointInsideArtwork(card.kind, x, y);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!artworkImage) {
      return;
    }
    const point = getCanvasPoint(event);
    if (!isInsideArtwork(point.x, point.y)) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      cropX: card.artwork.crop.x,
      cropY: card.artwork.crop.y,
    });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const point = getCanvasPoint(event);
    onCropChange({
      ...card.artwork.crop,
      x: clamp(dragState.cropX + point.x - dragState.startX, -300, 300),
      y: clamp(dragState.cropY + point.y - dragState.startY, -300, 300),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (dragState?.pointerId === event.pointerId) {
      setDragState(null);
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    if (!artworkImage) {
      return;
    }
    const point = getCanvasPoint(event);
    if (!isInsideArtwork(point.x, point.y)) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.06 : 0.06;
    onCropChange({
      ...card.artwork.crop,
      scale: clamp(Number((card.artwork.crop.scale + direction).toFixed(2)), 0.6, 3),
    });
  }

  return (
    <section className="canvas-stage" aria-label={text.aria} ref={previewRef}>
      <div className={referenceImageUrl ? "canvas-comparison" : "canvas-comparison is-single"}>
        <figure className="card-preview-frame">
          <canvas
            ref={canvasRef}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            className={artworkImage ? "card-canvas is-draggable" : "card-canvas"}
            role="img"
            aria-label={text.generatedAria}
            aria-describedby="card-preview-summary canvas-hint"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          />
          <figcaption>{text.generated}</figcaption>
        </figure>
        {referenceImageUrl ? (
          <figure className="card-preview-frame">
            <img className="reference-card-image" src={referenceImageUrl} alt={text.officialReferenceAlt} />
            <figcaption>
              {referenceLabel ? text.officialReferenceWithLabel(referenceLabel) : text.officialReference}
            </figcaption>
          </figure>
        ) : null}
      </div>
      <div id="card-preview-summary" className="sr-only">
        <p><strong>{text.summaryHeading}</strong></p>
        <p>{text.summaryIdentity(kindLabel, nationLabel, rarityLabel, setLabel)}</p>
        <p>{card.title}</p>
        <p>{text.summaryCosts(displayValue(card.costs.deployment), displayValue(card.costs.operation))}</p>
        <p>{text.summaryStats(
          displayValue(card.stats.attack),
          displayValue(card.stats.defense),
          displayValue(card.stats.hqDefense),
        )}</p>
        <p>{text.summaryKeywords(keywordLabels)}</p>
        <p>{card.body}</p>
        <p>{text.keyboardAlternative}</p>
      </div>
      <p id="canvas-hint" className="canvas-hint">{text.hint}</p>
    </section>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
