# Leafy 🌿 — Plant Care Tracker PWA

A beautiful, fully offline-capable **Plant Care Tracker** Progressive Web App with a rich emerald green organic aesthetic. Track your plants, watering schedules, health status, and care notes — all from your home screen.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🪴 Plant Library | Add unlimited plants with custom emoji, name, species & notes |
| 💧 Watering Tracker | Set per-plant watering frequency; animated progress bar |
| ❤️ Health Status | Track Thriving / Okay / Needs Help / Sick per plant |
| 📋 Watering Log | Full history log of every watering event |
| 📊 Stats Strip | Live counts — total plants, needing water, thriving |
| 🔍 Search | Instant search across plant names and species |
| 🔥 Streak Tracker | Daily watering streak counter for motivation |
| 🎉 Confetti | Celebratory confetti animation on watering & adding plants |
| 🍃 Floating Particles | Animated leaf particles in the background |
| 👆 Double-Tap to Water | Quick-water any plant with a double-tap on its card |
| 🔍 Smart Filters | Filter by All / Due / Thriving / Needs Help |
| 📳 Haptic Feedback | Vibration on watering confirmation |
| 🔔 Notifications | Push reminders when plants need watering |
| 📲 Installable PWA | Installs to home screen like a native app |
| 🔌 Fully Offline | Works 100% offline after first load |
| 💾 Persistent Data | All data saved in localStorage across sessions |
| 🌡 Mood Ring Cards | Cards glow based on plant health status |
| 📅 Schedule View | Weekly calendar overview of watering schedule |
| 💡 Plant Tips | Curated care tips and advice |

---

## 📁 File Structure

```
leafy/
├── index.html            ← Main app (single-file PWA)
├── manifest.json         ← Web App Manifest
├── sw.js                 ← Service Worker (cache-first, offline)
├── plant-icon-192.png    ← App icon 192×192
├── plant-icon-512.png    ← App icon 512×512
└── README.md             ← This file
```

---

## 🚀 How to Deploy on GitHub Pages

1. Create a new GitHub repository
2. Upload all 6 files to the **root** of the repo — no subfolders
3. Go to **Settings → Pages**
4. Under "Source", select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save** — your app will be live at `https://yourusername.github.io/repo-name/`

---

## 📲 Installing on Your Phone

### Android (Chrome)
1. Open your hosted URL in **Chrome**
2. An **install banner** appears — tap **📲 Install**
3. Or tap Chrome menu (⋮) → **"Add to Home Screen"**

### iOS (Safari)
1. Open in **Safari** (required)
2. Tap the **Share** icon at the bottom
3. Tap **"Add to Home Screen"** → **Add**

### Desktop (Chrome / Edge)
1. Open in Chrome or Edge
2. Click the **⊕ install icon** in the address bar
3. Click **Install**

---

## 🔧 PWA Compliance Checklist

- [x] `manifest.json` with `name`, `short_name`, `display: standalone`
- [x] `theme-color` meta tag
- [x] `apple-mobile-web-app-capable` meta tag
- [x] `apple-touch-icon` linked
- [x] Service Worker registered with cache-first strategy
- [x] Shell assets pre-cached on SW install
- [x] `beforeinstallprompt` captured and surfaced as in-app banner
- [x] 192×192 and 512×512 maskable icons
- [x] `start_url` and `scope` defined
- [x] Works fully offline
- [x] Responsive & mobile-first
- [x] Safe area insets (notch/dynamic island support)
- [x] App shortcuts in manifest

---

## 📜 License

MIT — free to use, modify, and distribute.
