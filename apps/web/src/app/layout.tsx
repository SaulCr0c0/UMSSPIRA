import type { Metadata } from "next";
import "./globals.css";
import "../shared/identidad/tokens.css";
import ServiceWorkerRegister from "./service-worker-register";
import { SiteHeader } from "@/shared/components/site-header";
import { SiteFooter } from "@/shared/components/site-footer";
import { BRAND } from "../shared/identidad/brand";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/icons/icon-192.png",
    apple: "/brand/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <ServiceWorkerRegister />
        <SiteHeader />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
