import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reko — Every sale, accounted for.",
  description: "Sales, stock, and staff — one simple dashboard for your shop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
