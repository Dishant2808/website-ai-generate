import type { LandingPageData } from "@/lib/openai";

export type SectionConfig = {
  hero: boolean;
  stats: boolean;
  about: boolean;
  services: boolean;
  gallery: boolean;
  testimonials: boolean;
  faq: boolean;
  contact: boolean;
  map: boolean;
  footer: boolean;
};

export function buildSectionConfig(data: LandingPageData): SectionConfig {
  return {
    hero: true,
    stats: Boolean(data.rating || data.reviewCount || data.category || data.workingHours.length),
    about: Boolean(data.about?.trim()),
    services: data.services.length > 0,
    gallery: data.hasScrapedImages && data.images.length > 0,
    testimonials: data.reviews.length > 0,
    faq: data.faq.length > 0,
    contact: true,
    map: Boolean(data.mapEmbedUrl),
    footer: true,
  };
}

const DEFAULT_SECTION_ORDER = [
  "hero",
  "stats",
  "about",
  "services",
  "gallery",
  "testimonials",
  "faq",
  "contact",
  "map",
  "footer",
] as const;

export function resolveSectionOrder(
  preferredOrder: string[] | undefined,
  config: SectionConfig
): string[] {
  const base =
    preferredOrder && preferredOrder.length > 0
      ? preferredOrder
      : [...DEFAULT_SECTION_ORDER];

  // Always include reviews when scraped Google reviews exist.
  if (config.testimonials && !base.includes("testimonials")) {
    const insertBefore = ["faq", "contact", "map", "footer"].find((key) => base.includes(key));
    if (insertBefore) {
      base.splice(base.indexOf(insertBefore), 0, "testimonials");
    } else {
      base.push("testimonials");
    }
  }

  const unique = Array.from(new Set(base));

  return unique.filter((key) => {
    const enabled = config[key as keyof SectionConfig];
    return enabled !== false;
  });
}

export function slugifyDomain(businessName: string): string {
  return `${businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 28)}.ai`;
}
