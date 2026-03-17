create table if not exists about_milestones (
  id text primary key,
  era text not null,
  title text not null,
  description text not null,
  image text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists about_milestones_sort_order_idx
  on about_milestones (sort_order);

create table if not exists projects (
  id text primary key,
  title text not null,
  category text not null,
  tagline text not null,
  description text not null,
  stack jsonb not null default '[]'::jsonb,
  complexity integer not null,
  size text not null,
  image text not null,
  image_mobile text,
  link text,
  stat text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_sort_order_idx
  on projects (sort_order);

create table if not exists contact_submissions (
  id text primary key,
  name text not null,
  email text not null,
  message text not null,
  intent text not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_timestamp_idx
  on contact_submissions (timestamp desc);

create index if not exists contact_submissions_intent_idx
  on contact_submissions (intent);

create table if not exists analytics_events (
  id text primary key,
  user_id text not null,
  timestamp timestamptz not null,
  ip text,
  user_agent text,
  referrer text,
  screen_width integer,
  screen_height integer,
  timezone text,
  language text,
  device_type text,
  browser text,
  os text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_events_timestamp_idx
  on analytics_events (timestamp desc, id desc);

create index if not exists analytics_events_user_id_idx
  on analytics_events (user_id);

create index if not exists analytics_events_device_type_idx
  on analytics_events (device_type);
