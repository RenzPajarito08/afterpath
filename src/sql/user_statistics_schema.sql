-- TABLE STRUCTURE: user_statistics
-- Aggregated statistics for a user, linked to their profile
create table if not exists public.user_statistics (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  total_distance_meters float default 0,
  total_journeys integer default 0,
  total_duration_seconds bigint default 0,
  average_pace float default 0, -- stored as minutes per kilometer or similar standard
  max_speed float default 0,   -- stored as meters per second or km/h
  updated_at timestamp with time zone default now()
);

-- SECURITY: RLS
alter table public.user_statistics enable row level security;

-- Policies
drop policy if exists "Public user statistics are viewable by everyone." on user_statistics;
create policy "Public user statistics are viewable by everyone."
  on user_statistics for select
  using ( true );

drop policy if exists "Users can insert their own statistics." on user_statistics;
create policy "Users can insert their own statistics."
  on user_statistics for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own statistics." on user_statistics;
create policy "Users can update their own statistics."
  on user_statistics for update
  using ( auth.uid() = user_id );
