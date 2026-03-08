-- ============================================================
-- CareCall Supabase Schema
-- Run this in the Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('patient', 'caretaker')),
  name text not null,
  phone text,
  email text,
  age integer,
  avatar text default '👤',
  emergency_contact jsonb,          -- { name, phone, relationship }
  reminder_preference text default 'Phone Call',
  preferred_time text default '09:00 AM',
  relationship text,                -- caretaker only
  adherence_percent integer default 100,
  risk_level text default 'Low',
  last_medication text,
  last_call_answered text,
  wellness_summary text,
  created_at timestamptz default now()
);

-- 2. Caretaker ↔ Patient link
create table if not exists caretaker_patients (
  id uuid default gen_random_uuid() primary key,
  caretaker_id uuid references profiles(id) on delete cascade not null,
  patient_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(caretaker_id, patient_id)
);

-- 3. Medications
create table if not exists medications (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  time text not null,
  status text default 'upcoming' check (status in ('taken', 'upcoming', 'missed')),
  instructions text,
  created_at timestamptz default now()
);

-- 4. Call history
create table if not exists call_history (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  call_date timestamptz default now(),
  type text not null,
  answered boolean default false,
  response text,
  duration text,
  created_at timestamptz default now()
);

-- 5. Wellness questions (caretaker-customizable)
create table if not exists wellness_questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  options jsonb not null,            -- ["Great", "Good", "Okay", "Not well"]
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 6. Wellness submissions (patient answers)
create table if not exists wellness_submissions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  patient_name text,
  answers jsonb not null,            -- { "w1": "Great", "w2": "Yes" }
  created_at timestamptz default now()
);

-- 7. Alerts
create table if not exists alerts (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('info', 'warning', 'danger')),
  message text not null,
  priority text default 'low' check (priority in ('low', 'medium', 'high')),
  time text,
  wellness_submission_id uuid references wellness_submissions(id) on delete set null,
  created_at timestamptz default now()
);

-- 8. Scheduled calls
create table if not exists scheduled_calls (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) on delete cascade not null,
  patient_name text,
  date text not null,
  time text not null,
  purpose text not null,
  status text default 'scheduled',
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- Keep it simple for hackathon: authenticated users can do everything
-- ============================================================

alter table profiles enable row level security;
alter table caretaker_patients enable row level security;
alter table medications enable row level security;
alter table call_history enable row level security;
alter table wellness_questions enable row level security;
alter table wellness_submissions enable row level security;
alter table alerts enable row level security;
alter table scheduled_calls enable row level security;

-- Allow any authenticated user full access (hackathon-friendly)
create policy "Authenticated full access" on profiles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on caretaker_patients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on medications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on call_history for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on wellness_questions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on wellness_submissions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on alerts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access" on scheduled_calls for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
