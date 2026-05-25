/**
 * Capsule plaintext payload format — supports both text messages and binary files.
 *
 * The drand-timelocked ciphertext lives in Arkiv's `payload`. Before encryption,
 * we wrap the user's content in a tiny envelope so the decryptor can tell text
 * from file without guessing:
 *
 *   Byte 0:  kind tag — 0x54 ('T') = text, 0x46 ('F') = file
 *   For TEXT (0x54):
 *     Bytes 1..: UTF-8 encoded message
 *   For FILE (0x46):
 *     Bytes 1-2: BE uint16 — filename length L
 *     Bytes 3..3+L: filename UTF-8
 *     Bytes 3+L..5+L: BE uint16 — mime length M
 *     Bytes 5+L..5+L+M: mime type UTF-8
 *     Bytes 5+L+M..: file bytes
 *
 * Why hand-rolled instead of JSON? base64-wrapping binary inflates 33% and
 * burns Arkiv bytes for nothing. This is small, deterministic, and easy to
 * parse client-side.
 *
 * Backwards compat: capsules created before this lib treat the whole
 * decrypted blob as UTF-8 text. We keep that behavior — if byte 0 is NOT
 * 0x54 or 0x46, we fall back to "treat as text".
 */

const KIND_TEXT = 0x54; // 'T'
const KIND_FILE = 0x46; // 'F'

const enc = new TextEncoder();
const dec = new TextDecoder("utf-8");

export type CapsuleContent =
  | { kind: "text"; text: string }
  | { kind: "file"; filename: string; mime: string; bytes: Uint8Array };

export function packCapsulePayload(content: CapsuleContent): Uint8Array {
  if (content.kind === "text") {
    const textBytes = enc.encode(content.text);
    const out = new Uint8Array(1 + textBytes.length);
    out[0] = KIND_TEXT;
    out.set(textBytes, 1);
    return out;
  }
  const nameBytes = enc.encode(content.filename);
  const mimeBytes = enc.encode(content.mime || "application/octet-stream");
  if (nameBytes.length > 0xffff) {
    throw new Error("filename too long");
  }
  if (mimeBytes.length > 0xffff) {
    throw new Error("mime type too long");
  }
  const totalLen =
    1 + 2 + nameBytes.length + 2 + mimeBytes.length + content.bytes.length;
  const out = new Uint8Array(totalLen);
  let off = 0;
  out[off++] = KIND_FILE;
  out[off++] = (nameBytes.length >> 8) & 0xff;
  out[off++] = nameBytes.length & 0xff;
  out.set(nameBytes, off);
  off += nameBytes.length;
  out[off++] = (mimeBytes.length >> 8) & 0xff;
  out[off++] = mimeBytes.length & 0xff;
  out.set(mimeBytes, off);
  off += mimeBytes.length;
  out.set(content.bytes, off);
  return out;
}

export function unpackCapsulePayload(bytes: Uint8Array): CapsuleContent {
  if (bytes.length === 0) {
    return { kind: "text", text: "" };
  }
  const tag = bytes[0];
  if (tag === KIND_TEXT) {
    return { kind: "text", text: dec.decode(bytes.subarray(1)) };
  }
  if (tag === KIND_FILE) {
    let off = 1;
    if (off + 2 > bytes.length) {
      throw new Error("truncated capsule payload: missing filename length");
    }
    const nameLen = (bytes[off] << 8) | bytes[off + 1];
    off += 2;
    if (off + nameLen > bytes.length) {
      throw new Error("truncated capsule payload: filename");
    }
    const filename = dec.decode(bytes.subarray(off, off + nameLen));
    off += nameLen;
    if (off + 2 > bytes.length) {
      throw new Error("truncated capsule payload: missing mime length");
    }
    const mimeLen = (bytes[off] << 8) | bytes[off + 1];
    off += 2;
    if (off + mimeLen > bytes.length) {
      throw new Error("truncated capsule payload: mime");
    }
    const mime = dec.decode(bytes.subarray(off, off + mimeLen));
    off += mimeLen;
    return {
      kind: "file",
      filename,
      mime,
      bytes: bytes.subarray(off),
    };
  }
  // Legacy capsules: no envelope. Treat the whole blob as UTF-8 text.
  return { kind: "text", text: dec.decode(bytes) };
}

/**
 * Practical upper bound for what we accept on the create form. Arkiv's
 * per-tx gas budget rises with payload size; drand-tlock also adds ~700
 * bytes of overhead. 1 MB is the comfortable working zone in Braga.
 */
export const MAX_CAPSULE_FILE_BYTES = 1_000_000;
