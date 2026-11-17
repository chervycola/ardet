-- ═══════════════════════════════════════════════════════════════════
-- СТОЯНКА НА ДВОИХ — вмятины и цепочки за кольцом огня
-- (weave/DEPTH_GAMES_2026-11-16.md, механика 6, с правкой суда; клиент — src/world/stands.js).
-- Выполнить после server/supabase.sql: Supabase → SQL Editor → вставить файл целиком → Run.
-- Файл можно прогонять повторно.
--  · Вмятина (dent) — где стояли до покоя и шагнули назад; цепочка (chain) — где шли
--    вперёд до падения, обрывается раньше края. Одно перо, один срок.
--  · Срок по глубине: у ближней кромки натянутой ленты 30 суток, к 0,9 — полтора.
--    Встал в вмятину до покоя и шагнул назад — срок заново (та же запись: рядом есть —
--    продлить, вторую не класть). Никто не встал — заносит.
--  · Счёта нет: клиенту видно только вид, место, след и до какого часа держится.
--  · Пишет только stand_leave (security definer): место правдоподобно, лимит как у
--    записок, близкие сливаются, на отрезок (клетку 320×320) — три вмятины и две цепочки.
-- Глубина здесь — без рельефа (у клиента warpedDist: шум ±77 точек), отсюда допуск ~0,07.
-- ═══════════════════════════════════════════════════════════════════

-- глубина за огнём 0..1 по прямоугольнику городка (src/world/disc.js: городок 4500..8250 ×
-- 4500..6550, огонь кончается в 3300 от кромки, полная глубина через 1120)
create or replace function public.stand_depth(x integer, y integer) returns double precision
language sql immutable as $$
  select (sqrt(power(greatest(0, 4500 - x, x - 8250), 2) + power(greatest(0, 4500 - y, y - 6550), 2)) - 3300) / 1120.0
$$;

-- срок: 30 суток до 0,5 (ближе лента до распада 50 не тянет — стоянок нет), полтора к 0,9
-- и глубже, между — по степени (termOf в src/world/stands.js — то же число)
create or replace function public.stand_term(dep double precision) returns interval
language sql immutable as $$
  select make_interval(secs => 86400 * 30 * power(0.05, least(1, greatest(0, (dep - 0.5) / 0.4))))
$$;

-- сторона края — как src/world/edges.js: по наибольшему вылету за городок
create or replace function public.stand_side(x integer, y integer) returns text
language sql immutable as $$
  select case greatest(y - 6550, x - 8250, 4500 - y, 4500 - x)
    when y - 6550 then 'S' when x - 8250 then 'E' when 4500 - y then 'N' else 'W' end
$$;

-- правдоподобно ли место. Вмятина — в поясе, где лента тянула (клиент: распад ≥ 50 и глубина
-- ≤ 0,9 → без рельефа ~0,47..0,97). Цепочка — обрыв в поясе; след — 3..16 шагов (dx, dy)
-- от обрыва назад, шаг 3..24 точки, весь за огнём, хвост мельче обрыва (шли к краю)
create or replace function public.stand_place_ok(k text, x integer, y integer, path smallint[]) returns boolean
language plpgsql immutable as $$
declare
  d double precision := public.stand_depth(x, y);
  px integer := x; py integer := y; s integer; n integer := coalesce(cardinality(path), 0);
begin
  if x is null or y is null or x not between 0 and 12750 or y not between 0 and 11050 then return false; end if;
  if k = 'dent' then return path is null and d between 0.47 and 0.97; end if;
  if k is distinct from 'chain' or d not between 0.45 and 0.99 then return false; end if;
  if n not between 6 and 32 or n % 2 <> 0 or array_position(path, null) is not null then return false; end if;
  for i in 1 .. n / 2 loop
    s := path[2 * i - 1] * path[2 * i - 1] + path[2 * i] * path[2 * i];
    px := px + path[2 * i - 1]; py := py + path[2 * i];
    if s < 9 or s > 576 or public.stand_depth(px, py) < 0.2 then return false; end if;
  end loop;
  return d >= public.stand_depth(px, py);
end $$;

create table if not exists public.stands (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('dent', 'chain')),
  x           integer not null,
  y           integer not null,
  cx          integer generated always as (x / 320) stored,     -- отрезок: клетка 320×320
  cy          integer generated always as (y / 320) stored,
  path        smallint[] check (path is null or cardinality(path) <= 32),
  expires_at  timestamptz not null,
  author      uuid not null references auth.users(id) on delete cascade,
  last_by     uuid references auth.users(id) on delete set null,   -- кто стоял последним
  created_at  timestamptz not null default now(),
  check ((kind = 'dent') = (path is null))
);
create index if not exists stands_area on public.stands (x, y);
create index if not exists stands_cell on public.stands (kind, cx, cy, expires_at);

-- журнал действий — только для лимита; клиенту не виден
create table if not exists public.stand_acts (
  actor  uuid not null references auth.users(id) on delete cascade,
  at     timestamptz not null default now(),
  act    text not null check (act in ('new', 'renew', 'fall'))
);
create index if not exists stand_acts_actor on public.stand_acts (actor, at);

-- лимит, как у записок: одно действие в минуту; новых 10 в сутки, продлений 20
create or replace function public.stand_quota_ok(a text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.stand_acts where actor = auth.uid() and act <> 'fall' and at > now() - interval '1 minute')
     and (select count(*) from public.stand_acts where actor = auth.uid() and act = a and at > now() - interval '1 day')
         < case a when 'new' then 10 else 20 end
$$;

-- оставить вмятину или цепочку. Рядом живая того же вида (вмятина — 16 точек, цепочка — 40)
-- — продлить её срок от сегодня по её месту, вторую не класть. Отрезок полон — пустой ответ.
-- Ошибки: 'auth' (не вошёл), 'place' (неправдоподобно), 'quota' (лимит)
create or replace function public.stand_leave(p_kind text, p_x integer, p_y integer, p_path smallint[] default null)
returns table (id bigint, kind text, x integer, y integer, path smallint[], expires_at timestamptz)
language plpgsql volatile security definer set search_path = public as $$
#variable_conflict use_column
declare
  me uuid := auth.uid();
  r integer := case p_kind when 'chain' then 40 else 16 end;
  cap integer := case p_kind when 'chain' then 2 else 3 end;
  hit bigint;
begin
  if me is null then raise exception 'auth' using errcode = '42501'; end if;
  if not public.stand_place_ok(p_kind, p_x, p_y, p_path) then raise exception 'place' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext('stand ' || p_kind || ' ' || (p_x / 320) || ' ' || (p_y / 320)));   -- отрезок — по очереди
  select s.id into hit from public.stands s
   where s.kind = p_kind and s.expires_at > now() and s.x between p_x - r and p_x + r and s.y between p_y - r and p_y + r
     and (s.x - p_x) * (s.x - p_x) + (s.y - p_y) * (s.y - p_y) <= r * r
   order by (s.x - p_x) * (s.x - p_x) + (s.y - p_y) * (s.y - p_y) limit 1;
  if hit is not null then
    if not public.stand_quota_ok('renew') then raise exception 'quota' using errcode = 'P0001'; end if;
    insert into public.stand_acts (actor, act) values (me, 'renew');
    return query
      update public.stands s set expires_at = greatest(s.expires_at, now() + public.stand_term(public.stand_depth(s.x, s.y))), last_by = me
       where s.id = hit returning s.id, s.kind, s.x, s.y, s.path, s.expires_at;
    return;
  end if;
  if not public.stand_quota_ok('new') then raise exception 'quota' using errcode = 'P0001'; end if;
  if (select count(*) from public.stands s where s.kind = p_kind and s.cx = p_x / 320 and s.cy = p_y / 320 and s.expires_at > now()) >= cap then
    return;                                                       -- на отрезке довольно
  end if;
  insert into public.stand_acts (actor, act) values (me, 'new');
  return query
    insert into public.stands as s (kind, x, y, path, expires_at, author, last_by)
    values (p_kind, p_x, p_y, p_path, now() + public.stand_term(public.stand_depth(p_x, p_y)), me, me)
    returning s.id, s.kind, s.x, s.y, s.path, s.expires_at;
end $$;

-- (предложение суда, по желанию автора) падение вдвое сокращает остаток срока стоянок
-- на этой стороне, где падавший стоял последним. Чужим — ничего. Молча.
-- Не нужно — удалить эту функцию и FALL_HALVES = false в src/world/stands.js
create or replace function public.stand_fall(p_x integer, p_y integer) returns void
language plpgsql volatile security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null or public.stand_depth(p_x, p_y) <= 0 then return; end if;
  if exists (select 1 from public.stand_acts where actor = me and act = 'fall' and at > now() - interval '1 minute') then return; end if;
  update public.stands s set expires_at = now() + (s.expires_at - now()) / 2
   where s.last_by = me and s.expires_at > now() and public.stand_side(s.x, s.y) = public.stand_side(p_x, p_y);
  insert into public.stand_acts (actor, act) values (me, 'fall');
end $$;

alter table public.stands enable row level security;
alter table public.stand_acts enable row level security;
drop policy if exists stands_read on public.stands;
create policy stands_read on public.stands for select to anon, authenticated using (expires_at > now());

-- права: читать — всем, и только вид, место, след и срок; писать — только через stand_leave
revoke all on public.stands, public.stand_acts from anon, authenticated;
grant select (id, kind, x, y, path, expires_at) on public.stands to anon, authenticated;
revoke all on function public.stand_leave(text, integer, integer, smallint[]) from public, anon, authenticated;
revoke all on function public.stand_fall(integer, integer) from public, anon, authenticated;
revoke all on function public.stand_quota_ok(text) from public, anon, authenticated;
grant execute on function public.stand_leave(text, integer, integer, smallint[]) to authenticated;
grant execute on function public.stand_fall(integer, integer) to authenticated;

-- уборка (по желанию, раз в сутки — pg_cron или вручную):
-- delete from public.stands where expires_at < now() - interval '1 day';
-- delete from public.stand_acts where at < now() - interval '2 days';

-- ЧЕГО БАЗА НЕ ПРОВЕРИТ (решает честный клиент; вред ограничен лимитом, отрезком и сроком):
-- что странник там стоял (шаги нигде не лежат); распад ≥ 50, покой и шаг назад после покоя;
-- что цепочка кончилась падением и обрыв — за 60–150 точек; точную глубину (рельеф);
-- один ли это человек (вход анонимный: капча на вход в Supabase — по желанию).
