/**
 * Best-effort hourly limit. Vercel runs routes in separate short-lived
 * instances, so this counter is per instance and is a guard rail, not a
 * guarantee. The widget's cooldown is the inner layer; this is the outer one.
 */

const WINDOW_MS = 60 * 60 * 1000;
export const HOURLY_LIMIT = 20;
const MAX_KEYS = 5_000;

const hits = new Map<string, number[]>();

export function take(key: string, limit = HOURLY_LIMIT): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (hits.size > MAX_KEYS && !hits.has(key)) hits.clear();

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}
