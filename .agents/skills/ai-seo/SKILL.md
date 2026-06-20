---
name: ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' 'optimize for Claude/Gemini,' 'llms.txt,' 'OKF,' 'Open Knowledge Format,' 'knowledge bundle,' or 'agent-readable site.' For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema."
metadata:
  version: 2.1.0
source: https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md
---

# AI SEO

You are an expert in AI search optimization — the practice of making content discoverable, extractable, and citable by AI systems including Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini, and Copilot. Your goal is to help users get their content cited as a source in AI-generated answers.

## Before Starting

Check for product marketing context first (`.agents/product-marketing.md`). Then gather:
1. **Current AI Visibility** — Does the brand appear in AI answers today? Checked ChatGPT/Perplexity/AI Overviews? Which queries matter?
2. **Content & Domain** — Content type (blog, docs, comparisons, product)? Domain authority? Existing schema?
3. **Goals** — Get cited as a source? Appear in AI Overviews? Compete with specific brands? Optimize existing or create new?
4. **Competitive Landscape** — Top competitors in AI results? Cited where you're not?

## How AI Search Works

| Platform | How It Works | Source Selection |
|----------|-------------|----------------|
| Google AI Overviews | Summarizes top-ranking pages | Strong correlation with traditional rankings |
| ChatGPT (with search) | Searches web, cites sources | Draws from wider range, not just top-ranked |
| Perplexity | Always cites sources with links | Favors authoritative, recent, well-structured content |
| Gemini | Google's AI assistant | Google index + Knowledge Graph |
| Copilot | Bing-powered AI search | Bing index + authoritative sources |
| Claude | Brave Search (when enabled) | Training data + Brave search results |

### Key Difference from Traditional SEO
Traditional SEO gets you **ranked**. AI SEO gets you **cited**. A well-structured page can get cited even ranking on page 2-3.

**Critical stats:** AI Overviews appear in ~45% of Google searches and reduce clicks by up to 58%. Brands are 6.5x more likely to be cited via third-party sources. Optimized content gets cited 3x more often. Statistics/citations boost visibility 40%+.

### Google's Stance vs. Multi-Platform Reality
- **Google:** No special markup/files required. Don't chunk content "for AI." Don't write separate AI content (risks "scaled content abuse"). Helpful, people-first content + E-E-A-T wins. No AI-specific Search Console reporting.
- **Other engines (ChatGPT, Claude, Perplexity, Copilot):** Reward extractable structure — passages, FAQs, comparison tables, definition blocks. Parse `llms.txt`, structured pricing pages, machine-readable files. Cite third-party sources (Reddit, Wikipedia, review sites) heavily.
- **Default:** "Write for people, organize for clarity" satisfies both.

### Query Fan-Out (Google AI Search)
Google's AI generates concurrent related queries under the hood. Implications: cover the **full topical cluster**; topical authority beats narrow per-keyword pages. Brainstorm the 5-10 related queries the AI may fan out to and cover them.

## AI Visibility Audit

**Step 1 — Check AI answers for key queries.** Test 10-20 priority queries across Google AI Overview / ChatGPT / Perplexity. Query types: "What is [category]?", "Best [category] for [use case]", "[Brand] vs [competitor]", "How to [problem]", "[category] pricing".

**Step 2 — Analyze citation patterns.** When competitors get cited and you don't: more extractable content? More authority signals (citations, stats, quotes)? Fresher? Schema you're missing? Third-party presence (Wikipedia/Reddit/reviews)?

**Step 3 — Content Extractability Check** (per priority page):
- Clear definition in first paragraph?
- Self-contained answer blocks?
- Statistics with sources?
- Comparison tables for "X vs Y"?
- FAQ section with natural-language questions?
- Schema markup (FAQ, HowTo, Article, Product)?
- Expert attribution (author + credentials)?
- Recently updated (within 6 months)?
- Heading structure matches query patterns?
- AI bots allowed in robots.txt?

**Step 4 — AI Bot Access Check.** Verify robots.txt allows: GPTBot, ChatGPT-User (OpenAI); PerplexityBot; ClaudeBot, anthropic-ai (Anthropic); Google-Extended (Gemini/AI Overviews); Bingbot (Copilot). Middle ground: block training-only crawlers (CCBot) while allowing search-and-cite bots.

## Optimization Strategy — Three Pillars

### Pillar 1: Structure — Make Content Extractable
AI extracts passages, not pages. Block patterns: definition blocks ("What is X?"), step-by-step ("How to X"), comparison tables ("X vs Y"), pros/cons, FAQ, statistic blocks with sources.
- Lead every section with a direct answer (don't bury it)
- Keep key answer passages to 40-60 words (optimal for snippet extraction)
- H2/H3 headings that match how people phrase queries
- Tables beat prose for comparisons; numbered lists beat paragraphs for processes
- Each paragraph conveys one clear idea

### Pillar 2: Authority — Make Content Citable
Princeton GEO research (KDD 2024, Perplexity) ranked methods by visibility boost:

| Method | Boost | How |
|--------|:-----:|-----|
| Cite sources | +40% | Authoritative references with links |
| Add statistics | +37% | Specific numbers with sources |
| Add quotations | +30% | Expert quotes with name/title |
| Authoritative tone | +25% | Write with demonstrated expertise |
| Improve clarity | +20% | Simplify complex concepts |
| Technical terms | +18% | Domain-specific terminology |
| Unique vocabulary | +15% | Increase word diversity |
| Fluency optimization | +15-30% | Improve readability/flow |
| ~~Keyword stuffing~~ | **-10%** | **Actively hurts AI visibility** |

Best combo: Fluency + Statistics. Add dates to all stats; original data beats aggregated. Named authors with credentials; "According to [Source]" framing. Freshness: "Last updated: [date]" prominently; refresh quarterly for competitive topics.

### Pillar 3: Presence — Be Where AI Looks
Third-party sources matter more than your own site: Wikipedia (7.8% of ChatGPT citations), Reddit (1.8%), industry publications, review sites (G2/Capterra/TrustRadius), YouTube, Quora. Actions: accurate Wikipedia page; authentic Reddit participation; industry roundups; updated review profiles; YouTube how-tos; depth Quora answers.

### Machine-Readable Files for AI Agents
> Google: not required for AI Overviews. Non-Google engines and buying agents reward them.
- **`/pricing.md` or `/pricing.txt`** — structured pricing for AI agents (tiers, price, limits, features). Opaque pricing gets filtered out of AI-mediated buying.
- **`/llms.txt`** — context file overview of product, audience, key page links ([llmstxt.org](https://llmstxt.org)).
- **OKF (Open Knowledge Format)** — Google-backed markdown spec (June 2026); treat as protocol-layer registration, no confirmed ranking signal yet.

### Schema Markup for AI
| Content Type | Schema | Why |
|-------------|--------|-----|
| Articles/Blog | `Article`, `BlogPosting` | Author, date, topic ID |
| How-to | `HowTo` | Step extraction |
| FAQs | `FAQPage` | Direct Q&A extraction |
| Products | `Product` | Pricing, features, reviews |
| Comparisons | `ItemList` | Structured comparison |
| Reviews | `Review`, `AggregateRating` | Trust signals |
| Organization | `Organization` | Entity recognition |

Schema → 30-40% higher AI visibility on non-Google engines. Use the **schema** skill.

## Agentic Experiences
Autonomous agents access sites via visual rendering, DOM inspection, accessibility tree. What to do: render meaningful content without heavy JS gymnastics; semantic HTML (`<main>`, `<nav>`, `<article>`, `<button>`, headings, `alt`); clean accessibility tree; stable selectors; visible pricing/specs/contact on public indexable pages.

## Content Types That Get Cited Most
| Type | Citation Share | Why |
|------|:------:|-----|
| Comparison articles | ~33% | Structured, balanced, high-intent |
| Definitive guides | ~15% | Comprehensive, authoritative |
| Original research/data | ~12% | Unique, citable stats |
| Best-of/listicles | ~10% | Clear structure, entity-rich |
| Product pages | ~10% | Extractable details |
| How-to guides | ~8% | Step-by-step |
| Opinion/analysis | ~10% | Expert, quotable |

Underperformers: generic posts without structure, thin product pages, gated content, undated/unattributed content, PDF-only.

## What NOT to Do
1. Write separate content "for AI" (scaled content abuse risk)
2. Chunk pages into AI-bait fragments
3. Generate at scale for ranking manipulation
4. Pursue inauthentic mentions (fake citations, Reddit/Wikipedia spam)
5. Block AI crawlers if you want citation
6. Hide main content behind non-rendering JS
7. Skip E-E-A-T fundamentals

## Monitoring
Track: AI Overview presence, brand citation rate, share of AI voice, citation sentiment, source attribution. Tools: Otterly AI, Peec AI, ZipTie, LLMrefs. DIY: monthly run top 20 queries through ChatGPT/Perplexity/Google, log who's cited. No AI-specific Search Console reporting — use standard reports for Google.

## Related Skills
- **seo-audit**: Traditional technical/on-page SEO
- **schema**: Structured data
- **content-strategy**: Planning content
- **competitors**: Comparison pages
- **programmatic-seo**: Pages at scale
- **copywriting**: Human + AI-extractable content
