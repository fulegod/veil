/**
 * Genera una wallet nueva y la guarda en .env si no existe.
 * Imprime la address para que el usuario vaya al faucet de Braga.
 */
import "dotenv/config";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  generatePrivateKey,
  privateKeyToAccount,
} from "@arkiv-network/sdk/accounts";

const ENV_PATH = fileURLToPath(new URL("../.env", import.meta.url));

function loadOrCreatePk(): `0x${string}` {
  const existing = process.env.PRIVATE_KEY?.trim();
  if (existing && existing.startsWith("0x") && existing.length === 66) {
    return existing as `0x${string}`;
  }

  console.log("🔑 No PRIVATE_KEY en .env. Generando una nueva...");
  const pk = generatePrivateKey();
  const newContent = `PRIVATE_KEY=${pk}\n`;

  if (existsSync(ENV_PATH)) {
    const current = readFileSync(ENV_PATH, "utf-8");
    if (current.includes("PRIVATE_KEY=")) {
      writeFileSync(
        ENV_PATH,
        current.replace(/PRIVATE_KEY=.*\n?/g, newContent),
      );
    } else {
      writeFileSync(ENV_PATH, current + newContent);
    }
  } else {
    writeFileSync(ENV_PATH, newContent);
  }
  console.log("✅ Guardada en smoke/.env");
  return pk;
}

const pk = loadOrCreatePk();
const account = privateKeyToAccount(pk);

console.log("");
console.log("═══════════════════════════════════════════════════════");
console.log(`📬 Address: ${account.address}`);
console.log("═══════════════════════════════════════════════════════");
console.log("");
console.log("👉 Pasos:");
console.log("   1. Copia la address de arriba");
console.log("   2. Ve a https://braga.hoodi.arkiv.network/faucet/");
console.log("   3. Pega la address y pide fondos");
console.log("   4. Espera ~30 segundos");
console.log("   5. Corre: bun run arkiv");
console.log("");
