import { capabilities } from '../capabilities.js';
import { anthropicAdapter } from './anthropic.js';
import { googleAdapter } from './google.js';
import { openaiAdapter } from './openai.js';
import { openrouterAdapter } from './openrouter.js';
export const adapters = {
    anthropic: anthropicAdapter,
    openai: openaiAdapter,
    google: googleAdapter,
    openrouter: openrouterAdapter,
};
export function toUpstream(provider, request, options = {}) {
    const caps = capabilities(provider);
    const adapter = adapters[provider];
    if (!caps || !adapter)
        throw new Error('unsupported_provider');
    return adapter.toUpstream(request, options);
}
//# sourceMappingURL=registry.js.map