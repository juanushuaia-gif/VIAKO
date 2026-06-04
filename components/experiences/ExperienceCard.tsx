'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, MapPin } from 'lucide-react'
import type { Experience } from '@/types'

interface Props {
  experience: Experience
  featured?: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  motorhome: '🚐',
  moto: '🏍️',
  auto: '🚗',
  trekking: '🥾',
  escapada: '🏕️',
  evento: '🎪',
  aventura: '⛰️',
  camping: '⛺',
  alojamiento: '🏨',
  servicio: '🔧',
}

export default function ExperienceCard({ experience, featured = false }: Props) {
  const icon = CATEGORY_ICONS[experience.category] || '🗺️'
  const spotsLeft = experience.max_capacity - (experience as any).booked_count || experience.max_capacity

  return (
    <Link href={`/experiences/${experience.slug}`}
      className={`group relative overflow-hidden rounded-xl border border-white/5 hover:border-viako-gold/30 transition-all duration-300 block ${
        featured ? 'col-span-2 row-span-2' : ''
      }`}>

      {/* Imagen */}
      <div className={`relative overflow-hidden ${featured ? 'h-80' : 'h-52'}`}>
        {experience.cover_image ? (
          <Image
            src={experience.cover_image}
            alt={experience.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-viako-olive flex items-center justify-center">
            <span className="text-5xl opacity-30">{icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-viako-dark/95 via-viako-dark/30 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-viako-gold/20 border border-viako-gold/40 text-viako-gold text-xs px-2 py-1 rounded backdrop-blur-sm">
            {icon} {experience.category}
          </span>
          {experience.duration_days > 0 && (
            <span className="bg-black/50 text-viako-cream text-xs px-2 py-1 rounded backdrop-blur-sm">
              {experience.duration_days} {experience.duration_days === 1 ? 'día' : 'días'}
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="absolute top-3 right-3">
          <div className="bg-viako-dark/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-right">
            <div className="font-display text-viako-gold font-bold text-sm">
              ${experience.price.toLocaleString()}
            </div>
            <div className="text-viako-fog text-xs">por persona</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-[#111209]">
        <h3 className="font-display text-viako-cream text-lg leading-tight mb-2 group-hover:text-viako-gold transition-colors">
          {experience.title}
        </h3>

        <div className="flex items-center gap-3 text-viako-fog text-xs mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {experience.location_name}
          </span>
          {experience.avg_rating && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-viako-gold fill-viako-gold" />
              {experience.avg_rating.toFixed(1)}
              <span className="text-viako-fog/60">({experience.total_reviews})</span>
            </span>
          )}
        </div>

        <p className="text-viako-fog text-xs leading-relaxed line-clamp-2 mb-4">
          {experience.short_description}
        </p>

        <div className="flex items-center justify-between">
          {/* Organizador */}
          <div className="flex items-center gap-2">
            {(experience as any).organizer?.avatar_url ? (
              <Image
                src={(experience as any).organizer.avatar_url}
                alt=""
                width={24} height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-viako-olive flex items-center justify-center text-xs">
                {(experience as any).organizer?.display_name?.[0] || '?'}
              </div>
            )}
            <span className="text-viako-fog text-xs">
              {(experience as any).organizer?.display_name}
              {(experience as any).organizer?.verified && <span className="text-viako-gold ml-1">✓</span>}
            </span>
          </div>

          {/* Cupos */}
          <span className={`text-xs px-2 py-1 rounded ${
            spotsLeft <= 3
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-viako-gold/10 text-viako-gold border border-viako-gold/20'
          }`}>
            <Users size={10} className="inline mr-1" />
            {spotsLeft} cupos
          </span>
        </div>
      </div>
    </Link>
  )
}
