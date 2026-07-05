export const WEDDING = {
  couple: "Enid & Jason",
  bride: "Enid",
  groom: "Jason",
  dates: "23–25 April 2027",
  startDateISO: "2027-04-23T17:00:00+02:00",
  venue: "Villa Sostaga Boutique Hotel",
  venueAddress: "Via Sostaga 19, 25084 Gargnano, Lake Garda, Italy",
  location: "Lake Garda, Italy",
  mapsQuery: "Villa Sostaga Boutique Hotel, Via Sostaga 19, Gargnano, Italy",
};

export type WeddingEvent = {
  id: string;
  day: string;
  title: string;
  description: string;
  /** Local Italy time, e.g. "20270423T170000" */
  start: string;
  end: string;
  timeLabel: string;
};

export const EVENTS: WeddingEvent[] = [
  {
    id: "aperitivo",
    day: "Friday 23 April 2027",
    title: "Welcome Aperitivo",
    description:
      "Kick off the weekend with spritzes and lake views on the villa terrace. Casual and relaxed — come say ciao!",
    start: "20270423T170000",
    end: "20270423T200000",
    timeLabel: "5:00 PM – 8:00 PM",
  },
  {
    id: "ceremony",
    day: "Saturday 24 April 2027",
    title: "Wedding Ceremony & Reception",
    description:
      "The main event! Ceremony in the villa gardens overlooking Lake Garda, followed by cocktails, dinner and dancing until late.",
    start: "20270424T150000",
    end: "20270425T000000",
    timeLabel: "3:00 PM – late",
  },
  {
    id: "brunch",
    day: "Sunday 25 April 2027",
    title: "Farewell Brunch",
    description:
      "One last lazy morning together — coffee, cornetti and goodbyes before everyone heads home.",
    start: "20270425T103000",
    end: "20270425T130000",
    timeLabel: "10:30 AM – 1:00 PM",
  },
];

export function googleCalendarUrl(event: WeddingEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${WEDDING.couple} Wedding — ${event.title}`,
    dates: `${event.start}/${event.end}`,
    ctz: "Europe/Rome",
    details: event.description,
    location: WEDDING.venueAddress,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Italy is CEST (UTC+2) in April. Converts "20270423T170000" local to UTC ics stamp. */
function toUtcStamp(local: string): string {
  const y = +local.slice(0, 4);
  const mo = +local.slice(4, 6);
  const d = +local.slice(6, 8);
  const h = +local.slice(9, 11);
  const mi = +local.slice(11, 13);
  const utc = new Date(Date.UTC(y, mo - 1, d, h - 2, mi));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${utc.getUTCFullYear()}${p(utc.getUTCMonth() + 1)}${p(utc.getUTCDate())}T${p(utc.getUTCHours())}${p(utc.getUTCMinutes())}00Z`;
}

export function buildIcs(): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Enid & Jason Wedding//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const ev of EVENTS) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@enidandjason2027`,
      `DTSTAMP:${toUtcStamp(EVENTS[0].start)}`,
      `DTSTART:${toUtcStamp(ev.start)}`,
      `DTEND:${toUtcStamp(ev.end)}`,
      `SUMMARY:${WEDDING.couple} Wedding — ${ev.title}`,
      `DESCRIPTION:${ev.description.replace(/,/g, "\\,")}`,
      `LOCATION:${WEDDING.venueAddress.replace(/,/g, "\\,")}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
