-- ═══════════════════════════════════════════════════════════════════
-- ПРОВЕРКА СТОЯНОК БЕЗ SUPABASE — как server/check.sql: заглушка Supabase,
-- supabase.sql и stands.sql как есть, затем стоянки от имени странников.
--   createdb ardet_check && psql -X -v ON_ERROR_STOP=0 ardet_check -f server/check-stands.sql 2>&1 | grep -E "PASS|FAIL"
-- ═══════════════════════════════════════════════════════════════════
\set QUIET on
\pset tuples_only on
set client_min_messages = warning;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

\ir supabase.sql
\ir stands.sql
\ir stands.sql

insert into auth.users values
  ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333'), ('44444444-4444-4444-4444-444444444444');
\set u1 '11111111-1111-1111-1111-111111111111'
\set u2 '22222222-2222-2222-2222-222222222222'
\set u3 '33333333-3333-3333-3333-333333333333'
\set u4 '44444444-4444-4444-4444-444444444444'
\echo PASS схема: stands.sql прогоняется повторно

-- ── глубина и срок ──
-- север: y = 4500 - 3300 - 1120·dep, x — над серединой городка
\set ok false
select abs(public.stand_depth(6000, 4500 - 3300 - 784) - 0.7) < 1e-9 and public.stand_depth(6000, 5000) < 0 and public.stand_depth(8250 + 3300 + 560, 5000) between 0.49 and 0.51 as ok \gset
\if :ok \echo PASS глубина: север 0,7; городок — меньше нуля; восток 0,5 \else \echo FAIL глубина \endif
select public.stand_term(0.3) = interval '30 days' and public.stand_term(0.5) = interval '30 days' and public.stand_term(0.63) = interval '30 days'
   and abs(extract(epoch from public.stand_term(0.9)) - 1.5 * 86400) < 1 and abs(extract(epoch from public.stand_term(0.99)) - 1.5 * 86400) < 1
   and public.stand_term(0.7) < interval '30 days' and public.stand_term(0.7) > interval '1.5 days' as ok \gset
\if :ok \echo PASS срок: 30 суток у ближней кромки, полтора к 0,9, между — убывает \else \echo FAIL срок по глубине \endif
\set ok false
select public.stand_side(6000, 100) = 'N' and public.stand_side(6000, 10900) = 'S' and public.stand_side(100, 5000) = 'W' and public.stand_side(12600, 5000) = 'E' as ok \gset
\if :ok \echo PASS сторона: как edges.js \else \echo FAIL сторона \endif

-- ── место ──
select public.stand_place_ok('dent', 6000, 416, null) and not public.stand_place_ok('dent', 6000, 5000, null)
   and not public.stand_place_ok('dent', 6000, 4500 - 3300 - 100, null) and not public.stand_place_ok('dent', 6000, 4500 - 3300 - 1110, null)
   and not public.stand_place_ok('dent', 6000, 416, '{1,1}') as ok \gset
\if :ok \echo PASS место: вмятина — в поясе ленты; в городке, у огня, у самого края и со следом — нет \else \echo FAIL место вмятины \endif
-- цепочка на север: обрыв на 0,85, след назад к огню по 9 точек
\set ok false
select public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,9, 2,9, -2,9, 0,9, 1,9, -1,9}') as ok \gset
\if :ok \echo PASS место: цепочка к краю — да \else \echo FAIL место: цепочка отвергнута \endif
select not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,9, 0,60, 0,9, 0,9}')
   and not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,-9, 0,-9, 0,-9, 0,-9}')
   and not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,9, 0,9}')
   and not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,9, 0,9, 0,9, 0}')
   and not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, null)
   and not public.stand_place_ok('chain', 6000, 4500 - 3300 - 952, '{0,9, 0,null, 0,9, 0,9}') as ok \gset
\if :ok \echo PASS место: скачок, след от края, короткий, нечётный, пустой, с дыркой — нет \else \echo FAIL место: дурная цепочка принята \endif
\set ok false
select not public.stand_place_ok('chain', 5200, 248, '[2:7]={181,9,0,9,0,30000}') and not public.stand_place_ok('chain', 5200, 248, '[0:5]={0,9,0,9,0,9}') as ok \gset
\if :ok \echo PASS место: массив не с единицы — нет (иначе шаг не проверяется) \else \echo FAIL место: массив со сдвигом принят \endif
\set ok false
select public.stand_place_ok('chain', 6000, 6550 + 3300 + 1176, '{0,-9, 1,-9, -1,-9, 0,-9}') as ok \gset
\if :ok \echo PASS место: цепочка юга с обрывом на 1,05 без рельефа (рельеф и ноги) — да \else \echo FAIL место: честная цепочка юга отвергнута \endif

-- ── странник 1 ──
set role anon;
select set_config('request.jwt.claim.sub', '', false) \gset
select * from public.stand_leave('dent', 6000, 416);
\if :ERROR \echo PASS права: без входа стоянку не оставить \else \echo FAIL права: anon оставил стоянку \endif
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', :'u1', false) \gset
\set ok false
select id as d1, expires_at > now() + interval '1.5 days' and expires_at < now() + interval '30 days' as ok from public.stand_leave('dent', 6000, 416) \gset
\if :ok \echo PASS вмятина: оставлена, срок по глубине \else \echo FAIL вмятина: не оставлена или срок \endif
select * from public.stand_leave('dent', 6200, 416);
\if :ERROR \echo PASS лимит: вторая в ту же минуту — нет (:LAST_ERROR_MESSAGE) \else \echo FAIL лимит: вторая в минуту принята \endif
select * from public.stand_leave('dent', 6000, 5000);
\if :ERROR \echo PASS место: в городке — нет (:LAST_ERROR_MESSAGE) \else \echo FAIL место: вмятина в городке \endif
insert into public.stands (kind, x, y, expires_at, author) values ('dent', 6000, 500, now() + interval '10 years', :'u1');
\if :ERROR \echo PASS права: напрямую не положить \else \echo FAIL права: прямая запись \endif
update public.stands set expires_at = now() + interval '10 years' where id = :d1;
\set ok false
select expires_at < now() + interval '31 days' as ok from public.stands where id = :d1 \gset
\if :ok \echo PASS права: срок напрямую не продлить \else \echo FAIL права: срок переписан \endif
delete from public.stands where id = :d1;
\set ok false
select count(*) = 1 as ok from public.stands where id = :d1 \gset
\if :ok \echo PASS права: чужое не стереть (и своё) \else \echo FAIL права: стёрто \endif
select author from public.stands limit 1;
\if :ERROR \echo PASS счёта нет: автора не прочесть \else \echo FAIL счёт: автор виден \endif
select last_by from public.stands limit 1;
\if :ERROR \echo PASS счёта нет: кто стоял последним — не прочесть \else \echo FAIL счёт: last_by виден \endif
select created_at from public.stands limit 1;
\if :ERROR \echo PASS счёта нет: когда положено — не прочесть \else \echo FAIL счёт: created_at виден \endif
select count(*) from public.stand_acts;
\if :ERROR \echo PASS счёта нет: журнал действий не прочесть \else \echo FAIL счёт: журнал читается \endif
select * from public.stand_quota_ok('new');
\if :ERROR \echo PASS права: лимит снаружи не вызвать \else \echo FAIL права: stand_quota_ok открыт \endif
reset role;

-- ── продление: странник 2 встал в ту же вмятину ──
reset role;
update public.stands set expires_at = now() + interval '1 hour' where id = :d1;
set role authenticated;
select set_config('request.jwt.claim.sub', :'u2', false) \gset
\set ok false
select id = :d1 and expires_at > now() + interval '1 day' as ok from public.stand_leave('dent', 6005, 420) \gset
\if :ok \echo PASS продление: встал в чужую — та же вмятина, срок заново \else \echo FAIL продление \endif
\set ok false
select count(*) = 1 and min(x) = 6000 as ok from public.stands where kind = 'dent' \gset
\if :ok \echo PASS продление: второй не легло, место прежнее \else \echo FAIL продление: вторая вмятина или место сменено \endif
reset role;

-- ── клетка: три вмятины на отрезке ──
reset role;
insert into public.stands (kind, x, y, expires_at, author, last_by) values
  ('dent', 6420, 400, now() + interval '5 days', :'u4', :'u4'), ('dent', 6460, 450, now() + interval '5 days', :'u4', :'u4'),
  ('dent', 6500, 500, now() + interval '5 days', :'u4', :'u4');
set role authenticated;
select set_config('request.jwt.claim.sub', :'u3', false) \gset
\set ok false
select count(*) = 0 as ok from public.stand_leave('dent', 6560, 560) \gset
\if :ok \echo PASS клетка: четвёртая на отрезке не держится, без ошибки \else \echo FAIL клетка: четвёртая принята или ошибка \endif
reset role;
\set ok false
select count(*) = 3 as ok from public.stands where cx = 6560 / 320 and cy = 560 / 320 \gset
\if :ok \echo PASS клетка: на отрезке так и три \else \echo FAIL клетка: счёт \endif

-- ── цепочка ──
set role authenticated;
select set_config('request.jwt.claim.sub', :'u4', false) \gset
\set ok false
select count(*) = 1 as ok from public.stand_leave('chain', 7000, 4500 - 3300 - 952, '{0,9, 2,9, -2,9, 0,9, 1,9, -1,9}') \gset
\if :ok \echo PASS цепочка: оставлена \else \echo FAIL цепочка: не оставлена \endif
reset role;
update public.stand_acts set at = at - interval '2 minutes';
set role authenticated;
select set_config('request.jwt.claim.sub', :'u4', false) \gset
select * from public.stand_leave('dent', 7000, 4500 - 3300 - 952, '{0,9, 0,9, 0,9, 0,9}');
\if :ERROR \echo PASS форма: вмятина со следом — нет \else \echo FAIL форма: вмятина со следом \endif
reset role;

-- ── сутки: десять новых ──
reset role;
delete from public.stand_acts;
insert into public.stand_acts (actor, act, at) select :'u3', 'new', now() - interval '2 minutes' - g * interval '1 minute' from generate_series(1, 9) g;
set role authenticated;
select set_config('request.jwt.claim.sub', :'u3', false) \gset
\set ok false
select count(*) = 1 as ok from public.stand_leave('dent', 9000, 400) \gset
\if :ok \echo PASS лимит: десятая за сутки — принята \else \echo FAIL лимит: десятая не принята \endif
reset role;
update public.stand_acts set at = at - interval '2 minutes';
set role authenticated;
select set_config('request.jwt.claim.sub', :'u3', false) \gset
select * from public.stand_leave('dent', 9400, 400);
\if :ERROR \echo PASS лимит: одиннадцатая за сутки — нет \else \echo FAIL лимит: одиннадцатая принята \endif
reset role;

-- ── падение (по желанию): вдвое — только где стоял последним и только на этой стороне ──
reset role;
delete from public.stand_acts;
insert into public.stands (kind, x, y, expires_at, author, last_by, created_at) values
  ('dent', 9600, 10600, now() + interval '10 days', :'u3', :'u3', now() - interval '1 hour');   -- юг, свой
select id as dsouth from public.stands where y = 10600 \gset
select id as dnorth from public.stands where x = 9000 and y = 400 \gset
update public.stands set expires_at = now() + interval '10 days', created_at = now() - interval '1 hour' where id in (:dnorth, :d1);   -- свой на севере и чужой (u2 стоял последним) на севере
set role authenticated;
select set_config('request.jwt.claim.sub', :'u3', false) \gset
select public.stand_fall(6000, 4500 - 3300 - 1090);
reset role;
select (select expires_at between now() + interval '4.9 days' and now() + interval '5.1 days' from public.stands where id = :dnorth)
   and (select expires_at > now() + interval '9.9 days' from public.stands where id = :dsouth)
   and (select expires_at > now() + interval '9.9 days' from public.stands where id = :d1) as ok \gset
\if :ok \echo PASS падение: своё на этой стороне — вдвое; на другой и чужое — как было \else \echo FAIL падение \endif
-- продлил чужую (стал последним) и упал — чужая не убавилась: своей она не стала
set role authenticated;
select set_config('request.jwt.claim.sub', :'u2', false) \gset
select public.stand_fall(6000, 4500 - 3300 - 1090);
reset role;
\set ok false
select expires_at > now() + interval '9.9 days' as ok from public.stands where id = :d1 \gset
\if :ok \echo PASS падение: продлённая чужая (last_by — падавший) не убавилась \else \echo FAIL падение: стёр чужую, продлив её \endif
-- цепочка этого падения легла раньше, чем дошла убыль, — её не трогает
delete from public.stand_acts;
insert into public.stands (kind, x, y, path, expires_at, author, last_by) values
  ('chain', 8000, 4500 - 3300 - 952, '{0,9, 2,9, -2,9, 0,9}', now() + interval '2 days', :'u3', :'u3');
select id as cfresh from public.stands where x = 8000 and kind = 'chain' \gset
set role authenticated;
select set_config('request.jwt.claim.sub', :'u3', false) \gset
select public.stand_fall(6000, 4500 - 3300 - 1090);
reset role;
\set ok false
select expires_at > now() + interval '1.9 days' as ok from public.stands where id = :cfresh \gset
\if :ok \echo PASS падение: только что легшая цепочка — без убыли \else \echo FAIL падение: свежую цепочку убавило \endif

-- ── старость и анонимы ──
reset role;
update public.stands set expires_at = now() - interval '1 minute' where id = :dsouth;
set role anon;
select set_config('request.jwt.claim.sub', '', false) \gset
\set ok false
select count(*) = 0 as ok from public.stands where id = :dsouth \gset
\if :ok \echo PASS чтение: занесённую не видно \else \echo FAIL чтение: занесённая видна \endif
\set ok false
select count(*) > 0 as ok from (select id, kind, x, y, path, expires_at from public.stands) q \gset
\if :ok \echo PASS чтение: без входа видно вид, место, след, срок \else \echo FAIL чтение: anon не видит \endif
select public.stand_fall(6000, 100);
\if :ERROR \echo PASS права: без входа падение не считается \else \echo FAIL права: anon вызвал stand_fall \endif
reset role;
