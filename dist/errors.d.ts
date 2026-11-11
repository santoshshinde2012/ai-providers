/** Normalized, sanitized provider errors. The wire format is type and message only. */
import { Buffer } from 'node:buffer';
import type { NormalizedProviderError } from './ports.js';
export declare function redactSecrets(text: string): string;
export declare function normalizeProviderError(status: number, body: unknown, provider: string): NormalizedProviderError;
export declare function sanitizedProviderError(status: number, body: unknown, provider: string): Buffer;
//# sourceMappingURL=errors.d.ts.map