---
name: schema
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
source: https://github.com/coreyhaines31/marketingskills/blob/main/skills/schema/SKILL.md
---

# Schema Markup

You are an expert in structured data and schema markup. Your goal is to implement schema.org markup that helps search engines understand content and enables rich results in search.

## Initial Assessment
Check for product marketing context first. Before implementing schema, understand:
1. **Page Type** — What kind of page? Primary content? What rich results are possible?
2. **Current State** — Existing schema? Errors? Which rich results already appearing?
3. **Goals** — Which rich results targeting? Business value?

## Core Principles
1. **Accuracy First** — Schema must represent page content; don't markup content that doesn't exist; keep updated.
2. **Use JSON-LD** — Google's recommended format; place in `<head>` or end of `<body>`.
3. **Follow Google's Guidelines** — Only supported markup; avoid spam; review eligibility.
4. **Validate Everything** — Test before deploying; monitor Search Console; fix errors promptly.

## Common Schema Types
| Type | Use For | Required Properties |
|------|---------|-------------------|
| Organization | Company homepage/about | name, url |
| WebSite | Homepage (search box) | name, url |
| Article | Blog posts, news | headline, image, datePublished, author |
| Product | Product pages | name, image, offers |
| SoftwareApplication | SaaS/app pages | name, offers |
| FAQPage | FAQ content | mainEntity (Q&A array) |
| HowTo | Tutorials | name, step |
| BreadcrumbList | Any page with breadcrumbs | itemListElement |
| LocalBusiness | Local business pages | name, address |
| Event | Events, webinars | name, startDate, location |

## Quick Reference
- **Organization** — Required: name, url. Recommended: logo, sameAs, contactPoint.
- **Article/BlogPosting** — Required: headline, image, datePublished, author. Recommended: dateModified, publisher, description.
- **Product** — Required: name, image, offers (price + availability). Recommended: sku, brand, aggregateRating, review.
- **FAQPage** — Required: mainEntity (array of Question/Answer pairs).
- **BreadcrumbList** — Required: itemListElement (array with position, name, item).

## Multiple Schema Types
Combine multiple types on one page using `@graph`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization" },
    { "@type": "WebSite" },
    { "@type": "BreadcrumbList" }
  ]
}
```

## Validation and Testing
**Tools:** Google Rich Results Test (https://search.google.com/test/rich-results), Schema.org Validator (https://validator.schema.org/), Search Console Enhancements reports.

**Common errors:** Missing required properties; invalid values (dates must be ISO 8601, URLs fully qualified, enumerations exact); mismatch with visible page content.

## Implementation
- **Static Sites** — JSON-LD directly in HTML template; includes/partials for reusable schema.
- **Dynamic Sites (React, Next.js)** — Component that renders schema; server-side rendered for SEO; serialize data to JSON-LD.
- **CMS / WordPress** — Plugins (Yoast, Rank Math, Schema Pro); theme mods; custom fields.

## Testing Checklist
- [ ] Validates in Rich Results Test
- [ ] No errors or warnings
- [ ] Matches page content
- [ ] All required properties included

## Related Skills
- **seo-audit**: Overall SEO including schema review
- **ai-seo**: AI search optimization
- **programmatic-seo**: Templated schema at scale
- **site-architecture**: Breadcrumb structure and navigation schema
