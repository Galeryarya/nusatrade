"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2, Heart, ShoppingCart, MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";
import { products } from "@/data/products";
import { addCartItem, getPublicProduct, type CatalogProduct } from "@/lib/firestoreProducts";
import { auth } from "@/lib/firebase";
import AccountNav from "@/components/AccountNav";
import { removeWishlistItem, saveWishlistItem, watchWishlist } from "@/lib/firestoreProducts";

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const params = { slug: searchParams.get("slug") || products[0].slug };
  const router = useRouter();
  const fallback = products.find((item) => item.slug === params.slug) || products[0];
  const [product, setProduct] = useState<CatalogProduct>({ ...fallback, id: `demo-${fallback.slug}` });
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (!products.some((item) => item.slug === params.slug)) getPublicProduct(params.slug).then((item) => { if (item) setProduct(item); }).catch(() => {}); }, [params.slug]);
  useEffect(() => { const stop = watchWishlist((items) => setSaved(items.some((item) => item.id === product.id))); return stop; }, [product.id]);
  async function toggleWishlist() { if (!auth?.currentUser) { router.push(`/login?next=${encodeURIComponent(`/products/detail?slug=${encodeURIComponent(params.slug)}`)}`); return; } try { if (saved) { await removeWishlistItem(product.id); setSaved(false); } else { await saveWishlistItem(product); setSaved(true); } } catch {} }
  async function addToCart() { if (!auth?.currentUser) { router.push(`/login?next=${encodeURIComponent(`/products/detail?slug=${encodeURIComponent(params.slug)}`)}`); return; } try { await addCartItem(product); setNotice("Produk masuk ke keranjang."); } catch (e: any) { setNotice(e?.message || "Gagal menambah ke keranjang."); } }
  function openChat() { if (!auth?.currentUser) { router.push(`/login?next=${encodeURIComponent(`/products/detail?slug=${encodeURIComponent(params.slug)}`)}`); return; } router.push(`/chat?product=${encodeURIComponent(product.id)}`); }
  function requestQuote() { if (!auth?.currentUser) { router.push(`/login?next=${encodeURIComponent(`/products/detail?slug=${encodeURIComponent(params.slug)}`)}`); return; } router.push(`/rfq?product=${encodeURIComponent(product.id)}`); }
  return <main><header className="header"><div className="container nav"><Link className="brand" href="/"><span className="brand-mark"><Globe2 size={21}/></span><span>Nusa<span>Trade</span></span></Link><nav className="nav-links product-nav"><Link href="/products">Produk</Link><a href="/#suppliers">Supplier Terverifikasi</a><a href="/#how">Cara kerja</a></nav><div className="nav-actions"><AccountNav/></div></div></header>
  <section className="detail"><div className="container"><Link className="back-link" href="/products"><ArrowLeft size={15}/> Kembali ke katalog</Link><div className="detail-grid"><div className="detail-photo"><img src={product.image} alt={product.name}/><span className="photo-caption">Foto produk supplier</span></div><div className="detail-copy"><div className="detail-origin">{product.origin} · {product.category}</div><div className="detail-title-row"><h1>{product.name}</h1><button className={saved?"wishlist-toggle saved":"wishlist-toggle"} onClick={toggleWishlist} aria-label="Simpan ke wishlist"><Heart size={19} fill={saved?"currentColor":"none"}/></button></div><div className="supplier-line"><span className="supplier-avatar">{product.supplier.slice(0,1)}</span><div><b>{product.supplier}</b><small><ShieldCheck size={13}/> {product.verified ? "Supplier terverifikasi" : "Supplier belum diverifikasi"}</small></div></div><div className="price-block"><span>Harga indikatif</span><strong>{product.price}<small>{product.unit}</small></strong><em>Harga dapat berubah sesuai volume dan Incoterms.</em></div><p className="detail-description">{product.description}</p><div className="specs"><div><span>Minimum order</span><b>{product.min}</b></div><div><span>Kapasitas</span><b>{product.stock}</b></div><div><span>Asal produk</span><b>{product.region}</b></div></div><div className="detail-actions"><button className="btn btn-dark" onClick={openChat}><MessageCircle size={17}/> Chat supplier</button><button className="btn btn-outline" onClick={addToCart}><ShoppingCart size={17}/> Keranjang</button><button className="btn btn-outline" onClick={requestQuote}>Minta penawaran <ArrowRight size={16}/></button></div>{notice ? <p className="login-note detail-notice"><CheckCircle2 size={15}/> {notice}</p> : <p className="login-note"><CheckCircle2 size={15}/> Login diperlukan untuk menghubungi supplier atau membuat RFQ.</p>}</div></div></div></section><section className="detail-trust"><div className="container trust-row"><div><PackageCheck size={20}/><span><b>Dokumen tersedia</b><small>Invoice, packing list, COO</small></span></div><div><Globe2 size={20}/><span><b>Pengiriman global</b><small>FOB, CIF, EXW, DDP</small></span></div><div><ShieldCheck size={20}/><span><b>Supplier terverifikasi</b><small>Profil dan dokumen ditinjau</small></span></div></div></section></main>;
}
