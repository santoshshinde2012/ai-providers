/** Canonical request shape accepted by a host transport. */
export const PROVIDER_IDS = ['anthropic', 'openai', 'google', 'openrouter'] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export const CANONICAL_PROTOCOL = Object.freeze({
  id: 'openai-chat-completions',
  path: '/v1/chat/completions',
  structuredOutput: 'response_format.json_schema',
  stream: false,
});

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ReasoningEffort = 'low' | 'medium' | 'high';

export interface JsonSchemaObject {
  [key: string]: unknown;
}

export interface CanonicalChatRequest {
  model: string;
  max_tokens: number;
  messages: ChatMessage[];
  response_format: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict?: boolean;
      schema: JsonSchemaObject;
    };
  };
  reasoning_effort?: ReasoningEffort;
  stream?: false;
}

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}
