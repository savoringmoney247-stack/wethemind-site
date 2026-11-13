# We The Mind payments (Razorpay) - setup

The page /pay/ works as soon as these three functions are deployed and `assets/pay-config.js` is filled in.
Do NOT commit your Key Secret anywhere. It lives only in Firebase secrets.

1. In the Razorpay dashboard (Live mode): Settings > International payments > turn it on (needed for cards from abroad).
2. Same place, API Keys: copy the Key ID. Keep the Key Secret private.
3. In a terminal, inside the folder that holds this README's parent `firebase.json` project (Blaze plan needed):
   firebase functions:secrets:set RAZORPAY_KEY_ID
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET     (make up any long random text)
   firebase deploy --only functions:payOrder,functions:payVerify,functions:payWebhook
4. The deploy prints three URLs. Put payOrder's URL in `orderEndpoint` and payVerify's URL in `verifyEndpoint`
   in assets/pay-config.js, and your Key ID in `keyId`.
5. Razorpay dashboard > Settings > Webhooks > Add: the payWebhook URL, same secret as step 3, events payment.captured and payment.failed.
6. Edit ALLOWED in index.js if your site address is not wethemind.com.
7. Test with one real small payment (for example the 1-to-1 session) from a friend's card, then refund it in the dashboard.

Paid orders appear in Firestore > payments. Razorpay also emails the buyer a receipt and you a notification.
