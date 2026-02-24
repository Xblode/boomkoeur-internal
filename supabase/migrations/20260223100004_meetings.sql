-- =============================================================================
-- Migration 004 : Meetings
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TIMESTAMPTZ NOT NULL,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '10:00',
  location TEXT DEFAULT '',
  participants JSONB DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed')),
  agenda JSONB DEFAULT '[]',
  minutes JSONB DEFAULT '{"freeText": ""}',
  calendar_event_id TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_org_id ON meetings(org_id);
