// app/api/pass/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PASS_CONFIG = {
  weekend: { days: 3,   price_usd: 5,  name: 'Finde' },
  week:    { days: 7,   price_usd: 12, name: 'Semana' },
  month:   { days: 30,  price_usd: 28, name: 'Ruta larga' },
  annual:  { days: 365, price_usd: 60, name: 'Anual ilimitado' },
}

// GET — obtener el pass activo del usuario
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: pass } = await supabase
      .from('viako_passes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ pass })
  } catch (error: any) {
    return NextResponse.json({ pass: null })
  }
}

// POST — activar un día del pass
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { action, pass_type } = await req.json()

    if (action === 'activate_day') {
      // Consumir un día del pass activo
      const { data: pass } = await supabase
        .from('viako_passes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!pass) return NextResponse.json({ error: 'No tenés un VIAKO PASS activo' }, { status: 400 })
      if (pass.days_remaining <= 0) return NextResponse.json({ error: 'Tu PASS no tiene días disponibles' }, { status: 400 })

      await supabase
        .from('viako_passes')
        .update({
          days_used: pass.days_used + 1,
          days_remaining: pass.days_remaining - 1,
          activated_at: pass.activated_at || new Date().toISOString(),
          status: pass.days_remaining - 1 <= 0 ? 'expired' : 'active',
        })
        .eq('id', pass.id)

      return NextResponse.json({ ok: true, days_remaining: pass.days_remaining - 1 })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
