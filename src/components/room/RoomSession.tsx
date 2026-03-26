// src/components/room/RoomSession.tsx
"use client";

import { LiveKitRoom } from "@livekit/components-react";
import RoomContent from "./RoomContent";

type Props = {
  token: string;
  room: unknown;
  profile: unknown;
  userId: string;
  role: "speaker" | "listener" | "coach";
  isCoach: boolean;
  onLeave: () => void;
};

export default function RoomSession({
  token,
  room,
  profile,
  userId,
  role,
  isCoach,
  onLeave,
}: Props) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={role !== "listener"}
      video={false}
      onDisconnected={onLeave}
      className="min-h-screen bg-[#0f0f0f] text-white flex flex-col"
    >
      <RoomContent
        room={room}
        profile={profile}
        userId={userId}
        role={role}
        isCoach={isCoach}
        onLeave={onLeave}
      />
    </LiveKitRoom>
  );
}

