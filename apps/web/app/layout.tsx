import type { Metadata } from "next"
import Script from "next/script"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: "ThirdEye Lager",
  description: "Lagerbestand und Worker-Kamera.",
  icons: {
    icon: [
      { url: "/thirdeye-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/thirdeye-logo.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        "font-sans not-italic antialiased"
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({
            token: "e29880e96764498fa6dd634949ad0883",
          })}
        />
      </body>
    </html>
  )
}
