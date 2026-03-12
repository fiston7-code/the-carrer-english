import { siteConfig } from "@/config/site"
import SectionLabel from "./ui/SectionLabel"

const { howItWorks } = siteConfig

function StepBadge({ number }: { number: number }) {
  return (
    <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center text-primary text-sm font-bold shrink-0">
      {number}
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30 border-y border-border ">
      <div className="max-w-2xl mx-auto px-8 flex flex-col gap-10 hover:border-primary/20 transition-all duration-300">
        <div className="text-center flex flex-col gap-3">
          <SectionLabel>{howItWorks.label}</SectionLabel>
          <h2 className="text-3xl font-bold text-foreground">{howItWorks.title}</h2>
        </div>
        <div className="flex flex-col gap-6">
          {howItWorks.steps.map(({ title, description }, i) => (
            <div key={i} className="flex items-start gap-4">
              <StepBadge number={i + 1} />
              <div>
                <p className="text-foreground font-semibold">{title}</p>
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}