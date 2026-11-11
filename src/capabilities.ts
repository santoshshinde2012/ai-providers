/** Static capability descriptors. Model lists come from the host catalog. */
import type {CatalogProvider, ModelInfo} from './ports.js';
import {type ProviderId, isProviderId} from './protocol.js';

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

export const PROVIDER_CAPABILITIES: Record<ProviderId, ProviderCapabilities> = Object.freeze({
  anthropic: Object.freeze({
    id: 'anthropic',
    label: 'Anthropic',
    protocol: 'openai-chat-completions',
    structuredOutput: 'native',
    nativeStructuredOutput: 'output_config.format',
    schemaProfile: 'anthropic',
    streaming: false,
    toolCalling: false,
    modelListing: 'catalog',
    effortField: 'output_config.effort',
    defaultVersion: '2026-10-21',
    upstream: Object.freeze({origin: 'https://api.anthropic.com', path: '/v1/messages'}),
  }),
  openai: Object.freeze({
    id: 'openai',
    label: 'OpenAI',
    protocol: 'openai-chat-completions',
    structuredOutput: 'native',
    nativeStructuredOutput: 'response_format.json_schema',
    schemaProfile: 'openai',
    streaming: false,
    toolCalling: false,
    modelListing: 'catalog',
    effortField: 'reasoning_effort',
    upstream: Object.freeze({origin: 'https://api.openai.com', path: '/v1/chat/completions'}),
  }),
  google: Object.freeze({
    id: 'google',
    label: 'Google Gemini',
    protocol: 'openai-chat-completions',
    structuredOutput: 'native',
    nativeStructuredOutput: 'generationConfig.responseFormat',
    schemaProfile: 'google',
    streaming: false,
    toolCalling: false,
    modelListing: 'catalog',
    effortField: null,
    upstream: Object.freeze({
      origin: 'https://generativelanguage.googleapis.com',
      path: '/v1beta/models/{model}:generateContent',
    }),
  }),
  openrouter: Object.freeze({
    id: 'openrouter',
    label: 'OpenRouter',
    protocol: 'openai-chat-completions',
    structuredOutput: 'native',
    nativeStructuredOutput: 'response_format.json_schema',
    schemaProfile: 'openai-compatible',
    streaming: false,
    toolCalling: false,
    modelListing: 'catalog',
    effortField: 'reasoning.effort',
    vendorPinning: true,
    upstream: Object.freeze({origin: 'https://openrouter.ai', path: '/api/v1/chat/completions'}),
  }),
});

export function capabilities(provider: string): ProviderCapabilities | null {
  return isProviderId(provider) ? PROVIDER_CAPABILITIES[provider] : null;
}

export function modelsFromCatalog(
  catalog: readonly CatalogProvider[] | null | undefined,
  provider: string,
): readonly ModelInfo[] {
  const entry = (catalog ?? []).find((item) => item.id === provider);
  return entry?.models ?? [];
}
