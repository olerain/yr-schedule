# YOGI ROOM schedule: current state

Native editable Google Slides: https://docs.google.com/presentation/d/1MZ8o0L8c7hWJ_DtGJcHFUT7rfINa_A8sX4IOdW7FHNo/edit

Current version: compact, 2800x2700, without teacher names on either page. Turquoise branding #007F87, colored explanatory pills and three-column legend. Page 1 is the full week; page 2 contains large label samples. All existing user-edited descriptions were preserved exactly. The second page does not automatically synchronize the first.

Schedule data source: October tab only, https://docs.google.com/spreadsheets/d/1li0wzF_rvvS_k1iPb5-CKjI8h0kTr37v6EG_NxDUZ_k/edit#gid=857222307. 34 events. Wednesday Pilates is 19:30-20:30. Yoga nidra has a start time only.

Current verified previews: output/compact-teal-current/slide-1.png and slide-2.png. Native PDF: output/compact-teal-current/presentation.pdf. Readback and visual test report: .build/compact-teal-tests.json. Native issue checker: .build/compact-teal-issues.json (zero issues). Revision and script hash are recorded in the test report.

Reproduction script for this edit: .build/compact-teal-revert.py. It uses the bundled Python runtime and Pillow for label text measurement, and generates native Google Slides API requests. Dependencies are provided by the bundled Codex workspace runtime. This is a standalone design artifact, no deployed application or Railway service.

Product check: open page one on a phone, confirm the compact height and absence of teacher rows, inspect the edited descriptions. Text and colors remain editable in Google Slides. Export page one through File > Download > PNG.

## Хранение — 28.10.2026

Создан только локальный Git без remote. Готовые 7 PPTX и 2 PDF из output/ сохранены в Google Drive / AI PROJECTS / G-yogi-room-schedule. Локальные экземпляры сохранены. .build/ содержит исходные генераторы; их исполняемые исходники включены в Git, результаты сборки исключены. В этом этапе генераторы и экспорт расписания не запускались.
