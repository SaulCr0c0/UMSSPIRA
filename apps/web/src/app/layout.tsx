import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

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
  title: "UMSSPIRA",
  description: "Tu comunidad, siempre conectada.",
};

// Viewport explícito: el navegador móvil calcula el ancho real desde el primer
// render y no reajusta el layout al girar el dispositivo (HU #78 / T8).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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