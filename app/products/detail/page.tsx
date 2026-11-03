import { Suspense } from "react";
import DetailClient from "./DetailClient";
export default function Page() { return <Suspense fallback={<main>Memuat produk...</main>}><DetailClient /></Suspense>; }
