// The 1200x630 share image (WhatsApp, LinkedIn, X, Facebook, Slack link previews)
// for every page. A page can override it with its own opengraph-image.js.
import { ImageResponse } from "next/og";

export const alt = "B.A.D.E ERP: cloud ERP software for businesses in Nigeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MODULES = ["Inventory", "Accounting", "POS & Sales", "HR & Payroll", "CRM", "NRS e-invoicing"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>B.A.D.E ERP</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            Run your whole business from one system
          </div>
          <div style={{ display: "flex", fontSize: 32, marginTop: 24, color: "#cbd5e1" }}>
            Cloud ERP software for businesses in Nigeria
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {MODULES.map((m) => (
            <div
              key={m}
              style={{
                display: "flex",
                fontSize: 26,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
