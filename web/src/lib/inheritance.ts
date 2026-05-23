/**
 * Inheritance — dead-man's switch with Shamir Secret Sharing + drand timelock.
 *
 * Caso de uso: una persona quiere que SI deja de mover su wallet por X meses
 * (ej. murió, está en coma, en prisión), sus credenciales/documentos/keys
 * privadas se vuelvan recuperables por un quórum de M-de-N validadores.
 *
 * Garantías criptográficas:
 *  - El secret (plaintext) se cifra con drand timelock contra una fecha futura
 *    = ahora + heartbeatDays. Mientras el owner haga heartbeat (extendEntity),
 *    el target se va corriendo hacia el futuro y NADIE puede descifrar.
 *  - Si el owner no extiende, drand publica el round → cualquier validador
 *    puede descifrar SU share. Pero la share por sí sola no sirve.
 *  - El secret está split en N shares Shamir M-of-N. Solo si M validadores
 *    cooperan pueden reconstruir el secret.
 *
 * Threat model (MVP):
 *  - Los validadores son convenciones sociales: el creator decide a quién
 *    darle el link de recovery. Cualquiera con acceso a M shares + drand
 *    round puede reconstruir. Versión v2: cifrar cada share con la pubkey
 *    específica de cada validator (ECIES sobre secp256k1).
 */

import {
  split as shamirSplit,
  combine as shamirCombine,
} from "shamirs-secret-sharing";

// ─── Presets ────────────────────────────────────────────────────────────────

export const HEARTBEAT_PRESETS = {
  "3m": { days: 90, label: "3 months" },
  "6m": { days: 180, label: "6 months" },
  "1y": { days: 365, label: "1 year" },
} as const;

export type HeartbeatPreset = keyof typeof HEARTBEAT_PRESETS;

export const THRESHOLD_PRESETS = [
  { threshold: 2, total: 3, label: "2-of-3" },
  { threshold: 3, total: 5, label: "3-of-5" }, // default
  { threshold: 5, total: 7, label: "5-of-7" },
] as const;

export const DEFAULT_HEARTBEAT: HeartbeatPreset = "6m";
export const DEFAULT_THRESHOLD = { threshold: 3, total: 5 };

// ─── Shamir wrappers ────────────────────────────────────────────────────────

/**
 * Split a UTF-8 string into N Shamir shares with M-of-N threshold.
 * Each share is a Uint8Array that includes its own index — so order
 * doesn't matter when combining.
 */
export function splitSecret(
  plaintext: string,
  threshold: number,
  total: number,
): Uint8Array[] {
  if (threshold < 2) throw new Error("threshold must be >= 2");
  if (total < threshold) throw new Error("total must be >= threshold");
  if (total > 255) throw new Error("total must be <= 255");

  const secretBytes = new TextEncoder().encode(plaintext);
  const shares = shamirSplit(Buffer.from(secretBytes), {
    shares: total,
    threshold,
  });
  // Library returns Buffer[]; normalize to Uint8Array[] for browser safety
  return shares.map((s) => new Uint8Array(s));
}

/**
 * Combine M shares back into the original secret.
 * Throws if shares are insufficient or corrupted.
 */
export function combineShares(shares: Uint8Array[]): string {
  if (shares.length < 2) throw new Error("need at least 2 shares to combine");
  const buffers = shares.map((s) => Buffer.from(s));
  const combined = shamirCombine(buffers);
  return new TextDecoder().decode(new Uint8Array(combined));
}

// ─── Heartbeat helpers ──────────────────────────────────────────────────────

/**
 * Compute the drand timelock target timestamp for a given heartbeat preset.
 * Returns ms since epoch.
 */
export function heartbeatTargetTimestamp(preset: HeartbeatPreset): number {
  const days = HEARTBEAT_PRESETS[preset].days;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

/**
 * Given a current heartbeat expiry, return the new one after an extension.
 */
export function extendedHeartbeatTimestamp(
  currentExpiryMs: number,
  preset: HeartbeatPreset,
): number {
  const days = HEARTBEAT_PRESETS[preset].days;
  return currentExpiryMs + days * 24 * 60 * 60 * 1000;
}

/**
 * Format time-to-heartbeat-expiry as a human string.
 * Returns "expired" if already past.
 */
export function formatHeartbeatCountdown(expiryMs: number): string {
  const diff = expiryMs - Date.now();
  if (diff <= 0) return "expired";

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}

// ─── Hex encoding for storage in Arkiv attributes ──────────────────────────

/**
 * Encode a Shamir share as hex string for storage in Arkiv as `string` attribute
 * or in payload. We use hex (not base64) for visual debuggability in explorer.
 */
export function shareToHex(share: Uint8Array): string {
  return Array.from(share)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToShare(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("invalid hex string");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
