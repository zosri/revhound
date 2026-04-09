import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevHound — Real Net Revenue for Indie Developers",
  description:
    "Stop guessing your real earnings. RevHound calculates your actual net revenue after VAT, platform fees, and FX losses. €9/month. That's it.",
  openGraph: {
    title: "RevHound — Real Net Revenue for Indie Developers",
    description:
      "Stop guessing your real earnings. RevHound calculates your actual net revenue after VAT, platform fees, and FX losses.",
    url: "https://revhound.dev",
    siteName: "RevHound",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RevHound — Real Net Revenue for Indie Developers",
    description:
      "Stop guessing your real earnings. RevHound calculates your actual net revenue after VAT, platform fees, and FX losses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
