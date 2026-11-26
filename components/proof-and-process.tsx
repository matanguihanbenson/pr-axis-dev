import { Card } from "@astryxdesign/core/Card";
import { PROCESS_STEPS, STARTERS } from "@/lib/services";

export function Proof() {
  return (
    <section className="section" id="work">
      <div className="page-shell">
        <div className="proof-panel">
          <span className="proof-panel__dot" aria-hidden="true" />
          <div className="proof-panel__body">
            <span className="eyebrow">Client work</span>
            <div className="proof-panel__split">
              <h2 className="proof-panel__statement">
                No client projects shipped yet.
              </h2>
              <p className="p proof-panel__follow">
                The first one lands here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

        <div className="pricing-block" id="pricing">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h3 className="h3">Starter prices</h3>
            <p className="p">
              Fixed prices for the smallest version of each service. Anything
              bigger gets a custom quote once we&apos;ve seen what you need.
            </p>
          </div>

          <div className="starter-grid">
            {STARTERS.map((starter) => (
              <Card key={starter.name} padding={4}>
                <div className="stack-sm">
                  <h4 className="h4">{starter.name}</h4>
                  <span className="starter__price">{starter.price}</span>
                  <p className="p">{starter.line}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
