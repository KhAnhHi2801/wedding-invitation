# Code review: Phase 2 (content sections) + Phase 3 (envelope intro)

Date: 2026-10-19. Scope: src/App.tsx, main.tsx, components/*, icons/*, hooks/use-countdown.ts, lib/*, config/wedding-config.ts, styles/*, vite.config.ts, index.html.
Checks run: `tsc -b` clean; `oxlint src` 1 warning (refs, see M1); `vite build` OK (JS 104 KB gzip, CSS 5.3 KB gzip).
Not repeated, because the coordinator already verified them: date/timezone logic, Enter-to-open, `?to=` HTML escaping.

## Overall
The structure is solid. All wedding text comes from config, there are no stray hex colors in component CSS, only transforms and opacity are animated, the countdown is isolated in `CountdownBoxes`, the calendar is a real `<table>`, and the map uses a facade. No critical defects. There are 6 important issues: 4 are accessibility or layout, and 2 are design traps that phase 4 will fall into.

## Important

**I1. Main content is reachable before the envelope opens (a11y/logic).** `App.tsx:37` `<main>` is only scroll-locked with `overflow:hidden`. Tab from the seal moves focus to the map button, map link, RSVP button and so on. The browser scrolls focused elements into view even under `overflow:hidden`, so the "lock" breaks. Screen readers also read the whole invitation behind the envelope. Fix: `<main inert={!opened}>` (React 19 supports boolean `inert`). Keep phase 4 floating buttons outside `<main>`, or inert them too.

**I2. The seal's focus ring is invisible.** `global.css:42-45` sets the outline to `var(--wine)` #8b2f30, but the seal sits on `--envelope-flap` #7f2527, which gives roughly 1.1:1 contrast. Keyboard users can't see focus on the only control on screen. Fix: `.envelope__seal:focus-visible { outline-color: var(--paper); }`, or a two-tone ring.

**I3. Focus is lost after opening.** `envelope-intro.tsx:116` sets `disabled` on the focused button and hides it (`autoAlpha:0`), so focus falls to `<body>`. Fix: in `finish`, move focus to the first section (for example `main` with `tabIndex={-1}`) or to an h2/cover heading.

**I4. Gift heading contrast fails.** `gift.css:7` uses `--coral` #e4868a on `--paper`, about 2.8:1. That is below 3:1 even for large text. Use `--wine` or a darker coral token. Also minor: `rsvp.css:24` eyebrow (ink 75% on rose, 14px) is about 4.1:1, below 4.5:1.

**I5. "Bride"/"Groom" vertical labels are clipped at viewport widths of about 545-1000px.** `about.css:61-63,78-80` offsets the label by `-clamp(1.5rem,5vw,3.5rem)` outside `.about__person`, which is wider than the gutter (`clamp(1rem,4vw,2rem)`). For example, at 768px the right edge is about 8px past the viewport, and at 1000px about 18px. `body{overflow-x:clip}` hides the scrollbar, but the glyphs get cut. The label is only hidden below 34rem. Fix: keep the offset at or below the gutter, or add `padding-inline` to `.about .container` at widths up to about 64rem. Confirm in a browser at 600, 768 and 1000px.

**I6. A long guest name pushes the label up under the seal.** `guest.ts:1` allows `MAX_LENGTH = 40`. `.envelope__guest` (`envelope-intro.css:153-159`) wraps freely at a 1.6rem script font. At 360px, any name that needs 2 lines lifts `.envelope__label` (bottom-anchored) into the seal area at 56% ±24px, and the seal (z7) covers the "NĂM 2026" line. Fix: clamp the guest line to 1-2 lines (`-webkit-line-clamp` plus a smaller font for long names), or lower the max to about 28 characters.

### Phase 4 traps (fix the design now or record it in phase 4)
**P1. The scroll-lock class has a single owner.** The `App.tsx:22-26` effect toggles and removes `html.is-locked` purely from `opened`. If the phase 4 RSVP or gift modal reuses `is-locked`, the two will fight. A modal closing would unlock the page before the envelope opens, and any `opened` change would wipe the modal's lock. Use a ref-counted lock helper (`lockScroll()` returns `release`) or a separate class per owner.

**P2. Music must start inside the user gesture.** `onOpened` fires from the GSAP `onComplete` about 2.4s after the click. iOS Safari only allows `audio.play()` synchronously in the click handler. Phase 4 must call `play()` inside `open` (`envelope-intro.tsx:29`), for example through a separate `onOpenStart` prop, not from `onOpened`.

**P3. RSVP opens via `data-action="open-rsvp"`.** `rsvp.tsx:13` wires the button through a data attribute. In phase 4, pass an `onClick`/context callback instead of a document-level delegated listener, which is easy to leak under StrictMode double-mount.

## Minor

**M1. oxlint `react(refs)` at envelope-intro.tsx:29:28 is a false positive.** `contextSafe(fn)` only wraps `fn`; `rootRef` is read only when the handler runs. Wrapping in render is the official `@gsap/react` usage, and an unnamed `context.add` does not accumulate. You can suppress it with a one-line disable that states the reason, or leave it.

**M2. The countdown keeps ticking after reaching 0.** `use-countdown.ts:23-28` creates a new object each second, so the boxes re-render forever after the event. Clear the interval when `total === 0`, or return the previous state when nothing changed.

**M3. The calendar's last row is incomplete.** `save-the-date.tsx:44-50`: Dec 2026 has 32 cells, so the last `<tr>` has only 4 `<td>`. Pad trailing `null`s to a multiple of 7 for a regular table grid.

**M4. `aria-current="date"` is the wrong semantic for the wedding day.** It means "today" (`save-the-date.tsx:47`). Use sr-only text or `aria-label` on the cell instead. The caption/stamp is English "Dec 2026" on a `lang="vi"` page; consider a config label.

**M5. Split words have no whitespace between spans.** `ceremony.tsx:24-28` (h2 "Lễ Thành Hôn") and `marry-me.tsx:19-26` render adjacent spans with no space. The accessible name, copy and find-in-page can become "LễThànhHôn" or "MARRYME?". Add `{" "}` between items, or an `aria-label` that joins the words.

**M6. React keys use content** (`key={word}`, `key={line}`, `key={item.time}`). A repeated word in config would give a duplicate key. Use the index for static lists.

**M7. `guest.ts` sanitizing gaps.** `slice(0, 40)` can split a surrogate pair (an emoji becomes U+FFFD). Bidi overrides (U+202A-202E, U+2066-2069) are not stripped. Use `Array.from(str).slice(0, 40).join("")` and strip those ranges.

**M8. The hero image is not preloaded (plan step 6).** It is only discovered after JS renders, which delays LCP. The `wedding-html-meta` plugin could inject `<link rel="preload" as="image" imagesrcset=... imagesizes=... fetchpriority="high">` from the manifest.

**M9. Plan deviations in phase 3, not recorded in the plan.** The final "envelope slides out of the viewport" step is not implemented. Lite mode keeps 1 heart instead of none. There is no 2D flap fallback on `html.lite`. Fine if accepted; record it in phase-03.

**M10. The `.intro__hint` pulse dims the only visual instruction to opacity 0.45.** The thank-you GIF also keeps animating under reduced motion. Leave both for phase 6.

**M11. `meta.themeColor` "#8B2F30" duplicates the `--wine` token.** It is acceptable for the meta tag (CSS vars can't be used there), but note the two must stay in sync.

**M12. Hard-coded separators** `": "` (`timeline.tsx:27`), `" : "` (`gift.tsx:23`) and `" / "` (`save-the-date.tsx:26`). These are UI punctuation and acceptable under AC1.

## Acceptance criteria
1. Config-only strings: PASS (M12 noted).
2. Countdown, timezone and calendar: PASS. Grid leading = 1 for Dec 2026 and day 24 is highlighted. M2 and M3 are minor.
3. Envelope: PARTIAL. Lock, real button, reduced-motion, useGSAP cleanup, double-open guard and text-only guest name are all OK. Keyboard focus visibility (I2), focus loss (I3) and lock bypass via Tab (I1) fail.
4. Responsive 360-1440: PARTIAL. No scrollbar, but labels are clipped (I5) and the label overlaps the seal for long names (I6).
5. Images: PASS. width/height and srcset everywhere; only the envelope photo is `priority`. Preload is missing (M8).
6. A11y: PARTIAL. See I1-I4 and M4-M5. Heading order is OK (h1 then h2/h3) and decorative icons are aria-hidden. Touch targets are at least 44px (seal ≥48px, map buttons 44px, RSVP 48px).
7. No loose hex: PASS. Only rgba() shadows, plus rgba strokes inside the wax-seal SVG.
8. Performance: PASS. Only 4 `li` re-render per second, and only transform/opacity/zIndex are animated. `getComputedStyle` on the hearts runs once per open, which is fine.

Status: DONE_WITH_CONCERNS
Summary: Phases 2-3 are structurally sound and pass type, lint and build checks. 6 important issues need fixing before phase 4: inert main, seal focus ring, focus after opening, gift heading contrast, About labels clipped at tablet widths, and the long-guest-name overlap. Two phase-4 design traps: a ref-counted scroll lock, and starting audio inside the click gesture.
Concerns/Blockers:
- I5 and I6 come from CSS math and were not checked in a browser (no dev server was started, per instructions). Confirm at 360, 600, 768 and 1000px.
- The phase 3 plan deviations (M9) need to be accepted or implemented by the lead.
