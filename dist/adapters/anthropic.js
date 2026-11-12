import { PROVIDER_CAPABILITIES } from '../capabilities.js';
import { sanitizeAnthropicSchema } from '../schema.js';
import { messagesWithRole } from './messages.js';
const caps = PROVIDER_CAPABILITIES.anthropic;
function workspaceHeader(workspaceId) {
    const value = workspaceId?.trim();
    return value ? { 'anthropic-workspace-id': value } : {};
}
export function anthropicOutputConfig(request) {
    return {
        format: {
            type: 'json_schema',
            schema: sanitizeAnthropicSchema(request.response_format.json_schema.schema),
        },
        ...(request.reasoning_effort ? { effort: request.reasoning_effort } : {}),
    };
}
export const anthropicAdapter = {
    id: 'anthropic',
    toUpstream(request, options = {}) {
        return {
            url: `${caps.upstream.origin}${caps.upstream.path}`,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': options.apiKey ?? '',
                'anthropic-version': options.version ?? caps.defaultVersion ?? '2026-10-21',
                ...workspaceHeader(options.workspaceId),
            },
            body: {
                model: request.model,
                max_tokens: request.max_tokens,
                system: messagesWithRole(request, 'system').map((message) => ({
                    type: 'text',
                    text: message.content,
                })),
                messages: messagesWithRole(request, 'user').map((message) => ({
                    role: 'user',
                    content: message.content,
                })),
                output_config: anthropicOutputConfig(request),
            },
        };
    },
};
//# sourceMappingURL=anthropic.js.map