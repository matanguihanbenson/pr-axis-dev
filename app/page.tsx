import { ContactForm, ContactHeading } from "@/components/contact-form";
import { Hero } from "@/components/hero";
import { OfferGrid } from "@/components/offer-grid";
import { PillarProvider } from "@/components/pillar-context";
import { PillarExplorer } from "@/components/pillar-explorer";
import { PricingSection } from "@/components/pricing";
import { Process } from "@/components/proof-and-process";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollWire } from "@/components/scroll-wire";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
                <span className="eyebrow">Start with what you need</span>
                <h2 className="h2">Three services. Pick one.</h2>
                <p className="p">
                  Design, build, or automate. Take the one you need now, and the
                  rest is here if it comes up later.
                </p>
              </div>
              <PillarExplorer />
            </div>
          </section>

          <section className="section" id="offer">
            <div className="page-shell">
              <div className="section-head" data-reveal>
                <span className="eyebrow">Our services</span>
                <h2 className="h2">What we offer</h2>
                <p className="p">
                  Every service pr-axis dev offers today. Select a service to
                  see what you get.
                </p>
              </div>
              <OfferGrid />
            </div>
          </section>

          <Process />

          <PricingSection />

          <section className="section" id="contact">
            <div className="page-shell contact-shell">
              <ContactHeading />
              <div className="contact-form-wrap">
                <ContactForm />
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </PillarProvider>
      <ScrollReveal />
      <ScrollWire />
    </>
  );
}
