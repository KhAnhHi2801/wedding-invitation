# Phase 4 review: scroll effects and interactions

Scope: App.tsx, lib/{scroll-lock,music,wishes-api,viet-qr,rsvp-validation,copy-text,toast-context}, hooks/{use-reveal,use-in-view,use-parallax,use-countdown}, the new and changed components with their CSS, styles/{reveal,sections}.css, config types, scripts/optimize-images.mjs, vite.config.ts, tests.

Checks run:
- `tsc -b`: clean.
- `oxlint src`: 1 warning, the known false positive at envelope-intro.tsx:31.
- `vitest`: 4 files, 20 tests pass.
- Build to scratch: index JS 110.73 KB gzip, ScrollTrigger 17.54 KB lazy chunk, qrcode (browser-*.js) 8.85 KB lazy chunk, CSS 6.60 KB.
- Animated WebP is 254,154 B (budget 256,000 B). The still is 15.7 KB, 360x360, which matches the width/height attributes.

Overall: solid. No critical defects. Most acceptance criteria are met. The open items are UX/robustness gaps, a few deviations from the plan, and traps that phase 5 will hit.

## Critical
None.

## Important
1. **The copy fallback likely fails in iOS in-app browsers, and the failure is silent** (lib/copy-text.ts:7-19, components/gift.tsx:21-23).
   - Invitations are shared mostly through Zalo/Messenger webviews, where `navigator.clipboard.writeText` is often rejected.
   - On iOS, `textarea.select()` on a `readonly` textarea does not select anything, so `execCommand("copy")` returns false.
   - `Gift.copy` then does nothing: no toast and no feedback at all.
   - Fix: in the fallback, call `area.setSelectionRange(0, text.length)` after `select()`, and drop `readonly` (or set `contentEditable`). Add a `gift.copyFailed` config string and show it as a toast when copy fails. Optionally select the visible number so the guest can copy it by hand.
2. **The RSVP backend contract points at files that do not exist** (lib/wishes-api.ts:2-6, vite-env.d.ts:4).
   - `apps-script/wishes.gs` and `docs/wishes-setup.md` are missing.
   - So the success criterion "RSVP sends when an endpoint exists" cannot be verified in this phase. Only the "no endpoint gives a friendly error" path is actually covered.
   - Phase 5 must create the script with exactly this contract: `kind:"rsvp"`, `RSVP` tab, `MIN_FILL_MS` 3000, and the listed error codes.
3. **Traps for phase 5:**
   - a. **Toast vs. the top layer** (components/toast.tsx:23). The toast is a normal fixed element. While any `showModal()` dialog is open (RSVP now, guestbook later), everything outside the dialog is inert and sits under `::backdrop`. A toast fired from inside a modal is neither visible nor announced. Render the toast in the top layer (`popover="manual"` + `showPopover()`), or show feedback inside the dialog.
   - b. **The garden pill is detected once** (floating-actions.tsx:22). `useState(() => getElementById("garden"))` only checks at FAB mount. If the garden is `React.lazy`/Suspense or rendered conditionally, the pill never appears. Either keep `#garden` rendered synchronously inside `<main>`, or pass a `hasGarden` prop from App.
   - c. **Error mapping is lossy** (wishes-api.ts:69-79):
     - `too_fast` and `name_required` from the script fall through to `server`/`invalid` and end up as the generic message.
     - Non-JSON responses (an Apps Script HTML error page when the deployment is not "Anyone"), JSON parse errors and timeouts are all reported as `offline`.
     - There is no `response.ok` check.
     - Fix: add a `too_fast` code and map parse failures to `server`.
   - d. **`elapsedMs` is measured from module load, not from opening the form** (wishes-api.ts:23). It is fine as a weak signal, but the guestbook should not count on it to stop bots that wait for 3 s.
4. **Plan deviations to accept or fix** (record them in the plan):
   - The SaveTheDate "ngày 24 pulse nhẹ" is not implemented (save-the-date.css:72 has no animation).
   - The MarryMe outline text "fade + tracking" only fades (marry-me.tsx:13).
   - ThankYou uses a clip-path wipe instead of an SVG stroke-dashoffset.
   - Gift shows the QR inline instead of in a QR modal (the requirement said "quà mừng mở modal QR").
   - `gift-modal.tsx` and `music-toggle.tsx` were never created (their logic is folded into gift-qr and floating-actions).
   - `gsap.matchMedia()` is not used: reduced motion is read once at mount (use-parallax.ts:18), so changing the OS setting mid-session does not kill an active scrub. That is low impact.

## Minor
- **RSVP "no" still sends `guests`** (rsvp-modal.tsx:99): the default is 1, so the sheet records "không tham dự, 1 khách". Send `0`, or omit `guests`, when `attending === "no"`.
- **Backdrop close on drag** (rsvp-modal.tsx:119-122): `mousedown` in an input followed by `mouseup` on the backdrop dispatches the click to the `<dialog>`, which closes the form and loses the typed text (desktop text selection). Track the `pointerdown` target and only close when both down and up landed on the dialog itself. Mobile is unaffected.
- **Music state drifts on OS pauses** (music.ts:35-48): state only updates from the `play()` promise. iOS interruptions (a call, Control Center, another app's audio) pause the element while state stays `playing`, so `aria-pressed` is wrong and the next tap is a no-op. Subscribe to the element's `play`/`pause` events.
- **The music asset is WAV** (wedding-config.ts:295, 88 KB placeholder): a real track as WAV would be several MB. Document MP3/AAC/Opus in the config comment.
- **ScrollTrigger is set up while the page is locked** (use-parallax.ts:23-41): on desktop the scrollbar reappears when the lock is released, which changes the layout width without a `resize` event, so start/end values can be slightly stale. Call `ScrollTrigger.refresh()` after `opened`, or use `scrollbar-gutter: stable`.
- **Unrevealed content is invisible when printed** (reveal.css): add `@media print { [data-reveal] { opacity:1; transform:none; clip-path:none } }`.
- **FAB jumps don't move focus** (floating-actions.tsx:12): the gift and garden buttons scroll but leave focus behind. For keyboard/screen-reader users, focus the target heading (with `tabIndex=-1`) after scrolling.
- **Toast does not re-announce a repeated message** (toast.tsx:11-15): showing the same text twice changes nothing in the DOM. Clear the message for one frame first, or append an invisible counter.
- **Hero preload ignores `base`** (vite.config.ts:23): the `/${photo}` path breaks if the site is deployed under a sub-path (the config comment at wedding-config.ts:5 says that should be supported). Prefix it with the config `base`.
- **No golden QR vector** (viet-qr.test.ts): the test only checks structure. Add one full string from a reference generator (for example a known VietQR.io output) to prevent regressions. I checked the payload by hand:
  - `00 02 01`, `01 02 11` (static), then tag 38 = `0010A000000727` + `01{len}(00 06 BIN + 01 len acct)` + `0208QRIBFTTA`. For the sample data that is length 53, which is correct.
  - `5303704`, `5802VN`, `6304` + CRC-16/CCITT-FALSE over the body including `6304`; the `29B1` check vector is correct.
  - Omitting 54/59/60 is normal for personal-transfer VietQR. Nothing suspicious.
- **Heading outline**: Timeline, Gallery, MarryMe and ThankYou have no heading. This is acceptable for decorative sections, but the page outline is thin.
- **Countdown keeps ticking when hidden** (use-countdown.ts:32): 4 nodes per second, negligible. Optionally pause on `document.hidden`.

## Verified OK (acceptance points)
1. **Reveal system:**
   - Every section has a preset, and the presets match the table apart from the deviations in Important 4.
   - It runs once (`unobserve`) and uses only opacity/transform/clip-path.
   - The reduced-motion rule wins by source order at equal specificity.
   - StrictMode cleanup fully restores state, and `useLayoutEffect` prevents a flash.
   - Component CSS has no authored transform/opacity/transition on reveal targets, so `.is-in { transform:none }` clobbers nothing.
   - Tall elements, zero-height lines (`lineY`, which is edge-adjacent) and the last element (thanks padding of at least 5rem is larger than the 10% root margin at common viewports) all intersect.
   - Without IntersectionObserver, everything is shown.
   - Elements still have no dynamic `className` that would wipe `is-in`.
2. **Parallax:**
   - Lazy import, guarded by a `cancelled` flag.
   - `context.revert()` on cleanup, and selectors are scoped through the gsap context.
   - Skipped on lite and reduced motion.
   - Parallax targets are fadeIn (opacity-only) or not revealed at all (`.gallery__bg`).
3. **Scroll lock and page structure:**
   - The counted lock has an idempotent release and is StrictMode-safe.
   - `<main inert>` until the invitation is opened.
   - FAB, modal and toast are outside `<main>`.
4. **Music:**
   - Plays only from a gesture (`onOpenStart` is synchronous inside the click; `autoplay:false`).
   - The error event fires before the play() promise rejects, so the state becomes `unavailable` and the button is hidden.
   - The visibilitychange pause/resume logic is correct.
5. **RSVP modal:**
   - Native `showModal`, `aria-labelledby`, focus goes to the name field.
   - Visible labels, a `fieldset`/`legend` for the choice.
   - Field errors use `role=alert` + `aria-describedby`, and the first invalid field receives focus.
   - Honeypot present, submit disabled while sending, friendly message for an `unavailable` endpoint.
   - The panel is an inner div, so clicks inside it never close the modal.
6. **VietQR:** correct, see the vector note under Minor.
7. **Toast:** `role=status`/`aria-live=polite`, always in the DOM.
8. **Performance:**
   - Budget met (110.7 / 150 KB).
   - Hearts are paused off-screen and hidden on lite and reduced motion.
   - No per-frame React renders; the countdown re-renders only `CountdownBoxes`.
9. **Accessibility basics:** touch targets of 2.75rem or more, aria-labels on the icon FABs, `aria-pressed` on the music button.
10. **Layout:** `.section { overflow-x: clip }`, gift rows stack at 34rem or narrower.
11. **Config-driven text:** no hard-coded Vietnamese UI strings in the components.

## Recommended actions (priority)
1. Harden the copy fallback for iOS and add a copy-failure toast (Important 1).
2. Before phase 5 UI work, decide how the toast reaches the top layer and how the garden pill is detected (Important 3a/3b).
3. Extend the API error mapping (3c). Phase 5 must create the Apps Script and setup doc that match the header contract (Important 2).
4. Update the plan with the accepted deviations, or implement the pulse and tracking (Important 4).
5. Minor items as time allows. The RSVP `guests` value when declining and the music `play`/`pause` event sync are the cheapest wins.

## Unresolved questions
- Is the inline gift QR (instead of a modal) an accepted design change?
- Which audio format and size will the real track use?

Status: DONE_WITH_CONCERNS
Summary: Phase 4 meets the core acceptance criteria. Typecheck, tests and build pass, the JS budget is met, and the VietQR payload is correct. Remaining issues are the copy fallback on iOS webviews failing silently, a backend contract that refers to files that do not exist yet, plan deviations, and toast/garden traps for phase 5.
Concerns/Blockers: copy fallback in Zalo/iOS webviews; the apps-script and docs files are missing, so a real RSVP submit is unverified; a toast is invisible while a modal dialog is open (phase 5); the garden pill is detected only at mount (phase 5); the SaveTheDate pulse, MarryMe tracking and gift QR modal deviate from the plan.
