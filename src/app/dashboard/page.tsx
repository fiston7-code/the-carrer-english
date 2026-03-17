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
    .eq("user_id", profile.id)
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


