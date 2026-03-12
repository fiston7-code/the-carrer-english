import { ArrowRight } from 'lucide-react'

const levels = [
  {
    id: 'beginner',
    label: 'Beginner',
    range: 'A1 – A2',
    desc: 'I can introduce myself and ask simple questions',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    range: 'B1 – B2',
    desc: 'I can discuss work topics and write professional emails',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    range: 'C1 – C2',
    desc: 'I can negotiate, present, and debate fluently',
  },
]

type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export default function StepLevel({ value, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col max-w-sm w-full">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full ${i <= 1 ? 'bg-yellow-400' : 'bg-gray-700'}`}
          />
        ))}
      </div>

      <h2 className="text-white text-2xl font-bold text-center mb-1">
        What is your current English level?
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Select the one that fits you best
      </p>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-8">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition
              ${value === level.id
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{level.label}</span>
              <span className="text-gray-400 text-sm">{level.range}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{level.desc}</p>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition"
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  )
}