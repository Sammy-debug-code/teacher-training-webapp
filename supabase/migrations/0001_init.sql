-- Bethel Teacher Training — initial schema
-- Run once in the Supabase SQL editor (or via supabase db push).

create extension if not exists pgcrypto;

create table if not exists teachers (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique check (username = lower(username)),
  display_name    text not null,
  pin_hash        text not null,
  section         text not null check (section in ('junior','senior')),
  is_admin        boolean not null default false,
  is_active       boolean not null default true,
  failed_attempts int not null default 0,
  locked_until    timestamptz,
  last_seen_at    timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists module_progress (
  teacher_id      uuid not null references teachers(id) on delete cascade,
  module_id       text not null,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  current_day     int not null default 1,
  unlocked_until  int not null default 1,
  primary key (teacher_id, module_id)
);

create table if not exists card_events (
  id          bigserial primary key,
  teacher_id  uuid not null references teachers(id) on delete cascade,
  module_id   text not null,
  session_id  text not null,
  card_id     text not null,
  event_type  text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists card_events_teacher_idx on card_events (teacher_id, module_id, session_id);

create table if not exists reflections (
  id          bigserial primary key,
  teacher_id  uuid not null references teachers(id) on delete cascade,
  module_id   text not null,
  session_id  text not null,
  prompt_id   text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists reflections_teacher_idx on reflections (teacher_id, created_at desc);

create table if not exists coin_ledger (
  id          bigserial primary key,
  teacher_id  uuid not null references teachers(id) on delete cascade,
  delta       int not null,
  reason      text not null,
  ref         text,
  created_at  timestamptz not null default now()
);
create index if not exists coin_ledger_teacher_idx on coin_ledger (teacher_id);

create table if not exists daily_visits (
  teacher_id  uuid not null references teachers(id) on delete cascade,
  visit_date  date not null,
  primary key (teacher_id, visit_date)
);

create table if not exists holidays (
  day    date primary key,
  label  text not null
);

-- Row Level Security: on everywhere. The app talks to the database only from
-- the server with the secret key, which bypasses RLS; the publishable key
-- therefore sees nothing.
alter table teachers         enable row level security;
alter table module_progress  enable row level security;
alter table card_events      enable row level security;
alter table reflections      enable row level security;
alter table coin_ledger      enable row level security;
alter table daily_visits     enable row level security;
alter table holidays         enable row level security;
