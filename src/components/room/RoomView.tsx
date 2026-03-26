'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  RoomAudioRenderer,
  useAudioPlayback
} from '@livekit/components-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { LogOut, Mic, MicOff, Hand, MessageSquare, X, Clock } from 'lucide-react'
import InviteShareButton from './InviteShareButton'

// --- Types ---
type Profile = { id: string; full_name: string | null; avatar_url: string | null; english_level: string | null }
type Room = { id: string; title: string; status: string; livekit_room_name: string; invite_code: string | null; coaches: { id: string; full_name: string; avatar_url: string | null; is_verified: boolean; user_id: string; } | null }
type DbParticipant = { id: string; user_id: string; role: string; is_muted: boolean; hand_raised: boolean; profiles: { full_name: string | null; avatar_url: string | null } | null }
type Feedback = { id: string; type: string; mistake: string | null; correction: string | null; explanation: string | null; created_at: string; student_id: string }
type Props = { room: Room; profile: Profile; userId: string; isCoach: boolean }

// --- Helpers ---
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

// --- Components ---
function Avatar({ participant, size, speaking, onPress }: { participant: DbParticipant; size: 'md' | 'sm'; speaking: boolean; onPress?: () => void }) {
  const name = participant.profiles?.full_name
  const avatar = participant.profiles?.avatar_url
  const dim = size === 'md' ? 72 : 52
  return (
    <button onClick={onPress} disabled={!onPress} className="flex flex-col items-center gap-2 disabled:cursor-default">
      <div className={`rounded-full overflow-hidden shrink-0 transition-all ${speaking ?  'ring-2 ring-gold animate-speaking animate-pulse' : 'ring-2 ring-border'} ${onPress ? 'hover:opacity-80' : ''}`} style={{ width: dim, height: dim }}>
        {avatar ? (
          <Image src={avatar} alt={name ?? ''} width={dim} height={dim} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-gold font-bold" style={{ fontSize: size === 'md' ? 18 : 13 }}>
            {getInitials(name ?? null)}
          </div>
        )}
      </div>
      <span className="text-xs text-foreground truncate text-center max-w-[80px]">{name ?? 'Unknown'}</span>
    </button>
  )
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const isCorrection = feedback.type === 'correction'
  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col gap-1.5 border border-border">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {isCorrection ? <Clock size={12} className="text-destructive" /> : <span className="text-sm">💡</span>}
        <span>{timeAgo(feedback.created_at)}</span>
      </div>
      {isCorrection && feedback.mistake && <p className="text-destructive text-sm line-through">✗ {feedback.mistake}</p>}
      {isCorrection && feedback.correction && <p className="text-foreground text-sm font-medium">✓ {feedback.correction}</p>}
      {!isCorrection && feedback.explanation && <p className="text-foreground text-sm italic">{feedback.explanation}</p>}
    </div>
  )
}

function FeedbackForm({ roomId, coachId, targetUserId, targetName, onClose }: { roomId: string; coachId: string; targetUserId: string; targetName: string; onClose: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [type, setType] = useState<'correction' | 'tip'>('correction')
  const [mistake, setMistake] = useState('')
  const [correction, setCorrection] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = (type === 'correction' && correction.trim().length > 0) || (type === 'tip' && explanation.trim().length > 0)


  const handleSubmit = async () => {
  if (!canSubmit) return
  setLoading(true)
  
  // On prépare l'objet proprement
  const feedbackData = {
    room_id: roomId,
    student_id: targetUserId,
    coach_id: coachId,
    type: type, // Sera 'correction' ou 'tip'
    // On n'envoie les fautes que si c'est une correction
    mistake: type === 'correction' ? (mistake.trim() || null) : null,
    correction: type === 'correction' ? (correction.trim() || null) : null,
    // On garde l'explication DANS TOUS LES CAS (très important !)
    explanation: explanation.trim() || null,
  }

  try {
    const { error } = await supabase.from('live_feedbacks').insert(feedbackData)
    
    if (error) {
      console.error("Erreur d'insertion :", error.message)
      alert("Erreur : " + error.message) // Pour voir l'erreur en direct sur ton écran
    } else {
      onClose()
      // Optionnel : un petit refresh manuel si le realtime est lent
    }
  } finally {
    setLoading(false)
  }
}

  const QUICK_TIPS = ['Please let others finish 🤫', 'Lower your voice 🔉', 'Wait your turn 👍', 'Speak up please 🔊', 'Great job! 🔥', 'Keep going! 👏']
  const QUICK_CORRECTIONS = ['Use "the"', 'Past tense here', 'Wrong preposition', 'Pronunciation']

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-elevated border border-border rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in slide-in-from-bottom">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-lg text-foreground">Feedback for {targetName}</p>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-4 bg-surface rounded-xl p-1">
          <button onClick={() => setType('correction')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'correction' ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'text-muted-foreground'}`}>✗ Correction</button>
          <button onClick={() => setType('tip')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'tip' ? 'bg-gold/20 text-gold border border-gold/30' : 'text-muted-foreground'}`}>💡 Message</button>
        </div>

        {type === 'correction' ? (
          <div className="space-y-3">
            <input className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-destructive/50 outline-none" placeholder="What they said..." value={mistake} onChange={(e) => setMistake(e.target.value)} />
            <input className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none" placeholder="Correct version (required)" value={correction} onChange={(e) => setCorrection(e.target.value)} />
          </div>
        ) : (
          <textarea className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none h-24 resize-none" placeholder="Tip or instruction..." value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        )}

        <div className="flex flex-wrap gap-2 mt-4 mb-6">
          {(type === 'tip' ? QUICK_TIPS : QUICK_CORRECTIONS).map((phrase) => (
            <button key={phrase} onClick={() => type === 'tip' ? setExplanation(phrase) : setMistake(phrase)} className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-surface hover:border-gold/50 transition-colors uppercase tracking-wider">{phrase}</button>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit || loading} className="w-full bg-gold text-black font-black py-4 rounded-xl disabled:opacity-30 uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-all">
          {loading ? 'Sending...' : 'Send Live Feedback'}
        </button>
      </div>
    </div>
  )
}

function MicButton({ isEnabled, loading, onClick, canSpeak }: { isEnabled: boolean; loading: boolean; onClick: () => void; canSpeak: boolean }) {
  return (
    <button 
      onClick={onClick} 
      disabled={loading || !canSpeak} 
      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-xl active:scale-90 ${isEnabled ? 'bg-gold border-gold' : 'bg-surface border-border'} ${!canSpeak ? 'opacity-20 grayscale' : ''}`}
    >
      {isEnabled ? <Mic size={24} className="text-black" /> : <MicOff size={24} className={canSpeak ? 'text-gold' : 'text-muted-foreground'} />}
    </button>
  )
}

// --- Main Room Logic ---
function RoomInner({ room, profile, userId, isCoach, dbParticipants, feedbacks, handRaised, onRaiseHand, onLeave, refreshParticipants, myRole }: {
  room: Room; profile: Profile; userId: string; isCoach: boolean
  dbParticipants: DbParticipant[]; feedbacks: Feedback[]
  handRaised: boolean; onRaiseHand: () => void; onLeave: () => void
  refreshParticipants: () => Promise<void>; myRole: string
}) {
  const supabase = useMemo(() => createClient(), [])
  const livekitParticipants = useParticipants()
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const roomContext = useRoomContext()
  const { startAudio, canPlayAudio } = useAudioPlayback(roomContext)
  
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<{ userId: string; name: string } | null>(null)
  const [micLoading, setMicLoading] = useState(false)

  const speakingIds = new Set(livekitParticipants.filter((p) => p.isSpeaking).map((p) => p.identity))
  const raisedHands = dbParticipants.filter((p) => p.hand_raised && p.role === 'listener')
  
  // ✅ Correction Logique : Double source de vérité pour le micro
  const canPublish = myRole === 'speaker' || isCoach || localParticipant.permissions?.canPublish === true

  const handleMicToggle = async () => {
    if (!canPublish) return
    setMicLoading(true)
    try {
      if (!canPlayAudio) await startAudio()
      await roomContext.startAudio()
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } catch (err) {
      console.error('Mic error:', err)
    } finally {
      setMicLoading(false)
    }
  }

  const promoteToSpeaker = async (participantUserId: string) => {
    try {
      const res = await fetch('/api/livekit/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: room.livekit_room_name, participantIdentity: participantUserId, canPublish: true }),
      })
      if (!res.ok) throw new Error(`Promote failed`)
      
      // ✅ Mise à jour DB obligatoire pour déclencher le re-fetch du token chez l'autre
      await supabase.from('room_participants').update({ role: 'speaker', hand_raised: false }).eq('room_id', room.id).eq('user_id', participantUserId)
      await refreshParticipants()
    } catch (err) { console.error('Promotion error:', err) }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-32">
      <RoomAudioRenderer />

      {feedbackTarget && (
        <FeedbackForm roomId={room.id} coachId={room.coaches?.id ?? ''} targetUserId={feedbackTarget.userId} targetName={feedbackTarget.name} onClose={() => setFeedbackTarget(null)} />
      )}

      {/* App Bar */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-border/50">
        <div>
          <h1 className="font-black text-xl tracking-tight uppercase">{room.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {/* <p className="text-gold text-[10px] font-bold tracking-widest uppercase">Live with Coach {room.coaches?.full_name}</p> */}
            Coach {room.coaches?.full_name} · {dbParticipants.length} participants
          </div>
        </div>
        <button onClick={onLeave} className="p-3 bg-surface border border-border rounded-full text-destructive active:scale-90 transition-all">
          <LogOut size={18} />
        </button>
      </div>

      {isCoach && room.invite_code && (
  <div className="px-6 mt-4">
    <InviteShareButton
      inviteCode={room.invite_code}
      roomTitle={room.title}
    />
  </div>
)}

      {/* Raised Hands Overlay (Coach only) */}
      {isCoach && raisedHands.length > 0 && (
        <div className="mx-6 mt-6 p-4 bg-gold/5 border border-gold/20 rounded-2xl animate-in fade-in zoom-in-95">
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Hand size={12} /> Waiting to speak ({raisedHands.length})
          </p>
          <div className="space-y-3">
            {raisedHands.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between bg-surface/50 p-2 pl-3 rounded-xl border border-border/50">
                <span className="text-sm font-bold">{p.profiles?.full_name}</span>
                <button onClick={() => promoteToSpeaker(p.user_id)} className="bg-gold text-black text-[10px] font-black px-4 py-2 rounded-lg uppercase">🎤 Allow</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Participants */}
      <div className="px-6 mt-8 flex-1">
        <div className="grid grid-cols-3 gap-y-8 gap-x-4">
          {/* Coach Always First */}
          {dbParticipants.filter(p => p.user_id === room.coaches?.user_id).map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <Avatar participant={p} size="md" speaking={speakingIds.has(p.user_id)} />
              <span className="text-[10px] font-black text-gold border border-gold/30 px-2 py-0.5 rounded uppercase tracking-tighter">COACH</span>
            </div>
          ))}
         
          {dbParticipants.filter(p => p.user_id !== room.coaches?.user_id).map(p => (
  <div key={p.id} className="flex flex-col items-center">
    {/* Conteneur relatif pour l'avatar uniquement */}
    <div className="relative">
      <Avatar 
        participant={p} 
        size="md" 
        speaking={speakingIds.has(p.user_id)} 
        onPress={isCoach ? () => setFeedbackTarget({ userId: p.user_id, name: p.profiles?.full_name ?? 'Unknown' }) : undefined}
      />
      
      {/* Badge Main Levée - Positionné par rapport à l'Avatar */}
      {p.hand_raised && (
        <div className="absolute -top-1 -right-1 bg-gold p-1.5 rounded-full border-2 border-background shadow-lg z-10 animate-bounce">
          <Hand size={12} className="text-black" />
        </div>
      )}

      {/* Badge Speaker - Positionné par rapport à l'Avatar */}
      {p.role === 'speaker' && (
        <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full border-2 border-background shadow-lg z-10">
          <Mic size={10} className="text-white" />
        </div>
      )}
    </div>
  </div>
))}
        </div>
      </div>

      {/* Feedback Sidebar/Panel */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]" onClick={() => setShowFeedback(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-elevated border-l border-border shadow-2xl animate-in slide-in-from-right p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-lg uppercase">Feedbacks</h2>
              <button onClick={() => setShowFeedback(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {feedbacks.length === 0 ? <p className="text-muted-foreground text-center py-10 italic">No live corrections yet.</p> : feedbacks.map(f => <FeedbackCard key={f.id} feedback={f} />)}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="fixed bottom-0 inset-x-0 p-6">
        <div className="max-w-md mx-auto bg-surface-elevated/80 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl">
          <button onClick={onRaiseHand} className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${handRaised ? 'bg-gold border-gold rotate-12 shadow-lg shadow-gold/20' : 'bg-surface border-border hover:border-gold/50'}`}>
            <Hand size={24} className={handRaised ? 'text-black' : 'text-muted-foreground'} />
          </button>
          
          <MicButton isEnabled={isMicrophoneEnabled} loading={micLoading} onClick={handleMicToggle} canSpeak={canPublish} />

          <button onClick={() => setShowFeedback(true)} className="relative w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center hover:border-gold/50 transition-all">
            <MessageSquare size={24} className="text-muted-foreground" />
            {feedbacks.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-destructive rounded-full text-[10px] text-white font-black flex items-center justify-center border-2 border-background">
                {feedbacks.length}
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
  
  const lastFetchedRole = useRef<string | null>(null)

  // Trouver mon état actuel dans la liste des participants
  const myParticipant = useMemo(() => 
    dbParticipants.find((p) => p.user_id === userId), 
    [dbParticipants, userId]
  )

  // Déterminer le rôle : Priorité au rôle en DB, sinon rôle par défaut
  const myRole = myParticipant?.role ?? (isCoach ? 'coach' : 'listener')
  const handRaised = myParticipant?.hand_raised ?? false

  // 1. Récupération des participants (avec filtre anti-fantôme)
  const fetchParticipants = useCallback(async () => {
    const threshold = new Date(Date.now() - 120000).toISOString() // 120s de tolérance

    // On récupère ceux qui sont là ET qui ont donné signe de vie récemment
    const { data: parts } = await supabase
      .from('room_participants')
      .select('*, profiles(full_name, avatar_url)') // Jointure directe si possible
      .eq('room_id', room.id)
      .is('left_at', null)
      .gt('last_seen_at', threshold) 

    if (parts) {
      setDbParticipants(parts as unknown as DbParticipant[])
    }
  }, [room.id, supabase])

  // 2. Heartbeat (Le "Pro" Pulse) : Met à jour last_seen_at et synchronise le rôle
  useEffect(() => {
    if (!userId || !room.id) return
    
    const pulse = async () => {
      if (document.visibilityState !== 'visible') return
      
      await supabase
        .from('room_participants')
        .update({ 
          last_seen_at: new Date().toISOString(), 
          role: myRole 
        })
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .is('left_at', null)
    }

    const interval = setInterval(pulse, 30000) // Toutes les 30s
    pulse()
    
    return () => clearInterval(interval)
  }, [userId, room.id, myRole, supabase])

  // 3. Logique du Token : Re-fetch uniquement si le rôle change
  useEffect(() => {
    if (lastFetchedRole.current === myRole && token) return
    
    fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        roomName: room.livekit_room_name, 
        participantId: userId, 
        participantName: profile?.full_name ?? userId, 
        role: myRole 
      }),
    })
    .then(r => r.json())
    .then(d => {
      setToken(d.token)
      lastFetchedRole.current = myRole
    })
  }, [myRole, room.livekit_room_name, userId, profile?.full_name, token])

  // 4. Inscription initiale et Realtime
  useEffect(() => {
    // Inscription à l'entrée
    const enterRoom = async () => {
      await supabase.from('room_participants').upsert({
        room_id: room.id, 
        user_id: userId,
        role: isCoach ? 'coach' : myRole,
        joined_at: new Date().toISOString(), 
        left_at: null,
        last_seen_at: new Date().toISOString()
      }, { onConflict: 'room_id,user_id' })
      
      fetchParticipants()
    }

    enterRoom()

    const channel = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'room_participants', 
        filter: `room_id=eq.${room.id}` 
      }, () => fetchParticipants())
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_feedbacks', 
        filter: `room_id=eq.${room.id}` 
      }, (payload) => setFeedbacks(prev => [payload.new as Feedback, ...prev]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, userId, isCoach, fetchParticipants, supabase])


  const handleLeave = useCallback(async () => {
  // 1. Récupérer joined_at pour calculer la durée
  const { data: participation } = await supabase
    .from('room_participants')
    .select('joined_at')
    .eq('room_id', room.id)
    .eq('user_id', userId)
    .is('left_at', null)
    .single()

  const now = new Date()
  const joinedAt = participation?.joined_at ? new Date(participation.joined_at) : now
  const durationMinutes = Math.max(1, Math.floor((now.getTime() - joinedAt.getTime()) / 60000))

  // 2. Compter les feedbacks reçus dans cette session
  const { data: sessionFeedbacks } = await supabase
    .from('live_feedbacks')
    .select('type')
    .eq('room_id', room.id)
    .eq('student_id', userId)

  const correctionsCount = sessionFeedbacks?.filter(f => f.type === 'correction').length ?? 0
  const tipsCount = sessionFeedbacks?.filter(f => f.type === 'tip').length ?? 0

  // 3. Marquer la sortie
  await supabase
    .from('room_participants')
    .update({ left_at: now.toISOString() })
    .eq('room_id', room.id)
    .eq('user_id', userId)

  // 4. Créer le session report (seulement si participation > 0 min)
  if (!isCoach && durationMinutes > 0) {
    await supabase.from('session_reports').insert({
      room_id: room.id,
      user_id: userId,
      coach_id: room.coaches?.id ?? null,
      duration_minutes: durationMinutes,
      corrections_count: correctionsCount,
      tips_count: tipsCount,
    })

    // 5. Incrémenter total_minutes_practiced sur le profil
    await supabase.rpc('increment_minutes', { 
      user_id_input: userId, 
      minutes_to_add: durationMinutes 
    })
  }

  router.push('/dashboard')
}, [room.id, room.coaches?.id, userId, isCoach, router, supabase])

  const handleRaiseHand = useCallback(async () => {
    await supabase
      .from('room_participants')
      .update({ hand_raised: !handRaised })
      .eq('room_id', room.id)
      .eq('user_id', userId)
  }, [handRaised, room.id, userId, supabase])

  if (!token) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black tracking-widest uppercase text-gold">Entering Classroom...</p>
    </div>
  )

  return (
    <LiveKitRoom 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      token={token} 
      connect 
      audio 
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
        myRole={myRole}
      />
    </LiveKitRoom>
  )
}
