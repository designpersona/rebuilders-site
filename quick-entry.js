/* 빠른 입력 파서: "아침 바나나", "점심 이삭 햄치즈, 아아", "저녁 밥 반공기 김치" 같은 짧은 입력을
   끼니 + 음식 목록으로 나눕니다. DOM·저장소에 의존하지 않는 순수 함수라 Node 테스트로 확인할 수 있어요. */
(function rebuildersQuickEntry(global) {
  'use strict';

  const MEAL_WORDS = [
    ['breakfast', ['아침', '조식', 'breakfast']],
    ['lunch', ['점심', '중식', 'lunch']],
    ['dinner', ['저녁', '석식', 'dinner']],
    ['snack', ['간식', '야식', 'snack']],
  ];

  // 간단한 별칭: 입력 → 기록할 이름 + 영양값을 빌려올 기본 음식 이름
  const QUICK_ALIASES = {
    '아아': { name: '아이스 아메리카노', base: '아메리카노' },
    '아이스아메리카노': { name: '아이스 아메리카노', base: '아메리카노' },
    '아이스 아메리카노': { name: '아이스 아메리카노', base: '아메리카노' },
    '아이스 아메': { name: '아이스 아메리카노', base: '아메리카노' },
    '뜨아': { name: '아메리카노', base: '아메리카노' },
    '아메': { name: '아메리카노', base: '아메리카노' },
    '삶은계란': { name: '삶은 달걀', base: '삶은 달걀' },
    '삶은 계란': { name: '삶은 달걀', base: '삶은 달걀' },
    '계란': { name: '삶은 달걀', base: '삶은 달걀' },
    '달걀': { name: '삶은 달걀', base: '삶은 달걀' },
    '제로 콜라': { name: '제로콜라', base: '제로콜라' },
    '콜라 제로': { name: '제로콜라', base: '제로콜라' },
    '닭가슴': { name: '닭가슴살', base: '닭가슴살' },
  };

  const NUM_WORDS = { '반': 0.5, '한': 1, '하나': 1, '두': 2, '둘': 2, '세': 3, '셋': 3, '네': 4, '넷': 4, '다섯': 5 };
  const COUNT_UNITS = ['공기', '그릇', '개', '잔', '컵', '접시', '조각', '쪽', '봉지', '봉', '팩', '캔', '병', '인분', '스푼', '숟가락', '큰술', '줌', '장', '알', '줄'];
  const MASS_UNITS = ['kg', 'g', 'ml', 'l'];
  const UNIT_RE = [...COUNT_UNITS, ...MASS_UNITS].sort((a, b) => b.length - a.length).join('|');
  const AMOUNT_RE = new RegExp(`^(?:(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})?|(반|한|하나|두|둘|세|셋|네|넷|다섯)\\s*(${UNIT_RE})?)$`, 'iu');
  const AMOUNT_SUFFIX_RE = new RegExp(`^(.+?)((?:\\d+(?:\\.\\d+)?\\s*(?:${UNIT_RE}))|(?:(?:반|한|두|세|네|다섯)\\s*(?:${UNIT_RE})))$`, 'iu');

  const INTENT_RE = /(먹었|먹음|먹었다|먹은|마셨|마심|마신|기록|등록|추가)/u;
  const FILLER_WORDS = new Set([
    '오늘', '나', '나는', '저는', '제가', '내가', '좀', '그리고', '또', '랑', '이랑', '하고', '및', '와', '과',
    '먹었어', '먹었어요', '먹었다', '먹었음', '먹음', '먹은', '먹은거', '먹은것', '먹었는데', '먹었고', '먹어', '먹고',
    '마셨어', '마셨어요', '마셨다', '마심', '마신', '마시고', '마셨고',
    '기록', '기록해', '기록해줘', '기록해주세요', '등록', '등록해', '등록해줘', '추가', '추가해', '추가해줘', '해줘', '해주세요',
    '식단에', '식단', '으로', '로',
    'i', 'we', 'ate', 'had', 'for', 'please', 'log', 'record', 'add', 'today', 'and', 'with',
  ]);

  const compact = value => String(value || '').toLowerCase().replace(/\s+/g, '');

  function amountValue(match) {
    if (!match) return null;
    const num = match[1] != null ? Number(match[1]) : NUM_WORDS[match[3]];
    const unit = (match[2] || match[4] || '').toLowerCase();
    return { value: num, unit, text: match[0].replace(/\s+/g, '') };
  }

  function parseAmount(token) {
    const m = String(token).match(AMOUNT_RE);
    if (!m) return null;
    // "한", "두" 같은 수사는 단위 없이 혼자 오면 음식 이름일 수 있으니 숫자·'반'만 허용
    if (m[3] && !m[4] && m[3] !== '반') return null;
    return amountValue(m);
  }

  function detectMeal(text) {
    const lower = text.toLowerCase();
    let best = null;
    MEAL_WORDS.forEach(([mealId, words]) => {
      words.forEach(word => {
        const re = new RegExp(`(^|[\\s,.;!?])${word}(으로|에는|에|엔|때|은|는|으론)?(?=$|[\\s,.;!?])`, 'u');
        const m = lower.match(re);
        if (m && (best === null || m.index < best.index)) best = { mealId, index: m.index, word };
      });
    });
    return best;
  }

  function stripMealWords(text) {
    let out = text;
    MEAL_WORDS.forEach(([, words]) => {
      words.forEach(word => {
        out = out.replace(new RegExp(`(^|[\\s,.;!?])${word}(으로|에는|에|엔|때|은|는|으론)?(?=$|[\\s,.;!?])`, 'giu'), '$1 ');
      });
    });
    return out;
  }

  // 날짜 말: 오늘·어제·그제/그저께·내일·모레 (+ "10/22", "10월 22일", "22일")
  // (iOS 15 사파리도 돌아가게 정규식 lookbehind 는 쓰지 않음)
  const DATE_WORDS = [['오늘', 0], ['금일', 0], ['어제', -1], ['어저께', -1], ['엊그제', -2], ['그저께', -2], ['그제', -2], ['내일', 1], ['낼', 1], ['모레', 2]];
  const DATE_SUFFIX = '(은|는|도|에|에는|엔|때|으로|로)?';
  const dateWordRe = (word, flags = 'u') => new RegExp(`(^|[\\s,.;!?])${word}${DATE_SUFFIX}(?=$|[\\s,.;!?])`, flags);
  const MONTH_DAY_RE = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/u;
  const SLASH_DATE_RE = /(^|[^\d.])(\d{1,2})\s*\/\s*(\d{1,2})(?!\d)/u;
  const DAY_ONLY_RE = /(^|[\s,])(\d{1,2})\s*일(?=$|[\s,.;!?])/u;

  function dayKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** 입력에서 날짜를 찾음 → 'YYYY-MM-DD' 또는 null */
  function detectDate(text, now = new Date()) {
    const base = new Date(now);
    base.setHours(0, 0, 0, 0);
    const valid = (month, day) => {
      const d = new Date(base.getFullYear(), month - 1, day);
      return d.getMonth() === month - 1 && d.getDate() === day ? dayKey(d) : null;
    };
    let m = text.match(MONTH_DAY_RE);
    if (m) return valid(Number(m[1]), Number(m[2]));
    m = text.match(SLASH_DATE_RE);
    if (m) return valid(Number(m[2]), Number(m[3]));
    m = text.match(DAY_ONLY_RE);
    if (m) return valid(base.getMonth() + 1, Number(m[2]));
    let best = null;
    DATE_WORDS.forEach(([word, offset]) => {
      const hit = text.match(dateWordRe(word));
      if (hit && (best === null || hit.index < best.index)) best = { index: hit.index, offset };
    });
    if (!best) return null;
    const d = new Date(base);
    d.setDate(d.getDate() + best.offset);
    return dayKey(d);
  }

  function stripDateWords(text) {
    let out = text
      .replace(new RegExp(MONTH_DAY_RE.source, 'gu'), ' ')
      .replace(new RegExp(SLASH_DATE_RE.source, 'gu'), '$1 ')
      .replace(new RegExp(DAY_ONLY_RE.source, 'gu'), '$1 ');
    DATE_WORDS.forEach(([word]) => { out = out.replace(dateWordRe(word, 'giu'), '$1 '); });
    return out;
  }

  function mealForTime(date = new Date()) {
    const hour = date.getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'snack';
    return 'dinner';
  }

  // foods: [[name, data, extraNames[]]]
  function buildIndex(foods) {
    const index = new Map();
    const put = (key, entry) => { const k = compact(key); if (k && !index.has(k)) index.set(k, entry); };
    Object.entries(QUICK_ALIASES).forEach(([alias, target]) => {
      const base = foods.find(([name]) => name === target.base);
      if (base) put(alias, { name: target.name, baseName: base[0], data: base[1] });
    });
    foods.forEach(([name, data, extra = []]) => {
      [name, ...extra].filter(Boolean).forEach(key => put(key, { name, baseName: name, data }));
    });
    return index;
  }

  function lookup(index, words) {
    const key = compact(words.join(' '));
    if (index.has(key)) return index.get(key);
    // 조사 떼고 다시 (바나나를, 김치도, 우유는)
    const stripped = key.replace(/(을|를|은|는|이|가|도|만|요)$/u, '');
    if (stripped !== key && stripped && index.has(stripped)) return index.get(stripped);
    return null;
  }

  function cleanUnknown(name) {
    return name.replace(/\s+/g, ' ').trim().replace(/(을|를)$/u, '').trim();
  }

  function parseChunk(chunk, index) {
    const tokens = chunk.split(/\s+/).filter(Boolean).filter(tok => !FILLER_WORDS.has(tok.toLowerCase()));
    const items = [];
    let pending = [];
    const flushPending = (amount = null) => {
      if (!pending.length) return;
      const name = cleanUnknown(pending.join(' '));
      pending = [];
      if (name) items.push({ name, known: false, amount });
    };
    let i = 0;
    while (i < tokens.length) {
      // 가장 긴 음식 이름부터 맞춰보기(최대 4단어)
      let matched = null;
      for (let len = Math.min(4, tokens.length - i); len >= 1; len -= 1) {
        const hit = lookup(index, tokens.slice(i, i + len));
        if (hit) { matched = { hit, len }; break; }
      }
      if (matched) {
        flushPending();
        const item = { name: matched.hit.name, baseName: matched.hit.baseName, data: matched.hit.data, known: true, amount: null };
        i += matched.len;
        const amount = i < tokens.length ? parseAmount(tokens[i]) : null;
        if (amount) { item.amount = amount; i += 1; }
        items.push(item);
        continue;
      }
      const token = tokens[i];
      const amount = parseAmount(token);
      if (amount) {
        if (pending.length) flushPending(amount);
        else if (items.length && !items[items.length - 1].amount) items[items.length - 1].amount = amount;
        i += 1;
        continue;
      }
      // "바나나2개", "밥반공기"처럼 붙여 쓴 양
      const suffix = token.match(AMOUNT_SUFFIX_RE);
      if (suffix) {
        const head = suffix[1];
        const amt = parseAmount(suffix[2]);
        const hit = lookup(index, [...pending, head]) || (pending.length ? null : lookup(index, [head]));
        if (hit && amt) {
          pending = [];
          items.push({ name: hit.name, baseName: hit.baseName, data: hit.data, known: true, amount: amt });
          i += 1;
          continue;
        }
        if (amt) {
          pending.push(head);
          flushPending(amt);
          i += 1;
          continue;
        }
      }
      pending.push(token);
      i += 1;
    }
    flushPending();
    return items;
  }

  function scaleFood(item) {
    const data = item.data ? { ...item.data } : null;
    if (!data) {
      return { name: item.name, serving: item.amount ? item.amount.text : undefined };
    }
    const result = { name: item.name, ...data };
    delete result.description; delete result.descriptionEn;
    if (item.name !== item.baseName) { delete result.nameEn; result.baseFood = item.baseName; }
    const amount = item.amount;
    if (!amount) return result;
    const servingMatch = String(data.serving || '').match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    const countMatch = String(data.serving || '').match(new RegExp(`^1\\s*(${COUNT_UNITS.join('|')})`, 'u'));
    let factor = null;
    if (amount.unit && ['g', 'ml'].includes(amount.unit) && servingMatch && servingMatch[2].toLowerCase() === amount.unit) {
      factor = amount.value / Number(servingMatch[1]);
    } else if (amount.unit === 'kg' && servingMatch && servingMatch[2].toLowerCase() === 'g') {
      factor = (amount.value * 1000) / Number(servingMatch[1]);
    } else if (countMatch && (amount.unit === countMatch[1] || !amount.unit)) {
      factor = amount.value;
    }
    if (factor == null || !Number.isFinite(factor) || factor <= 0) {
      // 단위를 바꿀 수 없으면 기준량 그대로 두고 먹은 양만 메모
      result.quantityNote = amount.text;
      return result;
    }
    NUTRIENT_KEYS.forEach(key => {
      if (typeof result[key] === 'number') result[key] = Math.round(result[key] * factor * 10) / 10;
    });
    result.serving = amount.text;
    return result;
  }

  const NUTRIENT_KEYS = ['cal', 'carbs', 'protein', 'fat', 'sugar', 'fiber', 'saturatedFat', 'transFat',
    'cholesterol', 'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'vitaminD', 'vitaminC'];

  /**
   * @param {string} text
   * @param {{ foods?: Array<[string, object, string[]?]>, now?: Date }} options
   * @returns {{ mealId: string, mealExplicit: boolean, recordIntent: boolean, items: Array<object> }}
   */
  function parseQuickEntry(text, options = {}) {
    const raw = String(text || '').trim();
    const foods = options.foods || [];
    const index = buildIndex(foods);
    const meal = detectMeal(raw);
    const recordIntent = INTENT_RE.test(raw) || /\b(ate|had|log|record|add)\b/i.test(raw);
    const date = detectDate(raw, options.now || new Date());
    let body = stripDateWords(stripMealWords(raw));
    body = body
      .replace(/(먹었어요|먹었어|먹었다|먹었음|먹었는데|먹었고|먹은\s*거|먹은것|먹음|마셨어요|마셨어|마셨다|마셨고|마심)/gu, ' ')
      .replace(/(식단에?\s*)?(기록|등록|추가)(해\s*줘|해주세요|해줘|해|할게|할래)?/gu, ' ')
      .replace(/[.!?~]+/g, ' ');
    const chunks = body
      .split(/[,，、;\n+·]|(?:이랑|랑|하고)(?=\s|$)|\s(?:그리고|및|and|with)\s/u)
      .map(part => (part || '').trim())
      .filter(Boolean);
    const items = chunks.flatMap(chunk => parseChunk(chunk, index))
      .filter(item => item.name && item.name.length <= 120)
      .map(item => ({ ...item, food: scaleFood(item) }));
    return {
      mealId: meal ? meal.mealId : mealForTime(options.now || new Date()),
      mealExplicit: Boolean(meal),
      date,
      dateExplicit: Boolean(date),
      recordIntent,
      items,
    };
  }

  const NUTRITION_CORE = ['cal', 'carbs', 'protein', 'fat'];
  const isBlank = value => value === undefined || value === null || value === '' || (typeof value === 'number' && !Number.isFinite(value));
  /** 칼로리·탄수화물·단백질·지방 중 하나라도 비어 있으면 '영양정보 미입력' */
  function isNutritionMissing(food) {
    if (!food) return false;
    return NUTRITION_CORE.some(key => isBlank(food[key]));
  }
  function countNutritionMissing(foods) {
    return (foods || []).filter(isNutritionMissing).length;
  }

  const api = { parseQuickEntry, detectDate, isNutritionMissing, countNutritionMissing, mealForTime, QUICK_ALIASES, NUTRITION_CORE };
  global.RebuildersQuickEntry = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
