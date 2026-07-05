"use client";

import CharacterSprite from "@/components/CharacterSprite";
import {
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  OUTFITS,
  randomCharacter,
  SKINS,
  type CharacterConfig,
} from "@/lib/pixel/sprites";

type Props = {
  value: CharacterConfig;
  onChange: (next: CharacterConfig) => void;
};

function Cycler({
  label,
  options,
  index,
  onIndex,
}: {
  label: string;
  options: string[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const step = (dir: number) => onIndex((index + dir + options.length) % options.length);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-pixel text-xs text-ink/60 w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-1 flex-1 justify-end">
        <button
          type="button"
          onClick={() => step(-1)}
          className="font-pixel text-sm w-8 h-8 rounded-lg border border-ink/20 hover:bg-parchment cursor-pointer"
          aria-label={`Previous ${label}`}
        >
          ◀
        </button>
        <span className="text-base w-32 text-center">{options[index]}</span>
        <button
          type="button"
          onClick={() => step(1)}
          className="font-pixel text-sm w-8 h-8 rounded-lg border border-ink/20 hover:bg-parchment cursor-pointer"
          aria-label={`Next ${label}`}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

function Swatches({
  label,
  colors,
  index,
  onIndex,
}: {
  label: string;
  colors: { label: string; colors: [string, string] }[];
  index: number;
  onIndex: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-pixel text-xs text-ink/60 w-20 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap justify-end">
        {colors.map((c, i) => (
          <button
            key={c.label}
            type="button"
            title={c.label}
            onClick={() => onIndex(i)}
            className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
              i === index ? "border-ink scale-110" : "border-ink/15 hover:scale-105"
            }`}
            style={{ backgroundColor: c.colors[0] }}
            aria-label={`${label}: ${c.label}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CharacterBuilder({ value, onChange }: Props) {
  return (
    <div className="bg-parchment rounded-2xl p-5 border-2 border-gold/30">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-sm text-sage-dark">YOUR CHARACTER</h3>
        <button
          type="button"
          onClick={() => onChange(randomCharacter())}
          className="font-pixel text-xs px-3 py-2 rounded-full bg-villa/70 hover:bg-villa cursor-pointer"
        >
          ⚄ RANDOM
        </button>
      </div>

      <div className="flex justify-center my-4 bg-gradient-to-b from-lake/25 to-sage/20 rounded-xl py-4">
        <CharacterSprite config={value} scale={7} />
      </div>

      <div className="space-y-3">
        <Swatches
          label="SKIN"
          colors={SKINS}
          index={value.skin}
          onIndex={(skin) => onChange({ ...value, skin })}
        />
        <Cycler
          label="HAIR"
          options={HAIR_STYLES}
          index={value.hairStyle}
          onIndex={(hairStyle) => onChange({ ...value, hairStyle })}
        />
        <Swatches
          label="HAIR COLOR"
          colors={HAIR_COLORS}
          index={value.hairColor}
          onIndex={(hairColor) => onChange({ ...value, hairColor })}
        />
        <Cycler
          label="OUTFIT"
          options={OUTFITS}
          index={value.outfit}
          onIndex={(outfit) => onChange({ ...value, outfit })}
        />
        <Swatches
          label="OUTFIT COLOR"
          colors={OUTFIT_COLORS}
          index={value.outfitColor}
          onIndex={(outfitColor) => onChange({ ...value, outfitColor })}
        />
      </div>
    </div>
  );
}
