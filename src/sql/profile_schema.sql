-- CLEANUP: Remove potentially conflicting objects
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- TABLE STRUCTURE: Ensure profiles table and all required columns exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  email text,
  full_name text,
  avatar_url text,
  first_name text,
  last_name text,
  birthday date,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- MIGRATION: Specific column additions for existing tables
alter table public.profiles 
add column if not exists email text,
add column if not exists username text unique,
add column if not exists updated_at timestamp with time zone;

-- FUNCTION: Resolution for dual login (Username or Email)
create or replace function public.get_email_by_username(lookup_username text)
returns text
language plpgsql
security definer
as $$
begin
  return (
    select u.email 
    from auth.users u
    join public.profiles p on u.id = p.id
    where p.username = lookup_username
    limit 1
  );
end;
$$;

-- TRIGGER FUNCTION: Robust profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  candidate_username text;
begin
  -- Explicitly extract username from metadata
  candidate_username := new.raw_user_meta_data->>'username';
  
  -- Fallback logic if metadata username is missing or empty
  if candidate_username is null or candidate_username = '' then
    candidate_username := split_part(new.email, '@', 1);
  end if;
  
  insert into public.profiles (id, username, email, full_name, avatar_url)
  values (
    new.id, 
    candidate_username,
    new.email,
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    username = excluded.username,
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
exception when others then
  -- Critical Fallback: Ensure at least ID and EMAIL are saved
  -- We use split_part as a last resort username to satisfy the unique constraint if possible, 
  -- but the screen-side check should prevent conflicts.
  insert into public.profiles (id, username, email, updated_at)
  values (
    new.id, 
    COALESCE(candidate_username, split_part(new.email, '@', 1)), 
    new.email, 
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- ATTACH TRIGGER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SECURITY: RLS
alter table public.profiles enable row level security;

-- Policies (ensure they exist or recreate)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
