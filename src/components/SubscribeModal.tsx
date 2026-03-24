'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'

const WHATSAPP_NUMBER = "243993769146"   // ← ton numéro WhatsApp
const AIRTEL_NUMBER   = "+243 993769146" // ← ton Airtel
const MPESA_NUMBER    = "+243 839892864" // ← ton M-Pesa

type Props = {
  isOpen:   boolean
  onClose:  () => void
  userName: string
  email:    string
}

export default function SubscribeModal({ isOpen, onClose, userName, email }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!isOpen) return null

  const whatsappMessage = encodeURIComponent(
    `Hello, I want to subscribe to The Career English Pro.\nName: ${userName}\nEmail: ${email}`
  )

  const copyNumber = (number: string, label: string) => {
    navigator.clipboard.writeText(number)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface-elevated border border-border rounded-2xl w-full max-w-md flex flex-col gap-5 p-5 pb-8">

        {/* Handle + Header */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground text-base">Upgrade to Pro</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Unlimited access to all live sessions
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Prix + Features */}
        <div className="bg-surface border border-gold/30 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-gold">$10</span>
            <span className="text-muted-foreground text-sm mb-1">/mois</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              "Unlimited live sessions",
              "Real-time coach feedback",
              "Correction history",
              "Progress tracking",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={9} className="text-gold" />
                </div>
                <span className="text-xs text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Étapes */}
        <div className="flex flex-col gap-2">
          {[
            "Send $10 via Airtel Money or M-Pesa",
            "Take a screenshot of the confirmation",
            "Send it on WhatsApp with your email",
            "Account activated within 24h ✅",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-gold text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        {/* Numéros — cliquables pour copier */}
        <div className="flex flex-col gap-2">
          {[
            { label: 'Airtel Money', number: AIRTEL_NUMBER },
            { label: 'M-Pesa',       number: MPESA_NUMBER  },
          ].map(({ label, number }) => (
            <button
              key={label}
              onClick={() => copyNumber(number, label)}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-gold/40 transition-colors"
            >
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-foreground font-bold text-sm">{number}</p>
              </div>
              <span className="text-xs text-gold font-medium">
                {copied === label ? '✅ Copied!' : 'Copy'}
              </span>
            </button>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500
                     text-white font-bold text-sm text-center transition-colors"
        >
          📱 Send proof on WhatsApp
        </a>

      </div>
    </div>
  )
}