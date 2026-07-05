# Enid & Jason — Lake Garda Wedding Website

Wedding website for **23–25 April 2027 at Villa Sostaga Boutique Hotel, Lake Garda, Italy**, with a MapleStory-style welcome minigame, a pixel character builder, a live guest map, and a spreadsheet-style RSVP admin view.

## Features

- **Welcome minigame** (`/`) — side-scrolling pixel game: walk your character past cypress trees and the villa, and dive into Lake Garda to enter the site. Arrow keys / WASD + space; touch controls on mobile; skip button.
- **Homepage** (`/home`) — hero photo, countdown, story/photo/video sections.
- **RSVP by name + party** (`/rsvp`) — guests type their full name to find their invitation, then RSVP for everyone in their party at once and design a pixel character (skin, hair, outfit, colors) for each attendee. Saved to Supabase in real time.
- **Live guest map** (`/guests`) — every attending guest's character hangs out in the villa gardens; new RSVPs pop in live via Supabase Realtime.
- **Schedule** (`/schedule`) — weekend itinerary with Add-to-Google-Calendar links, an `.ics` download, and an embedded Google Map of the venue.
- **FAQ / Dress code / Registry** — separate content pages.
- **Guest-list admin** (`/admin`) — password-protected. Create parties (households), add/edit/remove guests, watch RSVPs arrive live, and export the whole list to CSV.
- **Background music** — built-in chiptune loop with a mute toggle; drop your own `public/audio/bgm.mp3` to replace it.

- **Password gate** — the entire site is protected by a shared `SITE_PASSWORD`; visitors enter it once at `/enter` to get in.

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
   - `SITE_PASSWORD` — the password guests type to enter the whole site (defaults to `garda2027` if unset)
4. Restart `npm run dev`. Then open `/admin`, add your parties and guests, and RSVPs will flow into the `guests` table and appear live on the guest map and admin view.

Data model: a `parties` table (invited households) and a `guests` table (individual invitees, each linked to a party). Guests look themselves up by full name and RSVP for their whole party.

Security model: both tables have RLS enabled with no public policies — all reads and writes go through server API routes using the service role key. The public guest-map endpoint exposes only name, character and map position; managing the guest list requires the admin password.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.local` in the Vercel project settings.
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
