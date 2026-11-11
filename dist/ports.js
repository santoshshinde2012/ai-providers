export function catalogFrom(entries) {
    return {
        modelsFor(provider) {
            return entries.find((item) => item.id === provider)?.models ?? [];
        },
    };
}
//# sourceMappingURL=ports.js.map