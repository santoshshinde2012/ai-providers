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

test('anthropic workspaceId adds anthropic-workspace-id only when set', () => {
  const {model, options} = recorded.requests.anthropic;
  const request = {...recorded.canonical, model};
  const without = toUpstream('anthropic', request, options);
  assert.equal(without.headers['anthropic-workspace-id'], undefined);
  const empty = toUpstream('anthropic', request, {...options, workspaceId: '  '});
  assert.equal(empty.headers['anthropic-workspace-id'], undefined);
  const withId = toUpstream('anthropic', request, {
    ...options,
    workspaceId: ' wrkspc_01EXAMPLEWORKSPACE ',
  });
  assert.equal(withId.headers['anthropic-workspace-id'], 'wrkspc_01EXAMPLEWORKSPACE');
  assert.equal(withId.headers['anthropic-version'], without.headers['anthropic-version']);
  assert.deepEqual(withId.body, without.body);
  assert.equal(JSON.stringify(withId).includes('sk-ant-synthetic'), false);
});
