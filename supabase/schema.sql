-- TrendPanda Supabase schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'agency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null,
  image_urls text[] not null default '{}',
  selling_price numeric(10, 2) not null,
  sourcing_cost numeric(10, 2) not null,
  supplier_url text,
  competitor_count integer not null default 0,
  opportunity_score integer not null default 0 check (opportunity_score between 0 and 100),
  opportunity_badge text not null default 'POTENTIAL'
    check (opportunity_badge in ('WINNER', 'POTENTIAL', 'SATURATED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by any authenticated user"
  on public.products for select
  using (auth.role() = 'authenticated');

-- ============================================================================
-- TIKTOK METRICS (one row per product, daily history stored as jsonb)
-- ============================================================================
create table if not exists public.tiktok_metrics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  total_views bigint not null default 0,
  total_likes bigint not null default 0,
  total_shares bigint not null default 0,
  total_comments bigint not null default 0,
  engagement_rate numeric(5, 2) not null default 0,
  growth_rate_30d numeric(6, 2) not null default 0,
  video_count integer not null default 0,
  top_hashtags text[] not null default '{}',
  daily_history jsonb not null default '[]',
  recorded_at timestamptz not null default now(),
  unique (product_id)
);

alter table public.tiktok_metrics enable row level security;

create policy "TikTok metrics are viewable by any authenticated user"
  on public.tiktok_metrics for select
  using (auth.role() = 'authenticated');

-- ============================================================================
-- META ADS
-- ============================================================================
create table if not exists public.meta_ads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  advertiser_name text not null,
  advertiser_avatar_url text,
  ad_copy text not null default '',
  headline text not null default '',
  media_url text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  cta text not null default 'Shop Now',
  platforms text[] not null default '{}',
  active_since_days integer not null default 0,
  is_active boolean not null default true,
  estimated_spend text not null default 'Low' check (estimated_spend in ('Low', 'Medium', 'High')),
  landing_page_url text,
  created_at timestamptz not null default now()
);

alter table public.meta_ads enable row level security;

create policy "Meta ads are viewable by any authenticated user"
  on public.meta_ads for select
  using (auth.role() = 'authenticated');

-- ============================================================================
-- SAVED PRODUCTS
-- ============================================================================
-- `product_id` is intentionally a plain text column rather than a foreign
-- key into `products`. While the app runs on the mock data set (see
-- lib/mock-data.ts), product ids are static slugs that never get written to
-- `products`. Once live sourcing is wired up, ids will be the live
-- provider's product id (or the `products.id` uuid cast to text) with no
-- schema change required.
create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  collection_name text not null default 'Default',
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, collection_name)
);

alter table public.saved_products enable row level security;

create policy "Saved products are viewable by owner"
  on public.saved_products for select
  using (auth.uid() = user_id);

create policy "Saved products are insertable by owner"
  on public.saved_products for insert
  with check (auth.uid() = user_id);

create policy "Saved products are updatable by owner"
  on public.saved_products for update
  using (auth.uid() = user_id);

create policy "Saved products are deletable by owner"
  on public.saved_products for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_opportunity_score on public.products (opportunity_score desc);
create index if not exists idx_meta_ads_product_id on public.meta_ads (product_id);
create index if not exists idx_meta_ads_active_since_days on public.meta_ads (active_since_days desc);
create index if not exists idx_saved_products_user_id on public.saved_products (user_id);

-- ============================================================================
-- updated_at TRIGGERS
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();
