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
    "nav.capsules": "Capsules",
    "nav.inheritance": "Inheritance",

    // ─── Case Files page (/case-files) — illustrated narratives ──────────
    "cf.navLink": "Case files",
    "cf.pageEyebrow": "Illustrated scenarios",
    "cf.pageTitle": "Case files.",
    "cf.pageLede":
      "The circuit diagrams on the home explain the protocols. These pages show what the protocols feel like in practice. Two case files: one for Capsules (a crypto analyst who stopped editing their record), one for the Inheritance protocol (three pictures of a cryptographic dead-man's switch).",
    "cf.section1Tag": "[§01 — VERIFIABLE ALPHA]",
    "cf.section2Tag": "[§02 — INHERITANCE PROTOCOL VISUALIZED]",
    "cf.section2Eyebrow": "Protocol illustrated",
    "cf.section2Title": "Three pictures of a cryptographic dead-man's switch.",
    "cf.section2Lede":
      "Wax seal + hourglass + envelopes — the same metaphors a notary used a hundred years ago, now encoded as drand timelock and Shamir threshold on a public-database chain.",
    "cf.proto01Label": "[01 — VAULT]",
    "cf.proto01Caption":
      "The vault entity, sealed with a wax sigil. Drand-timelocked at creation; only $owner can call extendEntity to push the unlock further into the future.",
    "cf.proto02Label": "[02 — HEARTBEAT]",
    "cf.proto02Caption":
      "Each heartbeat period, the owner turns the hourglass over (signs an extendEntity tx). The cardiogram keeps pulsing. The drand round target rolls forward; the vault stays sealed.",
    "cf.proto03Label": "[03 — RECOVERY]",
    "cf.proto03Caption":
      "If the owner stops signing, the round publishes. Three of the five named validators open their envelopes, combine their Shamir shares, and the original document reconstructs in the center.",
    "diag.writer": "WRITER",
    "diag.creatorImmutable": "$creator (immutable)",
    "diag.creatorOwner": "$creator + $owner",
    "diag.owner": "OWNER",
    "diag.capsule": "CAPSULE",
    "diag.vault": "VAULT",
    "diag.share": "SHARE",
    "diag.shamirPiece": "Shamir piece",
    "diag.recoveredOriginal": "RECOVERED ORIGINAL",
    "diag.reveal": "REVEAL",
    "diag.plaintext": "PLAINTEXT (derivable by anyone)",
    "diag.plaintextNote": "no entity — happens in any reader's browser",
    "diag.gate1": "GATE 1 — drand timelock",
    "diag.gate2": "GATE 2 — Shamir threshold",
    "diag.gateSingle": "GATE — drand timelock",
    "diag.extendEntity": "extendEntity",
    "diag.proofOfLife": "PROOF OF LIFE",
    "diag.ownerOnly": "$owner only",
    "diag.heartbeatReset": "heartbeat reset",
    "diag.mOfNcooperate": "M of N validators cooperate",
    "diag.sharedAttr": "shared-attribute key: vault_key",
    "diag.drandPublishes": "drand round N publishes",
    "diag.keyDerivable": "key becomes derivable",
    "diag.firstDecrypter": "first decrypter publishes",
    "diag.aRevealOnlyHash": "a Reveal (only hash, not text)",
    "diag.drandRoundPublished": "drand round published",
    "diag.shamirReconstructed": "+ Shamir reconstructed",
    "diag.timeline": "TIMELINE",
    "diag.tSeal": "seal it",
    "diag.tWait": "wait",
    "diag.tVerify": "verify",
    "diag.sealLeft": "SEAL",
    "diag.openRight": "OPEN",
    "diag.sealedBraga": "SEALED · BRAGA",
    "diag.proofTagline": "proof-of-call · proof-of-life",
    "diag.drandRound": "DRAND ROUND",

    "home.heroEyebrow": "On-chain time-locked secrets",
    "home.heroTitleA": "Seal it today.",
    "home.heroTitleB": "Open it on time.",
    "home.heroSubtitle":
      "Veil locks any message — a crypto call, a cold-storage seed, a will — until a future date you pick (or until your heartbeat goes silent and your validators recover it). Nobody can peek, nobody can stop the reveal, nobody can edit the timestamp. Cryptographic proof, custody-free.",
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
    "home.useCase4Title": "Inheritance vaults",
    "home.useCase4Body":
      "Documents that auto-recover to M of N validators if you stop signing. Cold-storage succession, source protection, time-locked disclosures. Now built — open the vault.",

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

    // ─── Home: Capsules section (first product, circuit-led) ────────────
    "home.capEyebrow": "Product 1 — verifiable alpha",
    "home.capTitle": "Capsules.",
    "home.capLede":
      "Write a message today, encrypt it against a drand round that does not exist yet, store it on Arkiv with your wallet as the immutable creator. At the unlock date the round publishes; the plaintext becomes derivable to anyone with the link. The first decrypter can anchor a Reveal entity — a public, hash-only proof of decryption — so the record of WHO decrypted WHEN sits on-chain too.",
    "home.capStat1": "drand timelock",
    "home.capStat2": "reveal entity",
    "home.capStat3": "public feed",
    "home.capStat4": "$creator immutable",
    "home.capStep1Title": "Seal",
    "home.capStep1Body":
      "client encrypts plaintext against drand round N. Capsule entity goes on-chain with payload + unlock_round + creator. nothing readable until round N is published.",
    "home.capStep2Title": "Wait",
    "home.capStep2Body":
      "drand mainnet publishes rounds on a schedule. nobody can speed it up. title and creator are public so commitment is visible without disclosure.",
    "home.capStep3Title": "Verify",
    "home.capStep3Body":
      "round publishes → key derivable in any reader's browser → plaintext recovered. first reader can publish a Reveal entity carrying only the sha-256, anchoring attribution on-chain.",
    "home.capCtaPrimary": "See live capsules",

    // ─── Home: Launch app banner — between the two product sections and Why ─
    "home.launchEyebrow": "The product",
    "home.launchTitle": "Open Veil.",
    "home.launchBody":
      "Both products live in the same app. One nav, two sections. The capsule feed is the public face. Inheritance vaults are private to their owner + their chosen validators. You stay in control of which one you use, and when.",
    "home.launchCta": "Launch app",

    // ─── Home: Inheritance Vaults (second product) ───────────────────────
    "home.inhEyebrow": "Beyond timestamps",
    "home.inhTitle": "Some secrets must survive you.",
    "home.inhLede":
      "Cold-storage seeds. Custodial keys. The PDF in a safe nobody can open. The same primitive that locks a call until a future date can lock a secret until you stop signing — and then release it to a quorum of validators you chose. No custody. No platform risk. Just math and a heartbeat.",
    "home.inhStep1Title": "Seal",
    "home.inhStep1Body":
      "Pick a threshold (2-of-3, 3-of-5, 5-of-7), a heartbeat period (3 / 6 / 12 months), and N validator wallets. The secret is drand-timelocked and Shamir-split. One Vault entity + N Share entities go on-chain.",
    "home.inhStep2Title": "Heartbeat",
    "home.inhStep2Body":
      "While you're alive, you call extendEntity on the Vault every period. Only the $owner can do this — a third party can't keep a missing user's vault alive. Each extension pushes the drand round target forward. Nobody can decrypt during this window.",
    "home.inhStep3Title": "Recover",
    "home.inhStep3Body":
      "If you stop signing, the heartbeat lapses. The drand round publishes. Any M of your N validators can fetch their share entities from Arkiv and combine them. The original secret is reconstructed. The exit is automatic, custody-free, and impossible to grief.",
    "home.inhStat1": "M-of-N quorum",
    "home.inhStat2": "drand timelock",
    "home.inhStat3": "3 / 6 / 12 mo heartbeat",
    "home.inhStat4": "zero custody",
    "home.inhCtaPrimary": "Open inheritance vaults",
    "home.inhCtaSecondary": "Read the patterns",

    // ─── Home: Case File (real-world story) ─────────────────────────────
    "home.caseEyebrow":
      "Case file — meet K-31, an analyst who got tired of editing their own history",
    "home.caseByline": "Singapore · paid newsletter · 340 → 890 subscribers",
    "home.caseDate": "December 12, 2024 · 03:47 UTC",
    "home.caseHeadline":
      "K-31 stopped trying to be right. They started being verifiable instead.",
    "home.caseLede":
      "K-31 is a 31-year-old crypto analyst in Singapore. Wire-rimmed glasses, kitchen office, 340 paying subscribers at $19/mo. Their problem isn't analysis — it's trust. Every call they get wrong, somebody screenshots it and tags them three weeks later. Every call they get right, three influencers claim they called it first. Their churn is 8% monthly and climbing. The market doesn't reward being right anymore. It rewards being able to prove you were right.",
    "home.caseSubhead": "The night they sealed their first call",
    "home.caseSubbody":
      "December 12, 2024, 03:47 UTC. K-31 writes \"BTC over 95K before January 16\" plus a 600-word thesis: macro setup, on-chain flows, where they're wrong if X happens. They don't tweet it. They seal it in Veil instead, public, unlock January 16. The body is encrypted client-side against a future drand round nobody — including K-31 — can read yet. The title, their wallet, and the unlock timestamp go on-chain. Everyone can see they committed. Nobody can see what.",
    "home.caseOutcomeHead": "January 16. BTC closes at 92K. Call fails.",
    "home.caseOutcomeBody":
      "K-31 cannot delete it. The cipher unlocks on schedule. The thesis becomes public, verbatim, with the on-chain creation timestamp anyone can verify on Braga. K-31 publishes a post: \"I was wrong. Here's why my model missed.\" They expect the worst. Their churn that month drops to 3%. Three months later they're at 890 subscribers. The market did not reward being right. It rewarded being unable to lie.",
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

    // ─── Inheritance — dead-man's switch with M-of-N quorum ─────────────
    "inh.navLink": "Inheritance vaults",
    "inh.newTitle": "New inheritance vault",
    "inh.newIntro":
      "Seal a secret today. If you stop signing for the heartbeat period, M of your N validators can together recover it. Cryptographic dead-man's switch — no custody, no platform risk.",
    "inh.fieldTitle": "Title",
    "inh.fieldTitlePlaceholder": "Cold-storage recovery (Ledger backup phrase)",
    "inh.fieldSecret": "Secret",
    "inh.fieldSecretHint":
      "What you want recoverable. Encrypted now, split into shares. Plaintext never leaves your browser.",
    "inh.fieldSecretPlaceholder":
      "Seed phrase, private key, safe combo, document text — anything you'd want delivered if you go silent.",
    "inh.fieldThreshold": "Threshold (M of N)",
    "inh.fieldThresholdHint":
      "How many validators must cooperate to recover. Higher = more secure, harder to recover.",
    "inh.fieldHeartbeat": "Heartbeat",
    "inh.fieldHeartbeatHint":
      "How often you must sign a tx to prove you're alive. If you miss it, recovery becomes possible.",
    "inh.fieldValidators": "Validators ({count} wallet addresses)",
    "inh.fieldValidatorsHint":
      "The wallets that can together recover this secret. Each gets one Shamir share. Convention: tell them now so they know to act if you go silent.",
    "inh.validatorPlaceholder": "0x… validator {i}",
    "inh.btnSeal": "Seal vault",
    "inh.statusEncrypting": "Encrypting secret with drand timelock…",
    "inh.statusSplitting": "Splitting into {n} Shamir shares…",
    "inh.statusCreatingVault": "Creating Vault entity on Arkiv…",
    "inh.statusCreatingShare": "Distributing share {i}/{n}…",
    "inh.statusDone": "Sealed. Redirecting…",
    "inh.errorConnect": "Connect your wallet first.",
    "inh.errorRequired": "Title and secret are required.",
    "inh.errorInvalidValidator":
      "Validator #{i} is not a valid 0x address (42 chars).",
    "inh.errorDuplicateValidator": "Validator addresses must be unique.",
    "inh.errorSelfValidator":
      "Validators cannot include your own wallet — defeats the purpose.",

    // ─── Inheritance — intro panel (use cases + steps) on /new ──────────
    "inh.introTag": "[WHAT IS THIS?]",
    "inh.introHeading": "A cryptographic dead-man's switch.",
    "inh.introLede":
      "You seal a secret today. As long as you keep signing one cheap heartbeat tx every few months, nobody can read it — not even you, not Veil, not Arkiv. If you go silent past the heartbeat period, M of N trusted validators can recover the secret together. No custody. No platform risk. Math + a wallet.",
    "inh.uc1Tag": "[USE.01]",
    "inh.uc1Title": "Cold-storage seed",
    "inh.uc1Body":
      "Your Ledger / Trezor recovery phrase. If something happens to you, 3 of 5 trusted people can recover your crypto holdings.",
    "inh.uc1Sample": "Ledger seed — main BTC + ETH cold storage",
    "inh.uc2Tag": "[USE.02]",
    "inh.uc2Title": "Multisig / Treasury keys",
    "inh.uc2Body":
      "Private shards for a DAO treasury, a fund's wallet, or a multisig signer. Custody-free succession.",
    "inh.uc2Sample": "Treasury — multisig signer A backup",
    "inh.uc3Tag": "[USE.03]",
    "inh.uc3Title": "Digital will",
    "inh.uc3Body":
      "Last-instructions document for your family — account list, location of physical valuables, final wishes. Released only when you can't.",
    "inh.uc3Sample": "Will + instructions for family",
    "inh.uc4Tag": "[USE.04]",
    "inh.uc4Title": "Critical passwords",
    "inh.uc4Body":
      "Bitwarden master password, 2FA recovery codes, root credentials for critical accounts. Self-host with a quorum, not a cloud.",
    "inh.uc4Sample": "Master password + 2FA recovery codes",
    "inh.useThisCta": "Use this →",
    "inh.stepsHeading": "How it works",
    "inh.step01Title": "Configure",
    "inh.step01Body":
      "Pick threshold (e.g. 3-of-5), heartbeat period (3 / 6 / 12 months), and N validator wallet addresses.",
    "inh.step02Title": "Seal",
    "inh.step02Body":
      "Your secret is drand-timelock-encrypted and Shamir-split client-side. The plaintext never leaves your browser.",
    "inh.step03Title": "Distribute",
    "inh.step03Body":
      "One Vault entity + N Share entities go on-chain on Arkiv. Each Share names one specific validator.",
    "inh.step04Title": "Live",
    "inh.step04Body":
      "Each heartbeat period, sign one cheap extendEntity tx. Vault stays sealed. If you stop signing, validators can recover.",

    // ─── Inheritance — vault view contextual banner ─────────────────────
    "inh.viewBannerAliveTitle": "Your vault is alive.",
    "inh.viewBannerAliveBody":
      "Sign a heartbeat tx before the timer hits zero to push the unlock further into the future. While you keep signing, the secret stays sealed forever.",
    "inh.viewBannerExpiredTitle": "Heartbeat lapsed. Recovery is open.",
    "inh.viewBannerExpiredBody":
      "The owner stopped signing past the heartbeat window. Any M of N validators can now combine their shares to reconstruct the original secret.",
    "inh.viewSharesHint":
      "These wallets each received one Shamir share. When M of them coordinate, the secret can be reconstructed. The shares are stored on Arkiv but useless on their own.",
    "inh.bannerNewCaption": "What you're about to create",
    "inh.bannerAliveCaption": "Your vault, sealed — heartbeat keeping it shut",
    "inh.bannerExpiredCaption":
      "Recovery is open — M of N validators can now act",
    "inh.bannerRecoverCaption":
      "Combine M of N shares to reconstruct the original",
    "inh.listEyebrow": "Inheritance",
    "inh.listTitle": "Vaults under your watch",
    "inh.listSubtitle":
      "Vaults you set up + vaults where someone trusted you as a validator.",
    "inh.listSectionMine": "As owner",
    "inh.listSectionValidator": "As validator",
    "inh.listEmptyMine": "No vaults yet. Set one up before you need it.",
    "inh.listEmptyValidator": "Nobody has named you as a validator yet.",
    "inh.listNewCta": "+ New vault",
    "inh.viewBadgeOwner": "Owner",
    "inh.viewBadgeValidator": "Validator",
    "inh.viewBadgeRecoverable": "Recoverable",
    "inh.viewBadgeAlive": "Alive",
    "inh.viewHeartbeatLabel": "Heartbeat expires in",
    "inh.viewHeartbeatExpired": "Heartbeat expired — recovery available",
    "inh.viewExtendCta": "I'm alive — extend heartbeat",
    "inh.viewExtendDone": "Extended.",
    "inh.viewSharesHeader": "Validators",
    "inh.viewRecoverCta": "Open recovery →",
    "inh.recoverTitle": "Recover vault",
    "inh.recoverIntro":
      "The owner has gone silent past the heartbeat. The drand round is now published, so each validator can read their share. Combine {m}-of-{n} shares to reconstruct the original secret.",
    "inh.recoverShareLoad": "Load my share",
    "inh.recoverShareLoaded": "Share loaded.",
    "inh.recoverCombineCta": "Combine shares",
    "inh.recoverSecret": "Recovered secret",
    "inh.recoverInsufficient":
      "Need at least {m} shares. Currently have {have}.",
    "inh.recoverNotEligible":
      "Your connected wallet is not on this vault's validator list.",
  },
  es: {
    // ─── Common ─────────────────────────────────────────────────────────
    "common.backToHome": "← VEIL",
    "common.connectFirst": "Conecta tu wallet para crear cápsulas.",
    "common.connectedAs": "conectado",
    "common.creator": "creador",
    "common.loading": "Cargando…",
    "common.toggleLang": "EN",
    "nav.capsules": "Cápsulas",
    "nav.inheritance": "Herencia",

    // ─── Página Case Files (/case-files) — narrativas ilustradas ────────
    "cf.navLink": "Casos",
    "cf.pageEyebrow": "Escenarios ilustrados",
    "cf.pageTitle": "Casos.",
    "cf.pageLede":
      "Los diagramas de circuito en la home explican los protocolos. Estas páginas muestran cómo se sienten los protocolos en la práctica. Dos casos: uno para Cápsulas (una analista crypto que dejó de editar su historial), uno para el protocolo de Herencia (tres imágenes de un interruptor de muerte criptográfico).",
    "cf.section1Tag": "[§01 — VERIFIABLE ALPHA]",
    "cf.section2Tag": "[§02 — PROTOCOLO DE HERENCIA VISUALIZADO]",
    "cf.section2Eyebrow": "Protocolo ilustrado",
    "cf.section2Title":
      "Tres imágenes de un interruptor de muerte criptográfico.",
    "cf.section2Lede":
      "Sello de cera + reloj de arena + sobres — las mismas metáforas que un notario usaba hace cien años, ahora codificadas como drand timelock y umbral Shamir en una cadena de base de datos pública.",
    "cf.proto01Label": "[01 — BÓVEDA]",
    "cf.proto01Caption":
      "La entity vault, sellada con un sigilo de cera. Cifrada con drand-timelock al crearse; solo $owner puede llamar extendEntity para empujar el unlock al futuro.",
    "cf.proto02Label": "[02 — HEARTBEAT]",
    "cf.proto02Caption":
      "Cada periodo de heartbeat, el dueño voltea el reloj de arena (firma una tx de extendEntity). El cardiograma sigue latiendo. El round drand objetivo se mueve al futuro; la bóveda sigue sellada.",
    "cf.proto03Label": "[03 — RECUPERACIÓN]",
    "cf.proto03Caption":
      "Si el dueño deja de firmar, el round se publica. Tres de los cinco validadores nombrados abren sus sobres, combinan sus shares Shamir, y el documento original se reconstruye en el centro.",
    "diag.writer": "ESCRITOR",
    "diag.creatorImmutable": "$creator (inmutable)",
    "diag.creatorOwner": "$creator + $owner",
    "diag.owner": "DUEÑO",
    "diag.capsule": "CÁPSULA",
    "diag.vault": "BÓVEDA",
    "diag.share": "FRAGMENTO",
    "diag.shamirPiece": "fragmento Shamir",
    "diag.recoveredOriginal": "ORIGINAL RECUPERADO",
    "diag.reveal": "REVELACIÓN",
    "diag.plaintext": "PLAINTEXT (derivable por cualquiera)",
    "diag.plaintextNote": "no es entity — ocurre en el browser del lector",
    "diag.gate1": "PUERTA 1 — drand timelock",
    "diag.gate2": "PUERTA 2 — umbral Shamir",
    "diag.gateSingle": "PUERTA — drand timelock",
    "diag.extendEntity": "extendEntity",
    "diag.proofOfLife": "PRUEBA DE VIDA",
    "diag.ownerOnly": "solo $owner",
    "diag.heartbeatReset": "reset del heartbeat",
    "diag.mOfNcooperate": "M de N validadores cooperan",
    "diag.sharedAttr": "clave-atributo-compartido: vault_key",
    "diag.drandPublishes": "el round drand N se publica",
    "diag.keyDerivable": "la key se vuelve derivable",
    "diag.firstDecrypter": "el primer descifrador publica",
    "diag.aRevealOnlyHash": "una Reveal (solo hash, no el texto)",
    "diag.drandRoundPublished": "round drand publicado",
    "diag.shamirReconstructed": "+ Shamir reconstruido",
    "diag.timeline": "CRONOLOGÍA",
    "diag.tSeal": "séllalo",
    "diag.tWait": "espera",
    "diag.tVerify": "verifica",
    "diag.sealLeft": "SELLAR",
    "diag.openRight": "ABRIR",
    "diag.sealedBraga": "SELLADO · BRAGA",
    "diag.proofTagline": "prueba-de-call · prueba-de-vida",
    "diag.drandRound": "ROUND DRAND",

    // ─── Home: Hero ─────────────────────────────────────────────────────
    "home.heroEyebrow": "Secretos con candado temporal on-chain",
    "home.heroTitleA": "Séllalo hoy.",
    "home.heroTitleB": "Ábrelo a tiempo.",
    "home.heroSubtitle":
      "Veil cifra cualquier mensaje — una call crypto, una seed de cold-storage, un testamento — hasta una fecha futura que elijas (o hasta que tu heartbeat se quede en silencio y tus validadores lo recuperen). Nadie puede leerlo, nadie detiene la revelación, nadie edita el timestamp. Prueba criptográfica, sin custodia.",
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
    "home.useCase4Title": "Bóvedas de herencia",
    "home.useCase4Body":
      "Documentos que se auto-recuperan a M de N validadores si dejas de firmar. Sucesión de cold-storage, protección de fuentes, divulgaciones programadas. Ya construido — abre la bóveda.",

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

    // ─── Home: Capsules section (primer producto, liderado por circuito) ─
    "home.capEyebrow": "Producto 1 — verifiable alpha",
    "home.capTitle": "Cápsulas.",
    "home.capLede":
      "Escribes un mensaje hoy, se cifra contra un round drand que aún no existe, se guarda en Arkiv con tu wallet como creador inmutable. En la fecha de unlock el round se publica; el plaintext se vuelve derivable para cualquiera con el link. El primer lector puede anclar una entity Reveal — prueba pública de descifrado, solo hash — para que el registro de QUIÉN descifró CUÁNDO también quede on-chain.",
    "home.capStat1": "drand timelock",
    "home.capStat2": "entity reveal",
    "home.capStat3": "feed público",
    "home.capStat4": "$creator inmutable",
    "home.capStep1Title": "Sellar",
    "home.capStep1Body":
      "el cliente cifra el plaintext contra el round drand N. La entity Capsule va on-chain con payload + unlock_round + creator. nada es legible hasta que el round N se publique.",
    "home.capStep2Title": "Esperar",
    "home.capStep2Body":
      "drand mainnet publica rounds en horario. nadie puede acelerarlo. título y creador son públicos para que el compromiso sea visible sin revelar el contenido.",
    "home.capStep3Title": "Verificar",
    "home.capStep3Body":
      "el round se publica → la key es derivable en el browser de cualquier lector → se recupera el plaintext. el primer lector puede publicar una entity Reveal con solo el sha-256, anclando la atribución on-chain.",
    "home.capCtaPrimary": "Ver cápsulas en vivo",

    // ─── Home: Launch app banner — entre los dos productos y Why Arkiv ──
    "home.launchEyebrow": "El producto",
    "home.launchTitle": "Abrir Veil.",
    "home.launchBody":
      "Los dos productos viven en la misma app. Una nav, dos secciones. El feed de cápsulas es la cara pública. Las bóvedas de herencia son privadas para su dueño + sus validadores elegidos. Tú controlas cuál usar, y cuándo.",
    "home.launchCta": "Lanzar app",

    // ─── Home: Inheritance Vaults (segundo producto) ─────────────────────
    "home.inhEyebrow": "Más allá de los timestamps",
    "home.inhTitle": "Algunos secretos deben sobrevivirte.",
    "home.inhLede":
      "Seeds de cold-storage. Claves custodiales. El PDF en una caja fuerte que nadie puede abrir. El mismo primitivo que sella una call hasta una fecha futura puede sellar un secreto hasta que dejes de firmar — y entonces liberarlo a un quórum de validadores que tú elegiste. Sin custodia. Sin riesgo de plataforma. Solo matemática y un heartbeat.",
    "home.inhStep1Title": "Sellar",
    "home.inhStep1Body":
      "Elige un umbral (2-de-3, 3-de-5, 5-de-7), un periodo de heartbeat (3 / 6 / 12 meses) y N wallets validadoras. El secreto se cifra con drand timelock y se divide con Shamir. Una entity Vault + N entities Share van on-chain.",
    "home.inhStep2Title": "Heartbeat",
    "home.inhStep2Body":
      "Mientras estés vivo, llamas extendEntity sobre la Vault cada periodo. Solo el $owner puede — un tercero no puede mantener viva una vault de un usuario desaparecido. Cada extensión empuja el round drand hacia el futuro. Nadie puede descifrar en este intervalo.",
    "home.inhStep3Title": "Recuperar",
    "home.inhStep3Body":
      "Si dejas de firmar, el heartbeat expira. El round drand se publica. Cualquier M de tus N validadores pueden traer sus shares desde Arkiv y combinarlas. El secreto original se reconstruye. La salida es automática, sin custodia, imposible de bloquear.",
    "home.inhStat1": "Quórum M-de-N",
    "home.inhStat2": "drand timelock",
    "home.inhStat3": "Heartbeat 3 / 6 / 12 mo",
    "home.inhStat4": "Cero custodia",
    "home.inhCtaPrimary": "Abrir bóvedas de herencia",
    "home.inhCtaSecondary": "Leer los patrones",

    // ─── Home: Case File (escenario real) ───────────────────────────────
    "home.caseEyebrow":
      "Caso real — K-31, analista que se cansó de editar su propio historial",
    "home.caseByline": "Singapur · newsletter de pago · 340 → 890 suscriptores",
    "home.caseDate": "12 de diciembre, 2024 · 03:47 UTC",
    "home.caseHeadline":
      "K-31 dejó de intentar tener razón. Empezó a ser verificable.",
    "home.caseLede":
      "K-31 es una analista crypto de 31 años en Singapur. Lentes de marco metálico, oficina-cocina, 340 suscriptores pagando $19/mes. Su problema no es el análisis — es la confianza. Cada call que falla, alguien le hace screenshot y la tagea tres semanas después. Cada call que acierta, tres influencers dicen que la llamaron primero. Su churn es 8% mensual y subiendo. El mercado dejó de premiar tener razón. Premia poder probar que tuviste razón.",
    "home.caseSubhead": "La noche que selló su primera call",
    "home.caseSubbody":
      '12 de diciembre 2024, 03:47 UTC. K-31 escribe "BTC sobre 95K antes del 16 de enero" + 600 palabras de tesis: setup macro, flujos on-chain, dónde está equivocada si X pasa. No la tuitea. La sella en Veil, pública, unlock el 16 de enero. El cuerpo se cifra client-side contra un round drand futuro que nadie — ni K-31 — puede leer aún. El título, su wallet y el timestamp de unlock van on-chain. Todos pueden ver que se comprometió. Nadie puede ver con qué.',
    "home.caseOutcomeHead": "16 de enero. BTC cierra en 92K. La call falla.",
    "home.caseOutcomeBody":
      'K-31 no puede borrarla. El cifrado se abre en horario. La tesis se vuelve pública, palabra por palabra, con el timestamp de creación on-chain que cualquiera puede verificar en Braga. K-31 publica un post: "Me equivoqué. Aquí por qué falló mi modelo." Esperaba lo peor. Su churn ese mes baja a 3%. Tres meses después tiene 890 suscriptores. El mercado no premió tener razón. Premió no poder mentir.',
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

    // ─── Inheritance — interruptor de muerte con quórum M-de-N ──────────
    "inh.navLink": "Bóvedas de herencia",
    "inh.newTitle": "Nueva bóveda de herencia",
    "inh.newIntro":
      "Sella un secreto hoy. Si dejas de firmar durante el periodo de heartbeat, M de tus N validadores pueden recuperarlo juntos. Interruptor de muerte criptográfico — sin custodia, sin riesgo de plataforma.",
    "inh.fieldTitle": "Título",
    "inh.fieldTitlePlaceholder": "Recovery cold-storage (frase de Ledger)",
    "inh.fieldSecret": "Secreto",
    "inh.fieldSecretHint":
      "Lo que quieres que sea recuperable. Se cifra ahora y se divide en shares. El plaintext nunca sale de tu browser.",
    "inh.fieldSecretPlaceholder":
      "Seed phrase, llave privada, combinación de caja fuerte, texto de un documento — cualquier cosa que debería entregarse si te quedas en silencio.",
    "inh.fieldThreshold": "Umbral (M de N)",
    "inh.fieldThresholdHint":
      "Cuántos validadores deben cooperar para recuperar. Más alto = más seguro, más difícil de recuperar.",
    "inh.fieldHeartbeat": "Heartbeat",
    "inh.fieldHeartbeatHint":
      "Cada cuánto debes firmar una tx para probar que estás vivo. Si fallas, la recuperación se habilita.",
    "inh.fieldValidators": "Validadores ({count} direcciones de wallet)",
    "inh.fieldValidatorsHint":
      "Las wallets que pueden recuperar este secreto juntos. Cada uno recibe una share Shamir. Convención: avísales ahora para que sepan actuar si te quedas en silencio.",
    "inh.validatorPlaceholder": "0x… validador {i}",
    "inh.btnSeal": "Sellar bóveda",
    "inh.statusEncrypting": "Cifrando secreto con drand timelock…",
    "inh.statusSplitting": "Dividiendo en {n} shares Shamir…",
    "inh.statusCreatingVault": "Creando Vault entity en Arkiv…",
    "inh.statusCreatingShare": "Distribuyendo share {i}/{n}…",
    "inh.statusDone": "Sellada. Redirigiendo…",
    "inh.errorConnect": "Conecta tu wallet primero.",
    "inh.errorRequired": "Título y secreto son obligatorios.",
    "inh.errorInvalidValidator":
      "El validador #{i} no es una dirección 0x válida (42 chars).",
    "inh.errorDuplicateValidator":
      "Las direcciones de validador deben ser únicas.",
    "inh.errorSelfValidator":
      "Los validadores no pueden incluir tu propia wallet — pierde el sentido.",

    // ─── Inheritance — panel intro (use cases + steps) en /new ──────────
    "inh.introTag": "[¿QUÉ ES ESTO?]",
    "inh.introHeading": "Un interruptor de muerte criptográfico.",
    "inh.introLede":
      "Sellas un secreto hoy. Mientras sigas firmando una tx barata de heartbeat cada cierto tiempo, nadie puede leerlo — ni siquiera tú, ni Veil, ni Arkiv. Si te quedas en silencio más allá del periodo de heartbeat, M de N validadores de confianza pueden recuperar el secreto juntos. Sin custodia. Sin riesgo de plataforma. Matemática + una wallet.",
    "inh.uc1Tag": "[USO.01]",
    "inh.uc1Title": "Seed de cold-storage",
    "inh.uc1Body":
      "Tu frase de recuperación de Ledger / Trezor. Si te pasa algo, 3 de 5 personas de confianza pueden recuperar tus criptos.",
    "inh.uc1Sample": "Seed Ledger — cold storage principal BTC + ETH",
    "inh.uc2Tag": "[USO.02]",
    "inh.uc2Title": "Llaves de multisig / Treasury",
    "inh.uc2Body":
      "Fragmentos privados para el treasury de un DAO, la wallet de un fondo, o un signer de multisig. Sucesión sin custodia.",
    "inh.uc2Sample": "Treasury — backup del signer A del multisig",
    "inh.uc3Tag": "[USO.03]",
    "inh.uc3Title": "Testamento digital",
    "inh.uc3Body":
      "Documento de últimas instrucciones para tu familia — lista de cuentas, ubicación de bienes físicos, deseos finales. Se libera solo cuando ya no puedes.",
    "inh.uc3Sample": "Testamento + instrucciones para la familia",
    "inh.uc4Tag": "[USO.04]",
    "inh.uc4Title": "Contraseñas críticas",
    "inh.uc4Body":
      "Master password de Bitwarden, códigos de recuperación 2FA, credenciales root de cuentas críticas. Self-host con quórum, no en la nube.",
    "inh.uc4Sample": "Master password + códigos de recuperación 2FA",
    "inh.useThisCta": "Usar este →",
    "inh.stepsHeading": "Cómo funciona",
    "inh.step01Title": "Configurar",
    "inh.step01Body":
      "Elige el umbral (ej. 3-de-5), el periodo de heartbeat (3 / 6 / 12 meses) y N direcciones de wallet validadoras.",
    "inh.step02Title": "Sellar",
    "inh.step02Body":
      "Tu secreto se cifra con drand-timelock y se divide con Shamir, todo client-side. El plaintext nunca sale de tu browser.",
    "inh.step03Title": "Distribuir",
    "inh.step03Body":
      "Una entity Vault + N entities Share van on-chain en Arkiv. Cada Share nombra a un validador específico.",
    "inh.step04Title": "Vivir",
    "inh.step04Body":
      "Cada periodo de heartbeat, firmas una tx barata de extendEntity. La bóveda sigue sellada. Si dejas de firmar, los validadores pueden recuperar.",

    // ─── Inheritance — banner contextual en la vista de bóveda ──────────
    "inh.viewBannerAliveTitle": "Tu bóveda está viva.",
    "inh.viewBannerAliveBody":
      "Firma una tx de heartbeat antes de que el timer llegue a cero para empujar el unlock más al futuro. Mientras sigas firmando, el secreto se queda sellado para siempre.",
    "inh.viewBannerExpiredTitle": "Heartbeat expirado. Recuperación abierta.",
    "inh.viewBannerExpiredBody":
      "El dueño dejó de firmar más allá del periodo de heartbeat. Cualquier M de N validadores ya pueden combinar sus shares para reconstruir el secreto original.",
    "inh.viewSharesHint":
      "Estas wallets recibieron cada una una share de Shamir. Cuando M de ellas se coordinan, el secreto se reconstruye. Las shares están guardadas en Arkiv pero por sí solas no sirven.",
    "inh.bannerNewCaption": "Lo que estás por crear",
    "inh.bannerAliveCaption":
      "Tu bóveda, sellada — el heartbeat la mantiene cerrada",
    "inh.bannerExpiredCaption":
      "Recuperación abierta — M de N validadores pueden actuar",
    "inh.bannerRecoverCaption":
      "Combina M de N shares para reconstruir el original",
    "inh.listEyebrow": "Herencia",
    "inh.listTitle": "Bóvedas bajo tu vigilancia",
    "inh.listSubtitle":
      "Bóvedas que configuraste + bóvedas donde alguien te nombró validador.",
    "inh.listSectionMine": "Como dueño",
    "inh.listSectionValidator": "Como validador",
    "inh.listEmptyMine":
      "Aún no hay bóvedas. Configura una antes de necesitarla.",
    "inh.listEmptyValidator": "Nadie te ha nombrado validador todavía.",
    "inh.listNewCta": "+ Nueva bóveda",
    "inh.viewBadgeOwner": "Dueño",
    "inh.viewBadgeValidator": "Validador",
    "inh.viewBadgeRecoverable": "Recuperable",
    "inh.viewBadgeAlive": "Vivo",
    "inh.viewHeartbeatLabel": "Heartbeat expira en",
    "inh.viewHeartbeatExpired": "Heartbeat expirado — recuperación disponible",
    "inh.viewExtendCta": "Estoy vivo — extender heartbeat",
    "inh.viewExtendDone": "Extendido.",
    "inh.viewSharesHeader": "Validadores",
    "inh.viewRecoverCta": "Abrir recuperación →",
    "inh.recoverTitle": "Recuperar bóveda",
    "inh.recoverIntro":
      "El dueño se ha quedado en silencio más allá del heartbeat. El round drand ya está publicado, así que cada validador puede leer su share. Combina {m}-de-{n} shares para reconstruir el secreto original.",
    "inh.recoverShareLoad": "Cargar mi share",
    "inh.recoverShareLoaded": "Share cargada.",
    "inh.recoverCombineCta": "Combinar shares",
    "inh.recoverSecret": "Secreto recuperado",
    "inh.recoverInsufficient":
      "Se necesitan al menos {m} shares. Actualmente hay {have}.",
    "inh.recoverNotEligible":
      "Tu wallet conectada no está en la lista de validadores de esta bóveda.",
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
