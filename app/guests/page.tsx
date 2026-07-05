import Link from "next/link";
import GuestMap from "@/components/GuestMap";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Guest Map — Enid & Jason",
};

export default function GuestsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="eyebrow eyebrow-rule">Gli ospiti</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">Guest map</h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-2xl mx-auto">
          Everyone who has RSVP&apos;d is already hanging out in the villa gardens. RSVP to
          drop your own character onto the map — new arrivals appear live!
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-14">
        <div className="p-2 bg-white shadow-[0_30px_80px_-30px_rgba(35,32,27,0.4)]">
          <GuestMap />
        </div>
      </Reveal>

      <Reveal delay={160} className="text-center mt-12">
        <Link href="/rsvp" className="btn btn-dark">
          RSVP to join the map
        </Link>
      </Reveal>
    </div>
  );
}
