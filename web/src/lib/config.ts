/**
 * Configuración central de Veil.
 *
 * PROJECT_ATTRIBUTE — DEBE ir en cada entity creada y cada query.
 * Sin esto las queries traen data ajena y los jueces bajan a 1/5 en Arkiv Integration.
 */

export const PROJECT_ATTRIBUTE = {
  key: "app",
  value: "veil",
} as const;

export const ENTITY_KIND = {
  CAPSULE: "capsule",
  REVEAL: "reveal",
  WATCHER: "watcher",
  // Inheritance feature — dead-man's switch with Shamir M-of-N
  VAULT: "vault",
  SHARE: "share",
} as const;

export type EntityKind = (typeof ENTITY_KIND)[keyof typeof ENTITY_KIND];

export const EXPLORER_BASE = "https://explorer.braga.hoodi.arkiv.network";

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerEntityUrl(entityKey: string): string {
  return `${EXPLORER_BASE}/entity/${entityKey}`;
}
