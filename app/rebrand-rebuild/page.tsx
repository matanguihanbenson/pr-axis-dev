import type { Metadata } from "next";
import { BeforeAfter } from "@/components/demos/before-after";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { PackageSummary } from "@/components/package-summary";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("rebrand-rebuild")!;

export const metadata: Metadata = {
  title: "Rebrand & Rebuild Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/rebrand-rebuild" },
};

export default function RebrandRebuildPage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            A sample dated site next to the redesigned version. Drag the slider
            to compare.
          </p>
          <BeforeAfter />
        </section>
        <PackageSummary slug="rebrand-rebuild" />
      </div>
    </DemoLayout>
  );
}
