// app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VIAKO — Experiencias reales, viajes auténticos',
  description: 'Marketplace de experiencias de viaje en Argentina y América Latina. Motorhome, rutas, escapadas, trekking y más.',
  keywords: 'viajes, experiencias, motorhome, moto, trekking, argentina, patagonia',
  openGraph: {
    title: 'VIAKO',
    description: 'Experiencias reales, viajes auténticos',
    url: 'https://viako.app',
    siteName: 'VIAKO',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-viako-dark text-viako-sand font-body antialiased">
        {children}
      </body>
    </html>
  )
}
