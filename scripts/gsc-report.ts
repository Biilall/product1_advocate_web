/**
 * Google Search Console SEO Report
 * --------------------------------
 * Pulls REAL ranking + index data for msalmantahir.com from the
 * Search Console API and writes a markdown report to scripts/output/.
 *
 * Auth (any ONE of these, checked in order):
 *   1. GOOGLE_SA_KEY_JSON      — full service-account JSON (string)
 *   2. GOOGLE_SA_KEY_B64       — base64 of the JSON (used in Cloud Run)
 *   3. GCP_SA_KEY              — full service-account JSON (string)
 *   4. GOOGLE_APPLICATION_CREDENTIALS — path to a key file
 *   5. scripts/gsc-key.json    — local key file (gitignored)
 *
 * The service account email must be added as a user in
 * Search Console → Settings → Users and permissions (Restricted is enough).
 *
 * Run:  npx tsx scripts/gsc-report.ts
 *       npx tsx scripts/gsc-report.ts --days 90 --site https://msalmantahir.com/
 */

import { GoogleAuth } from 'google-auth-library';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- args ---------------------------------------------------------------
const args = process.argv.slice(2);
function arg(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const SITE_URL = arg('site', 'https://msalmantahir.com/');
const DAYS = parseInt(arg('days', '28'), 10);
const ROW_LIMIT = parseInt(arg('rows', '100'), 10);

// ---- auth ---------------------------------------------------------------
function loadCredentials(): Record<string, unknown> {
  let json = process.env.GOOGLE_SA_KEY_JSON || process.env.GCP_SA_KEY;
  if (!json && process.env.GOOGLE_SA_KEY_B64) {
    json = Buffer.from(process.env.GOOGLE_SA_KEY_B64, 'base64').toString('utf-8');
  }
  if (!json && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    json = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8');
  }
  if (!json) {
    const localKey = path.join(__dirname, 'gsc-key.json');
    if (fs.existsSync(localKey)) json = fs.readFileSync(localKey, 'utf-8');
  }
  if (!json) {
    console.error(
      '\n❌ No service-account key found.\n' +
        '   Provide one via GOOGLE_SA_KEY_JSON / GOOGLE_SA_KEY_B64 / GOOGLE_APPLICATION_CREDENTIALS,\n' +
        '   or drop the key at scripts/gsc-key.json (gitignored).\n' +
        '   See scripts/README-gsc.md for the 4-step setup.\n',
    );
    process.exit(1);
  }
  return JSON.parse(json);
}

async function getToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: loadCredentials(),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain access token');
  return token;
}

// ---- api helpers --------------------------------------------------------
const API = 'https://searchconsole.googleapis.com/webmasters/v3';

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

interface SaRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function searchAnalytics(
  token: string,
  dimensions: string[],
): Promise<SaRow[]> {
  const res = await fetch(
    `${API}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: dateNDaysAgo(DAYS),
        endDate: dateNDaysAgo(1),
        dimensions,
        rowLimit: ROW_LIMIT,
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search Analytics (${dimensions.join(',')}) failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { rows?: SaRow[] };
  return data.rows ?? [];
}

async function listSitemaps(token: string) {
  const res = await fetch(
    `${API}/sites/${encodeURIComponent(SITE_URL)}/sitemaps`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    sitemap?: Array<{
      path: string;
      contents?: Array<{ type: string; submitted: string; indexed?: string }>;
      lastSubmitted?: string;
      errors?: string;
      warnings?: string;
    }>;
  };
  return data.sitemap ?? [];
}

// ---- formatting ---------------------------------------------------------
function mdTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function num(n: number): string {
  return n.toLocaleString('en-US');
}

async function main() {
  console.log(`\n🔎 Pulling Search Console data for ${SITE_URL} (last ${DAYS} days)...\n`);
  const token = await getToken();

  const [totals, queries, pages, countries, devices, sitemaps] = await Promise.all([
    searchAnalytics(token, []),
    searchAnalytics(token, ['query']),
    searchAnalytics(token, ['page']),
    searchAnalytics(token, ['country']),
    searchAnalytics(token, ['device']),
    listSitemaps(token),
  ]);

  const t = totals[0];
  const start = dateNDaysAgo(DAYS);
  const end = dateNDaysAgo(1);

  let md = `# Search Console SEO Report — ${SITE_URL}\n\n`;
  md += `**Date range:** ${start} → ${end} (${DAYS} days)\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n---\n\n`;

  // Totals
  md += `## Overview\n\n`;
  if (t) {
    md += mdTable(
      ['Metric', 'Value'],
      [
        ['Total clicks', num(t.clicks)],
        ['Total impressions', num(t.impressions)],
        ['Average CTR', `${(t.ctr * 100).toFixed(2)}%`],
        ['Average position', t.position.toFixed(1)],
      ],
    );
  } else {
    md += `_No performance data for this range (site may be new or recently verified)._`;
  }
  md += `\n\n`;

  // Indexed-pages proxy
  md += `## Indexed / Performing Pages\n\n`;
  md += `> The Search Console API has no bulk "indexed count". This lists every page that received impressions in the range — a reliable proxy for indexed + ranking pages. For the exact indexed total, see Search Console → Indexing → Pages.\n\n`;
  md += `**Pages with search impressions:** ${num(pages.length)}\n\n`;
  md += mdTable(
    ['#', 'Page', 'Clicks', 'Impr.', 'CTR', 'Avg Pos'],
    pages.slice(0, 50).map((r, i) => [
      String(i + 1),
      r.keys[0].replace(SITE_URL.replace(/\/$/, ''), '') || '/',
      num(r.clicks),
      num(r.impressions),
      `${(r.ctr * 100).toFixed(1)}%`,
      r.position.toFixed(1),
    ]),
  );
  md += `\n\n`;

  // Top queries
  md += `## Top Queries (ranking keywords)\n\n`;
  md += mdTable(
    ['#', 'Query', 'Clicks', 'Impr.', 'CTR', 'Avg Pos'],
    queries.slice(0, 50).map((r, i) => [
      String(i + 1),
      r.keys[0],
      num(r.clicks),
      num(r.impressions),
      `${(r.ctr * 100).toFixed(1)}%`,
      r.position.toFixed(1),
    ]),
  );
  md += `\n\n`;

  // Quick-win opportunities: position 5-20 with impressions
  const quickWins = queries
    .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  md += `## Quick-Win Keywords (position 5–20, high impressions)\n\n`;
  md += `> These rank on page 1–2 already. Small on-page improvements can push them up for fast traffic gains.\n\n`;
  md += quickWins.length
    ? mdTable(
        ['Query', 'Impr.', 'Avg Pos'],
        quickWins.map((r) => [r.keys[0], num(r.impressions), r.position.toFixed(1)]),
      )
    : '_None in range yet._';
  md += `\n\n`;

  // Countries + devices
  md += `## Audience\n\n### By Country\n\n`;
  md += mdTable(
    ['Country', 'Clicks', 'Impr.'],
    countries.slice(0, 10).map((r) => [r.keys[0].toUpperCase(), num(r.clicks), num(r.impressions)]),
  );
  md += `\n\n### By Device\n\n`;
  md += mdTable(
    ['Device', 'Clicks', 'Impr.', 'Avg Pos'],
    devices.map((r) => [r.keys[0], num(r.clicks), num(r.impressions), r.position.toFixed(1)]),
  );
  md += `\n\n`;

  // Sitemaps
  md += `## Sitemaps\n\n`;
  if (sitemaps.length) {
    const rows: string[][] = [];
    for (const s of sitemaps) {
      const web = s.contents?.find((c) => c.type === 'web');
      rows.push([
        s.path,
        web?.submitted ?? '—',
        web?.indexed ?? '—',
        s.errors ?? '0',
        s.warnings ?? '0',
      ]);
    }
    md += mdTable(['Sitemap', 'Submitted', 'Indexed', 'Errors', 'Warnings'], rows);
  } else {
    md += `_No sitemaps reported by the API._`;
  }
  md += `\n`;

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `gsc-report-${end}.md`);
  fs.writeFileSync(outFile, md, 'utf-8');

  // Console summary
  console.log('✅ Report written to', path.relative(process.cwd(), outFile));
  if (t) {
    console.log(
      `\n   Clicks: ${num(t.clicks)} | Impressions: ${num(t.impressions)} | ` +
        `Avg pos: ${t.position.toFixed(1)} | Performing pages: ${pages.length}`,
    );
  }
  console.log(`   Top query: ${queries[0]?.keys[0] ?? 'n/a'} (pos ${queries[0]?.position.toFixed(1) ?? '-'})\n`);
}

main().catch((err) => {
  console.error('\n❌ GSC report failed:\n', err.message || err, '\n');
  process.exit(1);
});
