import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy | pr-axis dev",
  description:
    "What the pr-axis dev inquiry form collects, what Microsoft Clarity records, and what we never do with your data.",
  alternates: {
    canonical: "https://pr-axisdev.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal page-shell">
      <div className="legal__bar">
        <Link className="wordmark" href="/">
          pr-axis<span> dev</span>
        </Link>
        <Link className="legal__back" href="/">
          Back to the site
        </Link>
      </div>

      <div className="legal__body">
        <h1 className="h1">Privacy</h1>
        <p className="p">
          This page explains what this site collects, why, and what we do not do
          with it. Plain language, no clauses you need a lawyer to read.
        </p>

        <h2 className="h2">The short version</h2>
        <p className="p">
          The form is the only place you give us information. It comes to us
          directly. We do not sell it, and we do not share it with anyone else.
        </p>

        <h2 className="h2">The inquiry form</h2>
        <p className="p">
          The form asks for your name, your email address, the services you are
          interested in, and an optional message. We use those details to reply
          and to work out what you need. We keep them only while that
          conversation is going, and we delete them when they are no longer
          needed.
        </p>
        <p className="p">
          The form is not connected to a newsletter and it does not create an
          account.
        </p>

        <h2 className="h2">Microsoft Clarity</h2>
        <p className="p">
          This site uses Microsoft Clarity to see how the pages are used. It
          records things like pages viewed, clicks, scrolling, and rough device
          and location details. Clarity sets its own cookies to do this.
        </p>
        <p className="p">
          Clarity masking is on for the inquiry form, so nothing you type into
          it is recorded. You can read more in Microsoft&apos;s own privacy
          statement.
        </p>

        <h2 className="h2">What we do not do</h2>
        <p className="p">
          We do not sell your details. We do not share them with advertisers. We
          do not build advertising profiles, and we do not add you to a mailing
          list.
        </p>

        <h2 className="h2">Questions</h2>
        <p className="p">
          If you want to know what we hold about you, or want it deleted, send a
          message through the form and say so. We will reply within one business
          day.
        </p>
      </div>

      <div className="legal__foot">
        <span>&copy; 2026 pr-axis dev</span>
        <Link className="legal__back" href="/">
          pr-axisdev.com
        </Link>
      </div>
    </main>
  );
}
