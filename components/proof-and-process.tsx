import { PROCESS_STEPS } from "@/lib/services";

export function Process() {
  return (
    <section className="section" id="process">
      <div className="page-shell">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2 className="h2">Three steps, no fuss.</h2>
          <p className="p">Start with what you need, one thing is enough.</p>
        </div>

        <ol className="process-grid" data-reveal>
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="process-card">
              <svg
                className="process-card__outline"
                aria-hidden="true"
                focusable="false"
              >
                <rect pathLength={1} />
              </svg>
              <div className="process-card__top">
                <span className="process-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="process-card__rule" aria-hidden="true" />
                <span className="process-card__dot" aria-hidden="true" />
              </div>
              <div className="process-card__body">
                <h3 className="h3">{step.title}</h3>
                <p className="p">{step.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
