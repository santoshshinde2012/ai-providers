/** Rewrite a JSON Schema into the subset Anthropic structured outputs accept. */
const STRIP = new Set([
    '$schema',
    '$id',
    'title',
    'description',
    'minLength',
    'maxLength',
    'pattern',
    'format',
    'minimum',
    'maximum',
    'minItems',
    'maxItems',
    'uniqueItems',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'multipleOf',
    'prefixItems',
]);
export function sanitizeAnthropicSchema(value) {
    if (Array.isArray(value))
        return value.map((item) => sanitizeAnthropicSchema(item));
    if (!value || typeof value !== 'object')
        return value;
    const input = value;
    let out = {};
    for (const [key, child] of Object.entries(input)) {
        if (STRIP.has(key))
            continue;
        if (key === 'oneOf') {
            out.anyOf = sanitizeAnthropicSchema(child);
            continue;
        }
        out[key] = sanitizeAnthropicSchema(child);
    }
    if (Array.isArray(out.type)) {
        const types = out.type.filter((item) => typeof item === 'string');
        const rest = { ...out };
        delete rest.type;
        delete rest.anyOf;
        out = {
            anyOf: types.map((item) => (item === 'null' ? { type: 'null' } : { type: item, ...rest })),
        };
    }
    if (out.type === 'object' || (out.properties && out.additionalProperties === undefined)) {
        out.additionalProperties = false;
    }
    return out;
}
//# sourceMappingURL=schema.js.map