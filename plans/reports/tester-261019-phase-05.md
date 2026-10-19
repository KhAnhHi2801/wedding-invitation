# Phase 5 verification (garden mini-game, wishes, guestbook)

Verification only. No project source modified. Scratch checks in `/private/tmp/claude-501/-Users-admin-Documents-myProjects-wedding-invitation/154f95de-c8cd-4939-9992-22819e86aaa8/scratchpad/checks/` (`gs-edge.mjs`, `gs-flag.mjs`, `pure.mjs`, `static.mjs`). `.env.local` not read, endpoint not fetched, no wish submitted.

## 1. Typecheck, lint, unit tests

| Check | Result |
|---|---|
| `npx tsc -b` | exit 0, no errors |
| `npx oxlint src scripts vite.config.ts` | only the known `react(refs)` warning at `src/components/envelope-intro.tsx:31`. No other warnings |
| `npx vitest run` (TZ=America/Los_Angeles) | 9 files, 60/60 passed, 1.13s |
| `npx vitest run` (TZ=UTC) | 9 files, 60/60 passed, 1.05s |
| `npx vitest run apps-script` | 21/21 passed |

## 2. Production build

Build exit 0, 142 modules, no warnings in output.

| Chunk | Raw | Gzip | Load |
|---|---|---|---|
| `index-B_YaWhhH.js` (main) | 341.85 kB | **113.33 kB** | eager (budget 150 kB: PASS) |
| `index-DPJ1oZDT.css` | 34.84 kB | 7.63 kB | eager |
| `rolldown-runtime-*.js` | 0.59 kB | 0.36 kB | eager (modulepreload) |
| `garden-content-DVpmBqGJ.js` | 57.89 kB | 13.10 kB | lazy (dynamic import) |
| `garden-content-D74--UbI.css` | 1.29 kB | 0.55 kB | lazy |
| `guestbook-BaAfaoXS.js` (page-flip) | 57.06 kB | 15.31 kB | lazy |
| `guestbook-CyT2_QfV.css` | 10.76 kB | 3.13 kB | lazy |
| `ScrollTrigger-BoM0pWIV.js` | 42.74 kB | 17.54 kB | lazy |
| `browser-DFGfzVuB.js` (qrcode) | 23.47 kB | 8.86 kB | lazy, via `import("qrcode")` in gift-qr |
| `wish-validation-_-_fUOEy.js` | 49.53 kB | 13.54 kB | lazy. Name is misleading: holds FlowerMiniPreview + profanity list |
| fonts (`*.woff2`/`*.woff`) | 5-39 kB each | | unchanged |

- `index.html` eagerly loads only the main JS, the runtime (modulepreload) and the main CSS. No lazy chunk is preloaded. PASS.
- Main chunk: `PageFlip` 0 hits, `bloom__layer` 0, `qrcode` 0, profanity `fuck`/`buồi` 0. PASS.
- Lazy chunks are referenced only through `__vite__mapDeps` and dynamic `import()`. PASS.
- No folder named `gieo-một-lời-chúc` in the build output. PASS.
- `public/flowers`: 16 files, 1,193,912 bytes (~1.19 MB). No references in `src`, `scripts`, `vite.config.ts` or `index.html`. Unused, but still copied into `dist`. Recommend deleting.

## 3. Apps Script (`apps-script/wishes.gs`)

Existing suite: 21/21 pass. Throwaway edge checks: 37 run, **37 PASS**.

Key results:
- U1 NFD name stored as NFC: PASS. U2 zero-width and control chars stripped: PASS.
- U3/U6 emoji and ASCII 40 OK, 41 rejected: PASS. U5 message 30000 OK, 30001 rejected: PASS.
- U7/U8 NFD `đéo` and uppercase `ĐM` flagged: PASS. U9 `admin`/`dmx` not flagged, whole `dm` flagged: PASS.
- F1/F2 `PEONY`, `WINE`, ` Rose ` normalized: PASS. Array flower coerces to a valid id (harmless).
- P1 limit=1 with hidden rows between: walk gives V3,V2,V1 with no dup or skip: PASS. P2 trailing hidden rows give nextCursor null: PASS.
- P3 before = abc, -5, 0, 999999, '', 1.9: latest page: PASS.
- P4 limit abc→50, -1→1, 99999→200 (cache key): PASS. `0` → 50 (see concerns).
- P5 GET items keys exactly {id, createdAt, name, message, flower, ink}. No status/token/requestId/hidden text: PASS.
- P6 new wish invalidates cache: PASS. P7 manual moderation visible after up to 60s (cache): PASS (documented).
- B1-B7 bodies (null, [], 42, garbage, numeric/array/null name and message, string elapsedMs, guests '2'/true/null, RSVP name 81): PASS, with notes below.
- T1 token truncated to 64 (shared bucket beyond 64 chars): PASS. T2 empty token invalid: PASS.
- R1 duplicate requestId across tokens: PASS (second wish dropped, see concerns). R2 retry of profane wish returns same id: PASS.
- C1 DAILY_CAP=3 (string-replaced source): 4th rejected `rate_limited`: PASS. C2 RSVP_DAILY_CAP=2: PASS. C3 day key uses `yyyy-MM-dd`: PASS. C4 per-token 3 limit: PASS.
- S1 sanitize `=+-@` prefixed with space, round trip: PASS. S2 normal text unchanged: PASS.

Gap probes (recorded, not failures):
- Server counts codepoints, client counts graphemes (see HIGH finding below). Confirmed on server: 30000 flag emoji → `message_too_long`; 40 flag-emoji name → `name_too_long`; ZWSP-only name → `name_required`.
- `d m` (space-split) and `đ.m` profanity not flagged. Known limit of word matching.

## 4. Pure logic (src via Vite SSR loader, no port bound)

26 checks, **26 PASS**:
- `validateWish`: `admin`/`dmx` clean; `dm` standalone, `ĐM`, NFD `đéo` flagged; profanity in name reports under `message` key; `buồng` not flagged; name 40 OK / 41 too long; message 30000 OK / 30001 too long.
- `entryFor`: known id ignores seed; unknown or empty id picks `FLOWER_ENTRIES[hash(seed) % 15]` deterministically; fallback spread over 3000 seeds: min 184, max 209 per flower.
- `flower-wishes.ts`: 15 unique ids equal `flower-botanical` ids; non-empty `prompts/wishes/replies`; no duplicate strings within a flower; 0 duplicate strings across flowers; no profanity in config text.
- Ids match `FLOWER_IDS` in `wishes.gs`. `INK_KEYS` match `wish-style.ts` (`brown,navy,forest,wine,plum,teal`).
- Dedupe in `wishes-store.ts` (reasoning, existing unit tests cover behaviour): `keyOf = name + \0 + message`. Two different guests with identical name and message collide. Remote list is not deduped, so both visible copies show. A pending own wish whose key equals a remote one is dropped from the list and shown as the remote copy until Sheet is re-read. Low impact. Keying on `id` or a client `requestId` would remove the ambiguity.

## 5. Static checks

**(a) Strings and sinks**
- Hard-coded Vietnamese user-visible text outside config: **`src/lib/wish-style.ts:13-18`** (`label: "Nâu mực"`, `"Xanh mực"`, ...). Rendered in `src/components/garden-content.tsx:203` (`title={item.label}`) and `:212` (`sr-only`). Violates the config rule. Move to config.
- Other Vietnamese hits are comments or developer `Error` messages (`event-date.ts:21`, `flower-entries.ts:13`, `images.ts:28`, `viet-qr.ts:22-23`, `guestbook-book.js:10`). Exempt.
- `guestbook-book.js`: no Spanish-only characters (ñ ¿ ¡) and no Spanish words outside comments. `á í ó ú` hits are Vietnamese.
- innerHTML sinks (all safe):
  - `guestbook.tsx:27` reads the markup of React-rendered `FlowerMiniPreview` for a trusted config flower.
  - `guestbook-book.js:53` `flower()`: hard-coded colors plus numeric size.
  - `guestbook-book.js:203`: static SVG literal.
  - `guestbook-book.js:227` `flowerSvg(wish.flower, key)`: `entryFor` returns a trusted config entry. Unknown ids fall back to config. Wish name and message go through `textContent`. Ink color comes from a trusted table only.

**(b) Hex colors**
- CSS: hex literals only in `src/styles/tokens.css` (design tokens, expected). `bloom.css` and `guestbook.css`: none.
- TS/TSX: `src/features/flower-bloom/FlowerMiniPreview.tsx:18-58` has hard-coded SVG palette hex (`#FFFFFF`, `#D3CBC0`, `#DDD6C9`, `#B68B1E`). Informational.

**(c) Flower config**: PASS (see section 4).

**(d) File existence**: `src/config/flower-botanical.ts` present; `src/features/flower-bloom/` has BloomPlayer, BotanicalFlowerEngine, BotanicalPathLeaf, FlowerMiniPreview, FlowerSpeciesRenderers, audio, bloom.css, use-bloom-progress(+test); `apps-script/wishes.gs` present; `docs/wishes-setup.md` present; `flowerWishes.ts` absent at project root. All PASS.

## 6. Preview server

- Port 4173 was free before start. Started `vite preview --outDir <test5-out> --port 4173 --strictPort` in background.
- `curl -sI /` → `HTTP/1.1 200 OK`, `text/html`.
- `curl -sI /assets/guestbook-BaAfaoXS.js` → `200 OK`, `text/javascript`, 57063 bytes.
- Stopped only my process (PID 28002, SIGTERM; exit 143 is expected). Port 4173 confirmed FREE.

## Findings

### HIGH: poison wish can block the whole send queue (by code reading, not run in a browser)
- `src/lib/wishes-api.ts:78-81`: server errors other than `rate_limited`, `too_fast`, `invalid`, `name_required` become `ApiError("server")`.
- `:121`: `"server"` is in `RETRYABLE`.
- `flushPending` (~`:161-176`): on a retryable error it schedules a retry and returns. The rejected entry stays at the head of the queue, so every later wish is blocked too.
- Trigger: client accepts but server rejects with `name_too_long`, `message_too_long` or `message_too_short`. Examples: a 40-flag-emoji name; a 30000-flag-emoji message; a message of two ZWSP characters (client length 2 passes, server strips to empty).
- Fix: map `name_too_long`, `message_too_long`, `message_too_short`, `note_too_long` to `invalid` (non-retryable) in `post()`. Also align counting (grapheme vs codepoint) between `charCount` and the server. Add a unit test for the error mapping.

### MEDIUM
- Client/server length mismatch: client `charCount` counts graphemes (`src/lib/rsvp-validation.ts:24`), server counts codepoints (`Array.from`). Flags and ZWJ sequences diverge. Root cause of the HIGH above.
- Hard-coded VN labels in `src/lib/wish-style.ts` rendered as `title` and `sr-only` (see 5a).

### LOW
- `clean_` strips U+200D (ZWJ, in `\p{Cf}`), so family emoji `👨‍👩‍👧` becomes three separate emoji.
- `limit=0` → default 50, not clamped to 1 (`parseInt(...) || DEFAULT_LIMIT`). Values stay within 1..200, so no bounds violation.
- `before=2e9` → `parseInt` gives 2 → empty page. Garbage cursor returns empty, not latest. No crash.
- RSVP name over 80 chars returns `invalid`. Header contract lists `name_too_long` only for wishes. Client treats `invalid` as non-retryable, so no queue impact.
- Misnamed lazy chunk: `wish-validation-*.js` holds FlowerMiniPreview and profanity list. Cosmetic.
- `public/flowers` (~1.19 MB) is unused and shipped in `dist`.

### INFO (by design, recorded)
- Same `requestId` from another client returns the first result and drops the second wish. Harmless with client UUIDs.
- Rate-limit token truncated to 64 chars: tokens sharing a 64-char prefix share a bucket. Token is anonymous anyway.
- Profane wish POST response returns `status: "hidden"`, so the sender learns it was hidden.
- GET cache 60s: manual moderation (status to hidden) takes up to 60s. Documented in `docs/wishes-setup.md:78`.
- Profanity whole-word matching misses space- or punctuation-split forms (`d m`, `đ.m`).
- `keyOf` dedupe collision in `wishes-store.ts` (see section 4).

## Recommendations (priority)
1. Fix the `wishes-api.ts` error mapping (HIGH) and add a test for it.
2. Make client and server length counting identical (graphemes or codepoints) and add a flag-emoji test to `wish-validation.test.ts`.
3. Move `wish-style.ts` labels into `src/config`.
4. Keep ZWJ (U+200D) in `clean_` so family emoji survive.
5. Delete unused `public/flowers`.
6. Rename the lazy chunk, or leave as cosmetic.

Status: DONE_WITH_CONCERNS
Summary: tsc, oxlint (only known warning), vitest 60/60 in both TZs, apps-script 21/21 and 37/37 edge checks, 26/26 pure-logic checks, build within budget (main 113.33 kB gzip), lazy chunks verified, preview server checked and stopped. One HIGH finding: a server-rejected wish can block the whole send queue (code reading).

Unresolved questions:
- Is the HIGH queue-block reproducible in a real browser? Verified by code reading only.
- Should `public/flowers` be removed from the repo, or kept as a fallback?
- Should `limit=0` clamp to 1 or stay at the default 50?
