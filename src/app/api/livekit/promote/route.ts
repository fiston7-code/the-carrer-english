// src/app/api/livekit/promote/route.ts
import { RoomServiceClient } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const svc = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

export async function POST(req: Request) {
  // Vérifie que c'est un coach
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { roomName, participantIdentity, canPublish } = await req.json()

  if (!roomName || !participantIdentity) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // await svc.updateParticipant(roomName, participantIdentity, undefined, {
  //   canPublish,
  //   canSubscribe: true,
  //   canPublishData: true,
  // })

  // return NextResponse.json({ ok: true })

  try {
  console.log(`[PROMOTE] Updating ${participantIdentity} in ${roomName} → canPublish: ${canPublish}`);
  await svc.updateParticipant(roomName, participantIdentity, undefined, {
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });
  console.log("[PROMOTE] Success");
  return NextResponse.json({ ok: true });
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[PROMOTE] Failed:", message);
  return NextResponse.json({ error: message }, { status: 500 });
}
}