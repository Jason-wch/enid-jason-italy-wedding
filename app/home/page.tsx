import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import { WEDDING } from "@/lib/wedding";

export const metadata = {
  title: "Home — Enid & Jason, Lake Garda 2027",
};


export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[92vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Villa Sostaga gardens overlooking Lake Garda"
            fill
            priority
            className="object-cover animate-ken-burns"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-cream">
          <p
            className="eyebrow eyebrow-rule !text-cream/90 animate-hero-in"
            style={{ animationDelay: "0.2s" }}
          >
            We&apos;re getting married
          </p>
          <h1
            className="font-heading mt-8 text-[17vw] sm:text-8xl md:text-9xl leading-[0.95] animate-hero-in"
            style={{ animationDelay: "0.45s" }}
          >
            Enid
            <span className="block font-serif-display italic text-[8vw] sm:text-5xl md:text-6xl text-villa my-2 sm:my-3">
              &amp;
            </span>
            Jason
          </h1>
          <p
            className="mt-8 text-lg sm:text-2xl italic text-cream/90 animate-hero-in"
            style={{ animationDelay: "0.7s" }}
          >
            {WEDDING.dates} · {WEDDING.venue} · {WEDDING.location}
          </p>
          <div className="mt-10 animate-hero-in" style={{ animationDelay: "0.9s" }}>
            <Countdown />
          </div>
          <div className="mt-10 animate-hero-in" style={{ animationDelay: "1.1s" }}>
            <Link href="/rsvp" className="btn btn-light">
              RSVP
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center text-cream/80 animate-scroll-cue">
          <span className="text-2xl leading-none">↓</span>
        </div>
      </section>

      {/* Our story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <Reveal className="md:col-span-4 md:sticky md:top-36">
            <p className="eyebrow">La nostra storia</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5 leading-tight">
              Our story
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
              Three days. One yellow villa. All of our favourite people. We can&apos;t wait to
              see you there.
            </Reveal>
            <Reveal as="p" delay={200} className="text-base italic text-ink/45">
              (Replace this text with your own story — and add more photos and videos below!)
            </Reveal>
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-parchment/70 border-y border-ink/10 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="eyebrow eyebrow-rule">Ricordi</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5">Photos</h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <Reveal as="figure" className="relative col-span-2 aspect-[16/10] overflow-hidden bg-cream shadow-[0_20px_60px_-24px_rgba(35,32,27,0.4)] group">
              <Image
                src="/images/hero.png"
                alt="Villa Sostaga"
                fill
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
              />
              <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/60 to-transparent px-5 pb-4 pt-10 text-cream italic text-lg">
                Villa Sostaga, Gargnano
              </figcaption>
            </Reveal>
            {[
              "Add your engagement photos",
              "Trips together",
              "The proposal",
              "Friends & family",
            ].map((caption, i) => (
              <Reveal
                key={caption}
                delay={i * 90}
                className={`aspect-[4/3] bg-cream border border-ink/10 flex items-center justify-center text-center p-6 text-ink/45 ${
                  i === 0 ? "sm:col-span-1" : ""
                }`}
              >
                <span className="italic text-lg leading-snug">
                  {caption}
                  <br />
                  <span className="not-italic text-sm tracking-[0.15em] uppercase text-ink/30 mt-2 inline-block">
                    drop images in <code className="normal-case">public/images</code>
                  </span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <Reveal>
          <p className="eyebrow eyebrow-rule">Il film</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-5">Video</h2>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <div className="aspect-video bg-ink text-cream flex flex-col items-center justify-center gap-4 shadow-[0_30px_80px_-30px_rgba(35,32,27,0.55)]">
            <span className="font-heading text-3xl tracking-[0.12em]">▶</span>
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
      <section className="border-t border-ink/10 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="eyebrow eyebrow-rule">Il programma</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5">The weekend</h2>
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
                <span className="font-heading text-2xl sm:text-3xl text-gold/70">{d.n}</span>
                <div>
                  <p className="text-[0.7rem] tracking-[0.35em] uppercase text-ink/45">
                    {d.day} April
                  </p>
                  <p className="font-heading text-3xl sm:text-4xl mt-2 group-hover:text-sage-dark transition-colors duration-500">
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
          </Reveal>
        </div>
      </section>
    </div>
  );
}
