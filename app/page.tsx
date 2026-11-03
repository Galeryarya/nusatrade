"use client";

import { ArrowRight, CheckCircle2, ChevronDown, Globe2, Menu, Search, ShieldCheck, ShoppingBag, Store, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products as demoProducts } from "@/data/products";
import { watchPublicProducts, type CatalogProduct } from "@/lib/firestoreProducts";
import AccountNav from "@/components/AccountNav";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const fallback: CatalogProduct[] = demoProducts.slice(0, 4).map((p, index) => ({ ...p, id: `demo-${index}` }));
  const [catalog, setCatalog] = useState<CatalogProduct[]>(fallback);
  useEffect(() => watchPublicProducts((items) => setCatalog(items.slice(0, 4)), fallback), []);
  return (
    <main>
      <div className="topbar"><div className="container topbar-inner"><span>Platform perdagangan B2B Indonesia</span><span className="topbar-links">Bantuan &nbsp;·&nbsp; Pusat Supplier &nbsp;·&nbsp; IDR <ChevronDown size={13}/></span></div></div>
      <header className="header"><div className="container nav">
        <a className="brand" href="/"><span className="brand-mark"><Globe2 size={21}/></span><span>Nusa<span>Trade</span></span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}><a href="/products">Produk</a><a href="#suppliers">Supplier Terverifikasi</a><a href="#how">Cara kerja</a><a href="#about">Tentang kami</a></nav>
        <div className="nav-actions"><AccountNav/><button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen?<X/>:<Menu/>}</button></div>
      </div></header>

      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"></span>Ekosistem ekspor-impor Indonesia</div><h1>Produk terbaik Indonesia, <em>siap ke dunia.</em></h1><p className="hero-lead">Temukan supplier terverifikasi, minta penawaran, dan bangun perdagangan lintas negara dengan lebih percaya diri.</p><div className="hero-search"><Search size={19}/><input placeholder="Cari produk, kategori, atau supplier..."/><Link className="hero-search-submit" href="/products">Cari</Link></div><div className="hero-trust"><span><CheckCircle2 size={16}/> Supplier terverifikasi</span><span><CheckCircle2 size={16}/> Harga grosir transparan</span></div></div><div className="hero-visual"><div className="hero-image"><img src="https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=85" alt="Kopi dan biji kopi Indonesia"/><div className="image-note"><span className="note-icon"><Globe2 size={16}/></span><div><b>Made in Indonesia</b><small>Dikirim ke 42 negara</small></div></div></div></div></div></section>

      <section className="stats"><div className="container stats-grid"><div><b>2.400+</b><span>Supplier aktif</span></div><div><b>18.000+</b><span>Produk terdaftar</span></div><div><b>42 negara</b><span>Jangkauan pengiriman</span></div><div><b>98%</b><span>Supplier terverifikasi</span></div></div></section>

      <section className="section" id="products"><div className="container"><div className="section-head"><div><p className="kicker">Jelajahi katalog</p><h2>Produk yang sedang dicari buyer</h2></div><Link className="text-link" href="/products">Lihat semua produk <ArrowRight size={16}/></Link></div><div className="product-grid">{catalog.map((p)=><Link className="product-card" href={`/products/detail?slug=${encodeURIComponent(p.slug)}`} key={p.id}><div className="product-img"><img src={p.image} alt={p.name}/><span className="verified"><ShieldCheck size={13}/> Terverifikasi</span></div><div className="product-body"><p className="origin">{p.origin}</p><h3>{p.name}</h3><div className="product-meta"><strong>{p.price}<small>{p.unit}</small></strong><span>MOQ {p.min}</span></div><span className="product-cta">Lihat detail <ArrowRight size={15}/></span></div></Link>)}</div></div></section>

      <section className="section soft" id="how"><div className="container"><div className="section-head"><div><p className="kicker">Satu alur yang jelas</p><h2>Perdagangan global tanpa tebakan</h2></div></div><div className="steps"><div className="step"><span>01</span><Store size={22}/><h3>Temukan supplier</h3><p>Bandingkan produk, MOQ, kapasitas, dan rekam jejak supplier.</p></div><div className="step"><span>02</span><ShoppingBag size={22}/><h3>Minta penawaran</h3><p>Kirim kebutuhanmu dan negosiasikan harga langsung dengan supplier.</p></div><div className="step"><span>03</span><Globe2 size={22}/><h3>Kirim ke tujuan</h3><p>Kelola dokumen dan pantau pengiriman dari satu tempat.</p></div></div></div></section>

      <section className="cta"><div className="container cta-inner"><div><p className="kicker light">Untuk buyer dan supplier</p><h2>Siap membuka pasar baru?</h2><p>Mulai dari produk yang kamu kenal. Kami membantu sisanya.</p></div><Link className="btn btn-light" href="/register">Buat akun gratis <ArrowRight size={16}/></Link></div></section>
      <footer><div className="container footer-inner"><a className="brand" href="/"><span className="brand-mark"><Globe2 size={18}/></span><span>Nusa<span>Trade</span></span></a><p>Perdagangan lintas negara, lebih sederhana.</p><span>© 2026 NusaTrade</span></div></footer>
    </main>
  );
}
