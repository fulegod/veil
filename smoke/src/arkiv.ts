/**
 * Smoke test del SDK Arkiv contra Braga testnet.
 * Crea, lee, query y borra una entity con PROJECT_ATTRIBUTE.
 */
import "dotenv/config";
import {
  createPublicClient,
  createWalletClient,
  http,
  toBytes,
} from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";
import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk/utils";

const PROJECT = "veil-smoke";

const pk = process.env.PRIVATE_KEY?.trim();
if (!pk || !pk.startsWith("0x")) {
  console.error("❌ Falta PRIVATE_KEY en .env. Corre: bun run wallet");
  process.exit(1);
}
const account = privateKeyToAccount(pk as `0x${string}`);

console.log(`🔑 Account: ${account.address}`);
console.log(`🌐 Chain:   ${braga.name} (id ${braga.id})`);
console.log(`🔗 RPC:     ${braga.rpcUrls.default.http[0]}`);
console.log("");

const transport = http();
const walletClient = createWalletClient({ chain: braga, account, transport });
const publicClient = createPublicClient({ chain: braga, transport });

async function main() {
  console.log("📝 Creating entity...");
  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload({ message: "veil smoke test", at: Date.now() }),
    contentType: "application/json",
    attributes: [
      { key: "app", value: PROJECT },
      { key: "kind", value: "smoke" },
    ],
    expiresIn: ExpirationTime.fromMinutes(30),
  });
  console.log(`   ✅ entityKey: ${entityKey}`);
  console.log(`   📜 tx:        ${txHash}`);
  console.log(
    `   🔎 explorer:  https://explorer.braga.hoodi.arkiv.network/tx/${txHash}`,
  );
  console.log("");

  console.log("📖 Reading entity...");
  const entity = await publicClient.getEntity(entityKey);
  if (!entity) throw new Error("Entity not found");
  const payload = Buffer.from(entity.payload ?? toBytes("")).toString("utf-8");
  console.log(`   payload:    ${payload}`);
  console.log(`   attributes: ${JSON.stringify(entity.attributes)}`);
  console.log(`   expiresAt:  block ${entity.expiresAtBlock}`);
  console.log("");

  console.log("🔎 Querying by app...");
  const queryResult = await publicClient
    .buildQuery()
    .where(eq("app", PROJECT))
    .limit(5)
    .fetch();
  console.log(`   found: ${queryResult.entities.length} entities`);
  console.log("");

  console.log("🗑️  Deleting entity...");
  const { txHash: deleteTx } = await walletClient.deleteEntity({ entityKey });
  console.log(`   ✅ deleted tx: ${deleteTx}`);
  console.log("");

  console.log("🎉 SMOKE ARKIV PASSED");
}

main().catch((err) => {
  console.error("");
  console.error("❌ SMOKE ARKIV FAILED");
  console.error(err);
  process.exit(1);
});
