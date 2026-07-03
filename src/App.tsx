import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CARD, normalizeCardSpec } from "./cardModel";
import { CardCanvas } from "./components/CardCanvas";
import { FieldPanel } from "./components/FieldPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { loadDraftCard, saveDraftCard } from "./storage";
import type { CardSpec, CardUpdate } from "./types";
import "./styles.css";

function App() {
  const [card, setCard] = useState<CardSpec>(() => loadDraftCard(window.localStorage, DEFAULT_CARD));
  const [artworkImage, setArtworkImage] = useState<HTMLImageElement | null>(null);
  const [autosavePaused, setAutosavePaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setAutosavePaused(!saveDraftCard(window.localStorage, card));
  }, [card]);

  useEffect(() => {
    if (!card.artwork.dataUrl) {
      setArtworkImage(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) {
        setArtworkImage(image);
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setArtworkImage(null);
      }
    };
    image.src = card.artwork.dataUrl;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [card.artwork.dataUrl]);

  const previewCard = useMemo(() => normalizeCardSpec(card), [card]);

  function updateCard(update: CardUpdate) {
    setCard((currentCard) => {
      const normalizedCurrent = normalizeCardSpec(currentCard);
      return normalizeCardSpec(typeof update === "function" ? update(normalizedCurrent) : update);
    });
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="brand-mark">CF</p>
          <div>
            <h1>Card Forge</h1>
            <p>Static custom card-face generator</p>
          </div>
        </div>
        <span className={autosavePaused ? "scope-pill is-warning" : "scope-pill"}>
          {autosavePaused ? "Save JSON to keep changes" : "No gameplay tools"}
        </span>
      </header>

      <div className="workspace">
        <FieldPanel card={previewCard} onCardChange={updateCard} />
        <CardCanvas
          card={previewCard}
          artworkImage={artworkImage}
          canvasRef={canvasRef}
          onCropChange={(crop) =>
            updateCard((currentCard) => ({
              ...currentCard,
              artwork: {
                ...currentCard.artwork,
                crop,
              },
            }))
          }
        />
        <ProjectPanel card={previewCard} onCardChange={updateCard} canvasRef={canvasRef} />
      </div>
    </main>
  );
}

export default App;
