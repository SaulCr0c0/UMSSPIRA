import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "../shared/identidad/tokens.css";
import { BRAND } from "../shared/identidad/brand";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  icons: {
    icon: "/brand/icons/icon-192.png?v=2",
    apple: "/brand/icons/icon-192.png?v=2",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="font-sans bg-palladian text-abyssal-blue antialiased">
        {children}
      </body>
    </html>
  );
}
