// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=DM+Sans:wght@100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-viako-dark text-viako-sand font-body antialiased">
        {children}
      </body>
    </html>
  )
}
