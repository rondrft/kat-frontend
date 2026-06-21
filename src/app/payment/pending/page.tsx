"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentPendingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md text-center"
      >
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Payment Pending
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Your payment is being processed. Once confirmed, Premium will activate automatically on your server — no action needed from you.
        </p>

        <div className="mt-8">
          <Button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-gradient-to-r from-kat to-cyan-500 px-8 py-5 text-base font-bold text-white shadow-lg shadow-kat/25"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
