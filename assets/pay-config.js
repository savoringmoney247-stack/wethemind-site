/* We The Mind: payment settings for /pay/.
 * Fill these in AFTER you deploy pay-functions (see pay-functions/README.md).
 * Nothing here is secret: the Razorpay KEY ID (rzp_live_...) is safe to publish. NEVER put the Key SECRET here.
 */
window.WTM_PAY={
  keyId:"",            /* Razorpay Key ID, e.g. rzp_live_XXXXXXXXXXXX */
  orderEndpoint:"",    /* URL of the payOrder function (needed for international cards) */
  verifyEndpoint:"",   /* URL of the payVerify function (optional but recommended) */
  links:{}             /* optional: Razorpay Payment Link per plan id, e.g. {fi:"https://rzp.io/l/xxxx"} */
};
