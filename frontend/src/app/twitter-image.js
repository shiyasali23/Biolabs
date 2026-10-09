import { ImageResponse } from "next/og";

export const alt = "Biolabs — Connecting biology and machines.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "72px 80px", color: "#f2f5e6", background: "#0c211c" }}>
      <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: "0.28em" }}>BIOLABS</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
          <span>Connecting Biology</span>
          <span>And Machines.</span>
        </div>
        <div style={{ display: "flex", marginTop: 32, color: "#c5d2be", fontSize: 30 }}>Personalized Health &amp; Biotech</div>
      </div>
    </div>,
    size,
  );
}
