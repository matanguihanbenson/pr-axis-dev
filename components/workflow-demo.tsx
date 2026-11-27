"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { m } from "motion/react";

type Step = { id: string; label: string; line: string; status: string };

const BASE_STEPS: Step[] = [
  {
    id: "inquiry",
    label: "New inquiry arrives",
    line: "A form submission comes in.",
    status: "Inquiry received",
  },
  {
    id: "crm",
    label: "Save to CRM",
    line: "The lead is recorded with its source.",
    status: "Saved to CRM",
  },
  {
    id: "reply",
    label: "Send auto-reply",
    line: "A reply goes out with the next step.",
    status: "Auto-reply sent",
  },
  {
    id: "follow-up",
    label: "Schedule follow-up",
    line: "A follow-up is queued for later.",
    status: "Follow-up scheduled",
  },
];

// The Full Automate demo runs the five agents, one after another.
const FULL_STEPS: Step[] = [
  {
    id: "inquiry",
    label: "Lead Capture Agent",
    line: "The inquiry is caught and filed.",
    status: "Caught by Lead Capture",
  },
  {
    id: "follow-up",
    label: "Follow-up Agent",
    line: "A reply goes out, and a reminder is queued.",
    status: "Follow-up sent",
  },
  {
    id: "research",
    label: "Data & Research Agent",
    line: "A short brief is attached to the lead.",
    status: "Research brief added",
  },
  {
    id: "crm",
    label: "CRM & Insights Agent",
    line: "The record is updated and ranked.",
    status: "CRM updated",
  },
  {
    id: "report",
    label: "Reporting Agent",
    line: "The week's numbers go out as one summary.",
    status: "Added to the weekly report",
  },
];

type Props = {
  variant?: "home" | "full";
};

export function WorkflowDemo({ variant = "home" }: Props) {
  const steps = useMemo<Step[]>(
    () => (variant === "full" ? FULL_STEPS : BASE_STEPS),
    [variant],
  );

  const [slots, setSlots] = useState<(string | null)[]>(() =>
    steps.map(() => null),
  );
  // The tray order is fixed, so Reset always restores the same board.
  const tray = steps
    .map((step) => step.id)
    .filter((id) => !slots.includes(id));

  const [selected, setSelected] = useState<string | null>(null);
  const [runIndex, setRunIndex] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const timeline = useRef<{ kill: () => void } | null>(null);

  useEffect(() => {
    return () => {
      timeline.current?.kill();
    };
  }, []);

  const stepById = useCallback(
    (id: string) => steps.find((step) => step.id === id),
    [steps],
  );

  const place = (stepId: string, index: number) => {
    if (running) return;
    const from = slots.indexOf(stepId);
    setSlots((current) => {
      const next = [...current];
      if (from >= 0) next[from] = next[index];
      next[index] = stepId;
      return next;
    });
    setSelected(null);
    setDone(false);
    setMessage(null);
    setRunIndex(-1);
  };

  const removeAt = (index: number) => {
    if (running) return;
    setSlots((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
    setDone(false);
    setMessage(null);
    setRunIndex(-1);
  };

  const slotAt = (x: number, y: number) => {
    for (let index = 0; index < slotRefs.current.length; index += 1) {
      const box = slotRefs.current[index]?.getBoundingClientRect();
      if (!box) continue;
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        return index;
      }
    }
    return -1;
  };

  const reset = () => {
    timeline.current?.kill();
    timeline.current = null;
    setSlots(steps.map(() => null));
    setSelected(null);
    setRunIndex(-1);
    setRunning(false);
    setDone(false);
    setMessage(null);
  };

  const run = async () => {
    if (running) return;
    if (slots.some((slot) => slot === null)) {
      setMessage("Place all the pieces first.");
      return;
    }
    const orderWrong = slots.some((id, index) => id !== steps[index].id);
    if (orderWrong) {
      setMessage("That order skips a step. The inquiry arrives first.");
      return;
    }

    setMessage(null);
    setDone(false);
    setRunning(true);
    setRunIndex(0);

    const { gsap } = await import("gsap");
    const tl = gsap.timeline({
      onComplete: () => {
        setRunning(false);
        setRunIndex(-1);
        setDone(true);
      },
    });
    timeline.current = tl;

    steps.forEach((step, index) => {
      tl.call(() => setRunIndex(index));
      const node = slotRefs.current[index];
      if (node) {
        tl.fromTo(
          node,
          { borderColor: "var(--color-accent)" },
          {
            borderColor: "var(--color-accent)",
            duration: 0.2,
            yoyo: true,
            repeat: 1,
          },
        );
      }
      tl.to({}, { duration: 0.35 });
      tl.call(() => setRunIndex(index + 1));
    });
  };

  const recordStep = done
    ? steps.length
    : runIndex >= 0
      ? Math.min(runIndex, steps.length)
      : 0;
  const recordStatus =
    recordStep === 0 ? "Waiting" : steps[recordStep - 1].status;
  const completedIds = steps.slice(0, recordStep).map((step) => step.id);
  const replySent =
    completedIds.includes("reply") || completedIds.includes("follow-up");
  const followUpSet = completedIds.includes("follow-up");

  return (
    <div className="demo" data-variant={variant}>
      <div className="demo__board">
        <div className="demo__slots">
          {slots.map((stepId, index) => {
            const step = stepId ? stepById(stepId) : null;
            const active = runIndex === index;
            return (
              <div
                key={`slot-${index}`}
                ref={(node) => {
                  slotRefs.current[index] = node;
                }}
                className="demo-slot"
                data-filled={step ? "true" : "false"}
                data-active={active ? "true" : "false"}
                data-complete={
                  done || (runIndex > index && runIndex >= 0)
                    ? "true"
                    : "false"
                }
                role="button"
                tabIndex={0}
                aria-label={
                  step
                    ? `Step ${index + 1}: ${step.label}. Activate to remove.`
                    : `Step ${index + 1}, empty. Select a piece, then activate to place it.`
                }
                onClick={() => {
                  if (selected) place(selected, index);
                  else if (step) removeAt(index);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (selected) place(selected, index);
                  else if (step) removeAt(index);
                }}
              >
                <span className="demo-slot__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step ? (
                  <span className="demo-slot__body">
                    <span className="demo-slot__label">{step.label}</span>
                    <span className="demo-slot__line">{step.line}</span>
                  </span>
                ) : (
                  <span className="demo-slot__empty">Drop a piece here</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="demo__tray" aria-label="Pieces to place">
          {tray.length === 0 ? (
            <p className="p demo__tray-empty">
              Every piece is placed. Run the workflow.
            </p>
          ) : (
            tray.map((id) => {
              const step = stepById(id);
              if (!step) return null;
              return (
                <m.button
                  key={id}
                  type="button"
                  className="demo-chip"
                  data-selected={selected === id ? "true" : "false"}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.16}
                  whileDrag={{ scale: 1.03, zIndex: 3 }}
                  onDragStart={() => {
                    const node = document.querySelector<HTMLElement>(
                      `[data-chip="${id}"]`,
                    );
                    const box = node?.getBoundingClientRect();
                    dragStart.current = box
                      ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
                      : null;
                    dragged.current = true;
                  }}
                  onDragEnd={(_, info) => {
                    const start = dragStart.current;
                    dragStart.current = null;
                    if (!start) return;
                    const index = slotAt(
                      start.x + info.offset.x,
                      start.y + info.offset.y,
                    );
                    if (index >= 0) place(id, index);
                    window.setTimeout(() => {
                      dragged.current = false;
                    }, 0);
                  }}
                  onClick={() => {
                    if (dragged.current) return;
                    setSelected((current) => (current === id ? null : id));
                  }}
                  data-chip={id}
                  aria-pressed={selected === id}
                >
                  <span className="demo-chip__grip" aria-hidden="true" />
                  {step.label}
                </m.button>
              );
            })
          )}
        </div>
      </div>

      <aside className="demo-record" aria-label="Sample record">
        <div className="demo-record__head">
          <span className="eyebrow">Sample record</span>
          <span
            className="demo-record__status"
            data-live={recordStep > 0 ? "true" : "false"}
          >
            {recordStatus}
          </span>
        </div>
        <dl className="demo-record__rows">
          <div>
            <dt>Name</dt>
            <dd>Sample inquiry</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>Website form</dd>
          </div>
          <div>
            <dt>Reply</dt>
            <dd>{replySent ? "Sent" : "Not sent yet"}</dd>
          </div>
          <div>
            <dt>Follow-up</dt>
            <dd>{followUpSet ? "Scheduled" : "Not scheduled"}</dd>
          </div>
          {variant === "full" ? (
            <>
              <div>
                <dt>Research brief</dt>
                <dd>
                  {completedIds.includes("research") ? "Attached" : "Not attached"}
                </dd>
              </div>
              <div>
                <dt>Weekly report</dt>
                <dd>
                  {completedIds.includes("report") ? "Included" : "Not included"}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </aside>

      <div className="demo__foot">
        <div className="demo__actions">
          <button
            type="button"
            className="demo-button demo-button--primary"
            onClick={run}
            disabled={running || slots.some((slot) => slot === null)}
          >
            {running ? "Running" : "Run workflow"}
          </button>
          <button
            type="button"
            className="demo-button"
            onClick={reset}
            disabled={running}
          >
            Reset
          </button>
        </div>
        <p className="p demo__hint" role="status">
          {message ??
            (done
              ? variant === "full"
                ? "Done, the inquiry moved through all five agents."
                : "Done, the inquiry moved through all four steps."
              : "Drag a piece into a slot, or select it and tap a slot.")}
        </p>
      </div>
    </div>
  );
}
