import Navbar from "@/components/home/Navbar"
import Hero from "@/components/home/Hero"
import Divider from "@/components/home/ui/Divider"
import Features from "@/components/home/Features"
import HowItWorks from "@/components/home/HowItWorks"
import FinalCTA from "@/components/home/FinalCTA"


export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <Hero />
      <Divider />
      <Features />
      <HowItWorks />
      <FinalCTA />
      
    </main>
  )
}