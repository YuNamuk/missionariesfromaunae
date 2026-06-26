-- ════════════════════════════════════════════════════════════════════════
--  조선 선교사 자료실 — Postgres / Supabase schema
--  Goals: data preservation, easy updates, analysis, and crawling with
--  *mandatory source attribution*. Run this in the Supabase SQL editor.
-- ════════════════════════════════════════════════════════════════════════

-- ─── provenance (defined first; everything ingested cites a source) ───────
create table if not exists sources (
  id           bigint generated always as identity primary key,
  source_url   text        not null,                 -- ALWAYS cite the origin
  site_name    text,
  title        text,
  author       text,
  license      text,                                 -- ToS / license note
  fetched_at   timestamptz not null default now(),
  content_hash text,                                 -- dedupe identical fetches
  raw          jsonb,                                -- archived snapshot/excerpt
  created_at   timestamptz not null default now()
);
comment on column sources.source_url is 'Required. Public origin URL — attribution must always be shown in the UI.';

-- ─── places ───────────────────────────────────────────────────────────────
create table if not exists places (
  id         text primary key,
  name       text not null,
  category   text not null check (category in ('port','origin','site','person')),
  lat        double precision,
  lng        double precision,
  year       int,
  cluster    boolean not null default false,
  summary    text,
  facts      jsonb not null default '[]',            -- [[label, value], ...]
  source_id  bigint references sources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists place_subsites (
  id        bigint generated always as identity primary key,
  place_id  text not null references places(id) on delete cascade,
  name      text not null,
  note      text
);

-- ─── people ───────────────────────────────────────────────────────────────
create table if not exists people (
  id           text primary key,
  name         text not null,
  name_en      text,
  glyph        text,
  arrival_year int,
  place_id     text references places(id),
  country      text,
  org          text,
  role         text,
  life         text,
  summary      text,
  facts        jsonb not null default '[]',          -- [[label, value], ...]
  media        jsonb not null default '{}',          -- { video, interview, photos[] }
  photo        text,                                 -- 인물 사진 URL
  wiki         text,                                 -- 위키백과 링크
  burial_place_id text references places(id),        -- 안장 묘역
  active_periods jsonb not null default '[]',        -- 조선 사역 구간 [[start,end], ...]
  source_id    bigint references sources(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 관리자 사이트 설정 (연도 범위 · 용어 표기) ─────────────────────────────
create table if not exists app_settings (
  key        text primary key,                       -- 예: year_min, year_max, term.role.medical
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists timeline_events (
  id          bigint generated always as identity primary key,
  person_id   text not null references people(id) on delete cascade,
  year        int,
  year_label  text,
  description text not null,
  source_id   bigint references sources(id)
);
create index if not exists timeline_events_year_idx on timeline_events(year);

create table if not exists relationships (
  id          bigint generated always as identity primary key,
  from_person text not null references people(id) on delete cascade,
  to_person   text not null references people(id) on delete cascade,
  type        text not null check (type in ('influence','prepare','partner','mentor','family','succeed')),
  note        text,
  source_id   bigint references sources(id),
  unique (from_person, to_person, type)
);

-- ─── bibliography / resources ─────────────────────────────────────────────
create table if not exists resources (
  id     bigint generated always as identity primary key,
  ref    int unique,                                 -- original index in RES[]
  title  text not null,
  author text,
  accent text,
  url    text
);

create table if not exists person_resources (
  person_id   text   not null references people(id) on delete cascade,
  resource_id bigint not null references resources(id) on delete cascade,
  primary key (person_id, resource_id)
);

-- ─── crawling: candidates wait for human review before merge ───────────────
create table if not exists ingestion_candidates (
  id          bigint generated always as identity primary key,
  source_id   bigint not null references sources(id),
  target_type text not null check (target_type in ('person','place','timeline','relationship','resource')),
  target_id   text,                                  -- existing row id, or null for new
  payload     jsonb not null,                        -- proposed fields
  status      text not null default 'pending' check (status in ('pending','approved','rejected','merged')),
  reviewer    text,
  note        text,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists ingestion_candidates_status_idx on ingestion_candidates(status);

-- ─── updated_at trigger ───────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists people_updated on people;
create trigger people_updated before update on people
  for each row execute function set_updated_at();
drop trigger if exists places_updated on places;
create trigger places_updated before update on places
  for each row execute function set_updated_at();

-- ─── Row Level Security: public read, writes via service role only ─────────
alter table sources              enable row level security;
alter table places               enable row level security;
alter table place_subsites       enable row level security;
alter table people               enable row level security;
alter table timeline_events      enable row level security;
alter table relationships        enable row level security;
alter table resources            enable row level security;
alter table person_resources     enable row level security;
alter table app_settings         enable row level security;
alter table ingestion_candidates enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sources','places','place_subsites','people',
    'timeline_events','relationships','resources','person_resources','app_settings']
  loop
    execute format(
      'drop policy if exists "public read" on %I; create policy "public read" on %I for select using (true);',
      t, t);
  end loop;
end $$;
-- ingestion_candidates intentionally has NO public policy (review queue is private).
