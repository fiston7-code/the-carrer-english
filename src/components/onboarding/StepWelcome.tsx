import { Sparkles, ArrowRight } from 'lucide-react'

export default function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm w-full">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full ${i === 0 ? 'bg-gold' : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center mb-6">
        <Sparkles className="text-primary-foreground w-9 h-9" />
      </div>

      {/* Text */}
      <h1 className="text-foreground text-3xl font-bold mb-2">Welcome to</h1>
      <h2 className="text-gold text-3xl font-bold mb-4">The Career English</h2>
      <p className="text-steel text-sm mb-10">
        Let&apos;s personalize your learning experience in 30 seconds
      </p>

      {/* Button */}
      <button
        onClick={onNext}
        className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition"
      >
        Let&apos;s Go <ArrowRight size={18} />
      </button>
    </div>
  )
}

