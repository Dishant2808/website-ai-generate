import type {
  BusinessCoordinates,
  BusinessData,
  BusinessReview,
  WorkingHoursDay,
} from "@/types";

type ScrapeBusinessLinksInput = {
  googleBusinessUrl: string;
  instagramUrl?: string;
  facebookUrl?: string;
};

type GoogleSourceData = Partial<BusinessData> & {
  images: string[];
  reviews: BusinessReview[];
  workingHours: WorkingHoursDay[];
  services: string[];
  faq: BusinessData["faq"];
};

type SocialSourceData = {
  bio?: string;
  images: string[];
  profilePicture?: string;
  coverImage?: string;
  username?: string;
  followers?: number;
  about?: string;
  phone?: string;
  email?: string;
  services: string[];
  reviews: BusinessReview[];
};

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const GOOGLE_ACTOR_ID =
  process.env.APIFY_GOOGLE_BUSINESS_ACTOR_ID ?? "compass/crawler-google-places";
const INSTAGRAM_ACTOR_ID =
  process.env.APIFY_INSTAGRAM_ACTOR_ID ?? "apify/instagram-profile-scraper";
const FACEBOOK_ACTOR_ID =
  process.env.APIFY_FACEBOOK_ACTOR_ID ?? "apify/facebook-pages-scraper";

async function runApifyActor<T>(actorId: string | undefined, input: object): Promise<T[]> {
  if (!APIFY_API_TOKEN || !actorId) {
    return [];
  }

  const endpoint = `https://api.apify.com/v2/acts/${encodeURIComponent(
    actorId
  )}/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_API_TOKEN)}&timeout=120`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Apify actor failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as T[]) : [];
}

function toString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function extractImageUrls(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    return [value];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(
    value.map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return (
          toString(record.url) ??
          toString(record.image) ??
          toString(record.imageUrl) ??
          toString(record.displayUrl) ??
          toString(record.src)
        );
      }

      return undefined;
    })
  ).filter((url) => /^https?:\/\//i.test(url));
}

function extractReviews(value: unknown): BusinessReview[] {
  if (!value) {
    return [];
  }

  const source = Array.isArray(value)
    ? value
    : typeof value === "object" && Array.isArray((value as { reviews?: unknown[] }).reviews)
      ? ((value as { reviews: unknown[] }).reviews)
      : [];

  const reviews: BusinessReview[] = [];

  for (const item of source) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const reviewer =
      typeof record.reviewer === "object" && record.reviewer
        ? (record.reviewer as Record<string, unknown>)
        : undefined;

    const text =
      toString(record.text) ??
      toString(record.reviewText) ??
      toString(record.textTranslated) ??
      toString(record.comment) ??
      toString(record.review) ??
      toString(record.snippet);

    if (!text) {
      continue;
    }

    reviews.push({
      author:
        toString(record.name) ??
        toString(record.author) ??
        toString(record.reviewerName) ??
        toString(reviewer?.name) ??
        toString(reviewer?.displayName) ??
        "Google Customer",
      rating: toNumber(record.stars) ?? toNumber(record.rating) ?? toNumber(record.score),
      text,
      date:
        toString(record.publishedAtDate) ??
        toString(record.publishAt) ??
        toString(record.date) ??
        toString(record.publishedAt) ??
        toString(record.relativeDate) ??
        toString(record.reviewDate),
      avatarUrl:
        toString(record.profilePhotoUrl) ??
        toString(record.reviewerPhotoUrl) ??
        toString(record.avatar) ??
        toString(reviewer?.photoUrl) ??
        toString(reviewer?.profilePhotoUrl),
    });
  }

  return reviews;
}

function extractWorkingHours(value: unknown): WorkingHoursDay[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const [day, ...rest] = item.split(":");
          if (!day || rest.length === 0) {
            return null;
          }
          return { day: day.trim(), hours: rest.join(":").trim() };
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const day = toString(record.day) ?? toString(record.name);
          const hours =
            toString(record.hours) ??
            toString(record.time) ??
            toString(record.value) ??
            (Array.isArray(record.times) ? record.times.join(", ") : undefined);

          if (!day || !hours) {
            return null;
          }

          return { day, hours };
        }

        return null;
      })
      .filter((item): item is WorkingHoursDay => Boolean(item));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([day, hours]) => {
        const hoursValue = Array.isArray(hours)
          ? hours.map(String).join(", ")
          : toString(hours);
        if (!hoursValue) {
          return null;
        }
        return { day, hours: hoursValue };
      })
      .filter((item): item is WorkingHoursDay => Boolean(item));
  }

  return [];
}

function extractServices(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return uniqueStrings(value.split(/[,|/]/).map((item) => item.trim()));
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStrings(
    value.map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return toString(record.name) ?? toString(record.title) ?? toString(record.service);
      }
      return undefined;
    })
  );
}

function extractFaq(value: unknown): BusinessData["faq"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const question = toString(record.question) ?? toString(record.q);
      const answer = toString(record.answer) ?? toString(record.a);
      if (!question || !answer) {
        return null;
      }
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}

function extractCoordinates(item: Record<string, unknown>): BusinessCoordinates | undefined {
  const location = item.location as Record<string, unknown> | undefined;
  const lat =
    toNumber(item.lat) ??
    toNumber(item.latitude) ??
    toNumber(location?.lat) ??
    toNumber(location?.latitude);
  const lng =
    toNumber(item.lng) ??
    toNumber(item.lon) ??
    toNumber(item.longitude) ??
    toNumber(location?.lng) ??
    toNumber(location?.lon) ??
    toNumber(location?.longitude);

  if (lat === undefined || lng === undefined) {
    return undefined;
  }

  return { lat, lng };
}

function inferBusinessNameFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).replace(/@.*$/, "").trim();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function getGoogleBusinessData(url: string): Promise<GoogleSourceData> {
  try {
    const items = await runApifyActor<Record<string, unknown>>(GOOGLE_ACTOR_ID, {
      startUrls: [{ url }],
      searchStringsArray: [],
      maxCrawledPlacesPerSearch: 1,
      language: "en",
      includeWebResults: false,
      scrapeReviewsPersonalData: true,
      maxReviews: 12,
      reviewsSort: "newest",
      reviewsOrigin: "google",
      scrapeReviewerName: true,
      scrapeReviewerId: false,
      scrapeDirectories: false,
      scrapeImages: true,
      maxImages: 20,
    });

    const item = items[0];
    if (!item) {
      return {
        businessName: inferBusinessNameFromUrl(url),
        images: [],
        reviews: [],
        workingHours: [],
        services: [],
        faq: [],
      };
    }

    return {
      businessName: toString(item.title) ?? toString(item.name) ?? inferBusinessNameFromUrl(url),
      category: toString(item.categoryName) ?? toString(item.category),
      description: toString(item.description) ?? toString(item.about),
      rating: toNumber(item.totalScore) ?? toNumber(item.rating),
      reviewCount: toNumber(item.reviewsCount) ?? toNumber(item.reviews),
      reviews: extractReviews(
        item.reviews ??
          item.userReviews ??
          item.reviewsDistribution ??
          item.placeReviews ??
          item.reviewData
      ),
      images: extractImageUrls(item.imageUrls ?? item.images ?? item.photos),
      logo: toString(item.logo) ?? toString(item.logoUrl),
      address: toString(item.address) ?? toString(item.street),
      coordinates: extractCoordinates(item),
      phone: toString(item.phone) ?? toString(item.phoneNumber),
      website: toString(item.website) ?? toString(item.websiteUrl),
      workingHours: extractWorkingHours(item.openingHours ?? item.hours),
      services: extractServices(item.services ?? item.categories),
      faq: extractFaq(item.questionsAndAnswers ?? item.faqs),
    };
  } catch {
    return {
      businessName: inferBusinessNameFromUrl(url),
      images: [],
      reviews: [],
      workingHours: [],
      services: [],
      faq: [],
    };
  }
}

export async function getInstagramData(url?: string): Promise<SocialSourceData> {
  if (!url) {
    return { images: [], services: [], reviews: [] };
  }

  try {
    const items = await runApifyActor<Record<string, unknown>>(INSTAGRAM_ACTOR_ID, {
      usernames: [],
      directUrls: [url],
      resultsType: "details",
      resultsLimit: 1,
      latestPostsLimit: 12,
    });

    const item = items[0] ?? {};
    const latestPosts = Array.isArray(item.latestPosts) ? item.latestPosts : [];

    return {
      username: toString(item.username) ?? toString(item.handle),
      bio: toString(item.biography) ?? toString(item.bio),
      profilePicture: toString(item.profilePicUrl) ?? toString(item.profilePicUrlHD),
      followers: toNumber(item.followersCount) ?? toNumber(item.followers),
      phone: toString(item.phoneNumber) ?? toString(item.phone),
      email: toString(item.email) ?? toString(item.contactEmail),
      images: uniqueStrings([
        ...extractImageUrls(item.profilePicUrl),
        ...extractImageUrls(latestPosts),
        ...extractImageUrls(item.images),
      ]),
      services: [],
      reviews: [],
    };
  } catch {
    return { images: [], services: [], reviews: [] };
  }
}

export async function getFacebookData(url?: string): Promise<SocialSourceData> {
  if (!url) {
    return { images: [], services: [], reviews: [] };
  }

  try {
    const items = await runApifyActor<Record<string, unknown>>(FACEBOOK_ACTOR_ID, {
      startUrls: [{ url }],
      resultsLimit: 1,
    });

    const item = items[0] ?? {};

    return {
      about: toString(item.about) ?? toString(item.intro) ?? toString(item.description),
      coverImage: toString(item.coverPhoto) ?? toString(item.coverUrl),
      profilePicture: toString(item.profilePicture) ?? toString(item.profilePicUrl),
      phone: toString(item.phone) ?? toString(item.phoneNumber),
      email: toString(item.email),
      images: uniqueStrings([
        ...extractImageUrls(item.coverPhoto),
        ...extractImageUrls(item.profilePicture),
        ...extractImageUrls(item.photos),
        ...extractImageUrls(item.images),
      ]),
      services: extractServices(item.services),
      reviews: extractReviews(item.reviews),
    };
  } catch {
    return { images: [], services: [], reviews: [] };
  }
}

export async function scrapeBusinessLinks({
  googleBusinessUrl,
  instagramUrl,
  facebookUrl,
}: ScrapeBusinessLinksInput): Promise<BusinessData> {
  const [googleData, instagramData, facebookData] = await Promise.all([
    getGoogleBusinessData(googleBusinessUrl),
    getInstagramData(instagramUrl),
    getFacebookData(facebookUrl),
  ]);

  const images = uniqueStrings([
    ...googleData.images,
    googleData.logo,
    ...instagramData.images,
    ...facebookData.images,
    facebookData.coverImage,
    facebookData.profilePicture,
  ]);

  const reviews =
    googleData.reviews.length > 0
      ? googleData.reviews
      : facebookData.reviews.length > 0
        ? facebookData.reviews
        : [];

  return {
    businessName: googleData.businessName ?? inferBusinessNameFromUrl(googleBusinessUrl),
    category: googleData.category,
    description:
      googleData.description ??
      instagramData.bio ??
      facebookData.about,
    rating: googleData.rating,
    reviewCount: googleData.reviewCount ?? reviews.length,
    reviews,
    images,
    logo: googleData.logo ?? instagramData.profilePicture ?? facebookData.profilePicture,
    address: googleData.address,
    coordinates: googleData.coordinates,
    phone: googleData.phone ?? instagramData.phone ?? facebookData.phone,
    website: googleData.website,
    email: instagramData.email ?? facebookData.email,
    workingHours: googleData.workingHours,
    services: uniqueStrings([...googleData.services, ...facebookData.services]),
    faq: googleData.faq,
    socialLinks: {
      googleBusinessUrl,
      instagramUrl: instagramUrl || undefined,
      facebookUrl: facebookUrl || undefined,
    },
    instagram: {
      username: instagramData.username,
      bio: instagramData.bio,
      profilePicture: instagramData.profilePicture,
      followers: instagramData.followers,
    },
    facebook: {
      about: facebookData.about,
      coverImage: facebookData.coverImage,
      profilePicture: facebookData.profilePicture,
    },
  };
}
