import { isProviderId } from './protocol.js';
export const PROVIDER_CAPABILITIES = Object.freeze({
    anthropic: Object.freeze({
        id: 'anthropic',
        label: 'Anthropic',
        protocol: 'openai-chat-completions',
        structuredOutput: 'native',
        nativeStructuredOutput: 'output_config.format',
        schemaProfile: 'anthropic',
        streaming: false,
        toolCalling: false,
        modelListing: 'catalog',
        effortField: 'output_config.effort',
        defaultVersion: '2026-10-21',
        upstream: Object.freeze({ origin: 'https://api.anthropic.com', path: '/v1/messages' }),
    }),
    openai: Object.freeze({
        id: 'openai',
        label: 'OpenAI',
        protocol: 'openai-chat-completions',
        structuredOutput: 'native',
        nativeStructuredOutput: 'response_format.json_schema',
        schemaProfile: 'openai',
        streaming: false,
        toolCalling: false,
        modelListing: 'catalog',
        effortField: 'reasoning_effort',
        upstream: Object.freeze({ origin: 'https://api.openai.com', path: '/v1/chat/completions' }),
    }),
    google: Object.freeze({
        id: 'google',
        label: 'Google Gemini',
        protocol: 'openai-chat-completions',
        structuredOutput: 'native',
        nativeStructuredOutput: 'generationConfig.responseFormat',
        schemaProfile: 'google',
        streaming: false,
        toolCalling: false,
        modelListing: 'catalog',
        effortField: null,
        upstream: Object.freeze({
            origin: 'https://generativelanguage.googleapis.com',
            path: '/v1beta/models/{model}:generateContent',
        }),
    }),
    openrouter: Object.freeze({
        id: 'openrouter',
        label: 'OpenRouter',
        protocol: 'openai-chat-completions',
        structuredOutput: 'native',
        nativeStructuredOutput: 'response_format.json_schema',
        schemaProfile: 'openai-compatible',
        streaming: false,
        toolCalling: false,
        modelListing: 'catalog',
        effortField: 'reasoning.effort',
        vendorPinning: true,
        upstream: Object.freeze({ origin: 'https://openrouter.ai', path: '/api/v1/chat/completions' }),
    }),
});
export function capabilities(provider) {
    return isProviderId(provider) ? PROVIDER_CAPABILITIES[provider] : null;
}
export function modelsFromCatalog(catalog, provider) {
    const entry = (catalog ?? []).find((item) => item.id === provider);
    return entry?.models ?? [];
}
//# sourceMappingURL=capabilities.js.map