"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Globe2, Package, Send } from "lucide-react";
import { FormEvent, Suspense, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { createRfq, getPublicProduct, type CatalogProduct } from "@/lib/firestoreProducts";
import { products } from "@/data/products";

function RfqContent() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("product") || "";
  const fallback = products[0];
  const [product, setProduct] = useState<CatalogProduct>({ ...fallback, id: `demo-${fallback.slug}` });
  const [quantity, setQuantity] = useState(params.get("quantity") || "");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId && !productId.startsWith("demo-")) getPublicProduct(productId).then((value) => { if (value) setProduct(value); }).catch(() => {});
  }, [productId]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    if (!product.ownerId) { setError("Produk contoh belum terhubung ke akun supplier. Gunakan produk yang dibuat supplier untuk demo RFQ."); return; }
    if (!quantity.trim() || !destination.trim()) { setError("Jumlah kebutuhan dan negara tujuan wajib diisi."); return; }
    setBusy(true);
    try {
      await createRfq({ productId: product.id, supplierId: product.ownerId || "", productName: product.name, supplierName: product.supplier, quantity, destination, message });
      setNotice("Permintaan penawaran berhasil dikirim ke supplier.");
      setQuantity(""); setDestination(""); setMessage("");
    } catch (e: any) { setError(e?.message || "RFQ gagal dikirim."); }
    finally { setBusy(false); }
  }

  return <AuthGuard role="buyer"><main className="rfq-page"><header className="profile-topbar"><Link className="brand" href="/"><span className="brand-mark"><Globe2 size={19}/></span><span>Nusa<span>Trade</span></span></Link><Link className="profile-logout" href="/buyer/dashboard">Dashboard</Link></header><section className="rfq-wrap"><Link className="back-link" href={`/products/detail?slug=${encodeURIComponent(product.slug)}`}><ArrowLeft size={15}/> Kembali ke produk</Link><div className="profile-heading"><span className="kicker">REQUEST FOR QUOTATION</span><h1>Minta penawaran supplier</h1><p>Kirim kebutuhanmu secara jelas agar supplier dapat memberikan harga dan terms yang sesuai.</p></div><div className="rfq-grid"><div className="rfq-product"><span className="rfq-product-icon"><Package size={20}/></span><div><small>Produk yang diminta</small><b>{product.name}</b><span>{product.supplier} · MOQ {product.min}</span></div></div><form className="profile-card rfq-card" onSubmit={submit}><div className="rfq-form-title"><FileText size={18}/><b>Detail permintaan</b></div><label>Jumlah kebutuhan<input value={quantity} onChange={(e)=>setQuantity(e.target.value)} placeholder="Contoh: 2.000 kg"/></label><label>Negara tujuan<input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Contoh: Jepang"/></label><label>Pesan untuk supplier<textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Jelaskan spesifikasi, target pengiriman, Incoterms, atau kebutuhan lain..." rows={5}/></label>{notice&&<p className="profile-success"><Send size={15}/> {notice}</p>}{error&&<p className="auth-error">{error}</p>}<button className="btn btn-dark profile-submit" disabled={busy}>{busy?"Mengirim...":"Kirim permintaan penawaran"}<ArrowRight size={16}/></button></form></div></section></main></AuthGuard>;
}


export default function RfqPage() { return <Suspense fallback={<div className="route-loading"><span className="loading-dot" />Memuat formulir...</div>}><RfqContent /></Suspense>; }
