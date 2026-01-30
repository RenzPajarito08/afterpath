-- Migration: Add max_speed to journeys table
alter table public.journeys 
add column if not exists max_speed float default 0;
