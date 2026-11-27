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

## Ask Marcus (AI assistant)

A floating chat panel on every page. It answers from a knowledge base, prices
work through the same quote engine as the form, and hands off to the inquiry
form with the services already picked.

### Where things live

| Piece | Path |
| --- | --- |
| Route (server only) | `app/api/ask-marcus/route.ts` |
| Launcher (first-load) | `components/ask-marcus.tsx` |
| Panel (lazy chunk) | `components/ask-marcus-panel.tsx` |
| KB retrieval | `lib/ask-marcus/kb.ts` |
| Intent + quote answers | `lib/ask-marcus/intent.ts` |
| Free-tier model chain | `lib/ask-marcus/ai.ts` |
| Hourly limiter | `lib/ask-marcus/limits.ts` |
| KB snapshot (generated) | `lib/ask-marcus/kb-snapshot.json`, `content/ask-marcus/*.md` |

### Knowledge base

The KB API (`matanguihanbenson/pr-axis-kb-api`) is canonical. The chatbot reads
it server-side through `KB_API_URL`. The bundled snapshot is the fallback when
the API cannot be reached, so the site never depends on it being up.

`scripts/kb-snapshot.mjs` regenerates both the markdown snapshot under
`content/ask-marcus/` and the JSON the route imports. Run it after any KB
change, and commit the result:

```bash
node scripts/kb-snapshot.mjs
```

Nothing is written if the fetch fails.

### Answer order (retrieval-first, mostly $0)

1. Price question, custom build, or two or more services: `lib/quote.ts` prices
   it, no model call.
2. A confident keyword hit, or a short question: the entry is returned as
   written, no model.
3. No hit at all: "I don't have that in my notes" plus the form. Nothing is
   invented.
4. Only open questions with retrieved context reach a model.

### Cost and providers

Tried in order, each one only when its key is set: Groq, Gemini, OpenRouter.
No SDKs, no paid billing attached; when a free tier is exhausted or a provider
fails, the route answers with the resting message and the form link.

Default models (override with `GROQ_MODEL`, `GEMINI_MODEL`,
`OPENROUTER_MODEL`): `openai/gpt-oss-120b` on Groq, `gemini-2.5-flash-lite` on
Gemini, `meta-llama/llama-3.3-70b-instruct:free` on OpenRouter. Re-check the
live free-tier limits and model names in each console before relying on them;
the spec's numbers are illustrative.

### Limits

- 20 messages per visitor per hour, in memory in `lib/ask-marcus/limits.ts`.
  Vercel runs routes in separate short-lived instances, so this is best-effort,
  not a guarantee.
- Burst cooldown in the widget: 3 messages in 10 seconds starts a 15 second
  cooldown, extended by 10 seconds per further message to a 60 second maximum.
  Held messages go out as one request. A refresh starts a new session.
- No conversation is stored. The session id lives in the tab.

### Environment

`.env.local` is gitignored (`.env*` with `!.env.example`); `.env.example` lists
every name with placeholders. Production and Preview need the same names in
the Vercel dashboard.
