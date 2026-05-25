/**
 * Email layer — Resend wrapper with safe console.log fallback.
 *
 * If RESEND_API_KEY is missing (e.g. local dev, or judge running the repo
 * without their own Resend account), the functions log what they WOULD send
 * to stdout instead of failing. This lets the cron job run end-to-end on
 * Arkiv even without an email provider configured.
 *
 * In production, set RESEND_API_KEY in Vercel project env vars and the
 * Resend SDK takes over automatically.
 *
 * Free tier: resend.com gives 3000 emails/month + 100/day. From address
 * `onboarding@resend.dev` works out of the box without DNS verification.
 */

import { Resend } from "resend";

const FROM = "Veil <onboarding@resend.dev>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Send a pre-expiry warning to the vault owner (or any address they configured).
 * Subject: "[Veil] Your vault expires in {days} days"
 */
export async function sendVaultWarning(opts: {
  to: string;
  vaultTitle: string;
  daysRemaining: number;
  vaultUrl: string;
}): Promise<SendResult> {
  const subject = `[Veil] Your vault "${opts.vaultTitle}" expires in ${opts.daysRemaining} days`;
  const text = [
    `Your Veil vault "${opts.vaultTitle}" expires in ${opts.daysRemaining} days.`,
    ``,
    `If you stop signing before then, the actions you scheduled will fire —`,
    `secrets delivered, transfers executed, documents released.`,
    ``,
    `Sign one heartbeat tx to push it back into the future:`,
    opts.vaultUrl,
    ``,
    `— Veil. Programmable trust.`,
  ].join("\n");

  const client = getClient();
  if (!client) {
    console.log(`[email:simulated] → ${opts.to} :: ${subject}\n${text}`);
    return { ok: true, simulated: true };
  }

  try {
    const result = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      text,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Deliver vault contents (the message + any payload data) to a recipient
 * after the heartbeat has lapsed. This is the post-life trigger fire.
 */
export async function sendVaultDelivery(opts: {
  to: string;
  vaultTitle: string;
  message: string;
  vaultUrl: string;
}): Promise<SendResult> {
  const subject = `[Veil] Delivery from "${opts.vaultTitle}"`;
  const text = [
    `You are receiving this because someone set up a Veil vault that named you`,
    `as a recipient if they ever stopped signing for proof-of-life.`,
    ``,
    `Their heartbeat has lapsed past the configured period.`,
    `Below is the message they sealed for you:`,
    ``,
    `─────────────────────────────────────────────`,
    opts.message,
    `─────────────────────────────────────────────`,
    ``,
    `Verify the vault on-chain (Arkiv Braga):`,
    opts.vaultUrl,
    ``,
    `— Veil. Programmable trust.`,
  ].join("\n");

  const client = getClient();
  if (!client) {
    console.log(`[email:simulated] → ${opts.to} :: ${subject}\n${text}`);
    return { ok: true, simulated: true };
  }

  try {
    const result = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      text,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Document drop — the heartbeat has lapsed and a file the owner sealed inside
 * a Capsule should now be released to the recipient. We email a link to the
 * Capsule view page; the recipient's browser does the drand decryption.
 */
export async function sendVaultDocDrop(opts: {
  to: string;
  vaultTitle: string;
  message: string;
  capsuleUrl: string;
}): Promise<SendResult> {
  const subject = `[Veil] Document released from "${opts.vaultTitle}"`;
  const text = [
    `You are receiving this because someone set up a Veil vault that named you`,
    `as the recipient of a sealed file if they ever stopped signing for`,
    `proof-of-life. Their heartbeat has now lapsed.`,
    ``,
    opts.message
      ? `Their note:\n${"─".repeat(45)}\n${opts.message}\n${"─".repeat(45)}\n`
      : ``,
    `Open the link below to view and download the file. Your browser will`,
    `decrypt it locally using the drand network — nothing leaks server-side.`,
    ``,
    opts.capsuleUrl,
    ``,
    `— Veil. Programmable trust.`,
  ].join("\n");

  const client = getClient();
  if (!client) {
    console.log(`[email:simulated] → ${opts.to} :: ${subject}\n${text}`);
    return { ok: true, simulated: true };
  }

  try {
    const result = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject,
      text,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
