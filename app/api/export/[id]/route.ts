import { access, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

import { getGenerationRecord } from "@/lib/generation-store";
import type { LandingPageData } from "@/lib/openai";

const SCREENSHOT_DIR = join(tmpdir(), "ai-website-generator-screenshots");
export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderLandingHtml(data: LandingPageData): string {
  const heroImage = data.images[0];
  const galleryHtml = data.images
    .slice(0, 6)
    .map(
      (img) => `<div class="item"><img src="${img}" alt="${escapeHtml(data.businessName)}" /></div>`
    )
    .join("");

  const reviewsHtml = data.reviews
    .slice(0, 6)
    .map(
      (review) => `<article class="card">
        <strong>${escapeHtml(review.author)}</strong>
        <p>${escapeHtml(review.text)}</p>
      </article>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.businessName)}</title>
  <style>
    :root{--p:${data.design.primaryColor};--s:${data.design.secondaryColor};--a:${data.design.accentColor};--bg:${data.design.backgroundColor};--t:${data.design.textColor};}
    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--t);font-family:${data.design.font},Inter,system-ui,sans-serif}
    .hero{padding:64px 0;background-image:${heroImage ? `linear-gradient(120deg,rgba(2,6,23,.78),rgba(2,6,23,.42)),url('${heroImage}')` : "linear-gradient(120deg,var(--p),var(--s))"};background-size:cover;background-position:center;color:#fff}
    .wrap{max-width:1120px;margin:0 auto;padding:0 28px}
    h1{font-size:52px;line-height:1.05;margin:10px 0 0}.sub{max-width:620px;line-height:1.7}
    section{padding:56px 0}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:18px}
    .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.item{height:220px;border-radius:20px;overflow:hidden}
    .item img{width:100%;height:100%;object-fit:cover;display:block}
  </style>
</head>
<body>
  <section class="hero"><div class="wrap">
    <p>${escapeHtml(data.category ?? "Business")}</p>
    <h1>${escapeHtml(data.heroTitle)}</h1>
    <p class="sub">${escapeHtml(data.heroSubtitle)}</p>
  </div></section>
  <section><div class="wrap"><h2>About</h2><p>${escapeHtml(data.about)}</p></div></section>
  ${data.services.length ? `<section><div class="wrap"><h2>Services</h2><div class="cards">${data.services.map((s) => `<div class="card">${escapeHtml(s)}</div>`).join("")}</div></div></section>` : ""}
  ${galleryHtml ? `<section><div class="wrap"><h2>Gallery</h2><div class="gallery">${galleryHtml}</div></div></section>` : ""}
  ${reviewsHtml ? `<section><div class="wrap"><h2>Reviews</h2><div class="cards">${reviewsHtml}</div></div></section>` : ""}
</body>
</html>`;
}

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

      // Allow external image CDNs (Google Maps photos, etc.)
      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);

      await page.setContent(renderLandingHtml(record.landingPageData), {
        waitUntil: "domcontentloaded",
      });

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
