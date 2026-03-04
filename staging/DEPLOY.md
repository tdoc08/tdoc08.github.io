# Evermore Permanent Jewelry — Staging → Production Deployment

## Overview

All new development lives in the `/staging/` directory.
The live site files are in the **root** of this repository.
**Never edit root files directly** until you are ready to deploy.

---

## Staging URL (local preview)

Open `staging/index.html` with Live Server in VS Code (port 5501):
```
http://127.0.0.1:5501/staging/index.html
```

All staging pages show a red **STAGING** banner at the top so you always know which version you're viewing.

---

## File Structure

```
tdoc08.github.io/
├── [LIVE FILES — do not touch]
│   ├── index.html
│   ├── west-palm-beach.html
│   ├── permanent-jewelry-gulf-shores.html
│   ├── permanent-jewelry-orange-beach.html
│   ├── permanent-jewelry-pensacola.html
│   ├── ear-piercings-gulf-shores.html
│   ├── style.css
│   ├── script.js
│   ├── sitemap.xml
│   ├── CNAME
│   └── evermore_photos/
│
└── staging/                  ← All new development goes here
    ├── index.html
    ├── services.html
    ├── locations.html
    ├── foley.html
    ├── west-palm-beach.html
    ├── private-events.html
    ├── pricing.html
    ├── gallery.html
    ├── gift-cards.html
    ├── book.html
    ├── faq.html
    ├── permanent-jewelry-gulf-shores.html
    ├── permanent-jewelry-orange-beach.html
    ├── permanent-jewelry-pensacola.html
    ├── blog/
    │   ├── index.html
    │   ├── what-is-permanent-jewelry.html
    │   └── permanent-jewelry-cost-2025.html
    ├── assets/
    │   ├── css/style.css
    │   └── js/main.js
    ├── data/
    │   └── reviews.json
    ├── robots.txt
    └── sitemap.xml
```

---

## Pre-Deployment Checklist

Before copying staging → root, verify:

- [ ] Remove `<div class="staging-banner">` from every HTML file
- [ ] Update all internal links (remove `staging/` prefix if any absolute paths were used)
- [ ] Confirm all image paths are correct after move (they should stay as `../evermore_photos/` → `./evermore_photos/`)
- [ ] Verify `sitemap.xml` URLs point to `https://evermore-permanentjewelry.com/` (not staging paths)
- [ ] Verify `robots.txt` is correct for production
- [ ] Test on mobile (375px), tablet (768px), desktop (1280px)
- [ ] Run Google's Rich Results Test on schema markup
- [ ] Check all booking links (GlossGenius) open correctly
- [ ] Verify Google Tag Manager still fires (GTM-KCBVJLX)

---

## Deployment: Manual Copy Method

### Option A — Copy individual files via VS Code

1. Open the staging folder in VS Code Explorer
2. For each file you want to promote, right-click → Copy
3. Paste into the root directory (overwriting old files)
4. Remove the staging banner div before pasting
5. Commit and push to main

### Option B — Git command (promotes entire staging site at once)

```bash
# From repo root — run in Git Bash
# Step 1: Copy all staging files to root (overwrites live files)
cp -r staging/assets ./
cp -r staging/data ./
cp -r staging/blog ./
cp staging/index.html ./index.html
cp staging/services.html ./services.html
cp staging/locations.html ./locations.html
cp staging/foley.html ./foley.html
cp staging/west-palm-beach.html ./west-palm-beach.html
cp staging/private-events.html ./private-events.html
cp staging/pricing.html ./pricing.html
cp staging/gallery.html ./gallery.html
cp staging/gift-cards.html ./gift-cards.html
cp staging/book.html ./book.html
cp staging/faq.html ./faq.html
cp staging/permanent-jewelry-gulf-shores.html ./permanent-jewelry-gulf-shores.html
cp staging/permanent-jewelry-orange-beach.html ./permanent-jewelry-orange-beach.html
cp staging/permanent-jewelry-pensacola.html ./permanent-jewelry-pensacola.html
cp staging/robots.txt ./robots.txt
cp staging/sitemap.xml ./sitemap.xml

# Step 2: Remove staging banners from all root HTML files
# (Do this manually in VS Code — find "staging-banner" and delete those divs)

# Step 3: Commit and push
git add .
git commit -m "Deploy: promote staging to production"
git push origin main
```

### Option C — Rename/swap method (cleanest)

```bash
# Backup live files
git checkout -b backup-before-redesign

# Return to main and do the swap
git checkout main
cp -r staging/. ./      # copy all staging content to root
# Fix image paths: staging used ../evermore_photos/ which becomes ./evermore_photos/ at root
# This is already correct — no path changes needed

# Remove staging banners (find & replace in VS Code):
# Search: <div class="staging-banner"[^>]*>.*?</div>
# Replace: (empty)
# Check: "Use Regular Expression" in VS Code Find

git add .
git commit -m "Launch: new Evermore website redesign"
git push origin main
```

---

## Image Path Notes

- Staging files use `../evermore_photos/` to reference images in the parent directory
- After deployment to root, change all `../evermore_photos/` → `./evermore_photos/`
- **Find & Replace in VS Code:** `../evermore_photos/` → `./evermore_photos/`

---

## After Deployment

1. Submit updated `sitemap.xml` to Google Search Console
2. Test schema at https://search.google.com/test/rich-results
3. Run PageSpeed Insights: https://pagespeed.web.dev/
4. Check Google Search Console for crawl errors within 48 hours
5. Verify all redirects work for any old URLs that changed

---

## DNS / Domain

Domain: `evermore-permanentjewelry.com`
Hosted via: GitHub Pages (CNAME file in repo root)
Do not modify the CNAME file during deployment.
