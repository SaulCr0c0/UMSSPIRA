import React from "react";
import { cookies } from "next/headers";
import { AdminNavbar } from "@/shared/components/admin-navbar";
import { LogoutButton } from "../../modules/auth/frontend/components/logout-button";
import { TituladoHeader } from "../../modules/auth/frontend/components/titulado-header";
import { ROLE_COOKIE } from "../../modules/auth/frontend/services/route-access";
import { RevalidateOnPageShow } from "../../modules/auth/frontend/components/revalidate-on-pageshow";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = cookies().get(ROLE_COOKIE)?.value;

  return (
    <div className="dashboard-container">
      <RevalidateOnPageShow />
      {role === "titulado" ? (
        <TituladoHeader />
      ) : (
        <AdminNavbar logoutSlot={role ? <LogoutButton /> : undefined} />
      )}
      {children}
    </div>
  );
}