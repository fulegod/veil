# Veil

**Programmable trust, powered by proof of life.**
Schedule what happens when you stop signing — secrets that release themselves,
documents that deliver themselves, wallets that transfer themselves.

> _$140B+ in crypto is lost forever to dead wallets._
> _(Chainalysis: ~20% of all BTC permanently lost. At current prices, ~$140B.)_
> _Yours doesn't have to be next._

|                          |                                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Demo**                 | https://web-eta-hazel-33.vercel.app                                                                                                                                                                                                                              |
| **Live capsule example** | [`0x91807c…0403a`](https://web-eta-hazel-33.vercel.app/capsule/0x91807c370f60f91312267f23a319f2d587b09a20b0cc502287ac1eb2081d403a) · [view tx](https://explorer.braga.hoodi.arkiv.network/tx/0x7d23fef2d37e94d09a999266809d23c4db71bd06df1bf35262c7fa18300a1fe1) |
| **Network**              | Arkiv on Braga testnet (chainId `60138453102`)                                                                                                                                                                                                                   |
| **Stack**                | Bun · Next.js 16 · React 19 · `@arkiv-network/sdk` · `tlock-js` · wagmi · viem · RainbowKit                                                                                                                                                                      |
| **Challenge**            | Arkiv × ETHNS Builder Challenge — Privacy track                                                                                                                                                                                                                  |

---

## The problem

Crypto Twitter is full of deleted tweets, edited screenshots and "I told you so" with no proof. Tipster channels delete losing trades. Influencers cherry-pick their wins. There is no neutral, trust-less way to verify who said what, when.

## What Veil does

Veil ships **two products and a programmable trigger layer** on the same primitive:

1. **Capsules** — seal a message **or a file** today that nobody can read until the date you choose. The payload (text up to any length, or a binary file up to ~1 MB — photo, audio, PDF, short video) is drand-timelock-encrypted client-side before it touches Arkiv. At unlock time the contents become readable; the author and timestamp are anchored on-chain and cannot be edited. Use cases: _verifiable alpha_ (sealed crypto calls), letters to your future self, sealed evidence with a future-dated reveal.

2. **Inheritance Vaults** — a **cryptographic dead-man's switch**. Seal a secret today (seed phrase, key, document) that becomes recoverable by **M of N validators** if you stop signing a "heartbeat" transaction for a chosen period (3m / 6m / 1y). No custody, no platform.

3. **Programmable triggers** — every Vault can carry multiple **Action entities**, each describing _what should happen at a specific moment in its lifecycle_. A single vault can email your heir a goodbye note 30 days before expiry, email the legal team the day it lapses, and deliver an encrypted PDF to a journalist on the same trigger — all scheduled, all fired by a Vercel cron polling Arkiv hourly. Today: `email_warning`, `email_delivery`, `doc_drop` are LIVE. `transfer` (wallet) is on the roadmap (needs account abstraction).

Use cases the trigger layer unlocks beyond crypto recovery:

|                          | Trigger                | Outcome                                    |
| ------------------------ | ---------------------- | ------------------------------------------ |
| **Digital will**         | 18 months silent       | email to family + IPFS docs + ETH transfer |
| **Whistleblower switch** | 7 days no check-in     | PDF evidence emailed to 3 journalists      |
| **Anti-coercion wallet** | 24h no heartbeat       | auto-drain to a foundation, not the captor |
| **Equity vesting**       | leaving the cap table  | equity transfers back to treasury          |
| **Time-locked evidence** | statute-of-limitations | prosecutor email + public IPFS pin         |

The framing: **programmable trust**. Capsules pick "time" as the trigger; Inheritance picks "absence of life-signal"; Action entities make the second category generic — any condition, any recipient, any payload.

## How it works

```
[1] SEAL                    [2] WAIT                    [3] REVEAL
  ─────────────────────       ─────────────────────       ─────────────────────
  • write text                • drand has not yet         • drand publishes the
  • pick a future date          published the round         round → key becomes
  • client encrypts the       • nobody (not even you)       derivable
    text against a drand        can produce the key       • anyone with the
    round that does not       • title + creator are         link decrypts
    exist yet                   public                    • optional: anchor the
  • store as an Arkiv         • body is opaque              first decryption as
    entity, signed with         ciphertext                  a Reveal entity
    the user's wallet
```

The cryptography under the hood is [**timelock encryption via drand**](https://drand.love/blog/2023/10/03/timelock-encryption/) on the [`@arkiv-network/sdk`](https://www.npmjs.com/package/@arkiv-network/sdk) for storage + attribution + queryability. Wallet signing through MetaMask / wagmi.

### Inheritance Vaults — same primitive, additional layer

```
[1] SEAL                       [2] HEARTBEAT                  [3] RECOVER
  ─────────────────────────      ─────────────────────────      ─────────────────────────
  • write secret                 • owner periodically calls     • owner stops signing
  • pick threshold (M-of-N)        extendEntity on the Vault    • drand publishes the
  • pick heartbeat (3m/6m/1y)      → expiresIn resets             round → vault is
  • pick N validator wallets     • this is the "I'm alive"        decryptable
  • client encrypts secret         signal                       • any M of N validators
    against a drand round at     • drand round target rolls       fetch their shares from
    now + heartbeat                forward with each extension    Arkiv and combine them
  • secret is split via          • nobody can decrypt during    • Shamir reconstructs the
    Shamir M-of-N                  this period                    original plaintext
  • 1 Vault entity + N Share
    entities written to Arkiv
```

Two failure modes both work:

- **Owner alive** → keeps extending → drand round target stays in the future → secret stays sealed forever
- **Owner silent past heartbeat** → drand publishes the round → vault expires → M validators can recover

The validators don't need any custodial infrastructure. The whole system is just: drand timelock + Shamir splits + Arkiv entities with diverging expirations. No multisig, no escrow.

## Why this is only possible on Arkiv

|                                                 | Centralized DB (Firebase, Supabase…) | Arkiv                                                            |
| ----------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Can the host edit the timestamp?                | Yes, full DB access                  | No, on-chain                                                     |
| Can the host forge the author?                  | Yes                                  | No, `$creator` is signed at creation                             |
| Can the host serve stale state?                 | Yes                                  | No, every read is a chain query                                  |
| Can a user re-issue a deleted entity unchanged? | Trivially                            | No, every entity has a unique key tied to the tx that created it |
| Lifecycle per entity kind                       | Manual in app code                   | Native via `expiresIn` + `extendEntity`                          |
| Verifiable from outside the app                 | No                                   | Yes — explorer.braga.hoodi.arkiv.network shows everything        |

These properties are why "verifiable alpha" makes sense at all. Take any of them away and the product collapses into "trust this app and the screenshots it shows you".

## Architecture

```
ethns-builder/
├── web/                          ← Next.js 16 + React 19 app
│   ├── src/
│   │   ├── app/                  ← App Router pages
│   │   │   ├── page.tsx          ← 8-section landing
│   │   │   ├── capsule/
│   │   │   │   ├── new/page.tsx  ← seal flow
│   │   │   │   └── [entityKey]/page.tsx  ← view + auto-decrypt + reveal
│   │   │   ├── capsules/page.tsx ← public feed
│   │   │   └── inheritance/      ← dead-man's switch with Shamir M-of-N
│   │   │       ├── page.tsx              ← dashboard (mine + as validator)
│   │   │       ├── new/page.tsx          ← create vault flow
│   │   │       └── [entityKey]/
│   │   │           ├── page.tsx          ← view + heartbeat extend button
│   │   │           └── recover/page.tsx  ← M-of-N share combiner
│   │   ├── lib/
│   │   │   ├── arkiv.ts          ← typed wrappers, PROJECT_ATTRIBUTE enforced
│   │   │   ├── tlock.ts          ← encrypt / decrypt / drand client (text + bytes)
│   │   │   ├── capsule-payload.ts ← pack/unpack envelope: text vs file
│   │   │   ├── inheritance.ts    ← Shamir SSS + heartbeat presets
│   │   │   ├── email.ts          ← Resend wrapper + console.log fallback; warning / delivery / doc-drop
│   │   │   ├── wagmi.ts          ← chains + connectors
│   │   │   ├── config.ts         ← PROJECT_ATTRIBUTE + entity kinds + ACTION_TYPE
│   │   │   └── i18n.ts           ← typed EN/ES dictionary
│   │   ├── app/api/cron/check-vaults/route.ts  ← Vercel cron — fires Actions hourly
│   │   ├── components/           ← Header, LanguageToggle, VeilAvatar, …
│   │   └── hooks/useArkivClients.ts ← wagmi → Arkiv wallet client bridge
│   ├── vercel.json               ← cron schedule + framework config
│   └── public/error-silencer.js  ← runs beforeInteractive
├── smoke/                         ← standalone validation scripts (Bun)
│   └── src/{wallet,arkiv,tlock,combined}.ts
├── CLAUDE.md                      ← AI builder rules for this project
├── PATTERNS.md                    ← Arkiv patterns this build demonstrates
└── SKILLS.md                      ← index of skills loaded
```

## Arkiv patterns this project demonstrates

The full write-up with code snippets is in [`PATTERNS.md`](./PATTERNS.md). Briefly:

| #   | Pattern                                                                                                                                                                                                                                                                                                                                                 | Where in code                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **`PROJECT_ATTRIBUTE` on every create AND every query** — non-negotiable on a shared public DB                                                                                                                                                                                                                                                          | `lib/config.ts` + every helper in `lib/arkiv.ts`      |
| 2   | **`$creator` (immutable) vs `$owner` (mutable)** — used distinctly so capsule sale doesn't erase author                                                                                                                                                                                                                                                 | `Capsule.$creator` ≠ `Reveal.$creator`                |
| 3   | **Differentiated `expiresIn` per entity kind** — Capsule 1y, Reveal 90d, Vault = heartbeat, Share ~10y                                                                                                                                                                                                                                                  | `lib/arkiv.ts` per-helper `expiresIn`                 |
| 4   | **Relationships via shared-attribute keys** — `Reveal.capsule_key`, `Share.vault_key`, no foreign keys                                                                                                                                                                                                                                                  | `findFirstRevealForCapsule()` + `getSharesForVault()` |
| 5   | **Timelock encryption on top of Arkiv** — drand round number stored as queryable numeric attribute                                                                                                                                                                                                                                                      | `lib/tlock.ts` + `unlock_round` attribute             |
| 6   | **`extendEntity` as a living "heartbeat"** — only `$owner` can call; absence of call = entity expires                                                                                                                                                                                                                                                   | `extendVault()` + `/inheritance/[key]` button         |
| 7   | **Multi-kind composition** — 5 entity kinds (Capsule / Reveal / Vault / Share / Action) wired by indexed attributes                                                                                                                                                                                                                                     | `ENTITY_KIND` in `config.ts`                          |
| 8   | **Cryptographic threshold on top** — Shamir M-of-N split across Share entities, recoverable only by quorum                                                                                                                                                                                                                                              | `lib/inheritance.ts` + `/inheritance/[key]/recover`   |
| 9   | **Off-chain action dispatcher driven by on-chain state** — Action entities scheduled in Arkiv, fired by a Vercel cron polling hourly; `notified_at` numeric attribute as idempotency anchor                                                                                                                                                             | `Action` entity + `/api/cron/check-vaults/route.ts`   |
| 10  | **Binary payloads on a string-shaped substrate** — Capsule payloads carry a 1-byte kind tag + length-prefixed name/mime + raw file bytes, all then drand-encrypted. The same primitive renders text, photos, audio, video and PDFs in the browser after unlock.                                                                                         | `lib/capsule-payload.ts` + `/capsule/[key]`           |
| 11  | **Cross-entity composition (Vault → Action → Capsule)** — a `doc_drop` Action keeps a `capsule_key` attribute pointing at a separate Capsule entity. When the heartbeat lapses, the cron emails a deep-link to the Capsule, whose drand round is the same as the heartbeat round — so the recipient's browser can decrypt only after the trigger fires. | `createAction({capsuleKey})` + cron `doc_drop` branch |

## End-to-end evidence on Braga

The `smoke/src/inheritance-e2e.ts` script runs the **full Inheritance feature against real Arkiv** — encrypt with drand, split with Shamir, write 1 Vault + 5 Share + 2 Action entities, query each one back, wait for the drand round, recombine 3-of-5 shares and assert plaintext matches. Run it yourself with `cd smoke && bun run inheritance`.

Output from the run on 2026-05-25:

```
✅ Vault entity: 0xb33d392775695b472d7815d7ef5d6989d5e2ff125ce961980fed03c986b26420
   Vault tx:     0xb81d23c69d118c9dc03ba2c3254883cc17f63769a4bcc444ce6b55b2322ff33b
   Share #1 tx:  0x7ea33182ff0ef7b110664110a0ab30e903d1afb35694a3daea66a1031a06665c
   Share #2 tx:  0xb3a6762bf0a916b1a5a143b2897caaefcd670e1f93a6e93de140e5cdb4542930
   Share #3 tx:  0x742b2261e8883f36acc4e9e664ec76d444ca91e8c18447ccec536eb6b9c16df3
   Share #4 tx:  0x42e71ab5f72642e93d6e37ba0f5a7438e650f4ecddfcdd32f05639835f53ca5d
   Share #5 tx:  0x845eb41f2f5490b01ede38fc685f81f2e8e15b2d0cea37a04578f53a90f77d24
   Action [email_warning]  tx: 0x5dcd2cf288a5cb27a86c070e7918fcd2b8c2158c6ee317e3bd8bc8333daa16b7
   Action [email_delivery] tx: 0x6a37e5406a429dde850bc9485c99afc118c738b0517c42adf3835e4a1c31cfc4

✓ getEntity returns vault with correct attrs
✓ getSharesForVault returns 5 shares (sorted by share_index)
✓ listVaultsForValidator finds vault from validator 3's perspective
✓ getActionsForVault returns 2 actions
✓ Each action's payload + attributes round-trip correctly
✓ Recovered secret matches original after 3-of-5 Shamir combine
```

The vault entity is browsable at [explorer.braga.hoodi.arkiv.network/entity/0xb33d…6420](https://explorer.braga.hoodi.arkiv.network/entity/0xb33d392775695b472d7815d7ef5d6989d5e2ff125ce961980fed03c986b26420) — the `PROJECT_ATTRIBUTE`, `kind=vault`, `threshold=3`, `total_shares=5` etc. are all visible on-chain. The 5 share entities link to it via the `vault_key` attribute. The 2 action entities link via the same `vault_key` and carry the email payloads + `trigger_at` for the off-chain cron dispatcher.

This is the evidence that the feature works against the real Braga network, not just in a unit test.

## Things I learned about Arkiv while building this

Documented in [`PATTERNS.md` § "Things I learned"](./PATTERNS.md#quirks-i-learned-about-arkiv-while-building-veil) for the next builder who hits the same. Highlights:

1. **`buildQuery().fetch()` returns only entity keys by default.** You must opt-in to `.withAttributes()`, `.withMetadata()`, `.withPayload()`. Otherwise the list page silently shows zero data with no error.
2. **`and()` / `or()` take an array, not varargs.** Wrong call constructs an invalid predicate that fails at fetch-time as `predicate.predicates.map is not a function`, hours from where the bug actually lives.
3. **Node v24 silently breaks `updateEntity` and `extendEntity`.** The promise never resolves, no error. Open issue `arkiv-sdk-js#14`. Fix: run under Bun (we ship `bun --bun next dev` and `bun src/X.ts`).

These are the kind of quirks that cost hours and the docs don't yet cover. Open-sourcing them is part of being a "reference implementation".

## Getting started locally

### Prerequisites

- **Bun** ≥ 1.3 — `curl -fsSL https://bun.sh/install | bash`
- **MetaMask** browser extension
- **A wallet with GLM on Braga testnet** — get it from https://braga.hoodi.arkiv.network/faucet/

### Run the smoke tests first (no UI, no wallet UX)

```bash
cd smoke
bun install
bun run wallet     # generates a dev wallet, prints the address
                   # → fund it at https://braga.hoodi.arkiv.network/faucet/
bun run arkiv      # Arkiv SDK end-to-end CRUD on Braga
bun run tlock      # tlock encrypt/wait/decrypt cycle against drand mainnet
bun run combined   # both together — Arkiv stores tlock ciphertext, drand reveals
```

If `combined` passes, the network + crypto stack works end-to-end on your machine.

### Run the app

```bash
cd web
bun install
bun --bun next dev
# → open http://localhost:3000
```

Note the `--bun` flag. Without it, Next.js runs under whatever Node is in PATH; under Node v24 the SDK has a known hang on `updateEntity` / `extendEntity`.

### Add Braga to MetaMask

| Field              | Value                                        |
| ------------------ | -------------------------------------------- |
| Network name       | `Braga`                                      |
| RPC URL            | `https://braga.hoodi.arkiv.network/rpc`      |
| Chain ID           | `60138453102`                                |
| Currency symbol    | `GLM`                                        |
| Block explorer URL | `https://explorer.braga.hoodi.arkiv.network` |

## Project decisions worth knowing

- **No WalletConnect by default.** RainbowKit's `getDefaultConfig` pulls in WalletConnect/Reown even when there's no real `NEXT_PUBLIC_WC_PROJECT_ID`, which spams the dev overlay with `Connection interrupted while trying to subscribe`. We construct connectors manually with `connectorsForWallets` ([`web/src/lib/wagmi.ts`](./web/src/lib/wagmi.ts)) so MetaMask / Coinbase / Injected work cleanly and WC is opt-in.
- **i18n is custom, not a library.** Two languages, four pages, no URL routing needed. ~80 lines beats pulling in `next-intl` for the scope. ([`web/src/lib/i18n.ts`](./web/src/lib/i18n.ts))
- **Decrypt is scheduled with `setTimeout`, not gated on a per-second ticker.** A naive `useEffect` with `now` in deps cancels the in-flight decrypt promise every tick. ([`web/src/app/capsule/[entityKey]/page.tsx`](./web/src/app/capsule/%5BentityKey%5D/page.tsx))
- **Decrypted plaintext is read via `TextDecoder`, not `Buffer.from(uint8array).toString("utf-8")`.** The browser's `Buffer` shim can silently return an empty string. TextDecoder is browser-native and deterministic. ([`web/src/lib/tlock.ts`](./web/src/lib/tlock.ts))

## Roadmap

Shipped in this build (live on Braga today):

- ✅ Capsule entity + drand timelock encryption + public reveal entity
- ✅ Vault entity + Shamir M-of-N + heartbeat via `extendEntity`
- ✅ Action entity + Vercel cron polling hourly + Resend email layer
  (works in `[simulated]` mode without API key, runs end-to-end on Braga)
- ✅ E2E smoke test verified on Braga with 6 tx hashes

Q2 2026 (next sprint):

- ⏳ **UI for multi-trigger Action authoring** — currently the `Action` entity
  exists and the cron fires it, but the `/inheritance/new` form only writes
  Shamir-recovery actions. Tabs for email / transfer / doc-drop are designed
  (see `TriggerTypes` component) but not yet wired to `createAction`.
- ⏳ **Wallet transfer trigger** — fire an `eth_sendTransaction` from a
  service-wallet escrow when the action's `trigger_at` lapses. Requires an
  ownership-transfer pattern on the Action entity at create time.
- ⏳ **Document drop trigger** — upload to IPFS at vault-creation time, store
  CID in the action payload, release link on expiry.
- ⏳ **Per-share ECIES encryption** — currently Shamir shares sit in Arkiv as
  public payloads, threshold-secure via Shamir alone. v2 encrypts each share
  against the validator's recovered pubkey so reading a share requires the
  validator's signature.

Tiers (`§02D` on the home) shown as roadmap commitments, not shipped today:

- **Starter** — free, self-served, 1 vault. (Today.)
- **Pro** — multi-trigger, multi-recipient. (Today, gated post-mainnet.)
- **Family** — legal templates + notary partner + insurance overlay.
- **Enterprise** — REST API, multisig integrations, white-label.

## License

MIT.

---

Built for the **Arkiv × ETHNS Builder Challenge**, Privacy track.
