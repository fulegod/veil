/**
 * tlock + drand wrapper.
 *
 * Encripta payloads contra un round drand futuro. Sin trust:
 *  - Hoy NADIE puede descifrar (la key no existe matemáticamente todavía)
 *  - En la fecha objetivo drand publica el round → la key se vuelve derivable
 *  - Cualquiera con el ciphertext puede descifrar
 *
 * Patterns demonstrados:
 *  - Timelock encryption sobre infraestructura descentralizada (drand)
 *  - Combina con Arkiv: payload encriptado vive como entity, atribución inmutable
 */

import { Buffer } from "node:buffer";
import {
  timelockEncrypt,
  timelockDecrypt,
  mainnetClient,
  roundAt,
  type HttpChainClient,
  type ChainInfo,
} from "tlock-js";

let cachedClient: HttpChainClient | null = null;
let cachedInfo: ChainInfo | null = null;

export function getDrandClient(): HttpChainClient {
  if (!cachedClient) cachedClient = mainnetClient();
  return cachedClient;
}

export async function getDrandInfo(): Promise<ChainInfo> {
  if (cachedInfo) return cachedInfo;
  const info = await getDrandClient().chain().info();
  cachedInfo = info;
  return info;
}

/**
 * Convierte un timestamp humano (ms) a un drand round number.
 */
export async function roundForUnlockAt(unlockAtMs: number): Promise<number> {
  const info = await getDrandInfo();
  return roundAt(unlockAtMs, info);
}

/**
 * Encripta un texto plano contra un unlock time.
 * Retorna ciphertext como Uint8Array (listo para guardar como payload de Arkiv).
 */
export async function encryptForTime(
  plaintext: string,
  unlockAtMs: number,
): Promise<{ ciphertext: Uint8Array; round: number; unlockAt: number }> {
  const round = await roundForUnlockAt(unlockAtMs);
  const armor = await timelockEncrypt(
    round,
    Buffer.from(plaintext, "utf-8"),
    getDrandClient(),
  );
  return {
    ciphertext: new Uint8Array(Buffer.from(armor, "utf-8")),
    round,
    unlockAt: unlockAtMs,
  };
}

/**
 * Descifra ciphertext si el round drand ya está disponible.
 * Si todavía no está, tira error (catch en UI para mostrar countdown).
 */
export async function decryptCiphertext(
  ciphertext: Uint8Array,
): Promise<string> {
  const armor = Buffer.from(ciphertext).toString("utf-8");
  const decrypted = await timelockDecrypt(armor, getDrandClient());
  return decrypted.toString("utf-8");
}

/**
 * Check si un round ya pasó (lock está abierto) sin intentar descifrar.
 */
export async function isUnlocked(targetRound: number): Promise<boolean> {
  const client = getDrandClient();
  try {
    const latest = await client.latest();
    return latest.round >= targetRound;
  } catch {
    return false;
  }
}
