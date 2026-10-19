# Tester report: phase 06 (polish / QA)

Date: 2026-10-19. Scope: validation only, no source edits. Preview on :4173 and Chrome CDP on :9333 reused, not restarted. No wish or RSVP submitted; all non-GET and external requests blocked in the browser probe.

Status: DONE_WITH_CONCERNS

## 1. Build and static checks

| Check | Result |
|---|---|
| `npm run build` (= `tsc -b && vite build`) | exit 0, no warnings. Built in 416 ms |
| `npx tsc -b` | exit 0 |
| `npx vitest run` | 11 files, 70/70 passed (1.16 s) |
| `npx oxlint` | 1 warning: `src/components/envelope-intro.tsx:31:28` react(refs). Known false positive, as stated |

Build sizes (vite output):
- Main JS `index-DQhzR7AZ.js`: 341.96 kB raw, 113.40 kB gzip (vite). Re-measured `gzip -9` on served file: 111,774 B. Under the 150 KB limit.
- Other JS chunks: guestbook 15.37 kB gz, garden-content 13.19 kB gz, wish-validation 13.48 kB gz, ScrollTrigger 17.54 kB gz, browser 8.86 kB gz. Garden and guestbook are lazy chunks.
- CSS: index 7.65 kB gz, guestbook 3.13 kB gz.
- Fonts: fontsource woff/woff2 latin + vietnamese subsets, 6.7 to 39 kB each.

## 2. Built assets

Note: the Bash scout hook blocks any command containing `dist`, so dist was checked over HTTP on the preview (which serves dist) and against `public/` sources.

| Asset | Served / source size | Status |
|---|---|---|
| `/hero/couple.webp` | 105,014 B (~103 KB) | present, 200, `image/webp` |
| `/hero/couple-640.webp` | 56,914 B (~56 KB) | present, 200, `image/webp` |
| `/favicon.svg` | 273 B | present, 200, `image/svg+xml` |
| `/robots.txt` | 23 B (`User-agent: *` / `Allow: /`) | present, 200 |
| `/og.jpg` | 102,658 B | present in public/, 200 |
| index.html icon link | `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` | present |

Notes:
- `og:image` / `og:url` are NOT emitted. `vite.config.ts:20` only emits them when `meta.siteUrl` is set (`wedding-config.ts:128`). By design. `og.jpg` is unreferenced until a siteUrl is set. Not a defect, but share previews are blank until then.
- Served HTML head is correct: theme-color, description, og:title/description/type, preload of hero webp (imagesrcset 640w/960w), title substituted.

## 3. Browser checks (preview :4173, Chrome 155 headless, CDP)

Widths 360, 390, 768, 1280. Method: open envelope via real mouse click on `.envelope__seal`, wait for `is-locked` removal, scroll whole page top to bottom (twice, to trigger lazy garden chunk and reveals), `scrollBy(200,0)`, measure.

| Width | Document scrollWidth | scrollX after scrollBy(200) | Console/page errors | Result |
|---|---|---|---|---|
| 360 | 360 | 0 | none (only the blocked wishes GET, see below) | PASS |
| 390 | 390 | 0 | none (same) | PASS |
| 768 | 768 | 0 | none (same) | PASS |
| 1280 | 1280 | 0 | none (same) | PASS |

- Off-viewport elements exist (e.g. `ceremony__name--bride` R=384 at 360, `garden__showcase` R=1794, `bloom` svg in garden). They sit inside clipped ancestors, so the document never scrolls. Document-level check is what matters. Watch item: a future element that escapes its clipping ancestor would break this.
- Envelope opens on all 4 widths. `is-locked` removed, 4 FABs present after open.

Keyboard:
- Tab from page load reaches `BUTTON.envelope__seal` on the first Tab (390). `:focus-visible` true.
- Focus ring: `outline: 3px solid rgb(252,252,252)` on the seal. Blurred state has `outline-style: none`. Screenshot `/private/tmp/claude-501/-Users-admin-Documents-myProjects-wedding-invitation/154f95de-c8cd-4939-9992-22819e86aaa8/scratchpad/focus-seal-390.png` shows the white ring clearly visible on the red envelope. Visible, PASS.
- Escape not tested (per instructions).

RSVP modal (390):
- Trigger: `.fab__group .fab__round:nth-child(2)` (chair icon, `fabRsvp`). Focused, then clicked.
- `DIALOG.rsvp-modal` opens, focus moves inside the modal.
- Close via `.rsvp-modal__close`. Modal closed, `document.activeElement` is the trigger. PASS.

## 4. Lite, reduced motion, garden flow (390)

| Mode | Envelope opens | Garden plant to writing form |
|---|---|---|
| `?lite=1` | yes (html class `lite` kept, `is-locked` removed) | yes, textarea + name input + submit visible |
| `prefers-reduced-motion: reduce` (CDP emulation) | yes (immediate finish path) | yes |
| default (control) | yes | yes |

Form not submitted. Caveat: reduced-motion emulation was applied via `Emulation.setEmulatedMedia`. I did not separately read `matchMedia` back. The reduced path was not timed separately.

## Concerns

1. [Environment] Bash scout hook (`~/.claude/hooks/scout-block.cjs`) blocks any shell command containing `dist`. To allow it the user would add `!dist` to `/Users/admin/.claude/.ckignore`. I did NOT change that config. Impact: dist checks used HTTP plus public/ sources. Byte sizes match, so the conclusion holds.
2. [Test artifact] The browser probe blocks all non-localhost and non-GET requests. That includes the GET to the wishes endpoint (`script.google.com/macros/s/.../exec?limit=50`, configured in `.env.local`). Result: the garden field and guestbook lists were empty in the probe. Real-data rendering was not exercised. No POST was sent.
3. [Asset] `public/bride-groom-dancing.webp` is 254 KB and referenced in `src/config/wedding-config.ts`. Check whether it is loaded eagerly. It is not a hero asset, so it is not on the hero critical path. Not measured.
4. [SEO/share] `og.jpg` exists but `og:image` is not emitted until `meta.siteUrl` is set. Expected by design. Set `siteUrl` before publishing if share previews matter.
5. [Lint] Single oxlint warning at `envelope-intro.tsx:31` (react refs), known false positive. Not blocking.
6. [Build] `npm run build` ran twice (once for log capture). Output identical. Preview on :4173 was not restarted.

## Unresolved questions

- Should `.ckignore` allow `dist` so future QA runs can inspect build output directly?
- Is `siteUrl` going to be set for this deploy? Affects whether `og:image` ships.
- Is `bride-groom-dancing.webp` (254 KB) lazy-loaded? Needs a check in the gallery/about code path.
