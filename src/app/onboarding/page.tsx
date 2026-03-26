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
  phone_number: string 
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
  phone_number: '', // ← Initialisé vide
  industry: '',
  career_goals: [],
})

  const nextStep = () => setStep((s) => s + 1)


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
      phone_number: data.phone_number,
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

  router.push('/dashboard')  // ← seulement si succès
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
  />,                                       // ← index 3
  <StepRole
  key="role"
  roleValue={data.professional_role}
  companyValue={data.company_name}
  phoneValue={data.phone_number} // ← On passe la valeur
  onRoleChange={(v) => setData({ ...data, professional_role: v })}
  onCompanyChange={(v) => setData({ ...data, company_name: v })}
  onPhoneChange={(v) => setData({ ...data, phone_number: v })} // ← On passe le setter
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