// app/api/emergency/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

// Números de emergencia por país
const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string }> = {
  AR: { police: '911', ambulance: '107', fire: '100' },
  CL: { police: '133', ambulance: '131', fire: '132' },
  UY: { police: '911', ambulance: '105', fire: '104' },
  BR: { police: '190', ambulance: '192', fire: '193' },
  CO: { police: '123', ambulance: '125', fire: '119' },
  MX: { police: '911', ambulance: '911', fire: '911' },
  ES: { police: '112', ambulance: '112', fire: '112' },
  PT: { police: '112', ambulance: '112', fire: '117' },
  IT: { police: '113', ambulance: '118', fire: '115' },
  DE: { police: '110', ambulance: '112', fire: '112' },
  FR: { police: '17', ambulance: '15', fire: '18' },
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { lat, lng, country_code = 'AR', message } = body

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, emergency_contact_name, emergency_contact_phone')
      .eq('id', user.id)
      .single()

    const numbers = EMERGENCY_NUMBERS[country_code] || EMERGENCY_NUMBERS.AR
    const googleMapsLink = `https://maps.google.com/?q=${lat},${lng}`

    // Guardar alerta en DB
    const { data: alert } = await supabase
      .from('emergency_alerts')
      .insert({
        user_id: user.id,
        lat,
        lng,
        status: 'active',
        country_code,
        emergency_number: numbers.police,
        message: message || 'Emergencia activada desde VIAKO',
      })
      .select()
      .single()

    // Enviar SMS al contacto de emergencia
    if (profile?.emergency_contact_phone && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `🆘 EMERGENCIA VIAKO — ${profile.full_name} necesita ayuda.
📍 Ubicación: ${googleMapsLink}
⏰ Hora: ${new Date().toLocaleString('es-AR')}
📞 Número de emergencias local: ${numbers.police}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: profile.emergency_contact_phone,
      })
    }

    // Notificar al grupo de viaje si tiene experiencia activa
    const { data: activeBooking } = await supabase
      .from('bookings')
      .select('id, experience_id')
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (activeBooking) {
      await supabase.from('messages').insert({
        booking_id: activeBooking.id,
        sender_id: user.id,
        content: `🆘 ${profile?.full_name || 'Un viajero'} activó el botón de emergencia. Ubicación: ${googleMapsLink}`,
        type: 'emergency',
      })
    }

    return NextResponse.json({
      ok: true,
      alert_id: alert?.id,
      emergency_numbers: numbers,
      google_maps: googleMapsLink,
      contact_notified: !!profile?.emergency_contact_phone,
    })
  } catch (error: any) {
    console.error('Emergency error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Resolver emergencia
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { alert_id } = await req.json()

    await supabase
      .from('emergency_alerts')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', alert_id)
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
