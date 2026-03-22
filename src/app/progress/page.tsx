import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Target, Flame, Trophy, CheckCircle, Lightbulb } from "lucide-react"

function getInitials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
}

function getLevelLabel(level: string | null) {
  const map: Record<string, string> = {
    beginner: "A1 – A2",
    intermediate: "B1 – B2",
    advanced: "C1 – C2",
  }
  return level ? map[level] ?? level : "Unknown"
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function computeScore(totalMinutes: number, sessions: number, corrections: number) {
  const timeScore    = Math.min(totalMinutes / 600, 1) * 40
  const sessionScore = Math.min(sessions / 20, 1) * 40
  const corrScore    = Math.min(corrections / 50, 1) * 20
  return Math.round(timeScore + sessionScore + corrScore)
}

function getWeeklyData(sessions: any[]) {
  const now = new Date()
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (7 - i) * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const value = sessions
      .filter((s) => {
        const d = new Date(s.created_at)
        return d >= weekStart && d < weekEnd
      })
      .reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0)

    return { label: `W${i + 1}`, value }
  })
}

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) redirect("/onboarding")

  const { data: sessions } = await supabase
    .from("session_reports")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const { data: feedbacks } = await supabase
    .from("live_feedbacks")
    .select("id, type, mistake, correction, explanation, created_at")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30)

  const totalMinutes    = profile.total_minutes_practiced ?? 0
  const sessionCount    = sessions?.length ?? 0
  const correctionCount = feedbacks?.filter((f) => f.type === "correction").length ?? 0
  const tipCount        = feedbacks?.filter((f) => f.type === "tip").length ?? 0
  const score           = computeScore(totalMinutes, sessionCount, correctionCount)
  const weeklyData      = getWeeklyData(sessions ?? [])
  const maxWeekly       = Math.max(...weeklyData.map((w) => w.value), 1)

  const streak = (() => {
    if (!sessions?.length) return 0
    const dates = [...new Set(sessions.map((s) => new Date(s.created_at).toDateString()))]
    let count = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (dates.includes(d.toDateString())) count++
      else break
    }
    return count
  })()

  const circumference = 2 * Math.PI * 45
  const offset        = circumference - (score / 100) * circumference

  return (
    <main className="min-h-screen bg-background text-foreground max-w-md mx-auto px-4 py-6 flex flex-col gap-5 pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold text-foreground">My Progress</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/30">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name ?? ""}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-gold font-bold text-xl">
              {getInitials(profile.full_name)}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-foreground text-base">{profile.full_name ?? "Unknown"}</p>
          <span className="text-xs bg-gold/20 text-gold px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block">
            {getLevelLabel(profile.english_level)}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock,  value: formatMinutes(totalMinutes), label: "Total Time" },
          { icon: Target, value: sessionCount.toString(),     label: "Sessions"   },
          { icon: Flame,  value: `${streak} days`,            label: "Streak"     },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-3 flex flex-col items-center gap-1">
            <Icon size={16} className="text-gold" />
            <p className="font-bold text-foreground text-lg leading-tight">{value}</p>
            <p className="text-muted-foreground text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Career Readiness Score */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-gold" />
          <p className="font-bold text-foreground text-sm">Career Readiness Score</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(222 30% 14%)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="hsl(43 96% 56%)" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-gold">{score}%</span>
            </div>
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">
              {score >= 80 ? "Excellent work!" : score >= 50 ? "You're progressing well!" : "Keep practicing!"}
            </p>
            <span className="text-xs bg-gold/20 text-gold px-2.5 py-0.5 rounded-full font-medium mt-2 inline-block">
              {getLevelLabel(profile.english_level)} → Next level
            </span>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>✗ {correctionCount} corrections</span>
              <span>💡 {tipCount} tips</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Speaking Time Chart */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="font-bold text-foreground text-sm mb-4">Speaking Time (min)</p>
        <div className="flex items-end gap-2 h-28">
          {weeklyData.map(({ label, value }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gold rounded-t-md"
                style={{ height: `${(value / maxWeekly) * 100}%`, minHeight: value > 0 ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback History */}
      <div className="flex flex-col gap-3">
        <p className="font-bold text-foreground text-sm">Coach Feedback History</p>
        {!feedbacks?.length ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground text-sm">No feedback yet — join a session!</p>
          </div>
        ) : (
          feedbacks.map((f) => (
            <div key={f.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {f.type === "correction"
                    ? <CheckCircle size={13} className="text-destructive" />
                    : <Lightbulb size={13} className="text-gold" />
                  }
                  <span className={`text-xs font-semibold ${f.type === "correction" ? "text-destructive" : "text-gold"}`}>
                    {f.type === "correction" ? "Correction" : "Tip"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(f.created_at)}</span>
              </div>
              {f.type === "correction" && f.mistake && (
                <p className="text-destructive text-sm line-through opacity-70">✗ {f.mistake}</p>
              )}
              {f.type === "correction" && f.correction && (
                <p className="text-foreground text-sm font-medium">✓ {f.correction}</p>
              )}
              {f.explanation && (
                <p className="text-muted-foreground text-sm italic">{f.explanation}</p>
              )}
            </div>
          ))
        )}
      </div>

    </main>
  )
}