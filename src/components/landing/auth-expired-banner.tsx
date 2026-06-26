"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAuth } from "@/features/auth/hooks/use-auth";

const AUTO_DISMISS_MS = 6000;

export function AuthExpiredBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithDiscord } = useAuth();
  const { landing } = useTranslation();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (searchParams.get("expired") !== "1") return;

    setVisible(true);
    router.replace("/", { scroll: false });

    timerRef.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [searchParams, router]);

  function dismiss() {
    clearTimeout(timerRef.current);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed top-[72px] left-0 right-0 z-40 flex justify-center pointer-events-none">
          <motion.div
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-fit min-w-80 max-w-[90vw]"
            role="alert"
            aria-live="polite"
          >
            <div className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-background/70 p-5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={dismiss}
              className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground/60 transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-6">
              <p className="text-sm font-semibold text-foreground">
                {landing.sessionExpiredTitle}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {landing.sessionExpiredMessage}
              </p>
            </div>

            <Button
              size="sm"
              onClick={loginWithDiscord}
              className="w-fit rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              {landing.sessionExpiredAction}
            </Button>

            <motion.div
              className="absolute bottom-0 left-0 h-[2px] rounded-full bg-kat/60"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
            />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
