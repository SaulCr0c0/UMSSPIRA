import React from "react";
import { cookies } from "next/headers";
import { AdminNavbar } from "@/shared/components/admin-navbar";
import { LogoutButton } from "../../modules/auth/frontend/components/logout-button";
import { TituladoHeader } from "../../modules/auth/frontend/components/titulado-header";
import { ROLE_COOKIE } from "../../modules/auth/frontend/services/route-access";

// AQUÍ IMPORTAMOS EL NUEVO NAVBAR CONECTADO DE DEVOPS
import { ConnectedNavbar } from "@/shared/components/navbar/index";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = cookies().get(ROLE_COOKIE)?.value;

  return (
    <div className="dashboard-container">
      {role === "titulado" ? (
        <TituladoHeader />
      ) : role === "empresa" ? (
        /* SI EL ROL ES EMPRESA, USAMOS EL NUEVO COMPONENTE SIN PROPS */
        <ConnectedNavbar />
      ) : (
        <AdminNavbar logoutSlot={role ? <LogoutButton /> : undefined} />
      )}
      {children}
    </div>
  );
}