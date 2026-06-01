import type { Metadata } from "next";
import Link from "next/link";
import { DiscordLoginButton } from "@/features/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-scale space-y-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-kat/20 text-2xl font-bold text-kat">
          K
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bienvenido a Kat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión con Discord para administrar tus servidores.
          </p>
        </div>
        <DiscordLoginButton />
        <Link
          href="/"
          className="block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver al inicio
        </Link>
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link
            href={siteConfig.links.terms}
            className="underline hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={siteConfig.links.privacy}
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
