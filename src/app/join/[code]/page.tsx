import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JoinRoomClient from './JoinRoomClient'

type Props = { params: Promise<{ code: string }> }

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Trouve la room avec ce code
  const { data: room } = await supabase
    .from('rooms')
    .select(`
      id, title, description, category, status,
      is_private, invite_code,
      coaches (
        id, full_name, avatar_url, is_verified, specialty
      )
    `)
    .eq('invite_code', code.toUpperCase())
    .single()

  // Code invalide
  if (!room) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center flex flex-col gap-4">
          <p className="text-4xl">🔍</p>
          <h1 className="text-xl font-bold text-foreground">Invalid invite code</h1>
          <p className="text-muted-foreground text-sm">
            This link may have expired or is incorrect.
          </p>
        </div>
      </main>
    )
  }

  // Pas connecté → redirect vers auth avec callback
  if (!user) {
    redirect(`/auth?redirect=/join/${code}`)
  }

  // Déjà membre → redirect directement vers la room
  const { data: existing } = await supabase
    .from('room_participants')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (existing) redirect(`/rooms/${room.id}`)

  return <JoinRoomClient room={room} userId={user.id} inviteCode={code.toUpperCase()} />
}