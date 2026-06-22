import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return (
    <iframe
      src="/refund.pdf"
      className="fixed inset-0 h-full w-full border-0"
      title="Refund Policy"
    />
  );
}
