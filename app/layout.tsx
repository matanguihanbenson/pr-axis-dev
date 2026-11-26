import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const description =
  "pr-axis is an independent studio building passive-income products: games, apps, and creative work. Built once, maintained with care, made to earn.";

export const metadata: Metadata = {
  title: "pr-axis — coming soon",
  description,
  alternates: {
    canonical: "https://pr-axisdev.com/",
  },
  openGraph: {
    type: "website",
    siteName: "pr-axis",
    title: "pr-axis — coming soon",
    description,
    url: "https://pr-axisdev.com/",
  },
  twitter: {
    card: "summary",
    title: "pr-axis — coming soon",
    description,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "pr-axis",
  url: "https://pr-axisdev.com/",
  description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
