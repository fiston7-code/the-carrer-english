'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CATEGORIES = ['Interview Prep', 'Negotiation', 'Presentation', 'Networking', 'Writing', 'General']
const INDUSTRIES = ['Banking & Finance', 'Mining & Energy', 'NGO & Development', 'Telecom & Tech', 'Healthcare', 'Government & Public Sector']

export default function CreateRoomPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [category, setCategory]         = useState('')
  const [industry, setIndustry]         = useState('')
  const [maxParticipants, setMax]       = useState(20)
  const [startsNow, setStartsNow]       = useState(true)
  const [startsAt, setStartsAt]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const canSubmit = title.trim() && category && industry

  const handleCreate = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    try {
      // 1. Récupère le profil + coach du user connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', profile.id)
        .single()

      if (!coach) throw new Error('You must be a coach to create a room')

      // 2. Génère un nom unique pour LiveKit
      const livekit_room_name = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      // 3. Crée la room dans LiveKit via l'API
      const lkRes = await fetch('/api/livekit/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: livekit_room_name }),
      })
      if (!lkRes.ok) throw new Error('Failed to create LiveKit room')

      // 4. Insère la room dans Supabase
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title:              title.trim(),
          description:        description.trim() || null,
          category,
          industry,
          coach_id:           coach.id,
          livekit_room_name,
          is_live:            true,
          status:             'live',
          max_participants:   maxParticipants,
          starts_at:          startsNow ? new Date().toISOString() : new Date(startsAt).toISOString(),
        })
        .select('id')
        .single()

      if (roomError) throw roomError

      // 5. Redirige vers la room
      router.push(`/room/${room.id}`)

    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto px-4 pb-12">

      {/* Header */}
      <div className="flex items-center gap-3 py-5">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-base font-bold text-foreground">Create a Room</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Room Title *
          </label>
          <input
            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold outline-none transition-colors"
            placeholder="e.g. C-Suite Pitch Practice"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={80}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold outline-none transition-colors resize-none h-20"
            placeholder="What will participants practice in this room?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  category === c
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-surface text-foreground hover:border-gold/40'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Industry *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INDUSTRIES.map(i => (
              <button key={i} onClick={() => setIndustry(i)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-left ${
                  industry === i
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-surface text-foreground hover:border-gold/40'
                }`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Max Participants */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Max Participants — <span className="text-gold">{maxParticipants}</span>
          </label>
          <input
            type="range" min={2} max={50} step={1}
            value={maxParticipants}
            onChange={e => setMax(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span><span>50</span>
          </div>
        </div>

        {/* Starts */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start Time
          </label>
          <div className="flex gap-2">
            <button onClick={() => setStartsNow(true)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                startsNow ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-surface text-foreground'
              }`}>
              🔴 Start Now
            </button>
            <button onClick={() => setStartsNow(false)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                !startsNow ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-surface text-foreground'
              }`}>
              📅 Schedule
            </button>
          </div>
          {!startsNow && (
            <input
              type="datetime-local"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
              className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm text-foreground focus:border-gold outline-none transition-colors"
            />
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleCreate}
          disabled={!canSubmit || loading}
          className="w-full h-12 bg-gold text-black font-bold rounded-xl disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 mt-2"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Creating…</>
            : '🎙️ Create Room'
          }
        </button>

      </div>
    </div>
  )
}