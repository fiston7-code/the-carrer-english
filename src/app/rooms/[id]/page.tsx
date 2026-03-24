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
      .select("id, full_name, avatar_url, english_level, is_pro")
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

