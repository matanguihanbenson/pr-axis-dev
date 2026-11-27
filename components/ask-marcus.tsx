"use client";

import { lazy, Suspense, useCallback, useRef, useState } from "react";

const Panel = lazy(() =>
  import("./ask-marcus-panel").then((module) => ({
    default: module.AskMarcusPanel,
  })),
);

/**
 * The launcher is the only part of Ask Marcus in the first-load bundle. The
 * panel is a separate chunk, fetched on hover, focus, or tap.
 */
export function AskMarcus() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const preload = useCallback(() => {
    void import("./ask-marcus-panel");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="ask-marcus">
      <button
        ref={buttonRef}
        type="button"
        className="ask-marcus__launcher"
        aria-label="Ask Marcus"
        aria-expanded={open}
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => setOpen((current) => !current)}
      >
        Ask Marcus
      </button>
      {open ? (
        <Suspense fallback={null}>
          <Panel onClose={close} />
        </Suspense>
      ) : null}
    </div>
  );
}
