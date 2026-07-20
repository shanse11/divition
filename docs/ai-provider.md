# AI Provider

`src/lib/ai/provider.ts` selects either `MockProvider` or `OpenAiCompatibleProvider`. Tarot and dream orchestration lives in `src/lib/ai/interpret.ts`; prompts are isolated in `src/lib/ai/prompts.ts`.

## Mock

`AI_PROVIDER=mock` uses deterministic local interpretation engines and requires no network or secret. This is the default and supports the full product demo.

## OpenAI-compatible

Set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` and optional `AI_TIMEOUT`. Calls happen only on the server. The adapter requests JSON, applies timeout and bounded retry, then validates results with Zod. Invalid or unavailable provider output falls back locally.

Logs include provider state and error classes, but never API keys or complete user questions. System prompts prohibit deterministic predictions and professional medical, legal or investment advice.
