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
  // Programmable triggers — email delivery, transfers, doc drops on expiry
  ACTION: "action",
} as const;

/**
 * Action types supported by the programmable trigger layer.
 * Each Action entity references a Vault via `vault_key` and fires when
 * the vault's heartbeat lapses past the action's `trigger_offset_ms`.
 */
export const ACTION_TYPE = {
  EMAIL_WARNING: "email_warning", // pre-expiry reminder to the owner
  EMAIL_DELIVERY: "email_delivery", // deliver content to recipients on expiry
  TRANSFER: "transfer", // on-chain transfer to a wallet
  DOC_DROP: "doc_drop", // release IPFS-hosted document URL
} as const;

export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

export type EntityKind = (typeof ENTITY_KIND)[keyof typeof ENTITY_KIND];

export const EXPLORER_BASE = "https://explorer.braga.hoodi.arkiv.network";

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerEntityUrl(entityKey: string): string {
  return `${EXPLORER_BASE}/entity/${entityKey}`;
}
