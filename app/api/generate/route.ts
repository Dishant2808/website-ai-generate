import { NextResponse } from "next/server";
import { z } from "zod";

import { saveGenerationRecord } from "@/lib/generation-store";
import { generateLandingPage, type LandingPageData } from "@/lib/openai";
import { scrapeBusinessLinks } from "@/lib/scraper";
import type { BusinessData } from "@/types";

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL.")
  .optional()
  .or(z.literal(""));

const generateRequestSchema = z.object({
  googleBusinessUrl: z
    .string()
    .trim()
    .min(1, "googleBusinessUrl is required.")
    .url("googleBusinessUrl must be a valid URL."),
  instagramUrl: optionalUrlSchema,
  facebookUrl: optionalUrlSchema,
});

type GenerateSuccessResponse = {
  success: true;
  stage: "completed";
  data: {
    generationId: string;
    generationTimeMs: number;
    businessData: BusinessData;
    landingPageData: LandingPageData;
  };
};

type GenerateErrorResponse = {
  success: false;
  stage: "validation" | "scraping" | "generation" | "request";
  error: string;
  data?: {
    businessData?: BusinessData;
  };
  details?: unknown;
};

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const rawBody: unknown = await req.json();
    const parsedBody = generateRequestSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      const response: GenerateErrorResponse = {
        success: false,
        stage: "validation",
        error: "Invalid request body.",
        details: parsedBody.error.flatten(),
      };

      return NextResponse.json(response, { status: 400 });
    }

    let businessData: BusinessData;
    try {
      businessData = await scrapeBusinessLinks(parsedBody.data);
    } catch {
      const response: GenerateErrorResponse = {
        success: false,
        stage: "scraping",
        error: "Failed to collect business data.",
      };

      return NextResponse.json(response, { status: 502 });
    }

    try {
      const landingPageData = await generateLandingPage(businessData);
      const generationTimeMs = Date.now() - startedAt;
      const record = await saveGenerationRecord({
        generationTimeMs,
        businessData,
        landingPageData,
      });

      const response: GenerateSuccessResponse = {
        success: true,
        stage: "completed",
        data: {
          generationId: record.id,
          generationTimeMs,
          businessData,
          landingPageData,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const response: GenerateErrorResponse = {
        success: false,
        stage: "generation",
        error: "Failed to generate landing page.",
        data: {
          businessData,
        },
        details: error instanceof Error ? error.message : "Unknown generation error.",
      };

      return NextResponse.json(response, { status: 502 });
    }
  } catch {
    const response: GenerateErrorResponse = {
      success: false,
      stage: "request",
      error: "Invalid JSON payload.",
    };

    return NextResponse.json(response, { status: 400 });
  }
}
