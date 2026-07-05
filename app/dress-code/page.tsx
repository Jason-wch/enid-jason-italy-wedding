export const metadata = {
  title: "Dress Code — Enid & Jason",
};

const PALETTE_SWATCHES = [
  { name: "Ivory", hex: "#f2ead8" },
  { name: "Sage", hex: "#93a884" },
  { name: "Dusty Blue", hex: "#7f9cbf" },
  { name: "Terracotta", hex: "#c2704e" },
  { name: "Plum", hex: "#8a5f8f" },
  { name: "Navy", hex: "#3f5a78" },
];

export default function DressCodePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose-wedding">
      <h1 className="font-pixel text-sm text-sage-dark text-center">DRESS CODE</h1>
      <p className="text-center mt-4 text-2xl font-semibold">Garden Formal</p>
      <p className="text-center text-xl text-ink/75 mt-2">
        Think elegant, romantic, and comfortable enough for a lakeside garden.
      </p>

      <div className="mt-10 bg-white/60 border border-gold/25 rounded-2xl p-6 sm:p-8">
        <h2>For everyone</h2>
        <p>
          The ceremony and reception take place outdoors in the villa gardens, on grass,
          gravel and stone terraces. April evenings by the lake are cool — bring a light
          layer for after sunset.
        </p>
        <h2>Suggested attire</h2>
        <p>
          Midi or maxi dresses, jumpsuits, linen or wool suits (jacket optional after
          dinner), dress shirts with or without a tie. Block heels, wedges, loafers or
          dressy flats are your friends — stilettos and villa lawns are not.
        </p>
        <h2>Colour palette</h2>
        <p>
          Wear whatever colours make you feel great — but if you&apos;d like to match the
          scenery (and your pixel character!), here&apos;s our palette:
        </p>
        <div className="flex gap-3 flex-wrap mt-4">
          {PALETTE_SWATCHES.map((s) => (
            <div key={s.name} className="text-center">
              <div
                className="w-16 h-16 rounded-xl border-2 border-ink/10 shadow-sm"
                style={{ backgroundColor: s.hex }}
              />
              <div className="text-sm mt-1.5 text-ink/70">{s.name}</div>
            </div>
          ))}
        </div>
        <h2>Please avoid</h2>
        <p>
          White, ivory or cream head-to-toe (that&apos;s Enid&apos;s corner of the palette),
          and anything you can&apos;t dance in. Everything else is fair game.
        </p>
      </div>
    </div>
  );
}
