//! Canonical request shape accepted by a host transport.

pub const PROVIDER_IDS: &[&str] = &["anthropic", "openai", "google", "openrouter"];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CanonicalProtocol {
    pub id: &'static str,
    pub path: &'static str,
    pub structured_output: &'static str,
    pub stream: bool,
}

pub const CANONICAL_PROTOCOL: CanonicalProtocol = CanonicalProtocol {
    id: "openai-chat-completions",
    path: "/v1/chat/completions",
    structured_output: "response_format.json_schema",
    stream: false,
};

pub fn is_provider_id(value: &str) -> bool {
    PROVIDER_IDS.contains(&value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn protocol_is_openai_compatible_structured_chat() {
        assert_eq!(CANONICAL_PROTOCOL.path, "/v1/chat/completions");
        assert_eq!(
            CANONICAL_PROTOCOL.structured_output,
            "response_format.json_schema"
        );
        assert_eq!(
            PROVIDER_IDS,
            &["anthropic", "openai", "google", "openrouter"]
        );
        for id in PROVIDER_IDS {
            assert!(is_provider_id(id));
        }
        assert!(!is_provider_id("portkey"));
    }
}
