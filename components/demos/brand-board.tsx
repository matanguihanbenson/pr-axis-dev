const PALETTE = [
  { name: "Charcoal", value: "#0B0B0C" },
  { name: "Surface", value: "#141416" },
  { name: "Text", value: "#FAFAF9" },
  { name: "Muted", value: "#A1A1AA" },
  { name: "Accent", value: "#60A5FA" },
];

export function BrandBoard() {
  return (
    <div className="brand-board">
      <div className="brand-board__panel brand-board__lockup">
        <span className="eyebrow">Logo and wordmark</span>
        <span className="brand-board__wordmark">
          pr-axis<span> dev</span>
        </span>
        <span className="brand-board__mark" aria-hidden="true" />
        <p className="p">
          One wordmark, one mark. The mark holds at 16px in a tab and at full
          size on a sign.
        </p>
      </div>

      <div className="brand-board__panel">
        <span className="eyebrow">Color</span>
        <ul className="brand-board__palette">
          {PALETTE.map((color) => (
            <li key={color.name}>
              <span
                className="brand-board__swatch"
                style={{ background: color.value }}
              />
              <span className="brand-board__color">{color.name}</span>
              <span className="brand-board__hex">{color.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="brand-board__panel brand-board__type">
        <span className="eyebrow">Type</span>
        <span className="brand-board__type-display">Inter</span>
        <span className="brand-board__type-body">
          Body copy at 15px, 1.65 line height, muted against charcoal. Headings
          at 600, tight tracking.
        </span>
      </div>

      <div className="brand-board__panel brand-board__applied">
        <span className="eyebrow">Applied to social</span>
        <div className="brand-board__posts">
          <div className="brand-post">
            <span className="brand-post__tag">Post 01</span>
            <strong>Design it.</strong>
            <span>Interfaces that explain themselves.</span>
          </div>
          <div className="brand-post">
            <span className="brand-post__tag">Post 02</span>
            <strong>Build it.</strong>
            <span>Fast sites, real products.</span>
          </div>
          <div className="brand-post">
            <span className="brand-post__tag">Story 01</span>
            <strong>Automate it.</strong>
            <span>The repeated work, handled.</span>
          </div>
        </div>
      </div>

      <div className="brand-board__panel brand-board__profile">
        <span className="eyebrow">Profile</span>
        <div className="brand-profile">
          <span className="brand-profile__avatar" aria-hidden="true">
            pr
          </span>
          <div>
            <strong>pr-axis dev</strong>
            <span className="brand-profile__handle">@praxisdev</span>
            <p className="p">
              Design, build, automate. The work that eats your week, handled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
