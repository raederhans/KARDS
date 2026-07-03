import { CARD_KINDS, NATIONS, RARITIES, SETS, getKind } from "../presets";
import type { CardSpec, CardUpdate } from "../types";
import {
  BODY_MAX_LENGTH,
  isAllowedImageType,
  KEYWORD_MAX_LENGTH,
  MAX_IMAGE_FILE_BYTES,
  TITLE_MAX_LENGTH,
} from "../limits";

type FieldPanelProps = {
  card: CardSpec;
  onCardChange: (update: CardUpdate) => void;
};

export function FieldPanel({ card, onCardChange }: FieldPanelProps) {
  const kind = getKind(card.kind);

  function update(next: Partial<CardSpec>) {
    onCardChange((currentCard) => ({ ...currentCard, ...next }));
  }

  function updateCost(key: keyof CardSpec["costs"], value: string) {
    onCardChange((currentCard) => ({
      ...currentCard,
      costs: {
        ...currentCard.costs,
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  }

  function updateStat(key: keyof CardSpec["stats"], value: string) {
    onCardChange((currentCard) => ({
      ...currentCard,
      stats: {
        ...currentCard.stats,
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  }

  function updateCrop(key: keyof CardSpec["artwork"]["crop"], value: string) {
    onCardChange((currentCard) => ({
      ...currentCard,
      artwork: {
        ...currentCard.artwork,
        crop: {
          ...currentCard.artwork.crop,
          [key]: Number(value),
        },
      },
    }));
  }

  function handleArtworkUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!isAllowedImageType(file.type) || file.size > MAX_IMAGE_FILE_BYTES) {
      window.alert("Please choose a PNG, JPEG, or WebP image under 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        return;
      }
      onCardChange((currentCard) => ({
        ...currentCard,
        artwork: {
          source: "upload",
          dataUrl,
          crop: { x: 0, y: 0, scale: 1 },
        },
      }));
    });
    reader.readAsDataURL(file);
  }

  return (
    <aside className="panel field-panel" aria-label="Card fields">
      <div className="panel-heading">
        <p>Fields</p>
        <span>Single card</span>
      </div>

      <label className="field-block">
        <span>Artwork</span>
        <input name="artwork-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleArtworkUpload} />
      </label>

      <div className="crop-grid">
        <label>
          <span>Art X</span>
          <input
            name="artwork-crop-x"
            type="range"
            min="-300"
            max="300"
            value={card.artwork.crop.x}
            onChange={(event) => updateCrop("x", event.target.value)}
          />
        </label>
        <label>
          <span>Art Y</span>
          <input
            name="artwork-crop-y"
            type="range"
            min="-300"
            max="300"
            value={card.artwork.crop.y}
            onChange={(event) => updateCrop("y", event.target.value)}
          />
        </label>
        <label>
          <span>Zoom</span>
          <input
            name="artwork-crop-scale"
            type="range"
            min="0.6"
            max="3"
            step="0.05"
            value={card.artwork.crop.scale}
            onChange={(event) => updateCrop("scale", event.target.value)}
          />
        </label>
      </div>

      <label className="field-block">
        <span>Title</span>
        <input
          name="card-title"
          value={card.title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => update({ title: event.target.value })}
        />
      </label>

      <label className="field-block">
        <span>Keyword line</span>
        <input
          name="card-keyword-line"
          value={card.keywordLine ?? ""}
          maxLength={KEYWORD_MAX_LENGTH}
          onChange={(event) => update({ keywordLine: event.target.value })}
        />
      </label>

      <label className="field-block">
        <span>Body</span>
        <textarea
          name="card-body"
          value={card.body}
          rows={5}
          maxLength={BODY_MAX_LENGTH}
          onChange={(event) => update({ body: event.target.value })}
        />
      </label>

      <div className="select-grid">
        <label>
          <span>Nation</span>
          <select name="card-nation" value={card.nation} onChange={(event) => update({ nation: event.target.value })}>
            {NATIONS.map((nation) => (
              <option key={nation.id} value={nation.id}>
                {nation.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Type</span>
          <select
            name="card-kind"
            value={card.kind}
            onChange={(event) => update({ kind: event.target.value as CardSpec["kind"] })}
          >
            {CARD_KINDS.map((kindOption) => (
              <option key={kindOption.id} value={kindOption.id}>
                {kindOption.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Rarity</span>
          <select name="card-rarity" value={card.rarity} onChange={(event) => update({ rarity: event.target.value })}>
            {RARITIES.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Set</span>
          <select name="card-set" value={card.set} onChange={(event) => update({ set: event.target.value })}>
            {SETS.map((set) => (
              <option key={set.id} value={set.id}>
                {set.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="number-grid">
        <NumberField
          label="Cost"
          name="card-deployment-cost"
          value={card.costs.deployment}
          onChange={(value) => updateCost("deployment", value)}
        />
        {kind.hasOperationCost ? (
          <NumberField
            label="Op"
            name="card-operation-cost"
            value={card.costs.operation}
            onChange={(value) => updateCost("operation", value)}
          />
        ) : null}
        {kind.hasStats ? (
          <>
            <NumberField
              label="Attack"
              name="card-attack"
              value={card.stats.attack}
              onChange={(value) => updateStat("attack", value)}
            />
            <NumberField
              label="Defense"
              name="card-defense"
              value={card.stats.defense}
              onChange={(value) => updateStat("defense", value)}
            />
          </>
        ) : null}
        {card.kind === "hq" ? (
          <NumberField
            label="HQ defense"
            name="card-hq-defense"
            value={card.stats.hqDefense}
            onChange={(value) => updateStat("hqDefense", value)}
          />
        ) : null}
      </div>
    </aside>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        name={name}
        type="number"
        min="0"
        max="40"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
