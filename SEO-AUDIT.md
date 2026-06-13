# SEO / AEO / GEO Audit — msalmantahir.com

**Date:** 13 June 2026  
**Auditor:** Development Team  
**Domain:** https://msalmantahir.com

---

## Current Status Summary

| Area | Score | Status |
|------|-------|--------|
| Technical SEO | 4/10 | Needs major work |
| On-Page SEO | 5/10 | Moderate |
| Structured Data (AEO) | 3/10 | Only blog articles have schema |
| GEO (Generative Engine) | 2/10 | Almost nothing |
| Content SEO | 5/10 | Good base, needs expansion |
| Performance | 6/10 | Decent, chunk too large |

---

## 1. TECHNICAL SEO ISSUES

### Critical Issues

| # | Issue | Impact |
|---|-------|--------|
| 1 | **Duplicate `<title>` tags** in index.html (line 4 and line 9) | Google picks wrong title |
| 2 | **Duplicate `<meta name="description">`** (line 6 and line 10) | Conflicting signals |
| 3 | **No canonical URL** on homepage | Duplicate content risk |
| 4 | **No `<html lang="en-PK">`** — uses just `"en"` | Geo-targeting missed |
| 5 | **SPA without SSR for main pages** — only blog posts get SSR meta injection | Google sees empty `<div id="root">` for homepage, practice areas, etc. |
| 6 | **robots.txt missing `Sitemap:` directive** | Crawlers won't auto-discover sitemap |
| 7 | **Hash-based URLs in sitemap** (`/#reviews`, `/#contact`) | Google doesn't index hash fragments |
| 8 | **No `hreflang` tags** | Missing for Urdu audience |
| 9 | **Missing pages in sitemap** — `/privacy-policy`, `/refund-policy`, `/service-policy`, `/terms-and-conditions`, `/fees` not listed | Uncrawled pages |
| 10 | **OG image commented out** — no social share image | Poor social sharing |

### Moderate Issues

| # | Issue |
|---|-------|
| 11 | No `X-Robots-Tag` headers |
| 12 | Large JS bundle (834KB) — should be code-split |
| 13 | No preconnect/prefetch hints for fonts |
| 14 | No `<link rel="icon">` (favicon) defined |

---

## 2. ON-PAGE SEO

### Homepage

| Element | Current | Recommendation |
|---------|---------|----------------|
| H1 | "M Salman Tahir" (good) | Add "Advocate High Court Pakistan" |
| H2s | "Our Services", "Words from Those We've Served" | Use keyword-rich: "Legal Services in Lahore", "Client Reviews" |
| Image alt | `"Lahore High Court, Pakistan"` (good) | Keep |
| Internal linking | Blog link present | Add links to practice area subpages |
| Content depth | Thin — services are short descriptions | Expand each service with 200+ words |
| Keyword targeting | No clear primary keyword strategy | Target: "advocate lahore", "lawyer lahore high court", "criminal lawyer pakistan" |

### Blog Posts

| Element | Status |
|---------|--------|
| SSR meta injection | ✅ Working |
| JSON-LD Article schema | ✅ Implemented |
| Canonical URL | ✅ Present |
| OG/Twitter cards | ✅ Present |
| Dynamic title | ✅ Working |

---

## 3. AEO (Answer Engine Optimization) — Critical Gaps

AEO focuses on structured data that helps search engines (and AI assistants) extract direct answers.

### Missing Structured Data

| Schema Type | Why Needed | Priority |
|-------------|-----------|----------|
| **`LegalService`** (homepage) | Tells Google this is a legal service business | HIGH |
| **`Attorney` / `Person`** | Identifies M Salman Tahir as a lawyer | HIGH |
| **`LocalBusiness`** | NAP data (Name, Address, Phone) for local search | HIGH |
| **`FAQPage`** | Practice areas as Q&A — appears in featured snippets | HIGH |
| **`Review` / `AggregateRating`** | Shows star ratings in search results | MEDIUM |
| **`BreadcrumbList`** | Breadcrumb rich results for blog | MEDIUM |
| **`Service`** | Each practice area as a service | MEDIUM |
| **`WebSite` with SearchAction** | Sitelinks search box | LOW |

### No FAQ Content
- No FAQ section exists — this is the #1 AEO opportunity
- Questions like "How much does a lawyer cost in Lahore?", "How to file for bail in Pakistan?" would drive organic traffic

---

## 4. GEO (Generative Engine Optimization) — Almost Non-existent

GEO ensures AI chatbots (ChatGPT, Gemini, Perplexity) cite your website when answering legal questions about Pakistan.

### Current State: ❌ Not optimized

| GEO Factor | Status | Fix |
|------------|--------|-----|
| **Authoritative content** | Only 1 blog post | Need 20+ in-depth articles |
| **E-E-A-T signals** | No author bio page, no credentials listed in schema | Add `/about` page with bar council info |
| **Citeable content** | No statistics, no case law references | Add data-backed legal content |
| **Content freshness** | Blog just created | Publish 2-3 posts/week |
| **Entity recognition** | No clear entity markup | Add `sameAs` links (LinkedIn, bar council profile) |
| **Topical authority** | Covers 8 services briefly | Need cluster content: 5+ articles per practice area |
| **Direct answer format** | No content structured as Q&A | Add FAQ sections to each page |

---

## 5. CONTENT STRATEGY GAPS

### Missing Pages (Critical for SEO)

| Page | URL | Purpose |
|------|-----|---------|
| About / Attorney Profile | `/about` | E-E-A-T, schema, credentials |
| Individual Practice Area pages | `/services/criminal-defense` etc. | Long-form keyword targeting |
| FAQ page | `/faq` | Featured snippet targeting, AEO |
| Case Results page | `/case-results` | Trust signals, GEO citations |
| Contact (standalone) | Already a section | Make it its own page for local SEO |

### Blog Content Needed (Priority Topics for Pakistan Legal SEO)

1. "Bail process in Pakistan — Complete Guide"
2. "Property dispute resolution in Lahore"
3. "Khula procedure in Pakistan 2024"
4. "How to file a FIR in Pakistan"
5. "Cybercrime law in Pakistan — PCA 2016"
6. "Commercial contract disputes — Lahore High Court"
7. "Lawyer fees in Pakistan — What to expect"
8. "Child custody laws in Pakistan"
9. "Anti-terrorism cases defense"
10. "Power of Attorney — drafting guide"

---

## 6. LOCAL SEO

| Factor | Status | Fix |
|--------|--------|-----|
| Google Business Profile | Unknown | Claim/verify GBP |
| NAP consistency | Address on page | Add to schema |
| Local keywords | Not targeted | "lawyer in Lahore", "advocate near Lahore High Court" |
| Map embed | ✅ Present | Good |
| Local schema | ❌ Missing | Add `LocalBusiness` JSON-LD |

---

## 7. RECOMMENDED IMPLEMENTATION PRIORITIES

### Phase 1 — Quick Wins (Do Now)

1. Fix duplicate title/meta tags in index.html
2. Add canonical URL to homepage
3. Add `Sitemap: https://msalmantahir.com/sitemap.xml` to robots.txt
4. Remove hash URLs from sitemap, add real page URLs
5. Add `LocalBusiness` + `Attorney` JSON-LD to homepage
6. Add `FAQPage` schema with common legal questions
7. Fix OG image (add a professional image)

### Phase 2 — Structural (This Week)

8. Create individual practice area pages (`/services/criminal-defense`)
9. Create `/about` page with full credentials, bar council enrollment, sameAs links
10. Add `Review` schema to testimonials section
11. Add SSR meta injection for homepage (detect crawlers)
12. Add breadcrumb schema to blog
13. Code-split the 834KB JS bundle

### Phase 3 — Content (Ongoing)

14. Publish 2-3 SEO-targeted blog posts per week
15. Add FAQ sections to every practice area page
16. Create "How-to" guides for common legal procedures
17. Add internal links between related blog posts and service pages

---

## 8. TRACKING & TOOLS

- **Google Search Console** — Submit sitemap, monitor indexing
- **Google Analytics** — Already installed (G-DJH7X5PMDM)
- **Schema Validator** — https://validator.schema.org/
- **Rich Results Test** — https://search.google.com/test/rich-results
- **PageSpeed Insights** — Monitor Core Web Vitals
- **Ahrefs/SEMrush** — Keyword tracking and backlink monitoring
