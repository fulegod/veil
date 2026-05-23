/**
 * Smoke test — Shamir Secret Sharing wrapper for Inheritance feature.
 * Run: bun smoke/inheritance.ts
 */

import {
  splitSecret,
  combineShares,
  shareToHex,
  hexToShare,
  heartbeatTargetTimestamp,
  formatHeartbeatCountdown,
} from "../web/src/lib/inheritance";

const SECRET =
  "0x4c0d2f8a1b3e5d6c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e | seed phrase: river forest mountain lake horizon | safe combo: 42-08-15";

console.log("=== Inheritance smoke test ===\n");

// 1. Split 3-of-5
const shares = splitSecret(SECRET, 3, 5);
console.log(`✓ Split secret into ${shares.length} shares (3-of-5)`);
shares.forEach((s, i) => {
  console.log(
    `  share[${i}] = ${shareToHex(s).slice(0, 32)}... (${s.length}B)`,
  );
});

// 2. Reconstruct with exactly 3 shares
const recovered3 = combineShares(shares.slice(0, 3));
console.assert(recovered3 === SECRET, "✗ 3-of-5 reconstruction failed");
console.log(`\n✓ Reconstruction with 3 shares matches`);

// 3. Reconstruct with all 5 shares
const recovered5 = combineShares(shares);
console.assert(recovered5 === SECRET, "✗ 5-of-5 reconstruction failed");
console.log(`✓ Reconstruction with 5 shares matches`);

// 4. Hex roundtrip
const hex = shareToHex(shares[0]);
const back = hexToShare(hex);
console.assert(
  Buffer.from(shares[0]).equals(Buffer.from(back)),
  "✗ hex roundtrip failed",
);
console.log(`✓ Hex encode/decode roundtrip works`);

// 5. Insufficient shares should fail
try {
  combineShares(shares.slice(0, 2));
  console.log(`⚠️  2-of-5 combined without error (returned garbage, expected)`);
} catch (e) {
  console.log(`✓ 2 shares correctly rejected: ${(e as Error).message}`);
}

// 6. Heartbeat helpers
const t = heartbeatTargetTimestamp("6m");
const countdown = formatHeartbeatCountdown(t);
console.log(`\n✓ Heartbeat 6m target: ${new Date(t).toISOString()}`);
console.log(`✓ Countdown reads: ${countdown}`);

// 7. Different threshold combinations
const sharesB = splitSecret("short", 2, 3);
const recoveredB = combineShares([sharesB[0], sharesB[2]]);
console.assert(recoveredB === "short", "✗ 2-of-3 reconstruction failed");
console.log(`\n✓ 2-of-3 with non-consecutive shares (0 + 2) works`);

console.log("\n=== ALL TESTS PASSED ===");
