import { DEFAULT_CARD, normalizeCardSpec } from "../cardModel";
import type { CardSpec, CardUpdate } from "../types";
import { MAX_PROJECT_FILE_BYTES } from "../limits";

type ProjectPanelProps = {
  card: CardSpec;
  onCardChange: (update: CardUpdate) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function ProjectPanel({ card, onCardChange, canvasRef }: ProjectPanelProps) {
  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      downloadBlob(blob, `${safeFileName(card.title)}.png`);
    }, "image/png");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${safeFileName(card.title)}.card.json`);
  }

  function importJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_PROJECT_FILE_BYTES) {
      window.alert("This card project is too large to open. Please choose a JSON file under 8 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onCardChange(normalizeCardSpec(parsed));
      } catch {
        window.alert("This JSON file could not be opened as a card project.");
      }
    });
    reader.readAsText(file);
  }

  return (
    <aside className="panel project-panel" aria-label="Project and export controls">
      <div className="panel-heading">
        <p>Project</p>
        <span>Local only</span>
      </div>

      <div className="export-stack">
        <button type="button" className="primary-action" onClick={exportPng}>
          Export PNG
        </button>
        <button type="button" onClick={exportJson}>
          Save JSON
        </button>
        <label className="file-button">
          Open JSON
          <input name="project-json-import" type="file" accept="application/json,.json" onChange={importJson} />
        </label>
        <button type="button" className="danger-action" onClick={() => onCardChange(DEFAULT_CARD)}>
          Reset Card
        </button>
      </div>

      <div className="summary-list">
        <p>
          <span>Output</span>
          <strong>500 x 702 PNG</strong>
        </p>
        <p>
          <span>Artwork</span>
          <strong>{card.artwork.source === "upload" ? "embedded in JSON" : "not embedded"}</strong>
        </p>
        <p>
          <span>Scope</span>
          <strong>card face only</strong>
        </p>
      </div>

      <p className="disclaimer">
        Unofficial non-commercial fan utility. It ships with original placeholder visuals only and does not include
        official KARDS assets, logos, card data, automation, or gameplay helpers. Upload and distribute only images you
        have the right to use.
      </p>
    </aside>
  );
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-card";
}
