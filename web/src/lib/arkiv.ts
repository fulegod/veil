/**
 * Arkiv client + helpers.
 *
 * Cada función aquí enforce automáticamente el PROJECT_ATTRIBUTE.
 * Nunca llames al SDK directamente desde componentes — usa estos helpers.
 *
 * Patterns demonstrados:
 *  - PROJECT_ATTRIBUTE en TODA creación y TODA query (regla #1)
 *  - $creator inmutable: viene de la wallet conectada (privateKeyToAccount o WalletConnect)
 *  - $owner mutable: por defecto = $creator, transferible vía updateEntity
 *  - Expiraciones diferenciadas por kind de entity
 */

import { createPublicClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { eq, and } from "@arkiv-network/sdk/query";
import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk/utils";
import {
  PROJECT_ATTRIBUTE,
  ENTITY_KIND,
  type EntityKind,
  type ActionType,
} from "./config";

// Re-export type for hook consumers. We don't tighten the import path because
// the SDK's wallet client type is generic over (transport, chain, account).
// Treating it as `any`-ish locally is fine — the SDK calls themselves are typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArkivWalletClient = any;

// ─── Public client (read-only, no wallet needed) ────────────────────────────

const transport = http();

export const publicClient = createPublicClient({ chain: braga, transport });

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateCapsuleInput {
  walletClient: ArkivWalletClient;
  ciphertext: Uint8Array;
  unlockRound: number;
  unlockAt: number;
  title: string;
  isPublic: boolean;
}

export interface CapsuleEntity {
  entityKey: string;
  creator: string;
  owner: string;
  ciphertext: Uint8Array;
  unlockRound: number;
  unlockAt: number;
  title: string;
  isPublic: boolean;
  expiresAtBlock: bigint | number;
}

// ─── Capsule operations ─────────────────────────────────────────────────────

/**
 * Crea una entity Capsule con el payload ya encriptado por tlock.
 * Estampa PROJECT_ATTRIBUTE + kind=capsule automáticamente.
 *
 * Expiración: 1 año desde unlockAt (la cápsula sigue viva un año tras revelarse).
 *
 * El walletClient debe venir del hook `useArkivClients` (o construirse con
 * `createWalletClient` del SDK en server-side scripts).
 */
export async function createCapsule(input: CreateCapsuleInput) {
  const oneYearAfterUnlock =
    Math.ceil((input.unlockAt - Date.now()) / 1000) + 365 * 24 * 3600;

  return input.walletClient.createEntity({
    payload: input.ciphertext,
    contentType: "application/x-tlock-armor",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.CAPSULE },
      { key: "title", value: input.title },
      { key: "unlock_round", value: input.unlockRound },
      { key: "unlock_at", value: input.unlockAt },
      { key: "is_public", value: input.isPublic ? 1 : 0 },
    ],
    expiresIn: ExpirationTime.fromSeconds(oneYearAfterUnlock),
  });
}

/**
 * Lee una Capsule por su entityKey.
 */
export async function getCapsule(
  entityKey: string,
): Promise<CapsuleEntity | null> {
  // SDK expects `0x${string}` for hex types; entityKey comes from URL params
  // as plain string, so we narrow here at the boundary.
  const entity = await publicClient.getEntity(entityKey as `0x${string}`);
  if (!entity?.payload) return null;

  const attrs = Object.fromEntries(
    entity.attributes.map((a) => [a.key, a.value]),
  );

  return {
    entityKey,
    creator: entity.creator ?? "",
    owner: entity.owner ?? "",
    ciphertext: new Uint8Array(entity.payload),
    unlockRound: Number(attrs.unlock_round),
    unlockAt: Number(attrs.unlock_at),
    title: String(attrs.title ?? ""),
    isPublic: Number(attrs.is_public) === 1,
    expiresAtBlock: entity.expiresAtBlock ?? 0,
  };
}

/**
 * Lista capsules del proyecto. Siempre incluye PROJECT_ATTRIBUTE — sin esto
 * traes data de otros proyectos en la misma red pública.
 *
 * Importante: por default `.fetch()` SOLO devuelve las entity keys. Hay que
 * pedir `.withAttributes()` y `.withMetadata()` explícitamente para obtener
 * los atributos (title, unlock_at, is_public) y el creator/owner. Sin esto
 * la lista aparece "vacía" aunque las entities existan.
 */
export async function listCapsules(
  opts: {
    kind?: EntityKind;
    limit?: number;
  } = {},
) {
  return publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", opts.kind ?? ENTITY_KIND.CAPSULE),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .limit(opts.limit ?? 20)
    .fetch();
}

// ─── Reveal operations ──────────────────────────────────────────────────────
//
// A Reveal is a public marker that "this capsule was decrypted at this time
// by this wallet". It does NOT contain the plaintext — only a SHA-256 hash of
// it (so anyone can verify that the plaintext they have matches what was
// revealed first, without leaking the secret to the index).
//
// Pattern demonstrated:
//  - Second entity type (satisfies challenge minimum of 2)
//  - $creator immutable: the wallet that first published the reveal
//  - Relationship via shared-attribute key: Reveal.capsule_key → Capsule.entityKey
//  - Differentiated expiration: Reveals live 90 days post-unlock (vs ∞ for Capsules)

export interface PublishRevealInput {
  walletClient: ArkivWalletClient;
  capsuleKey: string;
  plaintextHash: string; // hex SHA-256, no leading 0x needed
}

export interface RevealEntity {
  entityKey: string;
  creator: string;
  capsuleKey: string;
  revealedAt: number;
  decryptedHash: string;
}

/**
 * Publishes a Reveal entity that links to a Capsule via shared-attribute key.
 * The capsule itself is unchanged — Reveal is a separate immutable record.
 */
export async function publishReveal(input: PublishRevealInput) {
  return input.walletClient.createEntity({
    payload: jsonToPayload({
      decrypted_hash: input.plaintextHash,
    }),
    contentType: "application/json",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.REVEAL },
      { key: "capsule_key", value: input.capsuleKey },
      { key: "revealed_at", value: Date.now() },
    ],
    // Reveals are short-lived markers. The capsule (with the ciphertext) is
    // what lives forever; the reveal log is just "who got there first".
    expiresIn: ExpirationTime.fromDays(90),
  });
}

/**
 * Finds the FIRST reveal for a given capsule (by ascending revealed_at).
 * Returns null if no one has revealed it publicly yet.
 *
 * Note: Arkiv's query API doesn't expose orderBy on the raw `.where().fetch()`
 * path the way SQL would, so we fetch the recent set and sort client-side.
 * For Veil's scale that's fine; if we ever had thousands of reveals per
 * capsule we'd switch to a paginated `orderBy` query.
 */
export async function findFirstRevealForCapsule(
  capsuleKey: string,
): Promise<RevealEntity | null> {
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.REVEAL),
        eq("capsule_key", capsuleKey),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload() // we need the JSON payload (decrypted_hash) — opt in explicitly
    .limit(50)
    .fetch();

  if (result.entities.length === 0) return null;

  const parsed = result.entities
    .map(
      (e: {
        key: string;
        creator?: string;
        attributes: { key: string; value: string | number }[];
        payload?: Uint8Array | null;
      }) => {
        const attrs = Object.fromEntries(
          e.attributes.map((a) => [a.key, a.value]),
        );
        let decryptedHash = "";
        if (e.payload) {
          try {
            const parsedPayload = JSON.parse(
              new TextDecoder().decode(e.payload),
            );
            decryptedHash = String(parsedPayload.decrypted_hash ?? "");
          } catch {
            /* ignore malformed payload */
          }
        }
        return {
          entityKey: e.key,
          creator: e.creator ?? "",
          capsuleKey: String(attrs.capsule_key ?? ""),
          revealedAt: Number(attrs.revealed_at) || 0,
          decryptedHash,
        };
      },
    )
    .sort((a, b) => a.revealedAt - b.revealedAt);

  return parsed[0] ?? null;
}

/**
 * Browser-friendly SHA-256 → hex.
 * Used to hash the decrypted plaintext before publishing a Reveal.
 */
export async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Vault + Share operations (Inheritance feature) ─────────────────────────
//
// Vault = the parent entity for an inheritance setup. Holds the drand-encrypted
// secret as its payload. Its expiresIn IS the heartbeat — every time the owner
// proves they're alive (calls extendEntity), the timer resets.
//
// Share = N child entities, one per validator. Each holds one Shamir share.
// Linked to Vault via shared-attribute key `vault_key`.
//
// Patterns demonstrated:
//  - Third + fourth entity type
//  - `extendEntity` for heartbeat (only $owner can call it)
//  - Differentiated expirations: Vault = heartbeat+buffer; Share = ~forever
//  - Range query: by heartbeat_at numeric attribute (find "stale" vaults)
//  - Shared-attribute relationship: Share.vault_key → Vault.entityKey
//  - $creator immutable (the original setter — proves who set up the inheritance)
//  - $owner mutable (can transfer the inheritance plan to another wallet before death)

export interface CreateVaultInput {
  walletClient: ArkivWalletClient;
  ciphertext: Uint8Array; // drand-timelocked secret bytes
  unlockRound: number; // drand round when secret becomes decryptable
  heartbeatAt: number; // ms-epoch when this vault expires if not extended
  title: string;
  threshold: number; // M of N
  totalShares: number; // N
}

export interface VaultEntity {
  entityKey: string;
  creator: string;
  owner: string;
  ciphertext: Uint8Array;
  unlockRound: number;
  heartbeatAt: number;
  title: string;
  threshold: number;
  totalShares: number;
  expiresAtBlock: bigint | number;
}

/**
 * Create a Vault entity holding the drand-encrypted secret.
 * The `expiresIn` matches the heartbeat: if owner doesn't extend, vault dies
 * and the share entities (which point at it) become "orphaned" — at which
 * point validators can combine their shares + the drand-published round to
 * recover the secret.
 */
export async function createVault(input: CreateVaultInput) {
  // Heartbeat in seconds + 30-day buffer so recovery has time to happen.
  const heartbeatSecondsFromNow =
    Math.ceil((input.heartbeatAt - Date.now()) / 1000) + 30 * 24 * 3600;

  return input.walletClient.createEntity({
    payload: input.ciphertext,
    contentType: "application/x-tlock-armor",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.VAULT },
      { key: "title", value: input.title },
      { key: "unlock_round", value: input.unlockRound },
      { key: "heartbeat_at", value: input.heartbeatAt },
      { key: "threshold", value: input.threshold },
      { key: "total_shares", value: input.totalShares },
    ],
    expiresIn: ExpirationTime.fromSeconds(heartbeatSecondsFromNow),
  });
}

export interface CreateShareInput {
  walletClient: ArkivWalletClient;
  vaultKey: string;
  shareIndex: number; // 1..N
  validatorAddress: string; // wallet of the intended validator (lowercased)
  shareHex: string; // hex-encoded Shamir share
}

/**
 * Create a single Share entity linked to a Vault.
 * The share is stored as a `string` attribute (hex) AND in payload as raw bytes
 * — attribute makes it queryable, payload preserves byte-exact reconstruction.
 *
 * Shares live ~10 years (effectively forever for the inheritance use case).
 * They survive even if the Vault expires — that's the whole point.
 */
export async function createShare(input: CreateShareInput) {
  // Payload = raw share bytes (hex decoded) for byte-exact retrieval.
  const shareBytes = new Uint8Array(input.shareHex.length / 2);
  for (let i = 0; i < shareBytes.length; i++) {
    shareBytes[i] = parseInt(input.shareHex.slice(i * 2, i * 2 + 2), 16);
  }

  return input.walletClient.createEntity({
    payload: shareBytes,
    contentType: "application/octet-stream",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.SHARE },
      { key: "vault_key", value: input.vaultKey },
      { key: "share_index", value: input.shareIndex },
      { key: "validator_address", value: input.validatorAddress.toLowerCase() },
    ],
    // ~10 years — shares must outlive any reasonable heartbeat.
    expiresIn: ExpirationTime.fromSeconds(10 * 365 * 24 * 3600),
  });
}

/**
 * Heartbeat — owner proves they're still alive by extending the vault entity.
 * Only the current $owner can call this (Arkiv enforces). Resets the
 * countdown to inactivity-based recovery.
 *
 * `additionalSeconds` typically = heartbeat preset in seconds (3m, 6m, 1y).
 */
export async function extendVault(
  walletClient: ArkivWalletClient,
  vaultKey: string,
  additionalSeconds: number,
) {
  return walletClient.extendEntity(vaultKey as `0x${string}`, {
    extendBy: ExpirationTime.fromSeconds(additionalSeconds),
  });
}

/**
 * Get a single Vault by its entity key.
 */
export async function getVault(entityKey: string): Promise<VaultEntity | null> {
  const entity = await publicClient.getEntity(entityKey as `0x${string}`);
  if (!entity?.payload) return null;

  const attrs = Object.fromEntries(
    entity.attributes.map((a) => [a.key, a.value]),
  );

  // Defensive: only return if it's actually a vault entity
  if (attrs.kind !== ENTITY_KIND.VAULT) return null;

  return {
    entityKey,
    creator: entity.creator ?? "",
    owner: entity.owner ?? "",
    ciphertext: new Uint8Array(entity.payload),
    unlockRound: Number(attrs.unlock_round),
    heartbeatAt: Number(attrs.heartbeat_at),
    title: String(attrs.title ?? ""),
    threshold: Number(attrs.threshold),
    totalShares: Number(attrs.total_shares),
    expiresAtBlock: entity.expiresAtBlock ?? 0,
  };
}

export interface ShareEntity {
  entityKey: string;
  creator: string;
  vaultKey: string;
  shareIndex: number;
  validatorAddress: string;
  sharePayload: Uint8Array;
}

/**
 * Get all Shares pointing at a given Vault, sorted by share_index.
 * Relationship is via the `vault_key` shared-attribute key — Arkiv's
 * pattern for foreign-key-like joins.
 */
export async function getSharesForVault(
  vaultKey: string,
): Promise<ShareEntity[]> {
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.SHARE),
        eq("vault_key", vaultKey),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload() // need the bytes to reconstruct
    .limit(20)
    .fetch();

  return result.entities
    .map(
      (e: {
        key: string;
        creator?: string;
        attributes: { key: string; value: string | number }[];
        payload?: Uint8Array | null;
      }) => {
        const attrs = Object.fromEntries(
          e.attributes.map((a) => [a.key, a.value]),
        );
        return {
          entityKey: e.key,
          creator: e.creator ?? "",
          vaultKey: String(attrs.vault_key ?? ""),
          shareIndex: Number(attrs.share_index) || 0,
          validatorAddress: String(attrs.validator_address ?? ""),
          sharePayload: e.payload
            ? new Uint8Array(e.payload)
            : new Uint8Array(),
        };
      },
    )
    .sort((a, b) => a.shareIndex - b.shareIndex);
}

/**
 * List vaults created by a given owner. Used in /inheritance dashboard.
 */
export async function listVaultsForOwner(ownerAddress: string) {
  // Note: Arkiv's `$owner` is queryable but the API surface varies — we filter
  // client-side from the project-scoped list for now (small N expected).
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.VAULT),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .limit(50)
    .fetch();

  const target = ownerAddress.toLowerCase();
  return result.entities.filter(
    (e: { owner?: string }) => (e.owner ?? "").toLowerCase() === target,
  );
}

/**
 * List vaults where a given address is one of the validators (via Share entities).
 * Used in /inheritance dashboard for the "vaults I can help recover" view.
 */
export async function listVaultsForValidator(validatorAddress: string) {
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.SHARE),
        eq("validator_address", validatorAddress.toLowerCase()),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .limit(50)
    .fetch();

  // Dedupe vault keys — a validator could in theory have shares in multiple vaults
  const vaultKeys = Array.from(
    new Set(
      result.entities
        .map((e: { attributes: { key: string; value: string | number }[] }) => {
          const attr = e.attributes.find((a) => a.key === "vault_key");
          return attr ? String(attr.value) : null;
        })
        .filter((k: string | null): k is string => !!k),
    ),
  );

  return vaultKeys;
}

// ─── Action operations (programmable triggers) ──────────────────────────────
//
// An Action is a tiny entity linked to a Vault that describes "what should
// happen at a specific point in the vault's lifecycle". The cron job in
// /api/cron/check-vaults reads pending actions, fires them, then marks
// notified_at via updateEntity so they don't fire twice.
//
// Pattern demonstrated:
//  - 5th entity kind, same relationship pattern (vault_key shared-attribute)
//  - `notified_at` mutated via updateEntity (only $owner can — Arkiv enforces)
//  - Range-queryable by trigger_at (numeric) for efficient cron scans
//  - Differentiated expiration: actions live as long as the vault + 90d buffer

export interface CreateActionInput {
  walletClient: ArkivWalletClient;
  vaultKey: string;
  actionType: ActionType;
  triggerAtMs: number; // ms-epoch when this action should fire
  destination: string; // email address, wallet address, or IPFS hash
  message: string; // user-facing message body (will be email subject/body)
}

export interface ActionEntity {
  entityKey: string;
  creator: string;
  vaultKey: string;
  actionType: ActionType;
  triggerAt: number;
  destination: string;
  message: string;
  notifiedAt: number; // 0 = not yet fired
}

/**
 * Create an Action attached to a Vault. The cron job polls these every hour.
 */
export async function createAction(input: CreateActionInput) {
  // Actions outlive the vault by 90 days so reveals are auditable after expiry
  return input.walletClient.createEntity({
    payload: jsonToPayload({
      message: input.message,
      destination: input.destination,
    }),
    contentType: "application/json",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.ACTION },
      { key: "vault_key", value: input.vaultKey },
      { key: "action_type", value: input.actionType },
      { key: "trigger_at", value: input.triggerAtMs },
      { key: "destination", value: input.destination },
      { key: "notified_at", value: 0 }, // 0 sentinel = not yet fired
    ],
    expiresIn: ExpirationTime.fromDays(365 * 2), // 2 years
  });
}

/**
 * Fetch all Actions for a vault. Used in the vault view to show the schedule.
 */
export async function getActionsForVault(
  vaultKey: string,
): Promise<ActionEntity[]> {
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.ACTION),
        eq("vault_key", vaultKey),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload()
    .limit(50)
    .fetch();

  return result.entities.map(
    (e: {
      key: string;
      creator?: string;
      attributes: { key: string; value: string | number }[];
      payload?: Uint8Array | null;
    }) => {
      const attrs = Object.fromEntries(
        e.attributes.map((a) => [a.key, a.value]),
      );
      let message = "";
      let destination = String(attrs.destination ?? "");
      if (e.payload) {
        try {
          const parsed = JSON.parse(new TextDecoder().decode(e.payload));
          message = String(parsed.message ?? "");
          destination = String(parsed.destination ?? destination);
        } catch {
          /* ignore */
        }
      }
      return {
        entityKey: e.key,
        creator: e.creator ?? "",
        vaultKey: String(attrs.vault_key ?? ""),
        actionType: String(attrs.action_type ?? "") as ActionType,
        triggerAt: Number(attrs.trigger_at) || 0,
        destination,
        message,
        notifiedAt: Number(attrs.notified_at) || 0,
      };
    },
  );
}

/**
 * Lists ALL pending actions across the entire project that need to fire now.
 * Used by the cron job. Filters: notified_at == 0 AND trigger_at <= now.
 *
 * Note: client-side filter on notified_at because Arkiv's query API doesn't
 * have a direct "not equals" predicate — fine at Veil's scale.
 */
export async function listPendingActions(
  nowMs: number,
): Promise<ActionEntity[]> {
  const result = await publicClient
    .buildQuery()
    .where(
      and([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq("kind", ENTITY_KIND.ACTION),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload()
    .limit(200)
    .fetch();

  return result.entities
    .map(
      (e: {
        key: string;
        creator?: string;
        attributes: { key: string; value: string | number }[];
        payload?: Uint8Array | null;
      }) => {
        const attrs = Object.fromEntries(
          e.attributes.map((a) => [a.key, a.value]),
        );
        let message = "";
        let destination = String(attrs.destination ?? "");
        if (e.payload) {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(e.payload));
            message = String(parsed.message ?? "");
            destination = String(parsed.destination ?? destination);
          } catch {
            /* ignore */
          }
        }
        return {
          entityKey: e.key,
          creator: e.creator ?? "",
          vaultKey: String(attrs.vault_key ?? ""),
          actionType: String(attrs.action_type ?? "") as ActionType,
          triggerAt: Number(attrs.trigger_at) || 0,
          destination,
          message,
          notifiedAt: Number(attrs.notified_at) || 0,
        };
      },
    )
    .filter((a) => a.notifiedAt === 0 && a.triggerAt <= nowMs);
}

/**
 * Mark an action as fired so the cron doesn't process it again.
 * NOTE: updateEntity is full-replace in Arkiv (not patch) — we re-stamp ALL
 * attributes, only changing notified_at.
 */
export async function markActionNotified(
  walletClient: ArkivWalletClient,
  action: ActionEntity,
  firedAtMs: number,
) {
  return walletClient.updateEntity(action.entityKey as `0x${string}`, {
    payload: jsonToPayload({
      message: action.message,
      destination: action.destination,
    }),
    contentType: "application/json",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "kind", value: ENTITY_KIND.ACTION },
      { key: "vault_key", value: action.vaultKey },
      { key: "action_type", value: action.actionType },
      { key: "trigger_at", value: action.triggerAt },
      { key: "destination", value: action.destination },
      { key: "notified_at", value: firedAtMs },
    ],
  });
}
