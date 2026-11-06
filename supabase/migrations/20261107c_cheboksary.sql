-- 2026-11-07: Чебоксары, Приволжский бульвар 3 (yogiroom.ru/privolzhskiy). Своя CRM Listok: офис 0, залы 1 и 2.
alter table public.sched_settings drop constraint if exists sched_settings_listok_crm_chk;
alter table public.sched_settings add constraint sched_settings_listok_crm_chk check (listok_crm in ('spb','msk','vrn','chb'));

insert into public.sched_settings (studio,name,sort,city,listok_crm,listok_office,title,month,address,phone,footer,special_enabled,special_title,special_text,special_days,app_url,app_text,listok_rooms,booking_tg)
select 'chb-privolzhsky','Приволжский',301,'Чебоксары','chb',0,s.title,s.month,'Приволжский бульвар, 3','+7 (919) 676-39-14',s.footer,false,s.special_title,s.special_text,'{}',s.app_url,s.app_text,'{1,2}','yogiroom_privolzhskiy'
from public.sched_settings s where s.studio = 'moskovsky'
on conflict (studio) do nothing;
