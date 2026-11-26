import { Card } from "@astryxdesign/core/Card";
import { PROCESS_STEPS, STARTERS } from "@/lib/services";

export function Proof() {
  return (
    <section className="section" id="work">
      <div className="page-shell">
        <div className="section-head">
          <span className="eyebrow">Proof</span>
          <h2 className="h2">Shipped work</h2>
          <p className="p">
            The first pr-axis projects are being built now. This section fills in
            as they ship — nothing here is borrowed from anywhere else.
          </p>
        </div>
        <Card padding={4}>
          <div className="stack-sm">
            <h3 className="h3">The workflow demo above</h3>
            <p className="p">
              Built for this page, and the first piece of pr-axis work a visitor
              can touch. It runs a simulated flow, so it shows the idea without
              pretending to be a client result.
            </p>
          </div>
        </Card>
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
          <h2 className="h2">Three steps, no theater.</h2>
          <p className="p">Start with what you need — one thing is enough.</p>
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

        <div className="section-head" style={{ marginTop: 64, marginBottom: 0 }}>
          <h3 className="h3">Starters, in USD</h3>
          <p className="p">
            Fixed prices for the smallest version of each. Anything bigger is
            quoted after we map it.
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
    </section>
  );
}
