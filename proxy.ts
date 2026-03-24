

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {  // ← middleware, pas proxy
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)  // ← cookies sur la response
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && path.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', request.url)
    const redirect = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) =>
      redirect.cookies.set(cookie.name, cookie.value)  // ← réattache les cookies
    )
    return redirect
  }

  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_completed) {
      const redirect = NextResponse.redirect(new URL('/onboarding', request.url))
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        redirect.cookies.set(cookie.name, cookie.value)
      )
      return redirect
    }
  }

  if (user && path === '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_completed) {
      const redirect = NextResponse.redirect(new URL('/dashboard', request.url))
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        redirect.cookies.set(cookie.name, cookie.value)
      )
      return redirect
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
}

// import { createServerClient } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// export async function proxy(request: NextRequest) { 
//   let supabaseResponse = NextResponse.next({ request })

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return request.cookies.getAll() },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
//           supabaseResponse = NextResponse.next({ request })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     }
//   )

//   const { data: { user } } = await supabase.auth.getUser()
//   const path = request.nextUrl.pathname

//   // Helper pour redirect avec cookies
//   const redirectTo = (url: string) => {
//     const redirect = NextResponse.redirect(new URL(url, request.url))
//     supabaseResponse.cookies.getAll().forEach((cookie) =>
//       redirect.cookies.set(cookie.name, cookie.value)
//     )
//     return redirect
//   }

//   // Pas connecté → login
//   if (!user && (
//     path.startsWith('/dashboard') ||
//     path.startsWith('/rooms') ||
//     path.startsWith('/progress') ||
//     path.startsWith('/room')
//   )) {
//     return redirectTo('/auth/login')
//   }

//   if (user) {
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('onboarding_completed, is_pro')
//       .eq('id', user.id)
//       .single()

//     // Onboarding pas terminé → /onboarding
//     if (!profile?.onboarding_completed &&
//       !path.startsWith('/onboarding') &&
//       !path.startsWith('/auth')
//     ) {
//       return redirectTo('/onboarding')
//     }

//     // Onboarding terminé → pas besoin de revenir sur /onboarding
//     if (profile?.onboarding_completed && path === '/onboarding') {
//       return redirectTo('/dashboard')
//     }

//     // ✅ /progress → Pro uniquement
//     if (path.startsWith('/progress') && !profile?.is_pro) {
//       // Vérifie si coach
//       const { data: coach } = await supabase
//         .from('coaches')
//         .select('id')
//         .eq('user_id', user.id)
//         .single()

//       if (!coach) return redirectTo('/dashboard')
//     }
//   }

//   return supabaseResponse
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/rooms/:path*',
//     '/room/:path*',
//     '/progress/:path*',
//     '/onboarding',
//   ],
// }
