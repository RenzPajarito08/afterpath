-- Enable PostGIS for location features if we want advanced geo queries (optional, but good for future)
create extension if not exists postgis;

create table public.journeys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text,
  mood_score int, -- 0-10
  activity_type text, -- 'walking', 'running', etc.
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration_seconds int,
  distance_meters float,
  polyline text, -- Encoded route string
  memory_text text, -- "What stayed with you..."
  tags text[], -- Array of strings for emotion tags
  last_viewed_at timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS for Journeys (Users can only see their own)
alter table public.journeys enable row level security;
create policy "Users can view own journeys." on public.journeys for select using (auth.uid() = user_id);
create policy "Users can insert own journeys." on public.journeys for insert with check (auth.uid() = user_id);
create policy "Users can update own journeys." on public.journeys for update using (auth.uid() = user_id);
create policy "Users can delete own journeys." on public.journeys for delete using (auth.uid() = user_id);