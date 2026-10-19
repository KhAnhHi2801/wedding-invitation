# Code Review: Phase 6 (polish / responsive / QA)

## Scope
- Files: scripts/optimize-images.mjs, public/hero/couple.webp (+ -640), src/generated/image-manifest.json, src/components/envelope-intro.css, index.html, public/favicon.svg, public/robots.txt
- Focus: changed files only, read-only review
- Verification: production bundle with `--base /sub/` and default base in the scratchpad; headless Chrome screenshots at 360px and 390px (iframes, 2x DPR); WCAG contrast math

## Overall Assessment
All changes are correct. No blocking regressions. Two informational items: robots.txt policy for a private invite, and the hint text being tight to the seal at 360px.

## (a) Hero 1600 -> 960
- Correct. Manifest now `hero/couple: 960x1439, smallWidth 640`. `imageSet()` (src/lib/images.ts) and the preload in vite.config.ts both read the manifest, so `srcset`, `width`, `height` and `imagesrcset` stay in sync. The built HTML shows `imagesrcset=".../couple-640.webp 640w, .../couple.webp 960w"`, and its `imagesizes` matches `<Photo sizes>`.
- Sizing math: the card is about 0.86 x stage minus 1rem of padding. At 390px that is about 272 CSS px. At 3x DPR, `80vw` asks for 936 device px, so the browser picks 960 (enough). Desktop max is about 452 CSS px, or 904 at 2x, still within 960. `sizes` overstates by about 10% on mobile, which is harmless.
- Nothing else assumes 1600: grep found no `1600` outside the flower timing config. `hero.coverPhoto` is `photos/photo-01` (1200w job), not the hero file.
- og.jpg is generated from `source-images/hero/couple.webp` (5464x8192), not from the 960 output, so there is no upscaling. `withoutEnlargement: true` guards the WebP jobs.

## (b) Favicon with non-root base
- Works. With `--base /sub/`, the built index.html has `<link rel="icon" type="image/svg+xml" href="/sub/favicon.svg" />`. Vite rewrites root-absolute public-file URLs in HTML. favicon.svg is copied to the output. The SVG is 273 B, static and has no script.

## (c) robots.txt (`User-agent: * / Allow: /`). Report only, not changed.
- It leaks nothing itself, but it is effectively a no-op (same as having no file) and gives no privacy.
- Real exposure: personalised links `?to=<Guest Name>` carry guest names. If any link gets posted publicly, search engines may index guest-name URLs plus the event date, venue and couple's names. That is low-grade PII for a private event.
- If privacy is the goal, use `<meta name="robots" content="noindex, nofollow">` (or an `X-Robots-Tag` header) and keep robots.txt **allowing** crawl. A `Disallow: /` stops crawlers from ever seeing noindex, URLs can still be indexed from external links, and it can suppress link-preview crawlers (Zalo/Facebook) that matter for sharing.
- Trade-off: noindex costs the Lighthouse SEO audit ("page is blocked from indexing"), so SEO drops below 100. For a private invite that is the right trade. This is a product decision for the user.
- Note: with a subpath `base`, `/sub/robots.txt` is ignored by crawlers (only the host-root file counts). The meta tag works regardless of base.

## (d) CSS changes at 360 / 390px
- `.intro__hint` pulse min opacity 0.8. Blended contrast of #8b2f30 on #fcfcfc: 8.0:1 at opacity 1, **5.0:1 at 0.8** (was 2.3:1 at 0.45). Passes AA at every frame. The element is `aria-hidden`, so this only matters for low-vision sighted users and Lighthouse. Reduced motion: the global rule caps the animation at 1 iteration of 0.01ms, so it stays effectively static.
- `.envelope__invite` min 0.75rem, letter-spacing 0.16em. Paper on --envelope-light is 5.3:1 (AA). At 360px, "TRÂN TRỌNG KÍNH MỜI" fits on one line (about 346 of 620 px of envelope width in the 2x shot). No wrap, no overflow.
- `@media (max-width: 30rem) .intro__eyebrow` letter-spacing 0.24em. "WEDDING INVITATION" spans about x 67-290 at 360px and about 80-307 at 390px. The music FAB (fixed top-right, 44px, right 12px, so about x 304-348 at 360) only mounts after opening and leaves a gap of at least 14px. At 481px, where the media query stops, 0.4em still clears the FAB by estimate. No horizontal scroll was seen.
- Low: at 360px the label block (anchored `bottom: 8%`, grows upward) sits about 2px under the wax seal's lower edge ("NĂM 2026" almost touching the seal shadow). At 390px the gap is comfortable. The larger invite line contributes a few px. This is cosmetic. Optionally use `bottom: 6%` or reduce `.envelope__label` gap at narrow widths.

## Critical Issues
None.

## High Priority
None.

## Medium Priority
- robots policy vs guest-name URLs (see c). Needs a user decision.

## Low Priority
- 360px seal/label proximity (see d).
- Pre-existing, not from this diff: the CSS `intro-hint` animation owns `opacity`, so GSAP's `autoAlpha` fade-out of `.intro__hint` cannot animate opacity (animations override inline styles). It disappears abruptly when `visibility: hidden` lands at the end of the 0.25s tween. To fix, stop the animation on open (e.g. `.intro[data-state="opening"] .intro__hint { animation: none }`) or animate a wrapper.

## Plan Follow-ups (phase-06 checklist)
- No horizontal scroll: holds at 360/390 for the intro.
- Lighthouse Perf ≥85 / A11y ≥95: met per the reported numbers (94/100).
- "Share link shows correct image/title": **not verifiable yet**. `meta.siteUrl` is `""`, so og:image/og:url are omitted by design. This item stays open until the deploy URL is set.

## Metrics
- tsc / oxlint (1 known false positive on `contextSafe`) / vitest 70/70: as reported, not re-run.
- Subpath and root bundles succeeded.

## Unresolved Questions
- Does the couple want the invite indexable? If not, add a noindex meta and accept SEO < 100.
