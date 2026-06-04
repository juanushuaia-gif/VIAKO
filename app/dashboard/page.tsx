// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, viako_passes(*)')
    .eq('id', user.id)
    .single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, experience:experiences(title, cover_image, location_name, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const activePass = profile?.viako_passes?.find((p: any) => p.status === 'active')

  return (
    <div className="min-h-screen bg-viako-dark">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-viako-dark/90 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="font-display text-lg text-viako-gold tracking-widest">VIAKO</Link>
        <div className="flex items-center gap-4">
          <Link href="/map" className="text-viako-fog text-sm hover:text-viako-cream">🗺️ Mapa</Link>
          <Link href="/experiences" className="text-viako-fog text-sm hover:text-viako-cream">Explorar</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-viako-cream">
            Hola, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-viako-fog mt-1">¿A dónde vas hoy?</p>
        </div>

        {/* Estado verificación */}
        {profile?.verification_status === 'unverified' && (
          <div className="bg-viako-gold/10 border border-viako-gold/30 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-viako-cream font-medium text-sm">Verificá tu identidad</p>
              <p className="text-viako-fog text-xs mt-0.5">Para reservar experiencias necesitás verificar tu DNI</p>
            </div>
            <Link href="/profile/verify" className="btn-gold text-xs py-2 px-4">
              Verificar ahora
            </Link>
          </div>
        )}

        {/* VIAKO PASS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {activePass ? (
            <div className="bg-viako-olive border border-viako-gold/30 rounded-xl p-5 col-span-1">
              <p className="text-viako-gold text-xs tracking-widest uppercase mb-2">VIAKO PASS activo</p>
              <p className="font-display text-2xl text-viako-cream font-bold">{activePass.days_remaining}</p>
              <p className="text-viako-fog text-xs">días disponibles</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                <div className="bg-viako-gold h-1.5 rounded-full" style={{ width: `${(activePass.days_remaining / activePass.days_total) * 100}%` }} />
              </div>
            </div>
          ) : (
            <div className="bg-[#111209] border border-dashed border-white/15 rounded-xl p-5 col-span-1">
              <p className="text-viako-fog text-xs tracking-widest uppercase mb-2">Sin VIAKO PASS</p>
              <p className="text-viako-cream text-sm mb-3">Activá el mapa y el botón de emergencia</p>
              <Link href="/pass" className="text-viako-gold text-xs hover:underline">Ver packs →</Link>
            </div>
          )}

          <div className="bg-[#111209] border border-white/5 rounded-xl p-5">
            <p className="text-viako-fog text-xs uppercase tracking-widest mb-2">Reservas</p>
            <p className="font-display text-3xl text-viako-cream">{bookings?.length || 0}</p>
            <Link href="/dashboard/bookings" className="text-viako-gold text-xs hover:underline mt-1 block">Ver todas →</Link>
          </div>

          <div className="bg-[#111209] border border-white/5 rounded-xl p-5">
            <p className="text-viako-fog text-xs uppercase tracking-widest mb-2">Identidad</p>
            <p className={`text-sm font-medium ${
              profile?.verification_status === 'verified' ? 'text-green-400' :
              profile?.verification_status === 'pending' ? 'text-yellow-400' : 'text-viako-fog'
            }`}>
              {profile?.verification_status === 'verified' ? '✓ Verificado' :
               profile?.verification_status === 'pending' ? '⏳ En proceso' : '○ Sin verificar'}
            </p>
            <Link href="/profile/verify" className="text-viako-gold text-xs hover:underline mt-1 block">
              {profile?.verification_status === 'verified' ? 'Ver detalles' : 'Verificar →'}
            </Link>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/experiences', icon: '🧭', label: 'Explorar' },
            { href: '/map', icon: '🗺️', label: 'Mapa' },
            { href: '/chat', icon: '💬', label: 'Chat' },
            { href: '/profile', icon: '👤', label: 'Perfil' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className="bg-[#111209] border border-white/5 rounded-xl p-4 text-center hover:border-viako-gold/30 transition-colors">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-viako-cream text-sm">{label}</div>
            </Link>
          ))}
        </div>

        {/* Mis reservas recientes */}
        {bookings && bookings.length > 0 && (
          <div>
            <h2 className="font-display text-xl text-viako-cream mb-4">Mis reservas</h2>
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="bg-[#111209] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-viako-olive flex items-center justify-center text-xl flex-shrink-0">
                    {booking.experience?.category === 'motorhome' ? '🚐' :
                     booking.experience?.category === 'moto' ? '🏍️' :
                     booking.experience?.category === 'trekking' ? '🥾' : '🗺️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-viako-cream text-sm font-medium truncate">{booking.experience?.title}</p>
                    <p className="text-viako-fog text-xs">{booking.experience?.location_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-400/10 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-viako-fog/10 text-viako-fog'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmada' :
                       booking.status === 'pending' ? 'Pendiente' :
                       booking.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                    </span>
                    <p className="text-viako-gold text-xs mt-1 font-display">${booking.total_price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
