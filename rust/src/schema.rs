//! Rewrite a JSON Schema into the subset Anthropic structured outputs accept.

use serde_json::{Map, Value};

const STRIP: &[&str] = &[
    "$schema",
    "$id",
    "title",
    "description",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "minimum",
    "maximum",
    "minItems",
    "maxItems",
    "uniqueItems",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "prefixItems",
];

pub fn sanitize_anthropic_schema(value: Value) -> Value {
    match value {
        Value::Array(items) => {
            Value::Array(items.into_iter().map(sanitize_anthropic_schema).collect())
        }
        Value::Object(input) => sanitize_object(input),
        other => other,
    }
}

fn sanitize_object(input: Map<String, Value>) -> Value {
    let mut out = Map::new();
    for (key, child) in input {
        if STRIP.contains(&key.as_str()) {
            continue;
        }
        if key == "oneOf" {
            out.insert("anyOf".into(), sanitize_anthropic_schema(child));
            continue;
        }
        out.insert(key, sanitize_anthropic_schema(child));
    }

    if let Some(Value::Array(types)) = out.get("type").cloned() {
        let types: Vec<String> = types
            .iter()
            .filter_map(Value::as_str)
            .map(ToOwned::to_owned)
            .collect();
        out.remove("type");
        let mut rest = out.clone();
        rest.remove("anyOf");
        let variants = types
            .into_iter()
            .map(|item| {
                if item == "null" {
                    json_type("null")
                } else {
                    let mut variant = rest.clone();
                    variant.insert("type".into(), Value::String(item));
                    Value::Object(variant)
                }
            })
            .collect();
        for key in rest.keys() {
            out.remove(key);
        }
        out.insert("anyOf".into(), Value::Array(variants));
    }

    let is_object = out.get("type").and_then(Value::as_str) == Some("object");
    let has_properties = out.contains_key("properties");
    if (is_object || has_properties) && !out.contains_key("additionalProperties") {
        out.insert("additionalProperties".into(), Value::Bool(false));
    }
    Value::Object(out)
}

fn json_type(name: &str) -> Value {
    let mut m = Map::new();
    m.insert("type".into(), Value::String(name.into()));
    Value::Object(m)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn rewrites_one_of_and_type_arrays_to_any_of() {
        let schema = json!({
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "title": "check",
            "properties": {
                "ok": { "type": "boolean" },
                "note": { "type": ["string", "null"], "description": "optional" },
                "choice": { "oneOf": [{ "type": "string" }, { "type": "number" }] }
            },
            "required": ["ok"]
        });
        let out = sanitize_anthropic_schema(schema);
        assert!(out.get("$schema").is_none());
        assert!(out.get("title").is_none());
        assert_eq!(out["additionalProperties"], false);
        assert_eq!(
            out["properties"]["note"],
            json!({"anyOf":[{"type":"string"},{"type":"null"}]})
        );
        assert_eq!(
            out["properties"]["choice"],
            json!({"anyOf":[{"type":"string"},{"type":"number"}]})
        );
        assert!(out["properties"]["note"].get("description").is_none());
    }
}
