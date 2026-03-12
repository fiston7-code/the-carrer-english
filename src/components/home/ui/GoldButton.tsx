type GoldButtonProps = {
  children: React.ReactNode
  outline?: boolean
  onClick?: () => void
}

export default function GoldButton({ children, outline = false, onClick }: GoldButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full font-semibold px-8 py-3 text-sm transition-all duration-200 ${
        outline
          ? "border border-primary/50 text-primary hover:border-primary hover:text-primary/80"
          : "bg-primary hover:bg-[hsl(var(--gold-dim))] text-primary-foreground hover:bg-primary/50"
      }`}
    >
      {children}
    </button>
  )
}