# Veil

**Trustless time capsules for the on-chain era.**
Seal your alpha today. Cryptographic proof you called it first.

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

Veil lets you **seal a message today** that nobody — not Veil, not Arkiv, not the network — can read until the date you choose. At that moment the message becomes readable to anyone with the link. The author and the original timestamp are anchored on-chain and cannot be edited.

This is not "another encryption demo". It is the smallest correct primitive for **commitment-without-disclosure**: I commit publicly to a statement; I prove its content later; in between, nobody can peek and nobody can stop the reveal.

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
│   │   │   └── capsules/page.tsx ← public feed
│   │   ├── lib/
│   │   │   ├── arkiv.ts          ← typed wrappers, PROJECT_ATTRIBUTE enforced
│   │   │   ├── tlock.ts          ← encrypt / decrypt / drand client
│   │   │   ├── wagmi.ts          ← chains + connectors
│   │   │   ├── config.ts         ← PROJECT_ATTRIBUTE + entity kinds + explorer URLs
│   │   │   └── i18n.ts           ← typed EN/ES dictionary
│   │   ├── components/           ← Header, LanguageToggle, VeilAvatar, …
│   │   └── hooks/useArkivClients.ts ← wagmi → Arkiv wallet client bridge
│   └── public/error-silencer.js  ← runs beforeInteractive
├── smoke/                         ← standalone validation scripts (Bun)
│   └── src/{wallet,arkiv,tlock,combined}.ts
├── CLAUDE.md                      ← AI builder rules for this project
├── PATTERNS.md                    ← Arkiv patterns this build demonstrates
└── SKILLS.md                      ← index of skills loaded
```

## Arkiv patterns this project demonstrates

The full write-up with code snippets is in [`PATTERNS.md`](./PATTERNS.md). Briefly:

| #   | Pattern                                                                                                 | Where in code                                    |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | **`PROJECT_ATTRIBUTE` on every create AND every query** — non-negotiable on a shared public DB          | `lib/config.ts` + every helper in `lib/arkiv.ts` |
| 2   | **`$creator` (immutable) vs `$owner` (mutable)** — used distinctly so capsule sale doesn't erase author | `Capsule.$creator` ≠ `Reveal.$creator`           |
| 3   | **Differentiated `expiresIn` per entity kind** — Capsule lives 1y post-unlock, Reveal 90d               | `lib/arkiv.ts` `createCapsule` / `publishReveal` |
| 4   | **Relationships via shared-attribute keys** — `Reveal.capsule_key → Capsule.entityKey`, no foreign keys | `findFirstRevealForCapsule()`                    |
| 5   | **Timelock encryption on top of Arkiv** — drand round number stored as queryable numeric attribute      | `lib/tlock.ts` + `Capsule.unlock_round`          |

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

## License

MIT.

---

Built for the **Arkiv × ETHNS Builder Challenge**, Privacy track.
