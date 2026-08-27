"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/saju", label: "사주" },
  { href: "/daeun", label: "대운" },
  { href: "/gunghap", label: "궁합" },
  { href: "/yearly", label: "년도별" },
  { href: "/monthly", label: "월운" },
  { href: "/daily", label: "일일" },
  { href: "/taekil", label: "택일" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-[var(--brand)]">
          사주만세력
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-[var(--brand)] text-white"
                    : "text-foreground/70 hover:bg-[var(--brand-soft)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
