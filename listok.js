/* Нормализация занятий из CRM Listok в формат постера.
   Работает в браузере (window.YRListok) и в Node (module.exports). */
(function (root) {
  "use strict";

  // Типы групп Listok
  var T_MASTER = { "16": 1, "29": 1 };          // мастер-класс, открытый урок
  var T_SKIP = { "24": 1, "25": 1, "26": 1, "46": 1, "69": 1, "74": 1 }; // массаж, индивидуальные
  var T_DIR = { "1": "yoga", "2": "aero", "3": "str", "4": "aero", "5": "fit", "7": "pil", "71": "aero" };

  var RULES = [
    ["nidra", /нидра|йогическ[а-яё]* сон|йога сна|для (комфортного )?сна/],
    ["aero", /аэро|гамак/],
    ["pil", /пилатес/],
    ["back", /спин|позвоночн|йогатерап|йога-терап/],
    ["str", /растяжк|шпагат|гибк|мфр|мобильн|сустав/],
    ["fit", /фитнес|тренировк|ягодиц|пресс|подкачк|табата|зумба|танец|балет|стройное|стойки|координац|лимфодренаж|сила и/]
  ];

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  function isMaster(ev) {
    var n = norm(ev.name).toLowerCase();
    return !!T_MASTER[String(ev.type)] || /мастер[- ]класс|специальное занятие|спец\. ?урок|открытый урок/.test(n);
  }

  function guessDir(lower, type) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i][1].test(lower)) return RULES[i][0];
    return T_DIR[String(type)] || "yoga";
  }

  function cleanName(raw) {
    var s = norm(raw)
      .replace(/\((бесплатно[^)]*|в кроссовках|занятие в гамаках|йога в гамаках)\)/gi, "")
      .replace(/\(\s*2 занятия[^)]*\)/gi, "")
      .replace(/[|.]?\s*(для )?все[хм]? уровн[а-яё]*( подготовки)?/gi, "")
      .replace(/\(?\s*\d{2,3}\s*мин(ут[аы]?)?\s*\)?/gi, "")
      .replace(/\(\s*\)/g, "")
      .replace(/\s+[iI]\s+/g, " | ")
      .replace(/\s*[–—]\s*/g, "-")
      .replace(/хатха\s*-?\s*йога/gi, "хатха-йога")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/\s*\|\s*/g, " | ");
    var parts = s.split(" | ").map(norm).filter(Boolean);
    s = parts[0] || "";
    var rest = parts.slice(1).join(", ");
    if (/^(для )?начинающ/i.test(rest)) { s += " для начинающих"; rest = ""; }
    else if (/^(для )?продолжающ/i.test(rest)) { s += " для продолжающих"; rest = ""; }
    else if (rest && rest.length <= 28 && !/лет/.test(rest)) { s += " · " + rest; rest = ""; }
    s = norm(s.replace(/\s+[iI]$/, "").replace(/[|,.\s]+$/, "")).replace(/^аэро(\s+(для\s+)?дет)/i, "аэройога$1");
    // Аббревиатуры из исходника (TRX, ЛФК, МФР) — сохранить заглавными
    var abbr = norm(raw) === norm(raw).toUpperCase() ? [] : (norm(raw).match(/(^|[^A-Za-zА-Яа-яЁё])([A-ZА-ЯЁ]{2,5})(?=$|[^A-Za-zА-Яа-яЁё])/g) || []).map(function (w) { return w.replace(/^[^A-Za-zА-Яа-яЁё]/, ""); });
    var out = cap(s.toLowerCase().replace(/мфр/g, "МФР").replace(/айенгар/g, "Айенгар"));
    abbr.forEach(function (w) { out = out.replace(new RegExp("(^|[^A-Za-zА-Яа-яЁё])" + w.toLowerCase() + "(?=$|[^A-Za-zА-Яа-яЁё])", "i"), function (m, p) { return p + w; }); });
    return out;
  }

  function kidsTag(lower) {
    var m = lower.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*лет/);
    return m ? "дети " + m[1] + "–" + m[2] + " лет" : (/дет/.test(lower) ? "-" : "");
  }

  /* ev: {date, day, start, end, name, teacher, type}; map: {lowerName: {name, dir, tag}} */
  function convert(ev, map) {
    var raw = norm(ev.name), lower = raw.toLowerCase();
    if (T_SKIP[String(ev.type)]) return { skip: true };
    if (isMaster(ev)) {
      var title = raw.replace(/^(мастер[- ]класс|специальное занятие|спец\. ?урок|открытый урок)\s*[:|]?\s*/i, "")
        .replace(/\s*\|\s*(специальное занятие|мастер[- ]класс)\s*$/i, "")
        .replace(/[«»"]/g, "").replace(/\((бесплатно[^)]*|2 занятия[^)]*)\)/gi, "")
        .replace(/\s*\|\s*/g, ": ");
      title = norm(title);
      if (title === title.toUpperCase()) title = title.toLowerCase();
      return { master: true, date: ev.date, start: ev.start, end: ev.end, title: cap(title),
        note: /открытый урок/i.test(raw) ? "открытый урок" : "", teacher: norm(ev.teacher) };
    }
    var hit = map && map[lower];
    var dir = (hit && hit.dir) || guessDir(lower, ev.type);
    var name = (hit && hit.name) || cleanName(raw);
    var tag = hit ? (hit.tag || "") : "";
    if (!hit) {
      var kt = kidsTag(lower);
      if (kt) { tag = kt === "-" ? "" : kt; name = cleanName(raw.replace(/\d{1,2}\s*-\s*\d{1,2}\s*лет/, "").replace(/(^|\s)дети(\s|$)/i, " ")); if (!/дет/i.test(name)) name += " для детей"; name = name.replace(/^Аэро для/, "Аэройога для"); }
      else if (/беременн/.test(lower)) tag = "для беременных";
    }
    return { day: ev.day, start: ev.start, end: ev.end, name: norm(name), dir: dir, tag: tag, teacher: norm(ev.teacher), source: raw };
  }

  var api = { convert: convert, cleanName: cleanName, guessDir: guessDir };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.YRListok = api;
})(typeof window !== "undefined" ? window : this);
