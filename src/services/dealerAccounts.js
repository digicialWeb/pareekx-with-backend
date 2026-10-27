import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../firebase";

// Use a separate Firebase app so creating a dealer account never signs the admin out.
const DEALER_APP_NAME = "pareekx-dealer-account-creator";

export async function createDealerAuthAccount({ email, password, name, active = true }) {
  const app = getApps().find((item) => item.name === DEALER_APP_NAME)
    || initializeApp(firebaseConfig, DEALER_APP_NAME);
  const secondaryAuth = getAuth(app);
  const secondaryDb = getFirestore(app);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim().toLowerCase(),
      password,
    );
    const uid = credential.user.uid;

    await setDoc(doc(secondaryDb, "users", uid), {
      uid,
      name: name.trim(),
      email: credential.user.email,
      role: "DEALER",
      active: Boolean(active),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return uid;
  } finally {
    // This signs out only the secondary app; the admin's main session remains intact.
    if (secondaryAuth.currentUser) await signOut(secondaryAuth);
  }
}
