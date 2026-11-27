import type { Metadata } from "next";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { SocialFeed } from "@/components/demos/social-feed";
import { PackageSummary } from "@/components/package-summary";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("social-media")!;

export const metadata: Metadata = {
  title: "Social Media Kit Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/social-media" },
};

export default function SocialMediaPage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            The 12 templates, shown as a sample Instagram grid and sample
            Facebook posts.
          </p>
          <SocialFeed />
        </section>
        <PackageSummary slug="social-media" />
      </div>
    </DemoLayout>
  );
}
