import { getShortDescription, PRIMARY_NAV } from "@/lib/homepage";
import type { HomepageData } from "@/types/homepage";

type SiteFooterProps = {
  data: HomepageData;
};

export function SiteFooter({ data }: SiteFooterProps) {
  const { businessName, phone, address } = data;
  const year = new Date().getFullYear();
  const description = getShortDescription(data);

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-semibold text-white">{businessName}</p>
            <p className="text-sm leading-6 text-slate-400">{description}</p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</p>
            <ul className="space-y-2 text-sm">
              {PRIMARY_NAV.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Address</p>
            {address ? (
              <p className="text-sm leading-6 text-slate-400">{address}</p>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</p>
            {phone ? (
              <a href={`tel:${phone}`} className="text-sm text-slate-400 transition hover:text-white">
                {phone}
              </a>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>© {year} {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
