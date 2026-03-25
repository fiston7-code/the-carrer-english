'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Users, CheckCircle, Loader2 } from 'lucide-react'

type Props = {
  room: any
  userId: string
  inviteCode: string
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function JoinRoomClient({ room, userId, inviteCode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const coach = room.coaches

  const handleJoin = async () => {
    setLoading(true)
    try {
      // Ajoute l'étudiant au coach_students si pas déjà fait
      if (coach?.id) {
        await supabase
          .from('coach_students')
          .upsert({
            coach_id:   coach.id,
            student_id: userId,
            status:     'active',
            joined_at:  new Date().toISOString(),
          }, { onConflict: 'coach_id,student_id' })
      }

      // Redirige vers la room
      router.push(`/rooms/${room.id}`)
    } catch (err) {
      console.error('Join error:', err)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-gold font-bold uppercase tracking-widest mb-2">
            You've been invited
          </p>
          <h1 className="text-2xl font-black text-foreground leading-tight">
            {room.title}
          </h1>
          {room.description && (
            <p className="text-muted-foreground text-sm mt-2">{room.description}</p>
          )}
        </div>

        {/* Coach Card */}
        {coach && (
          <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/30">
              {coach.avatar_url ? (
                <Image
                  src={coach.avatar_url} alt={coach.full_name}
                  width={56} height={56} className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg">
                  {getInitials(coach.full_name)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-foreground text-sm">{coach.full_name}</p>
                {coach.is_verified && <CheckCircle size={13} className="text-blue-400" />}
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                {coach.specialty ?? 'English Coach'}
              </p>
            </div>
          </div>
        )}

        {/* Room info */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
          {room.category && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Category</span>
              <span className="text-xs font-medium text-foreground">{room.category}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5">
              {room.status === 'live' && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              )}
              <span className={`text-xs font-bold ${
                room.status === 'live' ? 'text-green-400' : 'text-muted-foreground'
              }`}>
                {room.status === 'live' ? 'Live Now' : 'Upcoming'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Access</span>
            <span className="text-xs font-medium text-gold">🔐 Private · Invite Only</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-4 bg-gold text-black font-black rounded-2xl
                     disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Joining...</span>
            : '🎙️ Join Session'
          }
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Invite code: <span className="text-gold font-bold">{inviteCode}</span>
        </p>

      </div>
    </main>
  )
}