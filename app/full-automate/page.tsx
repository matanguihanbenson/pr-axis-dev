import type { Metadata } from "next";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { PackageSummary } from "@/components/package-summary";
import { WorkflowDemo } from "@/components/workflow-demo";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("full-automate")!;

export const metadata: Metadata = {
  title: "Full Automate Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/full-automate" },
};

export default function FullAutomatePage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            All five agents in one run, ending with the weekly report. Sample
            record, not a live system.
          </p>
          <WorkflowDemo variant="full" />
        </section>
        <PackageSummary slug="full-automate" />
      </div>
    </DemoLayout>
  );
}
