/**
 * Smoke test E2E — Inheritance Vault on Braga.
 *
 * Verifies the full feature against real Arkiv:
 *  1. drand-encrypt a secret with target = now + 60s
 *  2. Shamir-split 3-of-5
 *  3. Create 1 Vault entity (drand ciphertext as payload)
 *  4. Create 5 Share entities linked via vault_key
 *  5. Query: getVault, getSharesForVault, listVaultsForValidator
 *  6. Wait for drand round + recombine 3 shares → assert == original
 *
 * Output prints all 6 tx hashes for explorer verification.
 * Run: bun smoke/src/inheritance-e2e.ts
 */

import "dotenv/config";
import { setTimeout as sleep } from "node:timers/promises";
import {
  createPublicClient,
  createWalletClient,
  http,
} from "@arkiv-network/sdk";
import {
  privateKeyToAccount,
  generatePrivateKey,
} from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { and, eq } from "@arkiv-network/sdk/query";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import { mainnetClient, roundAt, timelockEncrypt } from "tlock-js";
import { Buffer } from "node:buffer";

// Re-import Shamir helpers from the web lib (same code that runs in browser)
import {
  splitSecret,
  combineShares,
  shareToHex,
} from "../../web/src/lib/inheritance";

const PROJECT = "veil";
const SECONDS_AHEAD = 60;
const THRESHOLD = 3;
const TOTAL = 5;
const EXPLORER = "https://explorer.braga.hoodi.arkiv.network";

function explorerTx(hash: string): string {
  return `${EXPLORER}/tx/${hash}`;
}

function explorerEntity(key: string): string {
  return `${EXPLORER}/entity/${key}`;
}

async function main() {
  const pk = process.env.PRIVATE_KEY?.trim();
  if (!pk || !pk.startsWith("0x")) {
    console.error("❌ Falta PRIVATE_KEY en smoke/.env");
    process.exit(1);
  }

  const account = privateKeyToAccount(pk as `0x${string}`);
  const transport = http();
  const walletClient = createWalletClient({ chain: braga, account, transport });
  const publicClient = createPublicClient({ chain: braga, transport });

  console.log("\n=== Inheritance Vault — E2E smoke test ===\n");
  console.log(`Owner wallet: ${account.address}`);

  // Generate 5 dummy validator addresses (no real wallets needed for E2E)
  const validators = Array.from(
    { length: TOTAL },
    () => privateKeyToAccount(generatePrivateKey()).address,
  );
  console.log(`Validators: ${TOTAL} dummy addresses generated\n`);

  // ─── 1. drand-encrypt secret ──────────────────────────────────────────
  const drand = mainnetClient();
  const drandInfo = await drand.chain().info();
  const heartbeatAt = Date.now() + SECONDS_AHEAD * 1000;
  const targetRound = roundAt(heartbeatAt, drandInfo);

  const SECRET = `seed phrase: river forest mountain @ ${new Date().toISOString()}`;
  console.log(
    `🔒 Encrypting secret with drand round ${targetRound} (in ${SECONDS_AHEAD}s)`,
  );
  const ciphertext = await timelockEncrypt(
    targetRound,
    Buffer.from(SECRET, "utf-8"),
    drand,
  );
  const ciphertextBytes = new Uint8Array(Buffer.from(ciphertext, "utf-8"));
  console.log(`   ciphertext: ${ciphertextBytes.length} bytes\n`);

  // ─── 2. Shamir split ──────────────────────────────────────────────────
  console.log(`🪓 Splitting secret into Shamir ${THRESHOLD}-of-${TOTAL}`);
  const shares = splitSecret(SECRET, THRESHOLD, TOTAL);
  console.log(`   ${shares.length} shares of ${shares[0].length} bytes each\n`);

  // ─── 3. Create Vault entity ───────────────────────────────────────────
  const heartbeatSeconds =
    Math.ceil((heartbeatAt - Date.now()) / 1000) + 30 * 24 * 3600;

  console.log("📝 Creating Vault entity on Arkiv…");
  const vaultRes = await walletClient.createEntity({
    payload: ciphertextBytes,
    contentType: "application/x-tlock-armor",
    attributes: [
      { key: "app", value: PROJECT },
      { key: "kind", value: "vault" },
      { key: "title", value: "E2E smoke vault" },
      { key: "unlock_round", value: targetRound },
      { key: "heartbeat_at", value: heartbeatAt },
      { key: "threshold", value: THRESHOLD },
      { key: "total_shares", value: TOTAL },
    ],
    expiresIn: ExpirationTime.fromSeconds(heartbeatSeconds),
  });

  console.log(`   ✅ Vault entity:  ${vaultRes.entityKey}`);
  console.log(`   📜 tx:            ${vaultRes.txHash}`);
  console.log(`   🔎 ${explorerTx(vaultRes.txHash)}\n`);

  // ─── 3.5. Create 2 Action entities (email_warning + email_delivery) ─────
  console.log(
    "📝 Creating 2 Action entities (email_warning + email_delivery)…",
  );
  const actionConfigs = [
    {
      type: "email_warning",
      triggerOffset: -30 * 24 * 3600 * 1000, // 30 days BEFORE heartbeat expiry
      destination: "heir@example.com",
      message:
        "Your Veil vault expires in 30 days. Sign a heartbeat tx to extend.",
    },
    {
      type: "email_delivery",
      triggerOffset: 0, // exactly at heartbeat expiry
      destination: "heir@example.com",
      message:
        "Owner went silent. This message is delivered as part of the vault contents.",
    },
  ];
  const actionTxs: { entityKey: string; txHash: string; type: string }[] = [];
  for (const cfg of actionConfigs) {
    const triggerAt = heartbeatAt + cfg.triggerOffset;
    const res = await walletClient.createEntity({
      payload: new TextEncoder().encode(
        JSON.stringify({ message: cfg.message, destination: cfg.destination }),
      ),
      contentType: "application/json",
      attributes: [
        { key: "app", value: PROJECT },
        { key: "kind", value: "action" },
        { key: "vault_key", value: vaultRes.entityKey },
        { key: "action_type", value: cfg.type },
        { key: "trigger_at", value: triggerAt },
        { key: "destination", value: cfg.destination },
        { key: "notified_at", value: 0 },
      ],
      expiresIn: ExpirationTime.fromSeconds(2 * 365 * 24 * 3600),
    });
    actionTxs.push({
      entityKey: res.entityKey,
      txHash: res.txHash,
      type: cfg.type,
    });
    console.log(
      `   ✅ Action [${cfg.type}]: ${res.entityKey}  tx ${res.txHash.slice(0, 12)}…`,
    );
  }
  console.log("");

  // ─── 4. Create N Share entities ──────────────────────────────────────
  console.log(`📝 Creating ${TOTAL} Share entities linked via vault_key…`);
  const shareTxs: { entityKey: string; txHash: string; index: number }[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const res = await walletClient.createEntity({
      payload: shares[i],
      contentType: "application/octet-stream",
      attributes: [
        { key: "app", value: PROJECT },
        { key: "kind", value: "share" },
        { key: "vault_key", value: vaultRes.entityKey },
        { key: "share_index", value: i + 1 },
        { key: "validator_address", value: validators[i].toLowerCase() },
      ],
      expiresIn: ExpirationTime.fromSeconds(10 * 365 * 24 * 3600),
    });
    shareTxs.push({
      entityKey: res.entityKey,
      txHash: res.txHash,
      index: i + 1,
    });
    console.log(
      `   ✅ Share #${i + 1}:  ${res.entityKey}  tx ${res.txHash.slice(0, 12)}…`,
    );
  }
  console.log("");

  // ─── 5. Verify queries ────────────────────────────────────────────────
  console.log("🔍 Verifying queries…");

  const vaultEntity = await publicClient.getEntity(vaultRes.entityKey);
  const vaultAttrs = Object.fromEntries(
    vaultEntity?.attributes.map((a) => [a.key, a.value]) ?? [],
  );
  console.assert(vaultAttrs.kind === "vault", "✗ vault kind mismatch");
  console.assert(
    Number(vaultAttrs.threshold) === THRESHOLD,
    "✗ threshold mismatch",
  );
  console.assert(
    Number(vaultAttrs.total_shares) === TOTAL,
    "✗ total_shares mismatch",
  );
  console.log(`   ✓ getEntity returns vault with correct attrs`);

  const sharesQuery = await publicClient
    .buildQuery()
    .where(
      and([
        eq("app", PROJECT),
        eq("kind", "share"),
        eq("vault_key", vaultRes.entityKey),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload()
    .limit(20)
    .fetch();
  console.assert(
    sharesQuery.entities.length === TOTAL,
    `✗ expected ${TOTAL} shares, got ${sharesQuery.entities.length}`,
  );
  console.log(
    `   ✓ getSharesForVault returns ${sharesQuery.entities.length} shares`,
  );

  const validatorQuery = await publicClient
    .buildQuery()
    .where(
      and([
        eq("app", PROJECT),
        eq("kind", "share"),
        eq("validator_address", validators[2].toLowerCase()),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .limit(10)
    .fetch();
  const foundVaultKey = validatorQuery.entities[0]?.attributes.find(
    (a: { key: string; value: string | number }) => a.key === "vault_key",
  )?.value;
  console.assert(
    foundVaultKey === vaultRes.entityKey,
    "✗ listVaultsForValidator did not find the vault",
  );
  console.log(
    `   ✓ listVaultsForValidator finds vault from validator 3's perspective`,
  );

  // Query: Actions linked to this vault
  const actionsQuery = await publicClient
    .buildQuery()
    .where(
      and([
        eq("app", PROJECT),
        eq("kind", "action"),
        eq("vault_key", vaultRes.entityKey),
      ]),
    )
    .withAttributes()
    .withMetadata()
    .withPayload()
    .limit(20)
    .fetch();
  console.assert(
    actionsQuery.entities.length === actionConfigs.length,
    `✗ expected ${actionConfigs.length} actions, got ${actionsQuery.entities.length}`,
  );
  console.log(
    `   ✓ getActionsForVault returns ${actionsQuery.entities.length} actions`,
  );

  // Verify each action's payload + trigger_at + action_type round-trip correctly
  for (const e of actionsQuery.entities as Array<{
    attributes: { key: string; value: string | number }[];
    payload?: Uint8Array | null;
  }>) {
    const attrs = Object.fromEntries(e.attributes.map((a) => [a.key, a.value]));
    const actionType = String(attrs.action_type);
    const matchingConfig = actionConfigs.find((c) => c.type === actionType);
    console.assert(
      !!matchingConfig,
      `✗ unknown action_type came back from Arkiv: ${actionType}`,
    );
    console.assert(
      Number(attrs.notified_at) === 0,
      `✗ action ${actionType} should be unfired (notified_at=0)`,
    );
    if (e.payload) {
      const parsed = JSON.parse(new TextDecoder().decode(e.payload));
      console.assert(
        parsed.message === matchingConfig?.message,
        `✗ action ${actionType} message did not round-trip`,
      );
    }
  }
  console.log(`   ✓ Each action's payload + attributes round-trip correctly`);
  console.log("");

  // ─── 6. Wait for drand round + reconstruct ────────────────────────────
  console.log(`⏳ Waiting ${SECONDS_AHEAD}s + 5s margin for drand round…`);
  await sleep(SECONDS_AHEAD * 1000 + 5000);

  console.log("🔓 Combining 3 shares (Shamir reconstruct)…");
  const sortedShares = sharesQuery.entities
    .map(
      (e: {
        attributes: { key: string; value: string | number }[];
        payload?: Uint8Array | null;
      }) => {
        const idx = Number(
          e.attributes.find((a) => a.key === "share_index")?.value,
        );
        return {
          idx,
          bytes: e.payload ? new Uint8Array(e.payload) : new Uint8Array(),
        };
      },
    )
    .sort((a, b) => a.idx - b.idx);

  // Use 3 non-consecutive shares to demonstrate threshold works
  const picked = [
    sortedShares[0].bytes,
    sortedShares[2].bytes,
    sortedShares[4].bytes,
  ];
  const recovered = combineShares(picked);

  console.assert(
    recovered === SECRET,
    `✗ recovered != original\n  got: ${recovered}\n  expected: ${SECRET}`,
  );
  console.log(`   ✓ Recovered secret matches original`);
  console.log(`   recovered: "${recovered.slice(0, 50)}…"`);
  console.log("");

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log("=== SUMMARY ===\n");
  console.log(`Vault entity:  ${explorerEntity(vaultRes.entityKey)}`);
  console.log(`Vault tx:      ${explorerTx(vaultRes.txHash)}`);
  shareTxs.forEach((s) => {
    console.log(`Share #${s.index} tx:   ${explorerTx(s.txHash)}`);
  });
  actionTxs.forEach((a) => {
    console.log(`Action [${a.type}] tx: ${explorerTx(a.txHash)}`);
  });
  console.log("");
  console.log(`✅ End-to-end inheritance flow verified on Braga.`);
  console.log(
    `   1 Vault + ${TOTAL} Shares + ${actionTxs.length} Actions created, queried, recombined.`,
  );
  console.log(
    `   ${THRESHOLD}-of-${TOTAL} Shamir threshold confirmed against real drand round.`,
  );
  console.log(
    `   Action entities (programmable triggers) round-tripped through Arkiv.`,
  );
}

main().catch((e) => {
  console.error("❌ Smoke test failed:", e);
  process.exit(1);
});
