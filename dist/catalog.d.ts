import type { CatalogProvider, ModelInfo } from './ports.js';
export type { CatalogProvider, ModelInfo };
/** Parse a host catalog JSON document. The host owns the file and its contents. */
export declare function parseCatalog(json: string): CatalogProvider[];
export declare function catalogEntry(catalog: readonly CatalogProvider[] | null | undefined, provider: string): CatalogProvider | undefined;
/** Prefer the host catalog label, then the static capability label. */
export declare function providerLabel(catalog: readonly CatalogProvider[] | null | undefined, provider: string): string;
export declare function defaultModel(catalog: readonly CatalogProvider[] | null | undefined, provider: string): string;
export declare function supportedModels(catalog: readonly CatalogProvider[] | null | undefined, provider: string): readonly ModelInfo[];
export declare function modelEffort(catalog: readonly CatalogProvider[] | null | undefined, provider: string, model: string): string | undefined;
export declare function catalogAllowsModel(catalog: readonly CatalogProvider[] | null | undefined, provider: string, model: string, options?: {
    legacyAnthropic?: boolean;
}): boolean;
//# sourceMappingURL=catalog.d.ts.map