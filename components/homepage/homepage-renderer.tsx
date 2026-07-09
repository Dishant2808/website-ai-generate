"use client";

import type { HomepageData } from "@/types/homepage";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { renderHomepageSection } from "./sections";

type HomepageRendererProps = {
  data: HomepageData;
};

export function HomepageRenderer({ data }: HomepageRendererProps) {
  const { theme, sections } = data;

  return (
    <div
      data-landing-root="true"
      className="min-h-screen bg-white text-slate-900"
      style={{
        fontFamily: `${theme.fontFamily}, Inter, system-ui, sans-serif`,
        ["--hp-primary" as string]: theme.primaryColor,
        ["--hp-secondary" as string]: theme.secondaryColor,
        ["--hp-accent" as string]: theme.accentColor,
      }}
    >
      <SiteHeader data={data} />

      <main>
        {sections.map((section, index) =>
          renderHomepageSection({ data, section, index })
        )}
      </main>

      <SiteFooter data={data} />
    </div>
  );
}
