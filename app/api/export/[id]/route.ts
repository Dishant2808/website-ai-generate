import { access, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

import { renderLandingHtml, HOMEPAGE_HTML_VERSION } from "@/lib/homepage-html";
import { getGenerationRecord } from "@/lib/generation-store";

const SCREENSHOT_DIR = join(tmpdir(), "ai-website-generator-screenshots");
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const record = await getGenerationRecord(id);

    if (!record) {
      return Response.json({ success: false, error: "Generation not found." }, { status: 404 });
    }

    await mkdir(SCREENSHOT_DIR, { recursive: true });

    const screenshotPath = join(SCREENSHOT_DIR, `${id}-v${HOMEPAGE_HTML_VERSION}.png`);
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

    let browser: Browser | null = null;

    try {
      const executablePath = await chromium.executablePath();
      const browserInstance = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1440, height: 2200 },
        executablePath,
        headless: true,
      });
      browser = browserInstance as unknown as Browser;
      const page = await browserInstance.newPage();

      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);

      await page.setContent(renderLandingHtml(record.landingPageData), {
        waitUntil: "domcontentloaded",
      });

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
            return img.naturalWidth > 0;
          });
        },
        { timeout: 12000 }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      await page.screenshot({
        path: screenshotPath,
        type: "png",
        fullPage: true,
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
      if (browser) {
        await browser.close();
      }
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
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Unexpected export server error.",
        details: error instanceof Error ? error.message : "Unknown server error.",
      },
      { status: 500 }
    );
  }
}
