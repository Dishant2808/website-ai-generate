import OpenAI from "openai";
import { z } from "zod";

import { filterValidImages } from "@/lib/images";
import { filterVisibleSections } from "@/lib/homepage";
import type { HomepageData, HomepageSectionType } from "@/types/homepage";
import type { BusinessData } from "@/types";

function normalizeStringList(value: unknown): string[] {
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
        const preferred = [
          record.title,
          record.name,
          record.heading,
          record.text,
          record.description,
          record.service,
        ].find((candidate) => typeof candidate === "string" && candidate.trim().length > 0);
        return typeof preferred === "string" ? preferred.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

const sectionTypes = [
  "hero",
  "stats",
  "whyChooseUs",
  "services",
  "gallery",
  "process",
  "reviews",
  "faq",
  "cta",
  "contact",
  "map",
  "serviceArea",
] as const satisfies readonly HomepageSectionType[];

const themeSchema = z.object({
  name: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string().default("Inter"),
  buttonStyle: z.string().default("rounded-gradient"),
  cardStyle: z.string().default("glass"),
  heroStyle: z.string().default("image-overlay"),
});

const homepageSchema = z.object({
  theme: themeSchema,
  navigation: z.array(z.string()).min(3),
  sections: z
    .array(
      z.object({
        type: z.enum(sectionTypes),
        data: z.record(z.string(), z.unknown()).default({}),
      })
    )
    .min(4),
});

export type HomepageGenerated = z.infer<typeof homepageSchema>;
export type { HomepageData } from "@/types/homepage";
export type LandingPageData = import("@/types/homepage").HomepageData;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildMapUrls(businessData: BusinessData) {
  if (businessData.coordinates) {
    const { lat, lng } = businessData.coordinates;
    return {
      mapEmbedUrl: `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    };
  }

  if (businessData.address) {
    const query = encodeURIComponent(businessData.address);
    return {
      mapEmbedUrl: `https://maps.google.com/maps?q=${query}&z=15&output=embed`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
    };
  }

  return {
    mapEmbedUrl: undefined,
    directionsUrl: businessData.socialLinks.googleBusinessUrl,
  };
}

function buildPrompt(businessData: BusinessData): string {
  const hasReviews = businessData.reviews.length > 0;
  const hasImages = businessData.images.length > 0;
  const hasFaq = businessData.faq.length > 0;
  const hasServices = businessData.services.length > 0;
  const hasLocation = Boolean(businessData.address || businessData.coordinates);
  const hasHours = businessData.workingHours.length > 0;

  return `
You are an expert homepage designer creating premium Framer/Webflow/Wix AI-quality business homepages.

Based on the business data, return ONLY valid JSON for a dynamic homepage.

Schema:
{
  "theme": {
    "name": string,
    "primaryColor": hex,
    "secondaryColor": hex,
    "accentColor": hex,
    "fontFamily": string,
    "buttonStyle": "rounded-gradient" | "pill-gradient" | "soft",
    "cardStyle": "glass" | "elevated" | "bordered",
    "heroStyle": "image-overlay" | "split" | "centered"
  },
  "navigation": string[],
  "sections": [
    { "type": "hero" | "stats" | "whyChooseUs" | "services" | "gallery" | "process" | "reviews" | "faq" | "cta" | "contact" | "map" | "serviceArea", "data": object }
  ]
}

Section data shapes:
- hero: { "title", "subtitle", "ctaLabel", "ctaSecondary" }
- stats: { "items": [{ "label", "value" }] } — infer from rating, reviews, category, years, customers when missing
- whyChooseUs: { "title", "description", "points": string[] }
- services: { "title", "items": [{ "name", "description" }] }
- gallery: { "title" }
- process: { "title", "steps": [{ "title", "description" }] }
- reviews: { "title" } — content comes from scraped reviews only
- faq: { "title", "items": [{ "question", "answer" }] }
- cta: { "title", "subtitle", "buttonLabel" }
- contact: { "title" }
- map: { "title" }
- serviceArea: { "title", "areas": string[] }

Rules:
1. Intelligently choose sections and order based on business category (education, restaurant, salon, gym, law firm, lawn care, etc.). Do NOT use a fixed template.
2. Navigation labels must match included sections.
3. Always include hero, contact, and a strong cta section.
4. ${hasReviews ? "Include reviews section. NEVER invent fake reviews." : "Do NOT include reviews section."}
5. ${hasImages ? "Include gallery section. Images are provided externally." : "Do NOT include gallery."}
6. ${hasLocation ? "Include map and serviceArea when relevant." : "Do NOT include map or serviceArea."}
7. ${hasFaq ? "Use scraped FAQ in faq section data." : "Generate 3-5 helpful FAQs in faq section."}
8. ${hasServices ? "Refine scraped services in services section." : "Infer realistic services from category."}
9. ${hasHours ? "Reference working hours in contact/hero copy where useful." : ""}
10. Premium copywriting. Unique colors per business vibe.
11. Never return markdown. Only JSON.

Business data:
${JSON.stringify(businessData, null, 2)}
`.trim();
}

export async function generateHomepage(businessData: BusinessData): Promise<HomepageData> {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    input: buildPrompt(businessData),
  });

  const rawOutput = response.output_text?.trim();
  if (!rawOutput) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    throw new Error("OpenAI response was not valid JSON.");
  }

  const generated = homepageSchema.parse(parsed);
  const mapUrls = buildMapUrls(businessData);

  const validImages = await filterValidImages(
    [...businessData.images, businessData.logo].filter(Boolean) as string[]
  );
  const validLogoCandidates = businessData.logo
    ? await filterValidImages([businessData.logo], 1)
    : [];
  const validLogo = validLogoCandidates[0];

  const services =
    businessData.services.length > 0
      ? businessData.services
      : normalizeStringList(
          generated.sections.find((s) => s.type === "services")?.data?.items
        );

  const faqFromSection = generated.sections.find((s) => s.type === "faq")?.data?.items;
  const generatedFaq = Array.isArray(faqFromSection)
    ? faqFromSection
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const record = item as Record<string, unknown>;
          const question = typeof record.question === "string" ? record.question.trim() : "";
          const answer = typeof record.answer === "string" ? record.answer.trim() : "";
          return question && answer ? { question, answer } : null;
        })
        .filter((item): item is { question: string; answer: string } => item !== null)
    : [];

  const faq = businessData.faq.length > 0 ? businessData.faq : generatedFaq;

  const homepage: HomepageData = {
    businessName: businessData.businessName ?? "Business",
    category: businessData.category,
    theme: generated.theme,
    navigation: generated.navigation,
    sections: generated.sections,
    rating: businessData.rating,
    reviewCount: businessData.reviewCount,
    reviews: businessData.reviews,
    images: validImages,
    logo: validLogo,
    address: businessData.address,
    coordinates: businessData.coordinates,
    phone: businessData.phone,
    website: businessData.website,
    email: businessData.email,
    workingHours: businessData.workingHours,
    socialLinks: businessData.socialLinks,
    mapEmbedUrl: mapUrls.mapEmbedUrl,
    directionsUrl: mapUrls.directionsUrl,
    hasScrapedImages: validImages.length > 0,
    faq,
    services,
  };

  return {
    ...homepage,
    sections: filterVisibleSections(homepage),
  };
}

export const generateLandingPage = generateHomepage;
