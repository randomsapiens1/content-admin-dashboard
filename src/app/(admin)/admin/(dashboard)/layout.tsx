import type { ReactNode } from "react";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { collections } from "@/collections";
import { branding } from "@/lib/branding";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <SidebarNav collections={collections} siteName={branding.siteName} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
