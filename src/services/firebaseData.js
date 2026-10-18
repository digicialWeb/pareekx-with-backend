import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const watchCollection = (name, onData, onError = console.error) =>
  onSnapshot(collection(db, name), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);

export const createRecord = async (name, data) => {
  const ref = await addDoc(collection(db, name), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
};

export const saveRecord = async (name, id, data) => {
  const ref = doc(db, name, String(id));
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const patchRecord = async (name, id, data) => updateDoc(doc(db, name, String(id)), { ...data, updatedAt: serverTimestamp() });
export const removeRecord = async (name, id) => deleteDoc(doc(db, name, String(id)));
