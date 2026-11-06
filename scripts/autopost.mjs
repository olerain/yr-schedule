// Еженедельный автопостинг картинки расписания в Telegram.
// Запуск: GitHub Actions (.github/workflows/autopost.yml). Секрет TELEGRAM_BOT_TOKEN — в настройках репозитория.
// Берёт студии с включённым tg_enabled и непустым tg_chat, открывает редактор,
// жмёт «Скачать PNG» и отправляет файл в канал.
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";

const SUPABASE_URL = "https://hnmgnowascbkstlmhudz.supabase.co";
const KEY = "sb_publishable_tNfXIJlGC6NEoSfKS_sS0A_mTlywn_D"; // публичный ключ, только чтение
const SITE = process.env.SITE_URL || "https://olerain.github.io/yr-schedule/";
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ONLY = (process.env.ONLY_STUDIO || "").trim();
const DRY = process.env.DRY_RUN === "1";

if (!TOKEN && !DRY) { console.error("Нет секрета TELEGRAM_BOT_TOKEN"); process.exit(1); }

const res = await fetch(`${SUPABASE_URL}/rest/v1/sched_settings?select=studio,name,tg_chat,tg_enabled,month`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!res.ok) { console.error("Supabase", res.status, await res.text()); process.exit(1); }
let studios = await res.json();
// Пробный прогон по одной студии работает и без включённого автопостинга
if (DRY && ONLY) studios = studios.filter((s) => s.studio === ONLY);
else studios = studios.filter((s) => s.tg_enabled && s.tg_chat && s.tg_chat.trim() && (!ONLY || s.studio === ONLY));
console.log("Студий к отправке:", studios.map((s) => s.studio).join(", ") || "нет");

const browser = await chromium.launch();
let failed = 0;
for (const s of studios) {
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, acceptDownloads: true });
    await page.goto(`${SITE}?studio=${encodeURIComponent(s.studio)}&mode=list&fmt=post`, { waitUntil: "networkidle" });
    await page.waitForSelector(".poster .ld, .poster .lempty", { timeout: 30000 });
    await page.waitForFunction(() => !document.getElementById("dl").disabled);
    const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), page.click("#dl")]);
    await mkdir("/tmp/yr-autopost", { recursive: true });
    const file = `/tmp/yr-autopost/${s.studio}.png`;
    await dl.saveAs(file);
    await page.close();
    if (DRY) { console.log("DRY", s.studio, file); continue; }
    const live = `${SITE}live.html?studio=${encodeURIComponent(s.studio)}`;
    const fd = new FormData();
    fd.append("chat_id", s.tg_chat.trim());
    fd.append("caption", `Расписание YOGI ROOM · ${s.name || s.studio} на эту неделю\nАктуальное расписание всегда здесь: ${live}`);
    fd.append("photo", new Blob([await readFile(file)], { type: "image/png" }), `raspisanie-${s.studio}.png`);
    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, { method: "POST", body: fd });
    const j = await tg.json();
    if (!j.ok) throw new Error(`Telegram: ${j.description}`);
    console.log("Отправлено:", s.studio, "→", s.tg_chat);
  } catch (e) {
    failed++;
    console.error("Ошибка:", s.studio, String(e));
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
