// types/index.ts

export type Locale = 'es' | 'en' | 'pt'

export type ExperienceCategory =
  | 'motorhome' | 'auto' | 'moto' | 'trekking'
  | 'escapada' | 'evento' | 'aventura' | 'camping'
  | 'alojamiento' | 'servicio'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'
export type PaymentProvider = 'mercadopago' | 'stripe'
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type EmergencyStatus = 'inactive' | 'active' | 'resolved'
export type ViakoPassType = 'weekend' | 'week' | 'month' | 'annual'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  nationality?: string
  date_of_birth?: string
  is_organizer: boolean
  verification_status: VerificationStatus
  emergency_contact_name?: string
  emergency_contact_phone?: string
  travel_style?: string[]
  home_city?: string
  preferred_language: Locale
  active_pass?: ViakoPass
  created_at: string
}

export interface ViakoPass {
  id: string
  user_id: string
  type: ViakoPassType
  days_total: number
  days_used: number
  days_remaining: number
  price_usd: number
  status: 'active' | 'expired' | 'cancelled'
  activated_at?: string
  expires_at?: string
  created_at: string
}

export interface Experience {
  id: string
  title: string
  title_en?: string
  title_pt?: string
  slug: string
  description: string
  description_en?: string
  description_pt?: string
  short_description: string
  category: ExperienceCategory
  price: number
  price_usd?: number
  duration_days: number
  max_capacity: number
  location_name: string
  location_lat: number
  location_lng: number
  cover_image?: string
  images: string[]
  is_published: boolean
  organizer_id: string
  organizer?: Organizer
  reviews?: Review[]
  avg_rating?: number
  total_reviews?: number
  amenities?: string[]
  includes?: string[]
  created_at: string
  updated_at: string
}

export interface Organizer {
  id: string
  user_id: string
  display_name: string
  bio?: string
  bio_en?: string
  bio_pt?: string
  avatar_url?: string
  verified: boolean
  avg_rating?: number
  total_experiences?: number
  response_rate?: number
  languages?: string[]
}

export interface Booking {
  id: string
  experience_id: string
  experience?: Experience
  user_id: string
  user?: User
  date_id?: string
  guests: number
  total_price: number
  currency: string
  status: BookingStatus
  payment_id?: string
  payment_status: PaymentStatus
  payment_provider?: PaymentProvider
  notes?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  experience_id: string
  user_id: string
  user?: Pick<User, 'full_name' | 'avatar_url'>
  booking_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface MapTraveler {
  id: string
  user_id: string
  user?: Pick<User, 'full_name' | 'avatar_url' | 'travel_style'>
  lat: number
  lng: number
  destination?: string
  vehicle_type?: string
  visible: boolean
  active_pass: boolean
  updated_at: string
}

export interface MeetupRequest {
  id: string
  from_user_id: string
  to_user_id: string
  from_user?: Pick<User, 'full_name' | 'avatar_url'>
  message: string
  meetup_location?: string
  meetup_lat?: number
  meetup_lng?: number
  meetup_date?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export interface ChatMessage {
  id: string
  booking_id?: string
  meetup_id?: string
  sender_id: string
  sender?: Pick<User, 'full_name' | 'avatar_url'>
  content: string
  type: 'text' | 'location' | 'checkin' | 'emergency'
  read: boolean
  created_at: string
}

export interface EmergencyAlert {
  id: string
  user_id: string
  user?: Pick<User, 'full_name' | 'phone' | 'emergency_contact_name' | 'emergency_contact_phone'>
  lat: number
  lng: number
  status: EmergencyStatus
  country_code: string
  emergency_number: string
  message?: string
  created_at: string
  resolved_at?: string
}

export interface IdentityVerification {
  id: string
  user_id: string
  document_type: 'dni' | 'passport' | 'license'
  document_front_url: string
  document_back_url?: string
  selfie_url: string
  status: VerificationStatus
  rejection_reason?: string
  created_at: string
}

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface AssistantProfile {
  travel_style: string[]
  vehicle_type: string
  travel_companions: string
  budget_range: string
  interests: string[]
  home_city: string
  visited_regions: string[]
  restrictions: string[]
}
