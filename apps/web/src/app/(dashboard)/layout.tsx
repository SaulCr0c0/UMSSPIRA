import React from 'react';
import { AuthGuard } from '@/shared/components/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="dashboard-container">{children}</div>
    </AuthGuard>
  );
}