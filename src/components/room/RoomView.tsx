'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useTracks,
  AudioTrack,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { LogOut, Mic, MicOff, Hand, MessageSquare, X, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  english_level: string | null
}

type Room = {
  id: string
  title: string
  status: string
  livekit_room_name: string
  coaches: {
    id: string
    full_name: string
    avatar_url: string | null
    is_verified: boolean
    user_id: string
  } | null
}

type DbParticipant = {
  id: string
  user_id: string
  role: string
  is_muted: boolean
  hand_raised: boolean
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

type Feedback = {
  id: string
  type: string
  mistake: string | null
  correction: string | null
  explanation: string | null
  created_at: string
}

type Props = {
  room: Room
  profile: Profile
  userId: string
  isCoach: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ─── Remote Audio ─────────────────────────────────────────────────────────────

function RemoteAudio() {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true })
  return (
    <>
      {tracks.map((track) => (
        <AudioTrack key={track.participant.identity} trackRef={track} />
      ))}
    </>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

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
        className={`rounded-full overflow-hidden shrink-0 ${
          speaking ? 'ring-2 ring-gold animate-speaking' : ''
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
            {getInitials(name)}
          </div>
        )}
      </div>
      <span className="text-xs text-foreground truncate text-center max-w-[80px]">
        {name ?? 'Unknown'}
      </span>
    </div>
  )
}

// ─── Feedback Card ────────────────────────────────────────────────────────────

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const isCorrection = feedback.type === 'correction'
  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col gap-1.5 border border-border">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {isCorrection
          ? <Clock size={12} className="text-destructive" />
          : <span className="text-sm">💡</span>
        }
        <span>{timeAgo(feedback.created_at)}</span>
      </div>
      {isCorrection && feedback.mistake && (
        <p className="text-destructive text-sm line-through">✗ {feedback.mistake}</p>
      )}
      {isCorrection && feedback.correction && (
        <p className="text-foreground text-sm">✓ {feedback.correction}</p>
      )}
      {!isCorrection && feedback.explanation && (
        <p className="text-foreground text-sm">{feedback.explanation}</p>
      )}
    </div>
  )
}

// ─── Coach Mic Button ─────────────────────────────────────────────────────────

function CoachMicButton() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const [loading, setLoading] = useState(false)

  const toggleMic = async () => {
    setLoading(true)
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleMic}
      disabled={loading}
      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        isMicrophoneEnabled
          ? 'bg-gold border-gold'
          : 'bg-surface border-border hover:border-gold'
      }`}
    >
      {isMicrophoneEnabled
        ? <Mic size={20} className="text-black" />
        : <MicOff size={20} className="text-muted-foreground" />
      }
    </button>
  )
}

// ─── Listener Mic Button ──────────────────────────────────────────────────────

function ListenerMicButton({
  handRaised,
  onRaiseHand,
}: {
  handRaised: boolean
  onRaiseHand: () => void
}) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const [loading, setLoading] = useState(false)

  // Un listener promu speaker peut toggle son micro
  const canSpeak = localParticipant.permissions?.canPublish === true

  const handleClick = async () => {
    if (!canSpeak) {
      // Pas encore speaker → lever la main
      onRaiseHand()
      return
    }
    // Speaker → toggle micro
    setLoading(true)
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        isMicrophoneEnabled
          ? 'bg-gold border-gold'
          : 'bg-surface border-border hover:border-gold'
      }`}
    >
      {isMicrophoneEnabled
        ? <Mic size={20} className="text-black" />
        : <MicOff size={20} className="text-muted-foreground" />
      }
    </button>
  )
}

// ─── Room Inner ───────────────────────────────────────────────────────────────

function RoomInner({
  room,
  profile,
  userId,
  isCoach,
  dbParticipants,
  feedbacks,
  handRaised,
  onRaiseHand,
  onLeave,
}: {
  room: Room
  profile: Profile
  userId: string
  isCoach: boolean
  dbParticipants: DbParticipant[]
  feedbacks: Feedback[]
  handRaised: boolean
  onRaiseHand: () => void
  onLeave: () => void
}) {
  const supabase = createClient()
  const livekitParticipants = useParticipants()
  const [showFeedback, setShowFeedback] = useState(false)
  const [raisedHands, setRaisedHands] = useState<string[]>([])

  // ── Raised hands realtime (coach uniquement) ────────────────────────────
  useEffect(() => {
    if (!isCoach) return

    setRaisedHands(
      dbParticipants
        .filter((p) => p.hand_raised && p.role === 'listener')
        .map((p) => p.user_id)
    )

    const channel = supabase
      .channel(`hands-${room.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        const p = payload.new as any
        if (p.hand_raised) {
          setRaisedHands((prev) => [...new Set([...prev, p.user_id])])
        } else {
          setRaisedHands((prev) => prev.filter((id) => id !== p.user_id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, isCoach, dbParticipants])

  // ── Promote listener → speaker ──────────────────────────────────────────
  const promoteToSpeaker = async (participantUserId: string) => {
    await fetch('/api/livekit/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: room.livekit_room_name,
        participantIdentity: participantUserId,
        canPublish: true,
      }),
    })

    await supabase
      .from('room_participants')
      .update({ role: 'speaker', hand_raised: false })
      .eq('room_id', room.id)
      .eq('user_id', participantUserId)

    setRaisedHands((prev) => prev.filter((id) => id !== participantUserId))
  }

  const speakingIds = new Set(
    livekitParticipants.filter((p) => p.isSpeaking).map((p) => p.identity)
  )

  const speakers = dbParticipants.filter((p) => p.role === 'speaker' || p.role === 'coach')
  const listeners = dbParticipants.filter((p) => p.role === 'listener')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">

      <RemoteAudio />

      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-foreground text-base leading-tight">
            {room.title}
          </h1>
          <p className="text-gold text-xs mt-0.5">
            Coach {room.coaches?.full_name} · {dbParticipants.length} participants
          </p>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 border border-border bg-surface
                     px-4 py-2 rounded-full text-sm text-foreground
                     hover:border-destructive hover:text-destructive transition-colors"
        >
          <LogOut size={14} />
          Leave
        </button>
      </div>

      {/* ── Raised Hands (coach only) ── */}
      {isCoach && raisedHands.length > 0 && (
        <div className="px-4 mt-2 mb-2">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">
            ✋ Raised Hands
          </p>
          <div className="flex flex-col gap-2">
            {raisedHands.map((uid) => {
              const p = dbParticipants.find((x) => x.user_id === uid)
              const name = p?.profiles?.full_name ?? uid
              return (
                <div
                  key={uid}
                  className="flex items-center justify-between bg-surface border border-border px-4 py-2 rounded-xl"
                >
                  <span className="text-sm text-foreground">{name}</span>
                  <button
                    onClick={() => promoteToSpeaker(uid)}
                    className="text-xs bg-gold text-black font-bold px-3 py-1 rounded-full hover:bg-gold-dim transition"
                  >
                    Let speak
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Speakers ── */}
      <div className="px-4 mt-4">
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

      {/* ── Listeners ── */}
      <div className="px-4 mt-8">
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

      {/* ── Feedback Panel ── */}
      {showFeedback && (
        <div className="fixed inset-x-0 bottom-24 mx-4 bg-surface-elevated border border-border rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-semibold text-foreground text-sm">Live Feedback</p>
            <button onClick={() => setShowFeedback(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3 p-4 max-h-72 overflow-y-auto">
            {feedbacks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No feedback yet</p>
            ) : (
              feedbacks.map((f) => <FeedbackCard key={f.id} feedback={f} />)
            )}
          </div>
          <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-6">
            {['👏', '🔥', '🧠'].map((emoji) => (
              <button key={emoji} className="text-2xl hover:scale-125 transition-transform">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom Bar ── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface-elevated border-t border-border px-8 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">

          {/* Mic : comportement différent coach vs listener */}
          {isCoach
            ? <CoachMicButton />
            : <ListenerMicButton handRaised={handRaised} onRaiseHand={onRaiseHand} />
          }

          {/* Raise Hand (visible uniquement pour les listeners) */}
          {!isCoach && (
            <button
              onClick={onRaiseHand}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                handRaised
                  ? 'bg-gold border-gold'
                  : 'bg-surface border-border hover:border-gold'
              }`}
            >
              <Hand size={20} className={handRaised ? 'text-black' : 'text-muted-foreground'} />
            </button>
          )}

          {/* Feedback */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="relative w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center hover:border-gold transition-colors"
          >
            <MessageSquare size={20} className="text-muted-foreground" />
            {feedbacks.length > 0 && !showFeedback && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-[10px] text-black font-bold flex items-center justify-center">
                {feedbacks.length > 9 ? '9+' : feedbacks.length}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function RoomView({ room, profile, userId, isCoach }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [token, setToken] = useState<string | null>(null)
  const [dbParticipants, setDbParticipants] = useState<DbParticipant[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [handRaised, setHandRaised] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room.livekit_room_name,
          participantId: userId,
          participantName: profile.full_name ?? userId,
          role: isCoach ? 'coach' : 'listener',
        }),
      })
      const data = await res.json()
      setToken(data.token)
    }
    fetchToken()
  }, [room.livekit_room_name, userId, isCoach, profile.full_name])

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from('room_participants')
      .select('id, user_id, role, is_muted, hand_raised, profiles(full_name, avatar_url)')
      .eq('room_id', room.id)
      .is('left_at', null)
    setDbParticipants((data ?? []) as DbParticipant[])
  }, [room.id])

  useEffect(() => {
    supabase.from('room_participants').upsert({
      room_id: room.id,
      user_id: userId,
      role: isCoach ? 'coach' : 'listener',
      is_muted: true,
      hand_raised: false,
      joined_at: new Date().toISOString(),
    }, { onConflict: 'room_id,user_id' }).then(() => fetchParticipants())

    const channel = supabase
      .channel(`participants-${room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${room.id}`,
      }, () => fetchParticipants())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, userId, isCoach, fetchParticipants])

  useEffect(() => {
    supabase
      .from('live_feedbacks')
      .select('id, type, mistake, correction, explanation, created_at')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setFeedbacks(data ?? []))

    const channel = supabase
      .channel(`feedbacks-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_feedbacks',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => setFeedbacks((prev) => [payload.new as Feedback, ...prev]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id])

  const handleLeave = useCallback(async () => {
    await supabase
      .from('room_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', room.id)
      .eq('user_id', userId)
    router.push('/dashboard')
  }, [room.id, userId, router])

  const handleRaiseHand = useCallback(async () => {
    const next = !handRaised
    setHandRaised(next)
    await supabase
      .from('room_participants')
      .update({ hand_raised: next })
      .eq('room_id', room.id)
      .eq('user_id', userId)
  }, [handRaised, room.id, userId])

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      token={token}
      connect={true}
      audio={false}        // ← on gère le micro manuellement via les boutons
      video={false}
      onDisconnected={handleLeave}
    >
      <RoomInner
        room={room}
        profile={profile}
        userId={userId}
        isCoach={isCoach}
        dbParticipants={dbParticipants}
        feedbacks={feedbacks}
        handRaised={handRaised}
        onRaiseHand={handleRaiseHand}
        onLeave={handleLeave}
      />
    </LiveKitRoom>
  )
}
