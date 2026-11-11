//! Host-supplied model catalog. This crate ships no model list.
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub effort: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CatalogProvider {
    pub id: String,
    pub label: Option<String>,
    pub default_model: Option<String>,
    #[serde(default)]
    pub models: Vec<ModelInfo>,
}

/// Capability labels used when a host catalog entry has no label.
pub fn capability_label(provider: &str) -> Option<&'static str> {
    match provider {
        "anthropic" => Some("Anthropic"),
        "openai" => Some("OpenAI"),
        "google" => Some("Google Gemini"),
        "openrouter" => Some("OpenRouter"),
        _ => None,
    }
}

#[derive(Debug, Clone)]
pub struct ProviderCatalog {
    entries: Vec<CatalogProvider>,
}

impl ProviderCatalog {
    pub fn from_json(json: &str) -> Result<Self, String> {
        let entries: Vec<CatalogProvider> =
            serde_json::from_str(json).map_err(|error| format!("catalog is invalid: {error}"))?;
        if entries.iter().any(|entry| entry.id.is_empty()) {
            return Err("catalog entry needs an id".into());
        }
        Ok(Self { entries })
    }

    pub fn entry(&self, provider: &str) -> Option<&CatalogProvider> {
        self.entries.iter().find(|entry| entry.id == provider)
    }

    /// Prefer the host catalog label, then the static capability label.
    pub fn provider_label(&self, provider: &str) -> &str {
        self.entry(provider)
            .and_then(|entry| entry.label.as_deref())
            .or_else(|| capability_label(provider))
            .unwrap_or("")
    }

    pub fn default_model(&self, provider: &str) -> &str {
        self.entry(provider)
            .and_then(|entry| entry.default_model.as_deref())
            .unwrap_or("")
    }

    pub fn supported_models(&self, provider: &str) -> Vec<&str> {
        self.entry(provider)
            .map(|entry| entry.models.iter().map(|model| model.id.as_str()).collect())
            .unwrap_or_default()
    }

    pub fn effort(&self, provider: &str, model: &str) -> Option<&str> {
        self.entry(provider)?
            .models
            .iter()
            .find(|item| item.id == model)?
            .effort
            .as_deref()
    }

    pub fn allows_model(&self, provider: &str, model: &str, legacy_anthropic: bool) -> bool {
        if self
            .supported_models(provider)
            .iter()
            .any(|known| *known == model)
        {
            return true;
        }
        legacy_anthropic
            && provider == "anthropic"
            && model.starts_with("claude-")
            && !model.contains('/')
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const HOST: &str = r#"[
      {"id":"anthropic","label":"Anthropic","default_model":"claude-opus-5-5","models":[{"id":"claude-opus-5-5"}]},
      {"id":"openai","label":"OpenAI","default_model":"gpt-4.1","models":[{"id":"gpt-4.1"},{"id":"gpt-5.2","effort":"low"}]}
    ]"#;

    #[test]
    fn host_catalog_exposes_labels_defaults_and_effort() {
        let catalog = ProviderCatalog::from_json(HOST).unwrap();
        assert_eq!(catalog.provider_label("anthropic"), "Anthropic");
        assert_eq!(catalog.provider_label("google"), "Google Gemini");
        assert_eq!(catalog.provider_label("unknown"), "");
        assert_eq!(catalog.default_model("anthropic"), "claude-opus-5-5");
        assert_eq!(catalog.default_model("google"), "");
        assert_eq!(catalog.effort("openai", "gpt-5.2"), Some("low"));
        assert_eq!(catalog.effort("openai", "gpt-4.1"), None);
        assert!(catalog.allows_model("anthropic", "claude-opus-5-5", false));
        assert!(catalog.allows_model("anthropic", "claude-legacy-host", true));
        assert!(!catalog.allows_model("anthropic", "claude-legacy-host", false));
        assert!(!catalog.allows_model("openai", "openrouter/auto", false));
        assert!(ProviderCatalog::from_json("{\"id\":\"anthropic\"}").is_err());
        assert!(capability_label("openai") == Some("OpenAI"));
    }
}
