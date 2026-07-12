import Reveal from "@/components/Reveal";
import { WEDDING } from "@/lib/wedding";

export const metadata = {
  title: "Getting There — Enid & Jason",
};

const AIRPORTS = [
  {
    code: "VRN",
    name: "Verona Villafranca",
    time: "≈ 1 hour by car",
    note: "The closest airport and the easiest arrival — our recommendation.",
  },
  {
    code: "BGY",
    name: "Milan Bergamo",
    time: "≈ 1.5 hours by car",
    note: "Great for low-cost connections from across Europe.",
  },
  {
    code: "VCE",
    name: "Venice Marco Polo",
    time: "≈ 2 hours by car",
    note: "Fly in early and steal a day in Venice on the way.",
  },
  {
    code: "MXP · LIN",
    name: "Milan Malpensa & Linate",
    time: "≈ 2.5 hours by car",
    note: "The best option for long-haul flights.",
  },
];

export default function GettingTherePage() {
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(WEDDING.mapsQuery)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(WEDDING.mapsQuery)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Getting There</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          Getting <span className="display-italic">there</span>
        </h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-xl mx-auto">
          {WEDDING.venue} · {WEDDING.venueAddress}
        </p>
      </Reveal>

      {/* Airports */}
      <div className="mt-20">
        <Reveal className="text-center">
          <p className="eyebrow eyebrow-rule">By Air</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-6">Which airport?</h2>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {AIRPORTS.map((a, i) => (
            <Reveal key={a.code} delay={i * 90}>
              <div className="tile-frame p-7 h-full">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-heading text-3xl">{a.name}</span>
                  <span
                    className="font-sans text-[0.62rem] font-medium tracking-[0.28em] uppercase text-stone shrink-0"
                    style={{ textIndent: "0.28em" }}
                  >
                    {a.code}
                  </span>
                </div>
                <p className="font-heading italic text-lg text-stone mt-2">{a.time}</p>
                <p className="body-sans mt-3">{a.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* By car & transfers */}
      <div className="mt-24 grid sm:grid-cols-2 gap-10 sm:gap-16">
        <Reveal>
          <p className="eyebrow">By Car</p>
          <h3 className="font-heading text-3xl sm:text-4xl mt-4">The scenic drive</h3>
          <p className="body-sans mt-4">
            The villa sits above Gargnano on the western shore of Lake Garda.
            Renting a car is the easiest way to get here — the last stretch winds
            up from the lake through olive groves, and there is free parking at
            the villa.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">Transfers</p>
          <h3 className="font-heading text-3xl sm:text-4xl mt-4">Rather not drive?</h3>
          <p className="body-sans mt-4">
            Taxis and private transfers can be arranged from Verona, and we are
            happy to help coordinate shared transfers between guests landing
            around the same time — just mention it in your RSVP message.
          </p>
        </Reveal>
      </div>

      <div className="hairline mt-24" />

      {/* Map */}
      <div className="mt-20">
        <Reveal className="text-center">
          <p className="eyebrow eyebrow-rule">The Map</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-6">
            Villa <span className="display-italic">Sostaga</span>
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <div className="tile-frame p-3">
            <div className="overflow-hidden aspect-[4/3] sm:aspect-video">
              <iframe
                src={mapsEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map of Villa Sostaga, Gargnano, Lake Garda"
              />
            </div>
          </div>
          <p className="photo-caption justify-center font-heading text-xl text-stone">
            Villa Sostaga, Gargnano — on Lake Garda
          </p>
        </Reveal>
        <Reveal delay={180} className="text-center mt-8">
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
            Open in Google Maps →
          </a>
        </Reveal>
      </div>
    </div>
  );
}
