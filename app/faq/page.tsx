import Reveal from "@/components/Reveal";
import { OrnamentRule } from "@/components/decor";

export const metadata = {
  title: "FAQ — Enid & Jason",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Which airport should I fly into?",
    a: "Verona (VRN) is closest at about 1 hour by car. Milan Bergamo (BGY) is ~1.5 hours, and Milan Malpensa (MXP) or Linate (LIN) are ~2.5 hours. Venice (VCE) is also an option at ~2 hours.",
  },
  {
    q: "How do I get to Villa Sostaga?",
    a: "The villa sits above Gargnano on the western shore of Lake Garda. Renting a car is easiest (there is free parking at the villa). Taxis and private transfers can be arranged from Verona — let us know if you'd like help coordinating a shared transfer.",
  },
  {
    q: "Where should I stay?",
    a: "There are a limited number of rooms at Villa Sostaga itself — contact us to check availability. Otherwise Gargnano, Bogliaco and Toscolano-Maderno (10–15 minutes away) have lovely hotels and apartments.",
  },
  {
    q: "What's the weather like in late April?",
    a: "Spring on Lake Garda is mild: usually 12–20°C (54–68°F), sunny with a chance of showers. Evenings by the lake can be cool, so bring a jacket or wrap.",
  },
  {
    q: "Are children welcome?",
    a: "We love your little ones, but the wedding day itself is adults-only. Babes in arms are always welcome — talk to us and we'll make it work.",
  },
  {
    q: "When should I RSVP by?",
    a: "Please RSVP by 31 December 2026 so we can finalise numbers with the villa. Don't forget to build your pixel character while you're at it!",
  },
  {
    q: "What language will the ceremony be in?",
    a: "English, with a sprinkle of Italian for flavour. No translation headsets required.",
  },
  {
    q: "Is there a dress code?",
    a: "Yes — garden formal. Check the Dress Code page for the full rundown and colour palette.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Domande</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          Questions &amp; <span className="display-italic">answers</span>
        </h1>
        <p className="mt-6 text-xl italic text-ink/60">
          Everything you might be wondering about the weekend.
        </p>
      </Reveal>

      <div className="mt-16 border-t border-ink/10">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={Math.min(i * 60, 240)}>
            <details className="group border-b border-ink/10 open:bg-parchment/50 transition-colors duration-500">
              <summary className="cursor-pointer list-none flex justify-between items-center gap-6 py-7 group-open:px-4 transition-[padding] duration-500">
                <span className="font-heading text-2xl sm:text-[1.7rem] leading-snug group-hover:text-verde transition-colors duration-500">
                  {f.q}
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/60 font-heading text-xl text-gold transition-transform duration-500 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-8 -mt-1 text-xl leading-relaxed text-ink/75 max-w-2xl group-open:px-4">
                {f.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center mt-14">
        <OrnamentRule className="mb-8" />
        <p className="italic text-lg text-ink/55">
          Altre domande? Write it in your RSVP message — vi risponderemo presto.
        </p>
      </Reveal>
    </div>
  );
}
