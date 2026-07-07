import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Dress Code — Enid & Jason",
};

/* Kept in sync with OUTFIT_COLORS in lib/pixel/sprites.ts. */
const PALETTE_SWATCHES = [
  { name: "Ivory", hex: "#f2ead8" },
  { name: "Sage", hex: "#97a383" },
  { name: "Dusty Blue", hex: "#83aebe" },
  { name: "Terracotta", hex: "#c76b4b" },
  { name: "Plum", hex: "#8a5f8f" },
  { name: "Navy", hex: "#3f5a78" },
];

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "For everyone",
    body: "The ceremony and reception take place outdoors in the villa gardens, on grass, gravel and stone terraces. April evenings by the lake are cool — bring a light layer for after sunset.",
  },
  {
    title: "Suggested attire",
    body: "Midi or maxi dresses, jumpsuits, linen or wool suits (jacket optional after dinner), dress shirts with or without a tie. Block heels, wedges, loafers or dressy flats are your friends — stilettos and villa lawns are not.",
  },
];

export default function DressCodePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Cosa indossare</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">Dress code</h1>
        <p className="display-italic text-5xl sm:text-6xl mt-10 leading-tight">
          Garden Formal
        </p>
        <p className="body-sans mt-6 max-w-xl mx-auto">
          Elegante ma comodo — elegant, romantic, and dressed for a lakeside garden.
        </p>
        <div className="hairline max-w-16 mx-auto mt-10" />
      </Reveal>

      <div className="mt-16 space-y-14">
        {SECTIONS.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 80}
            className="grid sm:grid-cols-[14rem_1fr] gap-4 sm:gap-10 items-baseline border-t border-ink/10 pt-10"
          >
            <h2 className="font-heading text-3xl">{s.title}</h2>
            <p className="body-sans">{s.body}</p>
          </Reveal>
        ))}

        {/* Colour palette */}
        <Reveal className="grid sm:grid-cols-[14rem_1fr] gap-4 sm:gap-10 border-t border-ink/10 pt-10">
          <h2 className="font-heading text-3xl">Colour palette</h2>
          <div>
            <p className="body-sans">
              Wear whatever colours make you feel great — but if you&apos;d like to match the
              scenery (and your pixel character!), here&apos;s our palette:
            </p>
            <div className="flex gap-5 flex-wrap mt-8">
              {PALETTE_SWATCHES.map((s) => (
                <div key={s.name} className="text-center group">
                  <div className="rounded-full p-1.5 border border-ink/15 transition-transform duration-500 group-hover:-translate-y-1">
                    <div
                      className="w-16 h-16 rounded-full border border-ink/10"
                      style={{ backgroundColor: s.hex }}
                    />
                  </div>
                  <div className="text-[0.68rem] tracking-[0.22em] uppercase mt-3 text-ink/55">
                    {s.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="grid sm:grid-cols-[14rem_1fr] gap-4 sm:gap-10 items-baseline border-t border-ink/10 pt-10">
          <h2 className="font-heading text-3xl">Please avoid</h2>
          <p className="body-sans">
            White, ivory or cream head-to-toe (that&apos;s Enid&apos;s corner of the palette),
            and anything you can&apos;t dance in. Everything else is fair game.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
