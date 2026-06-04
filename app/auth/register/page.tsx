'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', is_organizer: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          is_organizer: form.is_organizer,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard?welcome=1')
    }
  }

  return (
    <div className="min-h-screen bg-viako-dark flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-viako-gold tracking-[0.2em] block text-center mb-10">
          VIAKO
        </Link>

        <div className="bg-[#111209] border border-white/8 rounded-2xl p-8">
          <h1 className="font-display text-2xl text-viako-cream mb-1">Crear cuenta</h1>
          <p className="text-viako-fog text-sm mb-6">Gratis para siempre</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              required
              className="input-dark"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              className="input-dark"
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              minLength={8}
              required
              className="input-dark"
            />

            {/* Tipo de usuario */}
            <div className="border border-white/8 rounded-xl p-4">
              <p className="text-viako-cream text-sm mb-3">¿Cómo vas a usar VIAKO?</p>
              <div className="space-y-2">
                <button type="button"
                  onClick={() => set('is_organizer', false)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    !form.is_organizer ? 'border-viako-gold bg-viako-gold/10 text-viako-cream' : 'border-white/8 text-viako-fog hover:border-white/20'
                  }`}>
                  <span className="text-xl">🗺️</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">Soy viajero</div>
                    <div className="text-xs opacity-60">Quiero explorar y reservar experiencias</div>
                  </div>
                </button>
                <button type="button"
                  onClick={() => set('is_organizer', true)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    form.is_organizer ? 'border-viako-gold bg-viako-gold/10 text-viako-cream' : 'border-white/8 text-viako-fog hover:border-white/20'
                  }`}>
                  <span className="text-xl">📍</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">Soy organizador</div>
                    <div className="text-xs opacity-60">Quiero publicar y vender experiencias</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full text-center disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="mt-4 text-center text-viako-fog text-xs">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-viako-gold hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
