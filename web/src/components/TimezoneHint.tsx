"use client";

/**
 * Muestra la hora actual del browser + zona horaria.
 * Útil al lado del <input type="datetime-local"> que usa la zona LOCAL
 * del usuario pero no la indica en ningún lado del UI.
 */

import { useEffect, useState } from "react";

function getGmtOffsetLabel(): string {
  // getTimezoneOffset() devuelve minutos AHEAD of local (signo invertido)
  // Ej: GMT+8 → -480
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0
    ? `GMT${sign}${h}`
    : `GMT${sign}${h}:${String(m).padStart(2, "0")}`;
}

function getTzName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

export function TimezoneHint() {
  // SSR-safe: empty initial value, hydrate on mount to avoid mismatch
  const [now, setNow] = useState<string>("");
  const [tz, setTz] = useState<string>("");

  useEffect(() => {
    function tick() {
      setNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }
    setTz(`${getGmtOffsetLabel()} · ${getTzName()}`);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#666]">
      <span className="font-bold text-[#222]">Now</span> {now} · {tz}
    </p>
  );
}
