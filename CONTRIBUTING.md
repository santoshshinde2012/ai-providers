# Contributing

## Setup

```sh
npm ci
npm test
cargo test --locked
```

`npm test` builds the TypeScript, then runs unit and contract tests against recorded fixtures. Do not add tests that call a provider network or read an API key.

## Adding a provider

1. Add the provider id to `PROVIDER_IDS` in `src/protocol.ts` and a descriptor in `src/capabilities.ts`.
2. Implement the `ProviderAdapter` port in `src/adapters/<id>.ts`. The adapter must be a pure function of the canonical request: no HTTP, no key storage, and no key in the JSON body.
3. Register it in `src/adapters/registry.ts`.
4. Record a connection-check fixture under `test/fixtures/<id>-connection-check.upstream.json` using a clearly fake placeholder key (for example `sk-test-key-not-used-live`).
5. Run `npm test` and `npm run format`.

The host supplies transport and catalogs. Keep that boundary.

## Style

TypeScript is strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`). ESLint uses `strictTypeChecked` plus Prettier. Match the existing module layout: protocol, ports, capabilities, schema, errors, and one adapter file per provider.

## Versioning

Follow semver. Record changes in `CHANGELOG.md`. Tags look like `v0.1.0`.
