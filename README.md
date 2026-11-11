# @meridian/ai-providers

Internal protocol layer for Meridian's four direct model providers (Anthropic, OpenAI, Google Gemini, and OpenRouter).

The canonical request/response shape is OpenAI-compatible chat completions with `response_format.json_schema`. Each adapter is a strategy that translates that shape into the provider's native structured-output API. Errors are normalized to `{provider, type, message, status}` and reduced to type and message only on the wire. Keys, raw bodies, headers and request ids are never forwarded.

This package does not send HTTP and does not hold keys. The bundled, source-pinned Portkey gateway remains the loopback transport behind this port, so the existing HMAC pairing, fetch allow-list and Rust client stay unchanged. The port is the swap point if that transport is replaced later (for example with the Vercel AI SDK). See [ADR 0002](../../docs/adr/0002-ai-provider-client.md).
