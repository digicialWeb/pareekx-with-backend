import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { firebaseConfig } from "../firebase";

// Create salesperson credentials in a secondary Firebase app so the admin stays signed in.
const SALESPERSON_APP_NAME = "pareekx-salesperson-account-creator";

export async function createSalespersonAuthAccount({ email, password, name, active = true }) {
  const app = getApps().find((item) => item.name === SALESPERSON_APP_NAME)
    || initializeApp(firebaseConfig, SALESPERSON_APP_NAME);
  const secondaryAuth = getAuth(app);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim().toLowerCase(),
      password,
    );
    const uid = credential.user.uid;
    return uid;
  } finally {
    if (secondaryAuth.currentUser) await signOut(secondaryAuth);
  }
}
