import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {
  PROVIDER_IDS,
  anthropicOutputConfig,
  sanitizeAnthropicSchema,
  toUpstream,
} from '../dist/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, 'fixtures');
const recorded = JSON.parse(
  fs.readFileSync(path.join(fixtures, 'connection-check.request.json'), 'utf8'),
);

for (const provider of PROVIDER_IDS) {
  test(`contract: ${provider} connection-check upstream matches the recorded fixture`, () => {
    const {model, options} = recorded.requests[provider];
    const request = {...recorded.canonical, model};
    const actual = toUpstream(provider, request, options);
    const expected = JSON.parse(
      fs.readFileSync(path.join(fixtures, `${provider}-connection-check.upstream.json`), 'utf8'),
    );
    assert.deepEqual(actual, expected);
    const body = JSON.stringify(actual.body);
    assert.equal(body.includes(options.apiKey), false);
    assert.equal(JSON.stringify(actual).includes('sk-ant-synthetic'), false);
    if (provider === 'anthropic') {
      assert.deepEqual(actual.body.output_config, anthropicOutputConfig(request));
      assert.deepEqual(
        actual.body.output_config.format.schema,
        sanitizeAnthropicSchema(recorded.schema),
      );
      assert.equal('temperature' in actual.body, false);
      assert.equal('stream' in actual.body, false);
      assert.equal('response_format' in actual.body, false);
      assert.equal('reasoning_effort' in actual.body, false);
    }
  });
}

test('unknown provider is rejected without touching a transport', () => {
  assert.throws(
    () =>
      toUpstream(
        'unknown',
        {...recorded.canonical, model: 'x'},
        {apiKey: 'sk-test-key-not-used-live'},
      ),
    {message: 'unsupported_provider'},
  );
});
