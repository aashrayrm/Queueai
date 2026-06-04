-- ============================================================
-- QueueAI — Database Schema (Migration 0001)
-- Creates: users, places, queue_entries
-- Custom auth: passwords are hashed (bcrypt) by the backend and
-- stored in users.password_hash. Run 0001 then 0002.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- USERS  (custom auth — backend stores a bcrypt hash)
-- ------------------------------------------------------------
create table if not exists public.users (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  password_hash  text not null,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PLACES
-- Assignment columns + nullable presentational fields so the
-- existing QueueAI UI renders identically.
-- ------------------------------------------------------------
create table if not exists public.places (
  id                   bigint generated always as identity primary key,
  name                 text not null,
  category             text not null,
  estimated_wait_time  integer not null default 0,   -- minutes
  queue_length         integer not null default 0,
  queue_status         text not null default 'low',  -- low | moderate | busy
  created_at           timestamptz not null default now(),

  -- Presentational / UI fields (optional — preserve existing design)
  category_icon        text,
  address              text,
  hours                text,
  rating               numeric(2,1) default 4.5,
  reviews              integer default 0,
  description          text,
  max_queue            integer not null default 20,
  avg_service_minutes  integer not null default 8,
  last_recalculated_at timestamptz,
  best_time_to_visit   text,
  ai_confidence        integer default 90,
  color                text,
  bg_gradient          text,
  status_label         text
);

-- ------------------------------------------------------------
-- QUEUE ENTRIES
-- ------------------------------------------------------------
create table if not exists public.queue_entries (
  id                   bigint generated always as identity primary key,
  customer_name        text not null,
  number_of_persons    integer not null default 1,
  place_id             bigint not null references public.places(id) on delete cascade,
  queue_number         text not null,
  estimated_wait_time  integer not null default 0,        -- minutes
  status               text not null default 'waiting',   -- waiting | served | cancelled
  position_at_join     integer,
  expected_service_at  timestamptz,
  notify_at            timestamptz,
  joined_at            timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index if not exists idx_queue_entries_place_id on public.queue_entries(place_id);
create index if not exists idx_queue_entries_status on public.queue_entries(status);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id              bigint generated always as identity primary key,
  queue_entry_id  bigint references public.queue_entries(id) on delete cascade,
  place_id        bigint references public.places(id) on delete cascade,
  type            text not null default 'info',
  icon            text not null default '🔔',
  message         text not null,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
