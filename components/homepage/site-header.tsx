"use client";

import { SafeImage } from "@/components/safe-image";
import { buttonRadius, PRIMARY_NAV } from "@/lib/homepage";
import type { HomepageData } from "@/types/homepage";

type SiteHeaderProps = {
  data: HomepageData;
};

export function SiteHeader({ data }: SiteHeaderProps) {
  const { theme, businessName, logo, phone } = data;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          {logo ? (
            <SafeImage
              src={logo}
              alt={`${businessName} logo`}
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}
            >
              {businessName.charAt(0)}
            </span>
          )}
          <span className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            {businessName}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {PRIMARY_NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {phone ? (
            <a href={`tel:${phone}`} className="hidden text-sm font-medium text-slate-700 lg:inline">
              {phone}
            </a>
          ) : null}
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white sm:text-sm"
            style={{
              borderRadius: buttonRadius(theme.buttonStyle),
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
            }}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
