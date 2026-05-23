/**
 * /api/cron/check-vaults — Vercel Cron route.
 *
 * Polls Arkiv every hour for pending Action entities and fires them:
 *   - email_warning  → pre-expiry reminder to the configured address
 *   - email_delivery → post-expiry message delivery to the recipient
 *   - transfer       → roadmap (not implemented in MVP)
 *   - doc_drop       → roadmap (not implemented in MVP)
 *
 * IDEMPOTENCY (MVP limitation): we filter actions by a time window
 * (`triggerAt` within the last 65 minutes) instead of mutating
 * `notified_at` on-chain after each send. This avoids needing a
 * service-wallet owner-of-record for Actions (which would require an
 * extra ownership-transfer tx per Action at create time).
 *
 * Tradeoff: if the cron fails to run for a window, that email is missed
 * (not retried). For a hackathon demo this is acceptable; production
 * would add a KV/Redis idempotency layer or transfer Action ownership
 * to a service wallet on create.
 *
 * Auth: Vercel cron requests include a `Authorization: Bearer <CRON_SECRET>`
 * header. We compare against `process.env.CRON_SECRET`.
 */

import { NextResponse } from "next/server";

import { listPendingActions } from "@/lib/arkiv";
import { sendVaultDelivery, sendVaultWarning } from "@/lib/email";
import { ACTION_TYPE, explorerEntityUrl } from "@/lib/config";

const WINDOW_MS = 65 * 60 * 1000; // 65 min window (1h cron + 5m drift)

export async function GET(request: Request) {
  // Auth check — only Vercel Cron (or whoever has CRON_SECRET) can trigger
  const expectedAuth = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let pending;
  try {
    pending = await listPendingActions(now);
  } catch (e) {
    return NextResponse.json(
      { error: "arkiv_query_failed", detail: String(e) },
      { status: 500 },
    );
  }

  // Filter to the recent window so we don't fire the same action every run
  const fireable = pending.filter((a) => a.triggerAt >= windowStart);

  const results: Array<{
    entityKey: string;
    actionType: string;
    destination: string;
    status: "sent" | "simulated" | "failed" | "skipped";
    error?: string;
  }> = [];

  for (const action of fireable) {
    const vaultUrl =
      typeof process.env.NEXT_PUBLIC_BASE_URL === "string" &&
      process.env.NEXT_PUBLIC_BASE_URL.length > 0
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/inheritance/${action.vaultKey}`
        : explorerEntityUrl(action.vaultKey);

    try {
      if (action.actionType === ACTION_TYPE.EMAIL_WARNING) {
        const daysRemaining = Math.max(
          1,
          Math.round((action.triggerAt - now) / (24 * 60 * 60 * 1000)),
        );
        const r = await sendVaultWarning({
          to: action.destination,
          vaultTitle: action.message || "(untitled)",
          daysRemaining,
          vaultUrl,
        });
        results.push({
          entityKey: action.entityKey,
          actionType: action.actionType,
          destination: action.destination,
          status: r.simulated ? "simulated" : r.ok ? "sent" : "failed",
          error: r.error,
        });
      } else if (action.actionType === ACTION_TYPE.EMAIL_DELIVERY) {
        const r = await sendVaultDelivery({
          to: action.destination,
          vaultTitle: action.message.slice(0, 80) || "(untitled)",
          message: action.message,
          vaultUrl,
        });
        results.push({
          entityKey: action.entityKey,
          actionType: action.actionType,
          destination: action.destination,
          status: r.simulated ? "simulated" : r.ok ? "sent" : "failed",
          error: r.error,
        });
      } else {
        // transfer / doc_drop — roadmap, not yet implemented
        results.push({
          entityKey: action.entityKey,
          actionType: action.actionType,
          destination: action.destination,
          status: "skipped",
          error: "action_type not yet implemented (roadmap)",
        });
      }
    } catch (e) {
      results.push({
        entityKey: action.entityKey,
        actionType: action.actionType,
        destination: action.destination,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    now,
    windowStart,
    pendingTotal: pending.length,
    fireableInWindow: fireable.length,
    results,
  });
}
