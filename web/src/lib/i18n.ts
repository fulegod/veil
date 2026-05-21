/**
 * Mini i18n custom para Veil.
 * Decisión: dictionary tipado in-memory + Context provider, sin lib extra.
 * Default: en. Persist en localStorage.
 */

export const LANGUAGES = ["en", "es"] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = "en";

/**
 * Dictionary tipado. `en` es el "source of truth" — `es` debe tener las
 * mismas keys (TS lo enforce vía `Record<keyof typeof dict.en, string>`).
 */
const dict = {
  en: {
    // ─── Common ─────────────────────────────────────────────────────────
    "common.backToHome": "← VEIL",
    "common.connectFirst": "Connect your wallet to create capsules.",
    "common.connectedAs": "connected",
    "common.creator": "creator",
    "common.loading": "Loading…",
    "common.toggleLang": "ES",

    // ─── Home ───────────────────────────────────────────────────────────
    "home.titleA": "Encrypted time capsules.",
    "home.titleB": "Trustless.",
    "home.subtitle":
      "Write something today. Pick a future date. The payload is encrypted against a drand round that doesn't exist yet — nobody can read it before the time you chose, and nobody can stop the reveal.",
    "home.note": "Stored on Arkiv (Braga). Author attribution is immutable.",
    "home.ctaCreate": "Create a capsule",
    "home.ctaBrowse": "Browse public capsules",
    "home.footer": "Arkiv × ETHNS Builder Challenge — Privacy track",

    // ─── New capsule ────────────────────────────────────────────────────
    "new.title": "New capsule",
    "new.intro":
      "Encrypted now against a future drand round. Stored on Arkiv with your wallet as immutable creator.",
    "new.fieldTitle": "Title",
    "new.fieldTitleHint": "Visible publicly even before unlock.",
    "new.fieldTitlePlaceholder": "Prediction for 2030",
    "new.fieldBody": "Body (the secret)",
    "new.fieldBodyHint": "Encrypted. Unreadable until the unlock time.",
    "new.fieldBodyPlaceholder": "What only you (and the future) should know.",
    "new.fieldUnlock": "Unlock at",
    "new.fieldUnlockHint":
      "Anyone can decrypt after this time. Minimum 30s in the future.",
    "new.fieldPublic": "List publicly",
    "new.fieldPublicHint":
      "Shows up in /capsules. Either way the ciphertext is unreadable until unlock.",
    "new.btnSeal": "Seal capsule",
    "new.statusEncrypting": "Encrypting…",
    "new.statusSubmitting": "Storing on Arkiv…",
    "new.statusDone": "Done — redirecting",
    "new.errorConnect": "Connect your wallet first.",
    "new.errorRequired": "Title and body are required.",
    "new.errorUnlockTime":
      "Unlock time must be at least 30 seconds in the future.",
    "new.successSealed": "Sealed!",
    "new.viewTxLink": "view tx on Braga explorer →",

    // ─── View capsule ───────────────────────────────────────────────────
    "view.loading": "Loading capsule…",
    "view.notFound": "Capsule not found",
    "view.notFoundBody":
      "No entity with that key in Arkiv. It may have expired, been deleted, or never existed.",
    "view.notFoundBack": "← back home",
    "view.badgeLocked": "Locked",
    "view.badgeUnlocked": "Unlocked",
    "view.badgePublic": "Public",
    "view.badgeUnlisted": "Unlisted",
    "view.contents": "Contents",
    "view.unlocksIn": "Unlocks in",
    "view.sealed":
      "Sealed. {bytes} bytes of ciphertext until drand round {round} is published.",
    "view.decrypting": "Decrypting…",
    "view.decryptError": "Could not decrypt yet:",
    "view.metaCreator": "Creator (immutable)",
    "view.metaOwner": "Owner (current)",
    "view.metaUnlockAt": "Unlock at",
    "view.metaUnlockRound": "Unlock drand round",
    "view.metaEntityKey": "Entity key",
    "view.metaExpires": "Expires at block",
    "view.unknown": "(unknown)",
    "view.untitled": "(untitled)",

    // ─── Reveal ─────────────────────────────────────────────────────────
    "reveal.section": "Public reveal",
    "reveal.notYet": "Nobody has published this reveal on-chain yet.",
    "reveal.cta": "Publish this reveal",
    "reveal.ctaHint":
      "Stores a tamper-proof record (just the hash, not the plaintext) — anyone querying Arkiv can verify this capsule was decrypted at this time.",
    "reveal.publishing": "Publishing…",
    "reveal.firstBy": "First revealed by {wallet}",
    "reveal.at": "at {time}",
    "reveal.connectFirst": "Connect your wallet to publish the reveal.",
    "reveal.errorConnect": "Connect your wallet first.",
    "reveal.error": "Publish failed:",

    // ─── Capsules list ──────────────────────────────────────────────────
    "list.title": "Public capsules",
    "list.newCapsule": "+ New capsule",
    "list.empty": "No public capsules yet.",
    "list.emptyCta": "Be the first → seal one",
    "list.loadError": "Failed to load capsules:",
    "list.by": "by",
    "list.unlocked": "Unlocked",
    "list.unlocksIn": "Unlocks in",
  },
  es: {
    // ─── Common ─────────────────────────────────────────────────────────
    "common.backToHome": "← VEIL",
    "common.connectFirst": "Conecta tu wallet para crear cápsulas.",
    "common.connectedAs": "conectado",
    "common.creator": "creador",
    "common.loading": "Cargando…",
    "common.toggleLang": "EN",

    // ─── Home ───────────────────────────────────────────────────────────
    "home.titleA": "Cápsulas del tiempo cifradas.",
    "home.titleB": "Sin confianza.",
    "home.subtitle":
      "Escribe algo hoy. Elige una fecha futura. El contenido se cifra contra un round de drand que aún no existe — nadie puede leerlo antes del momento que elegiste, y nadie puede detener la revelación.",
    "home.note": "Guardado en Arkiv (Braga). La autoría es inmutable.",
    "home.ctaCreate": "Crear una cápsula",
    "home.ctaBrowse": "Ver cápsulas públicas",
    "home.footer": "Arkiv × ETHNS Builder Challenge — Privacy track",

    // ─── New capsule ────────────────────────────────────────────────────
    "new.title": "Nueva cápsula",
    "new.intro":
      "Cifrada ahora contra un round futuro de drand. Almacenada en Arkiv con tu wallet como creador inmutable.",
    "new.fieldTitle": "Título",
    "new.fieldTitleHint": "Visible públicamente antes del unlock.",
    "new.fieldTitlePlaceholder": "Predicción para 2030",
    "new.fieldBody": "Cuerpo (el secreto)",
    "new.fieldBodyHint": "Cifrado. Ilegible hasta el momento del unlock.",
    "new.fieldBodyPlaceholder": "Lo que solo tú (y el futuro) deberían saber.",
    "new.fieldUnlock": "Unlock at",
    "new.fieldUnlockHint":
      "Cualquiera puede descifrar después de este momento. Mínimo 30s en el futuro.",
    "new.fieldPublic": "Listar públicamente",
    "new.fieldPublicHint":
      "Aparece en /capsules. Igual el ciphertext es ilegible hasta el unlock.",
    "new.btnSeal": "Sellar cápsula",
    "new.statusEncrypting": "Cifrando…",
    "new.statusSubmitting": "Guardando en Arkiv…",
    "new.statusDone": "Listo — redirigiendo",
    "new.errorConnect": "Conecta tu wallet primero.",
    "new.errorRequired": "Título y cuerpo son obligatorios.",
    "new.errorUnlockTime":
      "El unlock debe ser al menos 30 segundos en el futuro.",
    "new.successSealed": "¡Sellada!",
    "new.viewTxLink": "ver tx en el explorer de Braga →",

    // ─── View capsule ───────────────────────────────────────────────────
    "view.loading": "Cargando cápsula…",
    "view.notFound": "Cápsula no encontrada",
    "view.notFoundBody":
      "No hay entity con esa key en Arkiv. Puede haber expirado, sido borrada, o nunca haber existido.",
    "view.notFoundBack": "← volver al inicio",
    "view.badgeLocked": "Bloqueada",
    "view.badgeUnlocked": "Abierta",
    "view.badgePublic": "Pública",
    "view.badgeUnlisted": "No listada",
    "view.contents": "Contenido",
    "view.unlocksIn": "Se abre en",
    "view.sealed":
      "Sellada. {bytes} bytes de ciphertext hasta que se publique el round drand {round}.",
    "view.decrypting": "Descifrando…",
    "view.decryptError": "Aún no se pudo descifrar:",
    "view.metaCreator": "Creador (inmutable)",
    "view.metaOwner": "Owner (actual)",
    "view.metaUnlockAt": "Momento del unlock",
    "view.metaUnlockRound": "Round drand del unlock",
    "view.metaEntityKey": "Entity key",
    "view.metaExpires": "Expira en bloque",
    "view.unknown": "(desconocido)",
    "view.untitled": "(sin título)",

    // ─── Reveal ─────────────────────────────────────────────────────────
    "reveal.section": "Revelación pública",
    "reveal.notYet": "Nadie ha publicado esta revelación on-chain todavía.",
    "reveal.cta": "Publicar esta revelación",
    "reveal.ctaHint":
      "Guarda un registro inalterable (solo el hash, no el texto) — cualquiera consultando Arkiv puede verificar que esta cápsula fue descifrada en este momento.",
    "reveal.publishing": "Publicando…",
    "reveal.firstBy": "Revelada primero por {wallet}",
    "reveal.at": "el {time}",
    "reveal.connectFirst": "Conecta tu wallet para publicar la revelación.",
    "reveal.errorConnect": "Conecta tu wallet primero.",
    "reveal.error": "Falló al publicar:",

    // ─── Capsules list ──────────────────────────────────────────────────
    "list.title": "Cápsulas públicas",
    "list.newCapsule": "+ Nueva cápsula",
    "list.empty": "Todavía no hay cápsulas públicas.",
    "list.emptyCta": "Sé el primero → sella una",
    "list.loadError": "No se pudieron cargar las cápsulas:",
    "list.by": "por",
    "list.unlocked": "Abierta",
    "list.unlocksIn": "Se abre en",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type TKey = keyof (typeof dict)["en"];

/**
 * Resuelve una key contra el dictionary. Si la lang no tiene la key,
 * fallback a en. Soporta interpolación simple {var}.
 */
export function translate(
  lang: Lang,
  key: TKey,
  vars?: Record<string, string | number>,
): string {
  const value = dict[lang][key] ?? dict[DEFAULT_LANG][key] ?? String(key);
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
