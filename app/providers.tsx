"use client";

import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { prAxisTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={prAxisTheme} mode="dark">
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
