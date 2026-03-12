export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-primary text-xs font-semibold tracking-widest uppercase">
      {children}
    </span>
  )
}