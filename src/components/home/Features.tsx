import { siteConfig } from "@/config/site"
import SectionLabel from "./ui/SectionLabel"

const { features } = siteConfig

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="text-foreground font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-8 py-20 flex flex-col gap-12">
      <div className="text-center flex flex-col gap-3">
        <SectionLabel>{features.label}</SectionLabel>
        <h2 className="text-3xl font-bold text-foreground">{features.title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.items.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  )
}