/** Host-supplied model catalog. This package ships no model list. */
import { capabilities } from './capabilities.js';
function asEntries(value) {
    if (!Array.isArray(value)) {
        throw new Error('catalog must be an array');
    }
    return value.map((entry, index) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            throw new Error(`catalog entry ${String(index)} must be an object`);
        }
        const item = entry;
        if (typeof item.id !== 'string' || item.id.length < 1) {
            throw new Error(`catalog entry ${String(index)} needs an id`);
        }
        if (item.models !== undefined && !Array.isArray(item.models)) {
            throw new Error(`catalog entry ${String(index)} models must be an array`);
        }
        const models = (item.models ?? []).map((model, modelIndex) => {
            if (!model || typeof model !== 'object' || Array.isArray(model)) {
                throw new Error(`catalog entry ${String(index)} model ${String(modelIndex)} must be an object`);
            }
            const info = model;
            if (typeof info.id !== 'string' || info.id.length < 1) {
                throw new Error(`catalog entry ${String(index)} model ${String(modelIndex)} needs an id`);
            }
            const effort = info.effort;
            if (effort !== undefined && typeof effort !== 'string') {
                throw new Error(`catalog entry ${String(index)} model ${String(modelIndex)} effort must be a string`);
            }
            return effort === undefined ? { id: info.id } : { id: info.id, effort };
        });
        return {
            id: item.id,
            models,
            ...(typeof item.label === 'string' ? { label: item.label } : {}),
            ...(typeof item.default_model === 'string' ? { default_model: item.default_model } : {}),
        };
    });
}
/** Parse a host catalog JSON document. The host owns the file and its contents. */
export function parseCatalog(json) {
    return asEntries(JSON.parse(json));
}
export function catalogEntry(catalog, provider) {
    return (catalog ?? []).find((item) => item.id === provider);
}
/** Prefer the host catalog label, then the static capability label. */
export function providerLabel(catalog, provider) {
    return catalogEntry(catalog, provider)?.label ?? capabilities(provider)?.label ?? '';
}
export function defaultModel(catalog, provider) {
    return catalogEntry(catalog, provider)?.default_model ?? '';
}
export function supportedModels(catalog, provider) {
    return catalogEntry(catalog, provider)?.models ?? [];
}
export function modelEffort(catalog, provider, model) {
    return supportedModels(catalog, provider).find((item) => item.id === model)?.effort;
}
export function catalogAllowsModel(catalog, provider, model, options = {}) {
    if (supportedModels(catalog, provider).some((item) => item.id === model)) {
        return true;
    }
    return Boolean(options.legacyAnthropic && provider === 'anthropic' && /^claude-[A-Za-z0-9.-]+$/.test(model));
}
//# sourceMappingURL=catalog.js.map