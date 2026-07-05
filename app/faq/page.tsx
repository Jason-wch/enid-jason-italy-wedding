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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-sm text-sage-dark text-center">FAQ</h1>
      <p className="text-center mt-4 text-xl text-ink/75">
        Everything you might be wondering about the weekend.
      </p>
      <div className="mt-10 space-y-4">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group bg-white/60 border border-gold/25 rounded-2xl px-6 py-5 open:shadow-sm"
          >
            <summary className="text-xl font-semibold cursor-pointer list-none flex justify-between items-center gap-4">
              {f.q}
              <span className="font-pixel text-sm text-sage-dark group-open:rotate-90 transition-transform">
                ▶
              </span>
            </summary>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="text-center mt-10 text-ink/60">
        Something else on your mind? Write it in your RSVP message and we&apos;ll get back to
        you.
      </p>
    </div>
  );
}
