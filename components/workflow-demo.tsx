"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { LazyMotion, m } from "motion/react";

// Dragging needs the full DOM feature set; it is fetched after hydration.
const loadDemoFeatures = () =>
  import("motion/react").then((mod) => mod.domMax);

type PieceId = "trigger" | "save" | "reply" | "follow";

type Piece = {
  id: PieceId;
  label: string;
  kind: "trigger" | "action";
};

const PIECES: Piece[] = [
  { id: "trigger", label: "New inquiry arrives", kind: "trigger" },
  { id: "save", label: "Save to CRM", kind: "action" },
  { id: "reply", label: "Send auto-reply", kind: "action" },
  { id: "follow", label: "Schedule follow-up", kind: "action" },
];

const SLOT_COUNT = PIECES.length;

const EMPTY_SLOTS: (PieceId | null)[] = Array.from(
  { length: SLOT_COUNT },
  () => null,
);


export function WorkflowDemo() {
  const [slots, setSlots] = useState<(PieceId | null)[]>(EMPTY_SLOTS);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const timelineRef = useRef<{ kill: () => void } | null>(null);
  const lastDragEnd = useRef(0);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    setIsCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const placed = useMemo(() => new Set(slots.filter(Boolean) as PieceId[]), [slots]);
  const isFull = slots.every(Boolean);

  const placePiece = useCallback((pieceId: PieceId, slotIndex: number) => {
    setStatus("idle");
    setDoneSteps([]);
    setActiveStep(null);
    setSlots((current) => {
      if (current[slotIndex]) return current;
      if (current.includes(pieceId)) return current;
      const next = [...current];
      next[slotIndex] = pieceId;
      return next;
    });
  }, []);

  const placeNext = useCallback((pieceId: PieceId) => {
    setStatus("idle");
    setDoneSteps([]);
    setActiveStep(null);
    // Resolved inside the updater so a fast run of taps cannot reuse a stale
    // slot list and drop every piece after the first.
    setSlots((current) => {
      if (current.includes(pieceId)) return current;
      const index = current.findIndex((slot) => slot === null);
      if (index === -1) return current;
      const next = [...current];
      next[index] = pieceId;
      return next;
    });
  }, []);

  const clearSlot = (slotIndex: number) => {
    timelineRef.current?.kill();
    setStatus("idle");
    setDoneSteps([]);
    setActiveStep(null);
    setSlots((current) => {
      const next = [...current];
      next[slotIndex] = null;
      return next;
    });
  };

  const reset = () => {
    timelineRef.current?.kill();
    setSlots(EMPTY_SLOTS);
    setStatus("idle");
    setDoneSteps([]);
    setActiveStep(null);
  };

  const handleDrop = (pieceId: PieceId, clientX: number, clientY: number) => {
    const slotIndex = slotRefs.current.findIndex((element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });
    if (slotIndex === -1) return;
    placePiece(pieceId, slotIndex);
  };

  const run = async () => {
    if (!isFull || status === "running") return;
    setStatus("running");
    setDoneSteps([]);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDoneSteps(slots.map((_, index) => index));
      setActiveStep(null);
      setStatus("done");
      return;
    }

    try {
      const { gsap } = await import("gsap");
      timelineRef.current?.kill();

      const timeline = gsap.timeline({
        onComplete: () => {
          setActiveStep(null);
          setStatus("done");
        },
      });
      timelineRef.current = timeline;

      slots.forEach((_, index) => {
        const element = stepRefs.current[index];
        timeline
          .call(() => setActiveStep(index))
          .fromTo(
            element,
            { opacity: 0.5 },
            { opacity: 1, duration: 0.3, ease: "power2.out" },
          )
          .call(() =>
            setDoneSteps((current) =>
              current.includes(index) ? current : [...current, index],
            ),
          )
          .to({}, { duration: 0.25 });
      });
    } catch {
      // Without the timeline the run still completes honestly, step by step.
      setDoneSteps(slots.map((_, index) => index));
      setActiveStep(null);
      setStatus("done");
    }
  };

  const crmReady =
    status === "done" && slots.indexOf("save") !== -1 && slots.indexOf("trigger") === 0;

  return (
    <LazyMotion features={loadDemoFeatures}>
      <div className="stack-md">
      <div className="demo">
        <div className="demo__column">
          <span className="demo__column-title">Pieces</span>
          {PIECES.filter((piece) => !placed.has(piece.id)).map((piece) => (
            <m.button
              key={piece.id}
              type="button"
              className="demo-piece"
              drag={!isCoarsePointer}
              dragSnapToOrigin
              dragElastic={0.12}
              whileDrag={{ scale: 1.02, cursor: "grabbing" }}
              onDragEnd={(_, info) => {
                lastDragEnd.current = Date.now();
                handleDrop(piece.id, info.point.x, info.point.y);
              }}
              onClick={() => {
                // A drag that ends over the piece still emits a click.
                if (Date.now() - lastDragEnd.current < 200) return;
                placeNext(piece.id);
              }}
              aria-label={`Place ${piece.label}`}
            >
              {piece.label}
            </m.button>
          ))}
          {placed.size === SLOT_COUNT ? (
            <p className="p">All four pieces are on the canvas.</p>
          ) : (
            <p className="p">
              Drag a piece onto a step, or tap it to place it in the next one.
            </p>
          )}
        </div>

        <div className="demo__column demo__column--canvas">
          <span className="demo__column-title">Workflow</span>
          <ol
            style={{ listStyle: "none", margin: 0, padding: 0 }}
            aria-label="Workflow steps"
          >
            {slots.map((pieceId, index) => {
              const piece = PIECES.find((item) => item.id === pieceId);
              const state = doneSteps.includes(index)
                ? "done"
                : activeStep === index
                  ? "running"
                  : "idle";
              return (
                <li key={index} ref={(node) => { stepRefs.current[index] = node; }}>
                  <div
                    ref={(node) => { slotRefs.current[index] = node; }}
                    className="demo-slot"
                    data-state={state}
                    data-filled={Boolean(pieceId)}
                  >
                    <span className="demo-slot__index">{index + 1}</span>
                    {piece ? (
                      <>
                        <span>{piece.label}</span>
                        {state === "done" ? (
                          <Icon icon="check" size="sm" color="accent" />
                        ) : null}
                        <button
                          type="button"
                          onClick={() => clearSlot(index)}
                          aria-label={`Remove ${piece.label} from step ${index + 1}`}
                          style={{
                            marginInlineStart: "auto",
                            background: "none",
                            border: 0,
                            color: "inherit",
                            cursor: "pointer",
                            font: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span>Empty step</span>
                    )}
                  </div>
                  {index < SLOT_COUNT - 1 ? (
                    <div className="demo-connector" aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="demo__column">
          <span className="demo__column-title">CRM</span>
          <div className="demo-crm" aria-live="polite">
            {crmReady ? (
              <>
                <div className="demo-crm__row">
                  <span className="demo-crm__label">Source</span>
                  <span>Website inquiry</span>
                </div>
                <div className="demo-crm__row">
                  <span className="demo-crm__label">Reply</span>
                  <span>Auto-reply sent</span>
                </div>
                <div className="demo-crm__row">
                  <span className="demo-crm__label">Follow-up</span>
                  <span>Scheduled in 2 days</span>
                </div>
                <p className="p">Sample inquiry. Nothing here leaves this page.</p>
              </>
            ) : (
              <p className="p">
                Run the workflow and the record appears here.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="demo-actions">
        <Button
          label={status === "running" ? "Running" : "Run workflow"}
          variant="primary"
          onClick={run}
          isDisabled={!isFull || status === "running"}
          isLoading={status === "running"}
        />
        <Button label="Reset" variant="ghost" onClick={reset} />
      </div>
      </div>
    </LazyMotion>
  );
}
