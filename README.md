# Ember House · co-living pg2

Dark, warm, editorial co-living site aimed at young working professionals. Plain HTML/CSS/JS, no build step.

## Run locally
```
node server.js
```
Open http://localhost:3000 (root-relative paths, so don't open index.html directly).

## Deploy
Vercel (framework "Other", no build, output `.`) or Netlify. `vercel.json`, `.vercelignore` and `netlify.toml` are set for a static deploy with no 404s.

## Replace before launch
Brand, phone, email, prices (accordion, membership table, `data-m` attributes), house details, media in `assets/` (same names) and `CREDITS.md`. The reserve form has a marked spot in `js/main.js` to connect to a CRM or email.

## What's in it
Counter loader with lifting shutters · hero video in a dark room lit only where your cursor is (the light widens as you scroll) · words that brighten as you read · accordion room panels · 3D walk-through that flies the camera past ten rooms · two-row amenity marquee that speeds up with scroll · cursor image trail ("evenings") · membership table with animated monthly / 6-month prices · curtains that part on a rainy-window video · grayscale-to-colour location cards · three-step reserve form.
