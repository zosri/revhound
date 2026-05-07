"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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

import {
  parseStripeCsv,
  getSampleTransactions,
  type StripeTransaction,
  type ParseError,
} from "@/lib/stripe-csv";
import {
  calculateRevenue,
  formatMoney,
  formatDateRange,
  type RevenueBreakdown,
} from "@/lib/revenue-calc";

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

type View =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "error"; error: ParseError }
  | { kind: "results"; breakdown: RevenueBreakdown; isSample: boolean; skipped: number };

export default function CalculatorPage() {
  const [view, setView] = useState<View>({ kind: "idle" });

  const showResults = useCallback(
    (txs: StripeTransaction[], isSample: boolean, skipped: number) => {
      setView({
        kind: "results",
        breakdown: calculateRevenue(txs),
        isSample,
        skipped,
      });
    },
    [],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setView({ kind: "parsing" });
      const result = await parseStripeCsv(file);
      if (!result.ok) {
        setView({ kind: "error", error: result.error });
      } else {
        showResults(result.data.transactions, false, result.data.skippedRows);
      }
    },
    [showResults],
  );

  const handleSample = useCallback(() => {
    showResults(getSampleTransactions(), true, 0);
  }, [showResults]);

  const reset = useCallback(() => setView({ kind: "idle" }), []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0d0a",
        color: "#e0d0c0",
        fontFamily:
          "'Source Serif 4', Georgia, 'Times New Roman', Times, serif",
      }}
    >
      <PageHeader />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>
        {view.kind === "idle" && (
          <IdleState onFile={handleFile} onSample={handleSample} />
        )}
        {view.kind === "parsing" && <ParsingState />}
        {view.kind === "error" && (
          <ErrorState error={view.error} onReset={reset} />
        )}
        {view.kind === "results" && (
          <ResultsState
            breakdown={view.breakdown}
            isSample={view.isSample}
            skipped={view.skipped}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid #1a1814",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "#e0d0c0",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "linear-gradient(135deg, #f0a830, #d4882a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#0f0d0a",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          R
        </div>
        <span style={{ fontSize: 17, fontWeight: 700 }}>
          Rev<span style={{ color: "#f0a830" }}>Hound</span>
        </span>
      </Link>
      <Link
        href="/"
        style={{
          color: "#706050",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          textDecoration: "none",
        }}
      >
        ← Back
      </Link>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Idle state — file upload + sample option
// ─────────────────────────────────────────────────────────────

function IdleState({
  onFile,
  onSample,
}: {
  onFile: (file: File) => void;
  onSample: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div style={{ paddingTop: 64 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            color: "#f0a830",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 14,
          }}
        >
          Stripe → Real Net Revenue
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 14,
          }}
        >
          What did you{" "}
          <span style={{ color: "#f0a830", fontStyle: "italic" }}>actually</span>{" "}
          earn?
        </h1>
        <p
          style={{
            color: "#a09080",
            fontSize: 16,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Drop your Stripe Payments export and see your true net after fees,
          refunds, and FX. Your file never leaves the browser.
        </p>
      </div>

      <label
        htmlFor="csv-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        style={{
          display: "block",
          background: dragActive ? "#1a1612" : "#13110e",
          border: `2px dashed ${dragActive ? "#f0a830" : "#2a2520"}`,
          borderRadius: 14,
          padding: "56px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.18s ease",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: dragActive ? "#f0a830" : "#504840",
            marginBottom: 12,
            transition: "color 0.18s ease",
          }}
        >
          ↓
        </div>
        <div
          style={{
            color: "#e0d0c0",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Drop your Stripe CSV here
        </div>
        <div
          style={{
            color: "#706050",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          or click to browse · .csv only
        </div>
        <input
          id="csv-upload"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
          style={{ display: "none" }}
        />
      </label>

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          color: "#504840",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Don&apos;t have one yet?{" "}
        <button
          onClick={onSample}
          style={{
            background: "transparent",
            border: "none",
            color: "#f0a830",
            fontFamily: "inherit",
            fontSize: "inherit",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          try with sample data
        </button>
      </div>

      <ExportInstructions />
    </div>
  );
}

function ExportInstructions() {
  return (
    <details
      style={{
        marginTop: 56,
        background: "#13110e",
        border: "1px solid #1a1814",
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          color: "#a09080",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          listStyle: "none",
        }}
      >
        How do I export from Stripe? ↓
      </summary>
      <ol
        style={{
          marginTop: 14,
          paddingLeft: 20,
          color: "#706050",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <li>Open the Stripe Dashboard → Payments</li>
        <li>Click the Export button (top right)</li>
        <li>Choose a date range, format CSV, default columns</li>
        <li>Wait for the email or download direct, then drop it above</li>
      </ol>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────
// Parsing state
// ─────────────────────────────────────────────────────────────

function ParsingState() {
  return (
    <div style={{ paddingTop: 120, textAlign: "center" }}>
      <div
        style={{
          color: "#f0a830",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: 2,
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      >
        Parsing your transactions…
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────

function ErrorState({
  error,
  onReset,
}: {
  error: ParseError;
  onReset: () => void;
}) {
  return (
    <div style={{ paddingTop: 80, maxWidth: 480, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1a0a0a, #13110e)",
          border: "1px solid #e0554440",
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            color: "#e05544",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          Couldn&apos;t read that file
        </div>
        <div
          style={{
            color: "#e0d0c0",
            fontSize: 15,
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          {error.message}
        </div>
        <button
          onClick={onReset}
          style={{
            background: "transparent",
            color: "#f0a830",
            border: "1px solid #f0a83055",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer",
          }}
        >
          ← Try another file
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Results state — the actual breakdown
// ─────────────────────────────────────────────────────────────

function ResultsState({
  breakdown,
  isSample,
  skipped,
  onReset,
}: {
  breakdown: RevenueBreakdown;
  isSample: boolean;
  skipped: number;
  onReset: () => void;
}) {
  const lossPct =
    breakdown.gross > 0
      ? ((breakdown.gross - breakdown.net) / breakdown.gross) * 100
      : 0;

  return (
    <div style={{ paddingTop: 40, animation: "fadeIn 0.4s ease" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {isSample && (
        <Banner
          tone="info"
          title="Showing sample data"
          message="Upload your own Stripe export to see your real numbers."
        />
      )}
      {breakdown.multipleSettlementCurrencies && (
        <Banner
          tone="warn"
          title="Multiple settlement currencies detected"
          message="Totals are summed naively across currencies — treat them as approximate."
        />
      )}

      {/* Meta line */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          color: "#706050",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid #1a1814",
        }}
      >
        <span>
          <span style={{ color: "#504840" }}>Range</span>{" "}
          {formatDateRange(breakdown.dateRange)}
        </span>
        <span>
          <span style={{ color: "#504840" }}>Charges</span>{" "}
          {breakdown.transactionCount}
        </span>
        {breakdown.refundCount > 0 && (
          <span>
            <span style={{ color: "#504840" }}>Refunds</span>{" "}
            {breakdown.refundCount}
          </span>
        )}
        {skipped > 0 && (
          <span>
            <span style={{ color: "#504840" }}>Skipped</span> {skipped}
          </span>
        )}
      </div>

      {/* Headline numbers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Gross"
          value={formatMoney(breakdown.gross, breakdown.settlementCurrency)}
          color="#f0a830"
        />
        <StatCard
          label="Deductions"
          value={`−${formatMoney(
            breakdown.fees + breakdown.refunds + breakdown.fxLoss,
            breakdown.settlementCurrency,
          )}`}
          color="#e05544"
        />
        <StatCard
          label="Net"
          value={formatMoney(breakdown.net, breakdown.settlementCurrency)}
          color="#4ade80"
          accentBorder
        />
      </div>

      {/* Waterfall */}
      <Section title="Revenue Waterfall">
        <Waterfall breakdown={breakdown} />
        <Legend breakdown={breakdown} />
      </Section>

      {/* Per-currency breakdown — only useful when there's actually FX */}
      {breakdown.byCurrency.length > 1 && (
        <Section title="By Currency">
          <CurrencyTable breakdown={breakdown} />
        </Section>
      )}

      {/* The reveal */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a0a0a, #13110e)",
          border: "1px solid #e0554430",
          borderRadius: 12,
          padding: "24px",
          textAlign: "center",
          marginTop: 24,
        }}
      >
        <div
          style={{
            color: "#706050",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          Stripe kept
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#e05544",
            marginBottom: 4,
          }}
        >
          {formatMoney(
            breakdown.gross - breakdown.net,
            breakdown.settlementCurrency,
          )}
        </div>
        <div
          style={{
            color: "#e0554499",
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {lossPct.toFixed(1)}% of your gross — over{" "}
          {breakdown.transactionCount} charges
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={onReset}
          style={{
            background: "transparent",
            color: "#a09080",
            border: "1px solid #2a2520",
            borderRadius: 8,
            padding: "12px 24px",
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer",
          }}
        >
          ← Analyze another file
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Banner({
  tone,
  title,
  message,
}: {
  tone: "info" | "warn";
  title: string;
  message: string;
}) {
  const accent = tone === "warn" ? "#d4783a" : "#f0a830";
  return (
    <div
      style={{
        background: "#13110e",
        border: `1px solid ${accent}30`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ color: "#a09080", fontSize: 13 }}>{message}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  accentBorder = false,
}: {
  label: string;
  value: string;
  color: string;
  accentBorder?: boolean;
}) {
  return (
    <div
      style={{
        background: "#13110e",
        border: `1px solid ${accentBorder ? `${color}30` : "#2a2520"}`,
        borderRadius: 10,
        padding: "16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#504840",
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: 19,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#13110e",
        border: "1px solid #2a2520",
        borderRadius: 12,
        padding: "20px",
        marginBottom: 20,
      }}
    >
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#a09080",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#f0a830" }}>◆</span> {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Waterfall (uses recharts, same pattern as the marketing demo)
// ─────────────────────────────────────────────────────────────

type WaterfallDatum = {
  name: string;
  value: number;
  base: number;
  fill: string;
};

function WaterfallTooltip({
  active,
  payload,
  gross,
  settlementCurrency,
}: {
  active?: boolean;
  payload?: Array<{ payload: WaterfallDatum }>;
  gross: number;
  settlementCurrency: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: "#1a1814",
        border: "1px solid #2a2520",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#a09080", marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: d.fill, fontWeight: 700 }}>
        {formatMoney(d.value, settlementCurrency)}
      </div>
      {d.name !== "Gross" && d.name !== "Net" && (
        <div style={{ color: "#706050", fontSize: 10, marginTop: 2 }}>
          {((d.value / gross) * 100).toFixed(1)}% of gross
        </div>
      )}
    </div>
  );
}

function Waterfall({ breakdown }: { breakdown: RevenueBreakdown }) {
  const { gross, fees, refunds, fxLoss, net, settlementCurrency } = breakdown;
  if (gross === 0) return null;

  const data: WaterfallDatum[] = [
    { name: "Gross", value: gross, base: 0, fill: "#f0a830" },
  ];

  // Each deduction stacks down from the previous running total.
  let running = gross;
  if (fees > 0) {
    running -= fees;
    data.push({ name: "Fees", value: fees, base: running, fill: "#e05544" });
  }
  if (refunds > 0) {
    running -= refunds;
    data.push({
      name: "Refunds",
      value: refunds,
      base: running,
      fill: "#d4783a",
    });
  }
  if (fxLoss > 0) {
    running -= fxLoss;
    data.push({ name: "FX", value: fxLoss, base: running, fill: "#c4622e" });
  }
  data.push({ name: "Net", value: net, base: 0, fill: "#4ade80" });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="18%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{
            fill: "#706050",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          axisLine={{ stroke: "#2a2520" }}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: "#706050",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
          }
        />
        <Tooltip
          content={
            <WaterfallTooltip
              gross={gross}
              settlementCurrency={settlementCurrency}
            />
          }
          cursor={false}
        />
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

function Legend({ breakdown }: { breakdown: RevenueBreakdown }) {
  const items = [
    { label: "Stripe Fees", color: "#e05544", value: breakdown.fees },
    { label: "Refunds", color: "#d4783a", value: breakdown.refunds },
    { label: "Est. FX Loss", color: "#c4622e", value: breakdown.fxLoss },
  ].filter((i) => i.value > 0);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 12,
        flexWrap: "wrap",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: item.color,
            }}
          />
          <span
            style={{
              color: "#706050",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {item.label}:{" "}
            {formatMoney(item.value, breakdown.settlementCurrency)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CurrencyTable({ breakdown }: { breakdown: RevenueBreakdown }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 1fr 70px",
          gap: 12,
          color: "#504840",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
          paddingBottom: 10,
          borderBottom: "1px solid #1a1814",
        }}
      >
        <div>Cur.</div>
        <div>Original</div>
        <div>In {breakdown.settlementCurrency}</div>
        <div style={{ textAlign: "right" }}>Count</div>
      </div>
      {breakdown.byCurrency.map((row) => (
        <div
          key={row.currency}
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 1fr 70px",
            gap: 12,
            padding: "10px 0",
            borderBottom: "1px solid #1a1814",
            color: "#a09080",
          }}
        >
          <div style={{ color: "#f0a830", fontWeight: 700 }}>
            {row.currency}
          </div>
          <div>{formatMoney(row.grossOriginal, row.currency)}</div>
          <div>
            {formatMoney(row.grossConverted, breakdown.settlementCurrency)}
          </div>
          <div style={{ textAlign: "right", color: "#706050" }}>
            {row.count}
          </div>
        </div>
      ))}
    </div>
  );
}
