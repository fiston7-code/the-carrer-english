
'use client'

import { useState } from 'react'
import SubscribeModal from '@/components/SubscribeModal'

type Props = {
  userName: string
  email: string
}

export default function UpgradeButton({ userName, email }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 rounded-xl bg-gold text-black font-bold text-sm"
      >
        ⚡ Upgrade to Pro
      </button>

      <SubscribeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userName={userName}
        email={email}
      />
    </>
  )
}