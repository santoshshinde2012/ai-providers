import { PROVIDER_CAPABILITIES } from '../capabilities.js';
const caps = PROVIDER_CAPABILITIES.openrouter;
export function openrouterProviderRouting(request) {
    const vendor = request.model.split('/')[0] ?? '';
    return {
        order: [vendor],
        allow_fallbacks: false,
        require_parameters: true,
        data_collection: 'deny',
    };
}
export const openrouterAdapter = {
    id: 'openrouter',
    toUpstream(request, options = {}) {
        const body = {
            model: request.model,
            max_tokens: request.max_tokens,
            messages: request.messages,
            response_format: request.response_format,
            stream: false,
            provider: openrouterProviderRouting(request),
        };
        if (request.reasoning_effort)
            body.reasoning = { effort: request.reasoning_effort };
        return {
            url: `${caps.upstream.origin}${caps.upstream.path}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${options.apiKey ?? ''}`,
            },
            body,
        };
    },
};
//# sourceMappingURL=openrouter.js.map