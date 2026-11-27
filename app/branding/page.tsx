import type { Metadata } from "next";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { BrandBoard } from "@/components/demos/brand-board";
import { PackageSummary } from "@/components/package-summary";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("branding")!;

export const metadata: Metadata = {
  title: "Branding Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/branding" },
};

export default function BrandingPage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            A brand board for a sample brand, applied to sample posts and a
            profile.
          </p>
          <BrandBoard />
        </section>
        <PackageSummary slug="branding" />
      </div>
    </DemoLayout>
  );
}
