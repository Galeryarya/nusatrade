"use client";
import Link from "next/link";
import { ArrowLeft, CircleHelp, Globe2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
export default function HelpPage(){return <AuthGuard><main className="simple-app-page"><header className="profile-topbar"><Link className="brand" href="/"><span className="brand-mark"><Globe2 size={19}/></span><span>Nusa<span>Trade</span></span></Link><Link className="profile-logout" href="/">Beranda</Link></header><section className="simple-page-content"><Link className="back-link" href="/"><ArrowLeft size={15}/> Kembali</Link><div className="simple-empty"><CircleHelp size={34}/><span className="kicker">HELP CENTER</span><h1>Pusat bantuan</h1><p>Butuh bantuan? Mulai dari login, katalog, chat, atau permintaan penawaran.</p><Link className="btn btn-dark" href="/messages">Buka pesan</Link></div></section></main></AuthGuard>}
