# 🗺️ VIAKO — Setup completo

## Requisitos
- Node.js 18+
- Cuenta en Supabase (gratis)
- Cuenta en MercadoPago (desarrolladores)
- Cuenta en Stripe (opcional, para pagos globales)

## Instalación (30-60 minutos)

### 1. Instalar dependencias
```bash
cd viako-full
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```
Abrí `.env.local` y completá los valores.

### 3. Configurar Supabase
1. Crear cuenta en supabase.com
2. Crear nuevo proyecto
3. Ir a Settings → API → copiar URL y anon key
4. Ir a SQL Editor → pegar el contenido de `supabase/migrations/001_full_schema.sql`
5. Ejecutar

### 4. Correr en desarrollo
```bash
npm run dev
```
Abrí http://localhost:3000

## Variables de entorno mínimas para empezar

Solo con estas 3 podés correr la app:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
```

El resto de las funciones (pagos, SMS, IA) se agregan después.

## Estructura del proyecto

```
viako-full/
├── app/
│   ├── page.tsx              ← Home page
│   ├── auth/
│   │   ├── login/            ← Login
│   │   └── register/         ← Registro
│   ├── dashboard/            ← Panel del viajero
│   ├── experiences/          ← Catálogo de experiencias
│   ├── map/                  ← Mapa de viajeros
│   ├── organizer/            ← Panel del organizador
│   ├── pass/                 ← VIAKO PASS
│   └── api/
│       ├── emergency/        ← Botón de emergencia
│       ├── assistant/        ← Asistente con IA
│       ├── maps/             ← Mapa en tiempo real
│       ├── payments/         ← MercadoPago + Stripe
│       ├── pass/             ← VIAKO PASS
│       └── verification/     ← Verificación DNI
├── components/
│   ├── emergency/            ← Botón de emergencia
│   ├── experiences/          ← Cards de experiencias
│   ├── map/                  ← Preview del mapa
│   ├── payment/              ← Sección VIAKO PASS
│   └── ui/                   ← Componentes generales
├── lib/
│   └── supabase/             ← Clientes de Supabase
├── types/                    ← TypeScript types
└── supabase/
    └── migrations/           ← Schema completo de la DB
```

## Funciones implementadas

✅ Landing page completa con todas las secciones
✅ Login / Registro con Google y email
✅ Dashboard del viajero
✅ Catálogo de experiencias con filtros
✅ Mapa de viajeros en tiempo real
✅ Botón de emergencia (SMS + GPS)
✅ Asistente de viaje con IA (OpenAI)
✅ VIAKO PASS (pagos por días)
✅ Pagos con MercadoPago y Stripe
✅ Verificación de identidad con DNI
✅ Panel del organizador
✅ Chat grupal por reserva
✅ 3 idiomas: Español, Inglés, Portugués
✅ Schema completo de base de datos

## Deploy en Vercel

1. Subir a GitHub
2. Conectar con Vercel
3. Agregar variables de entorno en Vercel dashboard
4. Deploy automático

---
VIAKO © 2026 — Juan Manuel Oviedo
