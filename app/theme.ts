import { defineTheme } from "@astryxdesign/core/theme";

// pr-axis color system (v1, dark only). One accent, used only for small
// markers. Every value here maps to a token the components already read, so
// no component needs a hard-coded color.
const ink = "#0B0B0C";
const surface = "#141416";
const raised = "#1A1A1D";
const text = "#FAFAF9";
const muted = "#A1A1AA";
const accent = "#60a5fa";

export const prAxisTheme = defineTheme({
  name: "pr-axis-dark",
  tokens: {
    "--color-background-body": ink,
    "--color-background-surface": surface,
    "--color-background-card": surface,
    "--color-background-muted": raised,
    "--color-background-popover": raised,
    "--color-border": "rgba(255, 255, 255, 0.08)",
    "--color-border-emphasized": "rgba(255, 255, 255, 0.18)",
    "--color-text-primary": text,
    "--color-text-secondary": muted,
    "--color-accent": accent,
    "--color-accent-muted": "rgba(96, 165, 250, 0.12)",
    "--color-text-accent": accent,
    "--color-icon-accent": accent,
    "--color-on-accent": ink,
    "--color-success": "#34d399",
    "--color-error": "#f87171",
    "--radius-container": "12px",
    "--radius-element": "8px",
  },
});

// One mode only: this theme never draws a light page.
export const colorModes = ["dark"] as const;
