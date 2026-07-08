import OpenAI from "openai";
import { z } from "zod";

import { filterValidImages } from "@/lib/images";
import type { BusinessData, BusinessReview } from "@/types";

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
          record.quote,
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

const designSchema = z.object({
  theme: z.string().default("modern"),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string().default("#F8FAFC"),
  textColor: z.string().default("#0F172A"),
  font: z.string().default("Inter"),
  heroStyle: z.string().default("split"),
  buttonStyle: z.string().default("rounded"),
  cardStyle: z.string().default("elevated"),
  sectionOrder: z
    .array(z.string())
    .default([
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
    ]),
});

const landingPageSchema = z.object({
  businessName: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  ctaLabel: z.string().default("Get Directions"),
  about: z.string(),
  services: z.preprocess(normalizeStringList, z.array(z.string()).min(1)),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  design: designSchema,
});

export type LandingPageGenerated = z.infer<typeof landingPageSchema>;

export type LandingPageData = LandingPageGenerated & {
  category?: string;
  rating?: number;
  reviewCount?: number;
  reviews: BusinessReview[];
  images: string[];
  logo?: string;
  address?: string;
  coordinates?: BusinessData["coordinates"];
  phone?: string;
  website?: string;
  email?: string;
  workingHours: BusinessData["workingHours"];
  socialLinks: BusinessData["socialLinks"];
  mapEmbedUrl?: string;
  directionsUrl?: string;
  hasScrapedImages: boolean;
};

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

  const fallback = encodeURIComponent(businessData.socialLinks.googleBusinessUrl);
  return {
    mapEmbedUrl: undefined,
    directionsUrl: businessData.socialLinks.googleBusinessUrl,
    googleMapsLink: fallback,
  };
}

export async function generateLandingPage(
  businessData: BusinessData
): Promise<LandingPageData> {
  const hasRealReviews = businessData.reviews.length > 0;
  const hasServices = businessData.services.length > 0;

  const prompt = `
You are an expert web designer and conversion copywriter for premium Framer/Webflow-quality landing pages.

Based on the business information, generate JSON for a professional landing page.

Return ONLY valid JSON.

Schema:
{
  "businessName": string,
  "heroTitle": string,
  "heroSubtitle": string,
  "ctaLabel": string,
  "about": string,
  "services": string[],
  "faq": [{ "question": string, "answer": string }],
  "design": {
    "theme": string,
    "primaryColor": hex,
    "secondaryColor": hex,
    "accentColor": hex,
    "backgroundColor": hex,
    "textColor": hex,
    "font": string,
    "heroStyle": "split" | "fullscreen" | "centered",
    "buttonStyle": "rounded" | "pill" | "soft",
    "cardStyle": "elevated" | "bordered" | "glass",
    "sectionOrder": string[]
  }
}

Rules:
- Generate premium unique branding colors based on category and business vibe.
- Never invent fake Google reviews.
- ${hasRealReviews ? "Do NOT invent testimonials. Real reviews already exist." : "FAQ can compensate, but do not invent reviews."}
- ${hasServices ? "Prefer/refine scraped services rather than inventing unrelated ones." : "Infer 4-6 realistic services from category and available context."}
- If description exists, rewrite professionally. If missing, generate from category.
- Keep FAQ to 3-5 useful questions.
- Never return markdown.
- Never explain.
- Only return JSON.

Business data:
${JSON.stringify(businessData, null, 2)}
`.trim();

  const response = await openai.responses.create({
    model: "gpt-5.5",
    input: prompt,
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

  const generated = landingPageSchema.parse(parsed);
  const mapUrls = buildMapUrls(businessData);

  const validImages = await filterValidImages(
    [...businessData.images, businessData.logo].filter(Boolean) as string[]
  );
  const validLogoCandidates = businessData.logo
    ? await filterValidImages([businessData.logo], 1)
    : [];
  const validLogo = validLogoCandidates[0];

  return {
    ...generated,
    businessName: businessData.businessName ?? generated.businessName,
    services:
      businessData.services.length > 0
        ? businessData.services
        : generated.services,
    faq: businessData.faq.length > 0 ? businessData.faq : generated.faq,
    category: businessData.category,
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
  };
}
