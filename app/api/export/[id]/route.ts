import { access, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright";
import { chromium as playwrightCoreChromium } from "playwright-core";

import { getGenerationRecord } from "@/lib/generation-store";

const SCREENSHOT_DIR = join(tmpdir(), "ai-website-generator-screenshots");
export const runtime = "nodejs";

function getBaseUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const record = await getGenerationRecord(id);

  if (!record) {
    return Response.json({ success: false, error: "Generation not found." }, { status: 404 });
  }

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const screenshotPath = join(SCREENSHOT_DIR, `${id}.png`);
  try {
    await access(screenshotPath);
    const cached = await readFile(screenshotPath);
    return new Response(new Uint8Array(cached), {
      status: 200,
      headers: {
        "content-type": "image/png",
        "content-disposition": `attachment; filename="${record.landingPageData.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-website.png"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    // Continue and generate screenshot on cache miss.
  }

  const baseUrl = getBaseUrl(request);
  const renderUrl = `${baseUrl}/render/${id}`;

  const isVercel = Boolean(process.env.VERCEL);
  const browser = isVercel
    ? await playwrightCoreChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    : await playwrightChromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 },
      deviceScaleFactor: 1,
    });

    // Allow external image CDNs (Google Maps photos, etc.)
    page.setDefaultTimeout(30000);

    await page.goto(renderUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("[data-landing-root='true']", { timeout: 15000 });

    // Wait until every remaining image is fully painted (or failed and removed by SafeImage).
    await page.waitForFunction(
      () => {
        const images = Array.from(document.images);
        if (images.length === 0) {
          return true;
        }

        return images.every((img) => {
          if (!img.complete) {
            return false;
          }
          // Natural size 0 usually means broken image; ignore those for readiness.
          return img.naturalWidth > 0;
        });
      },
      { timeout: 12000 }
    );

    // Give CSS background-images a moment to paint
    await page.waitForTimeout(500);

    await page.locator("[data-landing-root='true']").screenshot({
      path: screenshotPath,
      type: "png",
      animations: "disabled",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to export screenshot.",
        details: error instanceof Error ? error.message : "Unknown screenshot error.",
      },
      { status: 502 }
    );
  } finally {
    await browser.close();
  }

  const buffer = await readFile(screenshotPath);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "content-type": "image/png",
      "content-disposition": `attachment; filename="${record.landingPageData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-website.png"`,
      "cache-control": "no-store",
    },
  });
}
