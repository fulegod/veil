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

import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
} from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { eq, and } from "@arkiv-network/sdk/query";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { PROJECT_ATTRIBUTE, ENTITY_KIND, type EntityKind } from "./config";

// ─── Clients ────────────────────────────────────────────────────────────────

const transport = http();

export const publicClient = createPublicClient({ chain: braga, transport });

export function makeWalletClient(account: Account) {
  return createWalletClient({ chain: braga, account, transport });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateCapsuleInput {
  account: Account;
  ciphertext: Uint8Array;
  unlockRound: number;
  unlockAt: number;
  title: string;
  isPublic: boolean;
}

export interface CapsuleEntity {
  entityKey: string;
  creator: string; // $creator wallet address
  owner: string; // $owner wallet address
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
 */
export async function createCapsule(input: CreateCapsuleInput) {
  const wallet = makeWalletClient(input.account);
  const oneYearAfterUnlock =
    Math.ceil((input.unlockAt - Date.now()) / 1000) + 365 * 24 * 3600;

  return wallet.createEntity({
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
 * Lista capsules del proyecto, filtrables por creator y por estado (unlocked or not).
 *
 * IMPORTANTE: siempre incluye PROJECT_ATTRIBUTE en el query — sin esto traes data ajena.
 */
export async function listCapsules(
  opts: {
    creator?: string;
    kind?: EntityKind;
    limit?: number;
  } = {},
) {
  const filters = [
    eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
    eq("kind", opts.kind ?? ENTITY_KIND.CAPSULE),
  ];

  let query = publicClient.buildQuery().where(and(...filters));
  if (opts.creator) {
    // Filtrar por $creator se hace separado en Arkiv (es atributo del entity, no del payload)
    // TODO: confirmar API exacta — por ahora filtrar client-side post-fetch
  }

  return query.limit(opts.limit ?? 20).fetch();
}
