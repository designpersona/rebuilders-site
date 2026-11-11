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

  // 줄임말·오타를 같은 글자로 맞춰 비교한다. 스벅=스타벅스, 케익=케이크, 브륄래=브륄레.
  function foldName(value) {
    let s = compactName(value);
    s = s.replace(/스타벅스|스타박스|starbucks/g, '\0STAR\0');
    s = s.replace(/스벅/g, '\0STAR\0');
    s = s.replace(/\0STAR\0/g, '스타벅스');
    s = s.replace(/브륄래|브릴레|brulee|brûlée/g, '브륄레');
    s = s.replace(/케익|케잌/g, '케이크');
    return s;
  }

  function nameTokens(value) {
    const raw = String(value || '').toLowerCase().normalize('NFC');
    const parts = raw.split(/[\s·.,()\[\]\-_/]+/).filter(Boolean);
    const tokens = parts.map(part => foldName(part)).filter(t => t.length >= 1);
    const folded = foldName(value);
    // 붙여 쓴 '스타벅스치즈케이크'처럼 브랜드가 앞에 있으면 나눔
    const brands = ['스타벅스', '버거킹', '맥도날드', '롯데리아', '파리바게뜨', '파리바게트'];
    brands.forEach(brand => {
      if (folded.startsWith(brand) && folded.length > brand.length) {
        tokens.push(brand);
        // 붙여 쓴 이름만 나머지를 토큰으로 추가. 이미 띄어 쓴 말의 나머지를 붙이면
        // '브륄레치즈케이크'가 되어 '브륄레 쿠키 치즈케이크'와 안 맞는다.
        if (parts.length <= 1) tokens.push(folded.slice(brand.length));
      }
    });
    return [...new Set(tokens)];
  }

  function tokenInTarget(tok, targetFold, targetTokens) {
    if (!tok) return false;
    if (targetFold.includes(tok)) return true;
    return targetTokens.some(t => t === tok || (t.length >= tok.length && t.includes(tok)));
  }

  function tokenOverlap(queryTokens, targetFold, targetTokens) {
    if (!queryTokens.length) return 0;
    let hit = 0;
    queryTokens.forEach(tok => { if (tokenInTarget(tok, targetFold, targetTokens)) hit += 1; });
    return hit / queryTokens.length;
  }

  function unmatchedQueryTokens(queryTokens, targetFold, targetTokens) {
    return queryTokens.filter(tok => tok && tok.length >= 2 && !tokenInTarget(tok, targetFold, targetTokens));
  }

  function scoreNameMatch(query, entry) {
    const qFold = foldName(query);
    if (!qFold) return 0;
    const names = [entry?.name, entry?.brand, entry?.data?.brand, entry?.data?.maker, ...(entry?.aliases || [])].filter(Boolean);
    let best = 0;
    const qTokens = nameTokens(query);
    names.forEach(name => {
      const tFold = foldName(name);
      if (!tFold) return;
      if (qFold === tFold) { best = 1; return; }
      let score = 0;
      if (tFold.includes(qFold) || qFold.includes(tFold)) {
        score = Math.min(qFold.length, tFold.length) / Math.max(qFold.length, tFold.length);
      }
      const overlap = tokenOverlap(qTokens, tFold, nameTokens(name));
      score = Math.max(score, overlap);
      const brand = foldName(entry?.brand || entry?.data?.brand || entry?.data?.maker || '');
      let usedFold = tFold;
      let usedTokens = nameTokens(name);
      if (brand) {
        const combined = foldName(`${entry.brand || entry.data?.brand || entry.data?.maker || ''} ${name}`);
        if (combined && (combined === qFold || combined.includes(qFold) || qFold.includes(combined))) {
          score = Math.max(score, Math.min(qFold.length, combined.length) / Math.max(qFold.length, combined.length));
        }
        const overlap2 = tokenOverlap(qTokens, combined, nameTokens(`${entry.brand || ''} ${name}`));
        if (overlap2 >= overlap) { usedFold = combined; usedTokens = nameTokens(`${entry.brand || ''} ${name}`); }
        score = Math.max(score, overlap2);
      }
      // 쿼리에만 있는 뚜렷한 단어(사과, 신제품 등)가 있으면 같은 제품으로 단정하지 않음.
      const leftover = unmatchedQueryTokens(qTokens, usedFold, usedTokens);
      // 쿼리에만 있는 뚜렷한 단어가 있으면 후보로도 올리지 않음(브륄레 vs 더블치즈케이크).
      if (leftover.length && qFold !== tFold && !usedFold.includes(qFold)) score = Math.min(score, 0.45);
      if (score > best) best = score;
    });
    return best;
  }

  function findCatalogMatches(query, catalogs, options = {}) {
    const q = String(query || '').trim();
    const minScore = options.minScore ?? 0.72;
    const ambiguousMin = options.ambiguousMin ?? 0.55;
    const uniqueGap = options.uniqueGap ?? 0.12;
    const scored = [];
    const seen = new Set();
    catalogList(catalogs).forEach(entry => {
      const key = `${foldName(entry.name)}|${foldName(entry.brand || entry.data?.brand || entry.data?.maker || '')}`;
      if (seen.has(key)) return;
      seen.add(key);
      const score = scoreNameMatch(q, entry);
      if (score >= ambiguousMin) scored.push({ entry, score });
    });
    scored.sort((a, b) => b.score - a.score || String(a.entry.name).length - String(b.entry.name).length);
    const best = scored[0];
    const second = scored[1];
    const close = scored.filter(item => item.score >= ambiguousMin && best && item.score >= best.score - 0.18 && item.score >= Math.min(0.7, best.score - 0.02));
    // 쿼리의 핵심 토큰을 모두 포함한 후보가 둘 이상이면 고르지 않음(스타벅스 치즈케이크 → 더블 vs 브륄레).
    const qTokens = nameTokens(q).filter(t => t.length >= 2 && t !== foldName(q));
    const strong = scored.filter(item => {
      const tFold = foldName([item.entry.name, item.entry.brand || item.entry.data?.brand || item.entry.data?.maker || ''].join(' '));
      const overlap = tokenOverlap(nameTokens(q), tFold, nameTokens(item.entry.name));
      return overlap >= 0.99 && item.score >= ambiguousMin;
    });
    if (strong.length >= 2 && !(best && best.score >= 0.97 && (!second || best.score - second.score >= 0.2))) {
      return { matches: strong.map(item => item.entry), ambiguous: true, best: null };
    }
    if (best && best.score >= minScore && (!second || best.score - second.score >= uniqueGap || best.score >= 0.96)) {
      return { matches: scored.map(item => item.entry), ambiguous: false, best: best.entry, score: best.score };
    }
    if (close.length >= 2) {
      return { matches: close.map(item => item.entry), ambiguous: true, best: null };
    }
    return { matches: scored.map(item => item.entry), ambiguous: false, best: null, score: best?.score || 0 };
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

  function parsePortionPhrase(text) {
    const t = normalize(text);
    if (!t) return null;
    const frac = (eaten, total, unit = '개') => {
      const e = Number(eaten), n = Number(total);
      if (!(n > 0) || !(e > 0) || e > 10000 || n > 10000) return null;
      const value = Math.round((e / n) * 10000) / 10000;
      return { value, unit, text: `${e}/${n}`, parts: { eaten: e, total: n } };
    };
    let m = t.match(/(\d+)\s*(?:조각|등분)\s*(?:중|으로\s*나눠서|해서)\s*(\d+)\s*조각/u);
    if (m) return frac(m[2], m[1]);
    m = t.match(/(\d+)\s*조각으로\s*(?:나눠서|나누(?:어|어)?서)\s*(\d+)\s*조각/u);
    if (m) return frac(m[2], m[1]);
    m = t.match(/(\d+)\s*분의\s*(\d+)/u);
    if (m) return frac(m[2], m[1]);
    m = t.match(/(?:^|[^\d])(\d+)\s*\/\s*(\d+)(?!\d)/);
    if (m) return frac(m[1], m[2]);
    if (/(^|[\s,])(절반|반\s*만|반만|반)(?:\s*(을|를|만))?(?:\s*(먹|이야|야|으로|로)|$)/u.test(t)
      && !/\d/.test(t.replace(/\d+\s*(kcal|칼로리)/giu, ''))) {
      // "반 먹었어" / "절반" — 음식 이름이 함께 있어도 비율만 읽음
      if (/(반|절반)/u.test(t)) return { value: 0.5, unit: '개', text: '1/2', parts: { eaten: 1, total: 2 } };
    }
    m = t.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(g|그램|ml|밀리|밀리리터)(?:\s|$)/iu);
    if (m) {
      const unit = /ml|밀리/i.test(m[2]) ? 'ml' : 'g';
      const value = Number(m[1]);
      if (Number.isFinite(value) && value > 0) return { value, unit, text: `${value}${unit}` };
    }
    return parseAmountPhrase(t);
  }

  function stripPortionWords(text) {
    let t = normalize(text);
    t = t.replace(/(\d+)\s*(?:조각|등분)\s*(?:중|으로\s*나눠서|해서)\s*(\d+)\s*조각(?:만)?/gu, ' ');
    t = t.replace(/(\d+)\s*조각으로\s*(?:나눠서|나누(?:어|어)?서)\s*(\d+)\s*조각(?:만)?/gu, ' ');
    t = t.replace(/(\d+)\s*분의\s*(\d+)/gu, ' ');
    t = t.replace(/(\d+)\s*\/\s*(\d+)/g, ' ');
    t = t.replace(/(절반|반\s*만|반만|(?:^|\s)반)(?:\s*(을|를|만))?/gu, ' ');
    t = t.replace(/(\d+(?:\.\d+)?)\s*(g|그램|ml|밀리|밀리리터)/giu, ' ');
    t = t.replace(/(\d+(?:\.\d+)?)\s*(개|조각)(?:만)?/gu, ' ');
    t = t.replace(/(나눠서|나누어|등분|조각만|먹었어|먹었음|먹음|만\s*먹)/gu, ' ');
    return t.replace(/\s+/g, ' ').trim();
  }

  function isPortionOnlyFollowUp(text) {
    const portion = parsePortionPhrase(text);
    if (!portion) return null;
    let rest = stripPortionWords(text);
    rest = rest.replace(/(아까|방금|그거|이거|그것|그걸|이걸|저거|방금\s*거|아까\s*거|그\s*기록|이\s*기록)/gu, ' ');
    rest = rest.replace(/(아침|점심|저녁|간식|조식|중식|석식|야식)(으로|에)?/gu, ' ');
    rest = rest.replace(/(으로|로)?\s*(바꿔|고쳐|수정|적어|해)(?:\s*(줘|주세요|달라|요))?/gu, ' ');
    rest = rest.replace(/(먹었어|먹었음|먹음|만|요|줘|해|좀|오늘)/gu, ' ');
    rest = rest.replace(/\s+/g, ' ').trim();
    rest = rest.replace(/(은|는|이|가|을|를|에|의|으로|로)\s*$/u, '').trim();
    if (rest && rest.length > 1 && !/^(그거|이거|그|이)$/u.test(rest)) return null;
    return portion;
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
    const portionOnly = isPortionOnlyFollowUp(t);
    if (portionOnly) return { action: 'set-amount', amount: portionOnly, foodHint: extractFoodHint(stripPortionWords(t)) };
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

  function fuzzyCatalogHit(name, catalogs, options = {}) {
    const exact = exactCatalogHit(name, catalogs);
    if (exact) return exact;
    const found = findCatalogMatches(name, catalogs, options);
    if (found.ambiguous) return { ambiguous: true, matches: found.matches };
    return found.best || null;
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
      let hit = withLastServing(exactCatalogHit(item.name, catalogs) || (item.known && item.data ? { name: item.name, data: item.data, origin: 'parsed' } : null), catalogs);
      if (!hit || !hit.data) {
        const fuzzy = fuzzyCatalogHit(item.name, catalogs);
        if (fuzzy?.ambiguous) return { ...empty, parsed, ambiguousCandidates: fuzzy.matches };
        if (fuzzy && fuzzy.data) hit = withLastServing(fuzzy, catalogs);
      }
      if (!hit || !hit.data) return { ...empty, parsed };
      // 파서가 공식 별칭으로만 맞춘 경우도 data 가 있으면 허용(계란→삶은 달걀). 퍼지 확정 매칭도 허용.
      const exact = exactCatalogHit(item.name, catalogs) || exactCatalogHit(hit.name, catalogs);
      if (!exact && !item.known && !hit.origin) return { ...empty, parsed };
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

  function logFoodQuery(text) {
    let t = normalize(text);
    t = t.replace(/(아침|점심|저녁|간식|조식|중식|석식|야식)(으로|에|은|는)?/gu, ' ');
    t = stripPortionWords(t);
    t = t.replace(/(먹었어|먹었음|먹음|먹을게|먹을래|기록해|적어)(?:요|줘|주세요)?/gu, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/(은|는|이|가|을|를|에|의|으로|로)\s*$/u, '').trim();
    return t;
  }

  /**
   * 내 음식·최근·공식과 이름이 딱 맞거나, 줄임말·오타를 고쳐 후보가 하나로 좁혀질 때만 바로 기록.
   * 후보가 여럿이면 ok:false 와 ambiguousCandidates.
   */
  function matchLocalFood(text, catalogs, options = {}) {
    const instant = matchLocalInstant(text, catalogs, options);
    if (instant.ok || instant.instruction) return instant;
    const query = logFoodQuery(text);
    if (!query || query.length < 2) return instant;
    const found = findCatalogMatches(query, catalogs);
    if (found.ambiguous) {
      return { ok: false, candidates: found.matches.map(entry => entry.name), ambiguousCandidates: found.matches, parsed: instant.parsed };
    }
    if (!found.best || !found.best.data) return instant;
    const QE = global.RebuildersQuickEntry;
    const parsed = instant.parsed || (QE?.parseQuickEntry ? QE.parseQuickEntry(normalize(text), { foods: catalogsToFoods(catalogs), now: options.now || new Date() }) : null);
    const portion = parsePortionPhrase(text);
    const amount = portion || parsed?.items?.[0]?.amount || null;
    const hit = withLastServing(found.best, catalogs);
    const item = applyDefaultAmount({
      name: hit.name,
      baseName: hit.baseName || hit.name,
      data: hit.data,
      known: true,
      amount,
      origin: hit.origin,
    }, hit);
    if (QE?.scaleFood) item.food = QE.scaleFood(item);
    const mealId = parsed?.mealId || mealIdFrom(text) || options.mealId || null;
    return {
      ok: true,
      items: [item],
      parsed: {
        mealId: mealId || parsed?.mealId,
        mealExplicit: Boolean(parsed?.mealExplicit || mealIdFrom(text)),
        date: parsed?.date,
        dateExplicit: Boolean(parsed?.dateExplicit),
        time: parsed?.time || null,
        timeExplicit: Boolean(parsed?.timeExplicit),
        recordIntent: true,
        items: [item],
        ambiguous: null,
        phrase: text,
      },
      candidates: found.matches.map(entry => entry.name),
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
    if (Array.isArray(context.todayRecords) && context.todayRecords.length) {
      payload.todayRecords = context.todayRecords.slice(0, 24).map(row => ({
        id: String(row.id || '').slice(0, 40),
        name: String(row.name || '').trim().slice(0, 80),
        brand: String(row.brand || '').trim().slice(0, 40),
        meal: row.meal || '',
        amount: String(row.amount || '').trim().slice(0, 40),
        kcal: typeof row.kcal === 'number' ? row.kcal : null,
      })).filter(row => row.name);
    }
    if (Array.isArray(context.savedFoods) && context.savedFoods.length) {
      payload.savedFoods = context.savedFoods.slice(0, 40).map(row => ({
        name: String(row.name || '').trim().slice(0, 80),
        brand: String(row.brand || '').trim().slice(0, 40),
      })).filter(row => row.name);
    }
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
      const grams = numOrNull(item.grams ?? item.package_grams ?? item.packageGrams, 20000);
      if (grams != null) out.grams = grams;
      const pkg = numOrNull(item.package_grams ?? item.packageGrams, 20000);
      if (pkg != null) out.packageGrams = pkg;
      if (item.amount && typeof item.amount === 'number' && item.amount > 0 && item.amount < 1 && !out.amount) {
        out.amount = { value: item.amount, unit: unit || '개', text: String(item.amount) };
      }
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
    fuzzyCatalogHit,
    findCatalogMatches,
    foldName,
    candidateNames,
    matchLocalInstant,
    matchLocalFood,
    parsePortionPhrase,
    isPortionOnlyFollowUp,
    buildInterpretPayload,
    parseInterpretResult,
    editFromInterpret,
  };
  global.RebuildersChatIntent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
