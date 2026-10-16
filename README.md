# Расписание YOGI ROOM — Московский

Редактор недельного расписания студии и выгрузка картинки для мессенджеров.

- Сайт: https://olerain.github.io/yr-schedule/ (GitHub Pages, ветка `main`, корень).
- Данные: Supabase, проект `yogi-room-admin-bot`, таблицы `sched_settings`, `sched_dirs`, `sched_classes`, `sched_editors`.
- Читать может любой. Менять — только вошедший по ссылке из письма пользователь, чей email есть в `sched_editors`.
- Добавить редактора: `insert into public.sched_editors (email) values ('name@example.com');`
- Ключ в `index.html` — публичный (publishable), секретов в репозитории нет.
