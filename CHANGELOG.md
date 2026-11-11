# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/).

## [0.1.1] - 2026-11-12

### Added

- Host catalog parsing in TypeScript (`parseCatalog`, `providerLabel`, `defaultModel`, `supportedModels`, `modelEffort`, `catalogAllowsModel`) and in the Rust crate (`ProviderCatalog::from_json`). Model lists still come from the host; this package does not ship a catalog.
- Catalog entries may include optional `label` and `default_model`. Labels fall back to static capability labels when the host omits them.
- CI runs `cargo test --locked` so the crate is checked on every push and tag.

[0.1.1]: https://github.com/santoshshinde2012/ai-providers/releases/tag/v0.1.1

## [0.1.0] - 2026-11-11

### Added

- Canonical OpenAI-compatible chat protocol with `response_format.json_schema`.
- `ProviderAdapter` port and strategy adapters for Anthropic, OpenAI, Google Gemini, and OpenRouter.
- Anthropic schema sanitization (`oneOf` and type arrays rewritten to `anyOf`).
- Sanitized provider errors: in-process `{provider, type, message, status}`, wire format `{error:{type,message}}` only. Secrets are redacted.
- Capability descriptors and host-supplied catalog helpers. This package does not ship a model catalog and does not send HTTP.
- Recorded contract fixtures per provider. Tests never call a live API or read a real key.
- A small Rust crate that mirrors the protocol constants, schema rewrite, and error redaction.

[0.1.0]: https://github.com/santoshshinde2012/ai-providers/releases/tag/v0.1.0
