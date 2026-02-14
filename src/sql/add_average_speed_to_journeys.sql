-- Migration: Add average_speed to journeys table
alter table public.journeys 
add column if not exists average_speed float default 0;
