import type { ProviderAdapter } from '../ports.js';
import type { CanonicalChatRequest } from '../protocol.js';
export declare function anthropicOutputConfig(request: CanonicalChatRequest): {
    effort?: import("../protocol.js").ReasoningEffort;
    format: {
        type: string;
        schema: unknown;
    };
};
export declare const anthropicAdapter: ProviderAdapter;
//# sourceMappingURL=anthropic.d.ts.map