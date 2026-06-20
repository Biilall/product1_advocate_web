import OpenAI from 'openai';
// @ts-ignore - jsdom lacks type declarations
import { JSDOM } from 'jsdom';
import database, { ContentJob, BlogPost } from './database.js';

// ==================== Configuration ====================

// Competitor sites to discover popular blog articles from (via sitemap + popular-posts widgets).
// This is the SEED / fallback list. When Google Custom Search is configured
// (GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX), competitors are auto-selected by who
// actually ranks for our target keywords — see discoverCompetitorSites().
const COMPETITOR_SITES = [
  'https://joshandmakinternational.com',
];

// Domains that are never treated as competitors (our own site, directories,
// social, government, news aggregators, encyclopedias, etc.).
const NON_COMPETITOR_DOMAIN_PATTERNS = [
  'msalmantahir.com',
  'google.', 'facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
  'youtube.com', 'wikipedia.org', 'pinterest.', 'tiktok.com', 'reddit.com',
  'justdial.com', 'yelp.', 'tripadvisor.', 'quora.com', 'medium.com',
  '.gov.pk', '.gov', '.edu', 'paklawsite', 'pakistanlawsite', 'punjabcode',
  'na.gov.pk', 'supremecourt.gov.pk', 'pljlawsite', 'scribd.com', 'jstor.org',
  'amazon.', 'wordpress.com', 'blogspot.com', 'apple.com',
];


// Fallback seed list used only if live discovery returns nothing.
const COMPETITOR_ARTICLE_URLS = [
  'https://joshandmakinternational.com/cross-examination-in-family-court-proceedings/',
  'https://joshandmakinternational.com/lets-talk-about-rent-agreements-in-pakistan/',
  'https://joshandmakinternational.com/ejectment-eviction-petition-pakistan/',
  'https://joshandmakinternational.com/iqrarnama-in-pakistan/',
  'https://joshandmakinternational.com/subletting-in-pakistan/',
  'https://joshandmakinternational.com/law-on-attachment-of-property-in-pakistan/',
  'https://joshandmakinternational.com/encroachments-and-property-rights-in-pakistani-law/',
  'https://joshandmakinternational.com/vested-rights-and-pakistani-law/',
  'https://joshandmakinternational.com/passport-disputes-in-pakistan/',
  'https://joshandmakinternational.com/insolvency-and-legal-recourse-in-pakistan/',
  'https://joshandmakinternational.com/bankruptcy-and-legal-recourse-in-pakistan/',
  'https://joshandmakinternational.com/mou-memorandum-of-understanding-pakistan/',
  'https://joshandmakinternational.com/a-legal-primer-on-contract-law-in-pakistan/',
  'https://joshandmakinternational.com/can-you-execute-a-gift-or-hiba-through-a-power-of-attorney-poa/',
  'https://joshandmakinternational.com/your-1-checklist-for-sending-effective-legal-notices-in-pakistan/',
  'https://joshandmakinternational.com/execution-orders-attachment-auction-objection-rights/',
  'https://joshandmakinternational.com/cheques-and-signatures/',
  'https://joshandmakinternational.com/buyer-delaying-payment-in-a-sale-of-contract-of-land-or-property-in-pakistan/',
  'https://joshandmakinternational.com/what-is-a-bait-and-switch/',
  'https://joshandmakinternational.com/beware-of-the-token-money-trap-a-caution-for-overseas-pakistanis/',
  'https://joshandmakinternational.com/plaintiffs-defendants-facing-cross-examination-in-property-transfer-cases/',
  'https://joshandmakinternational.com/cross-examination-in-civil-proceedings/',
  'https://joshandmakinternational.com/can-online-banking-fraud-victims-in-pakistan-recover-their-lost-funds/',
  'https://joshandmakinternational.com/is-binance-legal-in-pakistan/',
  'https://joshandmakinternational.com/the-misguided-reliance-on-cctv-and-cdr-evidence-in-bail-proceedings/',
  'https://joshandmakinternational.com/the-doctrine-of-intelligent-preference-a-minors-right-to-choose-in-custody-proceedings-under-section-173-of-the-guardians-and-wards-act-1890/',
  'https://joshandmakinternational.com/judicial-flaws-in-the-intelligent-preference-of-a-minor-in-custody-proceedings/',
  'https://joshandmakinternational.com/grandfather-pakistans-family-and-inheritance-legal-proceedings/',
  'https://joshandmakinternational.com/legal-primer-litigants-in-medical-negligence-disputes-against-medical-doctors-hospitals-in-pakistan/',
  'https://joshandmakinternational.com/right-to-appeal-in-family-cases/',
  'https://joshandmakinternational.com/exemption-from-personal-appearance-to-an-accused-during-trial-u-s-section-540-a-of-the-criminal/',
  'https://joshandmakinternational.com/penalty-non-banking-transactions-property-deals/',
  'https://joshandmakinternational.com/understanding-sham-transactions-in-pakistani-jurisprudence/',
  'https://joshandmakinternational.com/justice-beyond-birth-recognizing-the-rights-of-the-unborn-foetuses/',
  'https://joshandmakinternational.com/a-primer-on-the-benami-transactions-prohibition-act-2017-and-benami-transactions-rules-2019-a-guide-for-litigants/',
  'https://joshandmakinternational.com/legitimate-expectations-in-pakistani-jurisprudence/',
  'https://joshandmakinternational.com/investments-as-entrustments-civil-v-criminal-law/',
  'https://joshandmakinternational.com/a-brief-primer-on-the-jurisdiction-of-the-federal-ombudsman/',
  'https://joshandmakinternational.com/pakistani-law-on-self-defence/',
  'https://joshandmakinternational.com/workplace-harassment-law-in-pakistan-what-every-organization-must-get-right-in-2026/',
  'https://joshandmakinternational.com/suspension-of-a-civil-servant-what-it-is-and-what-it-isnt/',
  'https://joshandmakinternational.com/strategic-primer-for-litigants-in-police-misconduct-disputes/',
  'https://joshandmakinternational.com/franchise-agreements-in-pakistan-strategic-legal-advice/',
  'https://joshandmakinternational.com/options-court-proceedings-pakistan/',
  'https://joshandmakinternational.com/mediation-law-in-pakistan/',
  'https://joshandmakinternational.com/company-registration-in-pakistan-2/',
  'https://joshandmakinternational.com/what-is-the-purpose-and-background-of-the-zainab-alert-recovery-and-response-act-2020/',
  'https://joshandmakinternational.com/geofencing-and-the-law-in-pakistan/',
  'https://joshandmakinternational.com/can-you-sue-for-defamation-after-someone-releases-a-deepfake-video-of-you/',
  'https://joshandmakinternational.com/what-is-the-digital-power-of-attorney-service-from-nadra-in-pakistan/',
  'https://joshandmakinternational.com/current-legal-framework-of-human-trafficking-in-pakistan/',
  'https://joshandmakinternational.com/property-rights-in-the-constitution-of-pakistan/',
  'https://joshandmakinternational.com/law-of-adoption-in-pakistan-legal-impediments-and-landmark-cases/',
  'https://joshandmakinternational.com/double-taxation-treaties-dtts-of-pakistan/',
  'https://joshandmakinternational.com/product-liability-under-the-consumer-protection-act/',
  'https://joshandmakinternational.com/a-primer-on-consumer-court-jurisdiction-in-pakistan/',
  'https://joshandmakinternational.com/legal-framework-governing-credit-card-disputes-in-pakistan/',
  'https://joshandmakinternational.com/natasha-iqbal-accident-legal/',
  'https://joshandmakinternational.com/punjab-government-orders-removal-of-non-serious-criminal-records-to-facilitate-employment-and-travel/',
];

const SEO_KEYWORDS_EN = [
  'best lawyer in lahore',
  'criminal lawyer lahore',
  'bail lawyer lahore',
  'property dispute lawyer lahore',
  'divorce lawyer lahore',
  'family court lawyer lahore',
  'how to file for khula in pakistan',
  'lawyer for property cases in lahore',
  'high court advocate lahore',
  'civil litigation lawyer lahore',
  'best advocate in lahore high court',
  'top lawyer for criminal cases lahore',
  'legal consultation lahore',
  'family law expert lahore',
  'property transfer lawyer lahore',
];

const SEO_KEYWORDS_UR = [
  'وکیل لاہور',
  'بہترین وکیل لاہور',
  'خلع کا طریقہ',
  'ضمانت کیسے ملتی ہے',
  'طلاق کا طریقہ',
  'جائیداد کا تنازع',
  'فوجداری وکیل لاہور',
  'عدالتی مشاورت لاہور',
];

const CATEGORIES = [
  'Criminal Law',
  'Family Law',
  'Property Law',
  'Civil Litigation',
  'Corporate Law',
  'Constitutional Law',
  'Banking & Finance Law',
  'Consumer Protection',
  'Human Rights',
  'Legal Updates',
];

// 5 times per day = every 4 hours 48 minutes
const JOB_INTERVAL_MS = 4 * 60 * 60 * 1000 + 48 * 60 * 1000;

let jobTimer: ReturnType<typeof setInterval> | null = null;

// ==================== Article Scraper ====================

async function scrapeArticle(url: string): Promise<{ title: string; content: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LegalBlogBot/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Get article title
    const titleEl = doc.querySelector('h1.entry-title') || doc.querySelector('h1') || doc.querySelector('title');
    const title = titleEl?.textContent?.trim() || '';

    // Get article content - WordPress typically uses .entry-content;
    // fall back to common containers for non-WordPress competitor sites.
    const contentEl =
      doc.querySelector('.entry-content') ||
      doc.querySelector('article') ||
      doc.querySelector('.post-content') ||
      doc.querySelector('.article-content') ||
      doc.querySelector('main') ||
      doc.querySelector('[role="main"]');
    if (!contentEl) return null;

    // Remove scripts, styles, ads, navigation elements
    const removables = contentEl.querySelectorAll('script, style, nav, .sharedaddy, .jp-relatedposts, .post-navigation, iframe, .wp-block-embed');
    removables.forEach((el: any) => el.remove());

    const content = contentEl.textContent?.trim() || '';

    if (!title || content.length < 500) return null;

    return { title, content: content.substring(0, 8000) }; // Cap at 8000 chars for OpenAI
  } catch (error) {
    console.error(`[ContentJob] Failed to scrape ${url}:`, error);
    return null;
  }
}

// ==================== Competitor Article Discovery ====================

const DISCOVERY_TTL_MS = 12 * 60 * 60 * 1000; // refresh discovered list twice a day
let discoveryCache: { urls: string[]; fetchedAt: number } | null = null;

// Competitor-site selection cache (refreshed once a day to stay within SERP quota).
const COMPETITOR_TTL_MS = 24 * 60 * 60 * 1000;
let competitorCache: { sites: string[]; fetchedAt: number } | null = null;
// Max competitor sites to crawl per job cycle (keeps runtime bounded).
const MAX_COMPETITOR_SITES = 6;
// How many keywords to query per discovery cycle (Custom Search free tier = 100/day).
const SERP_KEYWORDS_PER_CYCLE = 8;

// URL path segments that are never real blog articles.
const NON_ARTICLE_SLUGS = new Set([
  'about', 'about-us', 'contact', 'contact-us', 'contact-form', 'services', 'service', 'team',
  'privacy-policy', 'terms', 'terms-and-conditions', 'disclaimer', 'sitemap',
  'blog', 'news', 'home', 'cart', 'checkout', 'my-account', 'shop', 'careers',
  'practice-areas', 'our-team', 'our-people', 'faq', 'faqs', 'testimonials', 'feed',
  'legal-updates', 'archives-jm', 'legal-services', 'client-information',
]);

async function fetchText(url: string, timeoutMs = 20000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LegalBlogBot/1.0)' },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function isLikelyArticleUrl(url: string, baseHost: string): boolean {
  try {
    const u = new URL(url, `https://${baseHost}`);
    if (u.host !== baseHost) return false;
    if (u.search) return false;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments.length > 2) return false;

    // For 2-segment paths, the first must be a known blog/article prefix.
    const BLOG_PREFIXES = new Set([
      'blog', 'blogs', 'article', 'articles', 'post', 'posts', 'news',
      'insights', 'resources', 'knowledge', 'legal-articles', 'publications',
    ]);
    if (segments.length === 2 && !BLOG_PREFIXES.has(segments[0].toLowerCase())) return false;

    const slug = segments[segments.length - 1].toLowerCase();
    if (NON_ARTICLE_SLUGS.has(slug)) return false;
    if (/\.(xml|jpg|jpeg|png|webp|pdf|gif|css|js)$/i.test(slug)) return false;
    if (/^(category|tag|author|page|wp-)/.test(slug)) return false;
    if (/-blog$|^legal-services|^legal-updates/.test(slug)) return false;
    // A real article slug is descriptive: 3+ words and reasonably long.
    const hyphens = (slug.match(/-/g) || []).length;
    return hyphens >= 2 && slug.length > 12;
  } catch {
    return false;
  }
}

// Crawl a site's homepage and common blog index paths to discover article URLs.
// DOM order is preserved so the newest/most-prominent posts come first.
async function discoverFromListing(baseUrl: string): Promise<string[]> {
  const baseHost = new URL(baseUrl).host;
  const pages = [
    `${baseUrl}/`,
    `${baseUrl}/blog/`,
    `${baseUrl}/articles/`,
    `${baseUrl}/insights/`,
    `${baseUrl}/news/`,
  ];
  const ordered: string[] = [];

  for (const page of pages) {
    const html = await fetchText(page);
    if (!html) continue;
    try {
      const doc = new JSDOM(html).window.document;
      doc.querySelectorAll('a[href]').forEach((a: any) => {
        const href = a.getAttribute('href');
        if (!href) return;
        const clean = href.split('#')[0].split('?')[0];
        if (isLikelyArticleUrl(clean, baseHost)) ordered.push(clean);
      });
    } catch {
      // ignore parse errors
    }
  }
  return ordered; // may contain duplicates; de-duped by caller
}

// Discover "popular / most-read" articles from a site's homepage and blog index.
async function discoverPopular(baseUrl: string): Promise<string[]> {
  const baseHost = new URL(baseUrl).host;
  const pages = [baseUrl, `${baseUrl}/blog/`, `${baseUrl}/articles/`];
  const popular: string[] = [];

  for (const page of pages) {
    const html = await fetchText(page);
    if (!html) continue;
    try {
      const doc = new JSDOM(html).window.document;
      // Widgets that signal popularity / traffic.
      const widgets = doc.querySelectorAll(
        '[class*="popular" i], [id*="popular" i], [class*="trending" i], [class*="most-read" i], [class*="most-viewed" i]'
      );
      widgets.forEach((w: any) => {
        w.querySelectorAll('a[href]').forEach((a: any) => {
          const href = a.getAttribute('href');
          if (!href) return;
          const clean = href.split('#')[0].split('?')[0];
          if (isLikelyArticleUrl(clean, baseHost)) popular.push(clean);
        });
      });
    } catch {
      // ignore parse errors
    }
  }
  return [...new Set(popular)];
}

// ==================== Competitor Auto-Selection (SERP-based) ====================

// Query the Google Custom Search JSON API for one keyword and return result hostnames.
// Returns [] when the API is not configured or the request fails (graceful fallback).
async function searchSerpDomains(keyword: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) return [];

  const endpoint =
    `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}` +
    `&cx=${encodeURIComponent(cx)}&num=10&gl=pk&hl=en&q=${encodeURIComponent(keyword)}`;

  const body = await fetchText(endpoint, 15000);
  if (!body) return [];

  try {
    const data = JSON.parse(body);
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    return items
      .map(it => {
        try {
          return new URL(it.link).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return '';
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isCompetitorDomain(host: string): boolean {
  const h = host.toLowerCase();
  return !NON_COMPETITOR_DOMAIN_PATTERNS.some(p => h.includes(p));
}

// Auto-select competitor sites by who ranks for our target keywords.
// A domain that appears for many of our keywords is a stronger competitor.
// Falls back to the seed COMPETITOR_SITES when SERP is unavailable.
async function discoverCompetitorSites(): Promise<string[]> {
  if (competitorCache && Date.now() - competitorCache.fetchedAt < COMPETITOR_TTL_MS) {
    return competitorCache.sites;
  }

  // Rotate which keywords we query each cycle to cover the full set over time
  // while staying within the daily SERP quota.
  const start = Math.floor(Date.now() / COMPETITOR_TTL_MS) % SEO_KEYWORDS_EN.length;
  const rotated = [...SEO_KEYWORDS_EN.slice(start), ...SEO_KEYWORDS_EN.slice(0, start)];
  const keywords = rotated.slice(0, SERP_KEYWORDS_PER_CYCLE);

  const freq = new Map<string, number>();
  let serpUsed = false;

  for (const kw of keywords) {
    const hosts = await searchSerpDomains(kw);
    if (hosts.length > 0) serpUsed = true;
    for (const host of new Set(hosts)) {
      if (!isCompetitorDomain(host)) continue;
      freq.set(host, (freq.get(host) || 0) + 1);
    }
  }

  if (!serpUsed || freq.size === 0) {
    if (!serpUsed) {
      console.log('[ContentJob] SERP competitor discovery not configured — using seed competitor list.');
    }
    return COMPETITOR_SITES;
  }

  // Rank by how many of our keywords each domain ranks for (desc).
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_COMPETITOR_SITES)
    .map(([host]) => `https://${host}`);

  // Always keep the proven seed competitor in the pool.
  const sites = [...new Set([...ranked, ...COMPETITOR_SITES])].slice(0, MAX_COMPETITOR_SITES + 1);

  console.log(`[ContentJob] Auto-selected ${sites.length} competitor sites from SERP: ${sites.map(s => new URL(s).host).join(', ')}`);
  competitorCache = { sites, fetchedAt: Date.now() };
  return sites;
}

// Build the prioritized pool of candidate article URLs.
// Competitors are processed SEQUENTIALLY: all of competitor #1's articles come
// first (popular/most-read, then recency order), then all of competitor #2's, etc.
// This means the job exhausts one competitor before moving to the next.
async function discoverCompetitorArticles(): Promise<string[]> {
  if (discoveryCache && Date.now() - discoveryCache.fetchedAt < DISCOVERY_TTL_MS) {
    return discoveryCache.urls;
  }

  const competitorSites = await discoverCompetitorSites();

  const ordered: string[] = [];
  let popularCount = 0;

  for (const site of competitorSites) {
    try {
      const [popular, listing] = await Promise.all([
        discoverPopular(site),
        discoverFromListing(site),
      ]);
      // Per-competitor ordering: popular first, then the rest by recency.
      const siteArticles = [...new Set([...popular, ...listing])];
      popularCount += popular.length;
      ordered.push(...siteArticles);
      console.log(`[ContentJob] ${new URL(site).host}: ${siteArticles.length} articles (${popular.length} popular).`);
    } catch (err) {
      console.error(`[ContentJob] Discovery failed for ${site}:`, err);
    }
  }

  // De-duplicate across competitors while preserving the sequential order
  // (an article only counts toward the first competitor it was found on).
  const deduped = [...new Set(ordered)];

  if (deduped.length === 0) {
    console.warn('[ContentJob] Live discovery empty — falling back to seed list.');
    return COMPETITOR_ARTICLE_URLS;
  }

  console.log(`[ContentJob] Discovered ${deduped.length} candidate articles across ${competitorSites.length} competitor(s) (${popularCount} popular).`);
  discoveryCache = { urls: deduped, fetchedAt: Date.now() };
  return deduped;
}

// ==================== OpenAI Content Generation ====================

function pickRandomKeywords(count: number): string[] {
  const shuffled = [...SEO_KEYWORDS_EN].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickCategory(sourceTitle: string): string {
  const lower = sourceTitle.toLowerCase();
  if (lower.includes('criminal') || lower.includes('bail') || lower.includes('fir') || lower.includes('penal')) return 'Criminal Law';
  if (lower.includes('family') || lower.includes('divorce') || lower.includes('custody') || lower.includes('khula') || lower.includes('nikah')) return 'Family Law';
  if (lower.includes('property') || lower.includes('land') || lower.includes('encroachment') || lower.includes('rent') || lower.includes('ejectment')) return 'Property Law';
  if (lower.includes('company') || lower.includes('corporate') || lower.includes('franchise') || lower.includes('shareholder')) return 'Corporate Law';
  if (lower.includes('constitution') || lower.includes('fundamental') || lower.includes('writ')) return 'Constitutional Law';
  if (lower.includes('banking') || lower.includes('credit') || lower.includes('payment') || lower.includes('tax') || lower.includes('insolvency')) return 'Banking & Finance Law';
  if (lower.includes('consumer') || lower.includes('product liability')) return 'Consumer Protection';
  if (lower.includes('trafficking') || lower.includes('rights') || lower.includes('minority')) return 'Human Rights';
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-+|-+$/g, '');
}

async function generateContent(
  openai: OpenAI,
  sourceTitle: string,
  sourceContent: string,
  keywords: string[]
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  urduContent: string;
} | null> {
  try {
    const keywordList = keywords.join(', ');
    const urduKeywords = SEO_KEYWORDS_UR.slice(0, 4).join('، ');

    const prompt = `You are M. Salman Tahir, an experienced Advocate at the High Court of Pakistan, based in Lahore, personally writing a blog post for your law firm's website.

TASK: Using the reference article below only as background research, write a completely new, original article in your own voice.

CONTENT REQUIREMENTS:
1. COMPLETELY REWRITTEN — do not paraphrase line-by-line. Reorganize the structure, change the order of ideas, use your own explanations and examples. Zero copied sentences.
2. Naturally weave these SEO keywords in 5-6 times each across the article: ${keywordList}
3. Ground everything in the Lahore / Pakistan legal context — reference "Lahore High Court", "courts in Lahore", relevant Pakistani statutes and sections naturally.
4. SEO/AEO/GEO optimized: clear H2/H3 headings, scannable structure, and a FAQ section at the end with 3-4 real questions clients ask.
5. Compelling intro and a conclusion with a call to action to consult M. Salman Tahir, Advocate.
6. At least 1500 words.

HUMANIZE — write so it reads like a real Pakistani lawyer wrote it, NOT like AI:
- Vary sentence length deliberately. Mix short punchy sentences with longer ones. Avoid uniform rhythm.
- Use natural contractions (it's, you'll, don't) and a warm, conversational-yet-professional tone.
- Open sections with real-world scenarios, brief anecdotes from practice ("A client recently came to me...", "In Lahore courts I often see..."), and practical, actionable advice.
- Address the reader directly as "you" where it helps.
- Add specific, concrete details (timelines, document names, court procedures, rough cost/time expectations) instead of vague generalities.
- AVOID AI giveaway phrases and clichés: do NOT use "In today's fast-paced world", "It is important to note", "Furthermore", "Moreover", "In conclusion", "delve into", "navigate the complexities", "tapestry", "landscape of", "robust", "leverage", "unlock", "realm", "ever-evolving", or em-dash overuse.
- Allow mild, natural imperfection — rhetorical questions, asides, and occasional first-person opinion — so it feels authentically human.
- Do not sound like a generic listicle. Write like an expert explaining things to a worried client.

ORIGINAL ARTICLE TITLE (reference): "${sourceTitle}"

ORIGINAL ARTICLE CONTENT (background research only, DO NOT copy):
${sourceContent}

IMPORTANT: After the English article, write "---URDU_VERSION---" and then write a complete Urdu version of the same article. The Urdu version should:
- Be naturally written in Urdu (not machine-translated), in a warm human voice
- Include these Urdu keywords naturally: ${urduKeywords}
- Be at least 800 words
- Maintain legal accuracy

Respond in this EXACT JSON format:
{
  "title": "SEO-optimized English title (include a keyword)",
  "content": "Full HTML article with <h2>, <h3>, <p>, <ul>, <li> tags. Include FAQ section.",
  "excerpt": "Compelling 2-sentence summary for meta description (max 160 chars)",
  "metaTitle": "SEO title under 60 chars with main keyword",
  "metaDescription": "Meta description under 160 chars with keyword",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "urduContent": "Complete Urdu article in HTML format with proper RTL direction"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a seasoned Pakistani lawyer who writes warm, human, first-person legal blog posts that never sound AI-generated. Always respond with valid JSON only. No markdown code fences.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
      max_tokens: 8000,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) return null;

    // Try to parse JSON - handle potential markdown wrapping
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);

    return {
      title: parsed.title || sourceTitle,
      content: parsed.content || '',
      excerpt: (parsed.excerpt || '').substring(0, 200),
      metaTitle: (parsed.metaTitle || parsed.title || '').substring(0, 70),
      metaDescription: (parsed.metaDescription || parsed.excerpt || '').substring(0, 170),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
      urduContent: parsed.urduContent || '',
    };
  } catch (error) {
    console.error('[ContentJob] OpenAI generation failed:', error);
    return null;
  }
}

// ==================== Main Job Runner ====================

async function runContentJob(): Promise<void> {
  const startTime = Date.now();
  console.log('[ContentJob] Starting content generation job...');

  // Find an article URL that hasn't been processed yet
  const processedUrls = await database.contentJobs
    .find({ status: { $in: ['success', 'running', 'failed'] } })
    .project({ sourceUrl: 1 })
    .toArray();

  const processedSet = new Set(processedUrls.map(j => j.sourceUrl));

  // Discover popular/fresh competitor articles live (falls back to seed list).
  const candidateUrls = await discoverCompetitorArticles();
  const availableUrls = candidateUrls.filter(url => !processedSet.has(url));

  if (availableUrls.length === 0) {
    console.log('[ContentJob] All discovered competitor articles have been processed. Skipping.');
    await database.contentJobs.insertOne({
      status: 'skipped',
      sourceUrl: '',
      sourceTitle: 'No new articles available',
      hasUrduVersion: false,
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: Date.now() - startTime,
    });
    return;
  }

  // Process competitors sequentially: stay on the FIRST unprocessed competitor
  // (the host of the first available article) until all its blogs are consumed,
  // then the next run rolls onto the following competitor. Light randomization
  // among that competitor's top candidates avoids always picking the same order.
  const currentHost = (() => {
    try { return new URL(availableUrls[0]).host; } catch { return ''; }
  })();
  const sameCompetitor = availableUrls.filter(u => {
    try { return new URL(u).host === currentHost; } catch { return false; }
  });
  const topPool = sameCompetitor.slice(0, Math.min(5, sameCompetitor.length));
  const targetUrl = topPool[Math.floor(Math.random() * topPool.length)];

  // Create job record (running)
  const jobRecord: ContentJob = {
    status: 'running',
    sourceUrl: targetUrl,
    sourceTitle: '',
    hasUrduVersion: false,
    startedAt: new Date(),
  };
  const insertResult = await database.contentJobs.insertOne(jobRecord);
  const jobId = insertResult.insertedId;

  try {
    // Step 1: Scrape the article
    console.log(`[ContentJob] Scraping: ${targetUrl}`);
    const scraped = await scrapeArticle(targetUrl);
    if (!scraped) {
      throw new Error(`Failed to scrape article from ${targetUrl}`);
    }

    await database.contentJobs.updateOne(
      { _id: jobId },
      { $set: { sourceTitle: scraped.title } }
    );

    // Step 2: Pick keywords and category
    const keywords = pickRandomKeywords(4);
    const category = pickCategory(scraped.title);

    // Step 3: Generate content with OpenAI
    console.log(`[ContentJob] Generating content for: "${scraped.title}"`);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const generated = await generateContent(openai, scraped.title, scraped.content, keywords);

    if (!generated || !generated.content) {
      throw new Error('OpenAI content generation returned empty result');
    }

    // Step 4: Build the full blog post content (English + Urdu)
    let fullContent = generated.content;
    const hasUrdu = !!generated.urduContent && generated.urduContent.length > 200;

    if (hasUrdu) {
      fullContent += `\n<hr/>\n<div dir="rtl" lang="ur" style="text-align:right;font-family:'Noto Nastaliq Urdu',serif;">\n<h2>اردو میں پڑھیں</h2>\n${generated.urduContent}\n</div>`;
    }

    // Step 5: Create slug and ensure uniqueness
    let slug = generateSlug(generated.title);
    const existingSlug = await database.blogPosts.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Step 6: Save as draft blog post
    const blogPost: Omit<BlogPost, '_id'> = {
      title: generated.title,
      slug,
      content: fullContent,
      excerpt: generated.excerpt,
      category,
      tags: [...generated.tags, ...keywords.slice(0, 2)],
      status: 'draft',
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const blogResult = await database.blogPosts.insertOne(blogPost);
    const blogPostId = blogResult.insertedId.toString();

    // Step 7: Update job as success
    const durationMs = Date.now() - startTime;
    await database.contentJobs.updateOne(
      { _id: jobId },
      {
        $set: {
          status: 'success',
          sourceTitle: scraped.title,
          generatedTitle: generated.title,
          generatedSlug: slug,
          blogPostId,
          category,
          tags: blogPost.tags,
          keywordsUsed: keywords,
          hasUrduVersion: hasUrdu,
          durationMs,
          completedAt: new Date(),
        },
      }
    );

    console.log(`[ContentJob] ✅ Success! Created draft: "${generated.title}" (${durationMs}ms)`);
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    await database.contentJobs.updateOne(
      { _id: jobId },
      {
        $set: {
          status: 'failed',
          error: error?.message || 'Unknown error',
          durationMs,
          completedAt: new Date(),
        },
      }
    );
    console.error(`[ContentJob] ❌ Failed:`, error?.message);
  }
}

// ==================== Scheduler ====================

export function startContentAutomation(): void {
  console.log(`[ContentJob] 📅 Scheduling content automation (every ${Math.round(JOB_INTERVAL_MS / 60000)} minutes / 5 times per day)`);

  // Run first job after 2 minutes (let server fully start)
  setTimeout(() => {
    runContentJob().catch(err => console.error('[ContentJob] Scheduled run error:', err));
  }, 2 * 60 * 1000);

  // Schedule recurring jobs
  jobTimer = setInterval(() => {
    runContentJob().catch(err => console.error('[ContentJob] Scheduled run error:', err));
  }, JOB_INTERVAL_MS);
}

export function stopContentAutomation(): void {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
    console.log('[ContentJob] ⏹️ Content automation stopped');
  }
}

// Manual trigger (for API endpoint)
export async function triggerContentJob(): Promise<{ message: string }> {
  try {
    await runContentJob();
    return { message: 'Content job completed successfully' };
  } catch (error: any) {
    return { message: `Content job failed: ${error?.message}` };
  }
}

// Get job statistics
export async function getContentJobStats(): Promise<{
  total: number;
  success: number;
  failed: number;
  skipped: number;
  running: number;
  avgDurationMs: number;
  lastRun: Date | null;
}> {
  const [total, success, failed, skipped, running] = await Promise.all([
    database.contentJobs.countDocuments(),
    database.contentJobs.countDocuments({ status: 'success' }),
    database.contentJobs.countDocuments({ status: 'failed' }),
    database.contentJobs.countDocuments({ status: 'skipped' }),
    database.contentJobs.countDocuments({ status: 'running' }),
  ]);

  const avgResult = await database.contentJobs
    .aggregate([
      { $match: { durationMs: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$durationMs' } } },
    ])
    .toArray();

  const lastJob = await database.contentJobs.findOne({}, { sort: { startedAt: -1 } });

  return {
    total,
    success,
    failed,
    skipped,
    running,
    avgDurationMs: Math.round(avgResult[0]?.avg || 0),
    lastRun: lastJob?.startedAt || null,
  };
}

// Get recent job logs
export async function getContentJobLogs(limit: number = 50): Promise<ContentJob[]> {
  return database.contentJobs
    .find()
    .sort({ startedAt: -1 })
    .limit(limit)
    .toArray();
}
