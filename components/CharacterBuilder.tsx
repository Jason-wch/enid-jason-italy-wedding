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
      <span className="text-[0.62rem] tracking-[0.25em] uppercase text-ink/50 w-20 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1 flex-1 justify-end">
        <button
          type="button"
          onClick={() => step(-1)}
          className="text-sm w-8 h-8 rounded-full border border-ink/20 hover:border-ink/60 transition-colors cursor-pointer"
          aria-label={`Previous ${label}`}
        >
          ◀
        </button>
        <span className="text-base italic w-32 text-center">{options[index]}</span>
        <button
          type="button"
          onClick={() => step(1)}
          className="text-sm w-8 h-8 rounded-full border border-ink/20 hover:border-ink/60 transition-colors cursor-pointer"
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
      <span className="text-[0.62rem] tracking-[0.25em] uppercase text-ink/50 w-20 shrink-0">
        {label}
      </span>
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
    <div className="bg-white/60 border border-ink/10 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.68rem] tracking-[0.3em] uppercase text-sage-dark font-semibold">
          Your character
        </h3>
        <button
          type="button"
          onClick={() => onChange(randomCharacter())}
          className="text-[0.62rem] tracking-[0.22em] uppercase px-4 py-2 rounded-full border border-ink/20 hover:border-ink/60 transition-colors cursor-pointer"
        >
          ⚄ Random
        </button>
      </div>

      <div className="flex justify-center my-5 bg-gradient-to-b from-lake/20 to-sage/15 py-5">
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
