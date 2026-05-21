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
import { PROJECT_ATTRIBUTE, ENTITY_KIND, type EntityKind } from "./config";

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
  const entity = await publicClient.getEntity(entityKey);
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
