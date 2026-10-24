-- ═══════════════════════════════════════════════════════════════════
-- ПРОВЕРКА СХЕМЫ БЕЗ SUPABASE (weave/NET.md) — на любом PostgreSQL 15+:
--   createdb ardet_check && psql -X -v ON_ERROR_STOP=0 ardet_check -f server/check.sql 2>&1 | grep -E "PASS|FAIL"
--   dropdb ardet_check
-- Заглушка того, что Supabase даёт сам (роли anon / authenticated, схема auth,
-- auth.uid() из JWT, щедрые права по умолчанию), затем server/supabase.sql как
-- есть, затем записки и отметки от имени четырёх странников. Сеть (вход, Realtime,
-- PostgREST) так не проверить — только правила базы.
-- ═══════════════════════════════════════════════════════════════════
\set QUIET on
\pset tuples_only on
set client_min_messages = warning;

-- ── то, что у Supabase уже есть ──
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
-- Supabase по умолчанию даёт обеим ролям всё на новые таблицы: схема обязана это урезать сама
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

\ir supabase.sql

insert into auth.users values
  ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333'), ('44444444-4444-4444-4444-444444444444');
\set u1 '11111111-1111-1111-1111-111111111111'
\set u2 '22222222-2222-2222-2222-222222222222'
\set u3 '33333333-3333-3333-3333-333333333333'
\set u4 '44444444-4444-4444-4444-444444444444'

-- ── текст ──
select public.note_text_ok('Здесь было тепло. Корабля не видно, рубля не жалко') as ok \gset
\if :ok \echo PASS текст: обычные слова проходят (корабля, рубля) \else \echo FAIL текст: обычные слова отвергнуты \endif
select not public.note_text_ok('ну ты и ХУЙло') as ok \gset
\if :ok \echo PASS текст: брань заглавными — не принята \else \echo FAIL текст: брань заглавными принята \endif
select not public.note_text_ok('Заебало всё') as ok \gset
\if :ok \echo PASS текст: брань с приставкой — не принята \else \echo FAIL текст: брань с приставкой принята \endif
select not public.note_text_ok('отъебись') and not public.note_text_ok('FUCK this') as ok \gset
\if :ok \echo PASS текст: «отъ-» и английская брань — не приняты \else \echo FAIL текст: «отъ-» или английская брань приняты \endif
select public.note_text_ok('употреблять, оскорблять, небо, хлеб, худой, хутор') as ok \gset
\if :ok \echo PASS текст: похожие слова проходят \else \echo FAIL текст: похожие слова отвергнуты \endif
select not public.note_text_ok('заходи на сайт.рф, там всё') and not public.note_text_ok('t.me/ardet') and not public.note_text_ok('https://x.y') as ok \gset
\if :ok \echo PASS текст: ссылки не приняты \else \echo FAIL текст: ссылка принята \endif
select public.note_text_ok('цена 3.50 руб') and public.note_text_ok('конец. ru') as ok \gset
\if :ok \echo PASS текст: точка в числе и в конце фразы — не ссылка \else \echo FAIL текст: точка принята за ссылку \endif
select not public.note_text_ok('   ') and not public.note_text_ok(repeat('я', 141)) and public.note_text_ok(repeat('я', 140)) as ok \gset
\if :ok \echo PASS текст: пусто и длиннее 140 — нет, 140 — да \else \echo FAIL текст: длина \endif

-- ── записки от имени странника 1 ──
set role authenticated;
select set_config('request.jwt.claim.sub', :'u1', false) \gset
insert into public.notes (layer, x, y, text) values ('surface', 100, 200, 'Здесь было тепло') returning id as n1 \gset
\if :ERROR \echo FAIL запись: вошедший не смог оставить записку :LAST_ERROR_MESSAGE \else \echo PASS запись: вошедший оставил записку \endif
select author = auth.uid() and certs = 0 and not hidden as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS запись: автор — он сам, печатей нет \else \echo FAIL запись: автор или поля \endif
insert into public.notes (layer, x, y, text) values ('surface', 101, 201, 'вторая подряд');
\if :ERROR \echo PASS лимит: вторая записка в ту же минуту — не принята \else \echo FAIL лимит: вторая в минуту принята \endif
insert into public.notes (layer, x, y, text, certs) values ('surface', 1, 1, 'с печатью', 99);
\if :ERROR \echo PASS права: печати себе не поставить \else \echo FAIL права: certs задан клиентом \endif
insert into public.notes (layer, x, y, text, created_at) values ('surface', 1, 1, 'из будущего', now() + interval '1 year');
\if :ERROR \echo PASS права: время записки — не клиента \else \echo FAIL права: created_at задан клиентом \endif
insert into public.notes (layer, x, y, text, author) values ('surface', 1, 1, 'за другого', :'u2');
\if :ERROR \echo PASS права: за другого не написать \else \echo FAIL права: author подменён \endif
update public.notes set text = 'правка' where id = :n1;
select text = 'Здесь было тепло' as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS права: записку не переписать \else \echo FAIL права: записка переписана \endif
delete from public.notes where id = :n1;
select count(*) = 1 as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS права: записку не стереть \else \echo FAIL права: записка стёрта \endif
insert into public.note_votes (note_id, kind) values (:n1, 'cert');
\if :ERROR \echo PASS отметки: своё не заверить \else \echo FAIL отметки: своё заверено \endif
insert into public.notes (layer, x, y, text) values ('surface', 1, 1, 'ну и хуйня');
\if :ERROR \echo PASS текст: брань база не приняла и от вошедшего \else \echo FAIL текст: брань записана \endif
reset role;

-- ── чужие отметки ──
set role authenticated;
select set_config('request.jwt.claim.sub', :'u2', false) \gset
insert into public.note_votes (note_id, kind) values (:n1, 'cert');
\if :ERROR \echo FAIL отметки: чужую не заверить :LAST_ERROR_MESSAGE \else \echo PASS отметки: чужую заверил \endif
insert into public.note_votes (note_id, kind) values (:n1, 'cert');
\if :ERROR \echo PASS отметки: второй раз — нет (:SQLSTATE) \else \echo FAIL отметки: заверил дважды \endif
select certs = 1 as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS отметки: печать на записке — одна \else \echo FAIL отметки: счёт печатей \endif
insert into public.note_votes (note_id, kind, voter) values (:n1, 'report', :'u3');
\if :ERROR \echo PASS права: за другого не пожаловаться \else \echo FAIL права: жалоба за другого \endif
insert into public.note_votes (note_id, kind) values (:n1, 'report');
select set_config('request.jwt.claim.sub', :'u3', false) \gset
insert into public.note_votes (note_id, kind) values (:n1, 'report');
select count(*) = 1 as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS жалобы: после двух записка ещё видна \else \echo FAIL жалобы: скрыта раньше трёх \endif
select set_config('request.jwt.claim.sub', :'u4', false) \gset
insert into public.note_votes (note_id, kind) values (:n1, 'report');
select count(*) = 0 as ok from public.notes where id = :n1 \gset
\if :ok \echo PASS жалобы: после третьей записку не видит никто \else \echo FAIL жалобы: три жалобы — записка видна \endif
select count(*) = 0 as ok from public.note_votes \gset
\if :ok \echo PASS права: чужие отметки не прочесть \else \echo FAIL права: отметки читаются \endif
reset role;

-- ── сутки: 10 записок ──
reset role;
insert into public.notes (author, layer, x, y, text, created_at)
  select :'u2', 'surface', 5 * g, 5, 'старая ' || g, now() - interval '2 minutes' - g * interval '1 minute' from generate_series(1, 9) g;
set role authenticated;
select set_config('request.jwt.claim.sub', :'u2', false) \gset
insert into public.notes (layer, x, y, text) values ('surface', 60, 5, 'десятая');
\if :ERROR \echo FAIL лимит: десятая за сутки не принята :LAST_ERROR_MESSAGE \else \echo PASS лимит: десятая за сутки — принята \endif
reset role;
update public.notes set created_at = now() - interval '5 minutes' where text = 'десятая';
set role authenticated;
select set_config('request.jwt.claim.sub', :'u2', false) \gset
insert into public.notes (layer, x, y, text) values ('surface', 65, 5, 'одиннадцатая');
\if :ERROR \echo PASS лимит: одиннадцатая за сутки — нет \else \echo FAIL лимит: одиннадцатая принята \endif
reset role;

-- ── старость и анонимы ──
update public.notes set created_at = now() - interval '31 days' where text = 'старая 9';
set role anon;
select set_config('request.jwt.claim.sub', '', false) \gset
select count(*) = 9 as ok from public.notes where author = :'u2' \gset
\if :ok \echo PASS чтение: без входа видно, старше 30 дней — нет \else \echo FAIL чтение: счёт для anon \endif
insert into public.notes (layer, x, y, text) values ('surface', 1, 1, 'без входа');
\if :ERROR \echo PASS права: без входа не писать \else \echo FAIL права: anon записал \endif
reset role;
