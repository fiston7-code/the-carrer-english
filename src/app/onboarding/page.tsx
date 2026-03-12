'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StepWelcome from '@/components/onboarding/StepWelcome'
import StepLevel from '@/components/onboarding/StepLevel'
import StepIndustry from '@/components/onboarding/StepIndustry'
import StepGoals from '@/components/onboarding/StepGoals'
import StepRole from '@/components/onboarding/StepRole'

export type OnboardingData = {
  english_level: string
  industry: string
  career_goals: string[]
  professional_role: string
  company_name: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    english_level: '',
    professional_role: '',
    company_name: '',
    industry: '',
    career_goals: [],
  })

  const nextStep = () => setStep((s) => s + 1)



//   const { error } = await supabase
//     .from('profiles')
//     .upsert({
//       id: user.id,                    // ← obligatoire pour upsert
//       email: user.email,              // ← récupéré depuis auth
//       full_name: user.user_metadata?.full_name,
//       english_level: data.english_level,
//       industry: data.industry,
//       career_goals: data.career_goals,
//       onboarding_completed: true,
//     })

//   if (error) {
//   console.error('SUPABASE ERROR:', JSON.stringify(error, null, 2))
//   alert(error.message) // ← brutal mais efficace pour debug
//   setLoading(false)
//   return
// }

const handleFinish = async () => {
  setLoading(true)

  console.log('data au moment de finish:', data) // ← ajoute ça

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push('/auth/login')
    return
  }

  const { data: result, error } = await supabase
    .from('profiles')
    .update({
      english_level: data.english_level,
      industry: data.industry,
      career_goals: data.career_goals,
      professional_role: data.professional_role,
      company_name: data.company_name,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()

  console.log('user.id:', user.id)
  console.log('result:', result)
  console.log('error:', error)

  if (error) {
    alert(error.message)
    setLoading(false)
    return  // ← stop ici si erreur
  }

  router.push('/auth/dashboard')  // ← seulement si succès
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
  <StepRole                                         // ← index 3
    key="role"
    roleValue={data.professional_role}
    companyValue={data.company_name}
    onRoleChange={(v) => setData({ ...data, professional_role: v })}
    onCompanyChange={(v) => setData({ ...data, company_name: v })}
    onNext={nextStep}
  />,
  <StepGoals                                        // ← index 4
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