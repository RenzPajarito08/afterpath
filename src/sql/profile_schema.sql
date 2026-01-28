-- Add new columns to profiles table if they don't exist
-- Note: Supabase/PostgreSQL schema changes

-- Create profiles table if it doesn't exist (it likely does from auth template, but ensuring safety)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  first_name text,
  last_name text,
  birthday date,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration to add columns if table already exists
-- Using 'add column if not exists' is cleaner but requires PG 9.6+.
-- Supabase is PG 13+ usually.
alter table public.profiles 
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists birthday date,
add column if not exists updated_at timestamp with time zone;
