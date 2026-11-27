"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Message = { id: number; role: "bot" | "user"; text: string; pending?: boolean };
type Handoff = { href: string; label: string };
type Reply = {
  reply: string;
  source: string;
  handoff: Handoff | null;
};

const GREETING =
  "Hi, I'm Marcus, pr-axis dev's AI assistant. Ask me what we build, whether your project is possible, or what it roughly costs.";
const RESTING =
  "Ask Marcus is resting right now. Send us an inquiry and we'll reply.";

const BURST_WINDOW_MS = 10_000;
const BURST_COUNT = 3;
const COOLDOWN_MS = 15_000;
const COOLDOWN_STEP_MS = 10_000;
const COOLDOWN_MAX_MS = 60_000;

export function AskMarcusPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "bot", text: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [resting, setResting] = useState(false);
  const [coolingUntil, setCoolingUntil] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const sessionRef = useRef("");
  const sentRef = useRef<number[]>([]);
  const queueRef = useRef<string[]>([]);
  const pendingIdsRef = useRef<number[]>([]);
  const cooldownStartRef = useRef(0);
  const cooldownRef = useRef(0);

  useEffect(() => {
    sessionRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const push = useCallback((role: Message["role"], text: string, pending = false) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { id, role, text, pending }]);
    return id;
  }, []);

  const ask = useCallback(
    async (text: string) => {
      setBusy(true);
      try {
        const response = await fetch("/api/ask-marcus", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, sessionId: sessionRef.current }),
        });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = (await response.json()) as Reply;
        push("bot", data.reply);
        setHandoff(data.handoff);
        setResting(data.source === "down");
      } catch {
        push("bot", RESTING);
        setResting(true);
        setHandoff({ href: "/#contact", label: "Start your inquiry" });
      } finally {
        setBusy(false);
      }
    },
    [push],
  );

  const enterCooldown = useCallback(
    (queued: string) => {
      const now = Date.now();
      const until = now + COOLDOWN_MS;
      cooldownStartRef.current = now;
      cooldownRef.current = until;
      queueRef.current = [queued];
      setCoolingUntil(until);
      setSecondsLeft(Math.ceil(COOLDOWN_MS / 1000));
      push("bot", "You're sending messages fast. I'll catch up in a few seconds.");
    },
    [push],
  );

  const extendCooldown = useCallback((queued: string) => {
    const now = Date.now();
    const next = Math.min(
      cooldownRef.current + COOLDOWN_STEP_MS,
      cooldownStartRef.current + COOLDOWN_MAX_MS,
    );
    const until = Math.max(next, now + 1000);
    cooldownRef.current = until;
    queueRef.current.push(queued);
    setCoolingUntil(until);
    setSecondsLeft(Math.ceil((until - now) / 1000));
  }, []);

  // The cooldown is client-side: nothing reaches the AI while it runs, and the
  // held messages go out together as one request when it ends.
  useEffect(() => {
    if (!coolingUntil) return;

    const tick = window.setInterval(() => {
      const now = Date.now();
      if (now < cooldownRef.current) {
        setSecondsLeft(Math.ceil((cooldownRef.current - now) / 1000));
        return;
      }

      window.clearInterval(tick);
      const batched = queueRef.current.join("\n");
      queueRef.current = [];
      const ids = pendingIdsRef.current;
      pendingIdsRef.current = [];
      cooldownRef.current = 0;
      cooldownStartRef.current = 0;
      setCoolingUntil(0);
      setSecondsLeft(0);
      setMessages((current) =>
        current.map((message) =>
          ids.includes(message.id) ? { ...message, pending: false } : message,
        ),
      );
      if (batched) void ask(batched);
    }, 250);

    return () => window.clearInterval(tick);
  }, [coolingUntil, ask]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");

    const now = Date.now();
    sentRef.current = sentRef.current.filter((time) => now - time < BURST_WINDOW_MS);
    sentRef.current.push(now);

    if (cooldownRef.current > now) {
      const id = push("user", text, true);
      pendingIdsRef.current.push(id);
      extendCooldown(text);
      return;
    }

    if (sentRef.current.length >= BURST_COUNT) {
      const id = push("user", text, true);
      pendingIdsRef.current.push(id);
      enterCooldown(text);
      return;
    }

    push("user", text);
    void ask(text);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  };

  return (
    <section
      ref={panelRef}
      className="ask-marcus__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-marcus-title"
      data-clarity-mask="true"
      onKeyDown={onKeyDown}
    >
      <header className="ask-marcus__head">
        <div>
          <p className="ask-marcus__name" id="ask-marcus-title">
            Marcus
          </p>
          <p className="ask-marcus__role">pr-axis dev&apos;s AI assistant</p>
        </div>
        <button type="button" className="ask-marcus__close" onClick={onClose}>
          Close chat
        </button>
      </header>

      <div
        className="ask-marcus__log"
        ref={logRef}
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
      >
        {messages.map((message) => (
          <p
            key={message.id}
            className={`ask-marcus__bubble ask-marcus__bubble--${message.role}${
              message.pending ? " ask-marcus__bubble--pending" : ""
            }`}
          >
            {message.text}
            {message.pending ? (
              <span className="ask-marcus__pending">Waiting</span>
            ) : null}
          </p>
        ))}
        {coolingUntil ? (
          <p className="ask-marcus__countdown" role="status">
            Sending in {secondsLeft}s
          </p>
        ) : null}
      </div>

      {resting ? (
        <Link className="ask-marcus__cta" href="/#contact">
          Open the inquiry form
        </Link>
      ) : handoff ? (
        <Link className="ask-marcus__cta" href={handoff.href}>
          {handoff.label}
        </Link>
      ) : null}

      <form className="ask-marcus__form" onSubmit={submit}>
        <label className="ask-marcus__label" htmlFor="ask-marcus-input">
          Your question
        </label>
        <div className="ask-marcus__row">
          <input
            ref={inputRef}
            id="ask-marcus-input"
            className="ask-marcus__input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={1000}
            autoComplete="off"
            placeholder="What do you need?"
          />
          <button
            type="submit"
            className="ask-marcus__send"
            disabled={busy || draft.trim().length === 0}
          >
            {busy ? "Sending" : "Send"}
          </button>
        </div>
      </form>

      <p className="ask-marcus__foot">
        Answers come from pr-axis dev&apos;s notes. Nothing you type here is
        saved.
      </p>
    </section>
  );
}
