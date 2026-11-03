import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

function withTimeout<T>(promise: Promise<T>, message: string, ms = 12000) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export async function registerAccount(input: {name: string; company: string; email: string; password: string; role: "buyer" | "supplier"}) {
  if (!isFirebaseConfigured || !auth || !db) throw new Error("Firebase belum dikonfigurasi. Periksa file .env.local.");
  const credential = await withTimeout(
    createUserWithEmailAndPassword(auth, input.email, input.password),
    "Koneksi Firebase terlalu lama. Pastikan Authentication Email/Password dan Firestore sudah aktif."
  );
  await updateProfile(credential.user, {displayName: input.name});
  await withTimeout(
    setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      name: input.name,
      company: input.company,
      email: input.email,
      role: input.role,
      createdAt: serverTimestamp(),
    }),
    "Profil berhasil dibuat, tetapi Firestore belum merespons. Pastikan Firestore Database sudah dibuat dan Rules mengizinkan penulisan."
  );
  return credential.user;
}

export async function loginAccount(email: string, password: string) {
  if (!isFirebaseConfigured || !auth) throw new Error("Firebase belum dikonfigurasi. Periksa file .env.local.");
  return (await withTimeout(
    signInWithEmailAndPassword(auth, email, password),
    "Login terlalu lama. Periksa koneksi internet dan pengaturan Firebase."
  )).user;
}

export async function logoutAccount() {
  if (!auth) return;
  await signOut(auth);
}

export async function resetPassword(email: string) {
  if (!auth) throw new Error("Firebase belum dikonfigurasi. Periksa file .env.local.");
  if (!email.trim()) throw new Error("Email bisnis wajib diisi.");
  await sendPasswordResetEmail(auth, email.trim());
}

export async function getAccountRole(uid: string) {
  if (!db) throw new Error("Firestore belum dikonfigurasi.");
  const snapshot = await withTimeout(getDoc(doc(db, "users", uid)), "Profil pengguna belum dapat dibaca dari Firestore.");
  return snapshot.exists() ? (snapshot.data().role as "buyer" | "supplier" | "admin") : null;
}
