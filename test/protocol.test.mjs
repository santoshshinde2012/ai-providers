import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_PROTOCOL,
  PROVIDER_IDS,
  anthropicOutputConfig,
  capabilities,
  catalogAllowsModel,
  catalogFrom,
  defaultModel,
  modelEffort,
  modelsFromCatalog,
  parseCatalog,
  providerLabel,
  normalizeProviderError,
  redactSecrets,
  sanitizeAnthropicSchema,
  sanitizedProviderError,
} from '../dist/index.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'check',
  properties: {
    ok: {type: 'boolean'},
    note: {type: ['string', 'null'], description: 'optional'},
    choice: {oneOf: [{type: 'string'}, {type: 'number'}]},
  },
  required: ['ok'],
};

test('canonical protocol is OpenAI-compatible structured chat', () => {
  assert.equal(CANONICAL_PROTOCOL.path, '/v1/chat/completions');
  assert.equal(CANONICAL_PROTOCOL.structuredOutput, 'response_format.json_schema');
  assert.deepEqual([...PROVIDER_IDS], ['anthropic', 'openai', 'google', 'openrouter']);
  for (const id of PROVIDER_IDS) {
    const caps = capabilities(id);
    assert.equal(caps.protocol, 'openai-chat-completions');
    assert.equal(caps.structuredOutput, 'native');
    assert.equal(caps.streaming, false);
    assert.equal(caps.modelListing, 'catalog');
  }
});

test('Anthropic schema rewrites oneOf and type arrays to anyOf', () => {
  const out = sanitizeAnthropicSchema(schema);
  assert.equal(out.$schema, undefined);
  assert.equal(out.title, undefined);
  assert.equal(out.additionalProperties, false);
  assert.deepEqual(out.properties.note, {anyOf: [{type: 'string'}, {type: 'null'}]});
  assert.deepEqual(out.properties.choice, {anyOf: [{type: 'string'}, {type: 'number'}]});
  assert.equal(out.properties.note.description, undefined);
});

test('errors keep only sanitized type and message, never keys or raw bodies', () => {
  const body = Buffer.from(
    JSON.stringify({
      error: {
        type: 'invalid_request_error',
        message:
          'anthropic error: type arrays must use anyOf. sk-ant-synthetic-secret-do-not-keep is not a valid field',
        request_id: 'req_should_not_leak',
        raw_body: '{"secret":true}',
      },
    }),
  );
  const normalized = normalizeProviderError(400, body, 'anthropic');
  assert.deepEqual(normalized, {
    provider: 'anthropic',
    type: 'invalid_request_error',
    message: 'anthropic error: type arrays must use anyOf. [redacted] is not a valid field',
    status: 400,
  });
  const wire = JSON.parse(sanitizedProviderError(400, body, 'anthropic').toString('utf8'));
  assert.deepEqual(Object.keys(wire), ['error']);
  assert.deepEqual(Object.keys(wire.error).sort(), ['message', 'type']);
  assert.equal(wire.error.message.includes('sk-ant-'), false);
  assert.equal(JSON.stringify(wire).includes('request_id'), false);
  assert.equal(JSON.stringify(wire).includes('raw_body'), false);
  assert.equal(
    redactSecrets('Bearer abc.def and sk-abcdefghijklmnopqrstuvwxyz'),
    '[redacted] and [redacted]',
  );
});

test('catalog model listing is passed through unchanged', () => {
  const catalog = [{id: 'anthropic', models: [{id: 'claude-opus-5-5', effort: 'low'}]}];
  assert.deepEqual(modelsFromCatalog(catalog, 'anthropic'), [
    {id: 'claude-opus-5-5', effort: 'low'},
  ]);
  assert.deepEqual(modelsFromCatalog(catalog, 'openai'), []);
  assert.deepEqual(catalogFrom(catalog).modelsFor('anthropic'), [
    {id: 'claude-opus-5-5', effort: 'low'},
  ]);
});

test('host catalog parsing exposes labels, defaults, and effort without shipping a model list', async () => {
  const {readFile} = await import('node:fs/promises');
  const json = await readFile(new URL('./fixtures/host-catalog.json', import.meta.url), 'utf8');
  const catalog = parseCatalog(json);
  assert.equal(providerLabel(catalog, 'anthropic'), 'Anthropic');
  assert.equal(providerLabel(catalog, 'google'), 'Google Gemini');
  assert.equal(providerLabel([], 'not-a-provider'), '');
  assert.equal(defaultModel(catalog, 'anthropic'), 'claude-opus-5-5');
  assert.equal(defaultModel(catalog, 'google'), '');
  assert.equal(modelEffort(catalog, 'openai', 'gpt-5.2'), 'low');
  assert.equal(modelEffort(catalog, 'openai', 'gpt-4.1'), undefined);
  assert.equal(catalogAllowsModel(catalog, 'anthropic', 'claude-opus-5-5'), true);
  assert.equal(
    catalogAllowsModel(catalog, 'anthropic', 'claude-legacy-host', {legacyAnthropic: true}),
    true,
  );
  assert.equal(catalogAllowsModel(catalog, 'anthropic', 'claude-legacy-host'), false);
  assert.equal(catalogAllowsModel(catalog, 'openai', 'openrouter/auto'), false);
  assert.throws(() => parseCatalog('{"id":"anthropic"}'), /catalog must be an array/);
});
