-- FUNCTION: Update user statistics on journey completion
create or replace function public.update_user_statistics()
returns trigger as $$
begin
  -- Insert or update the user_statistics table
  insert into public.user_statistics (
    user_id,
    total_distance_meters,
    total_journeys,
    total_duration_seconds,
    max_speed,
    max_avg_speed,
    updated_at
  )
  values (
    new.user_id,
    coalesce(new.distance_meters, 0),
    1,
    coalesce(new.duration_seconds, 0),
    coalesce(new.max_speed, 0),
    coalesce(new.average_speed, 0), -- Initialize with first journey's average speed
    now()
  )
  on conflict (user_id) do update
  set
    total_distance_meters = user_statistics.total_distance_meters + excluded.total_distance_meters,
    total_journeys = user_statistics.total_journeys + 1,
    total_duration_seconds = user_statistics.total_duration_seconds + excluded.total_duration_seconds,
    max_speed = greatest(user_statistics.max_speed, excluded.max_speed), -- Keep the highest max speed
    max_avg_speed = greatest(user_statistics.max_avg_speed, excluded.max_avg_speed), -- Keep the highest average speed
    average_pace = case 
      when (user_statistics.total_distance_meters + excluded.total_distance_meters) > 0 
      then ((user_statistics.total_duration_seconds + excluded.total_duration_seconds) / 60.0) / ((user_statistics.total_distance_meters + excluded.total_distance_meters) / 1000.0)
      else 0 
    end,
    updated_at = now();
    
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER: Attach to journeys table
drop trigger if exists on_journey_created on public.journeys;
create trigger on_journey_created
  after insert on public.journeys
  for each row execute procedure public.update_user_statistics();
