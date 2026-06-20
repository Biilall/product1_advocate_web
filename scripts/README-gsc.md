# Google Search Console SEO Report

Pulls **real** ranking and index data for `msalmantahir.com` directly from the
Google Search Console API — no Semrush, no scraping, fully ToS-compliant.

## What it reports
- Total clicks, impressions, average CTR, average position
- Performing/indexed pages (with per-page clicks, impressions, position)
- Top ranking queries (your actual keyword positions)
- Quick-win keywords (position 5–20 with high impressions)
- Audience by country and device
- Sitemap submitted vs. indexed counts

## One-time setup (4 steps)

1. **Enable the API** — In Google Cloud project `product1advocateweb`:
   APIs & Services → Library → search "Google Search Console API" → **Enable**.

2. **Service account key** — You can reuse the existing deploy service account or
   create a new one (IAM → Service Accounts → Keys → Add key → JSON).

3. **Grant it Search Console access** — In
   [Search Console](https://search.google.com/search-console) →
   Settings → Users and permissions → **Add user** → paste the service-account
   email (looks like `name@product1advocateweb.iam.gserviceaccount.com`) →
   permission **Restricted** (read-only is enough).

4. **Provide the key** — pick one:
   - Save the JSON as `scripts/gsc-key.json` (gitignored), **or**
   - `export GOOGLE_SA_KEY_JSON="$(cat /path/to/key.json)"`, **or**
   - `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

## Run

```bash
npx tsx scripts/gsc-report.ts                 # last 28 days
npx tsx scripts/gsc-report.ts --days 90       # last 90 days
npx tsx scripts/gsc-report.ts --site https://msalmantahir.com/ --rows 200
```

The markdown report is written to `scripts/output/gsc-report-<date>.md` and a
summary is printed to the console.

## Notes
- The Search Console API does not expose a single "indexed pages" number. The
  script uses pages-with-impressions as a reliable proxy; for the exact figure
  see Search Console → Indexing → Pages.
- If the property is a **Domain property** (not URL-prefix), set
  `--site sc-domain:msalmantahir.com`.
- The key file and `scripts/output/` are gitignored — nothing secret or
  generated is committed.
