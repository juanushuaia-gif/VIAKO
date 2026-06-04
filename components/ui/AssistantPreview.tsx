'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

const DEMO_MESSAGES = [
  { role: 'user', content: '¿Cuánto sale ir de Tigre a Bariloche en motorhome?' },
  { role: 'assistant', content: 'Para esa ruta (~1.600 km) calculá:\n\n🚐 Combustible: ~$180.000 ARS\n🏕️ Campings 5 noches: ~$60.000 ARS\n🗺️ Peajes: ~$15.000 ARS\n\nTotal estimado: **$255.000 ARS**\n\nTe recomiendo la Ruta 40 por las Sierras de Córdoba antes de bajar a la Patagonia. ¿Querés que te arme el itinerario completo?' },
]

export default function AssistantPreview() {
  const [messages, setMessages] = useState(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(m => [...m, {
        role: 'assistant',
        content: '¡Perfecto! Para esa ruta tengo varias experiencias VIAKO disponibles. ¿Preferís ir solo o con un grupo de motorhomeros? Tengo una caravana organizada saliendo el próximo fin de semana largo. 🚐',
      }])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-white/6">
        <div className="w-9 h-9 rounded-full bg-viako-olive border border-viako-gold/30 flex items-center justify-center text-lg">🤖</div>
        <div>
          <div className="text-viako-cream text-sm font-medium">Asistente VIAKO</div>
          <div className="text-green-400 text-xs">● En línea</div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
              msg.role === 'user'
                ? 'bg-viako-gold text-viako-dark'
                : 'bg-[#2a2a2a] text-viako-sand'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] px-3 py-2 rounded-xl text-viako-fog text-xs">
              Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/6 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="¿A dónde querés ir?"
          className="flex-1 bg-[#222] border border-white/8 rounded-xl px-3 py-2 text-viako-cream text-xs placeholder:text-viako-fog focus:outline-none focus:border-viako-gold/40"
        />
        <button onClick={send}
          className="w-9 h-9 bg-viako-gold rounded-xl flex items-center justify-center hover:bg-viako-cream transition-colors">
          <Send size={14} className="text-viako-dark" />
        </button>
      </div>
    </div>
  )
}
