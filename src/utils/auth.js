import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ROLE_KEY = "userRole";
const USER_KEY = "user";
export const getToken = () => auth.currentUser?.getIdToken() || null;
export const getRole = () => localStorage.getItem(ROLE_KEY)?.toUpperCase() || null;
export const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; } };
// Firebase restores auth asynchronously on page reload; Firestore rules remain the security boundary.
export const isAuthenticated = () => Boolean(getRole());
export const setSession = (user, role) => {
  localStorage.setItem(ROLE_KEY, role.toUpperCase());
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role: role.toUpperCase() }));
};
export const logout = async () => {
  localStorage.removeItem(ROLE_KEY); localStorage.removeItem(USER_KEY);
  await signOut(auth);
};
export const getProfileForCurrentUser = async () => {
  const current = auth.currentUser;
  if (!current) throw new Error("Please sign in again.");
  const snap = await getDoc(doc(db, "users", current.uid));
  if (!snap.exists()) throw new Error("Your account profile is not configured. Ask the administrator to assign your role.");
  return { id: current.uid, uid: current.uid, ...snap.data(), email: current.email };
};

// Temporary compatibility helpers for legacy user-management screens.
// These do not create Firebase Authentication accounts; those screens still need migration.
export const getStoredUsers = () => [];
export const saveUser = () => { throw new Error("Local user creation is disabled. Create accounts with Firebase Authentication."); };
export const upsertUser = (user) => user;
