import Reveal from "@/components/Reveal";
import { buildIcs, EVENTS, googleCalendarUrl, WEDDING } from "@/lib/wedding";
import { LemonSprig, OliveBranch, Monogram, OrnamentRule } from "@/components/decor";

export const metadata = {
  title: "Schedule — Enid & Jason",
};

const DAY_ART = [
  <LemonSprig key="fri" width={58} className="opacity-90" />,
  <Monogram key="sat" size={34} className="text-verde" />,
  <OliveBranch key="sun" width={70} className="opacity-90" />,
];

export default function SchedulePage() {
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs())}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(WEDDING.mapsQuery)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(WEDDING.mapsQuery)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Il programma</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          The <span className="display-italic">weekend</span>
        </h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-xl mx-auto">
          Three days on Lake Garda — ecco il programma.
        </p>
        <div className="mt-8">
          <a href={icsHref} download="enid-jason-wedding.ics" className="btn btn-ghost">
            ⤓ Download all events (.ics)
          </a>
        </div>
      </Reveal>

      {/* Timeline with a spine */}
      <div className="mt-20 relative">
        {/* Vertical spine (sm+) */}
        <div
          className="hidden sm:block absolute left-[3.5rem] top-0 bottom-0 w-px bg-ink/10"
          aria-hidden="true"
        />
        {EVENTS.map((ev, i) => (
          <Reveal
            key={ev.id}
            delay={i * 80}
            className="group relative grid sm:grid-cols-[7rem_1fr] gap-6 sm:gap-12 py-12 border-b border-ink/10 first:border-t sm:border-0"
          >
            {/* Leaf node on the spine (sm+) */}
            <span
              className="hidden sm:block absolute left-[3.5rem] top-[3.6rem] -translate-x-1/2"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 1 L 12 7 L 7 13 L 2 7 Z" fill="var(--color-gold)" />
              </svg>
            </span>
            <div className="flex sm:flex-col items-baseline sm:items-start gap-3 sm:bg-cream sm:relative sm:z-10 sm:pb-3">
              <span className="display-italic text-4xl text-terracotta/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.68rem] tracking-[0.3em] uppercase text-ink/45 sm:mt-2">
                {ev.day}
              </span>
              <span className="hidden sm:block sm:mt-4">{DAY_ART[i % DAY_ART.length]}</span>
            </div>
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl leading-tight group-hover:text-verde transition-colors duration-500">
                {ev.title}
              </h2>
              <p className="mt-3 italic text-lg text-ink/55">{ev.timeLabel}</p>
              <p className="mt-5 text-xl leading-relaxed text-ink/80 max-w-2xl">
                {ev.description}
              </p>
              <a
                href={googleCalendarUrl(ev)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 text-[0.72rem] tracking-[0.3em] uppercase text-ink/60 border-b border-gold/50 pb-1 hover:text-verde hover:border-gold transition-colors"
              >
                + Add to Google Calendar
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <OrnamentRule className="mt-10" />

      {/* Getting there */}
      <div className="mt-24">
        <Reveal className="text-center">
          <p className="eyebrow eyebrow-rule">Come arrivare</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-6">
            Getting <span className="display-italic">there</span>
          </h2>
          <p className="mt-5 text-lg italic text-ink/60">
            {WEDDING.venue} · {WEDDING.venueAddress}
          </p>
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
          <p className="mt-4 text-center italic text-lg text-ink/55">
            Villa Sostaga, Gargnano — sul Lago di Garda
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
