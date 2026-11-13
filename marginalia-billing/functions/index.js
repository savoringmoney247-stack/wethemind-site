/* Marginalia - "Remove ads" plans for computers (Razorpay), on Firebase Cloud Functions.
 *
 * The website never sees a secret: it asks these functions to start a payment, Razorpay's own
 * checkout takes the money, and these functions check Razorpay's signature before recording the
 * plan in Firestore at entitlements/{uid}. Users can only read their own entitlement (see
 * firestore-rules-snippet.txt); nothing on the website can write one.
 *
 *   entitlements/{uid} = {
 *     plan: "lifetime" | "monthly",
 *     active: true,
 *     until: Timestamp | null,          // null = lifetime; otherwise end of the paid period
 *     status: "active" | "cancelled" | "halted",
 *     source: "razorpay" | "play",
 *     updatedAt: Timestamp
 *   }
 *
 * Settings (see README.md):
 *   secrets  RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET   (firebase functions:secrets:set ...)
 *   params   RAZORPAY_KEY_ID, LIFETIME_PRICE_PAISE, RAZORPAY_MONTHLY_PLAN_ID   (functions/.env)
 */
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Razorpay = require("razorpay");

admin.initializeApp();
const db = admin.firestore();

const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID");
const LIFETIME_PRICE_PAISE = defineString("LIFETIME_PRICE_PAISE");          // e.g. 49900 = Rs 499
const RAZORPAY_MONTHLY_PLAN_ID = defineString("RAZORPAY_MONTHLY_PLAN_ID");  // legacy single monthly plan
/* Three subscription levels, each a monthly Razorpay plan (plan_XXXX from the dashboard). */
const TIER_PLAN_IDS = {
  ember: defineString("RAZORPAY_PLAN_EMBER"),
  beacon: defineString("RAZORPAY_PLAN_BEACON"),
  aurora: defineString("RAZORPAY_PLAN_AURORA"),
};
const TIER_LEVEL = { ember: 1, beacon: 2, aurora: 3 };
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

const REGION = "asia-south1";
const CORS = ["https://wethemind.com", "https://www.wethemind.com", /^http:\/\/localhost(:\d+)?$/];
const GRACE_MS = 2 * 24 * 3600 * 1000;   // a couple of days' slack for late renewals
const UPGRADE_PRICE_PAISE = 49900;        // custom upgrades: Rs 499 each, paid only after the owner approves a request
const OWNER_EMAIL = "king.kngr47@gmail.com";

const rzp = () => new Razorpay({ key_id: RAZORPAY_KEY_ID.value(), key_secret: RAZORPAY_KEY_SECRET.value() });
const hmac = (secret, text) => crypto.createHmac("sha256", secret).update(text).digest("hex");
const sameSig = (a, b) => {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const ts = (ms) => admin.firestore.Timestamp.fromMillis(ms);

async function grantLifetime(uid, ref) {
  await db.doc(`entitlements/${uid}`).set({
    plan: "lifetime", tier: 3, active: true, until: null, status: "active", source: "razorpay", ref: ref || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function markUpgradePaid(offerId, paymentId) {
  if (!offerId) return;
  await db.doc(`upgradeOffers/${offerId}`).set({ status: "paid", paymentId: paymentId || null, paidAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

async function grantMonthly(uid, sub, status) {
  const ent = await db.doc(`entitlements/${uid}`).get();
  if (ent.exists && ent.data().plan === "lifetime") return;          // never downgrade a lifetime plan
  const tierName = sub.notes && sub.notes.plan;
  const tier = TIER_LEVEL[tierName] || 1;
  const old = ent.exists ? ent.data() : null;
  if (old && old.plan === "monthly" && old.ref && old.ref !== sub.id && status !== "active") return;   // an old subscription ending after a level change
  if (old && old.plan === "monthly" && old.ref && old.ref !== sub.id && status === "active") {
    try { await rzp().subscriptions.cancel(old.ref, false); } catch (e) { console.warn("old subscription not cancelled", e.message); }   // moving up (or down) a level: stop the old one
  }
  const endMs = (sub.current_end ? sub.current_end * 1000 : (sub.start_at ? sub.start_at * 1000 : Date.now() + 31 * 24 * 3600 * 1000)) + GRACE_MS;
  await db.doc(`entitlements/${uid}`).set({
    plan: "monthly", tier, tierName: tierName || "ember", active: status !== "halted", until: ts(endMs), status: status || "active",
    source: "razorpay", ref: sub.id, trialUsed: true, updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/* 1. Start a payment. Signed-in users only. Returns what Razorpay Checkout needs. */
exports.createCheckout = onCall({ region: REGION, cors: CORS, secrets: [RAZORPAY_KEY_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const uid = req.auth.uid, plan = req.data && req.data.plan;
  if (plan !== "lifetime" && plan !== "monthly" && plan !== "upgrade" && !TIER_LEVEL[plan]) throw new HttpsError("invalid-argument", "Unknown plan.");

  if (plan === "upgrade") {   // a custom upgrade the owner has approved for this user
    const offerId = String((req.data && req.data.offerId) || "");
    if (!offerId) throw new HttpsError("invalid-argument", "Missing upgrade.");
    const offer = await db.doc(`upgradeOffers/${offerId}`).get();
    if (!offer.exists || offer.data().uid !== uid || offer.data().status !== "offered") throw new HttpsError("failed-precondition", "That upgrade is not available to pay.");
    const amount = parseInt(offer.data().amountPaise, 10) || UPGRADE_PRICE_PAISE;
    const order = await rzp().orders.create({
      amount, currency: "INR", receipt: `mgu_${uid.slice(0, 18)}_${Date.now()}`.slice(0, 40), notes: { uid, plan: "upgrade", offerId },
    });
    await db.doc(`payments/${order.id}`).set({ uid, plan: "upgrade", offerId, kind: "order", status: "created", createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return { keyId: RAZORPAY_KEY_ID.value(), orderId: order.id, amount: order.amount, currency: order.currency };
  }

  if (plan === "lifetime") {
    const amount = parseInt(LIFETIME_PRICE_PAISE.value(), 10);
    if (!(amount > 0)) throw new HttpsError("failed-precondition", "Lifetime price is not set.");
    const order = await rzp().orders.create({
      amount, currency: "INR", receipt: `mg_${uid.slice(0, 20)}_${Date.now()}`.slice(0, 40), notes: { uid, plan },
    });
    await db.doc(`payments/${order.id}`).set({ uid, plan, kind: "order", status: "created", createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return { keyId: RAZORPAY_KEY_ID.value(), orderId: order.id, amount: order.amount, currency: order.currency };
  }

  const planId = TIER_LEVEL[plan] ? TIER_PLAN_IDS[plan].value() : RAZORPAY_MONTHLY_PLAN_ID.value();
  if (!planId) throw new HttpsError("failed-precondition", "That plan is not set up yet.");
  const prior = await db.doc(`entitlements/${uid}`).get();
  const trial = !(prior.exists && prior.data().trialUsed);   // one 7-day free trial per account
  const subReq = { plan_id: planId, total_count: 120, customer_notify: 1, notes: { uid, plan } };
  if (trial) subReq.start_at = Math.floor(Date.now() / 1000) + 7 * 24 * 3600 + 600;   // first charge happens after the trial
  const sub = await rzp().subscriptions.create(subReq);
  await db.doc(`payments/${sub.id}`).set({ uid, plan, kind: "subscription", status: "created", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { keyId: RAZORPAY_KEY_ID.value(), subscriptionId: sub.id, trial };
});

/* 2. Confirm a payment right after checkout (checks Razorpay's signature), so ads go away at once. */
exports.confirmPayment = onCall({ region: REGION, cors: CORS, secrets: [RAZORPAY_KEY_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const uid = req.auth.uid, d = req.data || {};
  const secret = RAZORPAY_KEY_SECRET.value();
  const id = d.razorpay_order_id || d.razorpay_subscription_id;
  if (!id || !d.razorpay_payment_id || !d.razorpay_signature) throw new HttpsError("invalid-argument", "Missing payment details.");

  const pay = await db.doc(`payments/${id}`).get();
  if (!pay.exists || pay.data().uid !== uid) throw new HttpsError("permission-denied", "This payment isn't yours.");

  const expected = d.razorpay_order_id
    ? hmac(secret, `${d.razorpay_order_id}|${d.razorpay_payment_id}`)
    : hmac(secret, `${d.razorpay_payment_id}|${d.razorpay_subscription_id}`);
  if (!sameSig(expected, d.razorpay_signature)) throw new HttpsError("permission-denied", "Payment could not be verified.");

  await pay.ref.update({ status: "paid", paymentId: d.razorpay_payment_id, paidAt: admin.firestore.FieldValue.serverTimestamp() });
  if (pay.data().plan === "upgrade") await markUpgradePaid(pay.data().offerId, d.razorpay_payment_id);
  else if (pay.data().plan === "lifetime") await grantLifetime(uid, d.razorpay_payment_id);
  else await grantMonthly(uid, await rzp().subscriptions.fetch(d.razorpay_subscription_id), "active");
  return { ok: true };
});

/* 2b. Custom upgrades. The owner approves a request (createUpgradeOffer); the user then sees it and pays (createCheckout with plan "upgrade"). */
exports.createUpgradeOffer = onCall({ region: REGION, cors: CORS }, async (req) => {
  if (!req.auth || String(req.auth.token.email || "").toLowerCase() !== OWNER_EMAIL) throw new HttpsError("permission-denied", "Owner only.");
  const email = String((req.data && req.data.email) || "").trim().toLowerCase();
  const title = String((req.data && req.data.title) || "").trim().slice(0, 200);
  if (!email || !title) throw new HttpsError("invalid-argument", "Email and a short title are needed.");
  let user;
  try { user = await admin.auth().getUserByEmail(email); }
  catch (e) { throw new HttpsError("not-found", "That person has not signed in to Manaluz yet."); }
  const ref = db.collection("upgradeOffers").doc();
  await ref.set({ uid: user.uid, email, title, amountPaise: UPGRADE_PRICE_PAISE, status: "offered", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true, id: ref.id };
});

exports.listUpgradeOffers = onCall({ region: REGION, cors: CORS }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const q = await db.collection("upgradeOffers").where("uid", "==", req.auth.uid).get();
  const offers = q.docs.map((x) => ({ id: x.id, title: x.data().title, amountPaise: x.data().amountPaise || UPGRADE_PRICE_PAISE, status: x.data().status }))
    .filter((o) => o.status === "offered" || o.status === "paid");
  return { offers };
});

/* 3. Cancel a monthly plan (it stays ad-free until the end of the paid month). */
exports.cancelMonthly = onCall({ region: REGION, cors: CORS, secrets: [RAZORPAY_KEY_SECRET] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const ent = await db.doc(`entitlements/${req.auth.uid}`).get();
  if (!ent.exists || ent.data().plan !== "monthly" || !ent.data().ref) throw new HttpsError("failed-precondition", "No monthly plan to cancel.");
  try { await rzp().subscriptions.cancel(ent.data().ref, true); }   // true = at the end of the current period
  catch (e) { await rzp().subscriptions.cancel(ent.data().ref, false); }   // still in the free trial: nothing has been charged, cancel straight away
  await ent.ref.update({ status: "cancelled", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { ok: true };
});

/* 4. Razorpay webhook: renewals, cancellations and a backup for missed confirmations.
 *    In the Razorpay dashboard: Settings > Webhooks > add
 *    https://asia-south1-<project>.cloudfunctions.net/razorpayWebhook  with the events below. */
exports.razorpayWebhook = onRequest({ region: REGION, secrets: [RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET] }, async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("POST only"); return; }
  const sig = req.get("X-Razorpay-Signature");
  if (!sameSig(hmac(RAZORPAY_WEBHOOK_SECRET.value(), req.rawBody), sig)) { res.status(400).send("bad signature"); return; }

  const ev = req.body || {}, p = ev.payload || {};
  try {
    const sub = p.subscription && p.subscription.entity;
    const pay = p.payment && p.payment.entity;
    if (sub && sub.notes && sub.notes.uid) {
      const uid = sub.notes.uid;
      if (ev.event === "subscription.authenticated" || ev.event === "subscription.activated" || ev.event === "subscription.charged" || ev.event === "subscription.resumed") await grantMonthly(uid, sub, "active");
      else if (ev.event === "subscription.cancelled" || ev.event === "subscription.completed") await grantMonthly(uid, sub, "cancelled");
      else if (ev.event === "subscription.halted" || ev.event === "subscription.paused") await grantMonthly(uid, sub, "halted");
    } else if (pay && ev.event === "payment.captured" && pay.notes && pay.notes.uid && pay.notes.plan === "lifetime") {
      await grantLifetime(pay.notes.uid, pay.id);
    } else if (pay && ev.event === "payment.captured" && pay.notes && pay.notes.uid && pay.notes.plan === "upgrade") {
      await markUpgradePaid(pay.notes.offerId, pay.id);
    }
    res.status(200).send("ok");
  } catch (e) {
    console.error("webhook failed", e);
    res.status(500).send("error");   // Razorpay retries
  }
});
