import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_PROTOCOL,
  PROVIDER_IDS,
  anthropicOutputConfig,
  capabilities,
  modelsFromCatalog,
  normalizeProviderError,
  redactSecrets,
  sanitizeAnthropicSchema,
  sanitizedProviderError,
  toUpstream,
} from '../src/index.mjs';

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

const request = {
  model: 'claude-opus-5-5',
  max_tokens: 256,
  messages: [
    {role: 'system', content: 'Return the schema only.'},
    {role: 'user', content: 'Ping.'},
  ],
  response_format: {type: 'json_schema', json_schema: {name: 'connection_check', strict: true, schema}},
  reasoning_effort: 'low',
  stream: false,
};

test('canonical protocol is OpenAI-compatible structured chat', () => {
  assert.equal(CANONICAL_PROTOCOL.path, '/v1/chat/completions');
  assert.equal(CANONICAL_PROTOCOL.structuredOutput, 'response_format.json_schema');
  assert.deepEqual(PROVIDER_IDS, ['anthropic', 'openai', 'google', 'openrouter']);
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
  const body = Buffer.from(JSON.stringify({
    error: {
      type: 'invalid_request_error',
      message: 'anthropic error: type arrays must use anyOf. sk-ant-synthetic-secret-do-not-keep is not a valid field',
      request_id: 'req_should_not_leak',
      raw_body: '{"secret":true}',
    },
  }));
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
  assert.equal(redactSecrets('Bearer abc.def and sk-abcdefghijklmnopqrstuvwxyz'), '[redacted] and [redacted]');
});

test('Anthropic adapter produces the exact native structured-output body', () => {
  const upstream = toUpstream('anthropic', request, {apiKey: 'sk-ant-test-key-not-used-live'});
  assert.equal(upstream.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(upstream.headers['anthropic-version'], '2026-10-21');
  assert.deepEqual(upstream.body.output_config, anthropicOutputConfig(request));
  assert.deepEqual(upstream.body.output_config.format.schema, sanitizeAnthropicSchema(schema));
  assert.equal(upstream.body.output_config.effort, 'low');
  assert.equal('temperature' in upstream.body, false);
  assert.equal('stream' in upstream.body, false);
  assert.equal('response_format' in upstream.body, false);
  assert.equal('reasoning_effort' in upstream.body, false);
  assert.deepEqual(upstream.body.system, [{type: 'text', text: 'Return the schema only.'}]);
  // The key is only in the constructed header, never in the body.
  assert.equal(JSON.stringify(upstream.body).includes('sk-ant-'), false);
});

test('catalog model listing is passed through unchanged', () => {
  const catalog = [{id: 'anthropic', models: [{id: 'claude-opus-5-5', effort: 'low'}]}];
  assert.deepEqual(modelsFromCatalog(catalog, 'anthropic'), [{id: 'claude-opus-5-5', effort: 'low'}]);
  assert.deepEqual(modelsFromCatalog(catalog, 'openai'), []);
});
