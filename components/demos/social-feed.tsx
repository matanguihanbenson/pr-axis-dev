const TEMPLATES = [
  { kind: "Statement", text: "Design it." },
  { kind: "Statement", text: "Build it." },
  { kind: "Statement", text: "Automate it." },
  { kind: "List", text: "Three services. Pick one." },
  { kind: "Quote", text: "One form. One reply from a person." },
  { kind: "Process", text: "We map the workflow." },
  { kind: "Process", text: "We build it, one piece at a time." },
  { kind: "Process", text: "We hand it over and keep it running." },
  { kind: "Offer", text: "A free audit of your site or system." },
  { kind: "Offer", text: "Start with what you need." },
  { kind: "Announcement", text: "Packages, six of them." },
  { kind: "Call to action", text: "Tell us what you need." },
];

export function SocialFeed() {
  return (
    <div className="social-demo">
      <div className="social-frame">
        <div className="social-frame__head">
          <span className="social-frame__avatar" aria-hidden="true">
            pr
          </span>
          <div>
            <strong>praxisdev</strong>
            <span>Instagram, sample grid</span>
          </div>
        </div>

        <div className="social-grid">
          {TEMPLATES.map((template, index) => (
            <div
              key={template.text}
              className="social-tile"
              data-accent={index % 5 === 0 ? "true" : "false"}
            >
              <span className="social-tile__kind">{template.kind}</span>
              <span className="social-tile__text">{template.text}</span>
              <span className="social-tile__mark" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div className="social-frame social-frame--wide">
        <div className="social-frame__head">
          <span className="social-frame__avatar" aria-hidden="true">
            pr
          </span>
          <div>
            <strong>pr-axis dev</strong>
            <span>Facebook, sample posts</span>
          </div>
        </div>

        <div className="social-posts">
          {TEMPLATES.slice(0, 3).map((template) => (
            <article key={template.text} className="social-post">
              <span className="social-tile__kind">{template.kind}</span>
              <strong>{template.text}</strong>
              <p className="p">
                Sample post copy using the same template, sized for the feed.
              </p>
              <div className="social-post__row" aria-hidden="true">
                <span>Like</span>
                <span>Comment</span>
                <span>Share</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
