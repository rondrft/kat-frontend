import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <iframe
      src="/privacy.pdf"
      className="fixed inset-0 h-full w-full border-0"
      title="Privacy Policy"
    />
  );
}
