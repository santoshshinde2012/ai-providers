/** Ports a host or adapter implements. This package does not send HTTP. */
import type {CanonicalChatRequest, JsonSchemaObject, ProviderId} from './protocol.js';
import type {ProviderCapabilities} from './capabilities.js';

export interface AdapterOptions {
  readonly apiKey?: string;
  readonly version?: string;
}

export interface UpstreamRequest {
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

/** Strategy port: one implementation per provider, no I/O. */
export interface ProviderAdapter {
  readonly id: ProviderId;
  toUpstream(request: CanonicalChatRequest, options?: AdapterOptions): UpstreamRequest;
}

export interface ModelInfo {
  readonly id: string;
  readonly effort?: string;
}

export interface CatalogProvider {
  readonly id: string;
  readonly models?: readonly ModelInfo[];
}

/** Host-supplied catalog port. This package ships no model list. */
export interface ModelCatalog {
  modelsFor(provider: ProviderId): readonly ModelInfo[];
}

export interface CapabilityLookup {
  of(provider: ProviderId): ProviderCapabilities | null;
}

export interface ErrorNormalizer {
  normalize(status: number, body: unknown, provider: string): NormalizedProviderError;
  sanitize(status: number, body: unknown, provider: string): Buffer;
}

export interface NormalizedProviderError {
  readonly provider: string;
  readonly type: string;
  readonly message: string;
  readonly status: number;
}

export function catalogFrom(entries: readonly CatalogProvider[]): ModelCatalog {
  return {
    modelsFor(provider) {
      return entries.find((item) => item.id === provider)?.models ?? [];
    },
  };
}

export type {CanonicalChatRequest, JsonSchemaObject, ProviderId};
