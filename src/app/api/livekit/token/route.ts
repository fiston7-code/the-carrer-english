import { AccessToken } from "livekit-server-sdk"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { roomName, participantId, participantName, role } = await req.json()

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: participantId, name: participantName }
  )

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: role === "coach" || role === "speaker", // ← speaker aussi
    canSubscribe: true,
    canPublishData: true,
  })

  return NextResponse.json({ token: await at.toJwt() })
}