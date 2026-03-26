
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import RoomCard from "@/components/dashboard/RoomCard"
import Link from "next/link"
import { Headphones, Users, PlusCircle } from "lucide-react"


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

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, is_pro, coach_students(count)")
    .eq("user_id", profile.id)
    .single()

  const isCoach = !!coach
  const studentCount = (coach?.coach_students as any)?.[0]?.count ?? 0
  const isCoachPro = coach?.is_pro ?? false

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

{/* --- SECTION COACH : Affichée uniquement pour les formateurs --- */}
{isCoach ? (
  <section className="bg-card border border-gold/20 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Coach Console</p>
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          {studentCount} <span className="text-sm font-medium text-muted-foreground">Students</span>
        </h2>
      </div>
      {/* Le badge PRO sert d'indicateur de statut pour le coach, pas de barrière pour l'élève */}
      {isCoachPro && (
        <span className="bg-gold text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg">PRO</span>
      )}
    </div>

    <div className="flex gap-3">
      <Link
        href="/rooms/create"
        className="flex-1 py-3 px-2 rounded-xl bg-gold text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all"
      >
        <PlusCircle size={16} /> New Room
      </Link>
      <Link
        href="/coach/dashboard"
        className="flex-1 py-3 px-2 rounded-xl border border-border bg-secondary/50 text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary transition-all"
      >
        <Users size={16} /> Students
      </Link>
    </div>
  </section>
) : null}

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





