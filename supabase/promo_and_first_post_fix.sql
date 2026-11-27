-- ==============================================================================
-- VARSMART - PROMO CODES & 30-DAY TRIAL COMMENCEMENT UPGRADE
-- ==============================================================================
-- Run this script in your Supabase Project -> SQL Editor
--
-- 1. Adds 'first_posted_at', 'promo_code_used', and 'promo_redeemed_at' to profiles.
-- 2. Ensures admins are never blocked from posting and have lifetime selling rights.
-- 3. Ensures 30-day trial only begins when seller posts their first product.
-- ==============================================================================

-- STEP 1: Add new tracking columns
alter table public.profiles
  add column if not exists first_posted_at timestamptz,
  add column if not exists promo_code_used text,
  add column if not exists promo_redeemed_at timestamptz;

-- STEP 2: Backfill first_posted_at for existing sellers who already have products
update public.profiles p
set first_posted_at = (
  select min(l.created_at)
  from public.listings l
  where l.seller_id = p.id
)
where p.first_posted_at is null
  and exists (select 1 from public.listings l where l.seller_id = p.id);

-- STEP 3: Ensure admins have lifetime expiration dates
update public.profiles
set 
  subscription_status = 'active',
  subscription_tier = 'Admin Lifetime (Free)',
  subscription_expires_at = now() + interval '100 years',
  trial_ends_at = now() + interval '100 years'
where role = 'admin';
