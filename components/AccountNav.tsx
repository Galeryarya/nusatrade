"use client";

import Link from "next/link";
import { ShoppingCart, UserRound } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { loadCurrentProfile, type AccountProfile } from "@/lib/profile";

export default function AccountNav() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { if (!auth) return; return onAuthStateChanged(auth, (user) => { setSignedIn(Boolean(user)); if (user) loadCurrentProfile().then(setProfile).catch(() => {}); else setProfile(null); }); }, []);
  if (!signedIn) return <><Link className="login" href="/login">Masuk</Link><Link className="btn btn-dark small" href="/register">Mulai berdagang <span aria-hidden>→</span></Link></>;
  const initials = (profile?.name || profile?.company || "NU").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const dashboard = profile?.role === "admin" ? "/admin/dashboard" : profile?.role === "supplier" ? "/supplier/dashboard" : "/buyer/dashboard";
  return <div className="account-nav"><Link className="account-link" href="/profile" title="Buka akun"><span className={profile?.role === "supplier" ? "account-avatar supplier" : "account-avatar"}>{initials}</span><span className="account-label"><b>{profile?.company || profile?.name || "Akun saya"}</b><small>{profile?.role === "supplier" ? "Supplier" : "Buyer"}</small></span></Link>{profile?.role === "buyer" && <Link className="account-dashboard" href="/cart"><ShoppingCart size={15}/> Keranjang</Link>}<Link className="account-dashboard" href={dashboard}>Dashboard</Link></div>;
}
