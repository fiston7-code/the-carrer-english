'use client'

import Image from 'next/image'
import { Participant } from 'livekit-client'

type DbParticipant = {
  id: string
  user_id: string
  role: string
  is_muted: boolean
  hand_raised: boolean
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

type Props = {
  speakers: DbParticipant[]
  listeners: DbParticipant[]
  livekitParticipants: Participant[]
  localUserId: string
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({
  participant,
  size,
  speaking,
}: {
  participant: DbParticipant
  size: 'md' | 'sm'
  speaking: boolean
}) {
  const name = participant.profiles?.full_name
  const avatar = participant.profiles?.avatar_url
  const dim = size === 'md' ? 72 : 52

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`rounded-full overflow-hidden shrink-0 transition-all ${
          speaking ? 'animate-speaking ring-2 ring-gold' : ''
        }`}
        style={{ width: dim, height: dim }}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={name ?? ''}
            width={dim}
            height={dim}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
  className="w-full h-full flex items-center justify-center bg-surface-elevated text-gold font-bold"
  style={{ fontSize: size === 'md' ? 18 : 13 }}
>
  {/* On force la conversion de undefined vers null pour matcher ta signature */}
  {getInitials(name ?? null)}
</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground text-center truncate max-w-[72px]">
          {name ?? 'Unknown'}
        </span>
        {participant.hand_raised && (
          <span className="text-xs">✋</span>
        )}
      </div>
    </div>
  )
}

export default function ParticipantsList({
  speakers,
  listeners,
  livekitParticipants,
  localUserId,
}: Props) {
  const speakingIds = new Set(
    livekitParticipants.filter((p) => p.isSpeaking).map((p) => p.identity)
  )

  return (
    <div className="flex flex-col gap-8">

      {/* Speakers */}
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">
          Speakers
        </p>
        <div className="flex flex-wrap gap-6">
          {speakers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No speakers yet</p>
          ) : (
            speakers.map((p) => (
              <Avatar
                key={p.id}
                participant={p}
                size="md"
                speaking={speakingIds.has(p.user_id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Listeners */}
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">
          Listeners
        </p>
        <div className="flex flex-wrap gap-4">
          {listeners.length === 0 ? (
            <p className="text-muted-foreground text-sm">No listeners yet</p>
          ) : (
            listeners.map((p) => (
              <Avatar
                key={p.id}
                participant={p}
                size="sm"
                speaking={speakingIds.has(p.user_id)}
              />
            ))
          )}
        </div>
      </div>

    </div>
  )
}

