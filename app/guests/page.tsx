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
        <p className="eyebrow eyebrow-rule">The Guests</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          The guest <span className="display-italic">garden</span>
        </h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-2xl mx-auto">
          Everyone who has RSVP&apos;d is already in the villa garden, under the sun. RSVP
          to drop your own character onto the map — new arrivals appear live!
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-14">
        <GuestMap />
      </Reveal>

      <Reveal delay={160} className="text-center mt-12">
        <Link href="/rsvp" className="btn btn-dark">
          RSVP to join the map
        </Link>
      </Reveal>
    </div>
  );
}
