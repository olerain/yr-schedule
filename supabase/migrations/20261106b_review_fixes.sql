-- 2026-11-06 (b): правки по ревью.

-- Мастер-классы: откуда пришли. Импорт заменяет только свои, ручные не трогает.
alter table public.sched_events add column if not exists source text not null default '';
update public.sched_events set source = 'listok' where source = '';   -- всё, что сейчас есть, пришло из Listok

-- Какая неделя лежит в расписании студии (понедельник). Живая страница подписывает даты по ней.
alter table public.sched_settings add column if not exists week_from date;

-- Ссылка на приложение — только http(s), чтобы в QR и кнопку нельзя было подложить javascript:
do $$ begin
  alter table public.sched_settings add constraint sched_settings_app_url_chk check (app_url = '' or app_url ~* '^https?://');
exception when duplicate_object then null; end $$;

-- Залы Listok и Telegram-канал меняет только админ (для запросов через API; SQL Editor не ограничен)
create or replace function public.sched_settings_guard()
returns trigger language plpgsql security invoker set search_path to ''
as $$
begin
  if (select auth.uid()) is not null and not public.sched_is_admin()
     and (new.listok_rooms is distinct from old.listok_rooms or new.tg_chat is distinct from old.tg_chat) then
    raise exception 'Залы Listok и Telegram-канал меняет только администратор';
  end if;
  return new;
end;
$$;
drop trigger if exists sched_settings_guard on public.sched_settings;
create trigger sched_settings_guard before update on public.sched_settings
  for each row execute function public.sched_settings_guard();

-- Импорт недели: помечает и заменяет только мастер-классы из Listok, запоминает неделю
create or replace function public.sched_replace_week(p_studio text, p_classes jsonb, p_events jsonb, p_from date, p_to date)
returns void language plpgsql security invoker set search_path to ''
as $$
begin
  if not public.sched_can_edit(p_studio) then raise exception 'no access to %', p_studio; end if;
  delete from public.sched_classes where studio = p_studio;
  insert into public.sched_classes (studio, day, start_time, end_time, name, dir, tag, teacher, badge, time_label)
  select p_studio, (c->>'day')::int, (c->>'start')::time, (c->>'end')::time, c->>'name', c->>'dir',
         coalesce(c->>'tag',''), coalesce(c->>'teacher',''), coalesce(c->>'badge',''), ''
  from jsonb_array_elements(coalesce(p_classes,'[]'::jsonb)) c;
  if p_from is not null and p_to is not null then
    delete from public.sched_events where studio = p_studio and source = 'listok' and date between p_from and p_to;
    insert into public.sched_events (studio, date, start_time, end_time, title, note, teacher, source)
    select p_studio, (e->>'date')::date, (e->>'start')::time, nullif(e->>'end','')::time, e->>'title',
           coalesce(e->>'note',''), coalesce(e->>'teacher',''), 'listok'
    from jsonb_array_elements(coalesce(p_events,'[]'::jsonb)) e;
    update public.sched_settings set week_from = p_from where studio = p_studio;
  end if;
end;
$$;
revoke execute on function public.sched_replace_week(text, jsonb, jsonb, date, date) from public, anon;
grant execute on function public.sched_replace_week(text, jsonb, jsonb, date, date) to authenticated;

update public.sched_settings set week_from = date '2026-11-02' where week_from is null and studio not in ('moskovsky','optikov');
