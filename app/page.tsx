import { ContactForm, ContactHeading } from "@/components/contact-form";
import { Hero } from "@/components/hero";
import { OfferGrid } from "@/components/offer-grid";
import { PillarProvider } from "@/components/pillar-context";
import { PillarExplorer } from "@/components/pillar-explorer";
import { Process, Proof } from "@/components/proof-and-process";
import { ScrollProgress } from "@/components/scroll-progress";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkflowDemo } from "@/components/workflow-demo";

export default function Home() {
  return (
    <>
      <PillarProvider>
        <SiteHeader />
        <main>
          <Hero />

          <section className="section" id="services">
            <div className="page-shell" data-reveal>
              <div className="section-head">
                <span className="eyebrow">Start where it hurts</span>
                <h2 className="h2">Three doors. Pick one.</h2>
                <p className="p">
                  Design, build, or automate. Take the one you need now — the
                  rest is here if it comes up later.
                </p>
              </div>
              <PillarExplorer />
            </div>
          </section>

          <section className="section" id="offer">
            <div className="page-shell">
              <div className="section-head" data-reveal>
                <span className="eyebrow">What we offer</span>
                <h2 className="h2">Everything, at a glance.</h2>
                <p className="p">
                  Every service pr-axis dev offers today. Open one to see what
                  you get.
                </p>
              </div>
              <OfferGrid />
            </div>
          </section>

          <section className="section" id="demo">
            <div className="page-shell">
              <div data-reveal>
                <div className="section-head">
                  <span className="eyebrow">Try it</span>
                  <h2 className="h2">Watch one workflow run.</h2>
                  <p className="p">
                    Four pieces, in order: an inquiry arrives, it is saved, a
                    reply goes out, a follow-up is scheduled. Build it yourself
                    and run it.
                  </p>
                </div>
                <WorkflowDemo />
              </div>
            </div>
          </section>

          <div data-reveal>
            <Proof />
          </div>

          <Process />

          <section className="section" id="contact">
            <div className="page-shell contact-shell">
              <ContactHeading />
              <div className="contact-form-wrap">
                <ContactForm />
              </div>
            </div>
          </section>

          <ScrollProgress />
        </main>
      </PillarProvider>
      <SiteFooter />
      <ScrollReveal />
    </>
  );
}
