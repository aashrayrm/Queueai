-- ============================================================
-- QueueAI — Live Fullstack Upgrade (Migration 0003)
-- Use this on an existing Supabase project that already ran the
-- older 0001/0002 migrations. Then rerun 0002 if you want the
-- expanded demo data.
-- ============================================================

alter table public.places
  add column if not exists avg_service_minutes integer not null default 8,
  add column if not exists last_recalculated_at timestamptz;

alter table public.queue_entries
  add column if not exists position_at_join integer,
  add column if not exists expected_service_at timestamptz,
  add column if not exists notify_at timestamptz,
  add column if not exists joined_at timestamptz not null default now();

create index if not exists idx_queue_entries_status on public.queue_entries(status);

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
