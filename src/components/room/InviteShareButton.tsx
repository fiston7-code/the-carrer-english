'use client'

import { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'

type Props = {
  inviteCode: string
  roomTitle: string
}

export default function InviteShareButton({ inviteCode, roomTitle }: Props) {
  const [copied, setCopied] = useState(false)

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${inviteCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Join my English session "${roomTitle}" on The Career English!\n\n🔗 ${inviteLink}\n\nCode: ${inviteCode}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <div className="bg-surface border border-gold/30 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-xs text-gold font-bold uppercase tracking-wider">
        Invite your students
      </p>

      {/* Code */}
      <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Invite Code</p>
          <p className="text-xl font-black text-gold tracking-widest">{inviteCode}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-surface border border-border hover:border-gold transition-colors"
        >
          {copied
            ? <Check size={16} className="text-green-400" />
            : <Copy size={16} className="text-muted-foreground" />
          }
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 rounded-xl border border-border bg-surface
                     text-sm font-semibold text-foreground hover:border-gold transition-colors
                     flex items-center justify-center gap-2"
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500
                     text-white text-sm font-semibold transition-colors
                     flex items-center justify-center gap-2"
        >
          <Share2 size={14} />
          WhatsApp
        </button>
      </div>
    </div>
  )
}