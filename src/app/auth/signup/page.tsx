"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client"; // Utilise ton helper centralisé
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import LoginButtons from "@/components/auth/LoginButtons"; // L'IMPORTATION ICI

const signupSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setServerError("");

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        // On redirige vers le callback pour finaliser la session après confirmation
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="gold-gradient rounded-2xl w-20 h-20 flex items-center justify-center shadow-xl animate-bounce">
            <Mail className="text-primary-foreground w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-foreground font-bold text-2xl">Check your inbox ✉️</h2>
            <p className="text-muted-foreground text-sm">
              We&apos;ve sent a confirmation link to your email. Click it to activate your **Executive** account.
            </p>
          </div>
          <Link href="/login" className="text-gold text-sm hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="gold-gradient rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-primary-foreground font-bold text-xl">CE</span>
          </div>
          <div>
            <h1 className="text-foreground font-bold text-2xl">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Start your path to international leadership
            </p>
          </div>
        </div>

        {/* --- APPEL DES BOUTONS OAUTH --- */}
        <LoginButtons />

        {/* Séparateur */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-sm font-medium">Full Name</label>
            <div className={`flex items-center bg-surface-elevated border rounded-lg px-3 py-3 gap-2 transition-all duration-200 ${
              errors.fullName ? "border-destructive" : "border-border focus-within:border-gold/50"
            }`}>
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                {...register("fullName")}
                type="text"
                placeholder="Patrick Mbala"
                className="bg-transparent text-foreground text-sm outline-none flex-1"
              />
            </div>
            {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-sm font-medium">Email</label>
            <div className={`flex items-center bg-surface-elevated border rounded-lg px-3 py-3 gap-2 transition-all duration-200 ${
              errors.email ? "border-destructive" : "border-border focus-within:border-gold/50"
            }`}>
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="bg-transparent text-foreground text-sm outline-none flex-1"
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-sm font-medium">Password</label>
            <div className={`flex items-center bg-surface-elevated border rounded-lg px-3 py-3 gap-2 transition-all duration-200 ${
              errors.password ? "border-destructive" : "border-border focus-within:border-gold/50"
            }`}>
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="bg-transparent text-foreground text-sm outline-none flex-1"
              />
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
          </div>

          {serverError && (
             <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
               {serverError}
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-primary-foreground font-bold rounded-lg py-3 text-sm shadow-lg shadow-gold/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-gold font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}





