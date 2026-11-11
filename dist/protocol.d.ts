/** Canonical request shape accepted by a host transport. */
export declare const PROVIDER_IDS: readonly ["anthropic", "openai", "google", "openrouter"];
export type ProviderId = (typeof PROVIDER_IDS)[number];
export declare const CANONICAL_PROTOCOL: Readonly<{
    id: "openai-chat-completions";
    path: "/v1/chat/completions";
    structuredOutput: "response_format.json_schema";
    stream: false;
}>;
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
export declare function isProviderId(value: string): value is ProviderId;
//# sourceMappingURL=protocol.d.ts.map