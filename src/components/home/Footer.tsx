import { siteConfig } from "@/config/site"

export default function Footer() {
  return (
    <footer className="flex justify-between items-center px-8 py-6 border-t border-border">
      <span className="text-primary font-bold text-sm tracking-tighter">
        {siteConfig.name}
      </span>
      <span className="text-muted-foreground text-xs">{siteConfig.footer.copyright}</span>
    </footer>
  )
}