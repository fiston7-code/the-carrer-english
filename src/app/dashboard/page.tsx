import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import RoomCard from "@/components/dashboard/RoomCard"
import Link from "next/link"
import { Headphones } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) redirect("/onboarding")

  // Verifie si l'user est coach
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const isCoach = !!coach

  // Rooms live + upcoming
  const { data: rooms } = await supabase
    .from("rooms_with_count")
    .select(`
      *,
      coaches (
        id,
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .in("status", ["live", "upcoming"])
    .order("is_live", { ascending: false })
    .order("starts_at", { ascending: true })
    .limit(9)

  const liveCount = rooms?.filter((r) => r.status === "live").length ?? 0

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 max-w-md mx-auto flex flex-col gap-6">

      <DashboardHeader profile={profile} />

      <div>
        <h1 className="text-3xl font-bold text-foreground leading-tight">
          The Career English
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Master business English through live audio sessions
        </p>
      </div>

      {/* Bouton create room — coachs uniquement */}
      {isCoach && (
        <Link
          href="/room/create"
          className="w-full py-3 rounded-xl border border-gold/40 bg-gold/10
                     text-gold font-semibold text-sm text-center
                     hover:bg-gold/20 transition-colors"
        >
          + Create Room
        </Link>
      )}

      {/* Live Rooms */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-gold" />
            <h2 className="text-base font-semibold text-foreground">Live Rooms</h2>
          </div>
          {liveCount > 0 && (
            <span className="text-xs text-gold font-medium">
              {liveCount} live now
            </span>
          )}
        </div>

        {rooms?.length === 0 || !rooms ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            No rooms available right now
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      <Link
        href="/progress"
        className="block w-full text-center bg-gold hover:bg-gold-dim
                   text-primary-foreground font-bold py-4 rounded-2xl
                   transition-colors duration-200 text-sm"
      >
        View My Progress
      </Link>

    </main>
  )
}




// import { createSupabaseServerClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
// import DashboardHeader from "@/components/dashboard/DashboardHeader";
// import RoomCard from "@/components/dashboard/RoomCard";
// import Link from "next/link";
// import { Headphones } from "lucide-react";

// export default async function DashboardPage() {
//   const supabase = await createSupabaseServerClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/auth/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   if (!profile?.onboarding_completed) redirect("/onboarding");


  
//   const { data: rooms } = await supabase
//     .from("rooms_with_count")
//     .select(`
//       *,
//       coaches (
//         id,
//         full_name,
//         avatar_url,
//         is_verified
//       )
//     `)
//     .in("status", ["live", "upcoming"])
//     .order("is_live", { ascending: false })   // live en premier
//     .order("starts_at", { ascending: true })
//     .limit(9);

//   const liveCount = rooms?.filter((r) => r.status === "live").length ?? 0;

//   return (
//     <main className="min-h-screen bg-background text-foreground px-4 py-6 max-w-md mx-auto flex flex-col gap-6">

//       {/* Header */}
//       <DashboardHeader profile={profile} />

//       {/* Hero */}
//       <div>
//         <h1 className="text-3xl font-bold text-foreground leading-tight">
//           The Career English
//         </h1>
//         <p className="text-muted-foreground mt-1 text-sm">
//           Master business English through live audio sessions
//         </p>
//       </div>

//       {/* Live Rooms */}
//       <section className="flex flex-col gap-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Headphones size={16} className="text-gold" />
//             <h2 className="text-base font-semibold text-foreground">Live Rooms</h2>
//           </div>
//           {liveCount > 0 && (
//             <span className="text-xs text-gold font-medium">
//               {liveCount} live now
//             </span>
//           )}
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           {rooms?.map((room) => (
//             <RoomCard key={room.id} room={room} />
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <Link
//         href="/progress"
//         className="block w-full text-center bg-gold hover:bg-gold-dim
//                    text-primary-foreground font-bold py-4 rounded-2xl 
//                    transition-colors duration-200 text-sm"
//       >
//         View My Progress
//       </Link>

//     </main>
//   );
// }




// 'use client'

// import { useEffect, useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { User } from '@supabase/supabase-js'
// import Link from 'next/link'
// import { Users, Headphones } from 'lucide-react'

// // ─── Types ────────────────────────────────────────────────────────────────────

// type Coach = {
//   id: string
//   full_name: string
//   avatar_url: string | null
//   is_verified: boolean
// }

// type Room = {
//   id: string
//   title: string
//   category: string
//   status: 'live' | 'upcoming' | 'ended'
//   is_live: boolean
//   participants_count: number
//   starts_at: string
//   coach: Coach | null
// }

// type Profile = {
//   full_name: string | null
//   avatar_url: string | null
//   english_level: string | null
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function getLevelLabel(level: string | null) {
//   const map: Record<string, string> = {
//     beginner: 'A1 – A2',
//     intermediate: 'B1 – B2',
//     advanced: 'C1 – C2',
//   }
//   return level ? map[level] ?? level : null
// }

// function getInitials(name: string | null) {
//   if (!name) return '?'
//   return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
// }

// // ─── Room Card ────────────────────────────────────────────────────────────────

// function RoomCard({ room }: { room: Room }) {
//   const isLive = room.status === 'live'

//   return (
//     <Link href={`/rooms/${room.id}`}>
//       <div className={`
//         relative flex flex-col justify-between gap-3 p-4 rounded-2xl border cursor-pointer
//         transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
//         ${isLive
//           ? 'bg-[#0f1624] border-gray-700 hover:border-gray-500'
//           : 'bg-[#0a0f1a] border-gray-800 hover:border-gray-600'
//         }
//       `}>
//         {/* Top row — status + count */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-1.5">
//             {isLive ? (
//               <>
//                 <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
//                 <span className="text-yellow-400 text-xs font-bold tracking-wide uppercase">Live</span>
//               </>
//             ) : (
//               <span className="text-gray-500 text-xs font-medium">Upcoming</span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 text-gray-400 text-xs">
//             <Users size={12} />
//             <span>{room.participants_count}</span>
//           </div>
//         </div>

//         {/* Title */}
//         <p className="text-white font-semibold text-sm leading-snug">
//           {room.title}
//         </p>

//         {/* Coach */}
//         {room.coach && (
//           <div className="flex items-center gap-2">
//             {room.coach.avatar_url ? (
//               <img
//                 src={room.coach.avatar_url}
//                 alt={room.coach.full_name}
//                 className="w-6 h-6 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 text-[10px] font-bold">
//                 {getInitials(room.coach.full_name)}
//               </div>
//             )}
//             <span className="text-gray-400 text-xs">{room.coach.full_name}</span>
//             {room.coach.is_verified && (
//               <span className="text-yellow-400 text-xs">✓</span>
//             )}
//           </div>
//         )}
//       </div>
//     </Link>
//   )
// }

// // ─── Dashboard Page ───────────────────────────────────────────────────────────

// export default function DashboardPage() {
//   const supabase = createClient()

//   const [user, setUser] = useState<User | null>(null)
//   const [profile, setProfile] = useState<Profile | null>(null)
//   const [rooms, setRooms] = useState<Room[]>([])
//   const [loading, setLoading] = useState(true)

//   // ── Fetch user + profile ────────────────────────────────────────────────────
//   useEffect(() => {
//     const init = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) return

//       setUser(user)

//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('full_name, avatar_url, english_level')
//         .eq('id', user.id)
//         .single()

//       setProfile(profile)
//     }
//     init()
//   }, [])

//   // ── Fetch rooms ─────────────────────────────────────────────────────────────
//   // On utilise rooms_with_count (la vue) qui calcule participants_count auto
//   // On joint coaches pour avoir le nom + avatar
//   useEffect(() => {
//     const fetchRooms = async () => {
//       const { data, error } = await supabase
//         .from('rooms_with_count')
//         .select(`
//           id,
//           title,
//           category,
//           status,
//           is_live,
//           participants_count,
//           starts_at,
//           coach_id,
//           coaches (
//             id,
//             full_name,
//             avatar_url,
//             is_verified
//           )
//         `)
//         .in('status', ['live', 'upcoming'])
//         .order('is_live', { ascending: false })  // live en premier
//         .order('starts_at', { ascending: true })

//       if (error) {
//         console.error('Error fetching rooms:', error)
//         setLoading(false)
//         return
//       }

//       const formatted: Room[] = (data ?? []).map((r: any) => ({
//         id: r.id,
//         title: r.title,
//         category: r.category,
//         status: r.status,
//         is_live: r.is_live,
//         participants_count: r.participants_count ?? 0,
//         starts_at: r.starts_at,
//         coach: r.coaches ?? null,
//       }))

//       setRooms(formatted)
//       setLoading(false)
//     }

//     fetchRooms()

//     // ── Realtime — mise à jour auto des participants_count ───────────────────
//     // Chaque insert/update/delete sur room_participants déclenche un refresh
//     const channel = supabase
//       .channel('rooms-realtime')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'room_participants' },
//         () => fetchRooms()   // refetch simple — suffisant pour le MVP
//       )
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'rooms' },
//         () => fetchRooms()
//       )
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [])

//   const liveRooms = rooms.filter((r) => r.status === 'live')
//   const liveCount = liveRooms.length

//   // ─── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <div className="min-h-screen bg-[#070d18] text-white">
//       <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">

//         {/* Header — profil user */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {profile?.avatar_url ? (
//               <img
//                 src={profile.avatar_url}
//                 alt={profile.full_name ?? ''}
//                 className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-400/30"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm ring-2 ring-yellow-400/30">
//                 {getInitials(profile?.full_name ?? null)}
//               </div>
//             )}
//             <div>
//               <p className="text-white font-semibold text-sm">
//                 {profile?.full_name ?? 'Welcome'}
//               </p>
//               {profile?.english_level && (
//                 <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
//                   {getLevelLabel(profile.english_level)}
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Notification bell */}
//           <button className="relative w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition">
//             <span className="text-base">🔔</span>
//             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
//           </button>
//         </div>

//         {/* Title */}
//         <div>
//           <h1 className="text-3xl font-bold text-white tracking-tight">
//             The Career English
//           </h1>
//           <p className="text-gray-400 text-sm mt-1">
//             Master business English through live audio sessions
//           </p>
//         </div>

//         {/* Live Rooms section */}
//         <div className="flex flex-col gap-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Headphones size={16} className="text-yellow-400" />
//               <span className="text-white font-semibold text-sm">Live Rooms</span>
//             </div>
//             {liveCount > 0 && (
//               <span className="text-yellow-400 text-xs font-medium">
//                 {liveCount} live now
//               </span>
//             )}
//           </div>

//           {/* Grid des rooms */}
//           {loading ? (
//             // Skeleton loader
//             <div className="grid grid-cols-2 gap-3">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="h-28 rounded-2xl bg-gray-800/50 animate-pulse" />
//               ))}
//             </div>
//           ) : rooms.length === 0 ? (
//             <div className="text-center py-12 text-gray-500 text-sm">
//               No rooms available right now
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-3">
//               {rooms.map((room) => (
//                 <RoomCard key={room.id} room={room} />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* CTA Progress */}
//         <Link href="/progress">
//           <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl transition-colors duration-200 text-sm">
//             View My Progress
//           </button>
//         </Link>

//       </div>
//     </div>
//   )
// }