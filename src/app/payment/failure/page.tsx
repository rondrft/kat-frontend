"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailurePage() {
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
          <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Payment not completed
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Something went wrong with your payment. No charge was made. You can try again or contact support if the problem persists.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-gradient-to-r from-kat to-cyan-500 px-8 py-5 text-base font-bold text-white shadow-lg shadow-kat/25 sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl px-8 py-5 text-base sm:w-auto"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
