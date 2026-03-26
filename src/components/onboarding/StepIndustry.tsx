import { ArrowRight } from 'lucide-react'

const industries = [
  'Banking & Finance',
  'Mining & Energy',
  'NGO & Development',
  'Telecom & Tech',
  'Healthcare',
  'Government & Public Sector',
]

type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export default function StepIndustry({ value, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col max-w-sm w-full">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full ${i <= 2 ? 'bg-gold' : 'bg-muted'}`}
          />
        ))}
      </div>

      <h2 className="text-foreground text-2xl font-bold text-center mb-1">
        What is your industry?
      </h2>
      <p className="text-steel text-sm text-center mb-6">
        We&apos;ll tailor rooms &amp; vocabulary to your field
      </p>

      {/* Grid options */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {industries.map((industry) => (
          <button
            key={industry}
            onClick={() => onChange(industry)}
            className={`px-4 py-4 rounded-xl border text-sm font-medium transition text-center
              ${value === industry
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border bg-surface text-foreground hover:border-secondary'
              }`}
          >
            {industry}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className="w-full bg-gold-dim hover:bg-gold-dim/90 disabled:opacity-40 disabled:cursor-not-allowed text-foreground font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition"
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  )
}

