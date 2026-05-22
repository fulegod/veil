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

    // ─── Home: Hero ─────────────────────────────────────────────────────
    "home.heroEyebrow": "On-chain proof-of-call",
    "home.heroTitleA": "Stop editing",
    "home.heroTitleB": "your track record.",
    "home.heroSubtitle":
      "Seal your alpha today. Veil locks it until the date you pick — nobody can read it before, nobody can stop the reveal, nobody can edit the timestamp. Cryptographic proof you called it first.",
    "home.heroCtaPrimary": "Seal a call",
    "home.heroCtaSecondary": "See live capsules",
    "home.heroAttribution":
      "Encrypted with drand timelock · stored on Arkiv · verifiable on Braga",
    "home.connectFirst": "Connect your wallet to seal a call.",

    // ─── Home: Problem ──────────────────────────────────────────────────
    "home.problemEyebrow": "The problem",
    "home.problemTitle": "Anyone can claim a call after it happens.",
    "home.problemBody":
      'Crypto Twitter is full of deleted tweets, edited screenshots, and "I told you so" with no proof. Tipster channels delete losing trades. Influencers cherry-pick their wins. There is no neutral way to verify who said what, when.',
    "home.problemPoint1Title": "Tweets get deleted.",
    "home.problemPoint1Body":
      "The viral call that nailed it last month? Gone if it was wrong.",
    "home.problemPoint2Title": "Screenshots get edited.",
    "home.problemPoint2Body":
      "Photoshop is free. Telegram screenshots prove nothing on their own.",
    "home.problemPoint3Title": "Timestamps get faked.",
    "home.problemPoint3Body":
      '"I called this two months ago" — with no chain-of-custody, just a claim.',

    // ─── Home: How it works ─────────────────────────────────────────────
    "home.howEyebrow": "How Veil fixes it",
    "home.howTitle": "Three steps. Zero trust.",
    "home.howStep1Tag": "01",
    "home.howStep1Title": "Seal",
    "home.howStep1Body":
      "Write your call. Pick the date it should open. Veil encrypts it against a drand beacon round that does not exist yet — and stores it on Arkiv with your wallet as immutable author.",
    "home.howStep2Tag": "02",
    "home.howStep2Title": "Wait",
    "home.howStep2Body":
      "Nobody can read the body — not us, not Arkiv, not even you can prove the contents to someone else early. The title and timestamp are public so people can see you committed.",
    "home.howStep3Tag": "03",
    "home.howStep3Title": "Reveal",
    "home.howStep3Body":
      "At your chosen moment, the drand round publishes. The decryption key becomes derivable. Anyone with the link reads the original text. The first decryption can be anchored on-chain as a Reveal entity.",

    // ─── Home: Live example ─────────────────────────────────────────────
    "home.exampleEyebrow": "See it work",
    "home.exampleTitle": "A real sealed call on Braga.",
    "home.exampleBody":
      "This capsule was sealed earlier with a body that nobody could read until its unlock time. It is now revealed — and the on-chain creator + timestamp + sha-256 of the plaintext are anyone's to verify.",
    "home.exampleViewCta": "View the capsule →",
    "home.exampleBrowseCta": "Browse all public capsules",

    // ─── Home: Use cases beyond alpha ───────────────────────────────────
    "home.useCasesEyebrow": "Beyond alpha",
    "home.useCasesTitle": "Same primitive, many shapes.",
    "home.useCasesSubtitle":
      'Anywhere "who said it first" matters and a trusted party cannot be assumed.',
    "home.useCase1Title": "Sealed predictions",
    "home.useCase1Body":
      "Markets, sports, geopolitics, science. Commit your forecast publicly without revealing it — let history rate you.",
    "home.useCase2Title": "Founder pre-mortems",
    "home.useCase2Body":
      "List the five reasons your startup could fail. Sealed at raise. Revealed at exit or shutdown. Honesty becomes track record.",
    "home.useCase3Title": "Letters to your future self",
    "home.useCase3Body":
      "A note to yourself at 30, your child at 18, your team at the next anniversary. Trustless across years.",
    "home.useCase4Title": "Dead-man's switch",
    "home.useCase4Body":
      "Documents that auto-reveal at a date if you do not extend them. Source protection, succession planning, time-locked disclosures.",

    // ─── Home: Why Arkiv ────────────────────────────────────────────────
    "home.whyEyebrow": "Why this is only possible on Arkiv",
    "home.whyTitle": "The pieces no centralized DB can give you.",
    "home.why1Title": "Immutable authorship",
    "home.why1Body":
      "Every entity has a $creator stamped on-chain at creation. Cannot be edited, cannot be spoofed. Sell or transfer ownership later — the original author stays known forever.",
    "home.why2Title": "Differentiated expirations",
    "home.why2Body":
      "Capsules live up to a year past their unlock. Reveal markers live 90 days. Subscriptions auto-renew via extendEntity. Lifecycle as a first-class type, not an afterthought.",
    "home.why3Title": "Queryable relationships",
    "home.why3Body":
      "Reveal entities link to Capsule entities via shared-attribute keys. No foreign keys, no joins — just indexed predicates that resolve in O(log n).",
    "home.why4Title": "Verifiable, end to end",
    "home.why4Body":
      "Every create, update, and delete returns a tx hash on Braga. Anyone can replay the history in the block explorer without trusting Veil at all.",

    // ─── Home: Case File (real-world story) ─────────────────────────────
    "home.caseEyebrow": "Case file — a scenario you've seen",
    "home.caseDate": "December 12, 2024 · 03:47 UTC",
    "home.caseHeadline": "The 100K tweet that nobody can find anymore",
    "home.caseLede":
      'A trader you follow posts a chart: "BTC reaches 100K by end of Q1. Screenshot this." Eighteen thousand retweets in six hours. Three months later, BTC is at 67K. The tweet is gone. The trader now claims they "always said it could go either way." Nobody can prove what they wrote, when.',
    "home.caseSubhead": "What Veil would have done",
    "home.caseSubbody":
      "Had the call been sealed in Veil the night the chart was posted, the on-chain trail would have outlived the deletion. Anyone could query the entity by wallet, see the exact prediction, the exact timestamp, and grade the call without trusting the trader, Twitter, or us. The body would have been unreadable until Q1 closed — so nobody could have copied it. After Q1, anyone could decrypt and judge.",
    "home.caseTimelineHeader": "[TIMELINE]",
    "home.caseT1Date": "DEC 12 · 03:47Z",
    "home.caseT1Label": "SEAL",
    "home.caseT1Body":
      "trader writes the call, Veil encrypts it against a future drand round, posts the entity on Arkiv. Title + creator + unlock date are public; body is opaque ciphertext.",
    "home.caseT2Date": "MAR 31 · 23:59Z",
    "home.caseT2Label": "UNLOCK",
    "home.caseT2Body":
      "drand publishes the round. Decryption key becomes derivable. Anyone with the link reads the exact text the trader committed to. Nobody could have done so even one second earlier.",
    "home.caseT3Date": "APR 01 onward",
    "home.caseT3Label": "VERIFY",
    "home.caseT3Body":
      "the call is either right or wrong, in the open, no edits possible. Followers can grade. Reputation accrues to wallets, not handles.",
    "home.caseFootnote":
      "fictional scenario, exact mechanic this product enables. you can seal one yourself in the next minute.",

    // ─── Home: Trust signals ────────────────────────────────────────────
    "home.trust1": "Open source",
    "home.trust2": "No server holds keys",
    "home.trust3": "drand timelock encryption",
    "home.trust4": "Tx-verifiable on Braga",

    // ─── Home: Footer ───────────────────────────────────────────────────
    "home.footerTagline": "Trustless time capsules for the on-chain era.",
    "home.footerLinkRepo": "GitHub",
    "home.footerLinkArkiv": "Arkiv docs",
    "home.footerLinkDrand": "drand",
    "home.footerLinkChallenge": "ETHNS Challenge",
    "home.footerCopy": "Arkiv × ETHNS Builder Challenge — Privacy track",

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

    // ─── Home: Hero ─────────────────────────────────────────────────────
    "home.heroEyebrow": "Proof-of-call on-chain",
    "home.heroTitleA": "Deja de editar",
    "home.heroTitleB": "tu track record.",
    "home.heroSubtitle":
      "Sella tu alpha hoy. Veil la guarda cifrada hasta la fecha que elijas — nadie la lee antes, nadie detiene la revelación, nadie edita el timestamp. Prueba criptográfica de que la llamaste primero.",
    "home.heroCtaPrimary": "Sellar una call",
    "home.heroCtaSecondary": "Ver cápsulas en vivo",
    "home.heroAttribution":
      "Cifrado con drand timelock · guardado en Arkiv · verificable en Braga",
    "home.connectFirst": "Conecta tu wallet para sellar una call.",

    // ─── Home: Problem ──────────────────────────────────────────────────
    "home.problemEyebrow": "El problema",
    "home.problemTitle":
      "Cualquiera puede reclamar una call después de que pasa.",
    "home.problemBody":
      'Crypto Twitter está lleno de tweets borrados, screenshots editados y "yo te lo dije" sin pruebas. Los canales de tipsters borran sus trades perdedores. Los influencers cherry-pickean sus aciertos. No hay forma neutral de verificar quién dijo qué, cuándo.',
    "home.problemPoint1Title": "Los tweets se borran.",
    "home.problemPoint1Body":
      "Esa call viral que clavó el mes pasado, desaparece si estaba equivocada.",
    "home.problemPoint2Title": "Los screenshots se editan.",
    "home.problemPoint2Body":
      "Photoshop es gratis. Un screenshot de Telegram no prueba nada por sí solo.",
    "home.problemPoint3Title": "Los timestamps se inventan.",
    "home.problemPoint3Body":
      '"Esto lo dije hace dos meses" — sin cadena de custodia, es solo un reclamo.',

    // ─── Home: How it works ─────────────────────────────────────────────
    "home.howEyebrow": "Cómo Veil lo arregla",
    "home.howTitle": "Tres pasos. Cero confianza.",
    "home.howStep1Tag": "01",
    "home.howStep1Title": "Sellar",
    "home.howStep1Body":
      "Escribe tu call. Elige la fecha en que debe abrirse. Veil la cifra contra un round drand que aún no existe — y la guarda en Arkiv con tu wallet como autor inmutable.",
    "home.howStep2Tag": "02",
    "home.howStep2Title": "Esperar",
    "home.howStep2Body":
      "Nadie puede leer el contenido — ni nosotros, ni Arkiv, ni siquiera tú puedes probarle el contenido a otro antes de tiempo. El título y el timestamp son públicos para que se vea que te comprometiste.",
    "home.howStep3Tag": "03",
    "home.howStep3Title": "Revelar",
    "home.howStep3Body":
      "En el momento elegido, drand publica el round. La key se vuelve derivable matemáticamente. Cualquiera con el link lee el texto original. La primera desencripción puede anclarse on-chain como entity Reveal.",

    // ─── Home: Live example ─────────────────────────────────────────────
    "home.exampleEyebrow": "Velo funcionando",
    "home.exampleTitle": "Una call real sellada en Braga.",
    "home.exampleBody":
      "Esta cápsula fue sellada antes con un cuerpo que nadie podía leer hasta su hora de unlock. Ya está revelada — y el creator on-chain, el timestamp y el sha-256 del plaintext son verificables por cualquiera.",
    "home.exampleViewCta": "Ver la cápsula →",
    "home.exampleBrowseCta": "Ver todas las cápsulas públicas",

    // ─── Home: Use cases beyond alpha ───────────────────────────────────
    "home.useCasesEyebrow": "Más allá del alpha",
    "home.useCasesTitle": "Mismo primitivo, muchas formas.",
    "home.useCasesSubtitle":
      'Donde "quién lo dijo primero" importa y no se puede asumir un tercero confiable.',
    "home.useCase1Title": "Predicciones selladas",
    "home.useCase1Body":
      "Mercados, deportes, geopolítica, ciencia. Compromete tu pronóstico públicamente sin revelarlo — que la historia te califique.",
    "home.useCase2Title": "Pre-mortems de founders",
    "home.useCase2Body":
      "Lista las cinco razones por las que tu startup puede fallar. Sellado al levantar. Revelado al exit o al cierre. La honestidad se vuelve track record.",
    "home.useCase3Title": "Cartas a tu yo futuro",
    "home.useCase3Body":
      "Una nota para ti a los 30, tu hijo a los 18, tu equipo en el siguiente aniversario. Sin confianza, a través de los años.",
    "home.useCase4Title": "Dead-man's switch",
    "home.useCase4Body":
      "Documentos que se auto-revelan en una fecha si no los extiendes. Protección de fuentes, planificación sucesoria, divulgaciones programadas.",

    // ─── Home: Why Arkiv ────────────────────────────────────────────────
    "home.whyEyebrow": "Por qué esto solo es posible en Arkiv",
    "home.whyTitle": "Las piezas que ninguna DB centralizada da.",
    "home.why1Title": "Autoría inmutable",
    "home.why1Body":
      "Cada entity tiene un $creator sellado on-chain al crearse. No se edita, no se spoofea. Vende o transfiere ownership después — el autor original queda conocido para siempre.",
    "home.why2Title": "Expiraciones diferenciadas",
    "home.why2Body":
      "Las cápsulas viven hasta un año post-unlock. Los markers de Reveal viven 90 días. Las suscripciones se renuevan vía extendEntity. Ciclo de vida como tipo de primera clase, no como afterthought.",
    "home.why3Title": "Relaciones queryables",
    "home.why3Body":
      "Las entities Reveal apuntan a las Capsule via shared-attribute keys. Sin foreign keys, sin joins — solo predicados indexados que resuelven en O(log n).",
    "home.why4Title": "Verificable, de punta a punta",
    "home.why4Body":
      "Cada create, update y delete devuelve un tx hash en Braga. Cualquiera puede replayar la historia en el block explorer sin confiar en Veil para nada.",

    // ─── Home: Case File (escenario real) ───────────────────────────────
    "home.caseEyebrow": "Caso real — un escenario que ya viste",
    "home.caseDate": "12 de diciembre, 2024 · 03:47 UTC",
    "home.caseHeadline": "El tweet de los 100k que ya nadie encuentra",
    "home.caseLede":
      'Un trader que sigues publica un gráfico: "BTC llega a 100K antes de fin del Q1. Hagan screenshot esto." 18.000 retweets en seis horas. Tres meses después, BTC está en 67K. El tweet desapareció. El trader ahora dice que "siempre dijo que podía ir para los dos lados". Nadie puede probar qué escribió, ni cuándo.',
    "home.caseSubhead": "Qué habría hecho Veil",
    "home.caseSubbody":
      "Si la call hubiera sido sellada en Veil la noche que se publicó el chart, el rastro on-chain habría sobrevivido al borrado. Cualquiera podría consultar la entity por wallet, ver la predicción exacta, el timestamp exacto, y calificar la call sin confiar en el trader, en Twitter, ni en nosotros. El cuerpo habría sido ilegible hasta que cerrara Q1 — nadie podía copiarlo antes. Después de Q1, cualquiera puede descifrar y juzgar.",
    "home.caseTimelineHeader": "[CRONOLOGÍA]",
    "home.caseT1Date": "DIC 12 · 03:47Z",
    "home.caseT1Label": "SELLAR",
    "home.caseT1Body":
      "el trader escribe la call, Veil la cifra contra un round drand futuro, publica la entity en Arkiv. Título + creador + fecha de unlock son públicos; el cuerpo es ciphertext opaco.",
    "home.caseT2Date": "MAR 31 · 23:59Z",
    "home.caseT2Label": "ABRIR",
    "home.caseT2Body":
      "drand publica el round. La key se vuelve derivable. Cualquiera con el link lee el texto exacto al que el trader se comprometió. Nadie podía hacerlo ni un segundo antes.",
    "home.caseT3Date": "DESDE ABR 01",
    "home.caseT3Label": "VERIFICAR",
    "home.caseT3Body":
      "la call está bien o mal, a la vista, sin ediciones posibles. Los seguidores califican. La reputación acumula en wallets, no en handles.",
    "home.caseFootnote":
      "escenario ficticio, mecanismo exacto que este producto habilita. puedes sellar uno tú mismo en el próximo minuto.",

    // ─── Home: Trust signals ────────────────────────────────────────────
    "home.trust1": "Open source",
    "home.trust2": "Ningún server guarda keys",
    "home.trust3": "drand timelock encryption",
    "home.trust4": "Tx-verificable en Braga",

    // ─── Home: Footer ───────────────────────────────────────────────────
    "home.footerTagline":
      "Cápsulas del tiempo sin confianza para la era on-chain.",
    "home.footerLinkRepo": "GitHub",
    "home.footerLinkArkiv": "Arkiv docs",
    "home.footerLinkDrand": "drand",
    "home.footerLinkChallenge": "ETHNS Challenge",
    "home.footerCopy": "Arkiv × ETHNS Builder Challenge — Privacy track",

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
