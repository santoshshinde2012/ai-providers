# ai-providers

Canonical OpenAI-compatible protocol and per-provider strategy adapters for structured-output chat.

The package does not send HTTP and does not store keys. A host application supplies a transport and, optionally, a model catalog.

## Install

```sh
npm install github:santoshshinde2012/ai-providers#v0.1.2
```

The `v0.1.2` tag is the supported pin. The compiled `dist/` tree is included so a git dependency does not need a local TypeScript build. A host must bundle the package into its own application if it ships as a desktop or offline product; this library is not a hosted service.

## Usage

```js
import {
  toUpstream,
  sanitizeAnthropicSchema,
  sanitizedProviderError,
  modelsFromCatalog,
} from 'ai-providers';

const upstream = toUpstream('anthropic', request, {apiKey, version, workspaceId});
// workspaceId is optional; when set, Anthropic requests include anthropic-workspace-id.
// The host transport sends upstream.url, upstream.headers and upstream.body.
```

A browser host should import `ai-providers/protocol` and `ai-providers/capabilities` (and, if needed, `ai-providers/catalog`). Those entry points do not use Node builtins. The root `ai-providers` entry remains for Node hosts that also need adapters and sanitized errors.

```js
import {PROVIDER_IDS} from 'ai-providers/protocol';
import {PROVIDER_CAPABILITIES} from 'ai-providers/capabilities';
import {parseCatalog, providerLabel} from 'ai-providers/catalog';

const catalog = parseCatalog(hostJson); // host-owned JSON, never shipped by this package
providerLabel(catalog, 'anthropic');
```

`toUpstream` may place a caller-supplied key in a header. It never writes the key into the JSON body. Errors are normalized to `{provider, type, message, status}` and reduced to type and message only on the wire.

## Architecture

```
Canonical protocol (OpenAI-compatible chat + response_format.json_schema)
        │
        ▼
ProviderAdapter port (toUpstream)
   ┌────┼────┬─────────┐
   ▼    ▼    ▼         ▼
Anthropic  OpenAI  Google  OpenRouter
        │
        ▼
UpstreamRequest          sanitized errors (type + message only)
```

- **Protocol** (`src/protocol.ts`): the only request shape adapters accept.
- **Ports** (`src/ports.ts`): `ProviderAdapter`, `ModelCatalog`, `ErrorNormalizer`, `CapabilityLookup`.
- **Adapters** (`src/adapters/`): one strategy per provider. A new provider is a new module registered in the adapter map.
- **Capabilities** (`src/capabilities.ts`): static descriptors (ids, labels, upstream shapes).
- **Catalog** (`src/catalog.ts`): parse a host-supplied catalog JSON document. This package does not ship a model list. Use `parseCatalog`, `providerLabel`, `modelsFromCatalog`, or `catalogFrom`.
- **Schema / errors**: Anthropic schema rewrite and secret-redacting error sanitization.

A later transport (loopback sidecar, in-process client, or another HTTP stack) can sit behind the same port without changing the adapters.

## Rust

`Cargo.toml` defines a small `ai-providers` crate that mirrors the protocol constants, Anthropic schema rewrite, and sanitized error helpers.

```rust
use ai_providers::{ProviderCatalog, sanitize_anthropic_schema, PROVIDER_IDS};

let catalog = ProviderCatalog::from_json(host_json)?;
let label = catalog.provider_label("anthropic");
```

## Test

```sh
npm test
cargo test --locked
```

Contract tests compare `toUpstream` output for each provider against recorded fixtures in `test/fixtures/`. They never make a network call or read a live key.

## Licence

MIT. See [LICENSE](LICENSE).
