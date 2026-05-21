/**
 * Smoke test combinado: Arkiv + tlock.
 * 1) Encripta un payload con tlock contra +60s
 * 2) Guarda la entity Capsule en Arkiv (Braga)
 * 3) Espera el round drand
 * 4) Lee la entity y la descifra
 */
import "dotenv/config";
import { Buffer } from "node:buffer";
import { setTimeout as sleep } from "node:timers/promises";
import {
  createPublicClient,
  createWalletClient,
  http,
} from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import {
  timelockEncrypt,
  timelockDecrypt,
  mainnetClient,
  roundAt,
} from "tlock-js";

const PROJECT = "veil-smoke";
const SECONDS_AHEAD = 60;

const pk = process.env.PRIVATE_KEY?.trim();
if (!pk || !pk.startsWith("0x")) {
  console.error("❌ Falta PRIVATE_KEY en .env. Corre: bun run wallet");
  process.exit(1);
}
const account = privateKeyToAccount(pk as `0x${string}`);

const transport = http();
const walletClient = createWalletClient({ chain: braga, account, transport });
const publicClient = createPublicClient({ chain: braga, transport });

async function main() {
  const drand = mainnetClient();
  const drandInfo = await drand.chain().info();
  const unlockAt = Date.now() + SECONDS_AHEAD * 1000;
  const targetRound = roundAt(unlockAt, drandInfo);

  const secret = `veil capsule secret @ ${new Date().toISOString()}`;
  console.log(`🔒 Encrypting "${secret}" against drand round ${targetRound}`);
  const ciphertext = await timelockEncrypt(
    targetRound,
    Buffer.from(secret, "utf-8"),
    drand,
  );
  console.log(`   ciphertext length: ${ciphertext.length} chars`);

  console.log("📝 Storing encrypted Capsule entity in Arkiv...");
  const { entityKey, txHash } = await walletClient.createEntity({
    payload: Buffer.from(ciphertext, "utf-8"),
    contentType: "application/x-tlock-armor",
    attributes: [
      { key: "app", value: PROJECT },
      { key: "kind", value: "capsule" },
      { key: "unlock_round", value: targetRound },
      { key: "unlock_at", value: unlockAt },
    ],
    expiresIn: ExpirationTime.fromMinutes(30),
  });
  console.log(`   ✅ entityKey: ${entityKey}`);
  console.log(`   📜 tx:        ${txHash}`);
  console.log(
    `   🔎 explorer:  https://explorer.braga.hoodi.arkiv.network/tx/${txHash}`,
  );
  console.log("");

  console.log(`⏳ Waiting ${SECONDS_AHEAD}s + 5s margin for drand round...`);
  await sleep(SECONDS_AHEAD * 1000 + 5000);

  console.log("📖 Fetching ciphertext from Arkiv...");
  const entity = await publicClient.getEntity(entityKey);
  if (!entity?.payload) throw new Error("Entity has no payload");
  const ctString = Buffer.from(entity.payload).toString("utf-8");

  console.log("🔓 Decrypting with drand round now available...");
  const recovered = (await timelockDecrypt(ctString, drand)).toString("utf-8");
  console.log(`   recovered: "${recovered}"`);

  if (recovered !== secret) {
    throw new Error(`Mismatch! expected "${secret}" got "${recovered}"`);
  }

  console.log("");
  console.log("🎉 SMOKE COMBINED PASSED — Arkiv + tlock funcionan juntos");
  console.log("🚀 Listo para construir Veil");
}

main().catch((err) => {
  console.error("");
  console.error("❌ SMOKE COMBINED FAILED");
  console.error(err);
  process.exit(1);
});
