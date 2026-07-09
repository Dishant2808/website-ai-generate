"use client";

import { motion } from "framer-motion";

import { GalleryItem } from "@/components/gallery-item";
import { SafeImage } from "@/components/safe-image";
import {
  buttonRadius,
  cardClass,
  getContactData,
  getCtaData,
  getFaqData,
  getFaqTitle,
  getGalleryData,
  getHeroData,
  getMapData,
  getProcessData,
  getReviewsData,
  getServiceAreaData,
  getServicesData,
  getStatsItems,
  getWhyChooseUsData,
  sectionAnchor,
} from "@/lib/homepage";
import type { HomepageData, HomepageSection } from "@/types/homepage";

type SectionProps = {
  data: HomepageData;
  section: HomepageSection;
  index: number;
};

function Stars({ rating = 0, light = false }: { rating?: number; light?: boolean }) {
  const normalized = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-1.5" aria-label={`${normalized.toFixed(1)} star rating`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, normalized - i));
          const emptyColor = light ? "text-white/35" : "text-slate-300";

          if (fill >= 1) {
            return (
              <span key={i} className="text-amber-400">
                ★
              </span>
            );
          }

          if (fill > 0) {
            return (
              <span key={i} className="relative inline-block text-base leading-none">
                <span className={emptyColor}>★</span>
                <span
                  className="absolute inset-0 overflow-hidden text-amber-400"
                  style={{ width: `${fill * 100}%` }}
                  aria-hidden
                >
                  ★
                </span>
              </span>
            );
          }

          return (
            <span key={i} className={emptyColor}>
              ★
            </span>
          );
        })}
      </div>
      <span className={`text-sm font-semibold ${light ? "text-white/90" : "text-slate-700"}`}>
        {normalized.toFixed(1)}
      </span>
    </div>
  );
}

function SectionShell({
  id,
  children,
  className = "",
  style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color }}>
      {children}
    </p>
  );
}

export function HeroSection({ data, section }: SectionProps) {
  const hero = getHeroData(data, section);
  const heroImage = data.images[0];
  const { theme } = data;

  return (
    <SectionShell id={sectionAnchor("hero")} className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(115deg, rgba(2,6,23,0.82), rgba(2,6,23,0.45)), url(${heroImage})`
            : `linear-gradient(115deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div className="space-y-6 text-white">
          <div className="flex flex-wrap items-center gap-3">
            {data.logo ? (
              <SafeImage src={data.logo} alt={`${data.businessName} logo`} className="h-12 w-12 rounded-2xl object-cover" />
            ) : null}
            <div>
              <SectionLabel color="rgba(255,255,255,0.75)">{data.category ?? "Business"}</SectionLabel>
              <p className="text-sm text-white/80">{data.businessName}</p>
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{hero.title}</h1>
          <p className="max-w-xl text-base leading-7 text-white/85 sm:text-lg">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
              style={{
                borderRadius: buttonRadius(theme.buttonStyle),
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              }}
            >
              {hero.ctaLabel}
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              style={{ borderRadius: buttonRadius(theme.buttonStyle) }}
            >
              {hero.ctaSecondary}
            </a>
          </div>
          {data.rating !== undefined ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
              <Stars rating={data.rating} light />
              <span>{data.rating.toFixed(1)} Google Rating</span>
              {data.reviewCount !== undefined ? <span>{data.reviewCount} reviews</span> : null}
            </div>
          ) : null}
        </div>
        {heroImage && theme.heroStyle !== "centered" ? (
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl">
              <SafeImage src={heroImage} alt={data.businessName} className="h-[420px] w-full object-cover" />
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export function StatsSection({ data, section, index }: SectionProps) {
  const items = getStatsItems(data, section);
  const bg = index % 2 === 0 ? data.theme.secondaryColor : "#ffffff";

  return (
    <SectionShell id={sectionAnchor("stats")} style={{ backgroundColor: bg }}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 py-14 sm:px-6 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.5rem] p-5 text-center ${cardClass(data.theme.cardStyle)}`}
          >
            <p className="text-2xl font-semibold" style={{ color: data.theme.primaryColor }}>
              {item.value}
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function WhyChooseUsSection({ data, section, index }: SectionProps) {
  const content = getWhyChooseUsData(data, section);
  const image = data.images[content.imageIndex] ?? data.images[0];
  const bg = index % 2 === 0 ? "#ffffff" : data.theme.secondaryColor;

  return (
    <SectionShell id={sectionAnchor("whyChooseUs")} style={{ backgroundColor: bg }}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <SectionLabel color={data.theme.accentColor}>{content.title}</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
          {content.description ? <p className="text-base leading-7 text-slate-600">{content.description}</p> : null}
          <ul className="space-y-3">
            {content.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-slate-700">
                <span
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: data.theme.accentColor }}
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        {image ? (
          <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(15,23,42,0.15)]">
            <SafeImage src={image} alt={content.title} className="h-[360px] w-full object-cover" />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export function ServicesSection({ data, section, index }: SectionProps) {
  const content = getServicesData(data, section);
  const bg = index % 2 === 0 ? data.theme.secondaryColor : "#ffffff";

  return (
    <SectionShell id={sectionAnchor("services")} style={{ backgroundColor: bg }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <SectionLabel color={data.theme.accentColor}>Services</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className={`group rounded-[1.5rem] p-6 transition hover:-translate-y-1 ${cardClass(data.theme.cardStyle)}`}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: data.theme.primaryColor }}
              >
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
              {item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function GallerySection({ data, section, index }: SectionProps) {
  const content = getGalleryData(section);
  const images = data.images.slice(0, 9);
  const bg = index % 2 === 0 ? "#ffffff" : data.theme.secondaryColor;

  return (
    <SectionShell id={sectionAnchor("gallery")} style={{ backgroundColor: bg }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <SectionLabel color={data.theme.accentColor}>Gallery</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, i) => (
            <GalleryItem key={src} src={src} alt={`${data.businessName} ${i + 1}`} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function ProcessSection({ data, section, index }: SectionProps) {
  const content = getProcessData(section);
  const bg = index % 2 === 0 ? data.theme.secondaryColor : "#ffffff";

  return (
    <SectionShell id={sectionAnchor("process")} style={{ backgroundColor: bg }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <SectionLabel color={data.theme.accentColor}>Process</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, i) => (
            <div key={step.title} className={`relative rounded-[1.5rem] p-6 ${cardClass(data.theme.cardStyle)}`}>
              <span
                className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: data.theme.primaryColor }}
              >
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function ReviewsSection({ data, section, index }: SectionProps) {
  const content = getReviewsData(section);
  const bgImage = data.images[2] ?? data.images[0];
  const bg = index % 2 === 0 ? "#ffffff" : data.theme.secondaryColor;

  return (
    <SectionShell
      id={sectionAnchor("reviews")}
      className="relative overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {bgImage ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <SectionLabel color={data.theme.accentColor}>Reviews</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.slice(0, 6).map((review) => {
            const reviewRating = review.rating ?? data.rating ?? 5;

            return (
              <article
                key={`${review.author}-${review.text.slice(0, 20)}`}
                className={`rounded-[1.5rem] p-6 ${cardClass(data.theme.cardStyle)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-900">{review.author}</span>
                  {review.date ? <span className="text-sm text-slate-500">{review.date}</span> : null}
                </div>
                <div className="mt-2">
                  <Stars rating={reviewRating} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{review.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

export function FAQSection({ data, section, index }: SectionProps) {
  const items = getFaqData(data, section);
  const title = getFaqTitle(section);
  const bg = index % 2 === 0 ? data.theme.secondaryColor : "#ffffff";

  return (
    <SectionShell id={sectionAnchor("faq")} style={{ backgroundColor: bg }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <SectionLabel color={data.theme.accentColor}>FAQ</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
        <div className="space-y-4">
          {items.map((item, faqIndex) => (
            <details
              key={item.question}
              open={faqIndex === 0}
              className={`rounded-[1.25rem] p-5 ${cardClass(data.theme.cardStyle)}`}
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-900">{item.question}</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function CTASection({ data, section }: SectionProps) {
  const content = getCtaData(section);
  const bgImage = data.images[3] ?? data.images[0];

  return (
    <SectionShell id={sectionAnchor("cta")} className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: bgImage
            ? `linear-gradient(120deg, rgba(15,23,42,0.88), rgba(15,23,42,0.72)), url(${bgImage})`
            : `linear-gradient(120deg, ${data.theme.primaryColor}, ${data.theme.accentColor})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/85">{content.subtitle}</p>
        <a
          href="#contact"
          className="mt-8 inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-slate-900 transition hover:opacity-95"
          style={{
            borderRadius: buttonRadius(data.theme.buttonStyle),
            backgroundColor: "#ffffff",
          }}
        >
          {content.buttonLabel}
        </a>
      </div>
    </SectionShell>
  );
}

export function ContactSection({ data, section, index }: SectionProps) {
  const content = getContactData(section);
  const bg = index % 2 === 0 ? "#ffffff" : data.theme.secondaryColor;

  return (
    <SectionShell id={sectionAnchor("contact")} style={{ backgroundColor: bg }}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="space-y-5">
          <SectionLabel color={data.theme.accentColor}>Contact</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
          <div className="space-y-4 text-sm text-slate-700">
            {data.phone ? (
              <p>
                <span className="font-semibold text-slate-900">Phone: </span>
                <a href={`tel:${data.phone}`} className="hover:underline">
                  {data.phone}
                </a>
              </p>
            ) : null}
            {data.email ? (
              <p>
                <span className="font-semibold text-slate-900">Email: </span>
                <a href={`mailto:${data.email}`} className="hover:underline">
                  {data.email}
                </a>
              </p>
            ) : null}
            {data.address ? (
              <p>
                <span className="font-semibold text-slate-900">Address: </span>
                {data.address}
              </p>
            ) : null}
            {data.website ? (
              <p>
                <span className="font-semibold text-slate-900">Website: </span>
                <a href={data.website} target="_blank" rel="noreferrer" className="hover:underline">
                  {data.website}
                </a>
              </p>
            ) : null}
          </div>
          {data.workingHours.length > 0 ? (
            <div className={`rounded-[1.25rem] p-5 ${cardClass(data.theme.cardStyle)}`}>
              <p className="mb-3 text-sm font-semibold text-slate-900">Working Hours</p>
              <ul className="space-y-1 text-sm text-slate-600">
                {data.workingHours.map((day) => (
                  <li key={day.day} className="flex justify-between gap-4">
                    <span>{day.day}</span>
                    <span>{day.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {data.directionsUrl ? (
              <a
                href={data.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white"
                style={{
                  borderRadius: buttonRadius(data.theme.buttonStyle),
                  background: `linear-gradient(135deg, ${data.theme.primaryColor}, ${data.theme.accentColor})`,
                }}
              >
                Google Maps
              </a>
            ) : null}
            {data.socialLinks.instagramUrl ? (
              <a href={data.socialLinks.instagramUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:underline">
                Instagram
              </a>
            ) : null}
            {data.socialLinks.facebookUrl ? (
              <a href={data.socialLinks.facebookUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:underline">
                Facebook
              </a>
            ) : null}
          </div>
        </div>
        {data.images[1] ? (
          <div className="overflow-hidden rounded-[2rem] shadow-lg">
            <SafeImage src={data.images[1]} alt="Contact" className="h-full min-h-[320px] w-full object-cover" />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

export function MapSection({ data, section }: SectionProps) {
  const content = getMapData(section);
  if (!data.mapEmbedUrl) {
    return null;
  }

  return (
    <SectionShell id={sectionAnchor("map")}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-6">
          <SectionLabel color={data.theme.accentColor}>Location</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{content.title}</h2>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-lg">
          <iframe
            title="Business location map"
            src={data.mapEmbedUrl}
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </SectionShell>
  );
}

export function ServiceAreaSection({ data, section, index }: SectionProps) {
  const content = getServiceAreaData(data, section);
  const bg = index % 2 === 0 ? data.theme.secondaryColor : "#ffffff";

  return (
    <SectionShell id={sectionAnchor("serviceArea")} style={{ backgroundColor: bg }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <SectionLabel color={data.theme.accentColor}>Service Area</SectionLabel>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{content.title}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {content.areas.map((area) => (
            <span
              key={area}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700"
              style={{ backgroundColor: `${data.theme.primaryColor}15`, color: data.theme.primaryColor }}
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function renderHomepageSection(props: SectionProps): React.ReactNode {
  switch (props.section.type) {
    case "hero":
      return <HeroSection {...props} />;
    case "stats":
      return <StatsSection {...props} />;
    case "whyChooseUs":
      return <WhyChooseUsSection {...props} />;
    case "services":
      return <ServicesSection {...props} />;
    case "gallery":
      return <GallerySection {...props} />;
    case "process":
      return <ProcessSection {...props} />;
    case "reviews":
      return <ReviewsSection {...props} />;
    case "faq":
      return <FAQSection {...props} />;
    case "cta":
      return <CTASection {...props} />;
    case "contact":
      return <ContactSection {...props} />;
    case "map":
      return <MapSection {...props} />;
    case "serviceArea":
      return <ServiceAreaSection {...props} />;
    default:
      return null;
  }
}
