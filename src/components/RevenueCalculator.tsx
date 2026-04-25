"use client";

import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── Platform configs with real-world fee structures ──────────
const PLATFORM_CONFIG = {
  stripe: {
    name: "Stripe",
    icon: "⚡",
    color: "#635BFF",
    feePercent: 2.9,
    feeFixed: 0.30,
    vatPercent: 0,
    fxPercent: 1.0,
    description: "2.9% + €0.30 per transaction",
    defaultRevenue: 3000,
  },
  appstore: {
    name: "App Store",
    icon: "🍎",
    color: "#0D84FF",
    feePercent: 30,
    feeFixed: 0,
    vatPercent: 6,
    fxPercent: 1.2,
    description: "30% commission + local tax",
    defaultRevenue: 2000,
  },
  googleplay: {
    name: "Google Play",
    icon: "▶",
    color: "#34A853",
    feePercent: 15,
    feeFixed: 0,
    vatPercent: 5.5,
    fxPercent: 2.0,
    description: "15% commission + local tax",
    defaultRevenue: 1500,
  },
  shopify: {
    name: "Shopify",
    icon: "🛒",
    color: "#96BF48",
    feePercent: 2.6,
    feeFixed: 0.30,
    vatPercent: 6,
    fxPercent: 1.5,
    description: "2.6% + €0.30 + Shopify plan",
    defaultRevenue: 1000,
  },
} as const;

type PlatformId = keyof typeof PLATFORM_CONFIG;
type PlatformConfig = typeof PLATFORM_CONFIG[PlatformId];

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number) {
  return "€" + n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtExact(n: number) {
  return "€" + n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Platform toggle button ───────────────────────────────────
function PlatformToggle({ id, config, active, revenue, onToggle, onRevenueChange }: {
  id: PlatformId;
  config: PlatformConfig;
  active: boolean;
  revenue: number;
  onToggle: (id: PlatformId) => void;
  onRevenueChange: (id: PlatformId, value: number) => void;
}) {
  return (
    <div
      style={{
        background: active ? "#13110e" : "#0a0908",
        border: `1px solid ${active ? config.color + "55" : "#1a1814"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        opacity: active ? 1 : 0.45,
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => onToggle(id)}
    >
      {/* Active indicator */}
      {active && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: config.color,
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: active ? 10 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{config.icon}</span>
          <span style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 14,
            fontWeight: 600,
            color: active ? "#e0d0c0" : "#504840",
          }}>
            {config.name}
          </span>
        </div>

        <div style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `2px solid ${active ? config.color : "#2a2520"}`,
          background: active ? config.color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          fontSize: 11,
          color: "#0f0d0a",
          fontWeight: 700,
        }}>
          {active ? "✓" : ""}
        </div>
      </div>

      {active && (
        <div onClick={(e) => e.stopPropagation()}>
          <div style={{
            color: "#504840",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}>
            Monthly Gross Revenue
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#0a0908",
            border: "1px solid #2a2520",
            borderRadius: 6,
            padding: "6px 10px",
          }}>
            <span style={{ color: "#f0a830", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>€</span>
            <input
              type="number"
              value={revenue}
              onChange={(e) => onRevenueChange(id, Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e0d0c0",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>
          <div style={{
            color: "#403830",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4,
          }}>
            {config.description}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Waterfall Chart ──────────────────────────────────────────
function MiniWaterfall({ gross, fees, vat, fx, net }: {
  gross: number;
  fees: number;
  vat: number;
  fx: number;
  net: number;
}) {
  if (gross === 0) return null;

  const data = [
    { name: "Gross", value: gross, base: 0, fill: "#f0a830" },
    { name: "Fees",  value: fees,  base: gross - fees,                fill: "#e05544" },
    { name: "VAT",   value: vat,   base: gross - fees - vat,          fill: "#d4783a" },
    { name: "FX",    value: fx,    base: gross - fees - vat - fx,     fill: "#c4622e" },
    { name: "Net",   value: net,   base: 0,                           fill: "#4ade80" },
  ];

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: typeof data[number] }>;
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{
        background: "#1a1814",
        border: "1px solid #2a2520",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}>
        <div style={{ color: "#a09080", marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: d.fill, fontWeight: 700 }}>{fmtExact(d.value)}</div>
        {d.name !== "Gross" && d.name !== "Net" && (
          <div style={{ color: "#706050", fontSize: 10, marginTop: 2 }}>
            {((d.value / gross) * 100).toFixed(1)}% of gross
          </div>
        )}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="18%">
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
          tickFormatter={(v) => "€" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v)}
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

// ── The "You're Losing" reveal ───────────────────────────────
function LossReveal({ gross, net }: { gross: number; net: number }) {
  if (gross === 0) return null;
  const lost = gross - net;
  const pct = ((lost / gross) * 100).toFixed(1);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a0a0a, #13110e)",
      border: "1px solid #e0554430",
      borderRadius: 12,
      padding: "24px",
      textAlign: "center",
      animation: "calcFadeIn 0.4s ease",
    }}>
      <div style={{
        color: "#706050",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 8,
      }}>
        You&apos;re leaving on the table
      </div>
      <div style={{
        fontSize: 36,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        color: "#e05544",
        marginBottom: 4,
      }}>
        {fmtExact(lost)}
      </div>
      <div style={{
        color: "#e0554499",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: 16,
      }}>
        {pct}% of your gross revenue — every single month
      </div>
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 24,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
            PER YEAR
          </div>
          <div style={{ color: "#e05544", fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(lost * 12)}
          </div>
        </div>
        <div style={{ width: 1, background: "#2a2520" }} />
        <div>
          <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
            YOU KEEP
          </div>
          <div style={{ color: "#4ade80", fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(net)}
            <span style={{ color: "#4ade8066", fontSize: 12 }}>/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function RevenueCalculator() {
  const [activePlatforms, setActivePlatforms] = useState<Record<PlatformId, boolean>>({
    stripe: true,
    appstore: true,
    googleplay: false,
    shopify: false,
  });

  const [revenues, setRevenues] = useState<Record<PlatformId, number>>({
    stripe: 3000,
    appstore: 2000,
    googleplay: 1500,
    shopify: 1000,
  });

  const togglePlatform = useCallback((id: PlatformId) => {
    setActivePlatforms((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const updateRevenue = useCallback((id: PlatformId, value: number) => {
    setRevenues((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Calculate totals
  let totalGross = 0;
  let totalFees = 0;
  let totalVat = 0;
  let totalFx = 0;

  (Object.entries(PLATFORM_CONFIG) as [PlatformId, PlatformConfig][]).forEach(([id, config]) => {
    if (!activePlatforms[id]) return;
    const rev = revenues[id] || 0;
    totalGross += rev;
    totalFees += rev * (config.feePercent / 100) + config.feeFixed;
    totalVat += rev * (config.vatPercent / 100);
    totalFx += rev * (config.fxPercent / 100);
  });

  const totalNet = totalGross - totalFees - totalVat - totalFx;
  const hasData = totalGross > 0;

  return (
    <>
      <style>{`
        @keyframes calcFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}>
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
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              Rev<span style={{ color: "#f0a830" }}>Hound</span>
            </span>
          </div>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 8,
          }}>
            How much are you <span style={{ color: "#e05544" }}>really</span> keeping?
          </h2>
          <p style={{
            color: "#706050",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Select your platforms, enter your revenue, and see the gap between what your dashboard shows and what hits your bank.
          </p>
        </div>

        {/* Platform selection */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginBottom: 28,
        }}>
          {(Object.entries(PLATFORM_CONFIG) as [PlatformId, PlatformConfig][]).map(([id, config]) => (
            <PlatformToggle
              key={id}
              id={id}
              config={config}
              active={activePlatforms[id]}
              revenue={revenues[id]}
              onToggle={togglePlatform}
              onRevenueChange={updateRevenue}
            />
          ))}
        </div>

        {hasData && (
          <div style={{ animation: "calcFadeIn 0.3s ease" }}>
            {/* Summary stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}>
              <div style={{
                background: "#13110e",
                border: "1px solid #2a2520",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Gross
                </div>
                <div style={{ color: "#f0a830", fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(totalGross)}
                </div>
              </div>
              <div style={{
                background: "#13110e",
                border: "1px solid #2a2520",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Deductions
                </div>
                <div style={{ color: "#e05544", fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  −{fmt(Math.round(totalFees + totalVat + totalFx))}
                </div>
              </div>
              <div style={{
                background: "#13110e",
                border: "1px solid #4ade8020",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{ color: "#504840", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                  Net
                </div>
                <div style={{ color: "#4ade80", fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(Math.round(totalNet))}
                </div>
              </div>
            </div>

            {/* Waterfall */}
            <div style={{
              background: "#13110e",
              border: "1px solid #2a2520",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 20,
            }}>
              <h3 style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#a09080",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#f0a830" }}>◆</span> Your Revenue Waterfall
              </h3>
              <MiniWaterfall
                gross={totalGross}
                fees={totalFees}
                vat={totalVat}
                fx={totalFx}
                net={totalNet}
              />
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 12,
                flexWrap: "wrap",
              }}>
                {[
                  { label: "Platform Fees", color: "#e05544", value: totalFees },
                  { label: "VAT / Tax",     color: "#d4783a", value: totalVat },
                  { label: "FX Loss",       color: "#c4622e", value: totalFx },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                    <span style={{ color: "#706050", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                      {item.label}: {fmtExact(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* The reveal */}
            <LossReveal gross={totalGross} net={totalNet} />

            {/* CTA */}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <div style={{
                color: "#504840",
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 14,
              }}>
                Stop guessing. Start tracking.
              </div>
              <button
                onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  background: "linear-gradient(135deg, #f0a830, #d4882a)",
                  color: "#0f0d0a",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 0 20px #f0a83030",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 24px #f0a83050";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 20px #f0a83030";
                }}
              >
                Join the Waitlist — Free
              </button>
              <div style={{
                color: "#302820",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 10,
              }}>
                €9/mo flat when we launch. No % of your revenue. Ever.
              </div>
            </div>
          </div>
        )}

        {!hasData && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#302820",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
          }}>
            ↑ Select at least one platform to see your numbers
          </div>
        )}
      </div>
    </>
  );
}
