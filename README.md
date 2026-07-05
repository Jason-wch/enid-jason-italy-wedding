# Enid & Jason — Lake Garda Wedding Website

Wedding website for **23–25 April 2027 at Villa Sostaga Boutique Hotel, Lake Garda, Italy**, with a MapleStory-style welcome minigame, a pixel character builder, a live guest map, and a spreadsheet-style RSVP admin view.

## Features

- **Welcome minigame** (`/`) — side-scrolling pixel game: walk your character past cypress trees and the villa, and dive into Lake Garda to enter the site. Arrow keys / WASD + space; touch controls on mobile; skip button.
- **Homepage** (`/home`) — hero photo, countdown, story/photo/video sections.
- **RSVP + character builder** (`/rsvp`) — guests RSVP and design their own pixel character (skin, hair, outfit, colors). Saved to Supabase in real time.
- **Live guest map** (`/guests`) — every attending guest's character hangs out in the villa gardens; new RSVPs pop in live via Supabase Realtime.
- **Schedule** (`/schedule`) — weekend itinerary with Add-to-Google-Calendar links, an `.ics` download, and an embedded Google Map of the venue.
- **FAQ / Dress code / Registry** — separate content pages.
- **Admin sheet** (`/admin`) — password-protected, Google-Sheets-style editable table of all RSVPs with live refresh and CSV export.
- **Background music** — built-in chiptune loop with a mute toggle; drop your own `public/audio/bgm.mp3` to replace it.

Everything works in **demo mode** (localStorage) before Supabase is configured, so you can preview the whole site immediately.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Connect Supabase (real RSVPs)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste the contents of [`supabase/setup.sql`](supabase/setup.sql), and run it.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — keep this secret, server-only)
   - `ADMIN_PASSWORD` for the `/admin` page
4. Restart `npm run dev`. RSVPs now flow into the `rsvps` table and appear live on the guest map and admin sheet.

Security model: guests can only *insert* RSVPs (RLS). All reads go through server API routes — the public guest map endpoint exposes only name, character and map position; the full sheet requires the admin password.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the four environment variables from `.env.local` in the Vercel project settings.
4. Deploy.

## Customizing

| What | Where |
|---|---|
| Names, dates, venue, schedule events | [`lib/wedding.ts`](lib/wedding.ts) |
| Story text, photos, video | [`app/home/page.tsx`](app/home/page.tsx) + `public/images/` |
| FAQ answers | [`app/faq/page.tsx`](app/faq/page.tsx) |
| Dress code | [`app/dress-code/page.tsx`](app/dress-code/page.tsx) |
| Registry funds/links | [`app/registry/page.tsx`](app/registry/page.tsx) |
| Background music | drop `public/audio/bgm.mp3` (loops automatically) |
| Character sprites & colors | [`lib/pixel/sprites.ts`](lib/pixel/sprites.ts) |
| Game scenery | [`lib/pixel/scenery.ts`](lib/pixel/scenery.ts) |

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Realtime) · HTML5 canvas pixel art (original MapleStory-inspired sprites — no Nexon assets)
