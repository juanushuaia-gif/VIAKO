'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import EmergencyButton from '@/components/emergency/EmergencyButton'

interface Traveler {
  id: string
  lat: number
  lng: number
  destination?: string
  vehicle_type?: string
  user?: { full_name: string; avatar_url?: string }
}

const VEHICLE_ICONS: Record<string, string> = {
  motorhome: '🚐', moto: '🏍️', auto: '🚗', trekking: '🥾', default: '📍'
}

export default function MapPage() {
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [count, setCount] = useState(0)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [visible, setVisible] = useState(true)
  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null)

  // Posición en el mapa simulada con pines animados
  const DEMO_TRAVELERS: Traveler[] = [
    { id: '1', lat: -41.1, lng: -71.3, destination: 'Bariloche', vehicle_type: 'motorhome', user: { full_name: 'Mariana G.' } },
    { id: '2', lat: -32.9, lng: -68.8, destination: 'Mendoza', vehicle_type: 'moto', user: { full_name: 'Diego R.' } },
    { id: '3', lat: -31.4, lng: -64.1, destination: 'Córdoba', vehicle_type: 'auto', user: { full_name: 'Lucas P.' } },
    { id: '4', lat: -49.3, lng: -72.9, destination: 'El Chaltén', vehicle_type: 'trekking', user: { full_name: 'Sofía M.' } },
    { id: '5', lat: -24.7, lng: -65.4, destination: 'Salta', vehicle_type: 'moto', user: { full_name: 'Tomás V.' } },
  ]

  useEffect(() => {
    setTravelers(DEMO_TRAVELERS)
    setCount(47)

    // Obtener mi ubicación
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }

    // Actualizar posición cada 30 segundos
    const interval = setInterval(async () => {
      const res = await fetch('/api/maps')
      if (res.ok) {
        const data = await res.json()
        if (data.travelers) setTravelers(data.travelers)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const toggleVisibility = async () => {
    const newVisible = !visible
    setVisible(newVisible)
    if (!newVisible) {
      await fetch('/api/maps', { method: 'DELETE' })
    } else if (myLocation) {
      await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: myLocation.lat, lng: myLocation.lng, visible: true }),
      })
    }
  }

  return (
    <div className="min-h-screen bg-viako-dark flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-4 py-3 bg-viako-dark/90 backdrop-blur-md border-b border-white/5 z-20">
        <Link href="/" className="font-display text-lg text-viako-gold tracking-widest">VIAKO</Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#111209] border border-white/8 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-viako-cream text-xs font-bold">{count}</span>
            <span className="text-viako-fog text-xs">viajeros activos</span>
          </div>
        </div>
      </nav>

      {/* Mapa simulado (en producción usar Mapbox o Google Maps) */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0e1a]">

        {/* Fondo tipo mapa */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(200,169,110,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Rutas simuladas */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10,80 Q30,60 50,50 Q70,40 90,20" fill="none" stroke="rgba(200,169,110,0.1)" strokeWidth="0.3" strokeDasharray="1 1"/>
          <path d="M20,90 Q40,70 60,60 Q80,50 95,30" fill="none" stroke="rgba(200,169,110,0.08)" strokeWidth="0.4"/>
          <path d="M5,50 Q25,45 45,35 Q65,25 85,15" fill="none" stroke="rgba(200,169,110,0.06)" strokeWidth="0.3" strokeDasharray="0.5 1"/>
          <path d="M15,85 Q35,75 55,65" fill="none" stroke="rgba(200,169,110,0.07)" strokeWidth="0.3"/>
        </svg>

        {/* Outline Argentina */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <svg viewBox="0 0 100 200" className="h-full max-h-full">
            <path d="M45,5 L60,8 L70,15 L75,25 L65,35 L70,50 L65,70 L70,90 L60,110 L55,130 L50,150 L45,165 L40,175 L35,170 L30,160 L35,145 L40,130 L35,110 L40,90 L35,70 L40,50 L35,35 L45,25 L40,15 Z"
              fill="rgba(200,169,110,1)" />
          </svg>
        </div>

        {/* Pines de viajeros */}
        {travelers.map((traveler, i) => {
          // Posiciones en porcentaje del viewport
          const positions = [
            { top: '25%', left: '42%' },
            { top: '38%', left: '35%' },
            { top: '50%', left: '48%' },
            { top: '68%', left: '40%' },
            { top: '18%', left: '52%' },
          ]
          const pos = positions[i % positions.length]
          const icon = VEHICLE_ICONS[traveler.vehicle_type || 'default']

          return (
            <button
              key={traveler.id}
              className="absolute flex flex-col items-center animate-float group"
              style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.7}s` }}
              onClick={() => setSelectedTraveler(selectedTraveler?.id === traveler.id ? null : traveler)}
            >
              <div className="w-12 h-12 rounded-full bg-viako-olive border-2 border-viako-gold flex items-center justify-center text-xl shadow-xl shadow-black/60 group-hover:scale-110 transition-transform">
                {icon}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-viako-gold border-2 border-viako-dark text-[8px] flex items-center justify-center text-viako-dark font-bold">✓</div>
              </div>
              <div className="w-0.5 h-2 bg-viako-gold/50" />
              <div className="w-2 h-2 rounded-full bg-viako-gold/30" />

              {/* Tooltip */}
              {selectedTraveler?.id === traveler.id && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-viako-dark/95 border border-viako-gold/30 rounded-xl p-3 min-w-[160px] shadow-2xl">
                  <p className="text-viako-cream text-xs font-medium">{traveler.user?.full_name}</p>
                  <p className="text-viako-fog text-xs">{icon} {traveler.destination}</p>
                  <button className="mt-2 w-full bg-viako-gold text-viako-dark text-xs py-1.5 rounded-lg font-medium">
                    🤝 Solicitar encuentro
                  </button>
                </div>
              )}
            </button>
          )
        })}

        {/* Mi posición */}
        {myLocation && (
          <div className="absolute" style={{ top: '45%', left: '50%' }}>
            <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-lg">
              <div className="w-4 h-4 rounded-full bg-blue-400 animate-ping absolute inset-0 opacity-40" />
            </div>
          </div>
        )}

        {/* Panel de control */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <div className="flex-1 bg-viako-dark/90 backdrop-blur-md border border-white/10 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-viako-cream text-xs font-medium">Mi visibilidad</span>
              <button
                onClick={toggleVisibility}
                className={`w-10 h-5 rounded-full transition-colors relative ${visible ? 'bg-viako-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${visible ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <p className="text-viako-fog text-xs">
              {visible ? '✓ Visible para viajeros VIAKO' : '○ Modo invisible'}
            </p>
          </div>

          <Link href="/experiences"
            className="bg-viako-gold text-viako-dark px-4 rounded-2xl flex items-center text-xs font-medium">
            🧭 Explorar
          </Link>
        </div>
      </div>

      {/* Botón de emergencia */}
      <EmergencyButton countryCode="AR" />

      {/* Nav inferior */}
      <div className="flex items-center justify-around py-3 bg-viako-dark/90 border-t border-white/5">
        {[
          { href: '/experiences', icon: '🧭', label: 'Explorar' },
          { href: '/map', icon: '🗺️', label: 'Mapa', active: true },
          { href: '/dashboard/bookings', icon: '📋', label: 'Reservas' },
          { href: '/chat', icon: '💬', label: 'Chat' },
          { href: '/profile', icon: '👤', label: 'Perfil' },
        ].map(({ href, icon, label, active }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1 ${active ? 'text-viako-gold' : 'text-viako-fog hover:text-viako-cream'}`}>
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] tracking-wide">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
