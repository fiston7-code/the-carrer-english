// src/app/rooms/[id]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import RoomView from "@/components/room/RoomView";

type Props = { params: Promise<{ id: string }> };

export default async function RoomPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient(); // ← await obligatoire

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: room }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, english_level")
      .eq("id", user.id)
      .single(),
    supabase
      .from("rooms")
      .select(`
        *,
        coaches (
          id,
          full_name,
          avatar_url,
          is_verified,
          specialty,
          user_id
        )
      `)
      .eq("id", id)
      .single(),
  ]);

  if (!room) notFound();

  const isCoach = room.coaches?.user_id === user.id;

  return (
    <RoomView
      room={room}
      profile={profile!}
      userId={user.id}
      isCoach={isCoach}
    />
  );
}
// 'use client'

// import { useEffect, useState, useRef } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import Image from 'next/image'
// import { LogOut, MicOff, Hand, MessageSquare, X, Clock } from 'lucide-react'

// // ─── Types ────────────────────────────────────────────────────────────────────

// type Participant = {
//   id: string
//   user_id: string
//   role: string
//   is_muted: boolean
//   hand_raised: boolean
//   profile: {
//     full_name: string | null
//     avatar_url: string | null
//   } | null
// }

// type Feedback = {
//   id: string
//   type: string
//   mistake: string | null
//   correction: string | null
//   explanation: string | null
//   created_at: string
// }

// type Room = {
//   id: string
//   title: string
//   status: string
//   coaches: {
//     full_name: string
//     avatar_url: string | null
//   } | null
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function getInitials(name: string | null) {
//   if (!name) return '?'
//   return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
// }

// function timeAgo(dateStr: string) {
//   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
//   if (diff < 60) return `${diff}s ago`
//   if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
//   return `${Math.floor(diff / 3600)}h ago`
// }

// // ─── Avatar ───────────────────────────────────────────────────────────────────

// function ParticipantAvatar({
//   participant,
//   size = 'md',
//   speaking = false,
// }: {
//   participant: Participant
//   size?: 'sm' | 'md'
//   speaking?: boolean
// }) {
//   const name = participant.profile?.full_name
//   const avatar = participant.profile?.avatar_url
//   const dim = size === 'md' ? 72 : 52

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <div
//         className={`rounded-full overflow-hidden shrink-0 ${
//           speaking ? 'animate-speaking ring-2 ring-gold' : ''
//         }`}
//         style={{ width: dim, height: dim }}
//       >
//         {avatar ? (
//           <Image
//             src={avatar}
//             alt={name ?? ''}
//             width={dim}
//             height={dim}
//             className="object-cover w-full h-full"
//           />
//         ) : (
//           <div
//             className="w-full h-full flex items-center justify-center bg-surface-elevated text-gold font-bold"
//             style={{ fontSize: size === 'md' ? 18 : 13 }}
//           >
//             {getInitials(name)}
//           </div>
//         )}
//       </div>
//       <span className="text-xs text-foreground text-center truncate max-w-[80px]">
//         {name ?? 'Unknown'}
//       </span>
//     </div>
//   )
// }

// // ─── Feedback Card ────────────────────────────────────────────────────────────

// function FeedbackCard({ feedback }: { feedback: Feedback }) {
//   const isCorrection = feedback.type === 'correction'
//   const isTip = feedback.type === 'tip' || feedback.type === 'vocabulary'

//   return (
//     <div className="bg-surface rounded-xl p-4 flex flex-col gap-1.5 border border-border">
//       <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
//         {isCorrection ? (
//           <Clock size={12} className="text-destructive" />
//         ) : (
//           <span className="text-sm">💡</span>
//         )}
//         <span>{timeAgo(feedback.created_at)}</span>
//       </div>

//       {isCorrection && feedback.mistake && (
//         <p className="text-destructive text-sm line-through">
//           ✗ {feedback.mistake}
//         </p>
//       )}
//       {isCorrection && feedback.correction && (
//         <p className="text-foreground text-sm">
//           ✓ {feedback.correction}
//         </p>
//       )}
//       {isTip && feedback.explanation && (
//         <p className="text-foreground text-sm">{feedback.explanation}</p>
//       )}
//     </div>
//   )
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function RoomPage() {
//   const params = useParams()
//   const router = useRouter()
//   const roomId = params.id as string
//   const supabase = createClient()

//   const [room, setRoom] = useState<Room | null>(null)
//   const [participants, setParticipants] = useState<Participant[]>([])
//   const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
//   const [showFeedback, setShowFeedback] = useState(false)
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)

//   // ── Fetch room ──────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) { router.push('/auth/login'); return }
//       setCurrentUserId(user.id)

//       // Room info
//       const { data: roomData } = await supabase
//         .from('rooms')
//         .select(`
//           id, title, status,
//           coaches ( full_name, avatar_url )
//         `)
//         .eq('id', roomId)
//         .single()

//       setRoom(roomData)

//       // Participants avec profils
//       await fetchParticipants()

//       // Feedbacks
//       await fetchFeedbacks()

//       // Insert user dans room_participants
//       await supabase
//         .from('room_participants')
//         .upsert({
//           room_id: roomId,
//           user_id: user.id,
//           role: 'listener',
//           is_muted: true,
//           hand_raised: false,
//           joined_at: new Date().toISOString(),
//         }, { onConflict: 'room_id,user_id' })

//       setLoading(false)
//     }
//     init()
//   }, [roomId])

//   const fetchParticipants = async () => {
//     const { data } = await supabase
//       .from('room_participants')
//       .select(`
//         id, user_id, role, is_muted, hand_raised,
//         profiles ( full_name, avatar_url )
//       `)
//       .eq('room_id', roomId)
//       .is('left_at', null)

//     setParticipants((data ?? []).map((p: any) => ({
//       ...p,
//       profile: p.profiles ?? null,
//     })))
//   }

//   const fetchFeedbacks = async () => {
//     const { data } = await supabase
//       .from('live_feedbacks')
//       .select('id, type, mistake, correction, explanation, created_at')
//       .eq('room_id', roomId)
//       .order('created_at', { ascending: false })
//       .limit(20)

//     setFeedbacks(data ?? [])
//   }

//   // ── Realtime ────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const channel = supabase
//       .channel(`room-${roomId}`)
//       .on('postgres_changes',
//         { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
//         () => fetchParticipants()
//       )
//       .on('postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'live_feedbacks', filter: `room_id=eq.${roomId}` },
//         (payload) => {
//           setFeedbacks((prev) => [payload.new as Feedback, ...prev])
//           setShowFeedback(true)   // ouvre auto quand nouveau feedback
//         }
//       )
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [roomId])

//   // ── Leave room ──────────────────────────────────────────────────────────────
//   const handleLeave = async () => {
//     if (!currentUserId) return
//     await supabase
//       .from('room_participants')
//       .update({ left_at: new Date().toISOString() })
//       .eq('room_id', roomId)
//       .eq('user_id', currentUserId)
//     router.push('/dashboard')
//   }

//   // ── Raise hand ──────────────────────────────────────────────────────────────
//   const handleRaiseHand = async () => {
//     if (!currentUserId) return
//     const me = participants.find((p) => p.user_id === currentUserId)
//     if (!me) return
//     await supabase
//       .from('room_participants')
//       .update({ hand_raised: !me.hand_raised })
//       .eq('room_id', roomId)
//       .eq('user_id', currentUserId)
//   }

//   const speakers = participants.filter((p) => p.role === 'speaker' || p.role === 'coach')
//   const listeners = participants.filter((p) => p.role === 'listener')
//   const me = participants.find((p) => p.user_id === currentUserId)
//   const handRaised = me?.hand_raised ?? false
//   const newFeedbackCount = feedbacks.length

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background text-foreground flex flex-col">

//       {/* ── Header ─────────────────────────────────────────────────────────── */}
//       <div className="px-4 pt-6 pb-4 flex items-start justify-between">
//         <div>
//           <h1 className="font-bold text-foreground text-base leading-tight">
//             {room?.title}
//           </h1>
//           <p className="text-gold text-xs mt-0.5">
//             Coach {room?.coaches?.full_name} · {participants.length} participants
//           </p>
//         </div>
//         <button
//           onClick={handleLeave}
//           className="flex items-center gap-1.5 border border-border bg-surface px-4 py-2 rounded-full text-sm text-foreground hover:border-destructive hover:text-destructive transition-colors"
//         >
//           <LogOut size={14} />
//           Leave
//         </button>
//       </div>

//       {/* ── Speakers ───────────────────────────────────────────────────────── */}
//       <div className="px-4 mt-2">
//         <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">
//           Speakers
//         </p>
//         <div className="flex flex-wrap gap-6">
//           {speakers.length === 0 ? (
//             <p className="text-muted-foreground text-sm">No speakers yet</p>
//           ) : (
//             speakers.map((p) => (
//               <ParticipantAvatar
//                 key={p.id}
//                 participant={p}
//                 size="md"
//                 speaking={!p.is_muted}
//               />
//             ))
//           )}
//         </div>
//       </div>

//       {/* ── Listeners ──────────────────────────────────────────────────────── */}
//       <div className="px-4 mt-8">
//         <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">
//           Listeners
//         </p>
//         <div className="flex flex-wrap gap-4">
//           {listeners.length === 0 ? (
//             <p className="text-muted-foreground text-sm">No listeners yet</p>
//           ) : (
//             listeners.map((p) => (
//               <ParticipantAvatar
//                 key={p.id}
//                 participant={p}
//                 size="sm"
//               />
//             ))
//           )}
//         </div>
//       </div>

//       {/* ── Live Feedback Panel ─────────────────────────────────────────────── */}
//       {showFeedback && (
//         <div className="fixed inset-x-0 bottom-24 mx-4 bg-surface-elevated border border-border rounded-2xl z-50 overflow-hidden">
//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-3 border-b border-border">
//             <p className="font-semibold text-foreground text-sm">Live Feedback</p>
//             <button
//               onClick={() => setShowFeedback(false)}
//               className="text-muted-foreground hover:text-foreground"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Feedback list */}
//           <div className="flex flex-col gap-3 p-4 max-h-72 overflow-y-auto">
//             {feedbacks.length === 0 ? (
//               <p className="text-muted-foreground text-sm text-center py-4">
//                 No feedback yet
//               </p>
//             ) : (
//               feedbacks.map((f) => (
//                 <FeedbackCard key={f.id} feedback={f} />
//               ))
//             )}
//           </div>

//           {/* Reactions */}
//           <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-6">
//             {['👏', '🔥', '🧠'].map((emoji) => (
//               <button
//                 key={emoji}
//                 className="text-2xl hover:scale-125 transition-transform"
//               >
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ── Bottom Bar ─────────────────────────────────────────────────────── */}
//       <div className="fixed bottom-0 inset-x-0 bg-surface-elevated border-t border-border px-8 py-4">
//         <div className="flex items-center justify-between max-w-md mx-auto">

//           {/* Mute */}
//           <button className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center hover:border-gold transition-colors">
//             <MicOff size={20} className="text-muted-foreground" />
//           </button>

//           {/* Raise Hand */}
//           <button
//             onClick={handleRaiseHand}
//             className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
//               handRaised
//                 ? 'bg-gold border-gold'
//                 : 'bg-surface border-border hover:border-gold'
//             }`}
//           >
//             <Hand size={20} className={handRaised ? 'text-black' : 'text-muted-foreground'} />
//           </button>

//           {/* Feedback */}
//           <button
//             onClick={() => setShowFeedback(!showFeedback)}
//             className="relative w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center hover:border-gold transition-colors"
//           >
//             <MessageSquare size={20} className="text-muted-foreground" />
//             {newFeedbackCount > 0 && !showFeedback && (
//               <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-[10px] text-black font-bold flex items-center justify-center">
//                 {newFeedbackCount > 9 ? '9+' : newFeedbackCount}
//               </span>
//             )}
//           </button>

//         </div>
//       </div>

//     </div>
//   )
// }