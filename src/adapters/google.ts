import type {AdapterOptions, ProviderAdapter, UpstreamRequest} from '../ports.js';
import type {CanonicalChatRequest} from '../protocol.js';
import {PROVIDER_CAPABILITIES} from '../capabilities.js';
import {messagesWithRole} from './messages.js';

const caps = PROVIDER_CAPABILITIES.google;

export function googleGenerationConfig(request: CanonicalChatRequest) {
  return {
    maxOutputTokens: request.max_tokens,
    responseFormat: {
      text: {mimeType: 'APPLICATION_JSON', schema: request.response_format.json_schema.schema},
    },
  };
}

export const googleAdapter: ProviderAdapter = {
  id: 'google',
  toUpstream(request: CanonicalChatRequest, options: AdapterOptions = {}): UpstreamRequest {
    return {
      url: `${caps.upstream.origin}/v1beta/models/${request.model}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': options.apiKey ?? '',
      },
      body: {
        contents: messagesWithRole(request, 'user').map((message) => ({
          role: 'user',
          parts: [{text: message.content}],
        })),
        systemInstruction: {
          parts: messagesWithRole(request, 'system').map((message) => ({text: message.content})),
        },
        generationConfig: googleGenerationConfig(request),
      },
    };
  },
};
