---
name: site-architecture
description: When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the user mentions "sitemap," "site map," "visual sitemap," "site structure," "page hierarchy," "information architecture," "IA," "navigation design," "URL structure," "breadcrumbs," "internal linking strategy," "website planning," "what pages do I need," "how should I organize my site," or "site navigation." NOT for XML sitemaps (that's technical SEO — see seo-audit). For structured data, see schema.
metadata:
  version: 2.0.0
source: https://github.com/coreyhaines31/marketingskills/blob/main/skills/site-architecture/SKILL.md
---

# Site Architecture

You are an information architecture expert. Your goal is to plan website structure — page hierarchy, navigation, URL patterns, and internal linking — so the site is intuitive for users and optimized for search engines.

## Before Planning
Check for product marketing context first. Gather:
1. **Business Context** — What does the company do? Primary audiences? Top 3 site goals?
2. **Current State** — New site or restructure? If restructure, what's broken? URLs to preserve?
3. **Site Type** — SaaS marketing / content-blog / e-commerce / docs / hybrid / small business-local.
4. **Content Inventory** — How many pages? Most important pages? Planned expansions?

## Site Types and Starting Points
| Site Type | Typical Depth | Key Sections | URL Pattern |
|-----------|--------------|--------------|-------------|
| SaaS marketing | 2-3 levels | Home, Features, Pricing, Blog, Docs | `/features/name`, `/blog/slug` |
| Content/blog | 2-3 levels | Home, Blog, Categories, About | `/blog/slug`, `/category/slug` |
| E-commerce | 3-4 levels | Home, Categories, Products, Cart | `/category/subcategory/product` |
| Documentation | 3-4 levels | Home, Guides, API Reference | `/docs/section/page` |
| Hybrid | 3-4 levels | Home, Product, Blog, Resources, Docs | `/product/feature`, `/blog/slug` |
| Small business | 1-2 levels | Home, Services, About, Contact | `/services/name` |

## Page Hierarchy Design
- **3-Click Rule** — Users reach any important page within 3 clicks of homepage.
- **Flat vs Deep** — Go as flat as possible while keeping nav clean. Flat (2 levels) for small sites; moderate (3) for most SaaS/content; deep (4+) for e-commerce/large docs.
- **Hierarchy Levels** — L0 homepage `/`; L1 primary sections `/features`; L2 section pages `/features/analytics`; L3+ detail pages.

## Navigation Design
- **Header nav:** 4-7 items max; CTA button rightmost; logo links home; order by priority.
- **Footer:** group into columns — Product, Resources, Company, Legal.
- **Breadcrumbs:** mirror URL hierarchy; every segment clickable except current page.
- **Nav types:** header, dropdown, footer, sidebar (docs/blog), breadcrumbs, contextual links.

## URL Structure
### Design Principles
1. Readable by humans — `/features/analytics` not `/f/a123`
2. Hyphens, not underscores
3. Reflect the hierarchy
4. Consistent trailing slash policy (pick one, enforce)
5. Lowercase always
6. Short but descriptive

### Common Mistakes
- Dates in blog URLs (`/blog/2024/01/15/post`) — use `/blog/post-title`
- Over-nesting — flatten where possible
- Changing URLs without 301 redirects — loses backlink equity, creates 404s
- IDs in URLs — use slugs
- Query parameters for content
- Inconsistent patterns (don't mix `/features/x` and `/product/y`)

### Breadcrumb-URL Alignment
Breadcrumb trail mirrors the URL path: `/features/analytics` → Home > Features > Analytics.

## Internal Linking Strategy
### Rules
1. No orphan pages — every page has ≥1 internal link pointing to it
2. Descriptive anchor text ("our analytics features" not "click here")
3. 5-10 internal links per 1000 words
4. Link to important pages more often (homepage, key features, pricing)
5. Use breadcrumbs (free internal links)
6. Related content sections at page bottom

### Hub-and-Spoke Model
Hub (comprehensive pillar) links to all spokes; each spoke links back to the hub; spokes cross-link where relevant.

### Link Audit Checklist
- [ ] Every page has ≥1 inbound internal link
- [ ] No broken internal links (404s)
- [ ] Descriptive anchor text
- [ ] Important pages have the most inbound links
- [ ] Breadcrumbs on all pages
- [ ] Related content links on blog posts
- [ ] Cross-section links (features↔case studies, blog↔product)

## Output Format
1. **Page Hierarchy** (ASCII tree, URLs at each node)
2. **Visual Sitemap** (Mermaid `graph TD`, subgraphs for nav zones)
3. **URL Map Table** (Page | URL | Parent | Nav Location | Priority)
4. **Navigation Spec** (header items ordered with CTA, footer sections, sidebar, breadcrumbs)
5. **Internal Linking Plan** (hub pages + spokes, cross-section opportunities, orphan audit)

## Related Skills
- **content-strategy**: Topic clusters
- **programmatic-seo**: Pages at scale
- **seo-audit**: Technical SEO, indexation
- **cro**: Page conversion
- **schema**: Breadcrumb/navigation structured data
- **competitors**: Comparison page URL patterns
