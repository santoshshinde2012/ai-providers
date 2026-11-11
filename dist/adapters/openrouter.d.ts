import type { ProviderAdapter } from '../ports.js';
import type { CanonicalChatRequest } from '../protocol.js';
export declare function openrouterProviderRouting(request: CanonicalChatRequest): {
    order: string[];
    allow_fallbacks: boolean;
    require_parameters: boolean;
    data_collection: string;
};
export declare const openrouterAdapter: ProviderAdapter;
//# sourceMappingURL=openrouter.d.ts.map