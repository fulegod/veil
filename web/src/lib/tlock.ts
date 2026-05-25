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

import { Buffer } from "buffer"; // 'buffer' (browser shim) instead of 'node:buffer'
import {
  timelockEncrypt,
  timelockDecrypt,
  mainnetClient,
  roundAt,
  type HttpChainClient,
  type ChainInfo,
} from "tlock-js";

// Reusable encoders — browser-native, also exist in Node.
const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

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
 *
 * Notes on the Buffer dance: tlock-js's signature requires `Buffer` (it pre-dates
 * the wider use of Uint8Array). Buffer extends Uint8Array, so wrapping with
 * `Buffer.from(...)` is the safe path. We do NOT use Buffer for reading the
 * decrypted output — that path is browser-shim-fragile (see decryptCiphertext).
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
    // armor is a string (PEM-like) — encode to UTF-8 bytes for Arkiv storage
    ciphertext: utf8Encoder.encode(armor),
    round,
    unlockAt: unlockAtMs,
  };
}

/**
 * Encripta bytes arbitrarios (archivos, audio, video pequeños) contra un
 * unlock time. Mismo flujo que encryptForTime pero acepta Uint8Array y
 * mantiene los bytes byte-exact a través del decrypt.
 */
export async function encryptBytesForTime(
  plaintextBytes: Uint8Array,
  unlockAtMs: number,
): Promise<{ ciphertext: Uint8Array; round: number; unlockAt: number }> {
  const round = await roundForUnlockAt(unlockAtMs);
  const armor = await timelockEncrypt(
    round,
    Buffer.from(plaintextBytes),
    getDrandClient(),
  );
  return {
    ciphertext: utf8Encoder.encode(armor),
    round,
    unlockAt: unlockAtMs,
  };
}

/**
 * Descifra ciphertext si el round drand ya está disponible.
 * Si todavía no está, tira error (catch en UI para mostrar countdown).
 *
 * Includes a hard timeout because some browser-network conditions cause
 * the underlying fetch to drand to hang silently (no resolve, no reject).
 */
export async function decryptCiphertext(
  ciphertext: Uint8Array,
  opts: { timeoutMs?: number } = {},
): Promise<string> {
  const bytes = await decryptCiphertextToBytes(ciphertext, opts);
  return utf8Decoder.decode(bytes);
}

/**
 * Descifra ciphertext devolviendo bytes raw (sin UTF-8 decode).
 * Necesario para archivos binarios: si interpretamos bytes binarios como
 * UTF-8 perdemos data por replacement chars.
 */
export async function decryptCiphertextToBytes(
  ciphertext: Uint8Array,
  opts: { timeoutMs?: number } = {},
): Promise<Uint8Array> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const armor = utf8Decoder.decode(ciphertext);

  const decrypted = await withTimeout(
    timelockDecrypt(armor, getDrandClient()),
    timeoutMs,
    `timelockDecrypt did not complete in ${timeoutMs}ms (likely drand fetch hung)`,
  );
  // timelockDecrypt returns Buffer in node, Uint8Array-like in browser
  return new Uint8Array(decrypted);
}

/**
 * Wraps a promise with a hard timeout. Throws if the inner promise neither
 * resolves nor rejects before `ms` elapses.
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
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
