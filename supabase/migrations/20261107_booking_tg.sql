-- 2026-11-07: запись через Telegram администратора студии (кнопка «Записаться» на живой странице)
alter table public.sched_settings add column if not exists booking_tg text not null default '';
do $$ begin
  alter table public.sched_settings add constraint sched_settings_booking_tg_chk check (booking_tg = '' or booking_tg ~ '^[A-Za-z0-9_]{5,32}$');
exception when duplicate_object then null; end $$;
update public.sched_settings set booking_tg = 'yogiroom_moskovskiy73' where studio = 'moskovsky';
