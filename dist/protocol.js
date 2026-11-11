/** Canonical request shape accepted by a host transport. */
export const PROVIDER_IDS = ['anthropic', 'openai', 'google', 'openrouter'];
export const CANONICAL_PROTOCOL = Object.freeze({
    id: 'openai-chat-completions',
    path: '/v1/chat/completions',
    structuredOutput: 'response_format.json_schema',
    stream: false,
});
export function isProviderId(value) {
    return PROVIDER_IDS.includes(value);
}
//# sourceMappingURL=protocol.js.map