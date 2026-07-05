import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Gift Registry — Enid & Jason",
};

const FUNDS = [
  {
    n: "01",
    title: "Honeymoon Fund",
    text: "Help us set sail on the adventure after the adventure — flights, boat rides and one very nice hotel breakfast.",
  },
  {
    n: "02",
    title: "Date Nights Forever",
    text: "Contribute to a lifetime supply of pasta dates, from Gargnano trattorias to our kitchen at home.",
  },
  {
    n: "03",
    title: "Our First Home",
    text: "Every brick counts. Help us build the place where all our friends will crash after the next party.",
  },
];

export default function RegistryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">I regali</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">Registry</h1>
      </Reveal>

      <Reveal delay={100} className="text-center mt-12 max-w-2xl mx-auto">
        <p className="font-heading text-2xl sm:text-3xl leading-snug text-ink/85">
          Your presence at Lake Garda is truly the greatest gift.
        </p>
        <p className="mt-6 text-xl leading-relaxed italic text-ink/60">
          Many of you are crossing oceans to be there, and that means the world to us. If
          you&apos;d still like to give something, a contribution to one of these funds would
          make us very happy.
        </p>
      </Reveal>

      <div className="mt-20 grid sm:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
        {FUNDS.map((f, i) => (
          <Reveal
            key={f.title}
            delay={i * 100}
            className="bg-cream p-8 sm:p-10 text-center hover:bg-parchment/70 transition-colors duration-700"
          >
            <div className="font-heading text-3xl text-gold/70">{f.n}</div>
            <h2 className="font-heading text-3xl mt-5 leading-tight">{f.title}</h2>
            <div className="hairline w-10 mx-auto mt-5" />
            <p className="mt-5 text-lg leading-relaxed text-ink/65">{f.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-16 text-center border-t border-ink/10 pt-12">
        <p className="text-lg italic text-ink/55 max-w-xl mx-auto">
          Bank transfer and payment details will be shared here closer to the date — or
          replace this block with links to your registry of choice (Prezola, Zola, Amazon,
          etc.).
        </p>
      </Reveal>
    </div>
  );
}
