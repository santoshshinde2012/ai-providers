import type { ProviderAdapter } from '../ports.js';
import type { CanonicalChatRequest } from '../protocol.js';
export declare function googleGenerationConfig(request: CanonicalChatRequest): {
    maxOutputTokens: number;
    responseFormat: {
        text: {
            mimeType: string;
            schema: import("../protocol.js").JsonSchemaObject;
        };
    };
};
export declare const googleAdapter: ProviderAdapter;
//# sourceMappingURL=google.d.ts.map