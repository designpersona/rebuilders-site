/* 저장값 점검(한 번만 도는 데이터 정리 + 다시 볼 수 있는 점검 화면)
 * - 앱 업데이트 뒤 처음 열 때 한 번: 내 음식(customFoods)과 날짜별 기록을 훑어 이상한 값을 찾는다.
 * - 바꾸기 전에 전체 내 음식 + 문제 있는 날짜의 기록 전체를 IndexedDB 보조 레코드(meta:datafix-v1-backup)에 백업.
 * - 자동으로 고치는 건 '깨진 숫자'(NaN·음수·글자)뿐: 같은 이름의 멀쩡한 값이 있으면 그걸로, 없으면 비움(확인 필요).
 * - 나머지(0kcal·탄단지와 칼로리 불일치·100g당 900kcal 초과·이름 이상·중복·빈 값)는 고치지 않고 '확인할 항목'으로 보여 준다.
 * - 확인 안 한 항목은 그록(/daylog)에 참고값으로 보내지 않는다(잘못된 값이 퍼지지 않게).
 * - 모든 변경은 전/후를 기록해 '수정 전으로 되돌리기'로 항목 단위 복원(그 뒤에 새로 넣은 기록은 그대로).
 * 외부로 보내는 것은 없음(그록 값으로 고치기를 누를 때만 그 음식 이름·양을 맥 미니로 보냄 — bridge.js). */
(function rebuildersDataFix(global) {
  'use strict';

  const VERSION = 1;
  const META_KEY = 'datafix-v1';
  const BACKUP_KEY = 'datafix-v1-backup';
  const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
  const NUM_FIELDS = ['cal', 'carbs', 'protein', 'fat'];
  const EXTRA_FIELDS = ['sugar', 'fiber', 'sodium', 'servingGrams', 'servingMl', 'packageGrams', 'servingAmount'];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const fold = s => String(s || '').toLowerCase().normalize('NFC').replace(/[\s·.,()[\]{}\-_/~!?'"+*:;]+/g, '');
  const isNumStr = v => typeof v === 'string' && /^\s*\d+(?:\.\d+)?\s*$/.test(v);
  const isCorrupt = v => v !== undefined && v !== null && v !== '' && !isNumStr(v)
    && !(typeof v === 'number' && Number.isFinite(v) && v >= 0);
  const val = v => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : (isNumStr(v) ? Number(v) : null));
  const r1 = n => Math.round(n * 10) / 10;

  function gramsOf(food) {
    const g = val(food?.servingMl) || val(food?.servingGrams) || val(food?.packageGrams);
    if (g) return g;
    const m = String(food?.serving || '').match(/(\d+(?:\.\d+)?)\s*(g|ml)\b/i);
    return m ? Number(m[1]) : null;
  }

  // 0kcal이어도 이상하지 않은 것(물·블랙커피·차·제로 음료). 우유·시럽·떡 등이 붙으면 아님
  const ZERO_WORDS = ['생수', '탄산수', '아메리카노', '블랙커피', '에스프레소', '네스프레소', '캡슐커피', '커피캡슐', '콜드브루', '드립커피',
    '녹차', '홍차', '보리차', '옥수수차', '우롱차', '우롱티', '허브티', '루이보스', '페퍼민트', '캐모마일', '얼그레이', '보이차', '헛개차',
    '제로', 'zero', '다이어트콜라', '다이어트펩시'];
  const ZERO_EXACT = ['물', '커피', '차', '얼음물', '따뜻한물', '찬물', '캡슐', '티'];
  const CALORIC_WORDS = ['라떼', '우유', '밀크', '모찌', '떡', '크림', '시럽', '케이크', '쿠키', '빵', '초코', '쉐이크', '스무디', '프라푸치노',
    '바닐라', '카라멜', '설탕', '꿀', '과자', '아이스크림', '휘핑', '모카', '마끼아또', '연유', '버블', '펄', '샌드', '도넛', '와플', '아이스티'];
  function zeroPlausible(name) {
    const f = fold(name);
    if (!f) return false;
    if (CALORIC_WORDS.some(w => f.includes(w))) return false;
    return ZERO_EXACT.includes(f) || ZERO_WORDS.some(w => f.includes(w));
  }
  const isAlcohol = name => /소주|맥주|와인|막걸리|하이볼|위스키|사케|칵테일|보드카|진토닉|럼|청주|약주|beer|wine/i.test(String(name || ''));
  // 11/13 무렵 버그 자국: '오늘거 아침'처럼 날짜·끼니 말이 이름이 됨, 지시문, 이름에 양이 들어감
  const FILLER_TOKENS = new Set(['오늘', '어제', '그저께', '오늘거', '어제거', '오늘꺼', '어제꺼', '아침', '점심', '저녁', '간식', '야식',
    '그리고', '먹었어', '먹음', '먹었다', '먹었음', '이거', '저거']);
  const INSTRUCTION_RE = /기록해|계산해|해줘|알려줘|정리해|넣어줘|추가해|칼로리\s*(?:좀|알려|계산)|몇\s*칼로리/;
  const AMOUNT_TOKEN_RE = /^(?:\d+(?:\.\d+)?(?:g|ml|kg|개|알|잔|컵|봉|그릇|인분|조각|장|캔|병)?|(?:한|두|세|네|반)(?:그릇|개|알|잔|컵|봉|인분|조각|장|캔|병))$/i;
  function nameIssue(name) {
    const text = String(name || '').trim();
    if (!text) return '이름이 비어 있어요';
    if (INSTRUCTION_RE.test(text)) return '음식 이름이 아니라 말(지시문)이 저장된 것 같아요';
    const tokens = text.split(/\s+/);
    if (tokens.some(t => FILLER_TOKENS.has(t))) return `‘${tokens.find(t => FILLER_TOKENS.has(t))}’ 같은 말이 이름에 들어갔어요`;
    const amounts = tokens.filter(t => AMOUNT_TOKEN_RE.test(t));
    if (amounts.length >= 2) return '여러 음식이 한 이름으로 붙은 것 같아요';
    if (amounts.length === 1 && tokens.length >= 2) return `이름에 양(${amounts[0]})이 들어갔어요`;
    return '';
  }

  /** 값 점검. 반환 [{code, text}] */
  function checkValues(food, name) {
    const out = [];
    const corrupt = NUM_FIELDS.filter(k => isCorrupt(food?.[k]));
    if (corrupt.length) out.push({ code: 'corrupt', text: `숫자가 깨져 있어요(${corrupt.join(', ')})` });
    const cal = val(food?.cal), carbs = val(food?.carbs), protein = val(food?.protein), fat = val(food?.fat);
    const blank = food?.cal === undefined || food?.cal === null || food?.cal === '';
    if (blank && !corrupt.includes('cal')) out.push({ code: 'blank', text: '영양값이 비어 있어요(확인 필요)' });
    if ([cal, carbs, protein, fat].every(v => v !== null)) {
      const g = gramsOf(food);
      const zeroOk = zeroPlausible(name);
      if (cal <= 1 && g && g >= 20 && !zeroOk) out.push({ code: 'zero', text: `${g}g인데 0kcal이에요` });
      if (cal <= 1 && zeroOk && g && g >= 60 && /캡슐|네스프레소|에스프레소/.test(String(name))) {
        out.push({ code: 'serving', text: `0kcal은 거의 맞아요(캡슐 커피 1잔 약 1~5kcal). 다만 양이 ${g}g로 저장돼 있어요(보통 1잔 40ml)` });
      }
      if (g && cal / g * 100 > 900) out.push({ code: 'dense', text: `100g당 ${Math.round(cal / g * 100)}kcal — 기름(900)보다 높아요` });
      if (g && g >= 5 && carbs + protein + fat > g * 1.1 + 2) out.push({ code: 'mass', text: `탄단지 합(${r1(carbs + protein + fat)}g)이 양(${g}g)보다 많아요` });
      const est = carbs * 4 + protein * 4 + fat * 9;
      const top = Math.max(cal, est);
      if (!isAlcohol(name) && top >= 30 && Math.abs(est - cal) > Math.max(60, top * 0.4)) {
        out.push({ code: 'mismatch', text: `탄단지로 계산하면 약 ${Math.round(est)}kcal인데 ${Math.round(cal)}kcal로 저장돼 있어요` });
      }
    }
    const estimate = food?.aiEstimate || food?.estimate || food?.sourceTrust === 'estimate' || food?.sourceType === '추정';
    if (cal !== null && cal > 900 && estimate && !out.some(r => r.code === 'dense')) {
      out.push({ code: 'big', text: `추정값인데 한 번에 ${Math.round(cal)}kcal로 커요` });
    }
    const issue = nameIssue(name);
    if (issue) out.push({ code: 'name', text: issue });
    return out;
  }
  const SEND_BLOCK = new Set(['corrupt', 'zero', 'serving', 'dense', 'mass', 'mismatch', 'big', 'name', 'dup']);

  function sigOf(food) {
    return JSON.stringify([String(food?.name || ''), ...NUM_FIELDS.map(k => food?.[k] ?? null), gramsOf(food)]);
  }
  const foodKey = name => `F|${name}`;
  const recordKey = (date, meal, food, index) => `R|${date}|${meal}|${food?.id || `#${index}`}`;

  /** 전체 기록에서 확인할 항목 찾기 */
  function detect(all, reviewed = {}) {
    const items = [];
    const foods = all?.customFoods && typeof all.customFoods === 'object' ? all.customFoods : {};
    const groups = new Map();
    Object.keys(foods).forEach(name => { const k = fold(name); if (!k) return; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(name); });
    Object.entries(foods).forEach(([name, food]) => {
      if (!food || typeof food !== 'object') return;
      const reasons = checkValues(food, name);
      const same = (groups.get(fold(name)) || []).filter(n => n !== name);
      if (same.length) reasons.push({ code: 'dup', text: `같은 음식이 따로 저장돼 있어요(${same.slice(0, 2).join(', ')})` });
      if (!reasons.length) return;
      const key = foodKey(name);
      const sig = sigOf({ ...food, name });
      if (reviewed[key] === sig) return;
      items.push({ kind: 'food', key, sig, name, food: clone(food), reasons });
    });
    Object.keys(all || {}).filter(k => DATE_RE.test(k)).sort().forEach(date => {
      const day = all[date];
      if (!day || typeof day !== 'object') return;
      MEALS.forEach(meal => {
        const list = Array.isArray(day[meal]) ? day[meal] : [];
        const seen = new Map();
        list.forEach((food, index) => {
          if (!food || typeof food !== 'object' || typeof food.name !== 'string') return;
          const reasons = checkValues(food, food.name);
          const dk = `${fold(food.name)}|${food.cal ?? ''}|${food.slot ?? ''}`;
          if (seen.has(dk)) reasons.push({ code: 'dup', text: '같은 끼니에 같은 기록이 두 번 있어요' });
          else seen.set(dk, index);
          if (!reasons.length) return;
          const key = recordKey(date, meal, food, index);
          const sig = sigOf(food);
          if (reviewed[key] === sig) return;
          items.push({ kind: 'record', key, sig, name: food.name, date, meal, id: food.id || '', index, food: clone(food), reasons });
        });
      });
    });
    const order = ['corrupt', 'zero', 'dense', 'mass', 'mismatch', 'big', 'name', 'dup', 'serving', 'blank'];
    const rank = it => Math.min(...it.reasons.map(r => { const i = order.indexOf(r.code); return i < 0 ? 99 : i; }));
    return items.sort((a, b) => rank(a) - rank(b) || (a.kind === b.kind ? 0 : a.kind === 'food' ? -1 : 1));
  }

  /* ---- 기록 안에서 항목 찾기·바꾸기 ---- */
  function findRecord(day, meal, { id, index, name }) {
    const list = Array.isArray(day?.[meal]) ? day[meal] : null;
    if (!list) return -1;
    if (id) return list.findIndex(f => f?.id === id); // id 가 있으면 id 로만(같은 이름 다른 기록을 건드리지 않게)
    if (Number.isInteger(index) && list[index]?.name === name) return index;
    return list.findIndex(f => f?.name === name);
  }
  function applyOne(all, change, dir) {
    const value = dir === 'forward' ? change.after : change.before;
    if (change.kind === 'food') {
      all.customFoods = { ...(all.customFoods || {}) };
      if (value == null) delete all.customFoods[change.name];
      else all.customFoods[change.name] = clone(value);
      return all;
    }
    const day = all[change.date] && typeof all[change.date] === 'object' ? { ...all[change.date] } : { breakfast: [], lunch: [], snack: [], dinner: [] };
    const list = Array.isArray(day[change.meal]) ? [...day[change.meal]] : [];
    day[change.meal] = list;
    const current = dir === 'forward' ? change.before : change.after;
    const loc = { id: change.id, index: change.index, name: current?.name || change.name };
    // 지금 없는 기록(삭제를 되돌릴 때)은 찾지 않고 원래 자리에 다시 넣음
    const at = current == null ? -1 : findRecord(day, change.meal, loc);
    if (value == null) { if (at >= 0) list.splice(at, 1); }
    else if (at >= 0) list[at] = clone(value);
    else list.splice(Math.min(Math.max(0, change.index ?? list.length), list.length), 0, clone(value));
    all[change.date] = day;
    return all;
  }

  /* ---- 깨진 숫자만 자동 정리(전/후 기록) ---- */
  function validNums(food) { return NUM_FIELDS.every(k => val(food?.[k]) !== null) && NUM_FIELDS.every(k => !isCorrupt(food?.[k])); }
  function borrowFrom(target, source) {
    const out = {};
    const tg = gramsOf(target), sg = gramsOf(source);
    if (tg && sg) NUM_FIELDS.forEach(k => { out[k] = r1(val(source[k]) * tg / sg); });
    else if (!tg && !sg) NUM_FIELDS.forEach(k => { out[k] = val(source[k]); });
    else return null;
    return out;
  }
  function autoRepairs(all) {
    const changes = [];
    const at = new Date().toISOString();
    const foods = all?.customFoods || {};
    const records = [];
    Object.keys(all || {}).filter(k => DATE_RE.test(k)).sort().forEach(date => MEALS.forEach(meal => {
      (Array.isArray(all[date]?.[meal]) ? all[date][meal] : []).forEach((food, index) => { if (food && typeof food === 'object' && food.name) records.push({ date, meal, index, food }); });
    }));
    const fix = (food, source) => {
      let changed = false;
      const next = { ...food };
      [...NUM_FIELDS, ...EXTRA_FIELDS].forEach(k => {
        if (!(k in next)) return;
        if (isNumStr(next[k])) { next[k] = Number(next[k]); changed = true; }
        else if (isCorrupt(next[k])) { next[k] = null; changed = true; }
      });
      if (!changed) return null;
      if (NUM_FIELDS.some(k => isCorrupt(food[k])) && source) {
        const borrowed = borrowFrom(next, source);
        if (borrowed) Object.assign(next, borrowed);
      }
      return next;
    };
    Object.entries(foods).forEach(([name, food]) => {
      if (!food || typeof food !== 'object') return;
      const src = [...records].reverse().find(r => fold(r.food.name) === fold(name) && validNums(r.food))?.food;
      const next = fix(food, src);
      if (next) changes.push({ kind: 'food', name, before: clone(food), after: next, auto: true, at, note: src && NUM_FIELDS.some(k => isCorrupt(food[k])) ? '같은 이름의 기록 값으로' : '깨진 숫자를 비움/숫자로' });
    });
    records.forEach(({ date, meal, index, food }) => {
      const srcName = Object.keys(foods).find(n => fold(n) === fold(food.name) && validNums(foods[n]));
      const next = fix(food, srcName ? foods[srcName] : null);
      if (next) changes.push({ kind: 'record', date, meal, index, id: food.id || '', name: food.name, before: clone(food), after: next, auto: true, at, note: srcName && NUM_FIELDS.some(k => isCorrupt(food[k])) ? '같은 이름의 내 음식 값으로' : '깨진 숫자를 비움/숫자로' });
    });
    return changes;
  }

  /* ---- 저장소 연결(앱) ---- */
  let meta = null;
  let repo = null;
  function supported(r) { return Boolean(r && typeof r.getMeta === 'function' && typeof r.setMeta === 'function' && typeof r.updateAll === 'function'); }
  async function saveMeta() { if (repo && meta) await repo.setMeta(META_KEY, meta); }

  async function runOnce(repository) {
    repo = repository;
    if (!supported(repo)) return { skipped: 'unsupported' };
    meta = await repo.getMeta(META_KEY);
    if (meta && meta.version >= VERSION) return { skipped: 'done', meta };
    const all = await repo.getAll();
    const flagged = detect(all, {});
    const changes = autoRepairs(all);
    const days = {};
    [...flagged.filter(i => i.kind === 'record').map(i => i.date), ...changes.filter(c => c.kind === 'record').map(c => c.date)]
      .forEach(d => { if (all[d]) days[d] = clone(all[d]); });
    const backup = { version: VERSION, at: new Date().toISOString(), customFoods: clone(all.customFoods || {}), days };
    await repo.setMeta(BACKUP_KEY, backup);
    const check = await repo.getMeta(BACKUP_KEY);
    if (!check || Object.keys(check.customFoods || {}).length !== Object.keys(backup.customFoods).length || Object.keys(check.days || {}).length !== Object.keys(days).length) {
      throw new Error('백업 확인 실패 — 아무것도 바꾸지 않음');
    }
    if (changes.length) await repo.updateAll(cur => changes.reduce((acc, c) => applyOne(acc, c, 'forward'), cur));
    meta = { version: VERSION, ranAt: backup.at, backupAt: backup.at, changes, reviewed: {}, flaggedAtRun: flagged.length, cardShown: false };
    await saveMeta();
    return { ran: true, flagged: flagged.length, auto: changes.length, backupFoods: Object.keys(backup.customFoods).length, backupDays: Object.keys(days).length };
  }

  async function loadMeta(repository) {
    repo = repository || repo;
    if (!supported(repo)) return null;
    meta = (await repo.getMeta(META_KEY)) || meta;
    return meta;
  }

  async function currentItems() {
    if (!supported(repo)) return [];
    return detect(await repo.getAll(), meta?.reviewed || {});
  }

  /** 사용자 동작(고치기·삭제)을 기록과 함께 적용 */
  async function commit(change) {
    change.at = new Date().toISOString();
    change.auto = false;
    await repo.updateAll(cur => applyOne(cur, change, 'forward'));
    meta = meta || { version: VERSION, changes: [], reviewed: {} };
    meta.changes = [...(meta.changes || []), change];
    await saveMeta();
  }
  async function markReviewed(item) {
    meta = meta || { version: VERSION, changes: [], reviewed: {} };
    meta.reviewed = { ...(meta.reviewed || {}), [item.key]: item.sig };
    await saveMeta();
  }
  async function revertChange(index) {
    const c = meta?.changes?.[index];
    if (!c || c.reverted) return false;
    await repo.updateAll(cur => applyOne(cur, c, 'back'));
    c.reverted = new Date().toISOString();
    await saveMeta();
    return true;
  }
  /** 수정 전으로 되돌리기: 점검이 바꾼 것만 거꾸로(그 뒤에 새로 넣은 기록은 그대로). 백업은 지우지 않음 */
  async function restoreAll() {
    const list = (meta?.changes || []).map((c, i) => ({ c, i })).filter(x => !x.c.reverted);
    if (!list.length) return 0;
    await repo.updateAll(cur => list.slice().reverse().reduce((acc, x) => applyOne(acc, x.c, 'back'), cur));
    const now = new Date().toISOString();
    list.forEach(x => { x.c.reverted = now; });
    meta.reviewed = {};
    await saveMeta();
    return list.length;
  }

  /** /daylog 참고값에서 뺄지(확인 안 한 이상한 값) */
  function excludeFood(name, food) {
    const reasons = checkValues(food, name).filter(r => SEND_BLOCK.has(r.code));
    if (!reasons.length) return false;
    return meta?.reviewed?.[foodKey(name)] !== sigOf({ ...food, name });
  }
  function excludeRecord(food) {
    const reasons = checkValues(food, food?.name).filter(r => SEND_BLOCK.has(r.code));
    if (!reasons.length) return false;
    const reviewed = meta?.reviewed || {};
    const sig = sigOf(food);
    return !Object.entries(reviewed).some(([k, s]) => k.startsWith('R|') && s === sig);
  }

  const api = {
    VERSION, META_KEY, BACKUP_KEY, detect, checkValues, autoRepairs, applyOne, zeroPlausible, nameIssue, gramsOf, sigOf,
    runOnce, loadMeta, currentItems, commit, markReviewed, revertChange, restoreAll, excludeFood, excludeRecord,
    getMeta: () => meta, supported: () => supported(repo),
    getBackup: async () => (supported(repo) ? repo.getMeta(BACKUP_KEY) : null),
  };
  global.RebuildersDataFix = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
