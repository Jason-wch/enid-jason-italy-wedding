import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import { WEDDING } from "@/lib/wedding";

export const metadata = {
  title: "Home — Enid & Jason, Lake Garda 2027",
};

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[480px]">
        <Image
          src="/images/hero.png"
          alt="Villa Sostaga gardens overlooking Lake Garda"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-4 text-center text-cream">
          <p className="font-pixel text-xs sm:text-sm tracking-widest drop-shadow">
            WE&apos;RE GETTING MARRIED!
          </p>
          <h1 className="text-5xl sm:text-7xl font-semibold mt-4 drop-shadow-lg">
            Enid <span className="text-villa">&amp;</span> Jason
          </h1>
          <p className="text-xl sm:text-2xl mt-4 italic drop-shadow">
            {WEDDING.dates} · {WEDDING.venue} · {WEDDING.location}
          </p>
          <div className="mt-8">
            <Countdown />
          </div>
          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <Link
              href="/rsvp"
              className="font-pixel text-sm px-6 py-4 rounded-full bg-sage text-cream hover:bg-sage-dark transition-colors shadow-lg"
            >
              RSVP &amp; BUILD YOUR CHARACTER
            </Link>
            <Link
              href="/"
              className="font-pixel text-sm px-6 py-4 rounded-full bg-cream/90 text-ink hover:bg-cream transition-colors shadow-lg"
            >
              ▶ PLAY THE WELCOME GAME
            </Link>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-pixel text-sm text-sage-dark tracking-wide">OUR STORY</h2>
        <p className="mt-6 text-xl leading-relaxed text-ink/85">
          From our first date to a thousand adventures later, we&apos;ve decided the next
          chapter deserves a view. Join us for a long weekend of sunshine, spritzes and
          celebration on the shores of Lake Garda — at the beautiful {WEDDING.venue},
          perched above the water in Gargnano, Italy.
        </p>
        <p className="mt-4 text-xl leading-relaxed text-ink/85">
          Three days. One yellow villa. All of our favourite people. We can&apos;t wait to
          see you there.
        </p>
        <p className="mt-6 text-ink/50 italic">
          (Replace this text with your own story — and add more photos and videos below!)
        </p>
      </section>

      {/* Photos */}
      <section className="bg-parchment py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-pixel text-sm text-sage-dark tracking-wide text-center">PHOTOS</h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] col-span-2 sm:col-span-2 rounded-xl overflow-hidden shadow">
              <Image
                src="/images/hero.png"
                alt="Villa Sostaga"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {[
              "Add your engagement photos",
              "Trips together",
              "The proposal",
              "Friends & family",
            ].map((caption) => (
              <div
                key={caption}
                className="aspect-[4/3] rounded-xl bg-cream border-2 border-dashed border-sage/40 flex items-center justify-center text-center p-4 text-ink/50"
              >
                <span>
                  {caption}
                  <br />
                  <span className="text-sm">
                    (drop images in <code>public/images</code>)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-pixel text-sm text-sage-dark tracking-wide">VIDEO</h2>
        <div className="mt-8 aspect-video rounded-xl bg-ink/90 text-cream flex flex-col items-center justify-center gap-3 shadow-lg">
          <span className="font-pixel text-sm">▶ YOUR VIDEO HERE</span>
          <span className="text-cream/60 text-base px-8">
            Paste a YouTube/Vimeo embed here, or drop an .mp4 into{" "}
            <code className="text-cream/80">public/videos</code> and swap this block for a
            &lt;video&gt; tag.
          </span>
        </div>
      </section>

      {/* Weekend teaser */}
      <section className="bg-sage/15 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-pixel text-sm text-sage-dark tracking-wide">THE WEEKEND</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { day: "FRI 23", what: "Welcome Aperitivo", time: "5 PM" },
              { day: "SAT 24", what: "Ceremony & Party", time: "3 PM – late" },
              { day: "SUN 25", what: "Farewell Brunch", time: "10:30 AM" },
            ].map((d) => (
              <div key={d.day} className="bg-cream rounded-xl p-6 shadow-sm border border-gold/20">
                <div className="font-pixel text-sm text-gold">{d.day}</div>
                <div className="text-2xl font-semibold mt-3">{d.what}</div>
                <div className="text-ink/60 mt-1">{d.time}</div>
              </div>
            ))}
          </div>
          <Link
            href="/schedule"
            className="inline-block mt-8 font-pixel text-sm px-6 py-4 rounded-full bg-terracotta text-cream hover:opacity-90 transition-opacity shadow"
          >
            FULL SCHEDULE + MAPS &amp; CALENDAR
          </Link>
        </div>
      </section>
    </div>
  );
}
