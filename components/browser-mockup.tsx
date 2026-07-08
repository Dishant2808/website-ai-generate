"use client";

import type { LandingPageData } from "@/lib/openai";
import { slugifyDomain } from "@/lib/sections";

type BrowserMockupProps = {
  data: LandingPageData;
  children: React.ReactNode;
};

export function BrowserMockup({ data, children }: BrowserMockupProps) {
  const domain = slugifyDomain(data.businessName || "business");

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-[0_40px_100px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-center text-xs text-slate-300 sm:text-sm">
          https://{domain}
        </div>
      </div>
      <div className="max-h-[78vh] overflow-y-auto bg-white">{children}</div>
    </div>
  );
}
