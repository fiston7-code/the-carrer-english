import { Sparkles, ArrowRight } from 'lucide-react'

export default function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center max-w-sm w-full">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-gray-700'}`}
          />
        ))}
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mb-6">
        <Sparkles className="text-black w-9 h-9" />
      </div>

      {/* Text */}
      <h1 className="text-white text-3xl font-bold mb-2">Welcome to</h1>
      <h2 className="text-yellow-400 text-3xl font-bold mb-4">The Career English</h2>
      <p className="text-gray-400 text-sm mb-10">
        Let&apos;s personalize your learning experience in 30 seconds
      </p>

      {/* Button */}
      <button
        onClick={onNext}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition"
      >
        Let's Go <ArrowRight size={18} />
      </button>
    </div>
  )
}