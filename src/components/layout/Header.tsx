"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Empêche le scroll du body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Overlay blur — monté au niveau du root pour couvrir toute la page */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="blur-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 backdrop-blur-sm bg-background/60 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <header className="border-b border-border relative z-50">
        <div className="flex justify-between items-center px-6 md:px-8 h-20">
          {/* Logo */}
          <span className="font-bold text-lg text-gold tracking-tighter uppercase">
            <Link href="/">{siteConfig.name}</Link>
          </span>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <motion.div whileHover={{ opacity: 0.8 }} transition={{ duration: 0.2 }}>
                  <Link
                    href="/auth/login"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {siteConfig.nav.signIn}
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
                  <Link
                    href="/auth/signup"
                    className="bg-gold hover:bg-gold-dim text-primary-foreground rounded-full font-semibold px-8 py-3 text-sm transition-all duration-200"
                  >
                    {siteConfig.nav.getStarted}
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </motion.button>

                <motion.div whileHover={{ opacity: 0.8 }} transition={{ duration: 0.2 }}>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                  >
                    {siteConfig.nav.dashboard}
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                >
                  Déconnexion
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile : cloche + burger */}
          <div className="md:hidden flex items-center gap-3">
            <AnimatePresence>
              {user && (
                <motion.button
                  key="bell"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Burger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="flex flex-col gap-4 px-6 pb-6">
                {!user ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm pt-4"
                    >
                      {siteConfig.nav.signIn}
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMenuOpen(false)}
                      className="bg-gold hover:bg-gold-dim text-primary-foreground rounded-full font-semibold px-8 py-3 text-sm text-center transition-all duration-200"
                    >
                      {siteConfig.nav.getStarted}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm pt-4"
                    >
                      {siteConfig.nav.dashboard}
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm text-left"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}