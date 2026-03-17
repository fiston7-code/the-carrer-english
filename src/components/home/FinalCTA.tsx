import { siteConfig } from "@/config/site"
import GoldButton from "./ui/GoldButton"


const { finalCta } = siteConfig

export default function FinalCTA() {
  return (
    <section className="flex flex-col items-center text-center px-6 py-24 gap-6">
      <h2 className="text-4xl font-bold text-foreground max-w-lg leading-tight">
        {finalCta.headline}{" "}
        <span className="text-primary">{finalCta.headlineAccent}</span>?
      </h2>
      <p className="text-muted-foreground max-w-sm">{finalCta.subtitle}</p>
        <GoldButton>{finalCta.cta}</GoldButton>
    </section>
  )
}