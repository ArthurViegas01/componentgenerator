import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Browser-tab favicon generated at build time via next/og.
 * A rounded square with the brand indigo→purple gradient and a ✦ glyph.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.5px",
        }}
      >
        ✦
      </div>
    ),
    { ...size }
  );
}
