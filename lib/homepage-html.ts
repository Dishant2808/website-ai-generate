import {
  getFaqData,
  getHeroData,
  getReviewsData,
  getServicesData,
  getShortDescription,
  getWhyChooseUsData,
  PRIMARY_NAV,
} from "@/lib/homepage";
import type { HomepageData } from "@/types/homepage";

/** Bump when HTML export template changes so cached screenshots regenerate. */
export const HOMEPAGE_HTML_VERSION = 4;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderStarsHtml(rating: number): string {
  const normalized = Math.max(0, Math.min(5, rating));
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, normalized - i));
    const color = fill >= 0.5 ? "#fbbf24" : "#cbd5e1";
    return `<span style="color:${color}">★</span>`;
  }).join("");

  return `<div class="review-rating">${stars}<span class="rating-value">${normalized.toFixed(1)}</span></div>`;
}

export function renderLandingHtml(data: HomepageData): string {
  const heroSection = data.sections.find((s) => s.type === "hero");
  const hero = heroSection
    ? getHeroData(data, heroSection)
    : { title: data.businessName, subtitle: "", ctaLabel: "Contact", ctaSecondary: "Learn More" };
  const heroImage = data.images[0];
  const { theme, businessName, logo, phone, address } = data;
  const year = new Date().getFullYear();
  const description = getShortDescription(data);

  const servicesSection = data.sections.find((s) => s.type === "services");
  const services = servicesSection ? getServicesData(data, servicesSection).items : [];

  const whySection = data.sections.find((s) => s.type === "whyChooseUs");
  const why = whySection ? getWhyChooseUsData(data, whySection) : null;

  const faqSection = data.sections.find((s) => s.type === "faq");
  const faq = faqSection ? getFaqData(data, faqSection) : [];

  const reviewsSection = data.sections.find((s) => s.type === "reviews");
  const reviewsTitle = reviewsSection ? getReviewsData(reviewsSection).title : "Reviews";

  const navHtml = PRIMARY_NAV.map(
    (item) => `<a href="${item.href}" class="nav-link">${escapeHtml(item.label)}</a>`
  ).join("");

  const footerLinksHtml = PRIMARY_NAV.map(
    (item) => `<a href="${item.href}" class="footer-link">${escapeHtml(item.label)}</a>`
  ).join("");

  const galleryHtml = data.images
    .slice(0, 6)
    .map(
      (img) => `<div class="item"><img src="${img}" alt="${escapeHtml(businessName)}" /></div>`
    )
    .join("");

  const reviewsHtml = data.reviews
    .slice(0, 6)
    .map((review) => {
      const reviewRating = review.rating ?? data.rating ?? 5;

      return `<article class="card">
        <strong>${escapeHtml(review.author)}</strong>
        ${renderStarsHtml(reviewRating)}
        <p>${escapeHtml(review.text)}</p>
      </article>`;
    })
    .join("");

  const servicesHtml = services
    .map(
      (s) =>
        `<div class="card"><strong>${escapeHtml(s.name)}</strong>${s.description ? `<p>${escapeHtml(s.description)}</p>` : ""}</div>`
    )
    .join("");

  const faqHtml = faq
    .map(
      (item, faqIndex) =>
        `<details class="card"${faqIndex === 0 ? " open" : ""}><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(businessName)}</title>
  <style>
    :root{--p:${theme.primaryColor};--s:${theme.secondaryColor};--a:${theme.accentColor};}
    *{box-sizing:border-box}
    body{margin:0;background:#fff;color:#0f172a;font-family:${theme.fontFamily},Inter,system-ui,sans-serif}
    .site-header{position:sticky;top:0;z-index:50;border-bottom:1px solid #e2e8f0;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);box-shadow:0 1px 3px rgba(15,23,42,.06)}
    .header-inner,.wrap,.footer-inner{max-width:1120px;margin:0 auto;padding:0 28px}
    .header-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
    .brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#0f172a;font-weight:600;font-size:16px}
    .brand img{width:40px;height:40px;border-radius:12px;object-fit:cover}
    .brand-mark{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;background:linear-gradient(135deg,var(--p),var(--a))}
    .site-nav{display:flex;gap:24px}
    .nav-link{color:#475569;text-decoration:none;font-size:14px;font-weight:500}
    .nav-link:hover{color:#0f172a}
    .header-actions{display:flex;align-items:center;gap:12px}
    .header-phone{color:#334155;text-decoration:none;font-size:14px;font-weight:500}
    .btn-contact{display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:14px;background:linear-gradient(135deg,var(--p),var(--a));color:#fff;text-decoration:none;font-size:14px;font-weight:600}
    .hero{padding:64px 0;background-image:${heroImage ? `linear-gradient(120deg,rgba(2,6,23,.78),rgba(2,6,23,.42)),url('${heroImage}')` : "linear-gradient(120deg,var(--p),var(--s))"};background-size:cover;background-position:center;color:#fff}
    h1{font-size:52px;line-height:1.05;margin:10px 0 0}.sub{max-width:620px;line-height:1.7}
    section{padding:56px 0}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:18px}
    .review-rating{display:flex;align-items:center;gap:6px;margin:8px 0 10px}
    .review-rating .rating-value{font-size:14px;font-weight:600;color:#334155}
    .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.item{height:220px;border-radius:20px;overflow:hidden}
    .item img{width:100%;height:100%;object-fit:cover;display:block}
    .site-footer{background:#020617;color:#cbd5e1;border-top:1px solid #1e293b}
    .footer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;padding:48px 0}
    .footer-title{color:#fff;font-size:18px;font-weight:600;margin:0 0 8px}
    .footer-text{color:#94a3b8;font-size:14px;line-height:1.6;margin:0}
    .footer-label{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#64748b;margin:0 0 12px}
    .footer-links{display:flex;flex-direction:column;gap:8px}
    .footer-link{color:#94a3b8;text-decoration:none;font-size:14px}
    .footer-link:hover{color:#fff}
    .footer-bottom{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #1e293b;padding:24px 0;font-size:12px;color:#64748b}
    @media (max-width:900px){.site-nav,.header-phone{display:none}.footer-grid{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <div class="header-row">
        <a href="#home" class="brand">
          ${logo ? `<img src="${logo}" alt="${escapeHtml(businessName)}" />` : `<span class="brand-mark">${escapeHtml(businessName.charAt(0))}</span>`}
          <span>${escapeHtml(businessName)}</span>
        </a>
        <nav class="site-nav">${navHtml}</nav>
        <div class="header-actions">
          ${phone ? `<a href="tel:${escapeHtml(phone)}" class="header-phone">${escapeHtml(phone)}</a>` : ""}
          <a href="#contact" class="btn-contact">Contact</a>
        </div>
      </div>
    </div>
  </header>

  <section id="home" class="hero"><div class="wrap">
    <p>${escapeHtml(data.category ?? "Business")}</p>
    <h1>${escapeHtml(hero.title)}</h1>
    <p class="sub">${escapeHtml(hero.subtitle)}</p>
  </div></section>
  ${why ? `<section id="why-us"><div class="wrap"><h2>${escapeHtml(why.title)}</h2><p>${escapeHtml(why.description)}</p></div></section>` : ""}
  ${servicesHtml ? `<section id="services"><div class="wrap"><h2>Services</h2><div class="cards">${servicesHtml}</div></div></section>` : ""}
  ${galleryHtml ? `<section id="gallery"><div class="wrap"><h2>Gallery</h2><div class="gallery">${galleryHtml}</div></div></section>` : ""}
  ${reviewsHtml ? `<section id="reviews"><div class="wrap"><h2>${escapeHtml(reviewsTitle)}</h2><div class="cards">${reviewsHtml}</div></div></section>` : ""}
  ${faqHtml ? `<section id="faq"><div class="wrap"><h2>FAQ</h2>${faqHtml}</div></section>` : ""}

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div>
          <p class="footer-title">${escapeHtml(businessName)}</p>
          <p class="footer-text">${escapeHtml(description)}</p>
        </div>
        <div>
          <p class="footer-label">Quick Links</p>
          <div class="footer-links">${footerLinksHtml}</div>
        </div>
        <div>
          <p class="footer-label">Address</p>
          <div class="footer-links">
            ${address ? `<span class="footer-link">${escapeHtml(address)}</span>` : `<span class="footer-link">—</span>`}
          </div>
        </div>
        <div>
          <p class="footer-label">Contact</p>
          <div class="footer-links">
            ${phone ? `<a href="tel:${escapeHtml(phone)}" class="footer-link">${escapeHtml(phone)}</a>` : `<span class="footer-link">—</span>`}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${escapeHtml(businessName)}. All rights reserved.</span>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
