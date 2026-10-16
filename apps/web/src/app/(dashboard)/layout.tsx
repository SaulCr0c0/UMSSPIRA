import React from "react";
import { ConnectedNavbar } from "@/shared/components/navbar/index";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container min-h-screen bg-palladian text-abyssal-blue font-sans flex flex-col justify-between">
      <ConnectedNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}