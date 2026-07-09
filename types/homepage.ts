import type { BusinessCoordinates, BusinessReview, WorkingHoursDay } from "@/types";

export type HomepageSectionType =
  | "hero"
  | "stats"
  | "whyChooseUs"
  | "services"
  | "gallery"
  | "process"
  | "reviews"
  | "faq"
  | "cta"
  | "contact"
  | "map"
  | "serviceArea";

export type HomepageTheme = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: string;
  cardStyle: string;
  heroStyle: string;
};

export type HomepageSection = {
  type: HomepageSectionType;
  data: Record<string, unknown>;
};

export type HomepageData = {
  businessName: string;
  category?: string;
  theme: HomepageTheme;
  navigation: string[];
  sections: HomepageSection[];
  rating?: number;
  reviewCount?: number;
  reviews: BusinessReview[];
  images: string[];
  logo?: string;
  address?: string;
  coordinates?: BusinessCoordinates;
  phone?: string;
  website?: string;
  email?: string;
  workingHours: WorkingHoursDay[];
  socialLinks: {
    googleBusinessUrl: string;
    instagramUrl?: string;
    facebookUrl?: string;
  };
  mapEmbedUrl?: string;
  directionsUrl?: string;
  hasScrapedImages: boolean;
  faq: Array<{ question: string; answer: string }>;
  services: string[];
};

export type StatItem = { label: string; value: string };
export type ServiceItem = { name: string; description?: string };
export type ProcessStep = { title: string; description: string };
export type FaqItem = { question: string; answer: string };
