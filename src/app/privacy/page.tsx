import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { PrivacyPolicyContent } from "@/content/legal/privacy-policy";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name} Discord bot and dashboard.`,
};

const LAST_UPDATED = "May 28, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <PrivacyPolicyContent />
    </LegalPageShell>
  );
}
