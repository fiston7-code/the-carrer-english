'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
import { LogOut, Mic, MicOff, Hand, MessageSquare, X, Clock, ChevronDown } from 'lucide-react'

// ─── Types alignés sur le schema Supabase ─────────────────────────────────────

type Profile = {
  id: string                  // uuid — profiles.id
  full_name: string | null
  avatar_url: string | null
  english_level: string | null
}

type Room = {
  id: string
  title: string
  status: string
  livekit_room_name: string
  coaches: {                  // jointure depuis rooms.coach_id → coaches.id
    id: string
    full_name: string
    avatar_url: string | null
    is_verified: boolean
    user_id: string           // coaches.user_id → profiles.id du coach
  } | null
}

type DbParticipant = {
  id: string
  user_id: string             // uuid → profiles.id
  role: string                
  is_muted: boolean
  hand_raised: boolean
  profiles: {                 // jointure room_participants.user_id → profiles.id
    full_name: string | null
    avatar_url: string | null
  } | null
}

type Feedback = {
  id: string
  type: string                // 'correction' | 'tip'
  mistake: string | null
  correction: string | null
  explanation: string | null
  created_at: string
  student_id: string          // uuid → profiles.id du student
}

type Props = {
  room: Room
  profile: Profile            // profil de l'utilisateur connecté
  userId: string              // profiles.id de l'utilisateur connecté
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
  onPress,
}: {
  participant: DbParticipant
  size: 'md' | 'sm'
  speaking: boolean
  onPress?: () => void
}) {
  const name = participant.profiles?.full_name
  const avatar = participant.profiles?.avatar_url
  const dim = size === 'md' ? 72 : 52

  return (
    <button
      onClick={onPress}
      disabled={!onPress}
      className="flex flex-col items-center gap-2 disabled:cursor-default"
    >
      <div
        className={`rounded-full overflow-hidden shrink-0 ${
          speaking ? 'ring-2 ring-gold animate-speaking' : ''
        } ${onPress ? 'hover:opacity-80 transition-opacity' : ''}`}
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
            {getInitials(name ?? null)}
          </div>
        )}
      </div>
      <span className="text-xs text-foreground truncate text-center max-w-20">
        {name ?? 'Unknown'}
      </span>
      {onPress && (
        <span className="text-xs text-gold font-medium -mt-1">✏️ Feedback</span>
      )}
    </button>
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

// ─── Feedback Form (Coach → Speaker) ─────────────────────────────────────────

function FeedbackForm({
  roomId,
  coachId,
  targetUserId,
  targetName,
  onClose,
}: {
  roomId: string
  coachId: string             // coaches.id du coach connecté
  targetUserId: string        // profiles.id du speaker ciblé
  targetName: string
  onClose: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [type, setType] = useState<'correction' | 'tip'>('correction')
  const [mistake, setMistake] = useState('')
  const [correction, setCorrection] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit =
    (type === 'correction' && correction.trim().length > 0) ||
    (type === 'tip' && explanation.trim().length > 0)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const { error } = await supabase.from('live_feedbacks').insert({
        room_id:     roomId,
        student_id:  targetUserId,   // ✅ live_feedbacks.student_id (uuid)
        coach_id:    coachId,        // ✅ live_feedbacks.coach_id (uuid)
        type,
        mistake:     type === 'correction' ? mistake.trim() || null : null,
        correction:  type === 'correction' ? correction.trim() : null,
        explanation: type === 'tip'        ? explanation.trim() : null,
      })
      if (error) console.error('Feedback error:', error)
      else onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface-elevated border border-border rounded-t-2xl w-full max-w-lg p-5 pb-8">

        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-foreground text-base">Live Feedback</p>
            <p className="text-muted-foreground text-xs mt-0.5">for {targetName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs correction / tip */}
        <div className="flex gap-2 mb-4 bg-surface rounded-xl p-1">
          <button
            onClick={() => setType('correction')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              type === 'correction'
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ✗ Correction
          </button>
          <button
            onClick={() => setType('tip')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              type === 'tip'
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💡 Tip / Praise
          </button>
        </div>

        {type === 'correction' ? (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-destructive text-sm font-bold">✗</span>
              <input
                className="w-full bg-surface border border-border rounded-xl pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive/50 outline-none transition-colors"
                placeholder="What they said (optional)"
                value={mistake}
                onChange={(e) => setMistake(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-green-400 text-sm font-bold">✓</span>
              <input
                className="w-full bg-surface border border-border rounded-xl pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 outline-none transition-colors"
                placeholder="Correct version (required)"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <textarea
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 outline-none transition-colors resize-none h-24"
            placeholder="Write your tip, suggestion, or encouragement..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        )}

        {/* Quick phrases */}
        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {type === 'tip'
            ? ['Great job! 🔥', 'Keep going! 👏', 'Almost there!', 'Very natural!'].map((phrase) => (
                <button key={phrase} onClick={() => setExplanation(phrase)}
                  className="text-xs px-3 py-1 rounded-full border border-border bg-surface text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                  {phrase}
                </button>
              ))
            : ['Use "the"', 'Past tense here', 'Wrong preposition', 'Pronunciation'].map((phrase) => (
                <button key={phrase} onClick={() => setMistake(phrase)}
                  className="text-xs px-3 py-1 rounded-full border border-border bg-surface text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors">
                  {phrase}
                </button>
              ))
          }
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full bg-gold text-black font-bold py-3 rounded-xl disabled:opacity-40 transition-opacity text-sm"
        >
          {loading ? 'Sending…' : '📤 Send Feedback'}
        </button>
      </div>
    </div>
  )
}

// ─── Coach Mic Button ─────────────────────────────────────────────────────────

function CoachMicButton() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const [loading, setLoading] = useState(false)

  const toggleMic = async () => {
    setLoading(true)
    try { await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={toggleMic} disabled={loading}
      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        isMicrophoneEnabled ? 'bg-gold border-gold' : 'bg-surface border-border hover:border-gold'
      }`}>
      {isMicrophoneEnabled
        ? <Mic size={20} className="text-black" />
        : <MicOff size={20} className="text-muted-foreground" />}
    </button>
  )
}

// ─── Listener Mic Button ──────────────────────────────────────────────────────

function ListenerMicButton({ handRaised, onRaiseHand }: { handRaised: boolean; onRaiseHand: () => void }) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const [loading, setLoading] = useState(false)
  const canSpeak = localParticipant.permissions?.canPublish === true

  const handleClick = async () => {
    if (!canSpeak) { onRaiseHand(); return }
    setLoading(true)
    try { await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled) }
    finally { setLoading(false) }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors disabled:opacity-50 ${
        isMicrophoneEnabled ? 'bg-gold border-gold' : 'bg-surface border-border hover:border-gold'
      }`}>
      {isMicrophoneEnabled
        ? <Mic size={20} className="text-black" />
        : <MicOff size={20} className="text-muted-foreground" />}
    </button>
  )
}

// ─── Room Inner ───────────────────────────────────────────────────────────────

function RoomInner({
  room, profile, userId, isCoach,
  dbParticipants, feedbacks, handRaised, onRaiseHand, onLeave, refreshParticipants,
}: {
  room: Room; profile: Profile; userId: string; isCoach: boolean
  dbParticipants: DbParticipant[]; feedbacks: Feedback[]
  handRaised: boolean; onRaiseHand: () => void; onLeave: () => void
  refreshParticipants: () => Promise<void>
}) {
  const supabase = useMemo(() => createClient(), [])
  const livekitParticipants = useParticipants()
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<{ userId: string; name: string } | null>(null)

  // ✅ Source unique — dérivé directement depuis dbParticipants
  const raisedHands = dbParticipants.filter((p) => p.hand_raised && p.role === 'listener')

  // coaches.id du coach connecté (pour live_feedbacks.coach_id)
  const coachDbId = room.coaches?.id ?? ''

  // const promoteToSpeaker = async (participantUserId: string) => {
  //   await fetch('/api/livekit/promote', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ roomName: room.livekit_room_name, participantIdentity: participantUserId, canPublish: true }),
  //   })
  //   await supabase.from('room_participants')
  //     .update({ role: 'speaker', hand_raised: false })
  //     .eq('room_id', room.id)
  //     .eq('user_id', participantUserId)
  // }

  const promoteToSpeaker = async (participantUserId: string) => {
  try {
    console.log("[PROMOTE CLIENT] Starting for user:", participantUserId);

    const promoteRes = await fetch('/api/livekit/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: room.livekit_room_name,
        participantIdentity: participantUserId,
        canPublish: true,
      }),
    });

    if (!promoteRes.ok) {
      const errText = await promoteRes.text();
      throw new Error(`Promote API failed: ${promoteRes.status} - ${errText}`);
    }
    console.log("[PROMOTE CLIENT] LiveKit promote success");

    const { error: supabaseError } = await supabase
      .from('room_participants')
      .update({ role: 'speaker', hand_raised: false })
      .eq('room_id', room.id)
      .eq('user_id', participantUserId);

    if (supabaseError) {
      console.error("[PROMOTE CLIENT] Supabase role update error:", supabaseError);
      throw supabaseError;
    }
    console.log("[PROMOTE CLIENT] Supabase role updated to speaker");

    // Force refresh immédiat (optionnel mais utile pour debug)
    await refreshParticipants();
  } catch (err) {
    console.error("[PROMOTE CLIENT] Full promote failed:", err);
    // Toast error ici plus tard
  }
};

  const revokeFromSpeaker = async (participantUserId: string) => {
    await fetch('/api/livekit/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: room.livekit_room_name, participantIdentity: participantUserId, canPublish: false }),
    })
    await supabase.from('room_participants')
      .update({ role: 'listener' })
      .eq('room_id', room.id)
      .eq('user_id', participantUserId)
  }

  const speakingIds = new Set(livekitParticipants.filter((p) => p.isSpeaking).map((p) => p.identity))
const coaches = dbParticipants.filter(
  (p) => p.user_id === room.coaches?.user_id
)

const speakers = dbParticipants.filter(
  (p) =>
    p.role === 'speaker' &&
    p.user_id !== room.coaches?.user_id
)

const listeners = dbParticipants.filter(
  (p) =>
    p.role === 'listener' &&
    p.user_id !== room.coaches?.user_id
)



  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      <RemoteAudio />

      {/* FeedbackForm — coach tape sur un speaker */}
      {feedbackTarget && (
        <FeedbackForm
          roomId={room.id}
          coachId={coachDbId}
          targetUserId={feedbackTarget.userId}
          targetName={feedbackTarget.name}
          onClose={() => setFeedbackTarget(null)}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-foreground text-base leading-tight">{room.title}</h1>
          <p className="text-gold text-xs mt-0.5">
            Coach {room.coaches?.full_name} · {dbParticipants.length} participants
          </p>
        </div>
        <button onClick={onLeave}
          className="flex items-center gap-1.5 border border-border bg-surface px-4 py-2 rounded-full text-sm text-foreground hover:border-destructive hover:text-destructive transition-colors">
          <LogOut size={14} /> Leave
        </button>
      </div>

      {/* Mains levées — coach uniquement */}
      {isCoach && raisedHands.length > 0 && (
        <div className="mx-4 mt-2 mb-2 bg-gold/10 border border-gold/30 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gold/20">
            <span className="text-base">✋</span>
            <p className="text-gold text-xs font-bold tracking-widest uppercase">
              {raisedHands.length} Raised Hand{raisedHands.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col divide-y divide-gold/10">
            {raisedHands.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-xs font-bold text-gold">
                    {getInitials(p.profiles?.full_name ?? null)}
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {p.profiles?.full_name ?? 'Unknown'}
                  </span>
                </div>
                <button onClick={() => promoteToSpeaker(p.user_id)}
                  className="text-xs bg-gold text-black font-bold px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity">
                  🎤 Let speak
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach */}
      <div className="px-4 mt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">Coach</p>
        <div className="flex flex-wrap gap-6">
          {coaches.map((p) => (
            <Avatar key={p.id} participant={p} size="md" speaking={speakingIds.has(p.user_id)} />
          ))}
        </div>
      </div>

      {/* Speakers — coach tape pour corriger */}
      <div className="px-4 mt-6">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">
          Speakers
          {isCoach && speakers.length > 0 && (
            <span className="ml-2 text-gold normal-case font-normal">· tap to give feedback</span>
          )}
        </p>
        <div className="flex flex-wrap gap-6">
          {speakers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No speakers yet</p>
          ) : (
            speakers.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <Avatar
                  participant={p}
                  size="md"
                  speaking={speakingIds.has(p.user_id)}
                  onPress={isCoach
                    ? () => setFeedbackTarget({ userId: p.user_id, name: p.profiles?.full_name ?? 'Unknown' })
                    : undefined}
                />
                {isCoach && p.user_id !== userId && (
                  <button onClick={() => revokeFromSpeaker(p.user_id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5">
                    <ChevronDown size={10} /> Mute
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Listeners */}
      <div className="px-4 mt-8">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">Listeners</p>
        <div className="flex flex-wrap gap-4">
          {listeners.length === 0 ? (
            <p className="text-muted-foreground text-sm">No listeners yet</p>
          ) : (
            listeners.map((p) => (
              <div key={p.id} className="relative">
                <Avatar participant={p} size="sm" speaking={speakingIds.has(p.user_id)} />
                {p.hand_raised && (
                  <span className="absolute -top-1 -right-1 text-base leading-none">✋</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feedback Panel — student voit ses corrections */}
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
              <button key={emoji} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-surface-elevated border-t border-border px-8 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {isCoach
            ? <CoachMicButton />
            : <ListenerMicButton handRaised={handRaised} onRaiseHand={onRaiseHand} />}

          {!isCoach && (
            <button onClick={onRaiseHand}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                handRaised ? 'bg-gold border-gold' : 'bg-surface border-border hover:border-gold'
              }`}>
              <Hand size={20} className={handRaised ? 'text-black' : 'text-muted-foreground'} />
            </button>
          )}

          <button onClick={() => setShowFeedback(!showFeedback)}
            className="relative w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center hover:border-gold transition-colors">
            <MessageSquare size={20} className="text-muted-foreground" />
            {feedbacks.length > 0 && !showFeedback && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-xs text-black font-bold flex items-center justify-center">
                {feedbacks.length > 9 ? '9+' : feedbacks.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


export default function RoomView({ room, profile, userId, isCoach }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [token, setToken] = useState<string | null>(null)
  const [dbParticipants, setDbParticipants] = useState<DbParticipant[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  const handRaised = useMemo(
    () => dbParticipants.find((p) => p.user_id === userId)?.hand_raised ?? false,
    [dbParticipants, userId]
  )

  // 1. Token
  useEffect(() => {
    fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: room.livekit_room_name,
        participantId: userId,
        participantName: profile.full_name ?? userId,
        role: room.coaches?.user_id === userId ? 'coach' : 'listener',
      }),
    }).then(r => r.json()).then(d => setToken(d.token))
  }, [room.livekit_room_name, userId, profile.full_name, room.coaches])

  // 2. fetchParticipants en DEUX TEMPS (jointure ne marche pas sur mobile)
  const fetchParticipants = useCallback(async () => {
    const { data: parts, error } = await supabase
      .from('room_participants')
      .select('id, user_id, role, is_muted, hand_raised')
      .eq('room_id', room.id)
      .is('left_at', null)

    if (error) { console.error('fetchParticipants error:', error); return }
    if (!parts || parts.length === 0) { setDbParticipants([]); return }

    const userIds = parts.map(p => p.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const merged = parts.map(p => ({
      ...p,
      profiles: profiles?.find(pr => pr.id === p.user_id) ?? null,
    }))

    setDbParticipants(merged as unknown as DbParticipant[])
  }, [room.id, supabase])

  // 3. Upsert + realtime + POLLING mobile (toutes les 5s)
  useEffect(() => {
    // ✅ Rôle correct
    supabase.from('room_participants').upsert({
      room_id:     room.id,
      user_id:     userId,
      role:        isCoach ? 'speaker' : 'listener',  // ← BUG CORRIGÉ
      is_muted:    true,
      hand_raised: false,
      joined_at:   new Date().toISOString(),
      left_at:     null,
    }, { onConflict: 'room_id,user_id' }).then(() => fetchParticipants())

    // Realtime WebSocket
    const channel = supabase
      .channel(`participants-${room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${room.id}`,
      }, () => fetchParticipants())
      .subscribe()

    // ✅ Polling fallback pour mobile (WebSocket mort en background)
    const poll = setInterval(fetchParticipants, 5000)

    // ✅ Reconnexion quand l'app revient au premier plan
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchParticipants()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [room.id, userId, isCoach, fetchParticipants, supabase])

  // 4. Feedbacks
  useEffect(() => {
    let query = supabase
      .from('live_feedbacks')
      .select('id, type, mistake, correction, explanation, created_at, student_id')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!isCoach) query = query.eq('student_id', userId)
    query.then(({ data }) => setFeedbacks(data ?? []))

    const channel = supabase
      .channel(`feedbacks-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_feedbacks',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => setFeedbacks(prev => [payload.new as Feedback, ...prev]))
      .subscribe()

    // Polling feedbacks aussi
    const poll = setInterval(() => {
      let q = supabase
        .from('live_feedbacks')
        .select('id, type, mistake, correction, explanation, created_at, student_id')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!isCoach) q = q.eq('student_id', userId)
      q.then(({ data }) => setFeedbacks(data ?? []))
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [room.id, userId, isCoach, supabase])

  // Beforeunload
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon('/api/livekit/leave', JSON.stringify({ roomId: room.id, userId }))
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [room.id, userId])

  const handleLeave = useCallback(async () => {
    await supabase
      .from('room_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', room.id)
      .eq('user_id', userId)
    router.push('/dashboard')
  }, [room.id, userId, router, supabase])

  const handleRaiseHand = useCallback(async () => {
    const next = !handRaised
    await supabase
      .from('room_participants')
      .update({ hand_raised: next })
      .eq('room_id', room.id)
      .eq('user_id', userId)
  }, [handRaised, room.id, userId, supabase])

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
      audio={false}
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
        refreshParticipants={fetchParticipants}
      />
    </LiveKitRoom>
  )
}



// export default function RoomView({ room, profile, userId, isCoach }: Props) {
//   const router = useRouter()
//   const supabase = useMemo(() => createClient(), [])

//   const [token, setToken] = useState<string | null>(null)
//   const [dbParticipants, setDbParticipants] = useState<DbParticipant[]>([])
//   const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

//   const handRaised = useMemo(
//     () => dbParticipants.find((p) => p.user_id === userId)?.hand_raised ?? false,
//     [dbParticipants, userId],
//   )

//   // 1. Token LiveKit
//   useEffect(() => {
//     const fetchToken = async () => {
//       const res = await fetch('/api/livekit/token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           roomName: room.livekit_room_name,
//           participantId: userId,
//           participantName: profile.full_name ?? userId,
//          role: room.coaches?.user_id === userId ? 'coach' : 'listener'
//         }),
//       })
//       const data = await res.json()
//       setToken(data.token)
//     }
//     fetchToken()
//   }, [room.livekit_room_name, userId, isCoach, profile.full_name, room.coaches])



//   const fetchParticipants = useCallback(async () => {
//   const { data, error } = await supabase
//     .from('room_participants')
//     .select(`
//       id, 
//       user_id, 
//       role, 
//       is_muted, 
//       hand_raised, 
//       profiles (
//         full_name, 
//         avatar_url
//       )
//     `)
//     .eq('room_id', room.id)
//     .is('left_at', null);

//   if (error) {
//     // Si l'erreur est encore {}, c'est que l'objet est complexe. 
//     // On le transforme en string pour tout voir.
//     console.error("❌ Erreur de fetch détaillée :", JSON.stringify(error, null, 2));
//     return;
//   }

  

//   setDbParticipants(data as unknown as DbParticipant[]);
// }, [room.id, supabase]);


//     useEffect(() => {
//   const handleUnload = () => {
//     // navigator.sendBeacon est fiable même pendant fermeture d'onglet
//     navigator.sendBeacon(
//       '/api/livekit/leave',
//       JSON.stringify({ roomId: room.id, userId })
//     )
//   }

//   window.addEventListener('beforeunload', handleUnload)
//   return () => window.removeEventListener('beforeunload', handleUnload)
// }, [room.id, userId])

//   // 3. Upsert + realtime — après fetchParticipants
//   useEffect(() => {

    
//     supabase.from('room_participants').upsert({
//       room_id:     room.id,
//       user_id:     userId,
//      role: isCoach ? 'speaker' : 'listener',
//       is_muted:    true,
//       hand_raised: false,
//       joined_at:   new Date().toISOString(),
//       left_at:     null,
//     }, { onConflict: 'room_id,user_id' }).then(() => fetchParticipants())

//     const channel = supabase
//       .channel(`participants-${room.id}`)
//       .on('postgres_changes', {
//         event: '*',
//         schema: 'public',
//         table: 'room_participants',
//         filter: `room_id=eq.${room.id}`,
//       }, () => fetchParticipants())
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [room.id, userId, isCoach, fetchParticipants, supabase])

//   // 4. Feedbacks
//   useEffect(() => {
//     let query = supabase
//       .from('live_feedbacks')
//       .select('id, type, mistake, correction, explanation, created_at, student_id')
//       .eq('room_id', room.id)
//       .order('created_at', { ascending: false })
//       .limit(20);

//     if (!isCoach) {
//       query = query.eq('student_id', userId);
//     }

//     query.then(({ data }) => setFeedbacks(data ?? []));

//     const channel = supabase
//       .channel(`feedbacks-${room.id}`)
//       .on('postgres_changes', {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'live_feedbacks',
//         filter: `room_id=eq.${room.id}`,
//       }, (payload) => setFeedbacks((prev) => [payload.new as Feedback, ...prev]))
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [room.id, userId, isCoach, supabase])

//   const handleLeave = useCallback(async () => {
//     await supabase
//       .from('room_participants')
//       .update({ left_at: new Date().toISOString() })
//       .eq('room_id', room.id)
//       .eq('user_id', userId)
//     router.push('/dashboard')
//   }, [room.id, userId, router, supabase])

//   // const handleRaiseHand = useCallback(async () => {
//   //   const next = !handRaised
//   //   setHandRaised(next)
//   //   await supabase
//   //     .from('room_participants')
//   //     .update({ hand_raised: next })
//   //     .eq('room_id', room.id)
//   //     .eq('user_id', userId)
//   // }, [handRaised, room.id, userId, supabase])

// const handleRaiseHand = useCallback(async () => {
//   const next = !handRaised
//   console.log("→ Tentative raise hand →", next, "user:", userId)

//   const { error } = await supabase
//     .from('room_participants')
//     .update({ hand_raised: next })
//     .eq('room_id', room.id)
//     .eq('user_id', userId)

//   if (error) {
//     console.error("RAISE HAND ERROR:", error)
//   } else {
//     console.log("Hand raised mis à jour OK")
//   }
// }, [handRaised, room.id, userId, supabase])
//   if (!token) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <LiveKitRoom
//       serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
//       token={token}
//       connect={true}
//       audio={false}
//       video={false}
//       onDisconnected={handleLeave}
//     >
//       <RoomInner
//         room={room}
//         profile={profile}
//         userId={userId}
//         isCoach={isCoach}
//         dbParticipants={dbParticipants}
//         feedbacks={feedbacks}
//         handRaised={handRaised}
//         onRaiseHand={handleRaiseHand}
//         onLeave={handleLeave}
//         refreshParticipants={fetchParticipants}
//       />
//     </LiveKitRoom>
//   )
// }





