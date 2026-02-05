-- Update-only migration: role-based RLS and organizer view hardening

-- POLICIES: drop old, recreate new
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Coaches view own dojos" ON dojos;

DROP POLICY IF EXISTS "Coaches insert own dojos" ON dojos;

DROP POLICY IF EXISTS "Coaches update own dojos" ON dojos;

DROP POLICY IF EXISTS "Coaches delete own dojos" ON dojos;

DROP POLICY IF EXISTS "Coaches manage their students" ON students;

DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;

DROP POLICY IF EXISTS "Organizers manage own events" ON events;

DROP POLICY IF EXISTS "View categories" ON categories;

DROP POLICY IF EXISTS "Organizers manage categories" ON categories;

DROP POLICY IF EXISTS "View event days" ON event_days;

DROP POLICY IF EXISTS "Organizers manage event days" ON event_days;

DROP POLICY IF EXISTS "Coaches manage own entries" ON entries;

DROP POLICY IF EXISTS "Organizers view entries for their events" ON entries;

DROP POLICY IF EXISTS "Organizers update entries" ON entries;

DROP POLICY IF EXISTS "Coaches apply" ON event_applications;

DROP POLICY IF EXISTS "Coaches view own applications" ON event_applications;

DROP POLICY IF EXISTS "Organizers manage applications" ON event_applications;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles FOR
INSERT
WITH
    CHECK (
        auth.uid () = id
        AND role = 'coach'
    );

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (
        auth.uid () = id
        AND role = (
            SELECT role
            FROM profiles
            WHERE
                id = auth.uid ()
        )
    );

-- Dojos
CREATE POLICY "Coaches view own dojos" ON dojos FOR
SELECT USING (
        auth.uid () = coach_id
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('coach', 'admin')
        )
    );

CREATE POLICY "Coaches insert own dojos" ON dojos FOR
INSERT
WITH
    CHECK (
        auth.uid () = coach_id
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('coach', 'admin')
        )
    );

CREATE POLICY "Coaches update own dojos" ON dojos FOR
UPDATE USING (
    auth.uid () = coach_id
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('coach', 'admin')
    )
);

CREATE POLICY "Coaches delete own dojos" ON dojos FOR DELETE USING (
    auth.uid () = coach_id
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('coach', 'admin')
    )
);

-- Students
CREATE POLICY "Coaches manage their students" ON students USING (
    EXISTS (
        SELECT 1
        FROM dojos
        WHERE
            dojos.id = students.dojo_id
            AND dojos.coach_id = auth.uid ()
    )
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('coach', 'admin')
    )
);

-- Events
CREATE POLICY "Public events are viewable by everyone" ON events FOR
SELECT USING (is_public = true);

CREATE POLICY "Organizers manage own events" ON events USING (
    auth.uid () = organizer_id
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('organizer', 'admin')
    )
)
WITH
    CHECK (
        auth.uid () = organizer_id
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('organizer', 'admin')
        )
    );

-- Categories / Event Days
CREATE POLICY "View categories" ON categories FOR
SELECT USING (true);

CREATE POLICY "Organizers manage categories" ON categories USING (
    EXISTS (
        SELECT 1
        FROM events
        WHERE
            events.id = categories.event_id
            AND events.organizer_id = auth.uid ()
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE
                    id = auth.uid ()
                    AND role IN ('organizer', 'admin')
            )
    )
);

CREATE POLICY "View event days" ON event_days FOR
SELECT USING (true);

CREATE POLICY "Organizers manage event days" ON event_days USING (
    EXISTS (
        SELECT 1
        FROM events
        WHERE
            events.id = event_days.event_id
            AND events.organizer_id = auth.uid ()
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE
                    id = auth.uid ()
                    AND role IN ('organizer', 'admin')
            )
    )
);

-- Entries
CREATE POLICY "Coaches manage own entries" ON entries USING (
    auth.uid () = coach_id
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('coach', 'admin')
    )
);

CREATE POLICY "Organizers view entries for their events" ON entries FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM events
            WHERE
                events.id = entries.event_id
                AND events.organizer_id = auth.uid ()
                AND EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE
                        id = auth.uid ()
                        AND role IN ('organizer', 'admin')
                )
        )
    );

CREATE POLICY "Organizers update entries" ON entries FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM events
        WHERE
            events.id = entries.event_id
            AND events.organizer_id = auth.uid ()
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE
                    id = auth.uid ()
                    AND role IN ('organizer', 'admin')
            )
    )
);

-- Event Applications
CREATE POLICY "Coaches apply" ON event_applications FOR
INSERT
WITH
    CHECK (
        auth.uid () = coach_id
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('coach', 'admin')
        )
    );

CREATE POLICY "Coaches view own applications" ON event_applications FOR
SELECT USING (
        auth.uid () = coach_id
        AND EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('coach', 'admin')
        )
    );

CREATE POLICY "Organizers manage applications" ON event_applications USING (
    EXISTS (
        SELECT 1
        FROM events
        WHERE
            events.id = event_applications.event_id
            AND events.organizer_id = auth.uid ()
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE
                    id = auth.uid ()
                    AND role IN ('organizer', 'admin')
            )
    )
);

-- View update
CREATE OR REPLACE VIEW organizer_entries_view AS
SELECT e.id AS entry_id, e.event_id, e.status, e.participation_type, e.created_at, e.coach_id, e.event_day_id, e.category_id, e.student_id,

-- Student info
s.name AS student_name,
s.rank AS student_rank,
s.gender AS student_gender,
s.weight AS student_weight,
s.date_of_birth AS student_dob,

-- Dojo info
d.name AS dojo_name,

-- Category info
c.name AS category_name,

-- Day info
ed.name AS event_day_name, ed.date AS event_day_date,

-- Coach info
p.full_name AS coach_name, p.email AS coach_email,

-- Event Organizer ID for filtering
ev.organizer_id
FROM
    entries e
    JOIN students s ON e.student_id = s.id
    LEFT JOIN dojos d ON s.dojo_id = d.id
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN event_days ed ON e.event_day_id = ed.id
    JOIN profiles p ON e.coach_id = p.id
    JOIN events ev ON e.event_id = ev.id
WHERE
    ev.organizer_id = auth.uid ()
    AND EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('organizer', 'admin')
    );

GRANT SELECT ON organizer_entries_view TO authenticated;