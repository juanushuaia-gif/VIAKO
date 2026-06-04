-- ============================================================
-- VIAKO — Schema completo v2
-- Incluye: usuarios, experiencias, reservas, mapa,
--          emergencias, verificación, VIAKO PASS, chat, IA
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id                        uuid references auth.users on delete cascade primary key,
  full_name                 text not null,
  avatar_url                text,
  phone                     text,
  nationality               text,
  date_of_birth             date,
  is_organizer              boolean default false,
  verification_status       text default 'unverified',
  emergency_contact_name    text,
  emergency_contact_phone   text,
  travel_style              text[] default '{}',
  home_city                 text,
  preferred_language        text default 'es',
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-crear perfil
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Viajero'), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ORGANIZERS
-- ============================================================
create table public.organizers (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade unique,
  display_name     text not null,
  bio              text,
  bio_en           text,
  bio_pt           text,
  avatar_url       text,
  verified         boolean default false,
  avg_rating       numeric(3,2),
  total_experiences integer default 0,
  response_rate    integer default 100,
  languages        text[] default '{es}',
  mercadopago_id   text,
  stripe_account_id text,
  created_at       timestamptz default now()
);
alter table public.organizers enable row level security;
create policy "Organizers viewable by all" on public.organizers for select using (true);
create policy "Users create organizer profile" on public.organizers for insert with check (auth.uid() = user_id);
create policy "Organizers update own profile" on public.organizers for update using (auth.uid() = user_id);

-- ============================================================
-- EXPERIENCES
-- ============================================================
create type experience_category as enum (
  'motorhome','auto','moto','trekking','escapada','evento','aventura','camping','alojamiento','servicio'
);

create table public.experiences (
  id                uuid default uuid_generate_v4() primary key,
  organizer_id      uuid references public.organizers(id) on delete cascade not null,
  title             text not null,
  title_en          text,
  title_pt          text,
  slug              text unique not null,
  description       text not null,
  description_en    text,
  description_pt    text,
  short_description text not null,
  category          experience_category not null,
  price             numeric(10,2) not null,
  price_usd         numeric(10,2),
  duration_days     integer not null,
  max_capacity      integer not null,
  location_name     text not null,
  location_lat      double precision not null,
  location_lng      double precision not null,
  cover_image       text,
  images            text[] default '{}',
  amenities         text[] default '{}',
  includes          text[] default '{}',
  is_published      boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.experiences enable row level security;
create policy "Published experiences visible" on public.experiences for select
  using (is_published = true or auth.uid() = (select user_id from public.organizers where id = organizer_id));
create policy "Organizers insert" on public.experiences for insert
  with check (auth.uid() = (select user_id from public.organizers where id = organizer_id));
create policy "Organizers update" on public.experiences for update
  using (auth.uid() = (select user_id from public.organizers where id = organizer_id));

-- ============================================================
-- EXPERIENCE DATES
-- ============================================================
create table public.experience_dates (
  id              uuid default uuid_generate_v4() primary key,
  experience_id   uuid references public.experiences(id) on delete cascade,
  date            date not null,
  available_spots integer not null,
  booked_spots    integer default 0,
  created_at      timestamptz default now(),
  unique(experience_id, date)
);
alter table public.experience_dates enable row level security;
create policy "Dates viewable by all" on public.experience_dates for select using (true);

-- ============================================================
-- BOOKINGS
-- ============================================================
create type booking_status as enum ('pending','confirmed','cancelled','completed');
create type payment_status as enum ('pending','approved','rejected','refunded');

create table public.bookings (
  id               uuid default uuid_generate_v4() primary key,
  experience_id    uuid references public.experiences(id) not null,
  user_id          uuid references public.profiles(id) not null,
  date_id          uuid references public.experience_dates(id),
  guests           integer not null,
  total_price      numeric(10,2) not null,
  currency         text default 'ARS',
  status           booking_status default 'pending',
  payment_id       text,
  payment_status   payment_status default 'pending',
  payment_provider text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table public.bookings enable row level security;
create policy "Users see own bookings" on public.bookings for select
  using (auth.uid() = user_id or auth.uid() = (
    select o.user_id from public.organizers o
    join public.experiences e on e.organizer_id = o.id
    where e.id = experience_id
  ));
create policy "Authenticated users create bookings" on public.bookings for insert
  with check (auth.uid() = user_id);
create policy "Users update own bookings" on public.bookings for update
  using (auth.uid() = user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id            uuid default uuid_generate_v4() primary key,
  experience_id uuid references public.experiences(id) on delete cascade,
  user_id       uuid references public.profiles(id),
  booking_id    uuid references public.bookings(id) unique,
  rating        integer not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Reviews visible to all" on public.reviews for select using (true);
create policy "Users review completed bookings" on public.reviews for insert
  with check (auth.uid() = user_id and exists (
    select 1 from public.bookings where id = booking_id and user_id = auth.uid() and status = 'completed'
  ));

-- ============================================================
-- MESSAGES (Chat)
-- ============================================================
create table public.messages (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade,
  meetup_id   uuid,
  sender_id   uuid references public.profiles(id),
  content     text not null,
  type        text default 'text',
  read        boolean default false,
  created_at  timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Participants read messages" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = (
    select user_id from public.bookings where id = booking_id
  ));
create policy "Participants send messages" on public.messages for insert
  with check (auth.uid() = sender_id);

-- ============================================================
-- MAP TRAVELERS
-- ============================================================
create table public.map_travelers (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade unique,
  lat          double precision not null,
  lng          double precision not null,
  destination  text,
  vehicle_type text,
  visible      boolean default true,
  active_pass  boolean default false,
  updated_at   timestamptz default now()
);
alter table public.map_travelers enable row level security;
create policy "Visible travelers readable" on public.map_travelers for select using (visible = true);
create policy "Users manage own location" on public.map_travelers for all using (auth.uid() = user_id);

-- ============================================================
-- MEETUP REQUESTS
-- ============================================================
create table public.meetup_requests (
  id              uuid default uuid_generate_v4() primary key,
  from_user_id    uuid references public.profiles(id),
  to_user_id      uuid references public.profiles(id),
  message         text not null,
  meetup_location text,
  meetup_lat      double precision,
  meetup_lng      double precision,
  meetup_date     text,
  status          text default 'pending',
  created_at      timestamptz default now()
);
alter table public.meetup_requests enable row level security;
create policy "Participants see meetup requests" on public.meetup_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "Users create meetup requests" on public.meetup_requests for insert
  with check (auth.uid() = from_user_id);
create policy "Recipients update requests" on public.meetup_requests for update
  using (auth.uid() = to_user_id);

-- ============================================================
-- EMERGENCY ALERTS
-- ============================================================
create table public.emergency_alerts (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id),
  lat              double precision not null,
  lng              double precision not null,
  status           text default 'active',
  country_code     text not null,
  emergency_number text not null,
  message          text,
  created_at       timestamptz default now(),
  resolved_at      timestamptz
);
alter table public.emergency_alerts enable row level security;
create policy "Users see own alerts" on public.emergency_alerts for select using (auth.uid() = user_id);
create policy "Users create alerts" on public.emergency_alerts for insert with check (auth.uid() = user_id);
create policy "Users resolve own alerts" on public.emergency_alerts for update using (auth.uid() = user_id);

-- ============================================================
-- IDENTITY VERIFICATIONS
-- ============================================================
create table public.identity_verifications (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade unique,
  document_type       text not null,
  document_front_url  text not null,
  document_back_url   text,
  selfie_url          text not null,
  status              text default 'pending',
  rejection_reason    text,
  created_at          timestamptz default now()
);
alter table public.identity_verifications enable row level security;
create policy "Users see own verification" on public.identity_verifications for select using (auth.uid() = user_id);
create policy "Users submit verification" on public.identity_verifications for insert with check (auth.uid() = user_id);

-- ============================================================
-- VIAKO PASS
-- ============================================================
create table public.viako_passes (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references public.profiles(id) on delete cascade,
  type           text not null,
  days_total     integer not null,
  days_used      integer default 0,
  days_remaining integer not null,
  price_usd      numeric(6,2) not null,
  status         text default 'active',
  payment_id     text,
  activated_at   timestamptz,
  expires_at     timestamptz,
  created_at     timestamptz default now()
);
alter table public.viako_passes enable row level security;
create policy "Users see own passes" on public.viako_passes for select using (auth.uid() = user_id);
create policy "Users create passes" on public.viako_passes for insert with check (auth.uid() = user_id);
create policy "Users update own passes" on public.viako_passes for update using (auth.uid() = user_id);

-- ============================================================
-- ASSISTANT CONVERSATIONS
-- ============================================================
create table public.assistant_conversations (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade unique,
  messages   jsonb default '[]',
  profile    jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.assistant_conversations enable row level security;
create policy "Users see own conversations" on public.assistant_conversations for select using (auth.uid() = user_id);
create policy "Users manage own conversations" on public.assistant_conversations for all using (auth.uid() = user_id);

-- ============================================================
-- INSTAGRAM TABLES
-- ============================================================
create table public.ig_events (
  id            uuid default uuid_generate_v4() primary key,
  type          text not null,
  media_id      text,
  comment_id    text,
  message_id    text,
  from_id       text,
  from_username text,
  text          text,
  read          boolean default false,
  replied       boolean default false,
  raw           jsonb,
  created_at    timestamptz default now()
);

create table public.ig_scheduled_posts (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id),
  caption      text not null,
  image_url    text,
  video_url    text,
  scheduled_at timestamptz not null,
  status       text default 'pending',
  creation_id  text,
  media_id     text,
  error        text,
  created_at   timestamptz default now()
);

-- ============================================================
-- STORAGE BUCKETS (ejecutar en Dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('experiences', 'experiences', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('verifications', 'verifications', false);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists experiences_category_idx on public.experiences(category);
create index if not exists experiences_location_idx on public.experiences(location_lat, location_lng);
create index if not exists bookings_user_idx on public.bookings(user_id);
create index if not exists bookings_experience_idx on public.bookings(experience_id);
create index if not exists map_travelers_location_idx on public.map_travelers(lat, lng);
create index if not exists messages_booking_idx on public.messages(booking_id);
create index if not exists emergency_status_idx on public.emergency_alerts(status);
