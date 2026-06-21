"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 6000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md text-center"
      >
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Crown className="h-3.5 w-3.5" />
          Premium Activated
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to Premium!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Your payment was confirmed. All Premium features are now active on your server.
          You will be redirected to your dashboard in a few seconds.
        </p>

        <div className="mt-8">
          <Button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-gradient-to-r from-kat to-cyan-500 px-8 py-5 text-base font-bold text-white shadow-lg shadow-kat/25 hover:shadow-xl hover:shadow-kat/30"
          >
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
