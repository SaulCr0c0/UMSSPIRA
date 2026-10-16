"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/shared/components/navbar";

// Encabezado único del portal. La vista institucional monta su propia barra pública
// (PublicNavbar), así que aquí no se monta otra para evitar la doble cabecera.
export function PortalSiteHeader() {
  const pathname = usePathname() ?? "";
  if (pathname.replace(/\/$/, "") === "/portal/institucional") return null;
  return <Navbar />;
}
