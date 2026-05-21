/**
 * Smoke test de tlock-js + drand.
 * Encripta un mensaje contra un round drand ~60s en el futuro, espera, descifra.
 */
import "dotenv/config";
import { Buffer } from "node:buffer";
import { setTimeout as sleep } from "node:timers/promises";
import {
  timelockEncrypt,
  timelockDecrypt,
  mainnetClient,
  roundAt,
} from "tlock-js";

const SECONDS_AHEAD = 60;

async function main() {
  const client = mainnetClient();
  const info = await client.chain().info();
  console.log(`🌐 drand network: mainnet (RFC)`);
  console.log(`   chainHash: ${info.hash}`);
  console.log(`   period:    ${info.period}s`);
  console.log(
    `   genesis:   ${new Date(info.genesis_time * 1000).toISOString()}`,
  );
  console.log("");

  const unlockAt = Date.now() + SECONDS_AHEAD * 1000;
  const targetRound = roundAt(unlockAt, info);
  console.log(`⏱  Unlock target:`);
  console.log(
    `   at:    ${new Date(unlockAt).toISOString()} (+${SECONDS_AHEAD}s)`,
  );
  console.log(`   round: ${targetRound}`);
  console.log("");

  const plaintext = `veil smoke at ${new Date().toISOString()}`;
  console.log(`🔒 Encrypting:`);
  console.log(`   plain: "${plaintext}"`);
  const ciphertext = await timelockEncrypt(
    targetRound,
    Buffer.from(plaintext, "utf-8"),
    client,
  );
  console.log(`   ciphertext length: ${ciphertext.length} chars`);
  console.log("");

  console.log(`⏳ Waiting for round ${targetRound} (~${SECONDS_AHEAD}s)...`);
  await sleep(SECONDS_AHEAD * 1000 + 5000);
  console.log("");

  console.log(`🔓 Decrypting...`);
  const decrypted = await timelockDecrypt(ciphertext, client);
  const recovered = decrypted.toString("utf-8");
  console.log(`   recovered: "${recovered}"`);
  console.log("");

  if (recovered !== plaintext) {
    throw new Error(`Mismatch! expected "${plaintext}" got "${recovered}"`);
  }
  console.log("🎉 SMOKE TLOCK PASSED");
}

main().catch((err) => {
  console.error("");
  console.error("❌ SMOKE TLOCK FAILED");
  console.error(err);
  process.exit(1);
});
