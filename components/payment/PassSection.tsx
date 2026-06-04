'use client'

import { useState } from 'react'
import Link from 'next/link'

const PASSES = [
  { type: 'weekend', emoji: '🏕️', name: 'Finde', days: 3, price: 5, perDay: 1.7, features: ['Mapa de viajeros', 'Botón emergencia', 'Chat viajeros', 'Asistente básico'] },
  { type: 'week', emoji: '🛣️', name: 'Semana', days: 7, price: 12, perDay: 1.7, features: ['Todo del Finde', 'Asistente completo', 'Encuentros en ruta', '5% descuento reservas'] },
  { type: 'month', emoji: '🌎', name: 'Ruta larga', days: 30, price: 28, perDay: 0.93, popular: true, features: ['Todo de Semana', 'Visibilidad en mapa', 'Soporte prioritario', '10% descuento reservas'] },
  { type: 'annual', emoji: '⭐', name: 'Anual ilimitado', days: 365, price: 60, perDay: 0.16, features: ['Todo sin límites', 'Acceso anticipado', 'Badge viajero anual', 'Mejor precio'] },
]

export default function PassSection() {
  const [selected, setSelected] = useState('month')

  return (
    <section className="py-20 px-6 bg-[#0a0908]" id="pass">
      <div className="max-w-5xl mx-auto">
        <p className="section-label">VIAKO PASS</p>
        <h2 className="font-display text-4xl text-viako-cream mb-2">
          Pagás solo<br/><em className="italic text-viako-gold">cuando viajás</em>
        </h2>
        <p className="text-viako-fog mb-10 max-w-lg">
          Sin suscripción fija. Activás el VIAKO PASS cuando salís de viaje y pagás solo esos días. Los días no vencen.
        </p>

        {/* Free tier */}
        <div className="border border-white/6 rounded-xl p-5 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-viako-cream font-medium">Explorador — Siempre gratis</h3>
            <div className="flex flex-wrap gap-4 mt-2">
              {['Ver experiencias', 'Reservar y pagar', 'Chat con organizador', 'Reviews'].map(f => (
                <span key={f} className="text-viako-fog text-xs flex items-center gap-1">
                  <span className="text-green-400">✓</span> {f}
                </span>
              ))}
            </div>
          </div>
          <span className="bg-green-400/10 border border-green-400/30 text-green-400 text-xs px-3 py-1.5 rounded-full tracking-wider">
            $0 · Para siempre
          </span>
        </div>

        {/* Pass grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PASSES.map(pass => (
            <div key={pass.type}
              onClick={() => setSelected(pass.type)}
              className={`relative border rounded-xl p-5 cursor-pointer transition-all ${
                pass.popular
                  ? 'border-viako-gold/50 bg-viako-olive/80'
                  : selected === pass.type
                  ? 'border-viako-gold/40 bg-viako-gold/5'
                  : 'border-white/8 bg-viako-olive/30 hover:border-viako-gold/25'
              }`}>
              {pass.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-viako-gold text-viako-dark text-xs font-medium px-3 py-0.5 rounded-full whitespace-nowrap">
                  ⭐ Más popular
                </div>
              )}
              <div className="text-2xl mb-2">{pass.emoji}</div>
              <div className="font-display text-viako-cream text-base mb-0.5">{pass.name}</div>
              <div className="text-viako-fog text-xs uppercase tracking-widest mb-3">{pass.days} días</div>
              <div className="font-display text-viako-gold text-3xl font-bold leading-none">U$S {pass.price}</div>
              <div className="text-viako-fog text-xs mt-1 mb-4">U$S {pass.perDay}/día</div>
              <ul className="space-y-1.5 border-t border-white/6 pt-3">
                {pass.features.map(f => (
                  <li key={f} className="text-viako-fog text-xs flex items-center gap-1.5">
                    <span className="text-viako-gold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-viako-fog text-xs text-center mt-4 opacity-70">
          Los días no vencen hasta que los usás · Podés pausar y retomar cuando quieras
        </p>

        <div className="text-center mt-8">
          <Link href="/pass" className="btn-gold">
            Activar VIAKO PASS
          </Link>
        </div>
      </div>
    </section>
  )
}
