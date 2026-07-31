# Kharcha — Daily Earnings & Expense Tracker

> *Kharcha (खर्चा) — Hindi/Urdu for "expenditure"*

A beautiful, offline-first **Progressive Web App** for tracking daily earnings and expenses. Zero dependencies, no backend, no signup — everything lives on your device.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💸 **Earnings Tracker** | Log income with categories (Salary, Freelance, Business, etc.) |
| 🧾 **Expense Tracker** | Record expenses with categories (Food, Transport, Rent, etc.) |
| 📅 **Day-by-Day Navigation** | Browse past days with ← → arrows or date picker |
| 📊 **Daily Summary** | Live balance, earn vs. spend bar, at-a-glance totals |
| 📆 **Monthly History** | Aggregated view of monthly income, spending, and net balance |
| 📱 **PWA Installable** | Add to Home Screen on Android/iOS; works offline |
| 🔒 **100% Private** | All data stored locally via `localStorage` — never leaves your device |
| ⌨️ **Keyboard Support** | Press Enter to quickly submit a transaction |

---

## 📁 File Structure

```
kharcha/
├── index.html       ← Main application (single-file SPA)
├── manifest.json    ← PWA manifest (name, icons, display mode)
├── sw.js            ← Service Worker (offline caching strategy)
├── icon-192.png     ← App icon 192×192 (required by PWA spec)
├── icon-512.png     ← App icon 512×512 (required by PWA spec)
└── README.md        ← This file
```

---

## 🚀 Getting Started

### Option 1 — Open Directly
Double-click `index.html` in your browser. The app works fully without a server, except PWA install features require HTTPS.

### Option 2 — Local Dev Server
```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# Then open: http://localhost:8080
```

### Option 3 — Deploy (for Install / Offline)
Upload all files to any static host that supports HTTPS:
- **GitHub Pages** — push to a repo, enable Pages
- **Netlify** — drag and drop the folder
- **Vercel** — `vercel --prod`
- **Firebase Hosting** — `firebase deploy`

Once on HTTPS, Chrome/Android will show an **"Add to Home Screen"** banner automatically.

---

## 📲 Installing as a PWA

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the banner **"Add Kharcha to Home Screen"** — or tap ⋮ → *Add to Home Screen*
3. Tap **Add**

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (□↑)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**

### Desktop (Chrome / Edge)
1. Look for the install icon (⊕) in the address bar
2. Click **Install**

---

## 🗃️ Data Storage

All data is stored in `localStorage` under the key `kharcha_v1`.

**Data format:**
```json
{
  "2025-04-05": {
    "earn": [
      { "id": 1712345678, "desc": "Freelance project", "amt": 5000, "cat": "🧑‍💻 Freelance", "time": "10:30 AM" }
    ],
    "spend": [
      { "id": 1712345999, "desc": "Lunch", "amt": 120, "cat": "🍜 Food & Dining", "time": "01:15 PM" }
    ]
  }
}
```

### Backing Up Your Data
Open your browser's Developer Tools → Application → Local Storage → copy the value of `kharcha_v1`.

---

## ⚙️ Service Worker Caching

`sw.js` uses a **cache-first** strategy for all local assets and **stale-while-revalidate** for Google Fonts:

| Request Type | Strategy |
|---|---|
| App shell (HTML, JS, CSS) | Cache-first, update on next load |
| Icons & manifest | Cache-first |
| Google Fonts | Stale-while-revalidate |
| Navigation (offline) | Fallback to cached `index.html` |

To force-refresh the cache, bump `CACHE_NAME` in `sw.js` (e.g., `kharcha-v1.0.1`).

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0f0f14` | Page background |
| `--surface` | `#16161e` | Cards, inputs |
| `--earn` | `#3dffa0` | Earnings, positive balance |
| `--spend` | `#ff6b6b` | Expenses, negative balance |
| `--accent` | `#c9a96e` | Brand gold, logo, history |
| Font — Display | DM Serif Display | Logo, month headings |
| Font — Mono | DM Mono | Amounts, dates, labels |
| Font — Body | DM Sans | Descriptions, buttons |

---

## 🛠️ Customization

**Change currency symbol:** Search for `₹` in `index.html` and replace with `$`, `€`, etc.

**Add categories:** Edit the `<option>` lists inside `#earnCat` and `#spendCat` in `index.html`.

**Change color theme:** Update the CSS variables in `:root` at the top of `index.html`.

---

## 🔮 Roadmap Ideas

- [ ] Export to CSV / PDF
- [ ] Recurring transactions
- [ ] Budget goals per category
- [ ] Charts (pie / bar) for spending breakdown
- [ ] Cloud sync (Firebase / Supabase)
- [ ] Multi-currency support
- [ ] Widgets (Android 12+)

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built with ♥ and vanilla JS — no frameworks harmed.*
