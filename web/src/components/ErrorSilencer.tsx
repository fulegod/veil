"use client";

/**
 * Silencia errores de SDKs externos (Reown/WalletConnect/Coinbase Wallet)
 * que se manifiestan como `unhandledRejection` y disparan el overlay de
 * Next.js sin ser bugs nuestros.
 *
 * Patrón: ✅ defensivo y específico. Solo filtra mensajes conocidos por
 * sustring. Cualquier otro error pasa intacto al handler default.
 */

import { useEffect } from "react";

const SILENCED_SUBSTRINGS = [
  "Connection interrupted while trying to subscribe",
  "Cross-Origin-Opener-Policy",
  "Failed to fetch remote project configuration",
  "Reown Config",
];

function shouldSilence(message: string): boolean {
  return SILENCED_SUBSTRINGS.some((s) => message.includes(s));
}

export function ErrorSilencer() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason ?? "");
      if (shouldSilence(message)) {
        event.preventDefault();
      }
    }

    function handleError(event: ErrorEvent) {
      if (shouldSilence(event.message || "")) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
