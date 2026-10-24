-- ═══════════════════════════════════════════════════════════════════
-- СЕТЬ СТРАННИКОВ ARDET — схема для Supabase (weave/NET.md).
-- Выполнить один раз: Supabase → SQL Editor → вставить файл целиком → Run.
-- Записки лежат 30 дней; три жалобы от разных странников — записка скрыта;
-- не больше 10 записок в сутки и одной в минуту от одного странника; брань и
-- ссылки база не принимает (клиент вымарывает их и сам, src/net/filter.js).
-- Шаги и речь идут через Realtime (broadcast + presence) и не хранятся нигде.
-- ═══════════════════════════════════════════════════════════════════

-- что можно написать: длина 1..140, без ссылок и брани (корни — с начала слова,
-- с приставками; «корабля» и «рубля» проходят). Строчные буквы и «буква ли» —
-- явным списком: от локали базы (C, en_US) проверка не зависит
create or replace function public.note_text_ok(t text) returns boolean
language sql immutable as $$
  select char_length(btrim(t)) between 1 and 140
     and s !~ '(https?://|www\.|@[a-z0-9_]{3,})'
     and s !~ '[а-яёіa-z0-9-]\.(com|ru|net|org|io|me|gg|xyz|su|рф)([^а-яёіa-z0-9]|$)'
     and s !~ '(^|[^а-яёіa-z0-9])(за|вы|на|до|от|у|по|при|раз|рас|съ|объ|отъ|подъ|разъ|изъ|въ|об|пере|под|недо|ни)?(ху[йеёяи]|п[иі]зд|[её]б[аеуиоы]|бля|мудак|мудил|пид[оа]р|шлюх|гандон|залуп|сучар)'
     and s !~ '(^|[^a-z])(fuck|cunt|nigg|fagg?ot)'
  from (select lower(translate(t, 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯІ', 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяі')) as s) q
$$;

create table if not exists public.notes (
  id          bigint generated always as identity primary key,
  author      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  layer       text not null default 'surface' check (layer in ('surface', 'under')),
  x           integer not null,
  y           integer not null,
  text        text not null check (public.note_text_ok(text)),
  created_at  timestamptz not null default now(),
  certs       integer not null default 0,
  reports     integer not null default 0,
  hidden      boolean not null default false
);
create index if not exists notes_area on public.notes (layer, x, y);
create index if not exists notes_author_time on public.notes (author, created_at);

create table if not exists public.note_votes (
  note_id     bigint not null references public.notes(id) on delete cascade,
  voter       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('cert', 'report')),
  created_at  timestamptz not null default now(),
  primary key (note_id, voter, kind)
);

-- лимит записок: 10 в сутки, одна в минуту (считает база, а не клиент)
create or replace function public.note_quota_ok() returns boolean
language sql stable security definer set search_path = public as $$
  select (select count(*) from public.notes where author = auth.uid() and created_at > now() - interval '1 day') < 10
     and not exists (select 1 from public.notes where author = auth.uid() and created_at > now() - interval '1 minute')
$$;
-- голос — не за свою записку
create or replace function public.note_not_mine(n bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.notes where id = n and author <> auth.uid() and not hidden)
$$;

-- отметка пересчитывает записку; три жалобы — скрыта
create or replace function public.note_vote_apply() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'cert' then
    update public.notes set certs = certs + 1 where id = new.note_id;
  else
    update public.notes set reports = reports + 1, hidden = hidden or reports + 1 >= 3 where id = new.note_id;
  end if;
  return new;
end $$;
drop trigger if exists note_vote_apply on public.note_votes;
create trigger note_vote_apply after insert on public.note_votes for each row execute function public.note_vote_apply();

alter table public.notes enable row level security;
alter table public.note_votes enable row level security;

drop policy if exists notes_read on public.notes;
create policy notes_read on public.notes for select to anon, authenticated
  using (not hidden and created_at > now() - interval '30 days');
drop policy if exists notes_write on public.notes;
create policy notes_write on public.notes for insert to authenticated
  with check (author = auth.uid() and hidden = false and certs = 0 and reports = 0 and public.note_quota_ok());
drop policy if exists votes_write on public.note_votes;
create policy votes_write on public.note_votes for insert to authenticated
  with check (voter = auth.uid() and public.note_not_mine(note_id));

-- право на таблицы: читать записки — всем; писать — вошедшим (анонимно тоже: это authenticated).
-- Supabase по умолчанию даёт обеим ролям всё — сначала забрать: тогда автор, время,
-- печати и жалобы клиенту не подвластны, ставит их база
revoke all on public.notes, public.note_votes from anon, authenticated;
grant select on public.notes to anon, authenticated;
grant insert (layer, x, y, text) on public.notes to authenticated;
grant insert (note_id, kind) on public.note_votes to authenticated;

-- уборка (по желанию, раз в сутки — pg_cron или вручную):
-- delete from public.notes where created_at < now() - interval '30 days' or hidden;
