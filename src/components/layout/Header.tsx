"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="flex justify-between items-center px-8 h-20 border-b border-border">
      {/* Logo */}
      <span className="font-bold text-lg text-gold tracking-tighter uppercase">
        {siteConfig.name}
      </span>

      {/* Boutons Auth */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link
              href="auth/login"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
            >
              {siteConfig.nav.signIn}
            </Link>

            <Link
              href="auth/signup"
              className="bg-gold hover:bg-gold-dim text-primary-foreground rounded-full font-semibold px-8 py-3 text-sm transition-all duration-200"
            >
              {siteConfig.nav.getStarted}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="auth/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
            >
              {siteConfig.nav.dashboard}
            </Link>

            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </header>
  );
}