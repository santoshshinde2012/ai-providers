// Pure strategy-pattern adapters. No HTTP and no key storage.
import {sanitizeAnthropicSchema} from './schema.mjs';
import {capabilities} from './capabilities.mjs';

const role = (request, name) => request.messages.filter((message) => message.role === name);

export function anthropicOutputConfig(request) {
  return {
    format: {type: 'json_schema', schema: sanitizeAnthropicSchema(request.response_format.json_schema.schema)},
    ...(request.reasoning_effort ? {effort: request.reasoning_effort} : {}),
  };
}

export function googleGenerationConfig(request) {
  return {
    maxOutputTokens: request.max_tokens,
    responseFormat: {text: {mimeType: 'APPLICATION_JSON', schema: request.response_format.json_schema.schema}},
  };
}

export function openrouterProviderRouting(request) {
  return {order: [request.model.split('/')[0]], allow_fallbacks: false, require_parameters: true, data_collection: 'deny'};
}

export function toUpstream(provider, request, options = {}) {
  const caps = capabilities(provider);
  if (!caps) throw new Error('unsupported_provider');
  if (provider === 'anthropic') {
    return {
      url: `${caps.upstream.origin}${caps.upstream.path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey,
        'anthropic-version': options.version ?? caps.defaultVersion,
      },
      body: {
        model: request.model,
        max_tokens: request.max_tokens,
        system: role(request, 'system').map((message) => ({type: 'text', text: message.content})),
        messages: role(request, 'user').map((message) => ({role: 'user', content: message.content})),
        output_config: anthropicOutputConfig(request),
      },
    };
  }
  if (provider === 'openai') {
    const body = {
      model: request.model,
      max_completion_tokens: request.max_tokens,
      messages: request.messages,
      response_format: request.response_format,
      stream: false,
    };
    if (request.reasoning_effort) body.reasoning_effort = request.reasoning_effort;
    return {
      url: `${caps.upstream.origin}${caps.upstream.path}`,
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${options.apiKey}`},
      body,
    };
  }
  if (provider === 'google') {
    return {
      url: `${caps.upstream.origin}/v1beta/models/${request.model}:generateContent`,
      headers: {'Content-Type': 'application/json', 'x-goog-api-key': options.apiKey},
      body: {
        contents: role(request, 'user').map((message) => ({role: 'user', parts: [{text: message.content}]})),
        systemInstruction: {parts: role(request, 'system').map((message) => ({text: message.content}))},
        generationConfig: googleGenerationConfig(request),
      },
    };
  }
  const body = {
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
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${options.apiKey}`},
    body,
  };
}
