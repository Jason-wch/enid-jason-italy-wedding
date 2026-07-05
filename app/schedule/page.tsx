import Reveal from "@/components/Reveal";
import { buildIcs, EVENTS, googleCalendarUrl, WEDDING } from "@/lib/wedding";

export const metadata = {
  title: "Schedule — Enid & Jason",
};

export default function SchedulePage() {
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs())}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(WEDDING.mapsQuery)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(WEDDING.mapsQuery)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Il programma</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">The weekend</h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-xl mx-auto">
          Three days on Lake Garda — here&apos;s the plan.
        </p>
        <div className="mt-8">
          <a href={icsHref} download="enid-jason-wedding.ics" className="btn btn-ghost">
            ⤓ Download all events (.ics)
          </a>
        </div>
      </Reveal>

      {/* Timeline */}
      <div className="mt-20">
        {EVENTS.map((ev, i) => (
          <Reveal
            key={ev.id}
            delay={i * 80}
            className="group grid sm:grid-cols-[7rem_1fr] gap-6 sm:gap-12 py-12 border-b border-ink/10 first:border-t"
          >
            <div className="flex sm:flex-col items-baseline sm:items-start gap-3">
              <span className="font-heading text-4xl text-gold/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.68rem] tracking-[0.3em] uppercase text-ink/45 sm:mt-2">
                {ev.day}
              </span>
            </div>
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl leading-tight group-hover:text-sage-dark transition-colors duration-500">
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
                className="inline-block mt-6 text-[0.72rem] tracking-[0.3em] uppercase text-ink/60 border-b border-gold/50 pb-1 hover:text-ink hover:border-gold transition-colors"
              >
                + Add to Google Calendar
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Getting there */}
      <div className="mt-28">
        <Reveal className="text-center">
          <p className="eyebrow eyebrow-rule">Come arrivare</p>
          <h2 className="font-heading text-4xl sm:text-5xl mt-6">Getting there</h2>
          <p className="mt-5 text-lg italic text-ink/60">
            {WEDDING.venue} · {WEDDING.venueAddress}
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <div className="p-2 bg-white shadow-[0_30px_80px_-30px_rgba(35,32,27,0.4)]">
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
        </Reveal>
        <Reveal delay={180} className="text-center mt-10">
          <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
            Open in Google Maps →
          </a>
        </Reveal>
      </div>
    </div>
  );
}
