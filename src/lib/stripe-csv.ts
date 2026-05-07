// ─────────────────────────────────────────────────────────────
// Stripe CSV parser
// Handles the standard "Payments" export from the Stripe Dashboard.
// ─────────────────────────────────────────────────────────────

import Papa, { ParseResult } from "papaparse";

// ── Types ────────────────────────────────────────────────────

export type StripeTransaction = {
  id: string;
  createdAt: Date;
  status: string;
  // Original currency (what the customer paid)
  amount: number;
  currency: string;
  amountRefunded: number;
  // Settlement currency (what landed in your Stripe balance)
  convertedAmount: number;
  convertedCurrency: string;
  convertedAmountRefunded: number;
  fee: number;
  // True if currency conversion happened
  hasFx: boolean;
};

export type ParseError = {
  kind: "not_stripe_csv" | "empty" | "no_valid_rows" | "parse_error";
  message: string;
};

export type ParseSuccess = {
  transactions: StripeTransaction[];
  skippedRows: number;
};

export type ParseOutcome =
  | { ok: true; data: ParseSuccess }
  | { ok: false; error: ParseError };

// ── Column resolution ────────────────────────────────────────
// Stripe exports vary slightly by date / region / Tax-enabled status.
// We accept a few aliases per field to be resilient.

const COLUMN_ALIASES: Record<keyof RawStripeRow, string[]> = {
  id: ["id", "ID"],
  created: ["Created (UTC)", "created_utc", "Created", "created"],
  amount: ["Amount", "amount"],
  amountRefunded: ["Amount Refunded", "amount_refunded"],
  currency: ["Currency", "currency"],
  convertedAmount: ["Converted Amount", "converted_amount"],
  convertedAmountRefunded: [
    "Converted Amount Refunded",
    "converted_amount_refunded",
  ],
  convertedCurrency: ["Converted Currency", "converted_currency"],
  fee: ["Fee", "fee"],
  status: ["Status", "status"],
  captured: ["Captured", "captured"],
};

type RawStripeRow = {
  id: string;
  created: string;
  amount: string;
  amountRefunded: string;
  currency: string;
  convertedAmount: string;
  convertedAmountRefunded: string;
  convertedCurrency: string;
  fee: string;
  status: string;
  captured: string;
};

/**
 * Find the actual header name in the CSV that matches one of our aliases.
 * Returns null if none of the aliases were present.
 */
function resolveColumn(headers: string[], aliases: string[]): string | null {
  const lowered = headers.map((h) => h.trim().toLowerCase());
  for (const alias of aliases) {
    const idx = lowered.indexOf(alias.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

// ── Number / currency parsing ────────────────────────────────

/**
 * Stripe exports amounts as decimal strings in the major unit
 * (e.g. "12.50" not "1250"). Coerce safely to number.
 */
function num(value: string | undefined | null): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ── Main parser ──────────────────────────────────────────────

/**
 * Parse a user-uploaded Stripe CSV export into structured transactions.
 * Resolves with `ok: false` for any expected failure (wrong file, bad rows,
 * etc.) — never throws on bad input.
 */
export function parseStripeCsv(file: File): Promise<ParseOutcome> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<Record<string, string>>) => {
        try {
          resolve(processParseResults(results));
        } catch (err) {
          resolve({
            ok: false,
            error: {
              kind: "parse_error",
              message: err instanceof Error ? err.message : "Unknown error",
            },
          });
        }
      },
      error: (err) => {
        resolve({
          ok: false,
          error: { kind: "parse_error", message: err.message },
        });
      },
    });
  });
}

function processParseResults(
  results: ParseResult<Record<string, string>>,
): ParseOutcome {
  const headers = results.meta.fields ?? [];
  const rows = results.data;

  if (rows.length === 0) {
    return {
      ok: false,
      error: { kind: "empty", message: "The CSV is empty." },
    };
  }

  // Resolve every column we care about. If the critical ones are missing,
  // this isn't a Stripe Payments export.
  const cols = {} as Record<keyof RawStripeRow, string | null>;
  for (const key of Object.keys(COLUMN_ALIASES) as (keyof RawStripeRow)[]) {
    cols[key] = resolveColumn(headers, COLUMN_ALIASES[key]);
  }

  const required: (keyof RawStripeRow)[] = [
    "amount",
    "fee",
    "created",
    "currency",
  ];
  const missing = required.filter((k) => cols[k] === null);
  if (missing.length > 0) {
    return {
      ok: false,
      error: {
        kind: "not_stripe_csv",
        message:
          "This doesn't look like a Stripe Payments export. " +
          `Missing columns: ${missing.join(", ")}.`,
      },
    };
  }

  const transactions: StripeTransaction[] = [];
  let skipped = 0;

  for (const row of rows) {
    // Filter out failed / pending / un-captured charges — they didn't
    // result in money moving.
    const status = (cols.status ? row[cols.status] : "").trim().toLowerCase();
    const captured = (cols.captured ? row[cols.captured] : "")
      .trim()
      .toLowerCase();

    const isPaid =
      status === "paid" || status === "succeeded" || status === "refunded";
    const isCaptured = captured === "" || captured === "true";

    if (!isPaid || !isCaptured) {
      skipped++;
      continue;
    }

    const id = cols.id ? row[cols.id] : "";
    const createdRaw = row[cols.created!];
    const createdAt = new Date(createdRaw);
    if (Number.isNaN(createdAt.getTime())) {
      skipped++;
      continue;
    }

    const amount = num(row[cols.amount!]);
    const fee = num(row[cols.fee!]);
    const amountRefunded = num(
      cols.amountRefunded ? row[cols.amountRefunded] : "0",
    );
    const currency = (row[cols.currency!] || "").toUpperCase();

    // Converted columns are absent for single-currency accounts.
    const convertedAmount = cols.convertedAmount
      ? num(row[cols.convertedAmount])
      : amount;
    const convertedAmountRefunded = cols.convertedAmountRefunded
      ? num(row[cols.convertedAmountRefunded])
      : amountRefunded;
    const convertedCurrency = cols.convertedCurrency
      ? (row[cols.convertedCurrency] || currency).toUpperCase()
      : currency;

    transactions.push({
      id,
      createdAt,
      status,
      amount,
      currency,
      amountRefunded,
      convertedAmount,
      convertedCurrency,
      convertedAmountRefunded,
      fee,
      hasFx: currency !== convertedCurrency,
    });
  }

  if (transactions.length === 0) {
    return {
      ok: false,
      error: {
        kind: "no_valid_rows",
        message:
          "Found rows but none were captured / paid charges. " +
          "Make sure you exported the Payments report from Stripe Dashboard.",
      },
    };
  }

  return { ok: true, data: { transactions, skippedRows: skipped } };
}

// ── Sample data (for users without their own export) ─────────
// Realistic mix: EUR card payments, a few cross-currency, one refund.

export function getSampleTransactions(): StripeTransaction[] {
  const base = new Date("2026-04-01T10:00:00Z").getTime();
  const day = 24 * 60 * 60 * 1000;

  // Helper to keep the list readable below.
  const tx = (
    daysOffset: number,
    amount: number,
    currency: string,
    convertedAmount: number,
    fee: number,
    refunded = 0,
    refundedConverted = 0,
  ): StripeTransaction => ({
    id: `ch_sample_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date(base + daysOffset * day),
    status: refunded > 0 ? "refunded" : "paid",
    amount,
    currency,
    amountRefunded: refunded,
    convertedAmount,
    convertedCurrency: "EUR",
    convertedAmountRefunded: refundedConverted,
    fee,
    hasFx: currency !== "EUR",
  });

  return [
    // EUR domestic payments (no FX)
    tx(0, 29.0, "EUR", 29.0, 1.14),
    tx(0, 49.0, "EUR", 49.0, 1.72),
    tx(1, 9.0, "EUR", 9.0, 0.56),
    tx(2, 99.0, "EUR", 99.0, 3.17),
    tx(3, 29.0, "EUR", 29.0, 1.14),
    tx(4, 9.0, "EUR", 9.0, 0.56),
    tx(5, 49.0, "EUR", 49.0, 1.72),
    tx(7, 199.0, "EUR", 199.0, 6.07),
    tx(8, 29.0, "EUR", 29.0, 1.14),
    tx(9, 9.0, "EUR", 9.0, 0.56),
    tx(10, 49.0, "EUR", 49.0, 1.72),
    // USD payments (FX 1%)
    tx(2, 39.0, "USD", 35.21, 1.32),
    tx(4, 99.0, "USD", 89.41, 2.91),
    tx(6, 29.0, "USD", 26.18, 1.06),
    tx(11, 79.0, "USD", 71.32, 2.37),
    tx(13, 29.0, "USD", 26.18, 1.06),
    // GBP payments (FX 1%)
    tx(3, 25.0, "GBP", 28.75, 1.13),
    tx(8, 49.0, "GBP", 56.35, 1.93),
    tx(15, 25.0, "GBP", 28.75, 1.13),
    // EUR continued
    tx(16, 99.0, "EUR", 99.0, 3.17),
    tx(18, 29.0, "EUR", 29.0, 1.14),
    tx(19, 49.0, "EUR", 49.0, 1.72),
    tx(20, 9.0, "EUR", 9.0, 0.56),
    tx(22, 199.0, "EUR", 199.0, 6.07),
    tx(24, 29.0, "EUR", 29.0, 1.14),
    tx(25, 49.0, "EUR", 49.0, 1.72),
    tx(27, 9.0, "EUR", 9.0, 0.56),
    tx(28, 99.0, "EUR", 99.0, 3.17),
    tx(29, 29.0, "EUR", 29.0, 1.14),
    // One full refund — fee not refunded (worst case)
    tx(12, 49.0, "EUR", 49.0, 1.72, 49.0, 49.0),
  ];
}
