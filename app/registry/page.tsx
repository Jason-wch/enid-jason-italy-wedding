import Image from "next/image";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Gift Registry — Enid & Jason",
};

const FUNDS = [
  {
    n: "01",
    title: "Honeymoon Fund",
    text: "Help us set sail on the adventure after the adventure — flights, boat rides and one very nice hotel breakfast.",
    src: "/images/couple-night-riverside.jpg",
    alt: "Enid and Jason at night",
  },
  {
    n: "02",
    title: "Date Nights Forever",
    text: "Contribute to a lifetime supply of dinner dates, from Gargnano trattorias to our kitchen at home.",
    src: "/images/couple-portrait-close.jpg",
    alt: "Enid and Jason",
  },
  {
    n: "03",
    title: "Our First Home",
    text: "Every brick counts. Help us build the place where all our friends will crash after the next party.",
    src: "/images/couple-alps-cabin.jpg",
    alt: "Enid and Jason by a mountain cabin",
  },
];

export default function RegistryPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">The Gifts</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">Registry</h1>
      </Reveal>

      <Reveal delay={100} className="text-center mt-12 max-w-2xl mx-auto">
        <p className="font-heading text-3xl sm:text-4xl leading-snug">
          Your presence at Lake Garda is truly the greatest gift.
        </p>
        <p className="body-sans mt-6">
          Many of you are crossing oceans to be there, and that means the world to us. If
          you&apos;d still like to give something, a contribution to one of these funds would
          make us very happy.
        </p>
      </Reveal>

      <div className="mt-20 grid sm:grid-cols-3 gap-8">
        {FUNDS.map((f, i) => (
          <Reveal key={f.title} delay={i * 100}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={f.src} alt={f.alt} fill className="object-cover" />
            </div>
            <div className="photo-caption font-heading italic text-xl text-stone">{f.n}</div>
            <h2 className="font-heading text-3xl mt-2 leading-tight">{f.title}</h2>
            <p className="body-sans mt-4">{f.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-20 text-center border-t border-ink/10 pt-12">
        <p className="body-sans max-w-xl mx-auto">
          Bank transfer and payment details will be shared here closer to the date — or
          replace this block with links to your registry of choice (Prezola, Zola, Amazon,
          etc.).
        </p>
      </Reveal>
    </div>
  );
}
