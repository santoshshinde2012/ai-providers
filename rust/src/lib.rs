//! Canonical OpenAI-compatible protocol, Anthropic schema sanitization,
//! and sanitized provider errors. This crate does not perform HTTP or
//! store keys; a host supplies transport and catalogs.

mod errors;
mod protocol;
mod schema;

pub use errors::{
    normalize_provider_error, redact_secrets, sanitized_provider_error, ProviderError,
};
pub use protocol::{is_provider_id, CanonicalProtocol, CANONICAL_PROTOCOL, PROVIDER_IDS};
pub use schema::sanitize_anthropic_schema;
