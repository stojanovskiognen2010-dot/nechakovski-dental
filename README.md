# Website Nechakovski

Static site for **Стоматолошка ординација Д-р Нечаковски** (Dr. Nechakovski Dental Practice),
ул. Филип Втори Македонски 54-1/1, Битола. Plain HTML/CSS/JS — no build step, no dependencies.

```
index.html              one page, Macedonian in the markup
assets/css/site.css     design tokens + components
assets/js/site.js       3-language engine + booking wizard
assets/img/             photos from the practice's own site and its Google listing + favicon
```

## Photos

| File | Where it came from | Used |
| --- | --- | --- |
| `team-2025.webp` 1600×612 | Google listing | team section |
| `curing-light.webp` 760×570 | Google listing, cropped to landscape | technology section |
| `team-2022.webp` 1600×718 | Google listing | — spare |
| `team-2019.webp` 1600×708 | Google listing | — spare |
| `logo-practice.webp` 1024×576 | Google listing | source for `logo.svg` — see below |
| `dr-kiril` · `dr-aleksandar` · `dr-eva` · `kavo-op3d` | practice's own site | team, technology |

`team-2025.webp` is the same photo the practice's old site used, but at 1600px
instead of 500px — the old copy was being upscaled to roughly 740px and looked
soft. The two spare team photos are older line-ups, kept in case a second
picture is wanted somewhere.

**`logo-practice.webp` is the practice's real logo** — a tooth with the rod of
Asclepius, white on navy, with the full name set beside it. It was posted to
the Google listing, which is the only place it appears; their own site never
used it.

## The mark

`logo.svg` is that logo traced to vector, and it is what the site now uses:
the same path is inlined as the `#mark` symbol in `index.html` (header and
footer, inheriting `currentColor`) and sits on the navy square in
`favicon.svg`. The hand-drawn tooth-in-a-circle it replaced is gone.

It was traced with potrace from the logo card: the mark crops to 80×168 px at
`(470, 380)` in `logo-practice.webp`, upscaled 6×, thresholded at luminance
140, `alphamax 1.0`, `opttolerance 1.0`, coordinates divided back down to an
80×168 viewBox. That is the whole provenance — rerun it if a cleaner original
ever turns up.

Two things follow from the shape being tall (80:168) and finely drawn:

- `.brand__mark .icon` sets `width: .48em` so the square icon box does not
  leave dead air either side of it.
- In `favicon.svg` the mark carries a 3-unit stroke in its own colour. At
  16 px the unstroked trace dissolves; stroked, it at least holds a
  silhouette. It is still the weakest size — if the practice ever wants a
  sharp 16 px icon, that needs a simplified mark, not this one.

A 1024×576 JPEG is a poor source for a trace. If the practice has the original
artwork, retracing from it would be worth the ten minutes.

Everything in the listing is reproduced here as the practice's own material.
Confirm with them that the Google photos are theirs to publish before the site
goes live — one of the six (a stock "before / after" collage) was left out.

## Run it

```bash
node static-serve.mjs "." 5290
```

Any static server works; so does opening `index.html` directly (only the Google Fonts request needs the network).

## Languages

Macedonian is the source of truth **in the markup**. English and Greek are dictionaries in
`site.js` (`EN`, `EL`) that replace it; switching back to MK restores the captured markup, so
there is no MK dictionary. Add a string by giving the element `data-i18n="some.key"` (or
`data-i18n-attr="alt:some.key"`) and adding that key to both `EN` and `EL`.

Language is chosen by `?lang=en` → `localStorage['nd-lang']` → `mk`.

Month and day names are hand-written arrays for all three languages — Chrome's `Intl` has no
Macedonian and silently returns English. `Intl` is used only to convert "now" into Europe/Skopje
time, never for display.

## Colours

The palette is the one from the Lovable preview of this practice, adopted on the client's
instruction. Every value lives in `:root` in `site.css`, written as hex to match the rest of the
file with the original oklch beside it in a comment.

What changed from the first build: the dark bands went from the practice's own navy **#26426A**
to a near-black **#021828 / #062942**, and the gold went from the muted **#A98B55** to a brighter
**#C99D4E**. Ivory, section tint, hairlines and body text barely moved — they were already within
a hair of the preview's.

**The site no longer carries the practice's own brand colour.** #26426A is the navy every heading
and border on stomatolog.mk computes to; it is now gone from the page. Reverting is a four-line
edit in `:root`.

### There are two golds

The preview's gold is `#C99D4E`. As text on the ivory it measures 2.4:1 — below the WCAG floor at
any size — so it is **not** used for text on light backgrounds. There is a second token:

| token | value | used for |
| --- | --- | --- |
| `--gold` | `#C99D4E` | rules, icons, button fills, hover and focus borders, the hero artwork, and gold text **on the dark bands** |
| `--gold-ink` | `#8C5F00` · `oklch(52% .12 80)` | every gold **text** on a light background — eyebrows, the brand line, badges, doctor roles, the gold half of the display headings, the stars, and the dialog's kicker and required marks |
| `--gold-soft` | `#E3CFA5` | gold on navy — the CTA band, the footer brand, monogram avatars |

`--gold-ink` was picked against `--gold-wash` (`#F1E7D2`), the darkest light background any gold
text lands on — the founder card. It clears 4.5:1 there, so it clears it everywhere else too.
Measured on the built page, the tightest gold text is now **4.56:1** and the eyebrows are
**4.84:1**; nothing is below its floor. Gold on the dark bands went the other way and is
excellent (9.8:1).

One rule exists only because of this split: `.footer__brand .brand__sub` takes `--gold-soft`,
because `.brand__sub` is shared between the ivory header and the navy footer and the dark gold
would drop to 3.2:1 down there.

## Booking

One appointment type: a **30-minute check-up**. Slots are at `:00` and `:30` — two per hour —
Monday to Friday 08:00–20:00, up to 60 days ahead, with nothing bookable inside the next hour.
All of that comes from four constants at the top of `site.js`:

```js
var SLOT_MINUTES = 30;
var OPEN = [[8 * 60, 20 * 60]];
var LEAD_MINUTES = 60;
var BOOK_DAYS_AHEAD = 60;
```

The opening-hours table in the contact section and the live open/closed line are generated from
the same `OPEN` constant, so they cannot drift apart from the slot grid.

**There is no availability backend.** Every open slot is always offered; submitting opens a
pre-filled SMS, Viber or e-mail to the practice, and the patient is told they will be called to
confirm. If the practice later wants taken slots to disappear for everyone, that needs a small
hosted backend — it is not a change to this file alone.

Name and phone are required; **e-mail is optional** and only validated when it is not empty.
Clicking any service card opens the same booking window, with nothing pre-filled. There is one
appointment type and only one — a check-up — so the summary always reads
`Услуга: Преглед (30 мин.)` whichever button was pressed. The cards still carry a `data-book="<id>"`
value in the markup; `openBooking` deliberately ignores it, so re-enabling per-service bookings
later is a change in one function rather than 33 attributes. The "reason for the visit" field
is still there, still optional, and is now only ever filled by the patient.

## The services grid

All 33 services are in the markup, but the grid shows **6 at a time** — `SERVICES_SHOWN` in
`site.js`. A button under it opens the rest and closes them again. Thirty-three cards ran to
2700px on desktop and buried the team, technology and contact sections under them; capped, the
section is 919px and the page is about a fifth shorter.

The cap applies to whatever the category tabs have selected, so "Протетика 9" also shows 6 with
a `(9)` on the button, while "Рендген 2" shows both and no button appears. The counts on the tabs
still describe the whole category, not what is on screen. Opening the list and then switching
tabs collapses it again.

Nothing was deleted — every service is still in `index.html` and still reachable in one click.
Raise or lower `SERVICES_SHOWN` to taste; 6 fills exactly two rows on desktop and three on
tablet.

## Ask the practice for

Things only they can hand over. Everything else on the list below can be decided here.

- [ ] **The original logo artwork** — vector if it exists (AI / EPS / PDF / SVG), otherwise the
      largest raster they have. What the site uses now is traced from a 1024×576 JPEG on their
      Google listing, which is the only public copy; the curves are an approximation of theirs,
      and no trace of that source will ever be sharp at 16 px. Show them
      `assets/img/logo-trace-check.png` — it puts the trace beside the original at every size the
      site uses — and ask whether the trace is close enough to keep in the meantime.
- [ ] **Photos of Dr. Hristina Stojcheska and Dr. Elena Vrtkovska** — they are the only two with
      no portrait and currently show a monogram. Also worth asking for a current set of interior
      and treatment photos; see the photo note on the checklist below.
- [ ] **Real review text** for the three cards in `#recenzii`, or permission to drop them.
- [ ] **Confirmation of the bookable window** — is 08:00–20:00 right for check-ups specifically?

## Before this goes public

- [ ] **Review quotes** — the three cards in `#recenzii` are PLACEHOLDER text. The rating (4,9)
      and the review count (31) are verified from Google; the quotes are not. Replace them with
      real review text, or delete the three cards and keep the rating and the Google link.
- [ ] **Greek translation** — written for this site; the practice had no Greek version. Needs a
      native speaker's pass.
- [ ] **Show the client the darker gold.** Gold text on light is no longer the preview's
      `#C99D4E` but a deeper `#8C5F00`, because the preview's gold measures 2.4:1 on its own
      ivory (see "Colours"). Rules, icons and fills keep the preview's gold, so the page still
      reads as the same palette — but the display headings and eyebrows are visibly deeper than
      the preview and they should see that before sign-off.
- [ ] **The mark** — now their own logo, traced (see "The mark" above); the source artwork is on
      the ask list. The *wordmark* beside it is still set in EB Garamond, not their lettering —
      their old site used a 350×42 bitmap title graphic that has no mark in it.
- [ ] **Bookable window** — confirm 08:00–20:00 is right for check-ups specifically. The per-doctor
      rota in the contact section comes from a page that may be out of date.
- [ ] **Photos** — the team photo and the equipment shot now come from the Google listing at full
      size, but the three portraits are still 100×128 from the practice's own site, and
      Dr. Hristina Stojcheska and Dr. Elena Vrtkovska have no photo at all and show a monogram.
      They cannot be cropped out of the group photo without knowing which person is which.
      Real photography would still lift the whole page.
- [ ] **Remove `<meta name="robots" content="noindex, nofollow">`** from `index.html` on approval.

No prices appear anywhere — the practice's own site publishes none.

## Verified

Checked in headless Chrome: all three languages with no fall-through to Macedonian, the booking
flow end to end (validation, optional e-mail, SMS/Viber/e-mail bodies, 30-minute `.ics`), hardware
Back stepping through the dialog instead of leaving the page, keyboard-only operation with the
focus trapped in the dialog, and no horizontal scroll at 375 / 768 / 1280 / 1920. No console
errors. The only network request before interaction is Google Fonts — the map iframe loads only
when clicked.
