import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, runTransaction } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export type SupplierProduct = { id: string; ownerId: string; name: string; category: string; price: string; moq: string; status: "Aktif" | "Draft"; image: string; createdAt?: unknown };
export type CatalogProduct = { id: string; slug: string; ownerId?: string; name: string; origin: string; region: string; category: string; price: string; unit: string; min: string; stock: string; image: string; description: string; supplier: string; verified: boolean };

export type RfqInput = { productId: string; supplierId: string; productName: string; supplierName: string; quantity: string; destination: string; message: string };
export type SupplierRfq = RfqInput & { id: string; buyerId: string; buyerEmail: string; status: "Baru" | "Dibaca" | "Dibalas" | "Selesai"; quotePrice?: string; quoteTerms?: string; quotedAt?: unknown; createdAt?: unknown };
export type TradeOrder = { id: string; rfqId: string; buyerId: string; supplierId: string; buyerEmail: string; supplierName: string; productId: string; productName: string; quantity: string; destination: string; status: "Menunggu supplier" | "Dikonfirmasi" | "Diproses" | "Siap dikirim" | "Dikirim" | "Dalam perjalanan" | "Tiba di tujuan" | "Selesai" | "Dibatalkan"; checkoutGroupId?: string; quotePrice?: string; quoteTerms?: string; trackingNote?: string; paymentMethod?: string; paymentStatus?: "Belum dibayar" | "Menunggu konfirmasi" | "Lunas (simulasi)"; trackingHistory?: {status:string;note:string;at:string;by:string}[]; createdAt?: unknown };
export type WishlistItem = CatalogProduct & { savedAt?: unknown };

export function watchPublicProducts(callback: (items: CatalogProduct[]) => void, fallback: CatalogProduct[]) {
  if (!db) { callback(fallback); return () => {}; }
  const q = query(collection(db, "products"), where("status", "==", "Aktif"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((item) => {
      const data = item.data() as Partial<SupplierProduct> & { company?: string; origin?: string; region?: string; description?: string; stock?: string };
      return {
        id: item.id,
        ownerId: data.ownerId,
        slug: item.id,
        name: data.name || "Produk tanpa nama",
        origin: data.origin || "Indonesia",
        region: data.region || "Indonesia",
        category: data.category || "Lainnya",
        price: data.price || "Hubungi supplier",
        unit: "/ kg",
        min: data.moq || "Hubungi supplier",
        stock: data.stock || "Kapasitas sesuai konfirmasi",
        image: data.image || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85",
        description: data.description || "Informasi produk dan spesifikasi dapat dikonfirmasi langsung dengan supplier.",
        supplier: data.company || "Supplier NusaTrade",
        verified: Boolean((data as any).verified),
      };
    });
    callback(items);
  }, (error) => { console.error("Katalog Firestore:", error); callback([]); });
}

export async function getPublicProduct(id: string) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, "products", id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as Partial<SupplierProduct> & { company?: string; origin?: string; region?: string; description?: string; stock?: string };
  return {
    id: snapshot.id, slug: snapshot.id, ownerId: (data as any).ownerId, name: data.name || "Produk tanpa nama", origin: data.origin || "Indonesia", region: data.region || "Indonesia", category: data.category || "Lainnya", price: data.price || "Hubungi supplier", unit: "/ kg", min: data.moq || "Hubungi supplier", stock: data.stock || "Kapasitas sesuai konfirmasi", image: data.image || "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85", description: data.description || "Informasi produk dapat dikonfirmasi langsung dengan supplier.", supplier: data.company || "Supplier NusaTrade", verified: Boolean((data as any).verified),
  } satisfies CatalogProduct;
}

export async function createRfq(input: RfqInput) {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  if (!input.supplierId || !input.productId || !input.quantity.trim() || !input.destination.trim()) throw new Error("Lengkapi produk, supplier, jumlah, dan tujuan.");
  return addDoc(collection(db, "rfqs"), {
    ...input,
    buyerId: auth.currentUser.uid,
    buyerEmail: auth.currentUser.email || "",
    status: "Baru",
    createdAt: serverTimestamp(),
  });
}

export async function updateRfqStatus(id: string, status: SupplierRfq["status"]) {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  return updateDoc(doc(db, "rfqs", id), { status, updatedAt: serverTimestamp() });
}

export async function submitSupplierQuote(id:string, price:string, terms:string) {
  if (!auth?.currentUser || !db) throw new Error("Login supplier diperlukan.");
  if (!price.trim() || !terms.trim()) throw new Error("Harga dan syarat penawaran wajib diisi.");
  const ref = doc(db,"rfqs",id);
  return runTransaction(db,async tx=>{
    const snap=await tx.get(ref);
    if (!snap.exists() || snap.data().supplierId!==auth!.currentUser!.uid) throw new Error("RFQ bukan milik Supplier ini.");
    if (snap.data().status==="Selesai") throw new Error("RFQ sudah menjadi pesanan.");
    tx.update(ref,{quotePrice:price.trim().slice(0,100),quoteTerms:terms.trim().slice(0,500),status:"Dibalas",quotedAt:serverTimestamp(),updatedAt:serverTimestamp()});
  });
}

export async function checkoutCartGroup(items:CartItem[], destination:string, paymentMethod:string){
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  if(!items.length || items.length>8 || !destination.trim()) throw new Error("Keranjang harus berisi 1–8 produk dan tujuan pengiriman wajib diisi.");
  if(items.some(x=>!x.ownerId))throw new Error("Ada produk tanpa Supplier yang valid.");
  const uid=auth.currentUser.uid;
  const groupId=doc(collection(db,"checkoutGroups")).id;
  const groupRef=doc(db,"checkoutGroups",groupId);
  await runTransaction(db,async tx=>{
    const snapshots=await Promise.all(items.map(item=>tx.get(doc(db!,"carts",uid,"items",item.id))));
    if(snapshots.some(s=>!s.exists()))throw new Error("Isi keranjang berubah, muat ulang halaman.");
    tx.set(groupRef,{buyerId:uid,items:items.map(x=>({productId:x.id,name:x.name,quantity:x.quantity,supplierId:x.ownerId})),status:"Menunggu supplier",paymentMethod,destination:destination.trim(),createdAt:serverTimestamp()});
    items.forEach((item,i)=>{
      const id=`cart_${groupId}_${i}`;
      tx.set(doc(db!,"orders",id),{rfqId:"",checkoutGroupId:groupId,buyerId:uid,supplierId:item.ownerId,buyerEmail:auth!.currentUser!.email||"",supplierName:item.supplier,productId:item.id,productName:item.name,quantity:String(item.quantity),destination:destination.trim(),paymentMethod,paymentStatus:"Belum dibayar",status:"Menunggu supplier",trackingNote:"Checkout keranjang diterima",trackingHistory:[{status:"Menunggu supplier",note:"Checkout keranjang",at:new Date().toISOString(),by:"buyer"}],createdAt:serverTimestamp()});
      tx.delete(snapshots[i].ref);
    });
  });
  return groupId;
}

export async function createOrderFromRfq(rfq: SupplierRfq, paymentMethod = "Transfer bank (simulasi)") {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  const uid = auth.currentUser.uid;
  if (rfq.buyerId !== uid) throw new Error("RFQ bukan milik akun ini.");
  const source = doc(db, "rfqs", rfq.id);
  const target = doc(db, "orders", `rfq_${rfq.id}`);
  return runTransaction(db, async transaction => {
    const [rfqSnap, existing] = await Promise.all([transaction.get(source), transaction.get(target)]);
    if (!rfqSnap.exists() || rfqSnap.data().buyerId !== uid || rfqSnap.data().status !== "Dibalas") throw new Error("RFQ belum dibalas supplier atau sudah diproses.");
    if (existing.exists()) return target;
    transaction.set(target, {rfqId: rfq.id, buyerId:uid, supplierId:rfq.supplierId, buyerEmail:auth!.currentUser!.email || rfq.buyerEmail, supplierName:rfq.supplierName, productId:rfq.productId, productName:rfq.productName, quantity:rfq.quantity, destination:rfq.destination, paymentMethod, quotePrice:rfq.quotePrice||"", quoteTerms:rfq.quoteTerms||"", paymentStatus:"Belum dibayar", status:"Menunggu supplier", trackingNote:"Pesanan diterima sistem, menunggu konfirmasi supplier", trackingHistory:[{status:"Menunggu supplier", note:"Pesanan dibuat Buyer",at:new Date().toISOString(),by:"buyer"}], createdAt:serverTimestamp()});
    transaction.update(source, {status:"Selesai", updatedAt:serverTimestamp()});
    return target;
  });
}

export async function confirmDemoPayment(orderId:string) {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  const uid=auth.currentUser.uid;
  const ref=doc(db,"orders",orderId);
  return runTransaction(db, async tx=>{
    const snap=await tx.get(ref);
    if (!snap.exists() || snap.data().buyerId!==uid) throw new Error("Pesanan tidak ditemukan.");
    if (snap.data().status==="Dibatalkan") throw new Error("Pesanan dibatalkan.");
    if (snap.data().paymentStatus==="Lunas (simulasi)") return;
    tx.update(ref,{paymentStatus:"Menunggu konfirmasi",updatedAt:serverTimestamp()});
  });
}

export async function adminUpdatePayment(orderId:string, paymentStatus:TradeOrder["paymentStatus"]) {
  if (!auth?.currentUser || !db) throw new Error("Login admin diperlukan.");
  const profile=await getDoc(doc(db,"users",auth.currentUser.uid));
  if(profile.data()?.role!=="admin") throw new Error("Hanya admin dapat konfirmasi pembayaran.");
  return updateDoc(doc(db,"orders",orderId),{paymentStatus,updatedAt:serverTimestamp()});
}

export function watchUserOrders(callback: (items: TradeOrder[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopBuyer=()=>{}; let stopSupplier=()=>{};
  const stopAuth=onAuthStateChanged(auth, user=>{
    stopBuyer();stopSupplier();
    if(!user){callback([]);return;}
    let buyerItems:TradeOrder[]=[];let supplierItems:TradeOrder[]=[];
    const emit=()=>callback([...buyerItems,...supplierItems].filter((item,index,all)=>all.findIndex(x=>x.id===item.id)===index));
    stopBuyer=onSnapshot(query(collection(db!,"orders"),where("buyerId","==",user.uid)),snap=>{buyerItems=snap.docs.map(x=>({id:x.id,...x.data()} as TradeOrder));emit()},err=>console.error("Buyer orders:",err));
    stopSupplier=onSnapshot(query(collection(db!,"orders"),where("supplierId","==",user.uid)),snap=>{supplierItems=snap.docs.map(x=>({id:x.id,...x.data()} as TradeOrder));emit()},err=>console.error("Supplier orders:",err));
  });
  return ()=>{stopAuth();stopBuyer();stopSupplier()};
}

export async function updateOrderStatus(id: string, status: TradeOrder["status"]) {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  return updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
}

export async function saveWishlistItem(item: CatalogProduct) {
  if (!auth?.currentUser || !db) throw new Error("Login Buyer diperlukan.");
  return setDoc(doc(db, "wishlists", auth.currentUser.uid, "items", item.id), { ...item, savedAt: serverTimestamp() });
}

export async function removeWishlistItem(id: string) {
  if (!auth?.currentUser || !db) return;
  return deleteDoc(doc(db, "wishlists", auth.currentUser.uid, "items", id));
}

export function watchWishlist(callback: (items: WishlistItem[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopSnapshot: (() => void) | undefined;
  const stopAuth = onAuthStateChanged(auth, (user) => {
    if (!user) { callback([]); return; }
    stopSnapshot?.();
    stopSnapshot = onSnapshot(collection(db!, "wishlists", user.uid, "items"), (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<WishlistItem, "id">) }))), () => callback([]));
  });
  return () => { stopSnapshot?.(); stopAuth(); };
}

export function watchSupplierRfqs(callback: (items: SupplierRfq[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopSnapshot: (() => void) | undefined;
  const stopAuth = onAuthStateChanged(auth, (user) => {
    if (!user) { callback([]); return; }
    const rfqQuery = query(collection(db!, "rfqs"), where("supplierId", "==", user.uid));
    stopSnapshot?.();
    stopSnapshot = onSnapshot(rfqQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<SupplierRfq, "id">) })));
    }, () => callback([]));
  });
  return () => { stopSnapshot?.(); stopAuth(); };
}

export function watchBuyerRfqs(callback: (items: SupplierRfq[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopSnapshot: (() => void) | undefined;
  const stopAuth = onAuthStateChanged(auth, (user) => {
    if (!user) { callback([]); return; }
    const rfqQuery = query(collection(db!, "rfqs"), where("buyerId", "==", user.uid));
    stopSnapshot?.();
    stopSnapshot = onSnapshot(rfqQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<SupplierRfq, "id">) })));
    }, () => callback([]));
  });
  return () => { stopSnapshot?.(); stopAuth(); };
}

export function watchSupplierProducts(callback: (items: SupplierProduct[]) => void, fallback: SupplierProduct[]) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopSnapshot: (() => void) | undefined;
  const stopAuth = onAuthStateChanged(auth, user => {
    if (!user) { callback([]); return; }
    const q = query(collection(db!, "products"), where("ownerId", "==", user.uid));
    stopSnapshot?.();
    stopSnapshot = onSnapshot(q, snapshot => {
      callback(snapshot.docs.map(item => ({id:item.id, ...(item.data() as Omit<SupplierProduct,"id">)})));
    }, () => callback([]));
  });
  return () => { stopSnapshot?.(); stopAuth(); };
}

export async function saveSupplierProduct(data: Omit<SupplierProduct,"id"|"ownerId"|"createdAt">, id?: string) {
  if (!auth?.currentUser || !db) throw new Error("Login supplier diperlukan.");
  if (!data.name.trim() || !data.price.trim() || !data.moq.trim()) throw new Error("Nama, harga, dan MOQ wajib diisi.");
  if (data.image.length > 800000) throw new Error("Foto terlalu besar. Pilih gambar yang lebih kecil.");
  if (id) return updateDoc(doc(db, "products", id), {...data, updatedAt: serverTimestamp()});
  const profile = await getDoc(doc(db, "users", auth.currentUser.uid));
  const company = profile.exists() ? (profile.data().company || profile.data().name || "Supplier NusaTrade") : (auth.currentUser.displayName || "Supplier NusaTrade");
  return addDoc(collection(db, "products"), {...data, ownerId: auth.currentUser.uid, company, createdAt: serverTimestamp()});
}

export async function removeSupplierProduct(id: string) {
  if (!db) throw new Error("Firebase belum dikonfigurasi.");
  return deleteDoc(doc(db, "products", id));
}


// Keranjang demo UAS disimpan per akun di Firestore.
export type CartItem = { id: string; name: string; image: string; price: string; supplier: string; ownerId: string; quantity: number; updatedAt?: unknown };
export async function addCartItem(product: CatalogProduct) {
  if (!auth?.currentUser || !db) throw new Error("Silakan login terlebih dahulu.");
  const roleSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (roleSnap.data()?.role !== "buyer") throw new Error("Keranjang hanya tersedia untuk akun Buyer.");
  const reference = doc(db, "carts", auth.currentUser.uid, "items", product.id);
  const previous = await getDoc(reference);
  await setDoc(reference, { name: product.name, image: product.image, price: product.price, supplier: product.supplier, ownerId: product.ownerId || "", quantity: (Number(previous.data()?.quantity) || 0) + 1, updatedAt: serverTimestamp() });
}
export function watchCart(callback: (items: CartItem[]) => void) {
  if (!auth || !db) { callback([]); return () => {}; }
  let stopItems = () => {};
  const stopAuth = onAuthStateChanged(auth, user => {
    stopItems(); if (!user) { callback([]); return; }
    stopItems = onSnapshot(collection(db!, "carts", user.uid, "items"), snapshot => callback(snapshot.docs.map(d => ({id:d.id,...d.data()} as CartItem))), () => callback([]));
  });
  return () => { stopAuth(); stopItems(); };
}
export async function changeCartQuantity(id: string, quantity: number) {
  if (!auth?.currentUser || !db) throw new Error("Login diperlukan.");
  const ref = doc(db, "carts", auth.currentUser.uid, "items", id);
  if (quantity <= 0) return deleteDoc(ref);
  return updateDoc(ref, {quantity: Math.min(999, Math.max(1, quantity)), updatedAt: serverTimestamp()});
}
export const ORDER_STEPS: TradeOrder["status"][] = ["Menunggu supplier", "Dikonfirmasi", "Diproses", "Siap dikirim", "Dikirim", "Dalam perjalanan", "Tiba di tujuan", "Selesai"];
export async function setOrderTracking(id: string, status: TradeOrder["status"], trackingNote: string) {
  if (!auth?.currentUser || !db) throw new Error("Login admin diperlukan.");
  const role = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (role.data()?.role !== "admin") throw new Error("Hanya admin yang dapat mengatur tracking.");
  const ref=doc(db,"orders",id);
  return runTransaction(db,async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists()) throw new Error("Pesanan tidak ditemukan.");
    const previous=snap.data();
    if(previous.status==="Selesai" && status!=="Selesai") throw new Error("Pesanan sudah selesai.");
    if(previous.status==="Dibatalkan" && status!=="Dibatalkan") throw new Error("Pesanan dibatalkan.");
    if(status!=="Dibatalkan" && status!==previous.status && ORDER_STEPS.indexOf(status)<ORDER_STEPS.indexOf(previous.status)) throw new Error("Status tidak boleh mundur.");
    const note=trackingNote.trim().slice(0,300);
    const history=Array.isArray(previous.trackingHistory)?previous.trackingHistory:[];
    tx.update(ref,{status,trackingNote:note,trackingHistory:[...history,{status,note,at:new Date().toISOString(),by:auth!.currentUser!.uid}],updatedAt:serverTimestamp()});
  });
}
