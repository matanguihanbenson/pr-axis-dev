# pr-axis dev — pr-axisdev.com

The company site for pr-axis dev. One page, three doors: Design, Build, Automate.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Stack

- Next.js 15.5.29 (App Router), React 19.3.1, TypeScript 5.9.3 — static page, no runtime data.
- Tailwind CSS 4 (installed for the Astryx layer bridge; the page itself styles with tokens).
- Inter via `next/font` (self-hosted, latin, 400/500/600/700, `display: swap`).

## Astryx

Design system: [`@astryxdesign/core`](https://github.com/meta/astryx) by Meta (Beta, React 19+).

Pinned together — **do not upgrade one without the others**:

| Package                     | Version |
| --------------------------- | ------- |
| `@astryxdesign/core`        | 0.7.17  |
| `@astryxdesign/theme-neutral` | 0.7.17 |
| `@astryxdesign/cli` (dev)   | 0.7.17  |

An Astryx upgrade is its own branch and its own QA pass. Check the Astryx
changelog first.

Setup follows the official Next.js guide: three stylesheet imports in
`app/globals.css` under one cascade layer order, `Theme` + `LinkProvider` in
`app/providers.tsx`, no build plugins. `AGENTS.md` holds the generated component
index; `npx @astryxdesign/cli component <Name>` is the source of truth for props.

**Swizzled components: none.** Every Astryx component used is the published one.

Components in use: `Button`, `Card`, `CheckboxInput`, `Heading`, `Icon`, `Tab`,
`TabList`, `Text`, `TextArea`, `TextInput`, `LinkProvider`, `Theme`.

### Theme

`app/theme.ts` is the source. `app/pr-axis-dark.css` is **generated** from it by
`npx astryx theme build app/theme.ts` and imported in `app/globals.css`, so the
charcoal tokens are present in the first paint instead of being injected after
hydration. Re-run that command whenever the theme changes; do not edit the CSS
by hand.

It re-points the Astryx tokens to the pr-axis system (charcoal `#0B0B0C`, surface `#141416`, raised `#1A1A1D`, text
`#FAFAF9`, muted `#A1A1AA`, hairline borders, one accent `#60a5fa`). Dark only:
the theme exports `colorModes = ["dark"]` and is mounted with `mode="dark"`.
Accent is used only for markers, focus rings and link hover.

## Animation

One library per element, never both.

- **Motion 14.14.0** — stepper/panel transitions, service list/detail cross-fade.
  The DOM feature bundle is fetched with `LazyMotion` + a dynamic import after
  hydration.
- **GSAP 3.15.1** — hero intro (`SplitText`) and scroll reveals (`ScrollTrigger`),
  both loaded through a dynamic `import()` inside `useEffect`, so neither is in
  the first-paint JS and neither can delay the hero text.

GSAP is loaded lazily rather than through `@gsap/react`'s `useGSAP` hook: the
hook imports GSAP statically, which would put the whole library in the page's
initial bundle and contradict the "animation loads after first paint"
requirement. Cleanup uses `gsap.context().revert()`.

`prefers-reduced-motion` is respected in every animated island: instant swaps,
no scroll choreography, no hero timeline.

## Structure

```
app/
  layout.tsx        metadata (do not change), Inter, Clarity, providers
  pr-axis-dark.css  generated from theme.ts (see Theme below)
  page.tsx          the page, section by section
  theme.ts          Astryx theme tokens
  providers.tsx     Theme + LinkProvider
  globals.css       layer order, tokens, section styles
components/
  site-header.tsx   anchor nav
  hero.tsx          GSAP intro
  pillar-context.tsx  shared pillar/service state + #design/#build/#automate
  pillar-explorer.tsx stepper + list/detail switcher
  offer-grid.tsx    every service, always visible
  proof-and-process.tsx  honest proof state, process, starters
  contact-form.tsx  inquiry form (Clarity-masked)
  site-footer.tsx   Clarity disclosure
lib/services.ts     the single service catalogue
```

`public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`,
`public/favicon.svg` and `public/googlebc6382aa49397942.html` are served
byte-identical — do not edit them.

## Analytics

- Vercel Analytics + Speed Insights (already on the deploy).
- Microsoft Clarity, project `zjlfzlzktp`, loaded `afterInteractive` in
  `app/layout.tsx`. The inquiry form carries `data-clarity-mask="true"`; the
  footer carries the disclosure line.
