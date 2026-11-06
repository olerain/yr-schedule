# Расписание YOGI ROOM

Редактор недельного расписания студий и выгрузка картинки для мессенджеров.

## Где что лежит

- Код: Mac `~/Projects/yr-schedule` = GitHub `olerain/yr-schedule`.
- Документы и выгрузки: Google Drive `AI PROJECTS/G-yr-schedule` (там же `_КОНТЕКСТ`): https://drive.google.com/drive/folders/1oXSm3QrL3pXZ6c73aeJL7EMI9xO_4jkE
- Медиа (Яндекс `disk:/AI PROJECTS/Y-yr-schedule`): пока нет.
- `slides-codex/` — ранняя версия в Google Slides от Codex (15–28.10.2026), только генераторы; PPTX/PDF лежат в G-папке.

## Как устроено

- Сайт: https://olerain.github.io/yr-schedule/ (GitHub Pages, ветка `main`, корень).
- Данные: Supabase, проект `yogi-room-admin-bot`, таблицы `sched_settings`, `sched_dirs`, `sched_classes`, `sched_editors`.
- Студии — строки `sched_settings` (`studio` — ключ, `name` — название в переключателе, `sort` — порядок). Ссылка на конкретную студию: `?studio=optikov`.
- Читать может любой. Менять — только вошедший по ссылке из письма пользователь из `sched_editors`:
  - `studios = null` — админ: все студии и общие направления;
  - `studios = '{moskovsky}'` — только перечисленные студии. Проверку делает база (RLS, функции `sched_can_edit`, `sched_is_admin`).
- Добавить редактора студии: `insert into public.sched_editors (email, studios) values ('name@example.com', '{optikov}');`
- Два вида картинки, переключатель вверху: «Для клиентов» (бирюзовый список по дням, 1080 px, QR на приложение) — основной; «Сетка (внутренняя)» — сетка по времени, 1600 px. Выбор запоминается в браузере.
- QR строится из `sched_settings.app_url` (сейчас onelink.to — сам открывает App Store или Google Play), текст рядом — `app_text`. Оба поля в редакторе, вкладка «Шапка и подвал».
- `qrcode.js` — библиотека qrcode-generator 2.0.4 (MIT), лежит в репозитории, чтобы не зависеть от CDN.
- Ключ в `index.html` — публичный (publishable), секретов в репозитории нет.
