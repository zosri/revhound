---
title: "Your Revenue Dashboard Is Lying to You"
date: "2026-04-19"
description: "Every platform shows gross revenue. None show what you actually keep. That's why I'm building RevHound."
tag: "behind the build"
readTime: "4 min read"
---

You made €8.84 on Google Play today. At least, that's what the dashboard says.

But that number isn't real.

After VAT, platform commission, currency conversion, and payment processing fees, what actually lands in your bank account is closer to €5.01. That's 43% less than what the dashboard told you.

And if you sell across multiple platforms — Stripe, App Store, Google Play, Shopify — each one has its own fee structure, its own VAT logic, its own FX rules. None of them show you the full picture. You're left stitching together spreadsheets at the end of every month trying to answer one simple question:

**What did I actually make?**

## The gap nobody's filling

I went looking for a tool that does this. Here's what I found:

**Baremetrics, ChartMogul, ProfitWell** — they're great at subscription analytics. MRR, churn, LTV. But they focus on growth metrics, not on what you keep after deductions. And they start at $100+/month.

**RevenueCat** — built for mobile subscriptions specifically. Doesn't cover Stripe or Shopify. Doesn't do VAT or FX breakdowns.

**Spreadsheets** — the default solution for most indie developers. Manual, error-prone, and nobody enjoys maintaining them.

There's a gap. Developers selling across platforms need a simple, affordable way to see their real net revenue. Not gross. Not estimated. The actual number after everything is deducted.

## What RevHound does

RevHound connects to your platforms — Stripe, App Store, Google Play, Shopify — and shows your real net revenue after:

- Platform commissions (15–30%)
- VAT / sales tax
- Currency conversion losses
- Payment processing fees

One dashboard. Real numbers. No guessing.

## Why I'm building it

I'll be honest: I'm not scratching my own itch here. I spotted this gap while researching the developer tools space and couldn't believe nobody had built an affordable solution for it.

Every indie developer forum I've read, the same complaints come up — "I have no idea what I actually made this month." That felt like a problem worth solving.

## The details

- **Price:** €9/month flat. No percentage of revenue. No tiers based on transaction volume.
- **Open source:** Licensed under AGPL. The code is on [GitHub](https://github.com/zosri/revhound).
- **Stack:** Next.js, Supabase, deployed on Vercel.
- **Building in public:** I'll be sharing progress, decisions, and numbers as I go.

## What's next

Right now the landing page is live and the waitlist is open. I'm working toward an MVP that connects to Stripe first, then expanding to other platforms.

If you sell across multiple platforms and this resonates — I'd genuinely like to hear how you're handling revenue tracking today. Sign up for the waitlist or reach out on [X](https://x.com/RevHoundApp).

And if it doesn't resonate — that's useful information too. I'd rather find out now than after six months of building.

---

*This is post #1 of building RevHound in public. More soon.*