import type {AdapterOptions, ProviderAdapter, UpstreamRequest} from '../ports.js';
import type {CanonicalChatRequest} from '../protocol.js';
import {PROVIDER_CAPABILITIES} from '../capabilities.js';

const caps = PROVIDER_CAPABILITIES.openrouter;

export function openrouterProviderRouting(request: CanonicalChatRequest) {
  const vendor = request.model.split('/')[0] ?? '';
  return {
    order: [vendor],
    allow_fallbacks: false,
    require_parameters: true,
    data_collection: 'deny',
  };
}

export const openrouterAdapter: ProviderAdapter = {
  id: 'openrouter',
  toUpstream(request: CanonicalChatRequest, options: AdapterOptions = {}): UpstreamRequest {
    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.max_tokens,
      messages: request.messages,
      response_format: request.response_format,
      stream: false,
      provider: openrouterProviderRouting(request),
    };
    if (request.reasoning_effort) body.reasoning = {effort: request.reasoning_effort};
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
