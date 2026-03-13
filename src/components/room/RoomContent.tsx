"use client";

import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ParticipantsList from "./ParticipantsList";
import ControlBar from "./ControlBar";
import LiveFeedbackToast from "./LiveFeedbackToast";

type Props = {
  room: any;
  profile: any;
  userId: string;
  role: "speaker" | "listener" | "coach";
  isCoach: boolean;
  onLeave: () => void;
};

export default function RoomContent({
  room,
  profile,
  userId,
  role,
  isCoach,
  onLeave,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [dbParticipants, setDbParticipants] = useState<any[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(role === "listener");

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from("room_participants")
      .select("*, profiles(full_name, avatar_url)")
      .eq("room_id", room.id)
      .is("left_at", null);
    if (data) setDbParticipants(data);
  }, [room.id, supabase]);

  useEffect(() => {
    fetchParticipants();
    const channel = supabase
      .channel(`room_participants_${room.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "room_participants",
        filter: `room_id=eq.${room.id}`,
      }, fetchParticipants)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room.id, fetchParticipants, supabase]);

  useEffect(() => {
    if (isCoach) return;
    const channel = supabase
      .channel(`live_feedbacks_${room.id}_${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "live_feedbacks",
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        if (payload.new.student_id === userId || payload.new.student_id === null) {
          setLatestFeedback(payload.new);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room.id, userId, isCoach, supabase]);

  const handleMuteToggle = async () => {
    const newMuted = !isMuted;
    await localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
    await supabase
      .from("room_participants")
      .update({ is_muted: newMuted })
      .eq("room_id", room.id)
      .eq("user_id", userId);
  };

  const handleHandRaise = async () => {
    const me = dbParticipants.find((p) => p.user_id === userId);
    const newRaised = !me?.hand_raised;
    await supabase
      .from("room_participants")
      .update({ hand_raised: newRaised })
      .eq("room_id", room.id)
      .eq("user_id", userId);
  };

  const handleLeave = async () => {
    if (role !== "listener") {
      await localParticipant.setMicrophoneEnabled(false);
    }
    await onLeave();
    router.push("/dashboard");
  };

  const speakers = dbParticipants.filter((p) => ["speaker", "coach"].includes(p.role));
  const listeners = dbParticipants.filter((p) => p.role === "listener");
  const myParticipant = dbParticipants.find((p) => p.user_id === userId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 gap-4">
        <div className="flex-1 min-w-0">
          {/* ✅ text-gray-500 → text-steel */}
          <p className="text-xs text-steel uppercase tracking-wide truncate">
            {room.category}
          </p>
          <h1 className="text-sm font-semibold truncate">{room.title}</h1>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-orange-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ParticipantsList
          speakers={speakers}
          listeners={listeners}
          livekitParticipants={participants}
          localUserId={userId}
        />
      </div>

      {/* Feedback toast */}
      {latestFeedback && (
        <LiveFeedbackToast
          feedback={latestFeedback}
          onDismiss={() => setLatestFeedback(null)}
        />
      )}

      {/* Controls */}
      <ControlBar
        role={role}
        isMuted={isMuted}
        isHandRaised={myParticipant?.hand_raised ?? false}
        onMuteToggle={handleMuteToggle}
        onHandRaise={handleHandRaise}
        onLeave={handleLeave}
      />
    </div>
  );
}

// src/components/room/RoomContent.tsx
// "use client";

// import { useParticipants, useLocalParticipant } from "@livekit/components-react";
// import { createClient } from "@/lib/supabase/client";
// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import ParticipantsList from "./ParticipantsList";
// import ControlBar from "./ControlBar";
// import LiveFeedbackToast from "./LiveFeedbackToast";

// type Props = {
//   room: any;
//   profile: any;
//   userId: string;
//   role: "speaker" | "listener" | "coach";
//   isCoach: boolean;
//   onLeave: () => void;
// };

// export default function RoomContent({
//   room,
//   profile,
//   userId,
//   role,
//   isCoach,
//   onLeave,
// }: Props) {
//   const router = useRouter();
//   const supabase = createClient();
//   const participants = useParticipants();
//   const { localParticipant } = useLocalParticipant();

//   const [dbParticipants, setDbParticipants] = useState<any[]>([]);
//   const [latestFeedback, setLatestFeedback] = useState<any | null>(null);
//   const [isMuted, setIsMuted] = useState(role === "listener");

//   // --- Participants realtime ---
//   const fetchParticipants = useCallback(async () => {
//     const { data } = await supabase
//       .from("room_participants")
//       .select("*, profiles(full_name, avatar_url)")
//       .eq("room_id", room.id)
//       .is("left_at", null);
//     if (data) setDbParticipants(data);
//   }, [room.id, supabase]);

//   useEffect(() => {
//     fetchParticipants();

//     const channel = supabase
//       .channel(`room_participants_${room.id}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "room_participants",
//           filter: `room_id=eq.${room.id}`,
//         },
//         fetchParticipants
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [room.id, fetchParticipants, supabase]);

//   // --- Live feedbacks realtime ---
//   useEffect(() => {
//     if (isCoach) return;

//     const channel = supabase
//       .channel(`live_feedbacks_${room.id}_${userId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "live_feedbacks",
//           filter: `room_id=eq.${room.id}`,
//         },
//         (payload) => {
//           // Feedback ciblé sur cet étudiant ou broadcast
//           if (
//             payload.new.student_id === userId ||
//             payload.new.student_id === null
//           ) {
//             setLatestFeedback(payload.new);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [room.id, userId, isCoach, supabase]);

//   // --- Controls ---
//   const handleMuteToggle = async () => {
//     const newMuted = !isMuted;
//     await localParticipant.setMicrophoneEnabled(!newMuted);
//     setIsMuted(newMuted);
//     await supabase
//       .from("room_participants")
//       .update({ is_muted: newMuted })
//       .eq("room_id", room.id)
//       .eq("user_id", userId);
//   };

//   const handleHandRaise = async () => {
//     const me = dbParticipants.find((p) => p.user_id === userId);
//     const newRaised = !me?.hand_raised;
//     await supabase
//       .from("room_participants")
//       .update({ hand_raised: newRaised })
//       .eq("room_id", room.id)
//       .eq("user_id", userId);
//   };

//   const handleLeave = async () => {
//     if (role !== "listener") {
//       await localParticipant.setMicrophoneEnabled(false);
//     }
//     await onLeave();
//     router.push("/dashboard");
//   };

//   const speakers = dbParticipants.filter((p) =>
//     ["speaker", "coach"].includes(p.role)
//   );
//   const listeners = dbParticipants.filter((p) => p.role === "listener");
//   const myParticipant = dbParticipants.find((p) => p.user_id === userId);

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
//       {/* Header */}
//       <div className="flex items-center px-4 pt-6 pb-4 gap-4">
//         <div className="flex-1 min-w-0">
//           <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
//             {room.category}
//           </p>
//           <h1 className="text-sm font-semibold truncate">{room.title}</h1>
//         </div>
//         <div className="flex items-center gap-1.5 shrink-0">
//           <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
//           <span className="text-orange-400 text-xs font-medium">Live</span>
//         </div>
//       </div>

//       {/* Participants */}
//       <div className="flex-1 overflow-y-auto px-4 py-2">
//         <ParticipantsList
//           speakers={speakers}
//           listeners={listeners}
//           livekitParticipants={participants}
//           localUserId={userId}
//         />
//       </div>

//       {/* Feedback toast */}
//       {latestFeedback && (
//         <LiveFeedbackToast
//           feedback={latestFeedback}
//           onDismiss={() => setLatestFeedback(null)}
//         />
//       )}

//       {/* Controls */}
//       <ControlBar
//         role={role}
//         isMuted={isMuted}
//         isHandRaised={myParticipant?.hand_raised ?? false}
//         onMuteToggle={handleMuteToggle}
//         onHandRaise={handleHandRaise}
//         onLeave={handleLeave}
//       />
//     </div>
//   );
// }