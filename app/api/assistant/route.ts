// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { messages, profile, locale = 'es' } = await req.json()

    // Obtener experiencias disponibles para contexto
    const { data: experiences } = await supabase
      .from('experiences')
      .select('title, category, location_name, price, duration_days, short_description')
      .eq('is_published', true)
      .limit(20)

    const SYSTEM_PROMPTS: Record<string, string> = {
      es: `Sos el asistente de viaje de VIAKO, una plataforma de experiencias auténticas en Argentina y América Latina.
Conocés al viajero y sus preferencias: ${JSON.stringify(profile || {})}.
Experiencias disponibles: ${JSON.stringify(experiences || [])}.
Respondé en español rioplatense (vos, te, etc). Sé conciso, útil y entusiasta. Recomendá experiencias específicas de VIAKO cuando sea relevante.
Podés: recomendar rutas, calcular presupuestos, sugerir la mejor época, encontrar compañeros compatibles, alertar sobre condiciones climáticas.`,
      en: `You are VIAKO's travel assistant, a platform for authentic experiences in Argentina and Latin America.
You know the traveler's preferences: ${JSON.stringify(profile || {})}.
Available experiences: ${JSON.stringify(experiences || [])}.
Respond in English. Be concise, helpful and enthusiastic. Recommend specific VIAKO experiences when relevant.`,
      pt: `Você é o assistente de viagem da VIAKO, uma plataforma de experiências autênticas na Argentina e América Latina.
Você conhece as preferências do viajante: ${JSON.stringify(profile || {})}.
Experiências disponíveis: ${JSON.stringify(experiences || [])}.
Responda em português brasileiro. Seja conciso, útil e entusiasmado.`,
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.es },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.8,
    })

    const reply = response.choices[0]?.message?.content || ''

    // Guardar conversación en DB
    await supabase.from('assistant_conversations').upsert({
      user_id: user.id,
      messages: [...messages, { role: 'assistant', content: reply }],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Assistant error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
