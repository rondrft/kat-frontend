import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  collapsed?: boolean;
  className?: string;
};

export function Logo({ collapsed, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-black/[0.08] bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
        <Image
          src="/logo/kat-logo.png"
          alt={`${siteConfig.name} logo`}
          fill
          className="object-cover object-center"
          sizes="36px"
          priority
        />
      </span>
      {!collapsed && <span className="text-lg">{siteConfig.name}</span>}
    </Link>
  );
}
