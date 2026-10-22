# Evermore Permanent Jewelry — Staging → Production Deployment

## Overview

All development happens in `staging/`. The live site is the **repo root**, served by GitHub Pages
from `main`. Root files are *generated* from staging — never edit them by hand.

---

## Local preview

Open `staging/index.html` with Live Server in VS Code (port 5501):
```
http://127.0.0.1:5501/staging/index.html
```

---

## Publishing

From the repo root, in Git Bash:

```bash
bash staging/deploy.sh            # copy + transform every staging file into root
bash staging/deploy.sh --prune    # same, and delete root pages that no longer exist in staging
git status && git diff --stat     # review
git add -A && git commit -m "Deploy: promote staging to production"
git push origin main              # GitHub Pages rebuilds; live within a few minutes
```

The script copies every file under `staging/` to the same path in root, applying two transforms:

| Staging | Root | Why |
|---|---|---|
| `../evermore_photos/…` (blog: `../../evermore_photos/…`) | `evermore_photos/…` (blog: `../evermore_photos/…`) | photos live one folder above `staging/` |
| `assets/css/style.css`, `assets/js/main.js` | `…?v=<first 8 of sha256>` | cache-busting after CSS/JS changes |

Never published: `staging/DEPLOY.md`, `staging/deploy.sh`, `staging/archive/`.
Root-only files (never touched): `CNAME`, `CLAUDE.md`, `TRACKING.md`, `Evermore-StyleGuide.pdf`,
`evermore_photos/`, `marketing/`, dotfiles.

Without `--prune`, the script only *lists* root pages that have no staging source. Use `--prune`
when you have deliberately removed a page from staging.

---

## Pre-deployment checklist

- [ ] Test the changed pages on mobile (375px), tablet (768px), and desktop (1280px)
- [ ] Booking widgets (Acuity) load on `book-*.html` and the `#book` sections of the location pages
- [ ] Removing or renaming a page? Check every Google Ads asset and ad that points to it (see below)
- [ ] Changing copy on an Ads landing page? Make sure the ad text still matches what the page says

### Google Ads landing pages
Ad final URLs (source of truth: `marketing/google-ads/4_responsive_search_ads.csv`, gitignored):
`gulf-shores.html`, `myrtle-beach.html`, `west-palm-beach.html`, `ear-piercings.html`,
`oyster-shucking.html`, `private-events.html`. Sitelinks, callouts and the price asset are set in
the Google Ads UI — listed in `marketing/google-ads/BLUEPRINT.md` → *Assets / extensions*.

---

## After deployment

1. Submit `sitemap.xml` in Google Search Console if pages were added or removed
2. Check Search Console for crawl errors within 48 hours
3. Spot-check the live pages and GTM (GTM-KCBVJLX) on https://evermore-permanentjewelry.com/

---

## Removed pages

| Page | Removed | Notes |
|---|---|---|
| `pricing.html` | 2026-10-22 | Prices removed from the site; homepage section is now "Chain Options" (`#pricing`). Remove the "Pricing" sitelink in Google Ads. |

---

## DNS / Domain

Domain: `evermore-permanentjewelry.com` — GitHub Pages, `CNAME` file in repo root. Do not modify it.
