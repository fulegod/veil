/**
 * Type declarations for shamirs-secret-sharing v2.x
 * (the package ships JS-only; types must be provided locally).
 */
declare module "shamirs-secret-sharing" {
  export interface SplitOptions {
    shares: number;
    threshold: number;
    random?: (n: number) => Buffer;
  }

  /** Split a secret buffer into N shares with M-of-N threshold. */
  export function split(secret: Buffer, opts: SplitOptions): Buffer[];

  /** Combine M or more shares to reconstruct the original secret. */
  export function combine(shares: Buffer[]): Buffer;
}
