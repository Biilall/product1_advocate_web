import OpenAI from 'openai';
// @ts-ignore - jsdom lacks type declarations
import { JSDOM } from 'jsdom';
import database, { ContentJob, BlogPost } from './database.js';

// ==================== Configuration ====================

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

    // Get article content - WordPress typically uses .entry-content
    const contentEl = doc.querySelector('.entry-content') || doc.querySelector('article') || doc.querySelector('.post-content');
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

    const prompt = `You are an expert legal content writer for M. Salman Tahir, Advocate at the High Court of Pakistan, based in Lahore. 

TASK: Rewrite and rephrase the following legal article into a completely new, original article. The article must:

1. Be COMPLETELY REPHRASED - not just paraphrased. Restructure paragraphs, change sentence patterns, use different legal terminology while keeping accuracy.
2. Naturally incorporate these SEO keywords 5-6 times each throughout the article: ${keywordList}
3. Focus on Lahore and Pakistan legal context - mention "Lahore High Court", "courts in Lahore", "Pakistan law" naturally.
4. Be written in a humanized, engaging style - as if written by an experienced Pakistani lawyer. Use real-world examples, practical advice, and conversational yet professional tone.
5. Be SEO-optimized (AEO/GEO friendly): include FAQ section at the end with 3-4 common questions, use proper headings (H2, H3).
6. Include a compelling introduction and conclusion with a call to action mentioning M. Salman Tahir, Advocate.
7. Be at least 1500 words long.

ORIGINAL ARTICLE TITLE: "${sourceTitle}"

ORIGINAL ARTICLE CONTENT (reference only, DO NOT copy):
${sourceContent}

IMPORTANT: After the English article, write "---URDU_VERSION---" and then write a complete Urdu version of the same article. The Urdu version should:
- Be naturally written in Urdu (not machine-translated)
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
          content: 'You are a legal content specialist. Always respond with valid JSON only. No markdown code fences.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
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
    .find({ status: { $in: ['success', 'running'] } })
    .project({ sourceUrl: 1 })
    .toArray();

  const processedSet = new Set(processedUrls.map(j => j.sourceUrl));
  const availableUrls = COMPETITOR_ARTICLE_URLS.filter(url => !processedSet.has(url));

  if (availableUrls.length === 0) {
    console.log('[ContentJob] All competitor articles have been processed. Skipping.');
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

  // Pick a random unprocessed article
  const targetUrl = availableUrls[Math.floor(Math.random() * availableUrls.length)];

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
