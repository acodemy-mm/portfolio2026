import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E50914",
          borderRadius: 36,
          color: "#FFFFFF",
          fontSize: 128,
          fontWeight: 700,
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          lineHeight: 1,
        }}
      >
        L
      </div>
    ),
    { ...size },
  );
}
