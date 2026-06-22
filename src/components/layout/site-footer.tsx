import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-8 text-xs text-muted-foreground">
      <span>
        © {new Date().getFullYear()} {siteConfig.name}
      </span>
      <Link
        href={siteConfig.links.privacy}
        className="transition-colors hover:text-foreground"
      >
        Privacy Policy
      </Link>
      <Link
        href={siteConfig.links.terms}
        className="transition-colors hover:text-foreground"
      >
        Terms of Service
      </Link>
      <Link
        href={siteConfig.links.refund}
        className="transition-colors hover:text-foreground"
      >
        Refund Policy
      </Link>
    </footer>
  );
}
