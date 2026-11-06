-- 2026-11-07: Москва и Воронеж. У каждого города своя CRM Listok (spb / msk / vrn).
-- Адреса и телефоны — со страницы yogiroom.ru/contacts, залы — по виджетам Listok (офис → зал), проверено 07.11.

alter table public.sched_settings
  add column if not exists city text not null default 'Санкт-Петербург',
  add column if not exists listok_crm text not null default 'spb',
  add column if not exists listok_office int not null default 0;   -- офис в CRM: в msk/vrn виджет отдаёт только его занятия
do $$ begin
  alter table public.sched_settings add constraint sched_settings_listok_crm_chk check (listok_crm in ('spb','msk','vrn'));
exception when duplicate_object then null; end $$;

update public.sched_settings set phone = '+7 (931) 278-44-04' where studio = 'pushkin' and phone = '';

insert into public.sched_settings (studio,name,sort,city,listok_crm,listok_office,title,month,address,phone,footer,special_enabled,special_title,special_text,special_days,app_url,app_text,listok_rooms)
select v.studio, v.name, v.sort, v.city, v.crm, v.office, s.title, s.month, v.address, v.phone, s.footer, false, s.special_title, s.special_text, '{}', s.app_url, s.app_text, v.rooms
from public.sched_settings s,
(values
 ('msk-stahanovskaya','Стахановская',101,'Москва','msk',1,'2-й Грайвороновский проезд, 44, корпус 1','+7 (903) 106-21-19','{1}'::int[]),
 ('msk-otradnoe','Отрадное',102,'Москва','msk',0,'Римского-Корсакова, 11, корпус 7','+7 (980) 446-08-81','{2}'::int[]),
 ('msk-skandinavsky','Скандинавский',103,'Москва','msk',2,'Скандинавский бульвар, 4, корпус 2','+7 (965) 280-08-88','{3}'::int[]),
 ('msk-varshavskaya','Варшавская',104,'Москва','msk',4,'1-й Котляковский переулок, 2А, корпус 3','+7 (926) 346-30-11','{5}'::int[]),
 ('msk-yahromskaya','Яхромская',105,'Москва','msk',5,'Дмитровское шоссе, 107А, корпус 2','+7 (977) 888-54-74','{6}'::int[]),
 ('msk-zilart','Зиларт',106,'Москва','msk',7,'Архитектора Щусева, 5, корпус 1','+7 (985) 503-11-22','{8,9}'::int[]),
 ('msk-savelovskaya','Савеловская',107,'Москва','msk',8,'Складочная, 1, строение 1','+7 (993) 280-01-72','{10}'::int[]),
 ('msk-kuprina','Куприна',108,'Москва','msk',9,'Проспект Куприна, 24, корпус 3','+7 (977) 596-71-82','{11,12}'::int[]),
 ('msk-solntsevo','Солнцево',109,'Москва','msk',11,'Юлиана Семёнова, 8, корпус 2, подъезд 5','+7 (903) 280-03-35','{14}'::int[]),
 ('msk-khovrino','Ховрино',110,'Москва','msk',12,'Дыбенко, 38, корпус 1','+7 (929) 522-29-99','{15}'::int[]),
 ('msk-levoberezhny','Левобережный',111,'Москва','msk',13,'Химки, Совхозная, 11','+7 (991) 291-43-90','{16,17}'::int[]),
 ('msk-zarechye','Заречье',112,'Москва','msk',14,'Заречье, Луговая, 3','+7 (916) 923-50-50','{18}'::int[]),
 ('vrn-olimpiyskiy','Олимпийский',201,'Воронеж','vrn',1,'Олимпийский бульвар, 12','+7 (903) 653-43-43','{1}'::int[]),
 ('vrn-bolshevikov','Большевиков',202,'Воронеж','vrn',0,'Старых Большевиков, 2','+7 (980) 240-18-88','{2}'::int[])
) as v(studio,name,sort,city,crm,office,address,phone,rooms)
where s.studio = 'moskovsky'
on conflict (studio) do nothing;
