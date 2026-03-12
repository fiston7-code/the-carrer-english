import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // 1. Échange le code OAuth contre une session
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  // 2. Récupère l'user fraîchement authentifié
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`)
  }

  // 3. Check son profil en DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // 4. Redirect intelligent
  const redirectTo = profile?.onboarding_completed
    ? `${origin}/dashboard`
    : `${origin}/onboarding`

  return NextResponse.redirect(redirectTo)
}


// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url)
//   const code = searchParams.get('code')

//   if (code) {
//     const cookieStore = await cookies() // ← await ici

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() { return cookieStore.getAll() },
//           setAll(cookiesToSet) {
//             try {
//               cookiesToSet.forEach(({ name, value, options }) =>
//                 cookieStore.set(name, value, options)
//               )
//             } catch {}
//           },
//         },
//       }
//     )

//     const { error } = await supabase.auth.exchangeCodeForSession(code)

//     if (!error) {
//       return NextResponse.redirect(`${origin}/onboarding`)
//     }
//   }

//   return NextResponse.redirect(`${origin}/login?error=callback_failed`)
// }