import { NextRequest, NextResponse } from 'next/server'
import { RoomServiceClient } from 'livekit-server-sdk'

export async function POST(req: NextRequest) {
  const { roomName } = await req.json()

  if (!roomName) {
    return NextResponse.json({ error: 'Missing roomName' }, { status: 400 })
  }

  const svc = new RoomServiceClient(
   process.env.NEXT_PUBLIC_LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  )

  try {
    await svc.createRoom({
      name:            roomName,
      emptyTimeout:    600,
      maxParticipants: 50,
    })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('LiveKit create room error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}