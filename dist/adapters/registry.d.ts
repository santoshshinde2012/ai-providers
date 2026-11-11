import type { AdapterOptions, ProviderAdapter, UpstreamRequest } from '../ports.js';
import type { CanonicalChatRequest, ProviderId } from '../protocol.js';
export declare const adapters: Record<ProviderId, ProviderAdapter>;
export declare function toUpstream(provider: string, request: CanonicalChatRequest, options?: AdapterOptions): UpstreamRequest;
//# sourceMappingURL=registry.d.ts.map