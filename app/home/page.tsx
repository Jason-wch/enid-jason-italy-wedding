import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import { WEDDING } from "@/lib/wedding";
import PhotoPlaceholder from "@/components/decor/PhotoPlaceholder";

export const metadata = {
  title: "Home — Enid & Jason, Lake Garda 2027",
};

export default function HomePage() {
  return (
    <div>
      {/* Hero — full-bleed photograph, statement bottom-left */}
      <section className="relative h-[88vh] min-h-[540px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Villa Sostaga gardens overlooking Lake Garda"
            fill
            priority
            className="object-cover animate-ken-burns"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-ink/15" />

        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-12 pb-12 sm:pb-16 text-cream">
          <h1
            className="font-heading text-[11vw] sm:text-6xl md:text-7xl leading-[1.05] max-w-3xl animate-hero-in"
            style={{ animationDelay: "0.3s" }}
          >
            Oh beloved places,
            <br />
            we have found ours.
          </h1>
          <p
            className="font-heading italic text-xl sm:text-2xl mt-6 text-cream/90 animate-hero-in"
            style={{ animationDelay: "0.6s" }}
          >
            Enid &amp; Jason — {WEDDING.dates}, {WEDDING.venue}
          </p>
        </div>

        <div className="absolute bottom-6 right-6 sm:right-10 text-cream/80 animate-scroll-cue">
          <span className="text-2xl leading-none">↓</span>
        </div>
      </section>

      {/* Editorial statement */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-20">
        <Reveal>
          <p className="font-heading text-3xl sm:text-[2.6rem] leading-[1.35] max-w-4xl">
            We&apos;re getting married on Lake Garda. In April 2027, {WEDDING.venue} — a
            yellow villa perched above the water in Gargnano — becomes a place of the
            heart for our friends, for love and leisure, for the pleasures of the table
            and the Italian art of dolce far niente. It is yours for a long weekend.
            Welcome, benvenuti.
          </p>
        </Reveal>
        <Reveal delay={150} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
          <div className="flex items-baseline gap-4">
            <Countdown />
          </div>
          <Link href="/rsvp" className="btn btn-dark">
            RSVP
          </Link>
        </Reveal>
      </section>

      <div className="hairline max-w-7xl mx-auto" />

      {/* Three-column grid with dash captions */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { label: "La Villa", ph: "Villa Sostaga — photo to come" },
            { label: "Il Lago", ph: "Lake Garda — photo to come" },
            { label: "Gli Sposi", ph: "The two of us — photo to come" },
          ].map((tile, i) => (
            <Reveal key={tile.label} delay={i * 120} className="reveal">
              <PhotoPlaceholder label={tile.ph} className="aspect-[3/4]" />
              <p className="photo-caption font-heading text-2xl text-ink/85">{tile.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 50/50 editorial pair */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="grid sm:grid-cols-[2fr_3fr] gap-10 sm:gap-14 items-start">
          <Reveal>
            <PhotoPlaceholder label="Aperitivo — photo to come" className="aspect-[4/5]" />
            <h3 className="font-heading text-3xl sm:text-4xl mt-8">A dash of la dolce vita</h3>
            <p className="body-sans mt-4 max-w-md">
              Three days of sunshine, spritzes and slow lunches: a welcome aperitivo on
              Friday evening, the ceremony and a very long dinner on Saturday, and a
              farewell brunch on Sunday morning before you drift back down the lake.
            </p>
            <Link href="/schedule" className="dash-link mt-6">
              See the weekend
            </Link>
          </Reveal>
          <Reveal delay={140}>
            <PhotoPlaceholder label="The gardens — photo to come" className="aspect-[16/10]" />
            <h3 className="font-heading text-3xl sm:text-4xl mt-8">
              La villeggiatura is a great Italian tradition…
            </h3>
            <p className="body-sans mt-4 max-w-2xl">
              In centuries past, Italian families would move to the lake for the whole
              season — friends, family and long tables under the pergola. We are
              borrowing the idea for a weekend. Come early, stay late, and let the lake
              set the pace. Rooms, travel and everything practical are in the FAQ.
            </p>
            <Link href="/faq" className="dash-link mt-6">
              Plan your stay
            </Link>
          </Reveal>
        </div>
      </section>

      <div className="hairline max-w-7xl mx-auto" />

      {/* A love letter — story section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid sm:grid-cols-2 gap-10 sm:gap-16 items-center">
          <Reveal className="order-2 sm:order-1">
            <PhotoPlaceholder label="Our story — photo to come" className="aspect-[4/3]" />
          </Reveal>
          <Reveal delay={120} className="order-1 sm:order-2">
            <h2 className="font-heading text-4xl sm:text-5xl leading-tight">
              A love letter to Lake Garda
            </h2>
            <p className="eyebrow mt-4">La nostra storia</p>
            <p className="font-heading text-xl sm:text-2xl leading-relaxed mt-8">
              “Dear friends,
              <br />
              from our first date to a thousand adventures later, we decided the next
              chapter deserved a view.”
            </p>
            <p className="body-sans mt-6 max-w-xl">
              This small but genuine declaration of amore is our invitation: a long
              weekend on the western shore of Lake Garda, with all of our favourite
              people in one yellow villa. Non vediamo l&apos;ora — we can&apos;t wait to
              see you there.
            </p>
            <Link href="/rsvp" className="btn btn-dark mt-10">
              RSVP now
            </Link>
          </Reveal>
        </div>
      </section>

      <div className="hairline max-w-7xl mx-auto" />

      {/* The weekend, in brief */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
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
              <span className="font-heading italic text-2xl sm:text-3xl text-stone">{d.n}</span>
              <div>
                <p
                  className="font-sans text-[0.62rem] font-medium tracking-[0.3em] uppercase text-stone"
                  style={{ textIndent: "0.3em" }}
                >
                  {d.day} April
                </p>
                <p className="font-heading text-3xl sm:text-4xl mt-2 group-hover:text-stone transition-colors duration-500">
                  {d.what}
                </p>
              </div>
              <span className="font-heading italic text-lg text-stone">{d.time}</span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150} className="text-center mt-14">
          <Link href="/schedule" className="btn btn-dark">
            Full schedule, maps &amp; calendar
          </Link>
        </Reveal>
      </section>

      <div className="hairline max-w-7xl mx-auto" />

      {/* The pixel garden */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid sm:grid-cols-2 gap-10 sm:gap-16 items-center">
          <Reveal>
            <p className="eyebrow">Un piccolo gioco</p>
            <h2 className="font-heading text-4xl sm:text-5xl mt-5 leading-tight">
              The pixel garden
            </h2>
            <p className="body-sans mt-6 max-w-xl">
              Every guest who RSVPs designs a little pixel character, and they all hang
              out together in the villa gardens — live. There is also a tiny welcome
              game: walk along the shore and dive into Lake Garda. Un po&apos; di magia.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              <Link href="/guests" className="dash-link">
                Visit the guest garden
              </Link>
              <Link href="/" className="dash-link">
                Play the welcome game
              </Link>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <PhotoPlaceholder
              label="Pixel guest garden — see it live on the guest map"
              className="aspect-[16/10]"
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
