import type { Metadata } from "next";
import "./globals.css";
import "../shared/identidad/tokens.css";
import ServiceWorkerRegister from "./service-worker-register";
import { SiteHeader } from "@/shared/components/site-header";
import { SiteFooter } from "@/shared/components/site-footer";

export const metadata: Metadata = {
  title: "UMSSPIRA",
  description: "Plataforma UMSSPIRA",
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
