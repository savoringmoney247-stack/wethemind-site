# We The Mind — website

Static site, hosted on GitHub Pages. No build step — every page is plain HTML, sharing one stylesheet (`style.css`) and one small currency-display script (`currency-shared.js`).

**On links and the domain:** every internal link is a *relative* path (`../education/pricing/`, not `/education/pricing/`), so the site works correctly both on the default `username.github.io/wethemind-site/` URL and later on a custom domain — no link changes needed either way. `sitemap.xml`, `robots.txt`, and the canonical/OG/Twitter meta tags in each page's `<head>` currently point at `https://wethemind.com/` as a placeholder for when that domain is bought; update those (and add back a `CNAME` file) once it's live. Until then they're just inert — they don't affect how the site actually functions.

## Brand architecture

**We The Mind** is the umbrella brand. It currently has one fully-built division (**Education**) plus a cross-link to a sibling site (**Savoring Money**) and four "coming soon" divisions:

```
We The Mind (/)
├── Education (/education/)       — fully built: mentoring, pricing, practice tools
├── Savoring Money (/money/)      — cross-links to the separate savoring-money repo/site
├── Tech (/tech/)                 — coming soon, has an interest-capture form
├── Tools (/tools/)                — coming soon, has an interest-capture form
├── Academy (/academy/)           — coming soon, has an interest-capture form
├── Blog (/blog/)                 — coming soon, has an interest-capture form
├── About (/about/)
└── Contact (/contact/)
```

Every page carries a slim **umbrella bar** (dark strip, top of page) linking between divisions, in addition to each division's own navigation.

## URL structure

Clean, extensionless URLs throughout — every route is a folder containing an `index.html`, e.g. `education/pricing/index.html` serves at `.../education/pricing/`. All internal links are relative paths (`../education/pricing/`, `../../style.css`, with the exact number of `../` depending on how deep the linking page sits), so the site works whether it's served from a domain root or from a GitHub Pages subpath like `username.github.io/wethemind-site/`.

## Folder map

| Path | What it is |
|---|---|
| `index.html` | Umbrella homepage — hero + cards linking to each division |
| `education/index.html` | Education's landing page: hero, "why start at Grade 9", offer cards, booking form, mass-session signup, FAQ |
| `education/curriculum/` | Full Boards & Exams detail |
| `education/pricing/` | 1:1 / Group / Single-Session / Free Live Class pricing, with live currency conversion |
| `education/study-squad/` | The 13 animal mentor mascots |
| `education/resources/` | Worksheets & Course Plans preview |
| `education/games/`, `education/grammar/`, `education/vocabulary/` | Free practice tools |
| `education/sat-practice/` | Hub linking to 12 full SAT Math practice exams (`set-a/` … `set-l/`) |
| `education/exam-prep/` | Hub for `act/`, `tifr/`, `amc/` — AMC/TIFR/ACT practice vaults |
| `education/math-tracker/` | SAT Math topic checklist tool |
| `money/`, `tech/`, `tools/`, `academy/`, `blog/`, `about/`, `contact/` | Umbrella-level pages (see architecture above) |
| `privacy/`, `terms/` | Legal pages |
| `style.css` | Shared stylesheet for every page (includes a `prefers-color-scheme: dark` block) |
| `currency-shared.js` | Lightweight currency-display conversion used on a few marketing pages (pricing.html has its own, more detailed, script) |
| `Code.gs` | Google Apps Script backing every form on the site (booking, mass-session signup, interest-capture forms, contact form) — writes to one Google Sheet, uploads files to Drive |
| `sitemap.xml`, `robots.txt` | SEO |
| `CNAME` | Custom domain for GitHub Pages (`wethemind.com`) |
| `we-the-mind-course-plans.pdf` | Downloadable course plans & pricing guide |

## Forms and the Google Sheet

Every form on the site (`demo-form`, `mass-session-form`, the four division "Notify Me" forms, and the contact form) posts to the same Google Apps Script endpoint and lands in one "Responses" sheet tab, distinguished by a `session_type` value (e.g. "Free 30-Minute Demo", "Tech Interest", "General Contact"). See `Code.gs` for the full field list and setup instructions.

## Adding a new division or page

1. Create a folder with an `index.html` inside — that becomes the clean URL.
2. Link `style.css` with the right number of `../` for the new file's depth, and if the page needs OG/Twitter tags, follow the pattern in any existing page's `<head>`.
3. Add the umbrella-bar block (copy it from any existing page) right after `<body>`.
4. Add the new route to `sitemap.xml` and to the umbrella nav / footer on every page that lists divisions.
