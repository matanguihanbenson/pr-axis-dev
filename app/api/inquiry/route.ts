import { NextResponse } from "next/server";
import { ESTIMATE_SERVICES } from "@/lib/estimate-helpers";
import { findAddOn, findPackage } from "@/lib/packages";

type Inquiry = {
  name: string;
  email: string;
  message?: string;
  selections: string[];
  estimate: { low: number; high: number } | null;
};

const LIMITS = {
  name: 120,
  email: 254,
  message: 5000,
  selections: 30,
  selectionKey: 120,
  price: 1_000_000,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only keys the form can produce reach the webhook. */
function isKnownSelection(key: string) {
  if (key === "not-sure") return true;
  if (key.startsWith("package:")) return Boolean(findPackage(key.slice(8)));
  if (key.startsWith("addon:")) return Boolean(findAddOn(key));
  return ESTIMATE_SERVICES.some((service) => service.key === key);
}

function readPrice(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > LIMITS.price) return null;
  return Math.round(value);
}

function validate(body: unknown): Inquiry | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || name.length > LIMITS.name) return null;
  if (!EMAIL.test(email) || email.length > LIMITS.email) return null;
  if (message.length > LIMITS.message) return null;

  if (!Array.isArray(data.selections)) return null;
  // Cap the raw array before deduplicating, so a huge body is rejected cheaply.
  if (data.selections.length > LIMITS.selections) return null;
  const selections = [
    ...new Set(
      data.selections.filter(
        (item): item is string =>
          typeof item === "string" && item.length <= LIMITS.selectionKey,
      ),
    ),
  ];
  if (selections.length === 0 || selections.length > LIMITS.selections) {
    return null;
  }
  if (!selections.every(isKnownSelection)) return null;

  let estimate: Inquiry["estimate"] = null;
  const raw = data.estimate;
  if (raw && typeof raw === "object") {
    const low = readPrice((raw as Record<string, unknown>).low);
    const high = readPrice((raw as Record<string, unknown>).high);
    if (low !== null && high !== null && low <= high) estimate = { low, high };
  }

  return { name, email, message, selections, estimate };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Send the inquiry as JSON." },
      { status: 400 },
    );
  }

  const inquiry = validate(body);
  if (!inquiry) {
    return NextResponse.json(
      { ok: false, message: "Add a name, a valid email, and a selection." },
      { status: 422 },
    );
  }

  const payload = {
    ...inquiry,
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.INQUIRY_WEBHOOK_URL;

  // Without a destination the form must not fake a send. In development the
  // inquiry is logged so the flow can be tested end to end.
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[inquiry] captured in development:", JSON.stringify(payload));
      return NextResponse.json({ ok: true, delivery: "development-log" });
    }
    return NextResponse.json(
      {
        ok: false,
        message: "Sending is not connected yet. Set INQUIRY_WEBHOOK_URL.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      // A slow webhook must not hold the form open indefinitely.
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("[inquiry] webhook rejected the inquiry", response.status);
      return NextResponse.json(
        { ok: false, message: "The inquiry could not be delivered." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[inquiry] delivery failed", error);
    return NextResponse.json(
      { ok: false, message: "The inquiry could not be delivered." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
