"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccountRole } from "@/lib/auth";
import { auth } from "@/lib/firebase";

type Role = "buyer" | "supplier" | "admin";

export default function AuthGuard({ children, role }: { children: React.ReactNode; role?: Role }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        router.replace("/login");
        return;
      }

      if (role) {
        try {
          const savedRole = await getAccountRole(nextUser.uid);
          if (savedRole && savedRole !== role) {
            router.replace(savedRole === "supplier" ? "/supplier/dashboard" : "/buyer/dashboard");
            return;
          }
        } catch {
          // Keep the session usable if the profile document is temporarily unavailable.
        }
      }
      setReady(true);
    });
  }, [role, router]);

  if (!ready || !user) {
    return <div className="route-loading"><span className="loading-dot" />Memeriksa sesi...</div>;
  }

  return <>{children}</>;
}
