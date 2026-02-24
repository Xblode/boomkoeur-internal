-- =============================================================================
-- Migration 003 : Events
-- =============================================================================
-- Tables : artists, events, event_artists, event_comments (avec org_id)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  genre TEXT DEFAULT '',
  type TEXT DEFAULT 'dj' CHECK (type IN ('dj', 'photographe', 'lightjockey')),
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  end_time TEXT,
  location TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('idea', 'preparation', 'confirmed', 'completed', 'archived')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags JSONB DEFAULT '[]',
  linked_elements JSONB DEFAULT '[]',
  assignees JSONB DEFAULT '[]',
  media JSONB DEFAULT '{}',
  com_workflow JSONB DEFAULT '{}',
  shotgun_event_id INTEGER,
  shotgun_event_url TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_artists (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  performance_time TEXT,
  fee NUMERIC,
  PRIMARY KEY (event_id, artist_id)
);

CREATE TABLE IF NOT EXISTS public.event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_artists_org_id ON artists(org_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_org_id ON event_comments(org_id);
