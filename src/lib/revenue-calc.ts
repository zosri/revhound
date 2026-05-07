// ─────────────────────────────────────────────────────────────
// Revenue calculation engine
// Takes parsed Stripe transactions and produces the breakdown
// shown to the user (gross, fees, FX loss, refunds, net).
// ─────────────────────────────────────────────────────────────

import type { StripeTransaction } from "./stripe-csv";

export type CurrencyBreakdown = {
  currency: string;
  count: number;
  grossOriginal: number;   // sum in the original currency
  grossConverted: number;  // sum in the settlement currency
};

export type RevenueBreakdown = {
  // Counts
  transactionCount: number;
  refundCount: number;

  // Date range covered by the data
  dateRange: { from: Date; to: Date };

  // Settlement currency (the one your Stripe balance settles in)
  settlementCurrency: string;
  // True if more than one settlement currency appeared — we still
  // sum naively but flag it so the user knows the number is approximate.
  multipleSettlementCurrencies: boolean;

  // The waterfall, all in settlement currency
  gross: number;            // total converted amount of paid charges
  fees: number;             // Stripe processing fees
  refunds: number;          // money returned to customers
  fxLoss: number;           // implied FX cost (vs. mid-market estimate)
  net: number;              // gross − fees − refunds − fxLoss (best estimate)

  // Helpful slices
  byCurrency: CurrencyBreakdown[];
  fxTransactionCount: number;
};

// Stripe charges roughly 1% above mid-market on currency conversion in
// most regions. We use this to ESTIMATE FX cost — the CSV doesn't expose
// the spread directly. Surfaced to the user as "estimated FX loss".
const STRIPE_FX_SPREAD = 0.01;

export function calculateRevenue(
  transactions: StripeTransaction[],
): RevenueBreakdown {
  if (transactions.length === 0) {
    return emptyBreakdown();
  }

  let gross = 0;
  let fees = 0;
  let refunds = 0;
  let fxLoss = 0;
  let refundCount = 0;
  let fxTransactionCount = 0;

  let from = transactions[0].createdAt;
  let to = transactions[0].createdAt;

  const settlementCurrencies = new Set<string>();
  const byCurrency = new Map<string, CurrencyBreakdown>();

  for (const t of transactions) {
    if (t.createdAt < from) from = t.createdAt;
    if (t.createdAt > to) to = t.createdAt;

    settlementCurrencies.add(t.convertedCurrency);

    gross += t.convertedAmount;
    fees += t.fee;
    refunds += t.convertedAmountRefunded;

    if (t.convertedAmountRefunded > 0) refundCount++;

    if (t.hasFx) {
      fxTransactionCount++;
      // Estimate: Stripe's spread on the converted (post-conversion) amount.
      // Conservative — actual spread is applied to the gross before it lands.
      fxLoss += t.convertedAmount * STRIPE_FX_SPREAD;
    }

    const bucket = byCurrency.get(t.currency) ?? {
      currency: t.currency,
      count: 0,
      grossOriginal: 0,
      grossConverted: 0,
    };
    bucket.count++;
    bucket.grossOriginal += t.amount;
    bucket.grossConverted += t.convertedAmount;
    byCurrency.set(t.currency, bucket);
  }

  // Most common settlement currency wins the headline label.
  const settlementCurrency =
    [...settlementCurrencies][0] ?? transactions[0].convertedCurrency;

  return {
    transactionCount: transactions.length,
    refundCount,
    dateRange: { from, to },
    settlementCurrency,
    multipleSettlementCurrencies: settlementCurrencies.size > 1,
    gross: round2(gross),
    fees: round2(fees),
    refunds: round2(refunds),
    fxLoss: round2(fxLoss),
    net: round2(gross - fees - refunds - fxLoss),
    byCurrency: [...byCurrency.values()].sort(
      (a, b) => b.grossConverted - a.grossConverted,
    ),
    fxTransactionCount,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function emptyBreakdown(): RevenueBreakdown {
  const now = new Date();
  return {
    transactionCount: 0,
    refundCount: 0,
    dateRange: { from: now, to: now },
    settlementCurrency: "EUR",
    multipleSettlementCurrencies: false,
    gross: 0,
    fees: 0,
    refunds: 0,
    fxLoss: 0,
    net: 0,
    byCurrency: [],
    fxTransactionCount: 0,
  };
}

// ── Formatting helpers used by the UI ────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  JPY: "¥",
  CHF: "CHF ",
  AUD: "A$",
  CAD: "C$",
};

export function formatMoney(
  amount: number,
  currency: string,
  opts: { decimals?: number } = {},
): string {
  const decimals = opts.decimals ?? 2;
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const value = Math.abs(amount).toLocaleString("en", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${amount < 0 ? "−" : ""}${symbol}${value}`;
}

export function formatDateRange(range: { from: Date; to: Date }): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const fromStr = range.from.toLocaleDateString("en", opts);
  const toStr = range.to.toLocaleDateString("en", opts);
  return fromStr === toStr ? fromStr : `${fromStr} → ${toStr}`;
}
