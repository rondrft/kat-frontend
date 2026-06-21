import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Dashboard - Kat" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
