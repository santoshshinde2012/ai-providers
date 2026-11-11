import { PROVIDER_CAPABILITIES } from '../capabilities.js';
const caps = PROVIDER_CAPABILITIES.openai;
export const openaiAdapter = {
    id: 'openai',
    toUpstream(request, options = {}) {
        const body = {
            model: request.model,
            max_completion_tokens: request.max_tokens,
            messages: request.messages,
            response_format: request.response_format,
            stream: false,
        };
        if (request.reasoning_effort)
            body.reasoning_effort = request.reasoning_effort;
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
//# sourceMappingURL=openai.js.map