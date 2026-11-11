# Security

## Secrets

This package never stores, logs, or prints API keys. Adapters may place a caller-supplied key in an Authorization or provider header for the host transport to send; they must never write a key into a request body, a fixture's request body, or an error payload.

`redactSecrets` and `sanitizedProviderError` strip key-shaped tokens (`sk-…`, `sk-ant-…`, `Bearer …`) and forward only `{error:{type,message}}` on the wire. Do not log raw provider bodies, headers, or request ids.

Tests and recorded fixtures use synthetic placeholders such as `sk-test-key-not-used-live`. Never commit a live credential. CI must not be given provider keys.

## Reporting a vulnerability

Please use [GitHub Security Advisories](https://github.com/santoshshinde2012/ai-providers/security/advisories/new) for this repository. Do not open a public issue that includes a secret or a raw provider response.
