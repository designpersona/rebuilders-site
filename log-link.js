/* 기록 링크 파서·검증: rebuilders://log?d=<base64url JSON> 또는 https://rebuilders.co.kr/log.html?d=...
 * JSON: { date?: 'YYYY-MM-DD', meal: 'breakfast'|'lunch'|'dinner'|'snack'(또는 아침/점심/저녁/간식),
 *         foods: [{ name, serving?, cal?, carbs?, protein?, fat?, 선택 영양소..., estimate?, sourceNote?, sourceUrl? }],
 *         source: 'openclaw' }
 * - 알 수 없는 필드는 무시, 길이·개수·숫자 범위를 넘는 값은 버리고 경고로 알려줍니다.
 * - 이 모듈은 파싱만 합니다. 저장은 앱에서 사용자가 '기록'을 눌렀을 때만 합니다.
 * DOM·저장소에 의존하지 않아 Node 테스트로 확인할 수 있어요. */
(function rebuildersLogLink(global) {
  'use strict';

  const MAX_PARAM = 8000;
  const MAX_FOODS = 20;
  const MEALS = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', snack: 'snack', '아침': 'breakfast', '점심': 'lunch', '저녁': 'dinner', '간식': 'snack', '야식': 'snack' };
  // [필드, 최대값]
  const NUMBER_FIELDS = [
    ['cal', 5000], ['carbs', 1000], ['protein', 1000], ['fat', 1000], ['sugar', 1000], ['fiber', 500],
    ['saturatedFat', 500], ['transFat', 100], ['cholesterol', 5000], ['sodium', 20000], ['potassium', 20000],
    ['calcium', 10000], ['iron', 1000], ['magnesium', 5000], ['vitaminD', 1000], ['vitaminC', 10000],
  ];
  const ALLOWED_HOSTS = ['rebuilders.co.kr', 'www.rebuilders.co.kr', 'designpersona.github.io'];

  function cleanText(value, max) {
    if (typeof value !== 'string') return '';
    // 제어문자 제거, 공백 정리
    return value.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  }

  function base64UrlDecode(text) {
    if (!/^[A-Za-z0-9_-]+={0,2}$/.test(text)) throw new Error('링크 데이터 형식이 올바르지 않아요.');
    let b64 = text.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = typeof global.atob === 'function' ? global.atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  function base64UrlEncode(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    const b64 = typeof global.btoa === 'function' ? global.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function localKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function validDate(value, now) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((date - today) / 86400000);
    if (diffDays > 1 || diffDays < -366) return null; // 내일까지, 1년 전까지만
    return value;
  }

  function validSourceUrl(value) {
    if (typeof value !== 'string' || value.length > 300) return undefined;
    try { const u = new URL(value); return u.protocol === 'https:' ? u.href : undefined; } catch { return undefined; }
  }

  /** 디코딩된 객체를 검증·정리. 반환: { ok, data?, errors[], warnings[] } */
  function validatePayload(raw, now = new Date()) {
    const errors = [];
    const warnings = [];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, errors: ['기록 데이터가 비어 있어요.'], warnings };
    const meal = MEALS[typeof raw.meal === 'string' ? raw.meal.trim().toLowerCase() : ''] || MEALS[typeof raw.meal === 'string' ? raw.meal.trim() : ''];
    if (!meal) errors.push('끼니(아침·점심·저녁·간식)를 알 수 없어요.');
    let date = localKey(new Date(now));
    if (raw.date !== undefined) {
      const checked = validDate(raw.date, now);
      if (checked) date = checked;
      else { warnings.push('날짜가 올바르지 않아 오늘로 기록해요.'); }
    }
    const list = Array.isArray(raw.foods) ? raw.foods : [];
    if (!list.length) errors.push('기록할 음식이 없어요.');
    if (list.length > MAX_FOODS) warnings.push(`음식은 한 번에 ${MAX_FOODS}개까지만 받아요.`);
    const foods = [];
    list.slice(0, MAX_FOODS).forEach((item, index) => {
      if (!item || typeof item !== 'object') { warnings.push(`${index + 1}번째 항목을 건너뛰었어요.`); return; }
      const name = cleanText(item.name, 80);
      if (!name) { warnings.push(`${index + 1}번째 음식 이름이 없어 건너뛰었어요.`); return; }
      const food = { name };
      const serving = cleanText(item.serving, 40);
      if (serving) food.serving = serving;
      NUMBER_FIELDS.forEach(([field, max]) => {
        if (item[field] === undefined || item[field] === null || item[field] === '') return;
        const value = typeof item[field] === 'number' ? item[field] : Number(item[field]);
        if (!Number.isFinite(value) || value < 0 || value > max) { warnings.push(`${name}의 ${field} 값이 범위를 벗어나 뺐어요.`); return; }
        food[field] = Math.round(value * 10) / 10;
      });
      if (item.estimate === true) food.estimate = true;
      const note = cleanText(item.sourceNote, 200);
      if (note) food.sourceNote = note;
      const url = validSourceUrl(item.sourceUrl);
      if (url) food.sourceUrl = url;
      foods.push(food);
    });
    if (list.length && !foods.length) errors.push('기록할 수 있는 음식이 없어요.');
    const source = raw.source === 'openclaw' ? 'openclaw' : 'link';
    if (errors.length) return { ok: false, errors, warnings };
    return { ok: true, data: { date, meal, foods, source }, errors, warnings };
  }

  /** URL 문자열 → 검증 결과. 지원: rebuilders://log?d=..., https://(허용 도메인)/log.html?d=... */
  function parseLogUrl(url, now = new Date()) {
    let parsed;
    try { parsed = new URL(String(url || '')); } catch { return { ok: false, errors: ['링크를 읽을 수 없어요.'], warnings: [] }; }
    const isScheme = parsed.protocol === 'rebuilders:' && (parsed.hostname === 'log' || parsed.pathname.replace(/^\/+/, '') === 'log');
    const isWeb = parsed.protocol === 'https:' && ALLOWED_HOSTS.includes(parsed.hostname) && /\/log(\.html)?$/.test(parsed.pathname);
    if (!isScheme && !isWeb) return { ok: false, errors: ['리빌더스 기록 링크가 아니에요.'], warnings: [] };
    const d = parsed.searchParams.get('d') || '';
    if (!d) return { ok: false, errors: ['링크에 기록 데이터가 없어요.'], warnings: [] };
    if (d.length > MAX_PARAM) return { ok: false, errors: ['링크가 너무 길어요.'], warnings: [] };
    let raw;
    try { raw = JSON.parse(base64UrlDecode(d)); } catch { return { ok: false, errors: ['링크 데이터를 해석할 수 없어요.'], warnings: [] }; }
    return validatePayload(raw, now);
  }

  function buildLogUrl(payload, { web = false } = {}) {
    const d = base64UrlEncode(JSON.stringify(payload));
    return web ? `https://rebuilders.co.kr/log.html?d=${d}` : `rebuilders://log?d=${d}`;
  }

  const api = { parseLogUrl, validatePayload, buildLogUrl, base64UrlEncode, base64UrlDecode, MAX_FOODS, MAX_PARAM };
  global.RebuildersLogLink = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
