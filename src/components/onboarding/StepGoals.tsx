import { Briefcase, Mic, BookOpen, Sparkles } from 'lucide-react'

const goals = [
  { id: 'interview_prep', label: 'Interview Prep', icon: Briefcase },
  { id: 'public_speaking', label: 'Public Speaking', icon: Mic },
  { id: 'business_networking', label: 'Business Networking', icon: BookOpen },
]

type Props = {
  value: string[]
  onChange: (v: string[]) => void
  onFinish: () => void
  loading: boolean
}

export default function StepGoals({ value, onChange, onFinish, loading }: Props) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="flex flex-col max-w-sm w-full">
      {/* Progress dots — tous actifs */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 w-10 rounded-full bg-yellow-400" />
        ))}
      </div>

      <h2 className="text-white text-2xl font-bold text-center mb-1">
        What are your career goals?
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">Select all that apply</p>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-8">
        {goals.map(({ id, label, icon: Icon }) => {
          const selected = value.includes(id)
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex items-center justify-between px-5 py-4 rounded-xl border transition
                ${selected
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${selected ? 'bg-yellow-400' : 'bg-gray-800'}`}>
                  <Icon size={18} className={selected ? 'text-black' : 'text-gray-400'} />
                </div>
                <span className="text-white font-medium">{label}</span>
              </div>

              {/* Checkbox */}
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center
                ${selected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-600'}`}>
                {selected && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={onFinish}
        disabled={value.length === 0 || loading}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition"
      >
        {loading ? 'Loading...' : (
          <><Sparkles size={18} /> Enter the Lounge</>
        )}
      </button>
    </div>
  )
}