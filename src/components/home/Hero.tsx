
import Link from "next/link"
import { siteConfig } from "@/config/site"
import GoldButton from "./ui/GoldButton"

const { hero } = siteConfig

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 gap-8">

      {/* Badge */}
      <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          {hero.badge}
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight text-foreground">
        {hero.headline} <br />
        <span className="text-primary">{hero.headlineAccent}</span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
        {hero.subtitle}
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4">
        <Link href={hero.ctaPrimaryHref}>
          <GoldButton>{hero.ctaPrimary}</GoldButton>
        </Link>
        <GoldButton outline>{hero.ctaSecondary}</GoldButton>
      </div>

      {/* Avatar stack */}
      <div className="flex items-center gap-6 pt-4">
        <div className="flex -space-x-2">
          {hero.avatars.map(({ initials }, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-foreground font-bold"
            >
              {initials}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">{hero.socialProofCount}</span>{" "}
          {hero.socialProof}
        </p>
      </div>
    </section>
  )
}



// import { siteConfig } from "@/config/site"
// import GoldButton from "./ui/GoldButton"

// const { hero } = siteConfig

// export default function Hero() {
//   return (
//     <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 gap-8">

//       {/* Badge */}
//       <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5">
//         <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//         <span className="text-primary text-xs font-semibold tracking-widest uppercase">
//           {hero.badge}
//         </span>
//       </div>

//       {/* Headline */}
//       <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight text-foreground">
//         {hero.headline} <br />
//         <span className="text-primary">{hero.headlineAccent}</span>
//       </h1>

//       {/* Subtitle */}
//       <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
//         {hero.subtitle}
//       </p>

//       {/* CTAs */}
//       <div className="flex items-center gap-4">
//         <GoldButton>
//           <Link href="auth/login">
//           {hero.ctaPrimary}

//           </Link></GoldButton>
//         <GoldButton outline>{hero.ctaSecondary}</GoldButton>
//       </div>

      

//       {/* Avatar stack */}
//       <div className="flex items-center gap-6 pt-4">
//         <div className="flex -space-x-2">
//           {hero.avatars.map(({ initials }, i) => (
//             <div
//               key={i}
//               className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-foreground font-bold"
//             >
//               {initials}
//             </div>
//           ))}
//         </div>
//         <p className="text-muted-foreground text-sm">
//           <span className="text-foreground font-semibold">{hero.socialProofCount}</span>{" "}
//           {hero.socialProof}
//         </p>
//       </div>
//     </section>
//   )
// }
