import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/invite-code'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { roomId } = await req.json()
  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })

  // Génère un code unique
  let code = generateInviteCode()
  let attempts = 0

  // Vérifie que le code n'existe pas déjà
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('invite_code', code)
      .single()

    if (!existing) break
    code = generateInviteCode()
    attempts++
  }

  // Met à jour la room avec le code
  const { error } = await supabase
    .from('rooms')
    .update({ invite_code: code })
    .eq('id', roomId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code })
}