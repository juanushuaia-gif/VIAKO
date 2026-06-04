'use client'

import { useState, useRef, useCallback } from 'react'
import { AlertTriangle, X, Phone } from 'lucide-react'

interface Props {
  countryCode?: string
  onActivated?: () => void
}

export default function EmergencyButton({ countryCode = 'AR', onActivated }: Props) {
  const [state, setstate] = useState<'idle' | 'holding' | 'confirming' | 'active' | 'calling'>('idle')
  const [progress, setProgress] = useState(0)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)

  const HOLD_DURATION = 3000

  const startHold = useCallback(() => {
    setstate('holding')
    setProgress(0)
    const start = Date.now()

    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(progressTimer.current)
        setstate('confirming')
      }
    }, 30)
  }, [])

  const cancelHold = useCallback(() => {
    clearInterval(progressTimer.current)
    clearTimeout(holdTimer.current)
    setstate('idle')
    setProgress(0)
  }, [])

  const confirmEmergency = useCallback(async () => {
    setstate('calling')

    try {
      // Obtener GPS
      const position = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      )

      const { latitude: lat, longitude: lng } = position.coords

      // Llamar API de emergencia
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, country_code: countryCode }),
      })

      setstate('active')
      onActivated?.()
    } catch (err) {
      // Activar igualmente aunque no haya GPS
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: 0, lng: 0, country_code: countryCode }),
      })
      setstate('active')
    }
  }, [countryCode, onActivated])

  const EMERGENCY_NUMBERS: Record<string, string> = {
    AR: '911', CL: '133', UY: '911', BR: '190',
    CO: '123', MX: '911', ES: '112', PT: '112',
  }

  const number = EMERGENCY_NUMBERS[countryCode] || '911'

  if (state === 'active') {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <div className="bg-red-600 text-white rounded-2xl p-4 shadow-2xl max-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} />
            <span className="text-sm font-medium">Emergencia activa</span>
          </div>
          <p className="text-xs opacity-80 mb-3">
            Contacto notificado · Grupo alertado
          </p>
          <a href={`tel:${number}`}
            className="block text-center bg-white text-red-600 rounded-lg py-2 text-sm font-bold">
            Llamar al {number}
          </a>
        </div>
      </div>
    )
  }

  if (state === 'confirming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-red-600 rounded-2xl p-8 mx-4 text-center max-w-sm">
          <AlertTriangle size={48} className="text-white mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">¿Confirmar emergencia?</h2>
          <p className="text-red-100 text-sm mb-6">
            Se llamará al {number}, se enviará tu GPS a tu contacto de emergencia y se alertará a tu grupo de viaje.
          </p>
          <div className="flex gap-3">
            <button onClick={cancelHold}
              className="flex-1 bg-white/20 text-white py-3 rounded-xl font-medium">
              Cancelar
            </button>
            <button onClick={confirmEmergency}
              className="flex-1 bg-white text-red-600 py-3 rounded-xl font-bold">
              🆘 Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'calling') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Phone size={40} className="text-white" />
          </div>
          <p className="text-white text-lg font-medium">Enviando alerta...</p>
          <p className="text-white/60 text-sm mt-1">Obteniendo ubicación GPS</p>
        </div>
      </div>
    )
  }

  return (
    <button
      className="fixed bottom-24 right-4 z-40"
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onMouseLeave={cancelHold}
    >
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform ${
        state === 'holding' ? 'scale-110' : 'scale-100'
      }`}
        style={{ background: state === 'holding' ? '#dc2626' : '#b91c1c' }}
      >
        {/* Progress ring */}
        {state === 'holding' && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="3"
              strokeDasharray={`${(progress / 100) * 188.5} 188.5`} opacity="0.8"/>
          </svg>
        )}
        <AlertTriangle size={24} className="text-white" />
      </div>
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-red-500 whitespace-nowrap font-medium">
        {state === 'holding' ? 'Soltar para cancelar' : '🆘 Emergencia'}
      </span>
    </button>
  )
}
