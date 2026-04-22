"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";

// ── Sample Data ──────────────────────────────────────────────
const PLATFORMS = {
  stripe: {
    name: "Stripe",
    gross: 4280,
    fees: 124.12,
    vat: 0,
    fx: 38.52,
    color: "#635BFF",
    icon: "⚡",
  },
  appstore: {
    name: "App Store",
    gross: 2190,
    fees: 657.0,
    vat: 131.4,
    fx: 21.9,
    color: "#0D84FF",
    icon: "🍎",
  },
  googleplay: {
    name: "Google Play",
    gross: 1640,
    fees: 246.0,
    vat: 98.4,
    fx: 32.8,
    color: "#34A853",
    icon: "▶",
  },
  shopify: {
    name: "Shopify",
    gross: 890,
    fees: 22.25,
    vat: 53.4,
    fx: 8.01,
    color: "#96BF48",
    icon: "🛒",
  },
};

const MONTHLY_DATA = [
  { month: "Nov", gross: 7420, net: 5890 },
  { month: "Dec", gross: 8910, net: 7102 },
  { month: "Jan", gross: 7840, net: 6195 },
  { month: "Feb", gross: 8260, net: 6580 },
  { month: "Mar", gross: 8690, net: 6910 },
  { month: "Apr", gross: 9000, net: 7149 },
];

// ── Helpers ──────────────────────────────────────────────────
function sum(key: keyof typeof PLATFORMS.stripe) {
  return Object.values(PLATFORMS).reduce((a, p) => a + (p[key] as number), 0);
}

function fmt(n: number) {
  return "€" + n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(part: number, whole: number) {
  return ((part / whole) * 100).toFixed(1) + "%";
}

// ── Animated counter ─────────────────────────────────────────
function AnimatedNumber({ value, prefix = "€", duration = 1200 }: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);
  return (
    <span>
      {prefix}
      {display.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

// ── Waterfall Chart ──────────────────────────────────────────
function WaterfallChart() {
  const totalGross = sum("gross");
  const totalFees = sum("fees");
  const totalVat = sum("vat");
  const totalFx = sum("fx");
  const totalNet = totalGross - totalFees - totalVat - totalFx;

  const data = [
    { name: "Gross Revenue", value: totalGross, base: 0, fill: "#f0a830" },
    {
      name: "Platform Fees",
      value: totalFees,
      base: totalGross - totalFees,
      fill: "#e05544",
    },
    {
      name: "VAT / Tax",
      value: totalVat,
      base: totalGross - totalFees - totalVat,
      fill: "#d4783a",
    },
    {
      name: "FX Loss",
      value: totalFx,
      base: totalGross - totalFees - totalVat - totalFx,
      fill: "#c4622e",
    },
    { name: "Net Revenue", value: totalNet, base: 0, fill: "#4ade80" },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof data[number] }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{
        background: "#1a1814",
        border: "1px solid #2a2520",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
      }}>
        <div style={{ color: "#a09080", marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: d.fill, fontWeight: 700 }}>{fmt(d.value)}</div>
        {d.name !== "Gross Revenue" && d.name !== "Net Revenue" && (
          <div style={{ color: "#706050", fontSize: 11, marginTop: 2 }}>
            −{pct(d.value, totalGross)} of gross
          </div>
        )}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: "#2a2520" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => "€" + (v / 1000).toFixed(1) + "k"}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="base" stackId="stack" fill="transparent" />
        <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Trend Chart ──────────────────────────────────────────────
function TrendChart() {
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: { dataKey: string; color: string; value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#1a1814",
        border: "1px solid #2a2520",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
      }}>
        <div style={{ color: "#a09080", marginBottom: 6 }}>{label} 2025</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
            {p.dataKey === "gross" ? "Gross" : "Net"}: {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={MONTHLY_DATA}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: "#2a2520" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => "€" + (v / 1000).toFixed(1) + "k"}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="gross"
          stroke="#f0a830"
          strokeWidth={2.5}
          dot={{ fill: "#f0a830", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#4ade80"
          strokeWidth={2.5}
          dot={{ fill: "#4ade80", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          strokeDasharray="6 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Platform Card ────────────────────────────────────────────
function PlatformCard({ platform, animDelay }: {
  platform: typeof PLATFORMS[keyof typeof PLATFORMS];
  animDelay: number;
}) {
  const net = platform.gross - platform.fees - platform.vat - platform.fx;
  const leakage = ((1 - net / platform.gross) * 100).toFixed(1);

  return (
    <div
      style={{
        background: "#13110e",
        border: "1px solid #2a2520",
        borderRadius: 12,
        padding: "20px",
        animation: `fadeSlideUp 0.5s ease ${animDelay}ms both`,
        transition: "border-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = platform.color + "66")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2520")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{platform.icon}</span>
          <span style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#e0d0c0",
          }}>
            {platform.name}
          </span>
        </div>
        <span style={{
          background: "#e0554420",
          color: "#e05544",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          padding: "3px 8px",
          borderRadius: 6,
        }}>
          −{leakage}%
        </span>
      </div>

      {/* Mini bar */}
      <div style={{ background: "#0a0908", borderRadius: 6, height: 8, marginBottom: 14, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 6,
            background: `linear-gradient(90deg, ${platform.color}, ${platform.color}88)`,
            width: pct(net, platform.gross === 0 ? 1 : platform.gross),
            transition: "width 1s ease",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
            Gross
          </div>
          <div style={{ color: "#a09080", fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(platform.gross)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
            Net
          </div>
          <div style={{ color: "#4ade80", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {fmt(net)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function RevHoundDashboard() {
  const totalGross = sum("gross");
  const totalFees = sum("fees");
  const totalVat = sum("vat");
  const totalFx = sum("fx");
  const totalNet = totalGross - totalFees - totalVat - totalFx;
  const totalLeakage = ((1 - totalNet / totalGross) * 100).toFixed(1);

  const [tab, setTab] = useState("waterfall");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0d0a",
        color: "#e0d0c0",
        fontFamily: "'Source Serif 4', Georgia, serif",
        padding: 0,
        margin: 0,
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px #f0a83015; }
          50% { box-shadow: 0 0 30px #f0a83025; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid #1a1814",
        padding: "16px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        animation: "fadeSlideUp 0.4s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f0a830, #d4882a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            color: "#0f0d0a",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            R
          </div>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}>
            Rev<span style={{ color: "#f0a830" }}>Hound</span>
          </span>
        </div>

        <div style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}>
          <span style={{
            background: "#f0a83015",
            color: "#f0a830",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #f0a83025",
          }}>
            DEMO DATA
          </span>
          <span style={{
            color: "#504840",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Apr 2025
          </span>
        </div>
      </header>

      {/* ── Content ─────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

        {/* Hero stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
          animation: "fadeSlideUp 0.5s ease 100ms both",
        }}>
          {/* Gross */}
          <div style={{
            background: "#13110e",
            border: "1px solid #2a2520",
            borderRadius: 12,
            padding: "20px",
          }}>
            <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Gross Revenue
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#f0a830", fontFamily: "'JetBrains Mono', monospace" }}>
              <AnimatedNumber value={totalGross} />
            </div>
            <div style={{ color: "#504840", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>
              4 platforms
            </div>
          </div>

          {/* Deductions */}
          <div style={{
            background: "#13110e",
            border: "1px solid #2a2520",
            borderRadius: 12,
            padding: "20px",
          }}>
            <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Total Deductions
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#e05544", fontFamily: "'JetBrains Mono', monospace" }}>
              −<AnimatedNumber value={totalFees + totalVat + totalFx} prefix="€" />
            </div>
            <div style={{ color: "#e05544", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>
              −{totalLeakage}% of gross
            </div>
          </div>

          {/* Net */}
          <div style={{
            background: "#13110e",
            border: "1px solid #4ade8020",
            borderRadius: 12,
            padding: "20px",
            animation: "glowPulse 3s ease infinite",
          }}>
            <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Net Revenue
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace" }}>
              <AnimatedNumber value={totalNet} />
            </div>
            <div style={{ color: "#4ade8099", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>
              what you actually keep
            </div>
          </div>
        </div>

        {/* Chart section */}
        <div style={{
          background: "#13110e",
          border: "1px solid #2a2520",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 24,
          animation: "fadeSlideUp 0.5s ease 200ms both",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            {[
              { id: "waterfall", label: "Revenue Waterfall" },
              { id: "trend", label: "6-Month Trend" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "#f0a83018" : "transparent",
                  color: tab === t.id ? "#f0a830" : "#605040",
                  border: tab === t.id ? "1px solid #f0a83030" : "1px solid transparent",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "waterfall" ? <WaterfallChart /> : <TrendChart />}

          {tab === "waterfall" && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 16,
              flexWrap: "wrap",
            }}>
              {[
                { label: "Platform Fees", color: "#e05544", value: sum("fees") },
                { label: "VAT / Tax", color: "#d4783a", value: sum("vat") },
                { label: "FX Loss", color: "#c4622e", value: sum("fx") },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                  <span style={{ color: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.label}: {fmt(item.value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "trend" && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: "#f0a830", borderRadius: 2 }} />
                <span style={{ color: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>Gross</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: "#4ade80", borderRadius: 2, borderTop: "1px dashed #4ade80" }} />
                <span style={{ color: "#706050", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>Net</span>
              </div>
            </div>
          )}
        </div>

        {/* Platform breakdown */}
        <div style={{ marginBottom: 24, animation: "fadeSlideUp 0.5s ease 300ms both" }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#a09080",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: "#f0a830" }}>◆</span> Platform Breakdown
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}>
            {Object.values(PLATFORMS).map((p, i) => (
              <PlatformCard key={p.name} platform={p} animDelay={400 + i * 80} />
            ))}
          </div>
        </div>

        {/* Deductions detail table */}
        <div style={{
          background: "#13110e",
          border: "1px solid #2a2520",
          borderRadius: 12,
          padding: "24px",
          animation: "fadeSlideUp 0.5s ease 500ms both",
        }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#a09080",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: "#f0a830" }}>◆</span> Deduction Details
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1814" }}>
                {["Platform", "Gross", "Fees", "VAT", "FX", "Net"].map((h) => (
                  <th key={h} style={{
                    textAlign: h === "Platform" ? "left" : "right",
                    color: "#504840",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    padding: "8px 12px",
                    fontWeight: 500,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(PLATFORMS).map((p) => {
                const net = p.gross - p.fees - p.vat - p.fx;
                return (
                  <tr key={p.name} style={{ borderBottom: "1px solid #13110e" }}>
                    <td style={{ padding: "10px 12px", color: "#a09080" }}>
                      {p.icon} {p.name}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#f0a830" }}>
                      {fmt(p.gross)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#e05544" }}>
                      −{fmt(p.fees)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#d4783a" }}>
                      −{fmt(p.vat)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#c4622e" }}>
                      −{fmt(p.fx)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#4ade80", fontWeight: 600 }}>
                      {fmt(net)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ borderTop: "2px solid #2a2520" }}>
                <td style={{ padding: "12px 12px", color: "#e0d0c0", fontWeight: 600 }}>
                  Total
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right", color: "#f0a830", fontWeight: 700 }}>
                  {fmt(totalGross)}
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right", color: "#e05544", fontWeight: 600 }}>
                  −{fmt(totalFees)}
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right", color: "#d4783a", fontWeight: 600 }}>
                  −{fmt(totalVat)}
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right", color: "#c4622e", fontWeight: 600 }}>
                  −{fmt(totalFx)}
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right", color: "#4ade80", fontWeight: 700, fontSize: 14 }}>
                  {fmt(totalNet)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: 32,
          padding: "16px 0",
          borderTop: "1px solid #1a1814",
          animation: "fadeSlideUp 0.5s ease 600ms both",
        }}>
          <span style={{
            color: "#302820",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            revhound.dev — see what you actually earn
          </span>
        </div>
      </main>
    </div>
  );
}
