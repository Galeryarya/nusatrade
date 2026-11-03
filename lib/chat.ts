import { addDoc, collection, doc, getDoc, setDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type Conversation = { id: string; productId: string; productName: string; supplierId: string; supplierName: string; buyerId: string; buyerEmail?: string; lastMessage?: string; lastSenderId?: string; buyerUnread?: boolean; supplierUnread?: boolean; updatedAt?: unknown; createdAt?: unknown };
export type ChatMessage = { id: string; senderId: string; text: string; createdAt?: unknown };

export async function createConversation(input: Omit<Conversation, "id" | "buyerId" | "createdAt">) {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  const id = [auth.currentUser.uid, input.supplierId, input.productId].map(encodeURIComponent).join("__");
  const reference = doc(db, "conversations", id);
  const existing = await getDoc(reference);
  if (!existing.exists()) await setDoc(reference, { ...input, buyerId: auth.currentUser.uid, buyerEmail: auth.currentUser.email || "", buyerUnread: false, supplierUnread: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return reference;
}

export async function getOrCreateConversation(input: Omit<Conversation, "id" | "buyerId" | "createdAt">) {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  const existing = await getDocs(query(collection(db, "conversations"), where("buyerId", "==", auth.currentUser.uid)));
  const match = existing.docs.find((item) => item.data().supplierId === input.supplierId && item.data().productId === input.productId);
  if (match) return { id: match.id };
  return createConversation(input);
}

export async function sendChatMessage(conversationId: string, text: string) {
  if (!auth?.currentUser || !db) throw new Error("Sesi login tidak ditemukan.");
  const result = await addDoc(collection(db, "conversations", conversationId, "messages"), { senderId: auth.currentUser.uid, text: text.trim(), createdAt: serverTimestamp() });
  const conversation = await getDoc(doc(db, "conversations", conversationId));
  const recipientField = conversation.exists() && conversation.data().buyerId === auth.currentUser.uid ? "supplierUnread" : "buyerUnread";
  await updateDoc(doc(db, "conversations", conversationId), { lastMessage: text.trim(), lastSenderId: auth.currentUser.uid, [recipientField]: true, updatedAt: serverTimestamp() });
  return result;
}

export async function markConversationRead(conversationId: string) {
  if (!auth?.currentUser || !db) return;
  const conversation = await getDoc(doc(db, "conversations", conversationId));
  if (!conversation.exists()) return;
  const field = conversation.data().buyerId === auth.currentUser.uid ? "buyerUnread" : "supplierUnread";
  await updateDoc(doc(db, "conversations", conversationId), { [field]: false });
}

export function watchUserConversations(callback: (items: Conversation[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let buyerItems: Conversation[] = []; let supplierItems: Conversation[] = [];
  const emit = () => {
    const unique = new Map<string, Conversation>();
    for (const item of [...buyerItems, ...supplierItems]) {
      const key = `${item.buyerId}__${item.supplierId}__${item.productId || "general"}`;
      const prev = unique.get(key);
      const stamp = (v: Conversation) => (v.updatedAt as {seconds?: number} | undefined)?.seconds || (v.createdAt as {seconds?: number} | undefined)?.seconds || 0;
      if (!prev || stamp(item) > stamp(prev)) unique.set(key, item);
    }
    callback([...unique.values()].sort((a,b) => ((b.updatedAt as {seconds?:number}|undefined)?.seconds||0)-((a.updatedAt as {seconds?:number}|undefined)?.seconds||0)));
  };
  const stopBuyer = onSnapshot(query(collection(db!, "conversations"), where("buyerId", "==", auth!.currentUser?.uid || "")), (snapshot) => { buyerItems = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, "id">) })); emit(); }, () => emit());
  const stopSupplier = onSnapshot(query(collection(db!, "conversations"), where("supplierId", "==", auth!.currentUser?.uid || "")), (snapshot) => { supplierItems = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, "id">) })); emit(); }, () => emit());
  return () => { stopBuyer(); stopSupplier(); };
}

export function watchConversation(conversationId: string, callback: (conversation: Conversation | null) => void) {
  if (!db) { callback(null); return () => {}; }
  return onSnapshot(doc(db, "conversations", conversationId), (snapshot) => callback(snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() as Omit<Conversation, "id">) } : null), () => callback(null));
}

export function watchMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  if (!db) { callback([]); return () => {}; }
  const messagesQuery = query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(messagesQuery, (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) }))), () => callback([]));
}
