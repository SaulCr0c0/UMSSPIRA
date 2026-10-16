import React from "react";
import { ConnectedNavbar } from "@/shared/components/navbar/index";

// Una sola navegación global para todas las pantallas del dashboard (navbar compartida, E8.1):
// adapta sus opciones a la sesión y al rol devueltos por la API
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <ConnectedNavbar />
      {children}
    </div>
  );
}
