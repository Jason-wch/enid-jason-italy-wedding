import type { Metadata } from "next";
import "./globals.css";
import { MusicProvider } from "@/components/MusicProvider";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Enid & Jason — Lake Garda, 23–25 April 2027",
  description:
    "Join Enid & Jason at Villa Sostaga Boutique Hotel on Lake Garda, Italy, 23–25 April 2027. RSVP, build your pixel character, and find all the wedding details.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <MusicProvider>
          <SiteChrome>{children}</SiteChrome>
        </MusicProvider>
      </body>
    </html>
  );
}
