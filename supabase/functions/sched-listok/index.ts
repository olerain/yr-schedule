// Edge-функция: неделя расписания из виджета CRM Listok для залов студии.
// GET ?rooms=12,50[&week=<значение next из прошлого ответа>]  →  { week, next, prev, dates, events: [{date, day, start, end, name, teacher, room, type}] }
// Данные публичные (тот же виджет, что на yogiroom.ru), секретов не нужно.

const BASE = "https://intgrfb3ee46e39c5fe9250f27d33fccdce57.listokcrm.ru";
// Не занятия: массаж и индивидуальные.
const SKIP_TYPES = new Set(["24", "25", "26", "46", "69"]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
}

function cookiesFrom(res: Response): string {
  const raw: string[] = [];
  // deno: getSetCookie() отдаёт все Set-Cookie
  // deno-lint-ignore no-explicit-any
  const h: any = res.headers;
  if (typeof h.getSetCookie === "function") raw.push(...h.getSetCookie());
  else { const one = res.headers.get("set-cookie"); if (one) raw.push(one); }
  return raw.map((c) => c.split(";")[0]).join("; ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  const rooms = (url.searchParams.get("rooms") || "").split(",").map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
  const weekRaw = (url.searchParams.get("week") || "").trim();
  const week = /^[0-9A-Za-z_.-]{1,20}$/.test(weekRaw) ? weekRaw : "";
  if (!rooms.length) return json({ error: "rooms required" }, 400);

  try {
    const page = await fetch(`${BASE}/wapi?onlyOffice=1&officeId=0&iframe=true`, { redirect: "follow" });
    const html = await page.text();
    const cookie = cookiesFrom(page);
    const token = (html.match(/name="csrf-token"\s+content="([^"]+)"/) || html.match(/token['"]?\s*[:=]\s*['"]([A-Za-z0-9]{20,})['"]/) || [])[1] || "";

    // Виджет шлёт JSON (axios); неделю Listok понимает только так. week — значение next/prev, например "09-11-2026"
    const body = JSON.stringify({ _token: token, roomId: 0, week, officeId: 0 });
    const r = await fetch(`${BASE}/wapi/getScheduleData?os=1&draw=1&start=0&length=5`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        ...(cookie ? { Cookie: cookie } : {}),
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
      },
      body,
    });
    if (!r.ok) return json({ error: `listok ${r.status}` }, 502);
    const data = await r.json();
    const ev = data?.week?.events || {};
    const want = new Set(rooms);
    const out: Record<string, unknown>[] = [];
    const dates = new Set<string>();
    for (const t in ev) for (const d in ev[t]) for (const e of ev[t][d]) {
      dates.add(d);
      if (!want.has(String(e.roomId))) continue;
      const type = String(e.groupTypeId ?? e.grouptypeId ?? e.grouptype ?? "");
      if (SKIP_TYPES.has(type)) continue;
      const day = (new Date(d + "T12:00:00Z").getUTCDay() + 6) % 7; // пн = 0
      out.push({
        date: d, day,
        start: String(e.startTime || "").slice(0, 5),
        end: String(e.endTime || "").slice(0, 5),
        name: String(e.groupName || "").replace(/\s+/g, " ").trim(),
        teacher: String(e.teacherName || "").replace(/\s+/g, " ").trim(),
        room: String(e.roomId), type,
      });
    }
    out.sort((a, b) => String(a.date + a.start).localeCompare(String(b.date + b.start)));
    return json({ week, next: data?.week?.nextWeek ?? null, prev: data?.week?.prevWeek ?? null, dates: [...dates].sort(), events: out });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
