-- Migration: Add max_avg_speed to user_statistics
alter table public.user_statistics add column if not exists max_avg_speed float default 0;
