import { NextResponse } from "next/server";
import {
  NOT_IN_KB,
  complete,
  hasProvider,
  systemPrompt,
} from "@/lib/ask-marcus/ai";
import { loadKb, searchKb } from "@/lib/ask-marcus/kb";
import {
  directKbAnswer,
  detect,
  hasCapabilityIntent,
  hasPriceIntent,
  handoffFor,
  identityAnswer,
  isIdentityQuestion,
  quoteAnswer,
} from "@/lib/ask-marcus/intent";
import { take } from "@/lib/ask-marcus/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 1000;

const NOT_IN_NOTES =
  "I don't have that in my notes. Send it through the inquiry form and the team will answer it.";
const RESTING =
  "Ask Marcus is resting right now. Send us an inquiry and we'll reply.";
const LIMITED =
  "That's all I can answer for now. Send the rest through the inquiry form and the team will pick it up.";

type Reply = {
  reply: string;
  source: "quote" | "kb" | "model" | "limit" | "empty" | "down" | "error";
  handoff: { href: string; label: string } | null;
};

/** No em-dashes in any bot copy, whatever the source text said. */
function clean(text: string) {
  return text.replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
}

function respond(body: Reply) {
  return NextResponse.json(
    { ...body, reply: clean(body.reply) },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { reply: "Send the message as JSON.", source: "error", handoff: null },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const session =
    typeof data.sessionId === "string" ? data.sessionId.slice(0, 64) : "";

  if (!message) {
    return NextResponse.json(
      {
        reply: "Type a question and I will answer it.",
        source: "empty",
        handoff: null,
      },
      { status: 422 },
    );
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json(
      {
        reply: "That is longer than I can take in. Send the detail through the inquiry form.",
        source: "error",
        handoff: handoffFor([]),
      },
      { status: 422 },
    );
  }

  const ip = (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "local"
  )
    .split(",")[0]
    .trim();

  if (!take(`${ip}:${session || "anon"}`)) {
    return respond({
      reply: LIMITED,
      source: "limit",
      handoff: handoffFor([]),
    });
  }

  try {
    const { entries } = await loadKb();
    const detection = detect(message);
    const capability = hasCapabilityIntent(message);

    // 0. Asked who it is: the identity line, as written, before anything else.
    if (isIdentityQuestion(message)) {
      const identity = identityAnswer(entries);
      if (identity) {
        return respond({
          reply: identity,
          source: "kb",
          handoff: handoffFor([]),
        });
      }
    }

    // 1. A price question, a custom build, or a multi-service project: the
    // quote engine answers, with no model call.
    const wantsQuote =
      Boolean(detection.custom) ||
      detection.services.length >= 2 ||
      (hasPriceIntent(message) && detection.services.length > 0);

    if (wantsQuote) {
      const answer = quoteAnswer(detection, entries, { capability });
      if (answer) {
        return respond({
          reply: answer.reply,
          source: "quote",
          handoff: answer.handoff,
        });
      }
    }

    // 2. Retrieval-first: a direct KB hit is answered as written, no model.
    const matches = searchKb(entries, message);
    const direct = directKbAnswer(
      matches[0],
      message.split(/\s+/).filter(Boolean).length,
    );
    if (direct) {
      return respond({
        reply: direct,
        source: "kb",
        handoff:
          detection.services.length > 0
            ? handoffFor(detection.services)
            : handoffFor([]),
      });
    }

    // 3. Nothing retrieved means nothing to reason over: no invented answer.
    if (matches.length === 0) {
      return respond({
        reply: NOT_IN_NOTES,
        source: "kb",
        handoff: handoffFor(detection.services),
      });
    }

    // 4. Open questions with context go to the free-tier model.
    if (!hasProvider()) {
      return respond({
        reply: RESTING,
        source: "down",
        handoff: handoffFor(detection.services),
      });
    }

    const result = await complete(
      systemPrompt(matches.map((match) => match.entry)),
      message,
    );

    if (!result) {
      return respond({
        reply: RESTING,
        source: "down",
        handoff: handoffFor(detection.services),
      });
    }

    if (result.text.trim().replace(/[.\s]/g, "") === NOT_IN_KB) {
      return respond({
        reply: NOT_IN_NOTES,
        source: "kb",
        handoff: handoffFor(detection.services),
      });
    }

    return respond({
      reply: result.text,
      source: "model",
      handoff: handoffFor(detection.services),
    });
  } catch (error) {
    console.error("[ask-marcus] request failed", error);
    return respond({
      reply: RESTING,
      source: "down",
      handoff: handoffFor([]),
    });
  }
}
