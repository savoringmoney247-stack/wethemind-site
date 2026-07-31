# 🎌 Nihongo N5 — JLPT Japanese Learning PWA

A complete, fully offline-capable **Progressive Web App** for mastering JLPT N5 Japanese. Flashcards, quizzes, kanji, grammar, kana charts, sentence builder — all in a single installable file.

---

## 📦 Files in this package

| File | Purpose |
|---|---|
| `index.html` | Entire app — HTML, CSS & JS in one self-contained file |
| `manifest.json` | PWA manifest — name, icons, display, shortcuts, theme |
| `service-worker.js` | Offline caching, update detection, push & sync stubs |
| `icon-192.png` | App icon for home screen / launcher (192 × 192 px) |
| `icon-512.png` | Splash-screen / install icon (512 × 512 px) |
| `README.md` | This file |

---

## 🚀 Getting started

### Requirement: serve over HTTP(S)

Service workers **will not register** over `file://`. Use any local server:

```bash
# Python 3 (built-in)
python3 -m http.server 8080

# Node.js (npx, no install required)
npx serve .

# VS Code — install "Live Server" extension → click "Go Live"
```

Then open **http://localhost:8080** in Chrome, Edge, or Safari.

### Deploy to production (HTTPS required for install)

| Host | Free tier | One-command deploy |
|---|---|---|
| [Netlify](https://netlify.com) | ✅ | Drag-and-drop the folder |
| [Vercel](https://vercel.com) | ✅ | `npx vercel --prod` |
| [GitHub Pages](https://pages.github.com) | ✅ | Push to `gh-pages` branch |
| [Cloudflare Pages](https://pages.cloudflare.com) | ✅ | Connect Git repo |

---

## 📱 Installing the app

### Android · Chrome / Edge
1. Open the app URL in the browser.
2. An **⬇ Install App** button appears in the top navigation bar.
3. Tap it and confirm — the app lands on your home screen.

### iOS · Safari
1. Open the app URL in Safari (must be Safari, not Chrome on iOS).
2. Tap the **⬇ Install App** button (or wait 3 s for the bottom-sheet to appear).
3. Follow the three-step guide: **Share → Add to Home Screen → Add**.

### Desktop · Chrome / Edge
1. Look for the install icon (⊕) in the browser address bar, **or**
2. Tap **⬇ Install App** in the nav bar.

---

## ⚡ PWA features

### Caching strategy (service-worker.js)

| Asset type | Strategy | Cache bucket |
|---|---|---|
| App shell — HTML, manifest, icons | **Cache-First** | `nihongo-n5-v2-shell` |
| Google Fonts (gstatic / googleapis) | **Stale-While-Revalidate** | `nihongo-n5-v2-fonts` |
| Everything else | **Network-First w/ fallback** | `nihongo-n5-v2-dynamic` |

After the first load the app works **100% offline** — no connectivity needed.

### Automatic update flow
When a new service worker version is deployed:
1. The browser detects the changed `service-worker.js`.
2. A teal banner appears: **"A new version is ready! → Update now"**.
3. Clicking it sends `SKIP_WAITING` to the waiting worker; the page reloads automatically with the new version.
4. Old caches are cleaned up on activation.

### Manifest shortcuts (long-press on Android home screen)
| Shortcut | Deep-link |
|---|---|
| Vocabulary Flashcards | `?start=vocab` |
| Practice Quiz | `?start=quiz` |
| Kanji Grid | `?start=kanji` |

### Push notifications (stub — ready to enable)
`service-worker.js` includes complete `push` and `notificationclick` handlers. Wire them to your backend by sending a Web Push payload with `{ title, body, url }`.

### Background sync (stub)
A `sync` event handler tagged `sync-study-progress` is ready; extend it to POST progress data to a server when connectivity returns.

---

## 🎓 App modules

| Module | Description |
|---|---|
| **Vocabulary Flashcards** | 20 N5 vocab cards, flip animation, spaced-repetition buttons (Hard / Got It / Skip) |
| **🔊 Pronunciation** | Web Speech API reads any Japanese word or kana character aloud |
| **Kanji 103** | All 103 N5 kanji — on/kun readings, stroke count, mastery tracking, category filter |
| **Practice Quiz** | Vocabulary · Kanji Reading · Grammar · Listening (4 modes, JLPT style) |
| **Grammar Guide** | 40+ accordion grammar patterns with romaji, examples and English translation |
| **Kana Charts** | Full hiragana & katakana grids — tap to hear each character |
| **Sentence Builder** | Word-bank drag-and-drop for correct word-order practice |
| **Progress Dashboard** | Cards seen, correct answers, kanji mastered, day streak 🔥, per-module progress bars |
| **Lead-gen form** | Email capture (stores to `localStorage`; swap in Mailchimp / ConvertKit endpoint) |

---

## 🗂 Project structure

```
nihongo-n5/
├── index.html          ← entire app (self-contained)
├── manifest.json       ← PWA manifest
├── service-worker.js   ← offline + update logic
├── icon-192.png        ← home-screen icon
├── icon-512.png        ← splash / install icon
└── README.md           ← you are here
```

---

## 🛠 Customisation

### Bumping the cache version (required on every deploy)
Open `service-worker.js` and increment the version string:

```js
const CACHE_VERSION = 'nihongo-n5-v3'; // ← bump here
```

This busts all caches and forces every installed client to download fresh assets.

### Adding vocabulary cards
Edit the `vocabCards` array inside the `<script>` block in `index.html`:

```js
{
  jp:      'ありがとう',
  kana:    'arigatou',
  romaji:  'arigatou',
  meaning: 'Thank you',
  example: 'ありがとうございます。\nArigatou gozaimasu. — Thank you very much.'
}
```

### Adding kanji
Extend the `kanjiData` array:

```js
{
  char:    '山',
  on:      'サン',
  kun:     'やま',
  meaning: 'mountain',
  strokes: 3,
  cat:     'nature'
}
```

### Connecting the lead-gen form to a real email service
Find `submitLead()` in the script and replace the `localStorage` stub with a `fetch()` POST to Mailchimp, ConvertKit, Brevo, etc.

### Theme colours
All design tokens are CSS custom properties in `:root`:

```css
--red:   #C0392B;   /* primary accent */
--gold:  #c49a2a;   /* secondary accent */
--teal:  #1a8a80;   /* correct / success */
--paper: #fdf6ec;   /* page background */
--ink:   #1a1008;   /* primary text */
```

---

## 🔒 Privacy

All study data (progress, streak, saved leads) lives in **`localStorage`** on the user's own device. Nothing is sent to any server unless you wire up the lead-gen form endpoint yourself.

---

## 📄 Licence

MIT — free to use, adapt and redistribute.
