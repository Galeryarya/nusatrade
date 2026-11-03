"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Globe2, MessageCircle, Send } from "lucide-react";
import { FormEvent, Suspense, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "@/lib/firebase";
import { getOrCreateConversation, markConversationRead, sendChatMessage, watchConversation, watchMessages, type ChatMessage, type Conversation } from "@/lib/chat";
import { getPublicProduct, type CatalogProduct } from "@/lib/firestoreProducts";
import { products } from "@/data/products";

function ChatContent() {
  const params = useSearchParams();
  const productId = params.get("product") || "";
  const conversationId = params.get("conversation") || "";
  const fallback = products[0];
  const [product, setProduct] = useState<CatalogProduct>({ ...fallback, id: `demo-${fallback.slug}` });
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (productId && !productId.startsWith("demo-")) getPublicProduct(productId).then((value) => { if (value) setProduct(value); }).catch(() => {}); }, [productId]);
  useEffect(() => { if (!auth?.currentUser || (!productId && !conversationId) || (!conversationId && !productId.startsWith("demo-") && product.id !== productId)) return; let stopConversation = () => {}; let stopMessages = () => {}; const connect = (id: string) => { markConversationRead(id).catch(() => {}); stopConversation = watchConversation(id, (value) => { setConversation(value); if (value) setProduct((current) => ({ ...current, id: value.productId, slug: value.productId, name: value.productName, supplier: value.supplierName })); }); stopMessages = watchMessages(id, setMessages); }; if (conversationId) connect(conversationId); else if (!product.ownerId) setError("Produk demo belum memiliki supplier terdaftar. Pilih produk yang ditambahkan akun Supplier."); else getOrCreateConversation({ productId: product.id, productName: product.name, supplierId: product.ownerId || "", supplierName: product.supplier }).then((reference) => connect(reference.id)).catch((e) => setError(e?.message || "Chat gagal dibuka.")); return () => { stopConversation(); stopMessages(); }; }, [productId, conversationId, product.id, product.name, product.ownerId, product.supplier]);
  async function send(event: FormEvent) { event.preventDefault(); if (!text.trim() || !conversation) return; setBusy(true); try { await sendChatMessage(conversation.id, text); setText(""); } catch (e: any) { setError(e?.message || "Pesan gagal dikirim."); } finally { setBusy(false); } }
  return <AuthGuard><main className="chat-page"><header className="profile-topbar"><Link className="brand" href="/"><span className="brand-mark"><Globe2 size={19}/></span><span>Nusa<span>Trade</span></span></Link><Link className="profile-logout" href="/messages">Semua pesan</Link></header><section className="chat-wrap"><Link className="back-link" href="/messages"><ArrowLeft size={15}/> Kembali ke pesan</Link><div className="chat-heading"><span className="kicker">MESSAGES</span><h1>{product.supplier}</h1><p>{product.name}</p></div><div className="chat-card"><div className="chat-card-head"><MessageCircle size={18}/><div><b>Percakapan produk</b><small>Diskusikan kebutuhan dan ketersediaan</small></div></div><div className="chat-messages">{messages.length ? messages.map((message) => <div className={message.senderId === auth?.currentUser?.uid ? "chat-bubble mine" : "chat-bubble"} key={message.id}>{message.text}</div>) : <div className="chat-empty">Belum ada pesan. Mulai percakapan dengan supplier.</div>}</div>{error && <p className="auth-error">{error}</p>}<form className="chat-compose" onSubmit={send}><input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Tulis pesan..."/><button className="btn btn-dark" disabled={busy || !conversation}><Send size={16}/> Kirim</button></form></div></section></main></AuthGuard>;
}

export default function ChatPage() { return <Suspense fallback={<div className="route-loading"><span className="loading-dot"/>Memuat chat...</div>}><ChatContent /></Suspense>; }
