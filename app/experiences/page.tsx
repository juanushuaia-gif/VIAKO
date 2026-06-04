import { createClient } from '@/lib/supabase/server'
import ExperienceCard from '@/components/experiences/ExperienceCard'
import Link from 'next/link'

const CATEGORIES = [
  { value: '', label: 'Todos', icon: '🗺️' },
  { value: 'motorhome', label: 'Motorhome', icon: '🚐' },
  { value: 'moto', label: 'Moto', icon: '🏍️' },
  { value: 'trekking', label: 'Trekking', icon: '🥾' },
  { value: 'escapada', label: 'Escapadas', icon: '🏕️' },
  { value: 'evento', label: 'Eventos', icon: '🎪' },
  { value: 'auto', label: 'Auto', icon: '🚗' },
]

export default async function ExperiencesPage(props: any) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  let query = supabase
    .from('experiences')
    .select('*, organizer:organizers(display_name, avatar_url, verified)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (searchParams?.category) query = query.eq('category', searchParams.category)
  if (searchParams?.q) query = query.ilike('title', `%${searchParams.q}%`)

  const { data: experiences } = await query.limit(24)

  return (
    <div className="min-h-screen bg-viako-dark">
      <div className="pt-24 pb-10 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-viako-gold font-display text-lg tracking-widest mb-6 block">VIAKO</Link>
          <h1 className="font-display text-4xl text-viako-cream mb-2">Experiencias</h1>
          <p className="text-viako-fog">Encontrá tu próxima aventura</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <Link key={cat.value}
              href={cat.value ? `/experiences?category=${cat.value}` : '/experiences'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border border-white/10 text-viako-fog hover:border-viako-gold/40 hover:text-viako-cream transition-all">
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>
        {experiences && experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((exp: any) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-display text-2xl text-viako-cream mb-2">No encontramos experiencias</h3>
            <Link href="/experiences" className="btn-gold mt-4 inline-block">Ver todas</Link>
          </div>
        )}
      </div>
    </div>
  )
}
