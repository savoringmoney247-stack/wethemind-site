import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut as fbSignOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return fbSignOut(auth);
}

// Role comes from the ID token's custom claim, set server-side when the account
// is created — never trust a client-writable field for this.
export function currentRole() {
  return auth.currentUser
    ? auth.currentUser.getIdTokenResult().then(t => t.claims.role || null)
    : Promise.resolve(null);
}

// Call at the top of every dashboard page: redirects to login if signed out,
// or to the correct dashboard if signed in under the wrong role.
export function requireRole(expectedRole, onReady) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    const token = await user.getIdTokenResult(true);
    const role = token.claims.role || null;
    if (role !== expectedRole) {
      window.location.href = role ? "/" + role + "/" : "/";
      return;
    }
    onReady(user, role);
  });
}
