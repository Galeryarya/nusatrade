import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AccountProfile = { name: string; company: string; email: string; role: "buyer" | "supplier"; country?: string; city?: string; address?: string; whatsapp?: string; website?: string; description?: string };

export async function loadCurrentProfile(): Promise<AccountProfile | null> {
  if (!auth?.currentUser || !db) return null;
  const snapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as AccountProfile;
}

export async function updateCurrentProfile(input: Pick<AccountProfile, "name" | "company" | "country" | "city" | "address" | "whatsapp" | "website" | "description">) {
  if (!auth?.currentUser || !db) throw new Error("Sesi login tidak ditemukan.");
  await setDoc(doc(db, "users", auth.currentUser.uid), { ...input, name: input.name.trim(), company: input.company.trim() }, { merge: true });
}
