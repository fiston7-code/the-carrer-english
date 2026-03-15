// src/app/api/livekit/leave/route.ts
import { createClient } from '@/lib/supabase/client'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { roomId, userId } = JSON.parse(await req.text())
  const supabase = createClient()

  await supabase
    .from('room_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', userId)

  return new Response('ok')
}