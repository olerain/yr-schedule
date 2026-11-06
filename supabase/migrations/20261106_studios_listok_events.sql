-- 2026-11-06: филиалы из Listok, импорт, отметки, преподаватели, мастер-классы, Telegram.

-- Настройки студии
alter table public.sched_settings
  add column if not exists listok_rooms int[] not null default '{}',
  add column if not exists show_teachers boolean not null default false,
  add column if not exists tg_chat text not null default '',
  add column if not exists tg_enabled boolean not null default false;

-- Занятия: преподаватель и отметка
alter table public.sched_classes
  add column if not exists teacher text not null default '',
  add column if not exists badge text not null default '';
do $$ begin
  alter table public.sched_classes add constraint sched_classes_badge_chk check (badge in ('', 'new', 'sub', 'cancel'));
exception when duplicate_object then null; end $$;

-- Мастер-классы и спецзанятия на конкретные даты
create table if not exists public.sched_events (
  id uuid primary key default gen_random_uuid(),
  studio text not null references public.sched_settings(studio) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time,
  title text not null,
  note text not null default '',
  teacher text not null default '',
  updated_at timestamptz not null default now()
);
create index if not exists sched_events_studio_date on public.sched_events (studio, date);
alter table public.sched_events enable row level security;
drop policy if exists sched_events_read on public.sched_events;
create policy sched_events_read on public.sched_events for select using (true);
drop policy if exists sched_events_write on public.sched_events;
create policy sched_events_write on public.sched_events for all to authenticated
  using ((select public.sched_can_edit(studio))) with check ((select public.sched_can_edit(studio)));
grant select on public.sched_events to anon, authenticated;
grant insert, update, delete on public.sched_events to authenticated;

-- Словарь: название из Listok → как писать на постере (общий на сеть, правит админ)
create table if not exists public.sched_listok_map (
  listok_name text primary key,           -- в нижнем регистре, пробелы схлопнуты
  name text not null,
  dir text not null references public.sched_dirs(key) on update cascade,
  tag text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.sched_listok_map enable row level security;
drop policy if exists sched_listok_map_read on public.sched_listok_map;
create policy sched_listok_map_read on public.sched_listok_map for select using (true);
drop policy if exists sched_listok_map_write on public.sched_listok_map;
create policy sched_listok_map_write on public.sched_listok_map for all to authenticated
  using ((select public.sched_is_admin())) with check ((select public.sched_is_admin()));
grant select on public.sched_listok_map to anon, authenticated;
grant insert, update, delete on public.sched_listok_map to authenticated;

-- Решения по Оптиков от 22.10 — в словарь, чтобы импорт их повторял
insert into public.sched_listok_map (listok_name, name, dir, tag) values
 ('аэройога + звукотерапия','Аэройога + звукотерапия','aero','гамак и звук'),
 ('йога | метод айенгара','Йога по методу Айенгара','yoga','практика с опорами'),
 ('йога айенгара','Йога по методу Айенгара','yoga','практика с опорами'),
 ('йога + дыхательная практика','Йога + дыхательная практика','yoga','асаны и дыхание'),
 ('йога с элементами йогатерапии','Йога с элементами йогатерапии','back','йогатерапия'),
 ('сила и гибкость','Сила и гибкость','fit','сила и растяжка'),
 ('расслабляющая йога с поющими чашами','Йога с поющими чашами','nidra','расслабление и звук'),
 ('йога в потоке','Йога в потоке','yoga','динамичная практика')
on conflict (listok_name) do nothing;

-- Привязка к залам Listok (проверено 06.11 по виджету: офис → зал)
update public.sched_settings set listok_rooms = '{12}' where studio = 'moskovsky';
update public.sched_settings set listok_rooms = '{1}'  where studio = 'optikov';

-- Остальные филиалы сети
insert into public.sched_settings (studio,name,sort,title,month,address,phone,footer,special_enabled,special_title,special_text,special_days,app_url,app_text,listok_rooms)
select v.studio, v.name, v.sort, s.title, s.month, v.address, v.phone, s.footer, false, s.special_title, s.special_text, '{}', s.app_url, s.app_text, v.rooms
from public.sched_settings s,
(values
 ('korablestroiteley','Кораблестроителей',3,'Кораблестроителей, 30','+7 (981) 953-96-52','{20}'::int[]),
 ('dybenko','Дыбенко',4,'Дыбенко, 8, корпус 3','+7 (921) 559-50-58','{24}'::int[]),
 ('kushelevskaya','Кушелевская',5,'Кушелевская дорога, 6, корпус 1','+7 (952) 288-63-01','{25}'::int[]),
 ('bogatyrsky','Богатырский',6,'Богатырский проспект, 64, корпус 1','+7 (950) 039-68-68','{26}'::int[]),
 ('kashtanovaya','Малая Каштановая',7,'Малая Каштановая аллея, 9, корпус 1','+7 (911) 797-02-27','{35}'::int[]),
 ('dunaysky','Дунайский',8,'Дунайский проспект, 7, корпус 7','+7 (999) 200-61-00','{36}'::int[]),
 ('kamenki','Набережная Каменки',9,'Набережная Каменки, 11, корпус 2','+7 (911) 157-43-17','{41}'::int[]),
 ('plesetskaya','Плесецкая',10,'Плесецкая, 4','+7 (995) 606-23-04','{46}'::int[]),
 ('kievskaya','Киевская',11,'Киевская, 5, корпус 6','+7 (993) 482-96-67','{49,50}'::int[]),
 ('murino','Мурино',12,'Мурино, Екатерининская, 10','+7 (995) 598-13-49','{54}'::int[]),
 ('zastavskaya','Заставская',13,'Заставская, 46, корпус 2','+7 (996) 753-89-12','{55}'::int[]),
 ('kolomyazhsky','Коломяжский',14,'Коломяжский проспект, 13, корпус 3','+7 (921) 913-07-41','{58}'::int[]),
 ('mirgorodskaya','Миргородская',15,'Миргородская, 20','+7 (921) 875-13-57','{60}'::int[]),
 ('pushkin','Пушкин',16,'Пушкин, Архитектора Данини, 5','','{62}'::int[])
) as v(studio,name,sort,address,phone,rooms)
where s.studio = 'moskovsky'
on conflict (studio) do nothing;
