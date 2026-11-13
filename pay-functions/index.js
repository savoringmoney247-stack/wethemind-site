/* We The Mind: tutoring payments on Razorpay, as Firebase Cloud Functions (v2).
 * The website never sees a secret. These functions:
 *   payOrder   - the page asks for a payment; the price is worked out HERE (never trusted from the browser)
 *   payVerify  - checks Razorpay's signature right after checkout and records the payment
 *   payWebhook - Razorpay tells us a payment was captured (the reliable record, even if the buyer closes the tab)
 * Payments are written to Firestore collection "payments".
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Razorpay = require("razorpay");

admin.initializeApp();
const db = admin.firestore();
const KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

/* Prices in US dollars. Group prices are per student. Keep in step with /pay/index.html and the pricing page. */
const PLANS = {
  fl: { t: "Fledgling, 10 sessions", usd: 150 }, fi: { t: "Flight, 25 sessions", usd: 300 }, pa: { t: "Parliament, 50 sessions", usd: 450 },
  g24: { t: "Small group, 10 sessions", usd: 100, pp: true }, g57: { t: "Standard group, 10 sessions", usd: 70, pp: true }, g810: { t: "Full group, 10 sessions", usd: 50, pp: true },
  s1: { t: "1-to-1 session", usd: 18 }, ps: { t: "Problem-solving session", usd: 20 },
};
const RATE = { USD: 1, GBP: 0.79, EUR: 0.92, AUD: 1.52, CAD: 1.36, SGD: 1.34, AED: 3.67, INR: 83 };
const conv = (u, c) => { if (c === "USD") return u; const n = u * RATE[c]; return n >= 1000 ? 10 * Math.round(n / 10) : n >= 100 ? 5 * Math.round(n / 5) : n >= 20 ? Math.round(n) : Math.round(2 * n) / 2; };

const ALLOWED = ["https://wethemind.com", "https://www.wethemind.com", "http://localhost:8767"];
function cors(req, res) {
  const o = req.get("origin");
  if (ALLOWED.includes(o)) { res.set("Access-Control-Allow-Origin", o); res.set("Vary", "Origin"); }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS"); res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).send(""); return true; }
  return false;
}
const hmac = (secret, s) => crypto.createHmac("sha256", secret).update(s).digest("hex");
const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);

exports.payOrder = onRequest({ secrets: [KEY_ID, KEY_SECRET], region: "asia-south1", maxInstances: 5 }, async (req, res) => {
  if (cors(req, res)) return;
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const d = req.body || {}, plan = PLANS[d.plan], cur = d.currency;
    if (!plan || !RATE[cur]) return res.status(400).json({ error: "Unknown plan or currency." });
    const qty = plan.pp ? Math.min(10, Math.max(1, parseInt(d.qty, 10) || 1)) : 1;
    const email = clean(d.email, 120), name = clean(d.name, 80);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || name.length < 2) return res.status(400).json({ error: "Name and email needed." });
    const amount = Math.round(conv(plan.usd, cur) * qty * 100);
    const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() });
    const order = await rz.orders.create({
      amount, currency: cur, receipt: ("wtm_" + Date.now()).slice(0, 40),
      notes: { plan: d.plan, qty: String(qty), student: name, email, phone: clean(d.phone, 30), details: clean(d.notes, 200) },
    });
    await db.collection("payments").doc(order.id).set({
      orderId: order.id, plan: d.plan, planName: plan.t, qty, amount, currency: cur, student: name, email,
      phone: clean(d.phone, 30), details: clean(d.notes, 300), status: "created", createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ keyId: KEY_ID.value(), orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e) { console.error(e); res.status(500).json({ error: "Could not start the payment." }); }
});

exports.payVerify = onRequest({ secrets: [KEY_SECRET], region: "asia-south1", maxInstances: 5 }, async (req, res) => {
  if (cors(req, res)) return;
  try {
    const d = req.body || {};
    if (!d.razorpay_order_id || !d.razorpay_payment_id || !d.razorpay_signature) return res.status(400).json({ error: "Missing details." });
    if (!same(hmac(KEY_SECRET.value(), d.razorpay_order_id + "|" + d.razorpay_payment_id), String(d.razorpay_signature))) return res.status(403).json({ error: "Could not verify." });
    await db.collection("payments").doc(d.razorpay_order_id).set({ paymentId: d.razorpay_payment_id, status: "paid", verified: true, paidAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Error." }); }
});

/* In the Razorpay dashboard: Settings > Webhooks > add this function's URL, event "payment.captured" (and "payment.failed"), with the same secret. */
exports.payWebhook = onRequest({ secrets: [WEBHOOK_SECRET], region: "asia-south1", maxInstances: 5 }, async (req, res) => {
  try {
    const sig = req.get("x-razorpay-signature") || "";
    if (!same(hmac(WEBHOOK_SECRET.value(), req.rawBody.toString("utf8")), sig)) return res.status(403).send("bad signature");
    const ev = req.body.event, p = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;
    if (p && p.order_id) {
      await db.collection("payments").doc(p.order_id).set(
        ev === "payment.captured" ? { paymentId: p.id, status: "paid", method: p.method || null, paidAt: admin.firestore.FieldValue.serverTimestamp() }
          : { paymentId: p.id, status: "failed", failure: (p.error_description || "").slice(0, 200) }, { merge: true });
    }
    res.send("ok");
  } catch (e) { console.error(e); res.status(500).send("error"); }
});
