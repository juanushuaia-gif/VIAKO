'use client'

import { useState, useEffect } from 'react'

const TRAVELERS = [
  { id: 1, top: '30%', left: '28%', icon: '🚐', name: 'Mariana G.', dest: 'Bariloche → Esquel', pulse: true },
  { id: 2, top: '42%', left: '52%', icon: '🏍️', name: 'Diego R.', dest: 'Mendoza → San Juan', pulse: false },
  { id: 3, top: '24%', left: '68%', icon: '🚗', name: 'Lucas P.', dest: 'Córdoba → Sierras', pulse: true },
  { id: 4, top: '60%', left: '38%', icon: '🥾', name: 'Sofía M.', dest: 'El Chaltén', pulse: false },
  { id: 5, top: '18%', left: '58%', icon: '🏍️', name: 'Tomás V.', dest: 'Salta → Jujuy', pulse: false },
]

export default function MapPreview() {
  const [count, setCount] = useState(47)
  const [notification, setNotification] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => Math.max(40, Math.min(55, c + (Math.random() > 0.5 ? 1 : -1))))
    }, 3000)
    const n = setTimeout(() => setNotification(true), 2000)
    return () => { clearInterval(t); clearTimeout(n) }
  }, [])

  return (
    <div className="relative">
      <div className="bg-[#1a1f16] border border-viako-gold/12 rounded-2xl p-4 aspect-[4/5] relative overflow-hidden">

        {/* Grid de fondo */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(200,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Rutas simuladas */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10,80 Q30,60 50,50 Q70,40 90,20" fill="none" stroke="#C8A96E" strokeWidth="0.5" strokeDasharray="2 2"/>
          <path d="M20,90 Q40,70 60,60 Q80,50 95,30" fill="none" stroke="#C8A96E" strokeWidth="0.5"/>
          <path d="M5,50 Q25,45 45,35" fill="none" stroke="#C8A96E" strokeWidth="0.3" strokeDasharray="1 2"/>
        </svg>

        {/* Counter */}
        <div className="absolute top-4 left-4 bg-viako-dark/85 border border-viako-gold/20 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-viako-cream">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-bold text-viako-gold">{count}</span> viajeros activos
        </div>

        {/* Pins de viajeros */}
        {TRAVELERS.map(t => (
          <div key={t.id} className="absolute flex flex-col items-center animate-float"
            style={{ top: t.top, left: t.left, animationDelay: `${t.id * 0.5}s` }}>
            {t.pulse && (
              <div className="absolute w-10 h-10 rounded-full border-2 border-viako-gold/40 animate-ping" />
            )}
            <div className="w-10 h-10 rounded-full bg-viako-olive border-2 border-viako-gold flex items-center justify-center text-lg shadow-lg shadow-black/50 relative">
              {t.icon}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-viako-gold border-2 border-viako-dark flex items-center justify-center text-[8px] font-bold text-viako-dark">✓</div>
            </div>
            <div className="w-0.5 h-2 bg-viako-gold/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-viako-gold/30" />
          </div>
        ))}

        {/* Notificación de encuentro */}
        {notification && (
          <div className="absolute bottom-4 left-4 right-4 bg-viako-dark/92 border border-viako-gold/25 rounded-xl p-3 animate-fade-up">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">🤝</span>
              <div>
                <p className="text-viako-cream text-xs font-medium">Solicitud de encuentro</p>
                <p className="text-viako-fog text-xs mt-0.5">
                  <strong className="text-viako-cream">Diego R.</strong> va hacia Bariloche y pasa por tu zona el sábado
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-viako-gold text-viako-dark text-xs py-1.5 rounded-lg font-medium">
                ✓ Aceptar
              </button>
              <button className="flex-1 border border-white/10 text-viako-fog text-xs py-1.5 rounded-lg">
                Declinar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
