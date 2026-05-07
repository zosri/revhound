"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import RevenueCalculator from "@/components/RevenueCalculator";

/* ──────────────────────────────────────────────
   Scroll-triggered fade-in hook
   ────────────────────────────────────────────── */
function useFadeOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useFadeOnScroll();
  return (
    <div ref={ref} className={`fade-on-scroll ${className}`}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Waterfall data
   ────────────────────────────────────────────── */
const waterfallSteps = [
  { label: "Gross Revenue", amount: "€8.84", pct: 100, color: "var(--muted)" },
  { label: "− VAT (23%)", amount: "−€2.03", pct: 77, color: "var(--danger)" },
  { label: "− Platform Fee (15%)", amount: "−€1.33", pct: 62, color: "var(--danger)" },
  { label: "− FX Loss (~2%)", amount: "−€0.18", pct: 60, color: "var(--danger)" },
  { label: "− Payment Processing", amount: "−€0.29", pct: 56.7, color: "var(--danger)" },
  { label: "Net Revenue", amount: "€5.01", pct: 56.7, color: "var(--accent)" },
];

/* ──────────────────────────────────────────────
   Comparison data
   ────────────────────────────────────────────── */
const comparisons = [
  {
    platform: "Google Play",
    theyShow: "€8.84",
    youActuallyGet: "€5.01",
    details: "15% commission + VAT + FX",
  },
  {
    platform: "App Store",
    theyShow: "€9.99",
    youActuallyGet: "€4.87",
    details: "15-30% commission + VAT + FX",
  },
  {
    platform: "Stripe",
    theyShow: "€49.00",
    youActuallyGet: "€37.12",
    details: "2.9% + €0.25 + VAT + FX",
  },
];

/* ──────────────────────────────────────────────
   Build log entries
   ────────────────────────────────────────────── */
const buildLog = [
  {
    date: "Apr 2026",
    title: "Project kicked off",
    desc: "Naming, branding, landing page. RevHound is born.",
  },
  {
    date: "Apr 2026",
    title: "Waitlist live + custom domain",
    desc: "Waitlist connected to Supabase. revhound.dev is live.",
  },
  {
    date: "Apr 2026",
    title: "First blog post",
    desc: "Your Revenue Dashboard Is Lying to You. The math behind why every platform overstates your earnings.",
  },
  {
    date: "Apr 2026",
    title: "Dashboard demo live",
    desc: "Revenue waterfall, platform breakdown, 6-month trends. Finally see where your money actually goes.",
  },
  {
    date: "Apr 2026",
    title: "Interactive calculator",
    desc: "Enter your real numbers, see the gap between gross and net. Try it on the landing page.",
  },
  {
    date: "Coming",
    title: "Google Play connector",
    desc: "First platform integration. Real data, real numbers.",
  },
  {
    date: "Coming",
    title: "Stripe integration",
    desc: "Connect your Stripe account. Real data, real numbers.",
  },
  {
    date: "Coming",
    title: "Dashboard MVP",
    desc: "See your actual net revenue in one place.",
  },
];

/* ──────────────────────────────────────────────
   Page
   ────────────────────────────────────────────── */
function BuildLog() {
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (innerRef.current) setHeight(innerRef.current.scrollHeight);
    });
    ro.observe(innerRef.current);
    setHeight(innerRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <section style={{ marginBottom: 100 }}>
      <p
        className="font-mono"
        style={{
          fontSize: 14,
          color: "var(--muted)",
          marginBottom: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Build log
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: open ? 32 : 0 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600 }}>Following along</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--accent)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "6px 14px",
            cursor: "pointer",
            transition: "border-color 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{
              transition: "transform 0.3s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="2,4 6,8 10,4" />
          </svg>
          {open ? "Collapse" : "Show all"}
        </button>
      </div>

      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? height : 0,
          transition: "max-height 0.45s ease",
        }}
      >
        <div
          ref={innerRef}
          style={{
            borderLeft: "2px solid var(--border)",
            paddingLeft: 28,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {buildLog.map((entry, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: -35,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: i <= 4 ? "var(--accent)" : "var(--border)",
                  border: `2px solid ${i <= 4 ? "var(--accent)" : "var(--border)"}`,
                }}
              />
              <p
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: i <= 4 ? "var(--accent)" : "var(--muted)",
                  marginBottom: 4,
                }}
              >
                {entry.date}
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                {entry.title}
              </h3>
              <p style={{ fontSize: 15, color: "var(--muted)" }}>
                {entry.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim() });
      if (error) {
        if (error.code === "23505") {
          setSubmitted(true);
        } else {
          alert("Something went wrong. Please try again.");
          console.error(error);
        }
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    }
    setSubmitting(false);
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* ── Nav ── */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 0 64px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 80,
        }}
      >
        <span
          className="font-mono"
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: "var(--accent)",
            letterSpacing: "-0.5px",
          }}
        >
          RevHound
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/calculator"
            className="font-mono"
            style={{
              fontSize: 13,
              color: "var(--text)",
              textDecoration: "none",
              borderBottom: "1px solid var(--accent)",
              paddingBottom: 2,
            }}
          >
            Calculator →
          </Link>
          <span
            className="font-mono"
            style={{ fontSize: 12, color: "var(--muted)" }}
          >
            building in public
          </span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="fade-section" style={{ marginBottom: 80 }}>
        <p
          style={{
            fontSize: 14,
            color: "var(--muted)",
            marginBottom: 24,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
          className="font-mono"
        >
          The problem
        </p>
        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.15,
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          You think you&apos;re making{" "}
          <span style={{ color: "var(--muted)", textDecoration: "line-through" }}>
            €8.84
          </span>
          .
          <br />
          You&apos;re making{" "}
          <span style={{ color: "var(--accent)" }}>€5.01</span>.
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "var(--muted)",
            maxWidth: 560,
            lineHeight: 1.7,
          }}
        >
          Platform fees, VAT, FX losses, payment processing — they all eat into
          your revenue. RevHound shows you what you actually keep.
        </p>
      </section>

      {/* ── Calculator ── */}
      <FadeSection>
        <div style={{ marginBottom: 40 }}>
          <RevenueCalculator />
        </div>
      </FadeSection>

      {/* ── Handoff to real calculator ── */}
      <FadeSection>
        <div
          style={{
            marginBottom: 100,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Link
            href="/calculator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--accent)",
              borderRadius: 8,
              padding: "16px 22px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-card-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Have real Stripe data?
            </span>
            <span
              style={{
                fontSize: 15,
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              Drop your CSV →
            </span>
          </Link>
        </div>
      </FadeSection>

      {/* ── Waitlist ── */}
      <FadeSection>
        <section
          id="waitlist"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "40px 32px",
            marginBottom: 100,
          }}
        >
          {!submitted ? (
            <>
              <p
                className="font-mono"
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                First 100 signups → lifetime free Indie plan (€9/mo value)
              </p>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Get early access
              </h2>
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-mono"
                  style={{
                    flex: "1 1 240px",
                    padding: "14px 16px",
                    fontSize: 15,
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "14px 28px",
                    fontSize: 15,
                    fontWeight: 600,
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "opacity 0.2s",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Sending..." : "Get early access"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                You&apos;re in. 🎉
              </p>
              <p style={{ color: "var(--muted)" }}>
                We&apos;ll email you when RevHound is ready.
              </p>
            </div>
          )}
        </section>
      </FadeSection>

      {/* ── Revenue Waterfall ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Where your money goes
          </p>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 40,
            }}
          >
            The revenue waterfall nobody shows you
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {waterfallSteps.map((step, i) => (
              <WaterfallRow key={i} step={step} index={i} />
            ))}
          </div>

          <p
            className="font-mono"
            style={{
              marginTop: 24,
              fontSize: 14,
              color: "var(--muted)",
              textAlign: "right",
            }}
          >
            You keep{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              56.7%
            </span>{" "}
            of what you thought you earned
          </p>
        </section>
      </FadeSection>

      {/* ── Comparison ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            The gap
          </p>
          <h2
            style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}
          >
            What they show you vs. what you keep
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {comparisons.map((c) => (
              <div
                key={c.platform}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "24px 28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div>
                  <p
                    className="font-mono"
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 4,
                    }}
                  >
                    {c.platform}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted)", opacity: 0.6 }}>
                    {c.details}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 32,
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 2,
                      }}
                    >
                      They show
                    </p>
                    <p
                      className="font-mono"
                      style={{
                        fontSize: 20,
                        color: "var(--muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      {c.theyShow}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 1,
                      height: 36,
                      background: "var(--border)",
                    }}
                  />
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 2,
                      }}
                    >
                      RevHound
                    </p>
                    <p
                      className="font-mono"
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {c.youActuallyGet}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Personas ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Built for
          </p>
          <h2
            style={{ fontSize: 28, fontWeight: 600, marginBottom: 40 }}
          >
            Your platform. Your real numbers.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                label: "Indie iOS & Android devs",
                pain: "Apple and Google show you gross sales. They don\u2019t subtract their 15\u201330% cut, the VAT they withhold per country, or the FX loss when they convert to your currency. You see \u20AC8.84 per sale \u2014 you keep \u20AC5.01.",
                accent: "var(--accent)",
              },
              {
                label: "Shopify & e-commerce sellers",
                pain: "Shopify Payments takes 2.9% + \u20AC0.30 per transaction. Add currency conversion on international orders, refund losses, and app subscription fees \u2014 your \u201Cprofit\u201D margin is thinner than you think.",
                accent: "var(--accent)",
              },
              {
                label: "SaaS founders selling internationally",
                pain: "Stripe\u2019s dashboard shows MRR. It doesn\u2019t show the 2.9% + per-transaction fee, the extra 1% for international cards, VAT you owe in 27 EU countries, or the FX spread on non-EUR payments.",
                accent: "var(--accent)",
              },
            ].map((persona) => (
              <div
                key={persona.label}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "28px 28px",
                  transition: "border-color 0.2s",
                }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: persona.accent,
                    marginBottom: 10,
                  }}
                >
                  {persona.label}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {persona.pain}
                </p>
              </div>
            ))}
          </div>

          <p
            className="font-mono"
            style={{
              marginTop: 24,
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            One dashboard for all of them. €9/month.
          </p>
        </section>
      </FadeSection>

      {/* ── Detailed Breakdown ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            The full picture
          </p>
          <h2
            style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}
          >
            €10,000 in sales. €6,847 in your bank.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--muted)",
              marginBottom: 40,
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            A real example: SaaS founder, Stripe, international customers,
            EU VAT registered. Here&apos;s where the money goes.
          </p>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {/* Starting amount */}
            <div
              style={{
                padding: "20px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Gross revenue
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 18, fontWeight: 700 }}
              >
                €10,000.00
              </span>
            </div>

            {/* Deductions */}
            {[
              {
                label: "VAT collected (avg 21%)",
                note: "You never had this money — it\u2019s the tax office\u2019s",
                amount: "\u2212€1,736.00",
              },
              {
                label: "Stripe processing (2.9% + €0.25)",
                note: "On the full €10k, before VAT is removed",
                amount: "\u2212€540.00",
              },
              {
                label: "International card surcharge (+1%)",
                note: "~60% of your customers pay from outside your country",
                amount: "\u2212€60.00",
              },
              {
                label: "Currency conversion (1.5% spread)",
                note: "GBP, USD, PLN → EUR at Stripe\u2019s rate, not the market rate",
                amount: "\u2212€87.00",
              },
              {
                label: "Refunds & chargebacks (3%)",
                note: "Plus you lose the original processing fee too",
                amount: "\u2212€300.00",
              },
              {
                label: "Disputed chargebacks (€15 × 4)",
                note: "Stripe charges €15 per dispute, win or lose",
                amount: "\u2212€60.00",
              },
              {
                label: "Failed payment retries",
                note: "Declined cards that eventually churn — lost revenue",
                amount: "\u2212€370.00",
              },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: "var(--text)" }}>
                    {row.label}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {row.note}
                  </p>
                </div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 15,
                    color: "var(--danger)",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {row.amount}
                </span>
              </div>
            ))}

            {/* Net result */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(240, 168, 48, 0.06)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  What you actually keep
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  68.5% of gross — 31.5% disappeared
                </p>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                €6,847.00
              </span>
            </div>
          </div>

          <p
            className="font-mono"
            style={{
              marginTop: 20,
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Your Stripe dashboard said €10,000. Your bank got €6,847.
            <br />
            RevHound shows you why.
          </p>
        </section>
      </FadeSection>

      {/* ── How it works ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            How it works
          </p>
          <h2
            style={{ fontSize: 28, fontWeight: 600, marginBottom: 40 }}
          >
            Three steps. Real numbers.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[
              {
                n: "01",
                title: "Plug in your platforms",
                desc: "Connect Google Play, App Store, Stripe, or any other revenue source. Takes about 2 minutes.",
              },
              {
                n: "02",
                title: "We do the math",
                desc: "RevHound calculates VAT by country, platform commissions, FX conversion losses, and payment processing fees. The stuff you'd do in a spreadsheet at 2am.",
              },
              {
                n: "03",
                title: "See your real number",
                desc: "One dashboard. Actual net revenue. Per transaction, per platform, per time period. No surprises.",
              },
            ].map((step) => (
              <div
                key={step.n}
                style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--border)",
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 50,
                  }}
                >
                  {step.n}
                </span>
                <div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 16 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Pricing ── */}
      <FadeSection>
        <section
          style={{
            marginBottom: 100,
            textAlign: "center",
            padding: "60px 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 16,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Pricing
          </p>
          <h2 style={{ fontSize: 44, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: "var(--accent)" }}>€9</span>/month
          </h2>
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            That&apos;s it.
          </p>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 16,
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Flat fee. No percentage of your revenue. No tiers. No &quot;contact
            sales&quot;. You pay €9, you get everything.
          </p>
          <p
            className="font-mono"
            style={{
              marginTop: 24,
              fontSize: 14,
              color: "var(--accent)",
            }}
          >
            0% revenue share — always
          </p>
        </section>
      </FadeSection>

      {/* ── Open Source ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Open Source
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
            Built in the open
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 17,
              marginBottom: 20,
              lineHeight: 1.8,
            }}
          >
            RevHound is AGPL open source. You can read every line of code,
            self-host it, or contribute. The paid plan is for people who want it
            hosted and maintained.
          </p>
          <a
            href="https://github.com/zosri/revhound"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text)",
              fontSize: 14,
              textDecoration: "none",
              padding: "10px 20px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </section>
      </FadeSection>

      {/* ── Build Log ── */}
      <FadeSection>
        <BuildLog />
      </FadeSection>

      {/* ── Blog preview ── */}
      <FadeSection>
        <section style={{ marginBottom: 100 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Blog
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}>
            Latest
          </h2>

          <a
            href="/blog/why-im-building-revhound"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "28px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <p
                className="font-mono"
                style={{ fontSize: 12, color: "var(--accent)", marginBottom: 8 }}
              >
                behind the build · 4 min read
              </p>
              <h3 style={{ fontSize: 20, fontWeight: 600 }}>
                Your Revenue Dashboard Is Lying to You
              </h3>
              <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15 }}>
                Every platform shows gross revenue. None show what you actually
                keep. That&apos;s why I&apos;m building RevHound.
              </p>
            </div>
          </a>

          <a
            href="/blog"
            className="font-mono"
            style={{
              display: "inline-block",
              marginTop: 16,
              fontSize: 14,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            All posts →
          </a>
        </section>
      </FadeSection>

      {/* ── Bottom CTA ── */}
      <FadeSection>
        <section
          style={{
            textAlign: "center",
            padding: "60px 0",
            marginBottom: 60,
            borderTop: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Know your real number.
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 17,
              marginBottom: 32,
              maxWidth: 460,
              margin: "0 auto 32px",
            }}
          >
            Join the waitlist. First 100 signups get the Indie plan free —
            forever.
          </p>
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-mono"
                style={{
                  padding: "14px 16px",
                  fontSize: 15,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text)",
                  width: 260,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  background: "var(--accent)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "opacity 0.2s",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                Get early access
              </button>
            </form>
          ) : (
            <p
              className="font-mono"
              style={{ color: "var(--accent)", fontSize: 16 }}
            >
              ✓ You&apos;re on the list
            </p>
          )}
        </section>
      </FadeSection>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 0 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: 13, color: "var(--muted)" }}
        >
          © 2026 RevHound
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          <a
            href="https://github.com/zosri/revhound"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: 13,
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            GitHub
          </a>
          <a
            href="https://x.com/RevHoundApp"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: 13,
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            X/Twitter
          </a>
          <a
            href="mailto:revhound@revhound.dev"
            className="font-mono"
            style={{
              fontSize: 13,
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}

/* ──────────────────────────────────────────────
   Waterfall Row component
   ────────────────────────────────────────────── */
function WaterfallRow({
  step,
  index,
}: {
  step: (typeof waterfallSteps)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimate(true), index * 120);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const isLast = index === waterfallSteps.length - 1;

  return (
    <div ref={ref}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: isLast ? "var(--accent)" : "var(--muted)",
            fontWeight: isLast ? 700 : 400,
          }}
        >
          {step.label}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isLast ? "var(--accent)" : step.color,
          }}
        >
          {step.amount}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "var(--bg-card)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: animate ? `${step.pct}%` : "0%",
            background: step.color,
            borderRadius: 4,
            transition: `width 0.8s ease-out ${index * 0.12}s`,
            opacity: isLast ? 1 : 0.5,
          }}
        />
      </div>
    </div>
  );
}