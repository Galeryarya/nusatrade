"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Globe2, MessageCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { loadCurrentProfile, type AccountProfile } from "@/lib/profile";
import { watchUserConversations, type Conversation } from "@/lib/chat";
import { logoutAccount } from "@/lib/auth";

export default function MessagesPage() {
  const [items, setItems] = useState<Conversation[]>([]); const [profile, setProfile] = useState<AccountProfile | null>(null); const [search, setSearch] = useState("");
  useEffect(() => { const stop = watchUserConversations(setItems); loadCurrentProfile().then(setProfile).catch(() => {}); return stop; }, []);
  const shown = useMemo(() => items.filter((item) => `${item.productName} ${item.supplierName} ${item.buyerEmail}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const isSupplier = profile?.role === "supplier";
  return <AuthGuard><main className="messages-page"><header className="profile-topbar"><Link className="brand" href="/"><span className="brand-mark"><Globe2 size={19}/></span><span>Nusa<span>Trade</span></span></Link><button className="profile-logout" onClick={async()=>{await logoutAccount();}}>Keluar</button></header><section className="messages-wrap"><Link className="back-link" href={isSupplier?"/supplier/dashboard":"/buyer/dashboard"}><ArrowLeft size={15}/> Kembali ke dashboard</Link><div className="messages-heading"><div><span className="kicker">INBOX PESAN</span><h1>Pesan</h1><p>Kelola percakapan dengan partner dagangmu.</p></div><span className="messages-count">{items.length} percakapan</span></div><div className="messages-toolbar"><div className="manage-search"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari percakapan..."/></div></div><div className="conversation-list">{shown.length ? shown.map((item)=><Link className="conversation-row" href={`/chat?conversation=${item.id}`} key={item.id}><span className={isSupplier?"conversation-avatar orange":"conversation-avatar"}>{(isSupplier?(item.buyerEmail||"B"):(item.supplierName||"S")).slice(0,1).toUpperCase()}</span><div className="conversation-main"><div><b>{isSupplier ? (item.buyerEmail || "Buyer NusaTrade") : item.supplierName}</b><small>{item.productName}</small></div><p>{item.lastMessage || "Percakapan baru — mulai chat sekarang."}</p></div><ChevronRight size={17}/></Link>) : <div className="messages-empty"><MessageCircle size={28}/><h3>Belum ada percakapan</h3><p>Chat supplier dari halaman detail produk untuk memulai.</p><Link className="btn btn-dark" href="/products">Jelajahi produk</Link></div>}</div></section></main></AuthGuard>;
}
