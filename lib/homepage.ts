import type {
  FaqItem,
  HomepageData,
  HomepageSection,
  HomepageSectionType,
  ProcessStep,
  ServiceItem,
  StatItem,
} from "@/types/homepage";

export function slugifyDomain(businessName: string): string {
  return `${businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 28)}.ai`;
}

export function navHref(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("home")) {
    return "#home";
  }
  if (normalized === "about" || normalized.includes("about")) {
    return "#why-us";
  }
  if (normalized.includes("service") && !normalized.includes("area")) {
    return "#services";
  }
  if (normalized.includes("gallery")) {
    return "#gallery";
  }
  if (normalized.includes("review")) {
    return "#reviews";
  }
  if (normalized.includes("faq")) {
    return "#faq";
  }
  if (normalized.includes("contact")) {
    return "#contact";
  }
  if (normalized.includes("map")) {
    return "#map";
  }
  if (normalized.includes("process") || normalized.includes("how")) {
    return "#process";
  }
  if (normalized.includes("why")) {
    return "#why-us";
  }
  return `#${normalized.replace(/[^a-z0-9]+/g, "-")}`;
}

export function sectionLabel(type: HomepageSectionType): string {
  if (type === "whyChooseUs") {
    return "Why Us";
  }
  if (type === "serviceArea") {
    return "Service Area";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function sectionAnchor(type: HomepageSectionType): string {
  const map: Record<HomepageSectionType, string> = {
    hero: "home",
    stats: "stats",
    whyChooseUs: "why-us",
    services: "services",
    gallery: "gallery",
    process: "process",
    reviews: "reviews",
    faq: "faq",
    cta: "cta",
    contact: "contact",
    map: "map",
    serviceArea: "service-area",
  };
  return map[type];
}

export const PRIMARY_NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#why-us" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

export function getShortDescription(data: HomepageData): string {
  const heroSection = data.sections.find((s) => s.type === "hero");
  if (heroSection) {
    const subtitle = asString(getHeroData(data, heroSection).subtitle);
    if (subtitle) {
      return subtitle.length > 160 ? `${subtitle.slice(0, 157)}...` : subtitle;
    }
  }

  const whySection = data.sections.find((s) => s.type === "whyChooseUs");
  if (whySection) {
    const description = asString(getWhyChooseUsData(data, whySection).description);
    if (description) {
      return description.length > 160 ? `${description.slice(0, 157)}...` : description;
    }
  }

  return data.category
    ? `${data.businessName} is a trusted ${data.category.toLowerCase()}.`
    : `${data.businessName} delivers professional services you can rely on.`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const preferred = [record.title, record.name, record.text, record.description].find(
          (candidate) => typeof candidate === "string" && candidate.trim().length > 0
        );
        return typeof preferred === "string" ? preferred.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

export function getHeroData(data: HomepageData, section: HomepageSection) {
  const d = section.data;
  return {
    title: asString(d.title, data.businessName),
    subtitle: asString(d.subtitle, data.category ?? "Welcome"),
    ctaLabel: asString(d.ctaLabel, "Get Started"),
    ctaSecondary: asString(d.ctaSecondary, "Contact Us"),
  };
}

export function getStatsItems(data: HomepageData, section: HomepageSection): StatItem[] {
  const raw = section.data.items;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const record = item as Record<string, unknown>;
        const label = asString(record.label);
        const value = asString(record.value);
        return label && value ? { label, value } : null;
      })
      .filter((item): item is StatItem => item !== null);
  }

  const inferred: StatItem[] = [];
  if (data.rating !== undefined) {
    inferred.push({ label: "Google Rating", value: `${data.rating.toFixed(1)} ★` });
  }
  if (data.reviewCount !== undefined) {
    inferred.push({ label: "Reviews", value: `${data.reviewCount}+` });
  }
  if (data.category) {
    inferred.push({ label: "Specialty", value: data.category });
  }
  if (data.workingHours.length > 0) {
    inferred.push({ label: "Availability", value: "Open Weekly" });
  }
  return inferred.slice(0, 4);
}

export function getWhyChooseUsData(data: HomepageData, section: HomepageSection) {
  const d = section.data;
  return {
    title: asString(d.title, "Why Choose Us"),
    description: asString(d.description),
    points: asStringArray(d.points),
    imageIndex: typeof d.imageIndex === "number" ? d.imageIndex : 1,
  };
}

export function getServicesData(data: HomepageData, section: HomepageSection) {
  const d = section.data;
  const rawItems = d.items;
  let items: ServiceItem[] = [];

  if (Array.isArray(rawItems)) {
    items = rawItems
      .map((item) => {
        if (typeof item === "string") {
          return { name: item.trim() };
        }
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const name = asString(record.name ?? record.title ?? record.service);
          const description = asString(record.description);
          return name ? { name, description: description || undefined } : null;
        }
        return null;
      })
      .filter((item): item is ServiceItem => item !== null);
  }

  if (items.length === 0 && data.services.length > 0) {
    items = data.services.map((name) => ({ name }));
  }

  return {
    title: asString(d.title, "Our Services"),
    items,
  };
}

export function getGalleryData(section: HomepageSection) {
  return { title: asString(section.data.title, "Gallery") };
}

export function getProcessData(section: HomepageSection) {
  const raw = section.data.steps;
  const steps: ProcessStep[] = Array.isArray(raw)
    ? raw
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const record = item as Record<string, unknown>;
          const title = asString(record.title ?? record.name);
          const description = asString(record.description);
          return title ? { title, description } : null;
        })
        .filter((item): item is ProcessStep => item !== null)
    : [];

  return {
    title: asString(section.data.title, "How We Work"),
    steps,
  };
}

export function getReviewsData(section: HomepageSection) {
  return { title: asString(section.data.title, "Reviews") };
}

export function getFaqData(data: HomepageData, section: HomepageSection): FaqItem[] {
  const raw = section.data.items;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const record = item as Record<string, unknown>;
        const question = asString(record.question);
        const answer = asString(record.answer);
        return question && answer ? { question, answer } : null;
      })
      .filter((item): item is FaqItem => item !== null);
  }
  return data.faq;
}

export function getFaqTitle(section: HomepageSection) {
  return asString(section.data.title, "Frequently Asked Questions");
}

export function getCtaData(section: HomepageSection) {
  const d = section.data;
  return {
    title: asString(d.title, "Ready to get started?"),
    subtitle: asString(d.subtitle, "Reach out today and let us help you."),
    buttonLabel: asString(d.buttonLabel, "Contact Us"),
  };
}

export function getContactData(section: HomepageSection) {
  return { title: asString(section.data.title, "Contact Us") };
}

export function getMapData(section: HomepageSection) {
  return { title: asString(section.data.title, "Find Us") };
}

export function getServiceAreaData(data: HomepageData, section: HomepageSection) {
  const d = section.data;
  const areas = asStringArray(d.areas);
  if (areas.length === 0 && data.address) {
    areas.push(data.address.split(",").pop()?.trim() ?? data.address);
  }
  return {
    title: asString(d.title, "Areas We Serve"),
    areas,
  };
}

export function isSectionVisible(data: HomepageData, section: HomepageSection): boolean {
  switch (section.type) {
    case "hero":
    case "contact":
    case "cta":
      return true;
    case "stats":
      return getStatsItems(data, section).length > 0;
    case "whyChooseUs": {
      const content = getWhyChooseUsData(data, section);
      return Boolean(content.description || content.points.length > 0);
    }
    case "services":
      return getServicesData(data, section).items.length > 0;
    case "gallery":
      return data.hasScrapedImages && data.images.length > 0;
    case "process":
      return getProcessData(section).steps.length > 0;
    case "reviews":
      return data.reviews.length > 0;
    case "faq":
      return getFaqData(data, section).length > 0;
    case "map":
      return Boolean(data.mapEmbedUrl);
    case "serviceArea": {
      const content = getServiceAreaData(data, section);
      return content.areas.length > 0 && Boolean(data.address);
    }
    default:
      return false;
  }
}

export function filterVisibleSections(data: HomepageData): HomepageSection[] {
  return data.sections.filter((section) => isSectionVisible(data, section));
}

export function buttonRadius(style: string): string {
  if (style.includes("pill")) {
    return "999px";
  }
  if (style.includes("soft")) {
    return "14px";
  }
  return "18px";
}

export function cardClass(style: string): string {
  if (style.includes("glass")) {
    return "border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_20px_60px_rgba(15,23,42,0.12)]";
  }
  if (style.includes("bordered")) {
    return "border border-slate-200 bg-white shadow-sm";
  }
  return "border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]";
}
