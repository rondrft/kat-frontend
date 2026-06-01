import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TermsOfServiceContent } from "@/content/legal/terms-of-service";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name} Discord bot and dashboard.`,
};

const LAST_UPDATED = "May 28, 2026";

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <TermsOfServiceContent />
    </LegalPageShell>
  );
}
