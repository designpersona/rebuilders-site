/* 채팅 의도: 질문·수정·확인 답을 음식 이름과 구분합니다. 등록·최근·공식과 딱 맞으면
 * 바로 기록하고, 그 외는 문장 통째로 AI에 맡길지 결정합니다. DOM·저장소에 의존하지 않습니다. */
(function rebuildersChatIntent(global) {
  'use strict';

  const MEAL_WORD = {
    '아침': 'breakfast', 조식: 'breakfast', breakfast: 'breakfast',
    '점심': 'lunch', 중식: 'lunch', lunch: 'lunch',
    '저녁': 'dinner', 석식: 'dinner', dinner: 'dinner',
    '간식': 'snack', 야식: 'snack', snack: 'snack',
  };
  const COUNT_UNITS = ['공기', '그릇', '개', '잔', '컵', '접시', '조각', '쪽', '봉지', '봉', '팩', '캔', '병', '인분', '스푼', '숟가락', '큰술', '작은술', '한줌', '줌', '장', '알', '줄', '회', 'kg', 'g', 'ml', 'l'];
  const UNIT_RE = COUNT_UNITS.slice().sort((a, b) => b.length - a.length).join('|');
  const STRIP_WORDS = new RegExp(
    `^(아까|방금|그거|이거|그것|그걸|이걸|저거|방금\\s*거|아까\\s*거|그\\s*기록|이\\s*기록)|`
    + `(으로|로)?\\s*(바꿔|고쳐|수정|적어|합쳐|나눠|지워|삭제|옮겨|넣어|기록해)(?:\\s*(줘|주세요|달라|요))?$|`
    + `^(한\\s*제품|두\\s*개|따로|하나로)`,
    'u',
  );
  const INTERPRET_INTENTS = ['log', 'edit', 'question', 'clarify'];
  const EDIT_FIELDS = ['kcal', 'amount', 'unit', 'meal', 'delete', 'merge', 'split'];

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function compactName(value) {
    return String(value || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  }

  function isQuestion(text) {
    const t = normalize(text);
    if (!t) return false;
    if (parseEditIntent(t)) return false;
    if (/[?？]\s*$/.test(t)) return true;
    if (/(까요|가요|나요|니요|입니까|인가요|을까요|할까요|인가요|습니까)\s*$/u.test(t)) return true;
    if (/(먹어도\s*(돼|되|괜찮)|괜찮(?:아|을까)?|가능)/u.test(t)) return true;
    if (/(몇\s*(?:kcal|KCAL|칼로리|칼로|그램|g|ml)|얼마나|뭐야|뭐냐|무슨|어떤|얼마)/u.test(t)
      && /(야|이야|요|가요|나요|까|니|지)\s*$/u.test(t)) return true;
    if (/^(이거|그건|그거|방금\s*거|아까\s*거)\s*(몇|얼마)/u.test(t)) return true;
    return false;
  }

  function mealIdFrom(text) {
    const t = normalize(text);
    const m = t.match(/(아침|조식|점심|중식|저녁|석식|간식|야식|breakfast|lunch|dinner|snack)/iu);
    return m ? MEAL_WORD[m[1]] || MEAL_WORD[m[1].toLowerCase()] || null : null;
  }

  function parseAmountPhrase(text) {
    const t = normalize(text);
    const re = new RegExp(`(?:^|\\s)(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})(?:\\s*(?:야|이야|이에요|입니다|로|으로))?\\s*$`, 'iu');
    const m = t.match(re);
    if (!m) return null;
    const unit = m[2].toLowerCase() === '한줌' ? '줌' : m[2];
    const value = Number(m[1]);
    if (!Number.isFinite(value) || value <= 0) return null;
    return { value, unit, text: `${value}${unit === '줌' && /한줌/u.test(m[2]) ? '줌' : m[2]}`.replace(/한줌$/u, '한줌') };
  }

  function extractFoodHint(text) {
    let t = normalize(text);
    t = t.replace(/[?？]/g, ' ');
    t = t.replace(/(아까|방금|그거|이거|그것|그걸|이걸|저거|방금\s*거|아까\s*거|그\s*기록|이\s*기록)/gu, ' ');
    t = t.replace(/(\d+(?:\.\d+)?)\s*(kcal|KCAL|칼로리)/gu, ' ');
    t = t.replace(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})`, 'giu'), ' ');
    t = t.replace(/(으로|로)?\s*(바꿔|고쳐|수정|적어|합쳐|나눠|지워|삭제|옮겨|넣어|기록해|알려)(?:\s*(줘|주세요|달라|요|줘라))?/gu, ' ');
    t = t.replace(/(한\s*제품|두\s*개|따로|하나로|몇\s*(kcal|칼로리)|먹어도\s*(돼|되|괜찮)|이야|야|이에요|입니다)/gu, ' ');
    t = t.replace(/(아침|점심|저녁|간식|조식|중식|석식|야식)(으로|에)?/gu, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/(은|는|이|가|을|를|에|의|으로|로)\s*$/u, '').trim();
    if (!t || t.length > 80) return '';
    if (/^(줘|요|해|좀|바로|오늘|나|저)$/u.test(t)) return '';
    return t;
  }

  function parseEditIntent(text) {
    const t = normalize(text);
    if (!t) return null;

    if (/(하나로\s*합쳐|합쳐\s*(줘|주세요|달라)|합쳐줘)/u.test(t)) {
      return { action: 'merge', foodHint: extractFoodHint(t) };
    }
    if (/두\s*개\s*따로|따로\s*(기록|나눠|적어|해)/u.test(t)) {
      return { action: 'split', foodHint: extractFoodHint(t) };
    }
    if (/(지워|삭제해|취소해)/u.test(t) && /(방금|아까|그거|이거|그것|기록)/u.test(t)
      || /^(지워줘|삭제해줘|취소해줘)$/u.test(t)) {
      return { action: 'delete', foodHint: extractFoodHint(t) };
    }
    const move = t.match(/(아침|점심|저녁|간식)(으로|에)\s*(옮겨|바꿔|넣어|기록)/u);
    if (move) {
      return { action: 'move', mealId: MEAL_WORD[move[1]], foodHint: extractFoodHint(t) };
    }

    const kcal = t.match(/(\d+(?:\.\d+)?)\s*(?:kcal|KCAL|칼로리)(?:로|으로)?(?:\s*(바꿔|고쳐|수정|적어))?/u)
      || t.match(/(?:칼로리|kcal)(?:을|를|은|는)?\s*(\d+(?:\.\d+)?)/iu);
    if (kcal && (/(바꿔|고쳐|수정|적어)/u.test(t) || /kcal|칼로리/i.test(t))) {
      const value = Number(kcal[1]);
      if (Number.isFinite(value) && value >= 0 && value <= 5000) {
        return { action: 'set-kcal', kcal: value, foodHint: extractFoodHint(t) };
      }
    }

    if (/(바꿔|고쳐|수정|적어|야|이야|이에요)/u.test(t)) {
      const amount = parseAmountPhrase(t);
      if (amount) return { action: 'set-amount', amount, foodHint: extractFoodHint(t) };
    }
    return null;
  }

  function isInstructionOnly(text) {
    return isQuestion(text) || Boolean(parseEditIntent(text));
  }

  function parseClarifyReply(text) {
    const t = normalize(text);
    if (!t) return null;
    if (/두\s*개|둘|따로|두개/u.test(t) && !/한\s*제품|하나(?:로|만|예요|야|이다)?$/u.test(t)) return 'two';
    if (/한\s*제품|하나로|하나(?:예요|에요|야|이다)?|한\s*개|한개/u.test(t)) return 'one';
    return null;
  }

  function classifyChat(text, { pendingClarify } = {}) {
    const t = normalize(text);
    if (!t) return { type: 'empty' };
    if (pendingClarify) {
      const choice = parseClarifyReply(t);
      if (choice) return { type: 'clarify-reply', choice };
    }
    const edit = parseEditIntent(t);
    if (edit) return { type: 'edit', ...edit };
    if (isQuestion(t)) return { type: 'question', foodHint: extractFoodHint(t), topic: /kcal|칼로리|몇/i.test(t) ? 'kcal' : 'general' };
    return { type: 'food' };
  }

  function catalogList(catalogs) {
    if (!catalogs) return [];
    return ['mine', 'recent', 'db'].flatMap(origin =>
      (catalogs[origin] || []).map(entry => ({ ...entry, origin: entry.origin || origin })));
  }

  function exactCatalogHit(name, catalogs) {
    const q = compactName(name);
    if (!q) return null;
    const groups = [
      ['mine', catalogs?.mine],
      ['recent', catalogs?.recent],
      ['db', catalogs?.db],
    ];
    for (const [origin, list] of groups) {
      for (const entry of list || []) {
        const keys = [entry.name, ...(entry.aliases || [])].map(compactName).filter(Boolean);
        if (keys.includes(q)) return { ...entry, origin: entry.origin || origin };
      }
    }
    return null;
  }

  function withLastServing(hit, catalogs) {
    if (!hit) return hit;
    const q = compactName(hit.name);
    const rec = (catalogs?.recent || []).find(entry => compactName(entry.name) === q || (entry.aliases || []).some(a => compactName(a) === q));
    if (!rec) return hit;
    return {
      ...hit,
      lastServing: rec.lastServing || rec.data?.serving || hit.lastServing,
      lastAmount: rec.lastAmount ?? hit.lastAmount,
      lastUnit: rec.lastUnit || hit.lastUnit,
    };
  }

  function parseServingAmount(text) {
    if (!text) return null;
    const fromQuick = global.RebuildersQuickEntry?.parseAmountAt;
    if (fromQuick) {
      const tokens = String(text).trim().split(/\s+/).filter(Boolean);
      const parsed = fromQuick(tokens, 0);
      if (parsed?.amount) return parsed.amount;
    }
    return parseAmountPhrase(` ${text}`) || parseAmountPhrase(String(text));
  }

  function applyDefaultAmount(item, hit) {
    if (item.amount || !hit) return item;
    const serving = hit.lastServing || (hit.lastAmount && hit.lastUnit ? `${hit.lastAmount}${hit.lastUnit}` : '');
    const amount = serving ? parseServingAmount(serving) : null;
    if (!amount && hit.lastAmount && hit.lastUnit) {
      return { ...item, amount: { value: Number(hit.lastAmount), unit: hit.lastUnit, text: `${hit.lastAmount}${hit.lastUnit}` } };
    }
    return amount ? { ...item, amount } : item;
  }

  function candidateNames(text, catalogs, limit = 8) {
    const q = compactName(text);
    if (!q) return [];
    const scored = [];
    catalogList(catalogs).forEach(entry => {
      const keys = [entry.name, ...(entry.aliases || [])].map(compactName).filter(Boolean);
      if (keys.some(key => key && (q.includes(key) || key.includes(q) || q.slice(0, 8) && key.startsWith(q.slice(0, Math.min(8, q.length)))))) {
        if (!scored.some(item => compactName(item) === compactName(entry.name))) scored.push(entry.name);
      }
    });
    return scored.slice(0, limit);
  }

  function catalogsToFoods(catalogs) {
    const seen = new Set();
    const out = [];
    catalogList(catalogs).forEach(entry => {
      const name = entry?.name;
      if (!name || seen.has(name)) return;
      seen.add(name);
      out.push([name, entry.data || {}, entry.aliases || []]);
    });
    return out;
  }

  /**
   * 문장 전체, 또는 쉼표·그리고 등으로 나눈 각 부분이 내 음식·최근·공식 DB와
   * 이름(또는 별칭)이 딱 맞을 때만 바로 기록합니다. 하나라도 확신이 없으면 ok: false.
   */
  function matchLocalInstant(text, catalogs, options = {}) {
    const QE = global.RebuildersQuickEntry;
    const candidates = candidateNames(text, catalogs);
    const empty = { ok: false, candidates, parsed: null };
    const raw = normalize(text);
    if (!raw) return { ...empty, type: 'empty' };
    if (QE?.isInstructionText ? QE.isInstructionText(raw) : isInstructionOnly(raw)) {
      return { ...empty, instruction: true };
    }
    if (!QE?.parseQuickEntry) return empty;
    const parsed = QE.parseQuickEntry(raw, { foods: catalogsToFoods(catalogs), now: options.now || new Date() });
    if (!parsed?.items?.length || parsed.ambiguous) return { ...empty, parsed };
    const resolved = [];
    for (const item of parsed.items) {
      const hit = withLastServing(exactCatalogHit(item.name, catalogs) || (item.known && item.data ? { name: item.name, data: item.data, origin: 'parsed' } : null), catalogs);
      if (!hit || !hit.data) return { ...empty, parsed };
      // 파서가 공식 별칭으로만 맞춘 경우도 data 가 있으면 허용(계란→삶은 달걀). 부분 일치로 새로 지어낸 이름은 거절.
      const exact = exactCatalogHit(item.name, catalogs) || exactCatalogHit(hit.name, catalogs);
      if (!exact && !item.known) return { ...empty, parsed };
      const next = applyDefaultAmount({ ...item, name: hit.name, baseName: hit.baseName || hit.name, data: hit.data, known: true, origin: hit.origin || exact?.origin }, hit);
      if (QE.scaleFood) next.food = QE.scaleFood(next);
      resolved.push(next);
    }
    return {
      ok: true,
      items: resolved,
      parsed: { ...parsed, items: resolved },
      candidates,
    };
  }

  function buildInterpretPayload(text, context = {}) {
    const payload = {
      text: String(text || '').trim().slice(0, 500),
      date: context.date || null,
      meal: context.meal || null,
      time: context.time || null,
      lastBatch: context.lastBatch || null,
      candidates: Array.isArray(context.candidates) ? context.candidates.slice(0, 12) : [],
    };
    // 영양표 사진 등록은 이 작업에 넣지 않음. 나중에 image 필드를 채워 같은 길로 보낼 수 있게 자리만 둠.
    if (context.image) payload.image = context.image;
    return payload;
  }

  function numOrNull(value, max) {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
  }

  function parseInterpretAmount(raw) {
    if (raw == null || raw === '') return null;
    if (typeof raw === 'object') {
      const value = numOrNull(raw.value ?? raw.amount, 20000);
      const unit = String(raw.unit || '').trim().slice(0, 20);
      if (value == null) return null;
      return { value, unit, text: raw.text || `${value}${unit}` };
    }
    if (typeof raw === 'number') return { value: raw, unit: '', text: String(raw) };
    return parseServingAmount(raw) || { value: null, unit: '', text: String(raw).trim().slice(0, 40) };
  }

  function parseInterpretResult(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const intent = String(raw.intent || '').trim();
    if (!INTERPRET_INTENTS.includes(intent)) return null;
    const items = [];
    (Array.isArray(raw.items) ? raw.items : []).slice(0, 8).forEach(item => {
      if (!item || typeof item !== 'object') return;
      const name = normalize(item.name).slice(0, 80);
      if (!name) return;
      const out = { name };
      const brand = normalize(item.brand).slice(0, 40);
      if (brand) out.brand = brand;
      const amount = parseInterpretAmount(item.amount);
      const unit = normalize(item.unit).slice(0, 20);
      if (amount && (amount.value != null || amount.text)) {
        if (unit && !amount.unit) amount.unit = unit;
        if (!amount.text) amount.text = `${amount.value || ''}${amount.unit || ''}`.trim();
        out.amount = amount;
      } else if (unit) {
        out.unit = unit;
      }
      const grams = numOrNull(item.grams, 20000);
      if (grams != null) out.grams = grams;
      if (item.meal && MEAL_WORD[item.meal] || ['breakfast', 'lunch', 'dinner', 'snack'].includes(item.meal)) {
        out.meal = MEAL_WORD[item.meal] || item.meal;
      }
      const time = normalize(item.time).slice(0, 16);
      if (time) out.time = time;
      items.push(out);
    });
    const edits = [];
    (Array.isArray(raw.edits) ? raw.edits : []).slice(0, 8).forEach(edit => {
      if (!edit || typeof edit !== 'object') return;
      const field = String(edit.field || '').trim();
      if (!EDIT_FIELDS.includes(field)) return;
      const out = { field, value: edit.value };
      const targetId = String(edit.targetId || '').trim();
      const targetName = normalize(edit.targetName || '').slice(0, 80);
      if (targetId) out.targetId = targetId;
      if (targetName) out.targetName = targetName;
      edits.push(out);
    });
    const result = { intent, items, edits };
    const answer = normalize(raw.answer).slice(0, 500);
    if (answer) result.answer = answer;
    const question = normalize(raw.clarifyQuestion).slice(0, 200);
    if (question) result.clarifyQuestion = question;
    const options = (Array.isArray(raw.clarifyOptions) ? raw.clarifyOptions : [])
      .map(opt => normalize(opt).slice(0, 40)).filter(Boolean).slice(0, 4);
    if (options.length) result.clarifyOptions = options;
    if (intent === 'log' && !items.length) return null;
    if (intent === 'edit' && !edits.length) return null;
    if (intent === 'clarify' && !question && !options.length) return null;
    return result;
  }

  function editFromInterpret(edit) {
    if (!edit) return null;
    const foodHint = edit.targetName || '';
    if (edit.field === 'delete') return { action: 'delete', foodHint, targetId: edit.targetId };
    if (edit.field === 'merge') return { action: 'merge', foodHint, targetId: edit.targetId };
    if (edit.field === 'split') return { action: 'split', foodHint, targetId: edit.targetId };
    if (edit.field === 'meal') {
      const mealId = MEAL_WORD[edit.value] || (['breakfast', 'lunch', 'dinner', 'snack'].includes(edit.value) ? edit.value : null);
      return mealId ? { action: 'move', mealId, foodHint, targetId: edit.targetId } : null;
    }
    if (edit.field === 'kcal') {
      const kcal = numOrNull(edit.value, 5000);
      return kcal != null ? { action: 'set-kcal', kcal, foodHint, targetId: edit.targetId } : null;
    }
    if (edit.field === 'amount' || edit.field === 'unit') {
      const amount = parseInterpretAmount(edit.value);
      if (!amount) return null;
      if (edit.field === 'unit' && !amount.unit) amount.unit = String(edit.value || '').trim();
      return { action: 'set-amount', amount, foodHint, targetId: edit.targetId };
    }
    return null;
  }

  const api = {
    classifyChat,
    isQuestion,
    isInstructionOnly,
    parseEditIntent,
    parseClarifyReply,
    extractFoodHint,
    mealIdFrom,
    compactName,
    exactCatalogHit,
    candidateNames,
    matchLocalInstant,
    buildInterpretPayload,
    parseInterpretResult,
    editFromInterpret,
  };
  global.RebuildersChatIntent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
