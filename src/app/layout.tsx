import type { Metadata } from "next"

import { Inter } from "next/font/google"
import { siteConfig } from "@/config/site"
import "./globals.css"
import Navbar from "@/components/home/Navbar"
import Footer from "@/components/layout/Footer"
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>

         <Navbar />

          <main>{children}</main>

        </body>
      </html>
  
  )
}