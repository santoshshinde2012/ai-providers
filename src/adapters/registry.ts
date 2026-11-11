import type {AdapterOptions, ProviderAdapter, UpstreamRequest} from '../ports.js';
import type {CanonicalChatRequest, ProviderId} from '../protocol.js';
import {capabilities} from '../capabilities.js';
import {anthropicAdapter} from './anthropic.js';
import {googleAdapter} from './google.js';
import {openaiAdapter} from './openai.js';
import {openrouterAdapter} from './openrouter.js';

export const adapters: Record<ProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  google: googleAdapter,
  openrouter: openrouterAdapter,
};

export function toUpstream(
  provider: string,
  request: CanonicalChatRequest,
  options: AdapterOptions = {},
): UpstreamRequest {
  const caps = capabilities(provider);
  const adapter = (adapters as Record<string, ProviderAdapter | undefined>)[provider];
  if (!caps || !adapter) throw new Error('unsupported_provider');
  return adapter.toUpstream(request, options);
}
