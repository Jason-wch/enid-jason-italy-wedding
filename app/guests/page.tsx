import Link from "next/link";
import GuestMap from "@/components/GuestMap";

export const metadata = {
  title: "Guest Map — Enid & Jason",
};

export default function GuestsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-sm text-sage-dark text-center">GUEST MAP</h1>
      <p className="text-center mt-4 text-xl text-ink/75 max-w-2xl mx-auto">
        Everyone who has RSVP&apos;d is already hanging out in the villa gardens. RSVP to
        drop your own character onto the map — new arrivals appear live!
      </p>
      <div className="mt-8">
        <GuestMap />
      </div>
      <div className="text-center mt-8">
        <Link
          href="/rsvp"
          className="font-pixel text-sm px-6 py-4 rounded-full bg-sage text-cream hover:bg-sage-dark transition-colors inline-block"
        >
          RSVP TO JOIN THE MAP
        </Link>
      </div>
    </div>
  );
}
