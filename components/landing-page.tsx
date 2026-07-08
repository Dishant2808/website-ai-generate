import type { LandingPageData } from "@/lib/openai";
import { buildSectionConfig, resolveSectionOrder } from "@/lib/sections";
import { GalleryItem } from "@/components/gallery-item";
import { SafeImage } from "@/components/safe-image";

type LandingPageProps = {
  data: LandingPageData;
};

function Stars({ rating = 0, light = false }: { rating?: number; light?: boolean }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < filled ? "text-amber-400" : light ? "text-white/35" : "text-slate-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color }}>
      {children}
    </p>
  );
}

export function LandingPage({ data }: LandingPageProps) {
  const {
    businessName,
    category,
    heroTitle,
    heroSubtitle,
    ctaLabel,
    about,
    services,
    faq,
    design,
    rating,
    reviewCount,
    reviews,
    images,
    logo,
    address,
    phone,
    website,
    email,
    workingHours,
    socialLinks,
    mapEmbedUrl,
    directionsUrl,
    hasScrapedImages,
  } = data;

  const heroImage = images[0];
  const aboutImage = images[1] ?? images[0];
  const sideImage = images[2] ?? images[1] ?? images[0];
  const galleryImages = hasScrapedImages ? images.slice(0, 9) : [];
  const buttonRadius =
    design.buttonStyle === "pill" ? "999px" : design.buttonStyle === "soft" ? "14px" : "18px";

  const sections = buildSectionConfig({
    ...data,
    images,
    hasScrapedImages: galleryImages.length > 0,
  });

  const sectionMap: Record<string, React.ReactNode> = {
    hero: sections.hero ? (
      <section key="hero" className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: heroImage
              ? `linear-gradient(115deg, rgba(2,6,23,0.82), rgba(2,6,23,0.45)), url(${heroImage})`
              : `linear-gradient(115deg, ${design.primaryColor}, ${design.secondaryColor})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="space-y-6 text-white">
            <div className="flex flex-wrap items-center gap-3">
              {logo ? (
                <SafeImage
                  src={logo}
                  alt={`${businessName} logo`}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  {category ?? "Local Business"}
                </p>
                <p className="text-lg font-semibold">{businessName}</p>
              </div>
            </div>

            {(rating !== undefined || reviewCount !== undefined) && (
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                <Stars rating={rating} light />
                <span className="text-sm font-medium">
                  {rating?.toFixed(1) ?? "—"}
                  {reviewCount !== undefined ? ` · ${reviewCount} reviews` : ""}
                </span>
              </div>
            )}

            <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={directionsUrl ?? "#contact"}
                target={directionsUrl ? "_blank" : undefined}
                rel={directionsUrl ? "noreferrer" : undefined}
                className="px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:opacity-90"
                style={{ background: design.secondaryColor, borderRadius: buttonRadius }}
              >
                {ctaLabel}
              </a>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur"
                  style={{ borderRadius: buttonRadius }}
                >
                  Call Now
                </a>
              ) : null}
            </div>
          </div>

          {sideImage ? (
            <div className="relative hidden min-h-[380px] lg:block">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
                <SafeImage
                  src={sideImage}
                  alt={`${businessName} highlight`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    ) : null,
    stats: sections.stats ? (
      <section key="stats" className="border-b border-slate-200/70 bg-white py-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            rating !== undefined ? { label: "Rating", value: `${rating.toFixed(1)} ★` } : null,
            reviewCount !== undefined ? { label: "Reviews", value: String(reviewCount) } : null,
            category ? { label: "Category", value: category } : null,
            workingHours.length ? { label: "Open Hours", value: workingHours[0].hours } : null,
          ]
            .filter(Boolean)
            .map((item) => (
              <div
                key={item!.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">{item!.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{item!.value}</p>
              </div>
            ))}
        </div>
      </section>
    ) : null,
    about: sections.about ? (
      <section key="about" id="about" className="py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          {aboutImage ? (
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              <SafeImage
                src={aboutImage}
                alt={`${businessName} about`}
                className="min-h-[360px] w-full object-cover"
              />
            </div>
          ) : null}
          <div className="space-y-5">
            <SectionLabel color={design.accentColor}>About</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Why {businessName}</h2>
            <p className="text-base leading-relaxed text-slate-700 sm:text-lg">{about}</p>
          </div>
        </div>
      </section>
    ) : null,
    services: sections.services ? (
      <section key="services" id="services" className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 space-y-3">
            <SectionLabel color={design.accentColor}>Services</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What we offer</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ background: design.primaryColor }}
                >
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{service}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gallery: sections.gallery ? (
      <section key="gallery" id="gallery" className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 space-y-3">
            <SectionLabel color={design.accentColor}>Gallery</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A closer look</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((image, index) => (
              <GalleryItem
                key={`${image}-${index}`}
                src={image}
                alt={`${businessName} gallery ${index + 1}`}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      </section>
    ) : null,
    testimonials: sections.testimonials ? (
      <section key="testimonials" id="reviews" className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 space-y-3">
            <SectionLabel color={design.accentColor}>Google</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reviews</h2>
            {(rating !== undefined || reviewCount !== undefined) && (
              <p className="text-sm text-slate-600">
                {rating !== undefined ? `${rating.toFixed(1)}★ average` : ""}
                {rating !== undefined && reviewCount !== undefined ? " · " : ""}
                {reviewCount !== undefined ? `${reviewCount} reviews` : ""}
              </p>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <article
                key={`${review.author}-${review.text.slice(0, 24)}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
                    style={{ background: design.primaryColor }}
                  >
                    {review.avatarUrl ? (
                      <SafeImage
                        src={review.avatarUrl}
                        alt={review.author}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      review.author.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{review.author}</p>
                    {review.date ? <p className="text-xs text-slate-500">{review.date}</p> : null}
                  </div>
                </div>
                {review.rating !== undefined ? <Stars rating={review.rating} /> : null}
                <p className="mt-3 text-sm leading-relaxed text-slate-700">“{review.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    faq: sections.faq ? (
      <section key="faq" id="faq" className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-10 space-y-3">
            <SectionLabel color={design.accentColor}>FAQ</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Common questions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    contact: sections.contact ? (
      <section key="contact" id="contact" className="pb-10 sm:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div
            className="overflow-hidden rounded-[2rem] px-6 py-10 text-white shadow-xl sm:px-10"
            style={{
              backgroundImage: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <SectionLabel color="#ffffff">Contact</SectionLabel>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Visit {businessName}
                </h2>
                {address ? <p className="text-white/90">{address}</p> : null}
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={socialLinks.googleBusinessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white px-5 py-3 text-sm font-semibold text-slate-900"
                    style={{ borderRadius: buttonRadius }}
                  >
                    Google Maps
                  </a>
                  {directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                      style={{ borderRadius: buttonRadius }}
                    >
                      Directions
                    </a>
                  ) : null}
                  {socialLinks.instagramUrl ? (
                    <a
                      href={socialLinks.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                      style={{ borderRadius: buttonRadius }}
                    >
                      Instagram
                    </a>
                  ) : null}
                  {socialLinks.facebookUrl ? (
                    <a
                      href={socialLinks.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                      style={{ borderRadius: buttonRadius }}
                    >
                      Facebook
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
                {phone ? (
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span> {phone}
                  </p>
                ) : null}
                {website ? (
                  <p className="text-sm">
                    <span className="font-semibold">Website:</span>{" "}
                    <a href={website} target="_blank" rel="noreferrer" className="underline">
                      {website}
                    </a>
                  </p>
                ) : null}
                {email ? (
                  <p className="text-sm">
                    <span className="font-semibold">Email:</span> {email}
                  </p>
                ) : null}
                {workingHours.length > 0 ? (
                  <div className="pt-2">
                    <p className="mb-2 text-sm font-semibold">Opening Hours</p>
                    <div className="space-y-1 text-sm text-white/90">
                      {workingHours.slice(0, 7).map((item) => (
                        <div key={`${item.day}-${item.hours}`} className="flex justify-between gap-4">
                          <span>{item.day}</span>
                          <span>{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : null,
    map: sections.map ? (
      <section key="map" id="map" className="pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-lg">
            <iframe
              title={`${businessName} map`}
              src={mapEmbedUrl}
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    ) : null,
    footer: sections.footer ? (
      <footer key="footer" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-600 sm:px-6">
          <span>
            {businessName} · {new Date().getFullYear()}
          </span>
          <span className="hidden sm:inline">Built with AI Website Generator</span>
        </div>
      </footer>
    ) : null,
  };

  const orderedSections = resolveSectionOrder(design.sectionOrder, sections)
    .map((key) => sectionMap[key])
    .filter(Boolean);

  const fallbackOrder = resolveSectionOrder(undefined, sections)
    .map((key) => sectionMap[key])
    .filter(Boolean);

  return (
    <div
      data-landing-root="true"
      className="min-h-screen"
      style={{
        background: design.backgroundColor,
        color: design.textColor,
        fontFamily: `${design.font}, ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      <header className="sticky top-0 z-20 border-b border-white/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {logo ? (
              <SafeImage src={logo} alt="" className="h-9 w-9 rounded-xl object-cover" />
            ) : null}
            <p className="text-base font-semibold tracking-tight" style={{ color: design.primaryColor }}>
              {businessName}
            </p>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            {galleryImages.length ? <a href="#gallery">Gallery</a> : null}
            {reviews.length ? <a href="#reviews">Reviews</a> : null}
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {(orderedSections.length ? orderedSections : fallbackOrder).map((section) => section)}
    </div>
  );
}
