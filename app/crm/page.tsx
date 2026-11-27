import type { Metadata } from "next";
import { DemoHead, DemoLayout } from "@/components/demo-layout";
import { PackageSummary } from "@/components/package-summary";
import { WorkflowDemo } from "@/components/workflow-demo";
import { findPackage } from "@/lib/packages";

const bundle = findPackage("crm")!;

export const metadata: Metadata = {
  title: "CRM Package | pr-axis dev",
  description: bundle.who,
  alternates: { canonical: "https://pr-axisdev.com/crm" },
};

export default function CrmPage() {
  return (
    <DemoLayout>
      <div className="page-shell demo-page__inner">
        <DemoHead name={bundle.name} who={bundle.who} />
        <section className="demo-page__section">
          <p className="demo-page__note">
            The same workflow, end to end. Place the pieces, run it, and watch
            the sample record fill in.
          </p>
          <WorkflowDemo />
        </section>
        <PackageSummary slug="crm" />
      </div>
    </DemoLayout>
  );
}
