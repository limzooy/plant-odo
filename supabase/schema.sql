-- =============================================
-- Plant Todo App - Supabase Schema
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. todos 테이블
create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  text        text not null,
  done        boolean not null default false,
  done_at     text,
  created_at  timestamptz not null default now()
);

-- 2. plants 테이블 (하루 1화분)
create table if not exists public.plants (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  type        text not null,
  created_at  timestamptz not null default now(),
  unique(user_id, date)
);

-- 3. stickers 테이블
create table if not exists public.stickers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  emoji       text not null,
  x           float not null default 0,
  y           float not null default 0,
  created_at  timestamptz not null default now()
);

-- =============================================
-- Row Level Security (RLS) 설정
-- =============================================

alter table public.todos    enable row level security;
alter table public.plants   enable row level security;
alter table public.stickers enable row level security;

-- todos RLS
create policy "todos: 본인만 조회" on public.todos for select using (auth.uid() = user_id);
create policy "todos: 본인만 추가" on public.todos for insert with check (auth.uid() = user_id);
create policy "todos: 본인만 수정" on public.todos for update using (auth.uid() = user_id);
create policy "todos: 본인만 삭제" on public.todos for delete using (auth.uid() = user_id);

-- plants RLS
create policy "plants: 본인만 조회" on public.plants for select using (auth.uid() = user_id);
create policy "plants: 본인만 추가" on public.plants for insert with check (auth.uid() = user_id);
create policy "plants: 본인만 수정" on public.plants for update using (auth.uid() = user_id);
create policy "plants: 본인만 삭제" on public.plants for delete using (auth.uid() = user_id);

-- stickers RLS
create policy "stickers: 본인만 조회" on public.stickers for select using (auth.uid() = user_id);
create policy "stickers: 본인만 추가" on public.stickers for insert with check (auth.uid() = user_id);
create policy "stickers: 본인만 수정" on public.stickers for update using (auth.uid() = user_id);
create policy "stickers: 본인만 삭제" on public.stickers for delete using (auth.uid() = user_id);

-- =============================================
-- 인덱스
-- =============================================
create index if not exists idx_todos_user_date    on public.todos(user_id, date);
create index if not exists idx_plants_user_date   on public.plants(user_id, date);
create index if not exists idx_stickers_user_date on public.stickers(user_id, date);
