"use client";

import { buildQuote, formatQuoteRange } from "@/lib/quote";

export function Estimate({ selected }: { selected: string[] }) {
  const quote = buildQuote(selected);

  if (!quote) {
    return (
      <div className="estimate" aria-live="polite">
        <span className="estimate__label">Rough estimate</span>
        <p className="p">Select a service to see a rough estimate.</p>
      </div>
    );
  }

  return (
    <div className="estimate" aria-live="polite">
      <span className="estimate__label">Rough estimate</span>
      <ul className="estimate__lines">
        {quote.lines.map((line) => (
          <li key={line.key}>
            <span>{line.label}</span>
            <span>{line.value}</span>
          </li>
        ))}
      </ul>
      <div className="estimate__total">
        <span>Total</span>
        <strong>{formatQuoteRange(quote.low, quote.high)}</strong>
      </div>
      {quote.savings.map((saving) => (
        <p key={saving} className="estimate__saving">
          {saving}
        </p>
      ))}
      <p className="estimate__note">
        Rough estimate, not a quote. The final price depends on scope, and we
        confirm it before any work starts.
      </p>
    </div>
  );
}
