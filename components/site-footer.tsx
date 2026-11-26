const SECTIONS = [
  { href: "#services", label: "Start with what you need" },
  { href: "#offer", label: "What we offer" },
  { href: "#demo", label: "Watch one workflow" },
  { href: "#contact", label: "Work with us" },
];

const PILLARS = [
  { href: "#services", label: "Design" },
  { href: "#services", label: "Build" },
  { href: "#services", label: "Automate" },
];

function Arrow({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 8 L8 2 M3.75 2 H8 V6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid" aria-hidden="true" />

      <div className="page-shell site-footer__inner">
        <span className="site-footer__mark" aria-hidden="true" />

        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a className="wordmark site-footer__wordmark" href="#top">
              pr-axis<span> dev</span>
            </a>
            <p className="site-footer__tagline">
              Design, build and automate the parts of a business that keep
              coming back. One person, three services, no handoffs.
            </p>
            <a className="site-footer__cta" href="#contact">
              Start a project
              <Arrow className="site-footer__arrow" />
            </a>
          </div>

          <nav className="site-footer__col" aria-label="Sections">
            <span className="eyebrow">Sections</span>
            {SECTIONS.map((item) => (
              <a key={item.label} className="site-footer__link" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <nav className="site-footer__col" aria-label="Pillars">
            <span className="eyebrow">Pillars</span>
            {PILLARS.map((item) => (
              <a key={item.label} className="site-footer__link" href={item.href}>
                {item.label}
              </a>
            ))}
            <a className="site-footer__link" href="https://pr-axisdev.com/">
              pr-axisdev.com
              <Arrow className="site-footer__arrow site-footer__arrow--small" />
            </a>
          </nav>
        </div>

        <div className="site-footer__rule" aria-hidden="true" />

        <div className="site-footer__bottom">
          <p className="site-footer__legal">
            <span>&copy; 2026 pr-axis dev</span>
            <span className="site-footer__sep" aria-hidden="true" />
            <span>We use Microsoft Clarity to see how this site is used.</span>
            <span className="site-footer__sep" aria-hidden="true" />
            <a className="site-footer__link site-footer__link--small" href="/privacy">
              Privacy
            </a>
          </p>
          <a className="site-footer__link site-footer__link--small" href="#top">
            Back to top
            <Arrow className="site-footer__arrow site-footer__arrow--up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
