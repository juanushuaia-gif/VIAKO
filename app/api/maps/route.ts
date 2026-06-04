// app/api/maps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — obtener viajeros visibles en el mapa
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const lat = req.nextUrl.searchParams.get('lat')
    const lng = req.nextUrl.searchParams.get('lng')
    const radius = Number(req.nextUrl.searchParams.get('radius') || 100) // km

    // Obtener viajeros activos con VIAKO PASS
    const { data: travelers } = await supabase
      .from('map_travelers')
      .select(`
        id, lat, lng, destination, vehicle_type, updated_at,
        user:profiles(full_name, avatar_url)
      `)
      .eq('visible', true)
      .neq('user_id', user.id)
      .gte('updated_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // activos en las últimas 2hs

    return NextResponse.json({ travelers: travelers || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — actualizar posición del usuario en el mapa
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { lat, lng, destination, vehicle_type, visible } = await req.json()

    // Redondear coordenadas para privacidad (±0.05 grados = ~5km)
    const privateLat = Math.round(lat * 20) / 20
    const privateLng = Math.round(lng * 20) / 20

    await supabase.from('map_travelers').upsert({
      user_id: user.id,
      lat: privateLat,
      lng: privateLng,
      destination,
      vehicle_type,
      visible: visible ?? true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — salir del mapa (hacerse invisible)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    await supabase
      .from('map_travelers')
      .update({ visible: false })
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
