import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "zjlfzlzktp");`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
