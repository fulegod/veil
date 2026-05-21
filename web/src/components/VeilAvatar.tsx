"use client";

/**
 * Custom avatar para RainbowKit.
 *
 * RainbowKit por default genera avatares con figuras random (cat/mouse/etc).
 * Este componente lo reemplaza con un círculo de gradiente determinístico
 * basado en la address — mismo wallet siempre da mismo avatar, sin emojis.
 *
 * Se monta via <RainbowKitProvider avatar={VeilAvatar}>.
 */

import type { AvatarComponent } from "@rainbow-me/rainbowkit";

/**
 * Hash simple FNV-1a de una string → uint32. Determinístico, sin libs.
 * Sirve para derivar dos hues estables desde la address.
 */
function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export const VeilAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  // If the wallet has an ENS avatar, honor it
  if (ensImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ensImage}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: 999 }}
      />
    );
  }

  // Two stable hues derived from the address — gradient that "belongs" to this wallet
  const hash = fnv1aHash(address.toLowerCase());
  const hueA = hash % 360;
  const hueB = (hueA + 60) % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `linear-gradient(135deg, hsl(${hueA} 70% 45%) 0%, hsl(${hueB} 70% 60%) 100%)`,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)",
      }}
      aria-hidden
    />
  );
};
