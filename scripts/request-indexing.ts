/**
 * Bulk Indexing Request — Google Indexing API
 * --------------------------------------------
 * Submits every URL in the live sitemap to the Google Indexing API to
 * encourage Google to (re)crawl them. Useful when pages aren't getting
 * indexed (e.g. a freshly launched site).
 *
 * NOTE / honesty: Google's Indexing API is officially documented for
 * JobPosting and BroadcastEvent pages only. For regular pages it is not
 * formally supported — it often nudges crawling but is not guaranteed.
 * The reliable path remains: sitemap + Search Console "Request Indexing".
 * This script complements that, it doesn't replace it.
 *
 * Auth: same as gsc-report.ts (GOOGLE_SA_KEY_JSON / B64 / file / scripts/gsc-key.json).
 * The service account must have the Indexing API enabled and be an OWNER of
 * the Search Console property (verified — it is siteOwner).
 *
 * Run:  npx tsx scripts/request-indexing.ts
 *       npx tsx scripts/request-indexing.ts --sitemap https://msalmantahir.com/sitemap.xml
 */

import { GoogleAuth } from 'google-auth-library';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function arg(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const SITEMAP_URL = arg('sitemap', 'https://msalmantahir.com/sitemap.xml');

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
    console.error('\n❌ No service-account key found. See scripts/README-gsc.md.\n');
    process.exit(1);
  }
  return JSON.parse(json);
}

async function getToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: loadCredentials(),
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain access token');
  return token;
}

async function getSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`);
  const xml = await res.text();
  const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
  return matches.map((m) => m.replace(/<\/?loc>/g, '').trim()).filter(Boolean);
}

async function publish(token: string, url: string): Promise<number> {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return res.status;
}

async function main() {
  console.log(`\n📤 Requesting indexing for all URLs in ${SITEMAP_URL}\n`);
  const token = await getToken();
  const urls = await getSitemapUrls();
  console.log(`   Found ${urls.length} URLs.\n`);

  let ok = 0;
  let fail = 0;
  for (const url of urls) {
    try {
      const status = await publish(token, url);
      if (status >= 200 && status < 300) {
        ok++;
        console.log(`   ✅ ${status}  ${url}`);
      } else {
        fail++;
        console.log(`   ⚠️  ${status}  ${url}`);
      }
    } catch (err) {
      fail++;
      console.log(`   ❌ err  ${url}  (${(err as Error).message})`);
    }
    await new Promise((r) => setTimeout(r, 200)); // rate limit
  }

  console.log(`\n✅ Done. Submitted ${ok}/${urls.length} (failed: ${fail}).`);
  console.log(
    '   Reminder: also use Search Console → URL Inspection → Request Indexing\n' +
      '   for your top service pages, and check Pages → "Why not indexed".\n',
  );
}

main().catch((err) => {
  console.error('\n❌ request-indexing failed:\n', err.message || err, '\n');
  process.exit(1);
});
