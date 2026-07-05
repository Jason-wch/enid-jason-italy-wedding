import { buildIcs, EVENTS, googleCalendarUrl, WEDDING } from "@/lib/wedding";

export const metadata = {
  title: "Schedule — Enid & Jason",
};

export default function SchedulePage() {
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs())}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(WEDDING.mapsQuery)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(WEDDING.mapsQuery)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-sm text-sage-dark text-center">THE WEEKEND</h1>
      <p className="text-center mt-4 text-xl text-ink/75">
        Three days on Lake Garda — here&apos;s the plan.
      </p>

      <div className="text-center mt-6">
        <a
          href={icsHref}
          download="enid-jason-wedding.ics"
          className="font-pixel text-[10px] px-5 py-3 rounded-full bg-gold/20 hover:bg-gold/30 transition-colors inline-block"
        >
          ⤓ DOWNLOAD ALL EVENTS (.ICS)
        </a>
      </div>

      <div className="mt-10 space-y-6">
        {EVENTS.map((ev) => (
          <div
            key={ev.id}
            className="bg-white/60 border border-gold/25 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <div className="font-pixel text-[10px] text-gold">{ev.day.toUpperCase()}</div>
            <h2 className="text-3xl font-semibold mt-2">{ev.title}</h2>
            <div className="text-lg text-ink/60 mt-1">{ev.timeLabel}</div>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">{ev.description}</p>
            <a
              href={googleCalendarUrl(ev)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 font-pixel text-[10px] px-4 py-3 rounded-full bg-sage text-cream hover:bg-sage-dark transition-colors"
            >
              + ADD TO GOOGLE CALENDAR
            </a>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="font-pixel text-sm text-sage-dark text-center">GETTING THERE</h2>
        <p className="text-center mt-4 text-lg text-ink/75">
          {WEDDING.venue} · {WEDDING.venueAddress}
        </p>
        <div className="mt-6 rounded-2xl overflow-hidden border-4 border-gold/30 shadow-lg aspect-[4/3] sm:aspect-video">
          <iframe
            src={mapsEmbed}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map of Villa Sostaga, Gargnano, Lake Garda"
          />
        </div>
        <div className="text-center mt-5">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[10px] px-5 py-3 rounded-full bg-lake-deep text-cream hover:opacity-90 transition-opacity inline-block"
          >
            OPEN IN GOOGLE MAPS →
          </a>
        </div>
      </div>
    </div>
  );
}
