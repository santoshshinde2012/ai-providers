/** Static capability descriptors. Model lists come from the host catalog. */
import type { CatalogProvider, ModelInfo } from './ports.js';
import { type ProviderId } from './protocol.js';
export interface ProviderCapabilities {
    readonly id: ProviderId;
    readonly label: string;
    readonly protocol: 'openai-chat-completions';
    readonly structuredOutput: 'native';
    readonly nativeStructuredOutput: string;
    readonly schemaProfile: 'anthropic' | 'openai' | 'google' | 'openai-compatible';
    readonly streaming: false;
    readonly toolCalling: false;
    readonly modelListing: 'catalog';
    readonly effortField: string | null;
    readonly defaultVersion?: string;
    readonly vendorPinning?: boolean;
    readonly upstream: {
        readonly origin: string;
        readonly path: string;
    };
}
export declare const PROVIDER_CAPABILITIES: Record<ProviderId, ProviderCapabilities>;
export declare function capabilities(provider: string): ProviderCapabilities | null;
export declare function modelsFromCatalog(catalog: readonly CatalogProvider[] | null | undefined, provider: string): readonly ModelInfo[];
//# sourceMappingURL=capabilities.d.ts.map