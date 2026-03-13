// src/components/room/RoomLobby.tsx
"use client";

import { ArrowLeft, Users, Mic, Headphones, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  room: any;
  onJoin: (role: "speaker" | "listener") => void;
  isJoining: boolean;
  isCoach: boolean;
  error: string | null;
};

export default function RoomLobby({
  room,
  onJoin,
  isJoining,
  isCoach,
  error,
}: Props) {
  const router = useRouter();
  const coach = room.coaches;
  const isLive = room.status === "live";

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm text-gray-400">Retour</span>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-6">
        {/* Status + Category */}
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 text-xs font-semibold uppercase">
                Live
              </span>
            </div>
          )}
          {room.category && (
            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full font-medium">
              {room.category}
            </span>
          )}
          {room.industry && (
            <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
              {room.industry}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div>
          <h1 className="text-2xl font-bold leading-tight">{room.title}</h1>
          {room.description && (
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              {room.description}
            </p>
          )}
        </div>

        {/* Coach card */}
        {coach && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 shrink-0">
              {coach.avatar_url ? (
                <Image
                  src={coach.avatar_url}
                  alt={coach.full_name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-xl font-bold">
                  {coach.full_name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{coach.full_name}</span>
                {coach.is_verified && (
                  <CheckCircle size={14} className="text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Host · {coach.specialty ?? "English Coach"}
              </p>
            </div>
          </div>
        )}

        {/* Participants count */}
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={16} />
          <span className="text-sm">
            {room.participants_count ?? 0} / {room.max_participants} participants
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Join buttons */}
      <div className="px-4 pb-10 flex flex-col gap-3">
        {isCoach ? (
          <button
            onClick={() => onJoin("speaker")}
            disabled={isJoining}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50
                       text-black font-semibold py-4 rounded-2xl transition-colors
                       flex items-center justify-center gap-2"
          >
            <Mic size={18} />
            {isJoining ? "Démarrage..." : "Démarrer la session"}
          </button>
        ) : (
          <>
            <button
              onClick={() => onJoin("speaker")}
              disabled={isJoining}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50
                         text-black font-semibold py-4 rounded-2xl transition-colors
                         flex items-center justify-center gap-2"
            >
              <Mic size={18} />
              {isJoining ? "Connexion..." : "Rejoindre en tant que Speaker"}
            </button>
            <button
              onClick={() => onJoin("listener")}
              disabled={isJoining}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-50
                         text-white font-semibold py-4 rounded-2xl transition-colors
                         flex items-center justify-center gap-2 border border-gray-700"
            >
              <Headphones size={18} />
              {isJoining ? "Connexion..." : "Rejoindre en tant qu'Auditeur"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

// 'use client'

// import { ArrowLeft, Users, Mic, Headphones, CheckCircle } from 'lucide-react'
// import Image from 'next/image'
// import { useRouter } from 'next/navigation'

// type Props = {
//   room: any
//   onJoin: (role: 'speaker' | 'listener') => void
//   isJoining: boolean
//   isCoach: boolean
//   error: string | null
// }

// export default function RoomLobby({ room, onJoin, isJoining, isCoach, error }: Props) {
//   const router = useRouter()
//   const coach = room.coaches
//   const isLive = room.status === 'live'

//   return (
//     <main className="min-h-screen bg-background text-foreground flex flex-col">

//       {/* Header */}
//       <div className="flex items-center gap-3 px-4 pt-6 pb-4">
//         <button
//           onClick={() => router.back()}
//           className="p-2 rounded-full bg-surface border border-border hover:border-gold transition-colors"
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <span className="text-sm text-muted-foreground">Back</span>
//       </div>

//       <div className="flex-1 px-4 py-4 flex flex-col gap-6">

//         {/* Status + Category */}
//         <div className="flex items-center gap-3 flex-wrap">
//           {isLive && (
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
//               <span className="text-gold text-xs font-bold uppercase tracking-wide">Live</span>
//             </div>
//           )}
//           {room.category && (
//             <span className="text-xs bg-gold/10 text-gold border border-gold/30 px-3 py-1 rounded-full font-medium">
//               {room.category}
//             </span>
//           )}
//           {room.industry && (
//             <span className="text-xs bg-surface border border-border text-muted-foreground px-3 py-1 rounded-full">
//               {room.industry}
//             </span>
//           )}
//         </div>

//         {/* Title + description */}
//         <div>
//           <h1 className="text-2xl font-bold leading-tight">{room.title}</h1>
//           {room.description && (
//             <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
//               {room.description}
//             </p>
//           )}
//         </div>

//         {/* Coach card */}
//         {coach && (
//           <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
//             <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-elevated shrink-0">
//               {coach.avatar_url ? (
//                 <Image
//                   src={coach.avatar_url}
//                   alt={coach.full_name}
//                   width={56}
//                   height={56}
//                   className="object-cover w-full h-full"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gold/10 text-gold flex items-center justify-center text-xl font-bold">
//                   {coach.full_name?.[0]}
//                 </div>
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <span className="font-semibold truncate">{coach.full_name}</span>
//                 {coach.is_verified && (
//                   <CheckCircle size={14} className="text-gold shrink-0" />
//                 )}
//               </div>
//               <p className="text-xs text-muted-foreground mt-0.5">
//                 Host · {coach.specialty ?? 'English Coach'}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Participants count */}
//         <div className="flex items-center gap-2 text-muted-foreground">
//           <Users size={16} />
//           <span className="text-sm">
//             {room.participants_count ?? 0} / {room.max_participants} participants
//           </span>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
//             {error}
//           </div>
//         )}
//       </div>

//       {/* Join buttons */}
//       <div className="px-4 pb-10 flex flex-col gap-3">
//         {isCoach ? (
//           <button
//             onClick={() => onJoin('speaker')}
//             disabled={isJoining}
//             className="w-full bg-gold hover:bg-gold-dim disabled:opacity-50
//                        text-primary-foreground font-semibold py-4 rounded-2xl transition-colors
//                        flex items-center justify-center gap-2"
//           >
//             <Mic size={18} />
//             {isJoining ? 'Démarrage...' : 'Démarrer la session'}
//           </button>
//         ) : (
//           <>
//             <button
//               onClick={() => onJoin('speaker')}
//               disabled={isJoining}
//               className="w-full bg-gold hover:bg-gold-dim disabled:opacity-50
//                          text-primary-foreground font-semibold py-4 rounded-2xl transition-colors
//                          flex items-center justify-center gap-2"
//             >
//               <Mic size={18} />
//               {isJoining ? 'Connexion...' : 'Join as Speaker'}
//             </button>
//             <button
//               onClick={() => onJoin('listener')}
//               disabled={isJoining}
//               className="w-full bg-surface hover:bg-surface-elevated disabled:opacity-50
//                          text-foreground font-semibold py-4 rounded-2xl transition-colors
//                          flex items-center justify-center gap-2 border border-border hover:border-gold"
//             >
//               <Headphones size={18} />
//               {isJoining ? 'Connexion...' : 'Join as Listener'}
//             </button>
//           </>
//         )}
//       </div>
//     </main>
//   )
// }