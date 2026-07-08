export type BusinessFormValues = {
  googleBusinessProfileUrl: string;
  instagramUrl: string;
  facebookUrl: string;
};

export type BusinessReview = {
  author: string;
  rating?: number;
  text: string;
  date?: string;
  avatarUrl?: string;
};

export type WorkingHoursDay = {
  day: string;
  hours: string;
};

export type BusinessCoordinates = {
  lat: number;
  lng: number;
};

export type BusinessData = {
  businessName?: string;
  category?: string;
  description?: string;
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
  services: string[];
  faq: Array<{ question: string; answer: string }>;
  socialLinks: {
    googleBusinessUrl: string;
    instagramUrl?: string;
    facebookUrl?: string;
  };
  instagram?: {
    username?: string;
    bio?: string;
    profilePicture?: string;
    followers?: number;
  };
  facebook?: {
    about?: string;
    coverImage?: string;
    profilePicture?: string;
  };
};
