/**
 * Free-tier model chain. No SDKs, no paid billing: every provider here is
 * called with fetch and is allowed to fail, in which case the route answers
 * with the resting message instead of falling through to a paid key.
 */

export type AiResult = { text: string; provider: string } | null;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

const TIMEOUT_MS = 12_000;

async function postJson(url: string, init: RequestInit) {
  return fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function askGroq(system: string, user: string, key: string) {
  const response = await postJson(GROQ_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 350,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Groq ${response.status}`);
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned no text");
  return text;
}

async function askGemini(system: string, user: string, key: string) {
  const response = await postJson(
    `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 350 },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

async function askOpenRouter(system: string, user: string, key: string) {
  const response = await postJson(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.2,
      max_tokens: 350,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned no text");
  return text;
}

export function hasProvider() {
  return Boolean(
    process.env.GROQ_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENROUTER_API_KEY,
  );
}

/** Tries Groq, then Gemini, then OpenRouter. Returns null when all fail. */
export async function complete(system: string, user: string): Promise<AiResult> {
  const chain: { name: string; run: () => Promise<string> }[] = [];

  if (process.env.GROQ_API_KEY) {
    chain.push({
      name: `groq:${GROQ_MODEL}`,
      run: () => askGroq(system, user, process.env.GROQ_API_KEY!),
    });
  }
  if (process.env.GEMINI_API_KEY) {
    chain.push({
      name: `gemini:${GEMINI_MODEL}`,
      run: () => askGemini(system, user, process.env.GEMINI_API_KEY!),
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    chain.push({
      name: `openrouter:${OPENROUTER_MODEL}`,
      run: () => askOpenRouter(system, user, process.env.OPENROUTER_API_KEY!),
    });
  }

  for (const provider of chain) {
    try {
      const text = await provider.run();
      return { text, provider: provider.name };
    } catch (error) {
      console.error(`[ask-marcus] ${provider.name} failed`, error);
    }
  }

  return null;
}

export const NOT_IN_KB = "NOT_IN_KB";

export function systemPrompt(entries: { title: string; answer: string }[]) {
  const knowledge = entries
    .map((entry) => `### ${entry.title}\n${entry.answer}`)
    .join("\n\n");

  return [
    "You are Marcus, pr-axis dev's AI assistant, on pr-axisdev.com.",
    "You are not a human and never claim to be. You are not riv and not the human Marcus.",
    "Answer ONLY from the knowledge base entries below. Never use outside knowledge.",
    "If the entries do not answer the question, reply with exactly NOT_IN_KB and nothing else.",
    "Never invent a price, a timeline, a delivery date, or a capability.",
    "Never do arithmetic. Prices come from the site's quote engine, not from you.",
    "Voice: direct, plain words, short sentences, no jargon, no em-dashes, no emoji, no fake enthusiasm.",
    "Answer the question first, then the detail. Ask at most one clarifying question.",
    "Write American English. Say Us, not Me.",
    "",
    "Knowledge base entries:",
    knowledge,
  ].join("\n");
}
