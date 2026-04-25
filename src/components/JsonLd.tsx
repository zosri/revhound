export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RevHound",
    url: "https://revhound.dev",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Net revenue dashboard for indie developers. See what you actually earn after platform fees, VAT, FX losses, and chargebacks — across Stripe, App Store, Google Play, and Shopify.",
    offers: {
      "@type": "Offer",
      price: "9.00",
      priceCurrency: "EUR",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/PreOrder",
    },
    creator: {
      "@type": "Organization",
      name: "RevHound",
      url: "https://revhound.dev",
    },
    featureList: [
      "Cross-platform net revenue tracking",
      "Stripe integration",
      "App Store integration",
      "Google Play integration",
      "Shopify integration",
      "VAT deduction tracking",
      "FX conversion cost tracking",
      "Revenue waterfall visualization",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
