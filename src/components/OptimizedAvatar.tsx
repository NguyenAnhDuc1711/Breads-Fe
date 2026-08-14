"use client";

import { Avatar, Box } from "./ui/primitives";
import NextImage from "next/image";
import { CSSProperties, useState } from "react";
import "./OptimizedAvatar.css";

// Chakra's default avatar size tokens (theme/components/avatar.ts), in px.
const SIZE_TOKEN_PX: Record<string, number> = {
  "2xs": 16,
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  "2xl": 128,
};

type SizeToken = keyof typeof SIZE_TOKEN_PX;
type ResponsiveSize = SizeToken | Partial<Record<"base" | "sm" | "md" | "lg" | "xl", SizeToken>>;

interface OptimizedAvatarProps {
  src?: string;
  name?: string;
  size?: ResponsiveSize;
  width?: string | number;
  height?: string | number;
  onClick?: () => void;
  cursor?: CSSProperties["cursor"];
  position?: CSSProperties["position"];
}

const toPx = (value: string | number | undefined): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const largestTokenPx = (size?: ResponsiveSize): number | undefined => {
  if (!size) return undefined;
  if (typeof size === "string") return SIZE_TOKEN_PX[size];
  const values = Object.values(size)
    .map((token) => (token ? SIZE_TOKEN_PX[token as SizeToken] : undefined))
    .filter((n): n is number => typeof n === "number");
  return values.length ? Math.max(...values) : undefined;
};

// Falls back to Chakra Avatar (initials) on empty src AND on load error — Chakra's own fallback only covers the former.
const OptimizedAvatar = ({
  src,
  name,
  size,
  width,
  height,
  onClick,
  cursor,
  position,
}: OptimizedAvatarProps) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Avatar
        src={src}
        name={name}
        size={size as any}
        onClick={onClick}
        cursor={cursor}
        position={position}
      />
    );
  }

  const explicitPx = toPx(width) ?? toPx(height);
  const isResponsive = typeof size === "object";
  // Fetch at the largest breakpoint's px so it stays sharp when the Box scales it down on smaller screens.
  const px = explicitPx ?? largestTokenPx(size) ?? SIZE_TOKEN_PX.md;
  const boxSize = isResponsive
    ? Object.fromEntries(
        Object.entries(size as Record<string, SizeToken>).map(([bp, token]) => [
          bp,
          `${SIZE_TOKEN_PX[token]}px`,
        ])
      )
    : `${px}px`;

  return (
    <Box
      as="span"
      className="optimized-avatar"
      style={{
        width: typeof boxSize === "string" ? boxSize : undefined,
        height: typeof boxSize === "string" ? boxSize : undefined,
      }}
      width={typeof boxSize === "object" ? boxSize : undefined}
      height={typeof boxSize === "object" ? boxSize : undefined}
      cursor={cursor}
      position={position}
      onClick={onClick}
    >
      <NextImage
        src={src}
        alt={name || "avatar"}
        width={px}
        height={px}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  );
};

export default OptimizedAvatar;
