import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignite Health",
  description: "Ignite Health web portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
