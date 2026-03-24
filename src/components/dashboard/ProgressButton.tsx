// components/dashboard/ProgressButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SubscribeModal from '@/components/SubscribeModal'

type Props = {
  isPro: boolean
  isCoach: boolean
  userName: string
  email: string
}

export default function ProgressButton({ isPro, isCoach, userName, email }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    if (!isPro && !isCoach) {
      setShowModal(true)
      return
    }
    router.push('/progress')
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="block w-full text-center bg-gold hover:bg-gold-dim
                   text-primary-foreground font-bold py-4 rounded-2xl
                   transition-colors duration-200 text-sm"
      >
        View My Progress
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