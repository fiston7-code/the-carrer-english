import { createServerClient } from '@supabase/ssr'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}