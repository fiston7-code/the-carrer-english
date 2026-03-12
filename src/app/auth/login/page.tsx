"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client"; // Utilise ton helper lib
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginButtons from "@/components/auth/LoginButtons"; // L'IMPORTATION

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
    } else {
      // Utilise router.push pour rester dans l'expérience SPA (Single Page App)
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Logo & Titre */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="gold-gradient rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-primary-foreground font-bold text-xl">CE</span>
          </div>
          <div>
            <h1 className="text-foreground font-bold text-2xl">The Career English</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Master business English for your career
            </p>
          </div>
        </div>

        {/* --- APPEL DES BOUTONS OAUTH (Google & LinkedIn) --- */}
        <LoginButtons />

        {/* Séparateur */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Formulaire Classique */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">

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
                className="bg-transparent text-foreground text-sm outline-none flex-1 placeholder:text-muted-foreground"
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

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
                className="bg-transparent text-foreground text-sm outline-none flex-1 placeholder:text-muted-foreground"
              />
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-primary-foreground font-bold rounded-lg py-3 text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-gold/10"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-gold font-semibold hover:text-gold-dim transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}


// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { createBrowserClient } from "@supabase/ssr";
// import { useState } from "react";
// import { Mail, Lock, Chrome } from "lucide-react";
// import Link from "next/link";

// const loginSchema = z.object({
//   email: z.string().email("Email invalide"),
//   password: z.string().min(6, "Minimum 6 caractères"),
// });

// type LoginForm = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const [serverError, setServerError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data: LoginForm) => {
//     setLoading(true);
//     setServerError("");

//     const { error } = await supabase.auth.signInWithPassword({
//       email: data.email,
//       password: data.password,
//     });

//     if (error) {
//       setServerError(error.message);
//       setLoading(false);
//     } else {
//       window.location.href = "/dashboard";
//     }
//   };

//   const handleGoogle = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: `${window.location.origin}/auth/callback` },
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center px-4">
//       <div className="w-full max-w-sm flex flex-col items-center gap-6">

//         {/* Logo */}
//         <div className="gold-gradient rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
//           <span className="text-primary-foreground font-bold text-xl">CE</span>
//         </div>

//         {/* Titre */}
//         <div className="text-center">
//           <h1 className="text-foreground font-bold text-2xl">The Career English</h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             Master business English for your career
//           </p>
//         </div>

//        

//         {/* Séparateur */}
//         <div className="w-full flex items-center gap-4">
//           <div className="flex-1 h-px bg-border" />
//           <span className="text-muted-foreground text-xs">OR</span>
//           <div className="flex-1 h-px bg-border" />
//         </div>

//         {/* Formulaire */}
//         <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">

//           {/* Email */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-foreground text-sm">Email</label>
//             <div className={`flex items-center bg-surface-elevated border rounded-lg px-3 py-3 gap-2 transition-colors ${
//               errors.email ? "border-destructive" : "border-border focus-within:border-gold"
//             }`}>
//               <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
//               <input
//                 {...register("email")}
//                 type="email"
//                 placeholder="you@company.com"
//                 className="bg-transparent text-foreground text-sm outline-none flex-1 placeholder:text-muted-foreground"
//               />
//             </div>
//             {errors.email && (
//               <p className="text-destructive text-xs">{errors.email.message}</p>
//             )}
//           </div>

//           {/* Password */}
//           <div className="flex flex-col gap-1.5">
//             <label className="text-foreground text-sm">Password</label>
//             <div className={`flex items-center bg-surface-elevated border rounded-lg px-3 py-3 gap-2 transition-colors ${
//               errors.password ? "border-destructive" : "border-border focus-within:border-gold"
//             }`}>
//               <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
//               <input
//                 {...register("password")}
//                 type="password"
//                 placeholder="••••••••"
//                 className="bg-transparent text-foreground text-sm outline-none flex-1 placeholder:text-muted-foreground"
//               />
//             </div>
//             {errors.password && (
//               <p className="text-destructive text-xs">{errors.password.message}</p>
//             )}
//           </div>

//           {/* Server Error */}
//           {serverError && (
//             <p className="text-destructive text-sm text-center">{serverError}</p>
//           )}

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full gold-gradient text-primary-foreground font-bold rounded-lg py-3 text-sm transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 mt-1"
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>

//         {/* Footer */}
//         <p className="text-muted-foreground text-sm">
//           Don't have an account?{" "}
//           <Link href="/signup" className="text-gold hover:text-gold-dim transition-colors">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }