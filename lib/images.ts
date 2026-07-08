const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|bmp)(\?|$)/i;

function looksLikeImageUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

async function isReachableImage(url: string): Promise<boolean> {
  if (!looksLikeImageUrl(url)) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (head.ok) {
      const contentType = head.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        return true;
      }
      if (!contentType && IMAGE_EXT.test(url)) {
        return true;
      }
    }

    // Some CDNs reject HEAD; try a tiny GET range
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/*,*/*;q=0.8",
        Range: "bytes=0-1023",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!(get.ok || get.status === 206)) {
      return false;
    }

    const contentType = get.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) {
      return true;
    }

    const buffer = Buffer.from(await get.arrayBuffer());
    if (buffer.length >= 3) {
      // JPEG / PNG / GIF / WEBP signatures
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng =
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
      const isWebp =
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";

      return isJpeg || isPng || isGif || isWebp;
    }

    return IMAGE_EXT.test(url);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function filterValidImages(urls: string[], limit = 12): Promise<string[]> {
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const candidates = unique.slice(0, 24);

  const results = await Promise.all(
    candidates.map(async (url) => ({
      url,
      ok: await isReachableImage(url),
    }))
  );

  return results.filter((item) => item.ok).map((item) => item.url).slice(0, limit);
}
