import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenMart | Natural. Pure. You.",
  description: "Discover organic and eco-friendly products for a better and healthier life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
