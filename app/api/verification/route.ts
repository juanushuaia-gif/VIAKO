// app/api/verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
)

)

// POST — enviar documentos para verificación
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await req.formData()
    const documentFront = formData.get('document_front') as File
    const documentBack = formData.get('document_back') as File | null
    const selfie = formData.get('selfie') as File
    const documentType = formData.get('document_type') as string

    // Subir documentos a Supabase Storage (bucket privado)
    const uploadFile = async (file: File, path: string) => {
      const { data, error } = await getAdminSupabase().storage
        .from('verifications')
        .upload(path, file, { upsert: true })
      if (error) throw error
      return data.path
    }

    const frontPath = await uploadFile(documentFront, `${user.id}/front_${Date.now()}`)
    const backPath = documentBack
      ? await uploadFile(documentBack, `${user.id}/back_${Date.now()}`)
      : null
    const selfiePath = await uploadFile(selfie, `${user.id}/selfie_${Date.now()}`)

    // Crear registro de verificación
    const { data: verification } = await adminSupabase
      .from('identity_verifications')
      .insert({
        user_id: user.id,
        document_type: documentType,
        document_front_url: frontPath,
        document_back_url: backPath,
        selfie_url: selfiePath,
        status: 'pending',
      })
      .select()
      .single()

    // Actualizar perfil a "pending"
    await adminSupabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', user.id)

    // En producción: enviar a servicio de verificación automática (Truora, AU10TIX, etc.)
    // Por ahora: notificar al admin para revisión manual
    // await notifyAdmin(verification)

    return NextResponse.json({
      ok: true,
      verification_id: verification?.id,
      status: 'pending',
      message: 'Tu verificación está en proceso. Recibirás una notificación en 24-48hs.',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET — obtener estado de verificación
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: verification } = await supabase
      .from('identity_verifications')
      .select('status, rejection_reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ verification })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
