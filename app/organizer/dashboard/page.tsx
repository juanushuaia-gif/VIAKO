// app/organizer/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: organizer } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!organizer) {
    return (
      <div className="min-h-screen bg-viako-dark flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">📍</div>
          <h1 className="font-display text-3xl text-viako-cream mb-3">Convertite en organizador</h1>
          <p className="text-viako-fog mb-6">Publicá tus experiencias y cobrá directo con MercadoPago o Stripe</p>
          <Link href="/organizer/setup" className="btn-gold">Crear perfil de organizador</Link>
        </div>
      </div>
    )
  }

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*, bookings(count)')
    .eq('organizer_id', organizer.id)
    .order('created_at', { ascending: false })

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`*, experience:experiences(title), user:profiles(full_name, avatar_url)`)
    .in('experience_id', experiences?.map((e: any) => e.id) || [])
    .order('created_at', { ascending: false })
    .limit(10)

  const totalRevenue = recentBookings
    ?.filter((b: any) => b.payment_status === 'approved')
    .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0

  const totalBookings = recentBookings?.length || 0

  return (
    <div className="min-h-screen bg-viako-dark">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-viako-dark/90 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="font-display text-lg text-viako-gold tracking-widest">VIAKO</Link>
        <div className="flex items-center gap-4">
          <Link href="/organizer/new-experience" className="btn-gold text-xs py-2 px-4">+ Nueva experiencia</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-viako-olive border border-viako-gold/30 flex items-center justify-center text-2xl">
            {organizer.avatar_url ? '🗺️' : '👤'}
          </div>
          <div>
            <h1 className="font-display text-2xl text-viako-cream">{organizer.display_name}</h1>
            <p className="text-viako-fog text-sm flex items-center gap-2">
              {organizer.verified && <span className="text-green-400">✓ Verificado</span>}
              {organizer.avg_rating && <span>⭐ {organizer.avg_rating}</span>}
              <span>{experiences?.length || 0} experiencias</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ingresos del mes', value: `$${totalRevenue.toLocaleString()}`, icon: '💰' },
            { label: 'Reservas totales', value: totalBookings, icon: '📋' },
            { label: 'Experiencias', value: experiences?.length || 0, icon: '🗺️' },
            { label: 'Calificación', value: organizer.avg_rating ? `${organizer.avg_rating} ⭐` : 'Sin reseñas', icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-[#111209] border border-white/5 rounded-xl p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-display text-2xl text-viako-cream">{value}</div>
              <div className="text-viako-fog text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Mis experiencias */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-viako-cream">Mis experiencias</h2>
            <Link href="/organizer/new-experience" className="text-viako-gold text-sm hover:underline">
              + Agregar nueva
            </Link>
          </div>
          <div className="space-y-3">
            {experiences?.map((exp: any) => (
              <div key={exp.id} className="bg-[#111209] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-viako-olive flex items-center justify-center text-xl flex-shrink-0">
                  {exp.category === 'motorhome' ? '🚐' : exp.category === 'moto' ? '🏍️' : '🗺️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-viako-cream text-sm font-medium truncate">{exp.title}</p>
                  <p className="text-viako-fog text-xs">{exp.location_name} · {exp.duration_days} días</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exp.is_published ? 'bg-green-400/10 text-green-400' : 'bg-viako-fog/10 text-viako-fog'
                    }`}>
                      {exp.is_published ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-viako-gold text-xs font-display">${exp.price?.toLocaleString()}</p>
                </div>
                <Link href={`/organizer/edit/${exp.id}`}
                  className="text-viako-fog hover:text-viako-cream text-xs ml-2">
                  ✏️
                </Link>
              </div>
            ))}
            {(!experiences || experiences.length === 0) && (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-viako-fog mb-4">Todavía no publicaste ninguna experiencia</p>
                <Link href="/organizer/new-experience" className="btn-gold">Crear primera experiencia</Link>
              </div>
            )}
          </div>
        </div>

        {/* Reservas recientes */}
        {recentBookings && recentBookings.length > 0 && (
          <div>
            <h2 className="font-display text-xl text-viako-cream mb-4">Reservas recientes</h2>
            <div className="space-y-2">
              {recentBookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="bg-[#111209] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-viako-olive flex items-center justify-center text-sm flex-shrink-0">
                    {booking.user?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-viako-cream text-xs font-medium">{booking.user?.full_name}</p>
                    <p className="text-viako-fog text-xs truncate">{booking.experience?.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-viako-gold text-xs font-display">${booking.total_price?.toLocaleString()}</p>
                    <span className={`text-xs ${
                      booking.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
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
