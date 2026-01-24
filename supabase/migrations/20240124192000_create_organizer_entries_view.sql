-- Create a specific view for Organizers to see all entry details for their events
-- This approach bypasses RLS on individual tables (like students/dojos) because Views created by admin/postgres 
-- execute with the privileges of the owner (security_invoker=false by default in older PG, but we specify to be sure or rely on owner)
-- We explicitly filter by auth.uid() to ensure security.

create or replace view organizer_entries_view as
select
    e.id as entry_id,
    e.event_id,
    e.status,
    e.participation_type,
    e.created_at,
    e.coach_id,
    e.event_day_id,
    e.category_id,
    e.student_id,
    
    -- Student info
    s.name as student_name,
    s.rank as student_rank,
    s.gender as student_gender,
    s.weight as student_weight,
    s.date_of_birth as student_dob,
    
    -- Dojo info
    d.name as dojo_name,
    
    -- Category info
    c.name as category_name,
    
    -- Day info
    ed.name as event_day_name,
    ed.date as event_day_date,
    
    -- Coach info
    p.full_name as coach_name,
    p.email as coach_email,

    -- Event Organizer ID for filtering
    ev.organizer_id
from entries e
join students s on e.student_id = s.id
left join dojos d on s.dojo_id = d.id
left join categories c on e.category_id = c.id
left join event_days ed on e.event_day_id = ed.id
join profiles p on e.coach_id = p.id
join events ev on e.event_id = ev.id
where
    ev.organizer_id = auth.uid();

-- Grant access to authenticated users
grant select on organizer_entries_view to authenticated;
