import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundEffects } from "@/components/landing/background-effects";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, lastUpdated, children }: LegalPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {siteConfig.name}
        </Link>

        <article className="dashboard-glass-card rounded-3xl p-8 md:p-10">
          <header className="mb-10 border-b border-border/60 pb-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-kat">
              Legal
            </p>
            <h1 className="font-hero text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </header>
          <div className="legal-prose">{children}</div>
        </article>

        <footer className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          <Link href={siteConfig.links.privacy} className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href={siteConfig.links.terms} className="hover:text-foreground">
            Terms of Service
          </Link>
        </footer>
      </main>
    </div>
  );
}
