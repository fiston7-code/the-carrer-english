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

// // src/components/room/ParticipantsList.tsx
// "use client";

// import Image from "next/image";
// import { useIsSpeaking } from "@livekit/components-react";
// import { Participant } from "livekit-client";
// import { Mic, MicOff } from "lucide-react";

// // --- Speaker Card ---
// function SpeakerCard({
//   participant,
//   livekitParticipant,
//   isLocal,
// }: {
//   participant: any;
//   livekitParticipant: Participant | undefined;
//   isLocal: boolean;
// }) {
//   const isSpeaking = useIsSpeaking(livekitParticipant);
//   const isCoachRole = participant.role === "coach";
//   const name = isLocal
//     ? "Vous"
//     : participant.profiles?.full_name?.split(" ")[0] ?? "?";

//   return (
//     <div className="flex flex-col items-center gap-2 w-20">
//       <div
//         className={`
//           relative w-16 h-16 rounded-full overflow-hidden transition-all duration-200
//           ${isSpeaking ? "ring-[3px] ring-yellow-400 ring-offset-2 ring-offset-[#0f0f0f]" : ""}
//           ${isCoachRole && !isSpeaking ? "ring-[3px] ring-blue-400 ring-offset-2 ring-offset-[#0f0f0f]" : ""}
//         `}
//       >
//         {participant.profiles?.avatar_url ? (
//           <Image
//             src={participant.profiles.avatar_url}
//             alt={name}
//             fill
//             className="object-cover"
//           />
//         ) : (
//           <div className="w-full h-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-xl font-bold">
//             {participant.profiles?.full_name?.[0] ?? "?"}
//           </div>
//         )}

//         {/* Mic status */}
//         <span className="absolute bottom-0 right-0 bg-[#1a1a1a] rounded-full p-0.5">
//           {participant.is_muted ? (
//             <MicOff size={10} className="text-red-400" />
//           ) : (
//             <Mic size={10} className="text-green-400" />
//           )}
//         </span>
//       </div>

//       <div className="text-center">
//         <p className="text-xs font-medium truncate w-full">{name}</p>
//         {isCoachRole && (
//           <span className="text-[10px] text-blue-400">Coach</span>
//         )}
//         {participant.hand_raised && (
//           <span className="text-xs leading-none">✋</span>
//         )}
//       </div>
//     </div>
//   );
// }

// // --- Listener Avatar ---
// function ListenerAvatar({
//   participant,
//   isLocal,
// }: {
//   participant: any;
//   isLocal: boolean;
// }) {
//   const name = isLocal
//     ? "Vous"
//     : participant.profiles?.full_name?.split(" ")[0] ?? "?";

//   return (
//     <div className="flex flex-col items-center gap-1 w-14">
//       <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
//         {participant.profiles?.avatar_url ? (
//           <Image
//             src={participant.profiles.avatar_url}
//             alt={name}
//             fill
//             className="object-cover"
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-600 flex items-center justify-center text-sm font-bold">
//             {participant.profiles?.full_name?.[0] ?? "?"}
//           </div>
//         )}
//         {participant.hand_raised && (
//           <span className="absolute -top-1 -right-1 text-xs leading-none">
//             ✋
//           </span>
//         )}
//       </div>
//       <p className="text-[10px] text-gray-400 truncate w-full text-center">
//         {name}
//       </p>
//     </div>
//   );
// }

// // --- Main ---
// type Props = {
//   speakers: any[];
//   listeners: any[];
//   livekitParticipants: Participant[];
//   localUserId: string;
// };

// export default function ParticipantsList({
//   speakers,
//   listeners,
//   livekitParticipants,
//   localUserId,
// }: Props) {
//   const getLivekitParticipant = (userId: string) =>
//     livekitParticipants.find((p) => p.identity === userId);

//   return (
//     <div className="flex flex-col gap-8">
//       {/* Speakers */}
//       <div>
//         <p className="text-xs text-gray-500 uppercase tracking-wide mb-5">
//           Speakers · {speakers.length}
//         </p>
//         <div className="flex flex-wrap gap-6">
//           {speakers.map((sp) => (
//             <SpeakerCard
//               key={sp.id}
//               participant={sp}
//               livekitParticipant={getLivekitParticipant(sp.user_id)}
//               isLocal={sp.user_id === localUserId}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Listeners */}
//       {listeners.length > 0 && (
//         <div className="border-t border-gray-800 pt-6">
//           <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
//             Auditeurs · {listeners.length}
//           </p>
//           <div className="flex flex-wrap gap-4">
//             {listeners.map((ls) => (
//               <ListenerAvatar
//                 key={ls.id}
//                 participant={ls}
//                 isLocal={ls.user_id === localUserId}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }