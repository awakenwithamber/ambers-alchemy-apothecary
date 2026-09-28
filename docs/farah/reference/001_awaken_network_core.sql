create extension if not exists pgcrypto;

create type public.coven_visibility as enum ('public','private','secret');
create type public.coven_role as enum ('owner','admin','moderator','member');
create type public.membership_status as enum ('pending','active','blocked');
create type public.post_visibility as enum ('public','members');
create type public.agent_job_status as enum ('queued','running','needs_approval','completed','failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-zA-Z0-9_]{3,30}$'),
  display_name text not null,
  bio text default '', avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.covens (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  name text not null, description text default '', visibility public.coven_visibility not null default 'public',
  owner_id uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.coven_members (
  coven_id uuid references public.covens(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role public.coven_role not null default 'member', status public.membership_status not null default 'pending',
  joined_at timestamptz not null default now(), primary key(coven_id,user_id)
);
create table public.posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id),
  coven_id uuid references public.covens(id) on delete cascade, body text not null check(char_length(body) between 1 and 10000),
  visibility public.post_visibility not null default 'members', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id), body text not null check(char_length(body) between 1 and 5000), created_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(), coven_id uuid references public.covens(id) on delete cascade,
  creator_id uuid not null references public.profiles(id), title text not null, description text default '', starts_at timestamptz not null,
  ends_at timestamptz, location_label text, meeting_url text, created_at timestamptz not null default now(), check(ends_at is null or ends_at > starts_at)
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now()
);
create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade, joined_at timestamptz not null default now(), primary key(conversation_id,user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id), body text not null check(char_length(body) between 1 and 10000), created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null, payload jsonb not null default '{}'::jsonb, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id),
  target_type text not null, target_id uuid not null, reason text not null, status text not null default 'open', created_at timestamptz not null default now()
);
create table public.agent_jobs (
  id uuid primary key default gen_random_uuid(), requested_by uuid references public.profiles(id), agent text not null,
  task text not null, risk text not null default 'low', status public.agent_job_status not null default 'queued',
  input jsonb not null default '{}'::jsonb, output jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.audit_log (
  id bigint generated always as identity primary key, actor_id uuid, actor_type text not null,
  action text not null, entity_type text not null, entity_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index posts_coven_created_idx on public.posts(coven_id,created_at desc);
create index messages_conversation_created_idx on public.messages(conversation_id,created_at);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);

create or replace function public.is_active_coven_member(cid uuid, uid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.coven_members m where m.coven_id=cid and m.user_id=uid and m.status='active');
$$;
create or replace function public.is_coven_staff(cid uuid, uid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.coven_members m where m.coven_id=cid and m.user_id=uid and m.status='active' and m.role in ('owner','admin','moderator'));
$$;

alter table public.profiles enable row level security;
alter table public.covens enable row level security;
alter table public.coven_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy covens_read on public.covens for select to authenticated using (visibility='public' or owner_id=auth.uid() or public.is_active_coven_member(id,auth.uid()));
create policy covens_create on public.covens for insert to authenticated with check(owner_id=auth.uid());
create policy covens_update_staff on public.covens for update to authenticated using(owner_id=auth.uid() or public.is_coven_staff(id,auth.uid()));
create policy members_read on public.coven_members for select to authenticated using(user_id=auth.uid() or public.is_active_coven_member(coven_id,auth.uid()));
create policy members_join on public.coven_members for insert to authenticated with check(user_id=auth.uid());
create policy posts_read on public.posts for select to authenticated using((coven_id is null and visibility='public') or author_id=auth.uid() or (coven_id is not null and public.is_active_coven_member(coven_id,auth.uid())));
create policy posts_create on public.posts for insert to authenticated with check(author_id=auth.uid() and (coven_id is null or public.is_active_coven_member(coven_id,auth.uid())));
create policy comments_read on public.comments for select to authenticated using(exists(select 1 from public.posts p where p.id=post_id and (p.author_id=auth.uid() or (p.coven_id is not null and public.is_active_coven_member(p.coven_id,auth.uid())) or (p.coven_id is null and p.visibility='public'))));
create policy comments_create on public.comments for insert to authenticated with check(author_id=auth.uid());
create policy events_read on public.events for select to authenticated using(coven_id is null or public.is_active_coven_member(coven_id,auth.uid()));
create policy events_create on public.events for insert to authenticated with check(creator_id=auth.uid() and (coven_id is null or public.is_active_coven_member(coven_id,auth.uid())));
create policy conversation_members_read on public.conversation_members for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.conversation_members me where me.conversation_id=conversation_id and me.user_id=auth.uid()));
create policy conversations_read on public.conversations for select to authenticated using(exists(select 1 from public.conversation_members me where me.conversation_id=id and me.user_id=auth.uid()));
create policy messages_read on public.messages for select to authenticated using(exists(select 1 from public.conversation_members me where me.conversation_id=conversation_id and me.user_id=auth.uid()));
create policy messages_create on public.messages for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.conversation_members me where me.conversation_id=conversation_id and me.user_id=auth.uid()));
create policy notifications_self on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notifications_update_self on public.notifications for update to authenticated using(user_id=auth.uid());
create policy reports_create on public.reports for insert to authenticated with check(reporter_id=auth.uid());
create policy reports_read_own on public.reports for select to authenticated using(reporter_id=auth.uid());
create policy agent_jobs_own on public.agent_jobs for select to authenticated using(requested_by=auth.uid());
create policy agent_jobs_create on public.agent_jobs for insert to authenticated with check(requested_by=auth.uid());
