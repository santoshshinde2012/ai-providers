// Canonical internal protocol: OpenAI-compatible chat + structured output.
// This is the only request shape Rust sends to the bundled gateway.
export const PROVIDER_IDS = Object.freeze(['anthropic', 'openai', 'google', 'openrouter']);

export const CANONICAL_PROTOCOL = Object.freeze({
  id: 'openai-chat-completions',
  path: '/v1/chat/completions',
  structuredOutput: 'response_format.json_schema',
  stream: false,
});

export function isProviderId(value) {
  return PROVIDER_IDS.includes(value);
}
