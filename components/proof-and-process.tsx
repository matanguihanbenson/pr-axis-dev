import { Card } from "@astryxdesign/core/Card";
import { PROCESS_STEPS, STARTERS } from "@/lib/services";

export function Proof() {
  return (
    <section className="section" id="work">
      <div className="page-shell">
        <div className="section-head">
          <span className="eyebrow">Proof</span>
          <h2 className="h2">Proof</h2>
          <p className="p">
            No client projects shipped yet. The first one lands here.
          </p>
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

        <div className="process-grid">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.title} className="stack-sm">
              <span className="process-step__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="h3">{step.title}</h3>
              <p className="p">{step.line}</p>
            </div>
          ))}
        </div>

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
