// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ExperienceCard from '@/components/experiences/ExperienceCard'
import MapPreview from '@/components/map/MapPreview'
import PassSection from '@/components/payment/PassSection'
import AssistantPreview from '@/components/ui/AssistantPreview'

export default async function HomePage() {
  const supabase = await createClient()

  // Obtener experiencias destacadas
  const { data: experiences } = await supabase
    .from('experiences')
    .select(`*, organizer:organizers(display_name, avatar_url, verified)`)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-viako-dark/90 backdrop-blur-md border-b border-white/4">
        <Link href="/" className="font-display text-xl font-bold tracking-[0.18em] text-viako-gold">
          VIAKO
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/experiences', label: 'Experiencias' },
            { href: '/map', label: 'Mapa' },
            { href: '/pass', label: 'VIAKO PASS' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="text-viako-fog text-sm tracking-widest uppercase hover:text-viako-cream transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-viako-fog text-sm hover:text-viako-cream transition-colors">
            Ingresar
          </Link>
          <Link href="/auth/register" className="btn-gold text-xs py-2 px-4">
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-20 pt-32 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D0C09 0%, #1a1f16 50%, #0D0C09 100%)' }}>
        {/* Imágenes de fondo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 grid grid-cols-2 grid-rows-3 gap-px opacity-40 hidden md:grid">
          {[
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format',
            'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&auto=format',
            'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&auto=format',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format',
          ].map((src, i) => (
            <div key={i} className="relative overflow-hidden" style={{ gridRow: i === 0 ? '1/3' : 'auto', gridColumn: i === 3 ? '1/3' : 'auto' }}>
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-viako-dark via-viako-dark/80 to-transparent" />

        <div className="relative z-10 max-w-xl">
          <p className="section-label flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-viako-gold" />
            Turismo auténtico · Argentina & más
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-normal leading-[1.05] text-viako-cream mb-6">
            Viajá<br/>como <em className="italic text-viako-gold">nadie</em><br/>lo hace
          </h1>
          <p className="text-viako-fog text-lg leading-relaxed mb-8 max-w-md">
            Experiencias reales organizadas por personas locales. Motorhome, rutas, escapadas y eventos. Con mapa de viajeros y botón de emergencia.
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/experiences" className="btn-gold">
              Explorar experiencias
            </Link>
            <Link href="/organizer/dashboard" className="text-viako-sand text-sm border-b border-viako-sand/30 pb-0.5 hover:text-viako-gold hover:border-viako-gold transition-colors">
              Soy organizador →
            </Link>
          </div>
          <div className="flex gap-8 mt-10">
            {[
              { num: '2.400+', label: 'Experiencias' },
              { num: '180+', label: 'Organizadores' },
              { num: '4.9 ★', label: 'Valoración' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-display text-2xl text-viako-cream font-bold">{num}</div>
                <div className="text-viako-fog text-xs tracking-widest uppercase mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCIAS */}
      <section className="py-20 px-6 bg-viako-dark" id="experiencias">
        <div className="max-w-6xl mx-auto">
          <p className="section-label">Descubrí</p>
          <h2 className="font-display text-4xl text-viako-cream mb-3">
            Experiencias que<br/><em className="italic text-viako-gold">te transforman</em>
          </h2>
          <p className="text-viako-fog mb-10 max-w-md">
            Organizadas por personas que conocen cada ruta, cada camping, cada curva.
          </p>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['Todos', 'Motorhome', 'Moto', 'Trekking', 'Escapadas', 'Eventos'].map(cat => (
              <button key={cat}
                className="border border-viako-gold/30 text-viako-fog px-4 py-1.5 rounded-full text-xs tracking-wider hover:border-viako-gold hover:text-viako-gold transition-all">
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences?.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/experiences" className="btn-outline">
              Ver todas las experiencias
            </Link>
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="py-20 px-6 bg-[#111209]" id="mapa">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label">Mapa de viajeros</p>
            <h2 className="font-display text-4xl text-viako-cream mb-4">
              Encontrate con<br/><em className="italic text-viako-gold">otros viajeros</em>
            </h2>
            <p className="text-viako-fog leading-relaxed mb-6">
              Ves quién está en ruta en tiempo real. Coordinás un punto de encuentro. Hacés el tramo juntos. Solo con usuarios verificados.
            </p>
            <ul className="space-y-3">
              {[
                { icon: '📍', text: 'Viajeros activos con perfil verificado' },
                { icon: '🛣️', text: 'Rutas compartidas y encuentros en el camino' },
                { icon: '🏕️', text: 'Campings, mecánicos y servicios en el mapa' },
                { icon: '🤖', text: 'Asistente que recomienda compañeros compatibles' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-viako-fog text-sm">
                  <span className="text-lg">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/map" className="btn-gold inline-block mt-8">
              Ver el mapa
            </Link>
          </div>
          <MapPreview />
        </div>
      </section>

      {/* SEGURIDAD */}
      <section className="py-20 px-6 bg-viako-olive" id="seguridad">
        <div className="max-w-6xl mx-auto">
          <p className="section-label">VIAKO SAFE</p>
          <h2 className="font-display text-4xl text-viako-cream mb-3">
            Viajá libre.<br/><em className="italic text-viako-gold">Con seguridad real.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            {[
              { icon: '🆘', title: 'Botón de emergencia', desc: 'Mantenés presionado 3 segundos → llama al 911 automáticamente. Tu GPS va a tu contacto y tu grupo recibe una alerta.', highlight: true },
              { icon: '✅', title: 'Identidad verificada', desc: 'Todos los usuarios verifican su DNI o pasaporte + selfie. Sabés exactamente con quién viajás.' },
              { icon: '💬', title: 'Chat grupal automático', desc: 'Al reservar entrás al grupo con todos los participantes. Incluye "Estoy bien" y "Necesito ayuda".' },
              { icon: '📍', title: 'Red de viajeros verificados', desc: 'Solo ves usuarios verificados en el mapa. Tu ubicación exacta nunca se comparte.' },
            ].map(({ icon, title, desc, highlight }) => (
              <div key={title} className={`p-6 rounded-lg border transition-all ${
                highlight
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-white/8 bg-viako-dark/40'
              }`}>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-display text-lg text-viako-cream mb-2">{title}</h3>
                <p className="text-viako-fog text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIAKO PASS */}
      <PassSection />

      {/* ASISTENTE */}
      <section className="py-20 px-6 bg-[#0a0908]" id="asistente">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label">Asistente de viaje</p>
            <h2 className="font-display text-4xl text-viako-cream mb-4">
              Tu compañero<br/><em className="italic text-viako-gold">inteligente</em>
            </h2>
            <p className="text-viako-fog leading-relaxed mb-6">
              Te conoce y arma rutas personalizadas según cómo viajás, qué buscás y desde dónde salís. Como tener un amigo que recorrió toda Argentina.
            </p>
            <ul className="space-y-2">
              {[
                'Rutas personalizadas según tu perfil',
                'Presupuesto estimado por destino',
                'Compañeros de viaje compatibles',
                'Mejor época según el clima',
                'Disponible en Español, Inglés y Portugués',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-viako-fog text-sm">
                  <span className="text-viako-green">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <AssistantPreview />
        </div>
      </section>

      {/* ORGANIZADORES */}
      <section className="py-20 px-6 bg-viako-dark" id="organizadores">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <p className="section-label">Para organizadores</p>
            <h2 className="font-display text-4xl text-viako-cream mb-4">
              Publicá tus experiencias.<br/><em className="italic text-viako-gold">Cobrá directo.</em>
            </h2>
            <div className="space-y-4 mt-8">
              {[
                { icon: '📍', title: 'Publicación en minutos', desc: 'Subís fotos, definís fechas y cupos. Tu experiencia disponible al instante.' },
                { icon: '💳', title: 'Cobros directo a tu cuenta', desc: 'MercadoPago y Stripe. Sin intermediarios. 24hs para acreditar.' },
                { icon: '💬', title: 'Chat con tus viajeros', desc: 'Coordinás todo desde VIAKO. Sin WhatsApp, sin transferencias perdidas.' },
                { icon: '⭐', title: 'Sistema de reputación', desc: 'Las reseñas auténticas potencian tu visibilidad automáticamente.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-4 border border-white/5 rounded-lg hover:border-viako-gold/20 transition-colors">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h4 className="text-viako-cream text-sm font-medium mb-1">{title}</h4>
                    <p className="text-viako-fog text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <blockquote className="border-l-2 border-viako-gold pl-6 py-4 bg-viako-olive/30 rounded-r-lg">
              <p className="font-display text-xl italic text-viako-cream leading-relaxed mb-4">
                "Antes me llenaba de grupos de WhatsApp y transferencias perdidas. Con VIAKO manejo todo desde el celular y cobro al instante."
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-viako-olive border border-viako-gold/30 flex items-center justify-center text-lg">👩</div>
                <div>
                  <div className="text-viako-cream text-sm font-medium">Mariana Godoy</div>
                  <div className="text-viako-fog text-xs">Organizadora de rutas en motorhome · Bariloche</div>
                </div>
              </footer>
            </blockquote>
            <Link href="/organizer/dashboard" className="btn-gold mt-8 text-center">
              Quiero ser organizador
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-viako-cream text-center">
        <h2 className="font-display text-4xl md:text-5xl text-viako-dark mb-4">
          Empezá a explorar<br/><em className="italic text-viako-gold">hoy mismo</em>
        </h2>
        <p className="text-viako-olive max-w-md mx-auto mb-8 leading-relaxed">
          Unite a la comunidad viajera más auténtica de Argentina. Gratis para viajeros, sin comisiones para organizadores el primer mes.
        </p>
        <Link href="/auth/register"
          className="bg-viako-dark text-viako-gold px-10 py-4 text-sm tracking-widest uppercase inline-block hover:-translate-y-1 transition-transform">
          Crear cuenta gratis →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#070706] py-8 px-6 border-t border-white/4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-viako-gold tracking-[0.2em]">VIAKO</span>
          <div className="flex gap-6 text-viako-fog text-xs tracking-widest">
            <Link href="/experiences" className="hover:text-viako-gold transition-colors">Experiencias</Link>
            <Link href="/map" className="hover:text-viako-gold transition-colors">Mapa</Link>
            <Link href="/pass" className="hover:text-viako-gold transition-colors">VIAKO PASS</Link>
            <Link href="/organizer/dashboard" className="hover:text-viako-gold transition-colors">Organizadores</Link>
          </div>
          <span className="text-viako-fog/40 text-xs">© 2026 VIAKO</span>
        </div>
      </footer>
    </main>
  )
}
