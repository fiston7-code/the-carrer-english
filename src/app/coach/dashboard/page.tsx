import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Users, Clock, MessageSquare, PlusCircle, TrendingUp } from "lucide-react"

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

function getLevelLabel(level: string | null) {
  const map: Record<string, string> = {
    beginner: 'A1–A2', intermediate: 'B1–B2', advanced: 'C1–C2',
  }
  return level ? map[level] ?? level : '—'
}

function getLevelColor(level: string | null) {
  const map: Record<string, string> = {
    beginner:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
    intermediate: 'bg-gold/20 text-gold border-gold/30',
    advanced:     'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return level ? map[level] ?? 'bg-surface text-muted-foreground border-border' : 'bg-surface text-muted-foreground border-border'
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 3600)  return `${Math.floor(diff / 60)}min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

export default async function CoachStudentsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Vérifie que c'est bien un coach
  const { data: coach } = await supabase
    .from("coaches")
    .select("id, full_name, is_pro")
    .eq("user_id", user.id)
    .single()

  if (!coach) redirect("/dashboard")

  // Récupère tous les étudiants du coach
  const { data: coachStudents } = await supabase
    .from("coach_students")
    .select("id, student_id, status, joined_at")
    .eq("coach_id", coach.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false })

  const studentIds = coachStudents?.map(cs => cs.student_id) ?? []

  // Récupère les profils des étudiants
  const { data: profiles } = studentIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, english_level, total_minutes_practiced")
        .in("id", studentIds)
    : { data: [] }

  // Récupère les session reports pour chaque étudiant
  const { data: sessionReports } = studentIds.length > 0
    ? await supabase
        .from("session_reports")
        .select("user_id, duration_minutes, corrections_count, created_at")
        .eq("coach_id", coach.id)
        .in("user_id", studentIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  // Récupère les rooms actives du coach
  const { data: activeRooms } = await supabase
    .from("rooms")
    .select("id, title, status, is_live, invite_code, participants_count:room_participants(count)")
    .eq("coach_id", coach.id)
    .in("status", ["live", "upcoming"])
    .order("is_live", { ascending: false })
    .limit(5)

  // Construit les stats par étudiant
  const students = (profiles ?? []).map(profile => {
    const reports = (sessionReports ?? []).filter(r => r.user_id === profile.id)
    const lastSession = reports[0]?.created_at ?? null
    const totalSessions = reports.length
    const totalCorrections = reports.reduce((acc, r) => acc + (r.corrections_count ?? 0), 0)
    const totalMinutes = profile.total_minutes_practiced ?? 0
    return { ...profile, totalSessions, totalCorrections, totalMinutes, lastSession }
  }).sort((a, b) => {
    // Trie par dernière session (les plus actifs en premier)
    if (!a.lastSession) return 1
    if (!b.lastSession) return -1
    return new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime()
  })

  // Stats globales
  const totalStudents   = students.length
  const totalSessions   = (sessionReports ?? []).length
  const totalMinutes    = students.reduce((acc, s) => acc + s.totalMinutes, 0)
  const activeThisWeek  = students.filter(s => {
    if (!s.lastSession) return false
    return Date.now() - new Date(s.lastSession).getTime() < 7 * 86400000
  }).length

  return (
    <main className="min-h-screen bg-background text-foreground max-w-md mx-auto px-4 py-6 flex flex-col gap-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-foreground">My Students</h1>
            <p className="text-xs text-muted-foreground">{coach.full_name}</p>
          </div>
        </div>
        {coach.is_pro && (
          <span className="text-[10px] font-black text-black bg-gold px-2.5 py-1 rounded-lg">PRO</span>
        )}
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Users,        value: totalStudents,  label: 'Students'  },
          { icon: TrendingUp,   value: totalSessions,  label: 'Sessions'  },
          { icon: Clock,        value: `${Math.round(totalMinutes / 60)}h`, label: 'Hours' },
          { icon: MessageSquare,value: activeThisWeek, label: 'Active'    },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-3 flex flex-col items-center gap-1">
            <Icon size={14} className="text-gold" />
            <p className="font-bold text-foreground text-base leading-tight">{value}</p>
            <p className="text-muted-foreground text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      {/* Rooms actives */}
      {activeRooms && activeRooms.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Active Rooms
          </p>
          <div className="flex flex-col gap-2">
            {activeRooms.map((room: any) => (
              <Link key={room.id} href={`/rooms/${room.id}`}
                className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between hover:border-gold/40 transition-colors">
                <div className="flex items-center gap-3">
                  {room.is_live
                    ? <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
                    : <span className="w-2 h-2 bg-muted-foreground rounded-full shrink-0" />
                  }
                  <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
                    {room.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {room.invite_code && (
                    <span className="text-[10px] font-bold text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-md">
                      {room.invite_code}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    room.is_live
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-surface-elevated text-muted-foreground border border-border'
                  }`}>
                    {room.is_live ? 'LIVE' : 'SOON'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/rooms/create"
            className="w-full py-2.5 rounded-xl border border-gold/40 bg-gold/10
                       text-gold font-semibold text-xs text-center
                       hover:bg-gold/20 transition-colors flex items-center justify-center gap-2">
            <PlusCircle size={14} />
            New Room
          </Link>
        </div>
      )}

      {/* Liste étudiants */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Students ({totalStudents})
          </p>
          <p className="text-xs text-muted-foreground">
            {activeThisWeek} active this week
          </p>
        </div>

        {students.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center flex flex-col gap-3">
            <p className="text-3xl">👥</p>
            <p className="text-foreground font-semibold text-sm">No students yet</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Create a private room and share the invite link with your students on WhatsApp.
            </p>
            <Link href="/rooms/create"
              className="mt-2 py-3 rounded-xl bg-gold text-black font-bold text-sm text-center">
              Create a Room
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map((student) => (
              <div key={student.id}
                className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-gold/30 transition-colors">

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
                  {student.avatar_url ? (
                    <Image
                      src={student.avatar_url} alt={student.full_name ?? ''}
                      width={48} height={48} className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-gold font-bold text-sm">
                      {getInitials(student.full_name)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {student.full_name ?? 'Unknown'}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getLevelColor(student.english_level)}`}>
                      {getLevelLabel(student.english_level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {student.totalSessions} sessions
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.totalCorrections} corrections
                    </span>
                  </div>
                </div>

                {/* Dernière activité */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">Last seen</p>
                  <p className={`text-xs font-semibold ${
                    student.lastSession && Date.now() - new Date(student.lastSession).getTime() < 86400000
                      ? 'text-green-400'
                      : 'text-muted-foreground'
                  }`}>
                    {timeAgo(student.lastSession)}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}