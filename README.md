# We the Mind — website

Everything you need to host the site is in this folder. **21 files** in total — read the "Host it on GitHub Pages" section below for exact steps.

## Every page is fully self-contained
Each `.html` file has its own CSS and JavaScript built directly into it — there is no separate `style.css` or `script.js`. Upload any single file on its own and it will look and work correctly, with nothing extra to remember. The tradeoff is repeated CSS inside each file rather than one shared file — intentional, for reliability.

## Complete file list

| File | What it is | In main nav? |
|---|---|---|
| `index.html` | **Home.** Short by design: hero, "What We Offer" (1:1 / Group / Problem-Solving), a Boards & Exams teaser block, a Study Squad teaser block, the free-session booking form, and a short 5-question FAQ | ✅ |
| `curriculum.html` | Full Boards & Exams detail — every board, test, and course | ✅ |
| `study-squad.html` | The 13 animal mentor mascots — full images, subjects, and puns | ✅ |
| `pricing.html` | All pricing: 1:1 / Group / Single Problem-Solving Session (tabs) + pricing FAQ | ✅ |
| `games.html` | Word Scramble + Quick Math Sprint | Resources ▾ |
| `grammar.html` | Fix My Grammar checker | Resources ▾ |
| `vocabulary.html` | Word of the Day (rotates daily, not a big word list) | Resources ▾ |
| `resources.html` | Worksheets & Course Plans preview | Resources ▾ |
| `sat-practice.html` | Links out to all 10 free SAT Math practice exams | Resources ▾ |
| `sat-math-exam-set-a.html` … `-j.html` (10 files) | The full practice exams themselves — each opens in a new tab | Linked from `sat-practice.html` only |
| `privacy.html` / `terms.html` | Legal templates (not legal advice — have a lawyer review before real payments) | Footer only |
| `Code.gs` | Backup copy of your Google Apps Script (already deployed — see below) |
| `README.md` | This file — not needed on the live site, just for your reference |

## What changed in this round

**Study Squad now has its own page.** It used to live inside `index.html`; it's now `study-squad.html`, linked from a bold clickable teaser block on the home page (same pattern as the Boards & Exams teaser). This alone shrank `index.html` from ~695KB to ~235KB — a much faster-loading home page, since most visitors don't need 13 character images just to book a free session.

**New animal artwork.** All 13 mascots now use the images you uploaded (Ollie, Felix, Ellie, Percy, Dara, Gigi, Waddles, Coco, Leo, Ruby, Theo, Polly, Bruno) instead of the earlier illustrations. Each was:
- Cropped tightly to remove the excess white margin around the character
- Had its white background converted to true transparency, with a soft edge rather than a hard cutout — so it blends into the card instead of looking like a pasted-on sticker
- Compressed to WebP format (~20–40KB each instead of 150KB+ as PNG) to keep the page light

**Puns are back.** Each Study Squad card again shows the mentor's name, subject specialty, and one-line joke underneath their photo (e.g. Ollie the Owl — Literature & History — *"Who's ready for Grade 9? Whooo, that's you."*) — restored exactly as they were before the images took their place.

**One identification caveat**: your zip file had 13 images numbered 1–13 with no names, so I matched each to its animal by visual inspection and color analysis. I'm confident in the matches, but it's worth a quick scroll through `study-squad.html` yourself to confirm each photo landed on the right character before you publish.

## Previously: SAT Practice Tests
Your 10 uploaded exam files came with a webcam "proctoring" feature (camera required, snapshots every 10 seconds, exam pauses if the camera cuts out). I removed it — this is a free public lead-gen tool, not a monitored exam, so requiring camera access only adds friction. The timer, adaptive difficulty, and scoring are untouched (verified no JavaScript errors after editing). Each exam now has a "We the Mind" brand bar up top and a results-screen message that adapts to the visitor's score, both linking to your booking form. Let me know if you'd ever want the camera feature restored for a future paid/monitored product.

## No inline text-links anywhere
Every link that used to sit inside a sentence has been replaced with an actual button or clickable card/block. The only `<a>` tags inside running text are in nav and footer link lists, which are meant to look like link lists.

---

## Host it on GitHub Pages — step by step

**If you don't have a GitHub account yet:**
1. Go to [github.com](https://github.com) and click **Sign up**. Create a free account.

**Create the repository:**
2. Once logged in, click the **+** icon (top-right) → **New repository**.
3. Name it anything, e.g. `wethemind-site`. Leave it set to **Public**. Don't check any of the "initialize with" boxes. Click **Create repository**.

**Upload the files:**
4. On the new (empty) repo page, click **uploading an existing file** (a blue link in the middle of the page).
5. Drag and drop **all 21 HTML files** from this folder into the upload box. (`Code.gs` and `README.md` don't need to go here — they're just for your reference.)
6. Scroll down and click **Commit changes**.

**Turn on GitHub Pages:**
7. In your repo, click the **Settings** tab (top menu).
8. In the left sidebar, click **Pages**.
9. Under "Build and deployment" → **Source**, select **Deploy from a branch**.
10. Under "Branch," select **main** and folder **/ (root)**, then click **Save**.
11. Wait about 1–2 minutes. Refresh the page — you'll see a message like "Your site is live at `https://<your-username>.github.io/wethemind-site/`". That's your public URL.

**Test it:**
12. Open that URL. Click through the nav — Boards & Exams, Study Squad, Pricing, the Resources dropdown, and the SAT Practice page. Try booking a test session and confirm a row appears in your Google Sheet (see below).

**If you want a custom domain later** (e.g. `wethemind.com` instead of the github.io address): buy the domain from any registrar, then in the same **Settings → Pages** screen, enter it under "Custom domain" — GitHub will show you the DNS records to add at your registrar.

## The Google Sheet is already connected
Your Apps Script URL is already wired into the booking form on `index.html`. If you ever redeploy the script and get a new URL, open `index.html`, search for `data-endpoint=`, and swap in the new URL.

## Still worth doing before you run ads
- **Social links**: the YouTube, Instagram, and LinkedIn icons in the footer currently point to `#`. Search each file for `target="_blank"` to find and replace them with your real profile URLs.
- **Resource files**: `resources.html` has "Preview (Coming Soon)" placeholder buttons — swap in real worksheet/course-plan links once you have them.
- **Ad tracking**: add your real GA4 / Google Ads / Meta Pixel snippets to each page's `<head>` if you want cross-page tracking.
- **Legal pages**: `privacy.html` and `terms.html` are templates, not legal advice — have a lawyer review before publishing or taking real payments.
