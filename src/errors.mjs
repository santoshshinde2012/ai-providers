// Normalized, sanitized provider errors. The HTTP wire format remains
// {error:{type,message}} only. The richer object is for in-process callers.
const FALLBACK = {
  401: 'provider_authentication_failed',
  429: 'provider_rate_limited',
  408: 'gateway_timeout',
};
const TYPE = /^[A-Za-z0-9._-]{1,120}$/;
const SECRET = /sk-(?:ant-)?[A-Za-z0-9_-]{8,}|Bearer\s+\S+/gi;

export function redactSecrets(text) {
  return text.replace(SECRET, '[redacted]').slice(0, 400);
}

export function normalizeProviderError(status, body, provider) {
  const fallback = FALLBACK[status] ?? 'provider_request_failed';
  let type = fallback;
  let message = fallback.replaceAll('_', ' ');
  try {
    const parsed = JSON.parse(Buffer.isBuffer(body) ? body.toString('utf8') : String(body));
    const err = parsed?.error;
    if (err && typeof err === 'object' && !Array.isArray(err)) {
      if (typeof err.type === 'string' && TYPE.test(err.type)) type = err.type;
      if (typeof err.message === 'string') {
        const cleaned = redactSecrets(err.message).trim();
        if (cleaned) message = cleaned;
      }
    }
  } catch {
    // Keep the generic fallback. Never forward the raw provider body.
  }
  return {provider, type, message, status};
}

export function sanitizedProviderError(status, body, provider) {
  const error = normalizeProviderError(status, body, provider);
  return Buffer.from(JSON.stringify({error: {type: error.type, message: error.message}}));
}
