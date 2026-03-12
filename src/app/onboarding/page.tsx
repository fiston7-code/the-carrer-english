'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StepWelcome from '@/components/onboarding/StepWelcome'
import StepLevel from '@/components/onboarding/StepLevel'
import StepIndustry from '@/components/onboarding/StepIndustry'
import StepGoals from '@/components/onboarding/StepGoals'

export type OnboardingData = {
  english_level: string
  industry: string
  career_goals: string[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    english_level: '',
    industry: '',
    career_goals: [],
  })

  const nextStep = () => setStep((s) => s + 1)

const handleFinish = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    router.push('/login')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,                    // ← obligatoire pour upsert
      email: user.email,              // ← récupéré depuis auth
      full_name: user.user_metadata?.full_name,
      english_level: data.english_level,
      industry: data.industry,
      career_goals: data.career_goals,
      onboarding_completed: true,
    })

  if (error) {
    console.error(error)
    setLoading(false)
    return
  }

  router.push('/dashboard')
}

  const steps = [
    <StepWelcome key="welcome" onNext={nextStep} />,
    <StepLevel
      key="level"
      value={data.english_level}
      onChange={(v) => setData({ ...data, english_level: v })}
      onNext={nextStep}
    />,
    <StepIndustry
      key="industry"
      value={data.industry}
      onChange={(v) => setData({ ...data, industry: v })}
      onNext={nextStep}
    />,
    <StepGoals
      key="goals"
      value={data.career_goals}
      onChange={(v) => setData({ ...data, career_goals: v })}
      onFinish={handleFinish}
      loading={loading}
    />,
  ]

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {steps[step]}
    </div>
  )
}