import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import { WEDDING } from "@/lib/wedding";
import {
  OliveBranch,
  LemonSprig,
  CypressRow,
  LakeScene,
  OrnamentRule,
  ArchWindow,
} from "@/components/decor";

export const metadata = {
  title: "Home — Enid & Jason, Lake Garda 2027",
};

const MARQUEE = "Villa Sostaga · Lago di Garda · 23–25 Aprile 2027 · con amore · ";

export default function HomePage() {
  return (
    <div>
      {/* Hero — cream, editorial, photo in an arch */}
      <section className="relative overflow-hidden px-4 pt-16 sm:pt-20 pb-20 text-center">
        <p
          className="eyebrow eyebrow-rule animate-hero-in"
          style={{ animationDelay: "0.2s" }}
        >
          Ci sposiamo · We&apos;re getting married
        </p>
        <h1
          className="font-heading mt-8 text-[16vw] sm:text-8xl md:text-[7.5rem] leading-[0.95] text-ink animate-hero-in"
          style={{ animationDelay: "0.45s" }}
        >
          Enid
          <span className="display-italic block text-[8vw] sm:text-5xl md:text-6xl text-terracotta my-2 sm:my-3">
            &amp;
          </span>
          Jason
        </h1>
        <p
          className="mt-8 text-lg sm:text-2xl italic text-ink/70 animate-hero-in"
          style={{ animationDelay: "0.7s" }}
        >
          {WEDDING.dates} · {WEDDING.venue} · {WEDDING.location}
        </p>

        {/* Arched, treated photo flanked by botanicals */}
        <div
          className="relative mt-12 mx-auto w-[82vw] max-w-[420px] animate-hero-in"
          style={{ animationDelay: "0.9s" }}
        >
          <OliveBranch
            width={150}
            className="hidden sm:block absolute -left-40 bottom-10 -rotate-12"
          />
          <LemonSprig
            width={120}
            className="hidden sm:block absolute -right-36 bottom-16 rotate-6"
          />
          <div className="arch-frame bg-cream">
            <div className="duotone-photo relative aspect-[3/4]">
              <Image
                src="/images/hero.png"
                alt="Villa Sostaga gardens overlooking Lake Garda"
                fill
                priority
                sizes="(max-width: 640px) 82vw, 420px"
                className="object-cover animate-ken-burns"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 animate-hero-in" style={{ animationDelay: "1.1s" }}>
          <ArchWindow>
            <Countdown />
          </ArchWindow>
        </div>
        <div className="mt-10 animate-hero-in" style={{ animationDelay: "1.25s" }}>
          <Link href="/rsvp" className="btn btn-terracotta">
            RSVP
          </Link>
        </div>

        <div className="mt-14 flex justify-center text-ink/50 animate-scroll-cue">
          <span className="text-2xl leading-none">↓</span>
        </div>
      </section>

      {/* Marquee ribbon */}
      <div className="bg-verde text-cream">
        <div className="stripe-band" style={{ height: 5 }} />
        <div className="marquee py-4" aria-hidden="true">
          <div className="marquee-track">
            <span className="display-italic text-xl sm:text-2xl tracking-wide">
              {MARQUEE.repeat(4)}
            </span>
            <span className="display-italic text-xl sm:text-2xl tracking-wide">
              {MARQUEE.repeat(4)}
            </span>
          </div>
        </div>
        <div className="stripe-band" style={{ height: 5 }} />
      </div>

      {/* Our story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <Reveal className="md:col-span-4 md:sticky md:top-36">
            <p className="eyebrow">La nostra storia</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5 leading-tight">
              Our <span className="display-italic">story</span>
            </h2>
            <div className="hairline w-16 mt-8" />
          </Reveal>
          <div className="md:col-span-8 space-y-7">
            <Reveal as="p" className="dropcap text-xl sm:text-2xl leading-relaxed text-ink/85">
              From our first date to a thousand adventures later, we&apos;ve decided the next
              chapter deserves a view. Join us for a long weekend of sunshine, spritzes and
              celebration on the shores of Lake Garda — at the beautiful {WEDDING.venue},
              perched above the water in Gargnano, Italy.
            </Reveal>
            <Reveal as="p" delay={120} className="text-xl sm:text-2xl leading-relaxed text-ink/85">
              Three days. One yellow villa. All of our favourite people. Non vediamo
              l&apos;ora — we can&apos;t wait to see you there.
            </Reveal>
          </div>
        </div>
        <Reveal delay={200}>
          <OrnamentRule className="mt-20" />
        </Reveal>
      </section>

      {/* Photos */}
      <section className="scallop-top scallop-bottom bg-parchment [--scallop-color:var(--color-parchment)] py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="eyebrow eyebrow-rule">Ricordi</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5">
              A few <span className="display-italic">memories</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
            <Reveal
              as="figure"
              className="relative col-span-2 overflow-hidden group"
            >
              <div className="arch duotone-photo relative aspect-[16/10]">
                <Image
                  src="/images/hero.png"
                  alt="Villa Sostaga"
                  fill
                  sizes="(max-width: 640px) 100vw, 66vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-3 text-center italic text-lg text-ink/60">
                Villa Sostaga, Gargnano
              </figcaption>
            </Reveal>
            {[
              {
                caption: "Add your engagement photos",
                art: <LemonSprig width={90} className="mx-auto" />,
                note: true,
              },
              {
                caption: "Trips together",
                art: <LakeScene className="mx-auto w-40 text-verde" />,
              },
              {
                caption: "The proposal",
                art: <OliveBranch width={110} className="mx-auto" />,
              },
              {
                caption: "Friends & family",
                art: <CypressRow width={120} className="mx-auto" />,
              },
            ].map((tile, i) => (
              <Reveal
                key={tile.caption}
                delay={i * 90}
                className="tile-frame aspect-[4/3] flex flex-col items-center justify-center gap-3 text-center p-6"
              >
                {tile.art}
                <span className="italic text-lg leading-snug text-ink/55">
                  {tile.caption}
                </span>
                {tile.note && (
                  <span className="text-xs tracking-[0.15em] uppercase text-ink/30">
                    drop images in <code className="normal-case">public/images</code>
                  </span>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <Reveal>
          <p className="eyebrow eyebrow-rule">Il film</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-5">
            The <span className="display-italic">film</span>
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <div className="aspect-video bg-verde-deep text-cream flex flex-col items-center justify-center gap-5 shadow-[0_30px_80px_-30px_rgba(47,65,40,0.55)]">
            <span className="inline-flex h-16 w-14 items-end justify-center rounded-t-full border border-cream/50 pb-4">
              <span className="font-heading text-xl">▶</span>
            </span>
            <span className="text-[0.72rem] tracking-[0.35em] uppercase text-cream/80">
              Your video here
            </span>
            <span className="text-cream/50 text-base px-10 max-w-xl font-serif-display italic">
              Paste a YouTube/Vimeo embed here, or drop an .mp4 into{" "}
              <code className="not-italic text-cream/70">public/videos</code> and swap this
              block for a &lt;video&gt; tag.
            </span>
          </div>
        </Reveal>
      </section>

      {/* Weekend teaser */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="eyebrow eyebrow-rule">Il programma</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5">
              The <span className="display-italic">weekend</span>
            </h2>
          </Reveal>

          <div className="mt-16">
            {[
              { n: "01", day: "Friday 23", what: "Welcome Aperitivo", time: "5 PM" },
              { n: "02", day: "Saturday 24", what: "Ceremony & Party", time: "3 PM – late" },
              { n: "03", day: "Sunday 25", what: "Farewell Brunch", time: "10:30 AM" },
            ].map((d, i) => (
              <Reveal
                key={d.n}
                delay={i * 100}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 sm:gap-10 py-8 border-b border-ink/10 first:border-t"
              >
                <span className="display-italic text-2xl sm:text-3xl text-terracotta/80">
                  {d.n}
                </span>
                <div>
                  <p className="text-[0.7rem] tracking-[0.35em] uppercase text-ink/45">
                    {d.day} April
                  </p>
                  <p className="font-heading text-3xl sm:text-4xl mt-2 group-hover:text-verde transition-colors duration-500">
                    {d.what}
                  </p>
                </div>
                <span className="italic text-lg text-ink/55">{d.time}</span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150} className="text-center mt-14">
            <Link href="/schedule" className="btn btn-dark">
              Full schedule + maps &amp; calendar
            </Link>
            <div className="mt-14 flex justify-center opacity-80">
              <CypressRow width={170} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
