# AI Website Generator Demo

Premium demo app that generates a modern business landing page from Google Business / social links using **Apify** scrapers + **OpenAI GPT-5.5**, then previews and exports a screenshot with **Playwright**.

---

## AI & Model Used

| Layer | Provider | Model / Tool |
|---|---|---|
| Website copy + branding design | **OpenAI** | **`gpt-5.5`** |
| Business scraping | **Apify** | Actors listed below |
| Screenshot export | **Playwright** (Chromium) | Local headless browser |

### OpenAI

- File: `lib/openai.ts`
- SDK: `openai`
- Model: **`gpt-5.5`**
- Env: `OPENAI_API_KEY`
- Responsibility:
  - Generate hero/about/services/faq copy
  - Generate design config (theme, colors, fonts, section order, button/card styles)
  - Prefer scraped reviews/images/services (does not invent fake Google reviews when real ones exist)

### Apify Scrapers

- File: `lib/scraper.ts`
- Env: `APIFY_API_TOKEN`

| Source | Actor ID |
|---|---|
| Google Business / Maps | `compass/crawler-google-places` |
| Instagram | `apify/instagram-profile-scraper` |
| Facebook | `apify/facebook-pages-scraper` |

Configurable via:

- `APIFY_GOOGLE_BUSINESS_ACTOR_ID`
- `APIFY_INSTAGRAM_ACTOR_ID`
- `APIFY_FACEBOOK_ACTOR_ID`

---

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **React 19**
- **Tailwind CSS**
- **shadcn/ui**
- **React Hook Form + Zod**
- **Framer Motion**
- **Playwright**
- **OpenAI SDK**

---

## Complete Product Flow

```text
1. Homepage (/)
   User pastes:
   - Google Business Profile URL (required)
   - Instagram URL (optional)
   - Facebook URL (optional)
   Clicks "Generate Website"

2. Loading (/generating)
   Animated AI steps are shown while backend runs.

3. API (/api/generate)
   a. Validate request (Zod)
   b. Apify scrapers collect business data
   c. Merge into one BusinessData object
   d. OpenAI GPT-5.5 generates landing page content + design
   e. Image URLs are validated (broken images dropped)
   f. Result is saved (server temp JSON + browser sessionStorage)

4. Preview (/preview?id=...)
   Shows success header + browser mockup.
   Renders the generated website with LandingPage component.

5. Export Screenshot
   POST /api/export/[id]
   Playwright opens /render/[id]
   Captures the SAME LandingPage as preview
   Downloads PNG automatically
```

---

## Where the Website Template Lives

The generated website UI template is:

### `components/landing-page.tsx`

This single component is used for:

- Website Preview (`/preview`)
- Playwright screenshot render (`/render/[id]`)

So preview and export stay visually identical.

Supporting UI:

| File | Role |
|---|---|
| `app/page.tsx` | Marketing homepage + form entry |
| `components/business-form.tsx` | URL inputs / Generate button |
| `app/generating/page.tsx` | AI loading experience |
| `app/preview/preview-client.tsx` | Preview workspace (header + export actions) |
| `components/browser-mockup.tsx` | Fake browser frame around Website Preview |
| `app/render/[id]/page.tsx` | Pixel-identical page opened by Playwright |

Backend:

| File | Role |
|---|---|
| `app/api/generate/route.ts` | Orchestrates scrape → GPT → save |
| `lib/scraper.ts` | Apify scraping + BusinessData merge |
| `lib/openai.ts` | GPT-5.5 generation |
| `lib/images.ts` | Keep only reachable/valid images |
| `lib/sections.ts` | Show/hide sections (gallery/reviews/faq/etc.) |
| `lib/generation-store.ts` | Temporary generation storage |
| `app/api/export/[id]/route.ts` | Playwright screenshot export |

---

## Setup

### 1) Install dependencies

```bash
cd /var/www/html/website-ai-demo
npm install
```

### 2) Install Playwright Chromium (required for screenshot export)

```bash
npx playwright install chromium
```

### 3) Create `.env.local`

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Apify
APIFY_API_TOKEN=your_apify_token
APIFY_GOOGLE_BUSINESS_ACTOR_ID=compass/crawler-google-places
APIFY_INSTAGRAM_ACTOR_ID=apify/instagram-profile-scraper
APIFY_FACEBOOK_ACTOR_ID=apify/facebook-pages-scraper

# Optional (useful in some deploy environments)
# APP_URL=http://localhost:3000
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Do not commit real API keys. Keep secrets in `.env.local` only.

### 4) Run the app

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

### 5) Production build (optional)

```bash
npm run build
npm run start
```

---

## How Generation Works (Backend Detail)

### Step A — Scrape (`lib/scraper.ts`)

Collect and merge:

- Business name, category, description
- Rating + review count + individual reviews
- Address, phone, website, hours, coordinates
- Photos / logo
- Instagram bio / images
- Facebook about / images

If one source fails, the rest continue (partial data is allowed).

### Step B — GPT Design + Content (`lib/openai.ts`)

Model: **`gpt-5.5`**

Returns JSON including:

- `heroTitle`, `heroSubtitle`, `about`, `services`, `faq`
- Design system:
  - `theme`
  - `primaryColor`, `secondaryColor`, `accentColor`
  - `font`
  - `heroStyle`, `buttonStyle`, `cardStyle`
  - `sectionOrder`

Then merges scraped business truth (reviews, images, contact, maps) into the final `LandingPageData`.

### Step C — Render

`LandingPage` dynamically shows only available sections:

- Gallery only if valid scraped images exist
- Reviews only if Google reviews exist
- FAQ only if FAQ data exists
- Map only if coordinates/address map URL exists

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing + input form |
| `/generating` | AI loading animation + API call |
| `/preview?id=...` | Website Preview + Export |
| `/render/[id]` | Headless-only render for Playwright |
| `POST /api/generate` | Scrape + GPT generation |
| `POST /api/export/[id]` | Screenshot download |

---

## Demo Notes

- Intended as a **3-hour / client-demo style** SaaS experience (Lovable / Bolt / Framer AI vibe).
- Scraping quality depends on Apify actor availability + Google Business public data.
- Image URLs are filtered; broken images are not rendered.
- Screenshot export waits for images to load before capture.

---

## Quick mental model

```text
Links → Apify (BusinessData) → OpenAI GPT-5.5 (content + design)
→ LandingPage template → Preview
→ Playwright (same template) → Download PNG
```
