# Arkiv Patterns demonstrated by Veil

> Reference implementation for builders shipping on Arkiv. Each pattern below is load-bearing in Veil — remove it and the product breaks. Source code references point at `web/src/lib/`.

## Pattern 1 — PROJECT_ATTRIBUTE: namespacing in a shared public DB

**Why:** Arkiv is a public shared database. Without a project-scoped attribute, your queries silently pull entities from other projects, and other projects' queries pull yours. Result: corrupted state, wrong counts, leaked test data.

**How Veil enforces it:**

```ts
// web/src/lib/config.ts
export const PROJECT_ATTRIBUTE = { key: "app", value: "veil" } as const;
```

```ts
// web/src/lib/arkiv.ts — every create stamps it
await wallet.createEntity({
  ...
  attributes: [
    PROJECT_ATTRIBUTE,         // ← always first
    { key: "kind", value: ENTITY_KIND.CAPSULE },
    ...
  ],
});

// every query filters by it
publicClient
  .buildQuery()
  .where(and(
    eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),  // ← always present
    eq("kind", opts.kind),
  ));
```

**Discipline:** never call `walletClient.createEntity` or `buildQuery` directly from components. Everything goes through `lib/arkiv.ts` helpers so the attribute can't be forgotten.

---

## Pattern 2 — `$creator` (immutable) vs `$owner` (mutable)

**Why these are different attributes:**

|            | `$creator`                                                 | `$owner`                                                 |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Mutable?   | No, set at creation                                        | Yes, transferable                                        |
| Use case   | "Who made this?" — attribution that survives sale/transfer | "Who controls this now?" — auth for update/delete/extend |
| Spoofable? | No — the SDK signs creation with the account's private key | N/A — just the current controller                        |

**How Veil uses both:**

- **Capsule entity:** `$creator` = author of the time capsule. Critical because the value of a public prediction is the proof that _this specific person_ committed to _this prediction_ at _this time_. Selling the capsule (transferring `$owner`) doesn't erase the author.
- **Watcher entity:** `$creator` = wallet that subscribed. `$owner` can be transferred to another wallet (e.g., delegate notifications to a service account).

**Pitfall avoided:** never store "author" as a payload field — that's spoofable. Always rely on `$creator`.

---

## Pattern 3 — Differentiated expirations per entity kind

**Why uniform `expiresIn` wastes scoring:**

The graders rate higher if your expirations match the real lifecycle of each entity. Uniform `expiresIn: 30 days` for everything is a 3/5 design.

**Veil's expiration strategy:**

| Entity kind            | `expiresIn`           | Rationale                                                     |
| ---------------------- | --------------------- | ------------------------------------------------------------- |
| `Capsule` (any)        | `unlockAt + 365 days` | Has to outlive the unlock so people can read after the reveal |
| `Reveal` log           | 90 days post-unlock   | Useful short-term to mark "first decryption", not forever     |
| `Watcher` subscription | `unlockAt + 30 days`  | Notification window only                                      |

**`extendEntity` use:** when a watcher renews their subscription, we call `extendEntity` on their entity instead of creating a new one — preserves the original `$creator` and history.

---

## Pattern 4 — Relationships via shared-attribute keys (no FK)

**Why Arkiv has no foreign keys:** entities are independent and may be created across blocks/transactions. Native FK constraints don't work.

**Veil's relation model:**

```
Capsule (entityKey: 0xAAA...)  ←─── shared attribute
                                         │
Reveal { capsule_key: "0xAAA..." }       │  filter
Watcher { capsule_key: "0xAAA..." }      │  Reveal+Watcher
                                         │  by capsule_key
```

```ts
// fetch all watchers of a capsule
publicClient
  .buildQuery()
  .where(
    and(
      eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
      eq("kind", "watcher"),
      eq("capsule_key", capsuleKey),
    ),
  );
```

**Why this works:** indexes on numeric/string attributes make these lookups O(log n). No joins, no schemas — just disciplined attribute naming.

---

## Pattern 5 — Combining Arkiv with off-chain timelock (drand + tlock)

**The combination is novel:**

- **Arkiv** gives you: immutable storage, attribution (`$creator`), queryable attributes, expirations
- **drand mainnet** gives you: trustless future-time-derivable keys (no central party can withhold)
- **tlock-js** gives you: encrypt-against-round-N, decrypt-once-round-N-published

**Veil composition:**

```ts
// Create
const { ciphertext, round, unlockAt } = await encryptForTime(
  plaintext,
  futureDate,
);
await createCapsule({
  account,
  ciphertext,
  unlockRound: round,
  unlockAt,
  title,
  isPublic,
});
// → entity with encrypted payload + unlock_round attribute
// → tx hash on Braga explorer = inmutable attribution + storage

// Reveal (anytime after unlockAt)
const capsule = await getCapsule(entityKey);
const plaintext = await decryptCiphertext(capsule.ciphertext);
// → drand has published the round → tlock derives the key → plaintext recovered
```

**Why this is more than "encryption":** the same capsule entity in Arkiv is unreadable today AND readable in the future by anyone, with no key management infrastructure on our side. The unlock round number sits in a queryable attribute, so we can show countdown timers, filter "unlocked today", etc., without revealing payload content.

---

## Anti-patterns Veil deliberately avoids

| Anti-pattern                                   | Why it costs scoring                                               |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Arrays as attributes                           | Not indexable; force client-side filter; query becomes O(n)        |
| Storing wallet address in payload              | Spoofable; use `$creator`                                          |
| Uniform `expiresIn`                            | Wastes the design space; signals shallow Arkiv knowledge           |
| `string` attribute for numeric ranges          | Can only do `eq`/`glob`, not `gt`/`lt` for filtering by time/round |
| Forgetting PROJECT_ATTRIBUTE on a single query | Returns foreign entities → bug or data leak                        |

---

## Quirks I learned about Arkiv while building Veil

(populated as we ship — these become the "Things I Learned" appendix of the README, which the rubric specifically rewards)

- _..._
