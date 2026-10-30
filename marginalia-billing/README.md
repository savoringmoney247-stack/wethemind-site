# Marginalia on computers: ads + "Remove ads" plans

Marginalia on computers is free with a slim ad bar at the bottom. People can remove the ads with a
**Lifetime** plan (one payment) or a **Monthly** plan (auto-renewing). They sign in with Google, so a
plan works on every computer. The Play Store app is untouched: Google Play keeps handling its own
ads and plans, and none of this ever shows inside it.

Everything is built but **switched off** (`enabled: false` in `tools/marginalia/index.html`).
Nothing changes on the live site until the steps below are done.

| Piece | Where |
|---|---|
| Ad bar, "Remove ads" button, plans screen, Google sign-in | `tools/marginalia/plans.js` |
| On/off switch, prices, ad unit | `window.MARGINALIA_PAY` in `tools/marginalia/index.html` |
| Payment checks, renewals, cancellations | `marginalia-billing/functions/index.js` (Firebase Cloud Functions) |
| Who may read a plan | `marginalia-billing/firestore-rules-snippet.txt` |
| AdSense site check | `/ads.txt` |

---

## Your setup checklist

### 1. Prices
Send me your Play Store prices (lifetime and monthly) so the computer plans match.

### 2. Razorpay
1. Sign up at <https://dashboard.razorpay.com> and finish KYC (business details, bank account).
2. **Subscriptions > Plans > Create plan**: monthly, your monthly price. Copy the plan id (`plan_...`).
3. **Settings > API Keys > Generate key**: you get a **Key ID** (`rzp_live_...`, fine to share) and a
   **Key Secret** (keep private, never send it to anyone, including me).
4. Tip: do a first run with **Test mode** keys, then repeat with Live keys.

### 3. Firebase (project `we-the-mind-portal`, the one your portal already uses)
1. Console > **Upgrade** to the **Blaze** (pay-as-you-go) plan. Cloud Functions need it; the free
   monthly allowance covers a small app. Set a budget alert (e.g. Rs 500) under Billing.
2. **Authentication > Sign-in method**: enable **Google**.
   **Authentication > Settings > Authorized domains**: make sure `wethemind.com` is listed.
3. **Firestore Database > Rules**: add the two blocks from `firestore-rules-snippet.txt` next to the
   portal's rules (don't replace them), then **Publish**.

### 4. Put the server functions live (one time, on your computer)
```
npm install -g firebase-tools
firebase login
cd D:\wethemind-site\marginalia-billing\functions
copy .env.example .env
```
Edit `.env`: your Razorpay **Key ID**, lifetime price in paise (Rs 499 = `49900`) and the monthly
**plan id**. Then add the two secrets yourself (you paste them when asked; they're stored in Google
Secret Manager, never in the repo):
```
npm install
cd ..
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET
firebase deploy --only functions:marginalia-billing
```
For the webhook secret, make up a long random password; you'll paste the same one into Razorpay next.

### 5. Razorpay webhook (renewals and cancellations)
Razorpay **Settings > Webhooks > Add new webhook**
- URL: `https://asia-south1-we-the-mind-portal.cloudfunctions.net/razorpayWebhook`
- Secret: the webhook secret from step 4
- Events: `payment.captured`, `subscription.activated`, `subscription.charged`,
  `subscription.resumed`, `subscription.cancelled`, `subscription.completed`,
  `subscription.halted`, `subscription.paused`

### 6. AdSense
1. <https://adsense.google.com> (same account as your AdMob, `pub-3784163501998631`):
   **Sites > Add site** `wethemind.com` and request review. `/ads.txt` is already in place.
2. Once approved: **Ads > By ad unit > Display ads**, name it "Marginalia bar", copy its **slot id**
   (a number like `1234567890`).
3. **Privacy & messaging**: turn on the consent message for European visitors (Google requires it).

### 7. Switch on
Send me the **ad slot id** and confirm steps 2-5 are done. I'll then:
- fill in `MARGINALIA_PAY` (prices, ad slot) and set `enabled: true`,
- update the Marginalia privacy policy (Google sign-in, Razorpay payments, AdSense ads; and the
  Play app's ads, which Google Play also requires you to disclose),
- test a real payment end to end, and push it live.

### Step two (after it's live): count Play Store purchases on computers
People who already paid in the Play Store app will get ad-free Marginalia on computers when they
sign in with the same Google account. This needs a Google Play Developer API service account
linked to Firebase; I'll walk you through it then.
