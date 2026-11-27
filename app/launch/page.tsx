import type { Metadata } from "next";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { LaunchDemo } from "@/components/demos/launch-demo";
import { PackageSummary } from "@/components/package-summary";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("launch")!;

export const metadata: Metadata = {
  title: "Launch Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/launch" },
};

export default function LaunchPage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            Sample business, sample content. Fill the form and the inquiry lands
            in the inbox panel.
          </p>
          <LaunchDemo />
        </section>
        <PackageSummary slug="launch" />
      </div>
    </DemoLayout>
  );
}
