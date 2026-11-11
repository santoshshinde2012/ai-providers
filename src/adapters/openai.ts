import type {AdapterOptions, ProviderAdapter, UpstreamRequest} from '../ports.js';
import type {CanonicalChatRequest} from '../protocol.js';
import {PROVIDER_CAPABILITIES} from '../capabilities.js';

const caps = PROVIDER_CAPABILITIES.openai;

export const openaiAdapter: ProviderAdapter = {
  id: 'openai',
  toUpstream(request: CanonicalChatRequest, options: AdapterOptions = {}): UpstreamRequest {
    const body: Record<string, unknown> = {
      model: request.model,
      max_completion_tokens: request.max_tokens,
      messages: request.messages,
      response_format: request.response_format,
      stream: false,
    };
    if (request.reasoning_effort) body.reasoning_effort = request.reasoning_effort;
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
