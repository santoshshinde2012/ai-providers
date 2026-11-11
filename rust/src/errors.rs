//! Normalized, sanitized provider errors. The HTTP wire format remains
//! `{error:{type,message}}` only. The richer object is for in-process callers.

use serde::Serialize;
use serde_json::{json, Value};

const TYPE_MAX: usize = 120;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ProviderError {
    pub provider: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub message: String,
    pub status: u16,
}

fn fallback_for(status: u16) -> &'static str {
    match status {
        401 => "provider_authentication_failed",
        429 => "provider_rate_limited",
        408 => "gateway_timeout",
        _ => "provider_request_failed",
    }
}

fn is_type_token(value: &str) -> bool {
    let len = value.len();
    (1..=TYPE_MAX).contains(&len)
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'.' | b'_' | b'-'))
}

/// Redact API-key-shaped tokens and Bearer credentials, then cap length.
pub fn redact_secrets(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let bytes = text.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if let Some(skip) = match_secret(bytes, i) {
            out.push_str("[redacted]");
            i += skip;
            continue;
        }
        let ch = text[i..]
            .chars()
            .next()
            .expect("index stays on a char boundary");
        out.push(ch);
        i += ch.len_utf8();
    }
    out.chars().take(400).collect()
}

fn match_secret(bytes: &[u8], i: usize) -> Option<usize> {
    if bearer_match(bytes, i) {
        let mut end = i + "Bearer".len();
        while end < bytes.len() && bytes[end].is_ascii_whitespace() {
            end += 1;
        }
        while end < bytes.len() && !bytes[end].is_ascii_whitespace() {
            end += 1;
        }
        return Some(end - i);
    }
    sk_match(bytes, i)
}

fn bearer_match(bytes: &[u8], i: usize) -> bool {
    bytes[i..].starts_with(b"Bearer") && bytes.get(i + 6).is_some_and(u8::is_ascii_whitespace)
}

fn sk_match(bytes: &[u8], i: usize) -> Option<usize> {
    if !bytes[i..].starts_with(b"sk-") {
        return None;
    }
    let mut pos = i + 3;
    if bytes[pos..].starts_with(b"ant-") {
        pos += 4;
    }
    let start_body = pos;
    while pos < bytes.len() && is_key_char(bytes[pos]) {
        pos += 1;
    }
    if pos - start_body >= 8 {
        Some(pos - i)
    } else {
        None
    }
}

fn is_key_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'-'
}

pub fn normalize_provider_error(status: u16, body: &[u8], provider: &str) -> ProviderError {
    let fallback = fallback_for(status);
    let mut kind = fallback.to_string();
    let mut message = fallback.replace('_', " ");
    if let Ok(parsed) = serde_json::from_slice::<Value>(body) {
        if let Some(err) = parsed.get("error").filter(|e| e.is_object()) {
            if let Some(t) = err.get("type").and_then(Value::as_str) {
                if is_type_token(t) {
                    kind = t.to_string();
                }
            }
            if let Some(m) = err.get("message").and_then(Value::as_str) {
                let cleaned = redact_secrets(m).trim().to_string();
                if !cleaned.is_empty() {
                    message = cleaned;
                }
            }
        }
    }
    ProviderError {
        provider: provider.to_string(),
        kind,
        message,
        status,
    }
}

/// Wire body: `{"error":{"type","message"}}` only.
pub fn sanitized_provider_error(status: u16, body: &[u8], provider: &str) -> Vec<u8> {
    let error = normalize_provider_error(status, body, provider);
    serde_json::to_vec(&json!({
        "error": { "type": error.kind, "message": error.message }
    }))
    .expect("sanitized error is valid JSON")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn errors_keep_only_sanitized_type_and_message() {
        let body = serde_json::to_vec(&json!({
            "error": {
                "type": "invalid_request_error",
                "message": "anthropic error: type arrays must use anyOf. sk-ant-synthetic-secret-do-not-keep is not a valid field",
                "request_id": "req_should_not_leak",
                "raw_body": "{\"secret\":true}"
            }
        }))
        .unwrap();
        let normalized = normalize_provider_error(400, &body, "anthropic");
        assert_eq!(
            normalized,
            ProviderError {
                provider: "anthropic".into(),
                kind: "invalid_request_error".into(),
                message:
                    "anthropic error: type arrays must use anyOf. [redacted] is not a valid field"
                        .into(),
                status: 400,
            }
        );
        let wire: Value =
            serde_json::from_slice(&sanitized_provider_error(400, &body, "anthropic")).unwrap();
        assert_eq!(
            wire.as_object().unwrap().keys().collect::<Vec<_>>(),
            vec!["error"]
        );
        let err = wire["error"].as_object().unwrap();
        let mut keys: Vec<_> = err.keys().cloned().collect();
        keys.sort();
        assert_eq!(keys, ["message", "type"]);
        let encoded = wire.to_string();
        assert!(!encoded.contains("sk-ant-"));
        assert!(!encoded.contains("request_id"));
        assert!(!encoded.contains("raw_body"));
        assert_eq!(
            redact_secrets("Bearer abc.def and sk-abcdefghijklmnopqrstuvwxyz"),
            "[redacted] and [redacted]"
        );
    }
}
