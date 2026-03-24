'use client'

import { useState } from 'react'
import RoomCard from './RoomCard'
import { Lock } from 'lucide-react'

type Props = {
  room: any
  isCoach: boolean
}

export default function RoomCardWrapper({ room, isCoach }: Props) {
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Si la room est privée et que l'utilisateur n'est pas le coach créateur
    // (On laisse passer si c'est public ou si c'est le coach)
    if (!room.is_public && !isCoach) {
      e.preventDefault()
      setShowAccessDenied(true)
      
      // On reset le message après 3 secondes
      setTimeout(() => setShowAccessDenied(false), 3000)
    }
  }

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {/* Overlay de cadenas si la room est privée et qu'on n'est pas coach */}
      {!room.is_public && !isCoach && (
        <div className="absolute top-2 right-2 z-10 bg-black/60 p-1.5 rounded-lg backdrop-blur-sm">
          <Lock size={14} className="text-gold" />
        </div>
      )}

      {/* Message d'accès refusé temporaire */}
      {showAccessDenied && (
        <div className="absolute inset-0 z-20 bg-background/90 flex items-center justify-center rounded-2xl border border-gold/50 animate-in fade-in zoom-in duration-200">
          <p className="text-[10px] font-bold text-gold px-4 text-center">
            PRIVATE ROOM<br/>
            <span className="text-muted-foreground font-medium italic">Invite link required</span>
          </p>
        </div>
      )}

      <div className={!room.is_public && !isCoach ? "opacity-60 grayscale-[0.5]" : ""}>
        <RoomCard room={room} />
      </div>
    </div>
  )
}