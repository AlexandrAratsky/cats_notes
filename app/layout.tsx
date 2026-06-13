import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"

import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { getCats } from "@/lib/cats-config"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cats = getCats()

  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <Suspense fallback={null}>
            <AppShell cats={cats}>{children}</AppShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
