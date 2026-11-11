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
    '쌀밥': { name: '밥', base: '밥' },
    '백미밥': { name: '밥', base: '밥' },
    '공기밥': { name: '밥', base: '밥' },
    '흰밥': { name: '밥', base: '밥' },
    '흰쌀밥': { name: '밥', base: '밥' },
  };

  const NUM_WORDS = { '반': 0.5, '한': 1, '하나': 1, '두': 2, '둘': 2, '세': 3, '셋': 3, '네': 4, '넷': 4, '다섯': 5 };
  const COUNT_UNITS = ['공기', '그릇', '개', '잔', '컵', '접시', '조각', '쪽', '봉지', '봉', '팩', '캔', '병', '인분', '스푼', '숟가락', '큰술', '작은술', '한줌', '줌', '장', '알', '줄', '회'];
  const MASS_UNITS = ['kg', 'g', 'ml', 'l'];
  // 커피 기본 사이즈(스타벅스 기준 ml). 그램을 안 적어도 톨/그란데로 양을 남길 수 있게
  const CUP_SIZES = {
    '숏': { value: 237, text: '숏' }, short: { value: 237, text: '숏' },
    '톨': { value: 355, text: '톨' }, tall: { value: 355, text: '톨' },
    '그란데': { value: 473, text: '그란데' }, grande: { value: 473, text: '그란데' },
    '벤티': { value: 591, text: '벤티' }, venti: { value: 591, text: '벤티' },
  };
  const CUP_RE = '숏|톨|그란데|벤티|short|tall|grande|venti';
  const UNIT_RE = [...COUNT_UNITS, ...MASS_UNITS].sort((a, b) => b.length - a.length).join('|');
  const AMOUNT_RE = new RegExp(`^(?:(\\d+(?:\\.\\d+)?)\\s*(${UNIT_RE})?|(반|한|하나|두|둘|세|셋|네|넷|다섯)\\s*(${UNIT_RE})?)$`, 'iu');
  const AMOUNT_SUFFIX_RE = new RegExp(`^(.+?)((?:\\d+(?:\\.\\d+)?\\s*(?:${UNIT_RE}))|(?:(?:반|한|두|세|네|다섯)\\s*(?:${UNIT_RE}))|(?:${CUP_RE})(?:사이즈)?)$`, 'iu');

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

  const unitsApi = () => global.RebuildersUnits;
  const CUP_LABELS = new Set(['숏', '톨', '그란데', '벤티', 'short', 'tall', 'grande', 'venti']);
  function servingLabel(amount, resolved) {
    if (amount && amount.text && CUP_LABELS.has(amount.text)) return amount.text;
    return resolved?.text || amount?.text || '';
  }


  function isStapleHit(hit) {
    const U = unitsApi();
    if (!U) return false;
    return U.isStapleName(hit?.name || hit?.baseName);
  }

  function splitUnknownName(name) {
    const U = unitsApi();
    return U ? U.splitCombinedFoods(name) : [name];
  }


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
    if (m[3] && !m[4] && m[3] !== '반' && m[3] !== '하나' && m[3] !== '둘' && m[3] !== '셋') return null;
    return amountValue(m);
  }

  function parseCupSize(token) {
    const raw = compact(token);
    if (!raw) return null;
    const stripped = raw.replace(/사이즈$/u, '').replace(/(을|를|은|는|이|가|도|만|요)$/u, '');
    const hit = CUP_SIZES[stripped] || CUP_SIZES[raw];
    return hit ? { value: hit.value, unit: 'ml', text: hit.text } : null;
  }

  // 한 칸, 또는 "반"+"공기" / "톨"+"사이즈"처럼 다음 칸까지 이어서 양으로 읽음
  function parseAmountAt(tokens, i) {
    if (i >= tokens.length) return null;
    const cup = parseCupSize(tokens[i]);
    if (cup) return { amount: cup, consumed: 1 };
    if (i + 1 < tokens.length) {
      const two = tokens[i] + tokens[i + 1];
      const joined = parseCupSize(two) || parseAmount(two);
      if (joined && joined.unit) return { amount: joined, consumed: 2 };
    }
    const one = parseAmount(tokens[i]);
    if (one) return { amount: one, consumed: 1 };
    return null;
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

  const TIME_CLOCK_RE = /(?:(오전|아침|am)|(오후|저녁|pm))\s*(\d{1,2})\s*[:：]\s*(\d{2})(?:분)?/iu;
  const TIME_BARE_CLOCK_RE = /(^|[^\d])(\d{1,2})\s*[:：]\s*(\d{2})(?:분)?(?!\d)/u;
  const TIME_SI_RE = /(?:(오전|아침|am)|(오후|저녁|pm))?\s*(\d{1,2})\s*시(?:\s*(반)|\s*(\d{1,2})\s*분)?/iu;

  function padTime(h, m) {
    if (!Number.isFinite(h) || h < 0 || h > 23 || !Number.isFinite(m) || m < 0 || m > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  function hourWithPeriod(hour, afternoon) {
    if (afternoon === true) return hour === 12 ? 12 : hour + 12;
    if (afternoon === false) return hour === 12 ? 0 : hour;
    return hour;
  }

  /** 입력에서 시각을 찾음 → 'HH:MM' 또는 null */
  function detectTime(text) {
    const raw = String(text || '');
    let m = raw.match(TIME_CLOCK_RE);
    if (m) {
      const afternoon = m[2] ? true : (m[1] ? false : null);
      return padTime(hourWithPeriod(Number(m[3]), afternoon), Number(m[4]));
    }
    m = raw.match(TIME_SI_RE);
    if (m) {
      const afternoon = m[2] ? true : (m[1] ? false : null);
      const hour = Number(m[3]);
      const min = m[4] ? 30 : (m[5] != null ? Number(m[5]) : 0);
      // '15시'처럼 24시간제(13~23)는 오전/오후 없이 그대로
      const h = hour >= 13 ? hour : hourWithPeriod(hour, afternoon);
      return padTime(h, min);
    }
    m = raw.match(TIME_BARE_CLOCK_RE);
    if (m) return padTime(Number(m[2]), Number(m[3]));
    return null;
  }

  function stripTimeWords(text) {
    return String(text || '')
      .replace(TIME_CLOCK_RE, ' ')
      .replace(TIME_SI_RE, ' ')
      .replace(TIME_BARE_CLOCK_RE, '$1 ');
  }

  // 홈 끼니 카드와 같게: 11시 전까지 아침, 17시 전까지 점심, 이후 저녁.
  // 간식은 카드에서 끼니 사이 칸이라, 시각만으로 자동 지정하지 않음(사용자가 "간식"이라고 할 때만).
  function mealForTime(date = new Date()) {
    const hour = date.getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 17) return 'lunch';
    return 'dinner';
  }

  // foods: [[name, data, extraNames[]]]
  function buildIndex(foods) {
    const index = new Map();
    const put = (key, entry) => { const k = compact(key); if (k && !index.has(k)) index.set(k, entry); };
    Object.entries(QUICK_ALIASES).forEach(([alias, target]) => {
      const base = foods.find(([name]) => name === target.base);
      if (base) put(alias, { name: target.name, baseName: base[0], data: base[1], fromAlias: true });
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
    return name.replace(/\s+/g, ' ').trim().replace(/(을|를|에|는|은|도|만|요|랑|하고)$/u, '').trim();
  }

  const DRINK_TAILS = '주스|쥬스|스무디|에이드|쉐이크|셰이크|우유';
  const DRINK_NAME_RE = new RegExp(`^(.+?)\\s*(${DRINK_TAILS})$`, 'u');
  const JUNK_NAME_RE = /(?:(?:\d+(?:\.\d+)?)\s*(?:kcal|칼로리).*(바꿔|고쳐|적어|수정)|(?:하나로\s*합쳐|합쳐\s*(?:줘|주세요)|두\s*개\s*따로|따로\s*기록)|(?:방금|아까|그거|이거).*(지워|삭제)|(?:아침|점심|저녁|간식)(?:으로|에)\s*(옮겨|바꿔|넣어)|몇\s*(?:kcal|칼로리)|먹어도\s*(?:돼|되|괜찮)|(?:바꿔|고쳐|적어|합쳐|지워)\s*(?:줘|주세요)\s*$)/u;

  function hasBatchim(char) {
    const c = String(char || '').charCodeAt(0);
    return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
  }

  function isDrinkName(text) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return false;
    const m = raw.match(DRINK_NAME_RE);
    return Boolean(m && cleanUnknown(m[1]));
  }

  function isInstructionText(text) {
    const t = String(text || '').trim();
    if (!t) return false;
    if (global.RebuildersChatIntent?.isInstructionOnly) return RebuildersChatIntent.isInstructionOnly(t);
    if (/[?？]\s*$/.test(t)) return true;
    return JUNK_NAME_RE.test(t);
  }

  function isJunkFoodName(name) {
    const n = String(name || '').trim();
    if (!n) return true;
    if (JUNK_NAME_RE.test(n)) return true;
    if (/^(바꿔|고쳐|적어|합쳐|지워|삭제|옮겨)(?:\s*(줘|주세요))?$/u.test(n)) return true;
    return false;
  }

  function looksLikeKnown(index, name) {
    const raw = cleanUnknown(name);
    if (!raw) return false;
    if (lookup(index, raw.split(/\s+/)) || lookup(index, [raw])) return true;
    if (unitsApi()?.isStapleName(raw)) return true;
    return false;
  }

  /* 와/과 조사로만 나눔. '사과 주스'의 '과'는 음절이라 나누지 않음. 'A와 B 주스'는 한 덩어리. */
  function splitFoodChunks(body) {
    const s = String(body || '');
    if (!s.trim()) return [];
    const delimRe = /[,，、;\n+·]|(?:이랑|랑|하고)(?=\s|$)|(?<=\s)(?:그리고|및|and|with)\s/gu;
    const particleRe = /와(?=\s|$)|과(?=\s|$)/gu;
    const cuts = [];
    const pushCut = (index, len) => { cuts.push({ index, len }); };
    let m;
    const delimCopy = new RegExp(delimRe.source, 'gu');
    while ((m = delimCopy.exec(s))) pushCut(m.index, m[0].length);
    while ((m = particleRe.exec(s))) {
      const ch = m[0][0];
      const prev = m.index > 0 ? s[m.index - 1] : '';
      if (ch === '과' && !hasBatchim(prev)) continue;
      const start = cuts.filter(c => c.index < m.index).reduce((acc, c) => Math.max(acc, c.index + c.len), 0);
      const afterStart = m.index + m[0].length;
      const rest = s.slice(afterStart);
      const next = rest.search(new RegExp('(?:' + delimRe.source + ')|(?:' + particleRe.source + ')', 'u'));
      const beforeChunk = s.slice(start, m.index);
      const afterChunk = next < 0 ? rest : rest.slice(0, next);
      const joined = `${beforeChunk}와 ${afterChunk}`.replace(/\s+/g, ' ').trim();
      if (isDrinkName(joined) || isDrinkName(`${beforeChunk} ${afterChunk}`.replace(/\s+/g, ' ').trim())) continue;
      pushCut(m.index, m[0].length);
    }
    cuts.sort((a, b) => a.index - b.index);
    const parts = [];
    let at = 0;
    for (const cut of cuts) {
      if (cut.index < at) continue;
      const part = s.slice(at, cut.index).trim();
      if (part) parts.push(part);
      at = cut.index + cut.len;
    }
    const tail = s.slice(at).trim();
    if (tail) parts.push(tail);
    return parts.length ? parts : (s.trim() ? [s.trim()] : []);
  }

  function parseChunk(chunk, index, options = {}) {
    const keepProduct = options.keepProduct !== false;
    const tokens = chunk.split(/\s+/).filter(Boolean).filter(tok => !FILLER_WORDS.has(tok.toLowerCase()));
    const items = [];
    const flags = { skippedUnknownAmount: false };
    let pending = [];
    const pushUnknown = (name, amount = null) => {
      splitUnknownName(name).forEach((part, i, parts) => {
        const amt = i === parts.length - 1 ? amount : null;
        const hit = lookup(index, [part]);
        if (hit) items.push({ name: hit.name, baseName: hit.baseName, data: hit.data, known: true, amount: amt });
        else items.push({ name: part, known: false, amount: amt });
      });
    };
    const flushPending = (amount = null) => {
      if (!pending.length) return;
      const name = cleanUnknown(pending.join(' '));
      pending = [];
      if (name) pushUnknown(name, amount);
    };
    const restKnownOrAlias = (from) => {
      if (from >= tokens.length) return false;
      const slice = tokens.slice(from);
      for (let len = Math.min(4, slice.length); len >= 1; len -= 1) {
        const hit = lookup(index, slice.slice(0, len));
        if (hit) return true;
      }
      return looksLikeKnown(index, slice[0]);
    };
    let i = 0;
    while (i < tokens.length) {
      let matched = null;
      for (let len = Math.min(4, tokens.length - i); len >= 1; len -= 1) {
        const hit = lookup(index, tokens.slice(i, i + len));
        if (hit) { matched = { hit, len }; break; }
      }
      if (matched) {
        if (pending.length && isStapleHit(matched.hit) && !unitsApi()?.isCompoundDish(cleanUnknown([...pending, ...tokens.slice(i, i + matched.len)].join(' ')))) {
          flushPending();
        } else if (pending.length && !matched.hit.fromAlias) {
          pending.push(...tokens.slice(i, i + matched.len));
          i += matched.len;
          continue;
        }
        flushPending();
        const item = { name: matched.hit.name, baseName: matched.hit.baseName, data: matched.hit.data, known: true, amount: null };
        i += matched.len;
        const found = parseAmountAt(tokens, i);
        if (found) { item.amount = found.amount; i += found.consumed; }
        items.push(item);
        continue;
      }
      const token = tokens[i];
      const found = parseAmountAt(tokens, i);
      if (found) {
        const restExists = i + found.consumed < tokens.length;
        const pendingName = cleanUnknown(pending.join(' '));
        const pendingKnown = pending.length && looksLikeKnown(index, pendingName);
        if (keepProduct && pending.length && restExists && !pendingKnown) {
          pending.push(...tokens.slice(i, i + found.consumed));
          flags.skippedUnknownAmount = true;
          i += found.consumed;
          continue;
        }
        if (pending.length) flushPending(found.amount);
        else if (items.length && !items[items.length - 1].amount) items[items.length - 1].amount = found.amount;
        i += found.consumed;
        continue;
      }
      const suffix = token.match(AMOUNT_SUFFIX_RE);
      if (suffix) {
        const head = suffix[1];
        const amt = parseCupSize(suffix[2]) || parseAmount(suffix[2]);
        const hit = lookup(index, [...pending, head]) || (pending.length ? null : lookup(index, [head]));
        const restExists = i + 1 < tokens.length;
        const headKnown = Boolean(hit) || looksLikeKnown(index, cleanUnknown([...pending, head].join(' ')));
        if (amt && keepProduct && restExists && !headKnown && !restKnownOrAlias(i + 1)) {
          pending.push(token);
          flags.skippedUnknownAmount = true;
          i += 1;
          continue;
        }
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
    return { items, skippedUnknownAmount: flags.skippedUnknownAmount };
  }


  function itemsFromChunk(chunk, index) {
    const raw = String(chunk || '').replace(/\s+/g, ' ').trim();
    if (!raw) return { items: [], ambiguous: null };
    const tokens = raw.split(/\s+/).filter(Boolean);
    let trailing = null;
    let nameTokens = tokens.slice();
    const endAmt2 = tokens.length >= 2 ? parseAmountAt(tokens, tokens.length - 2) : null;
    const endAmt = parseAmountAt(tokens, tokens.length - 1);
    if (endAmt2 && endAmt2.consumed === 2) {
      trailing = endAmt2.amount;
      nameTokens = tokens.slice(0, tokens.length - 2);
    } else if (endAmt && endAmt.consumed === 1) {
      trailing = endAmt.amount;
      nameTokens = tokens.slice(0, tokens.length - 1);
    } else if (tokens.length) {
      const last = tokens[tokens.length - 1];
      const suffix = last.match(AMOUNT_SUFFIX_RE);
      if (suffix) {
        const amt = parseCupSize(suffix[2]) || parseAmount(suffix[2]);
        if (amt && suffix[1]) {
          trailing = amt;
          nameTokens = tokens.slice(0, -1).concat(suffix[1]);
        }
      }
    }
    const wholeName = cleanUnknown(nameTokens.join(' '));
    if (!wholeName) return { items: [], ambiguous: null };

    const wholeHit = lookup(index, nameTokens) || lookup(index, [wholeName]);
    if (wholeHit) {
      return { items: [{ name: wholeHit.name, baseName: wholeHit.baseName, data: wholeHit.data, known: true, amount: trailing }], ambiguous: null };
    }
    if (isDrinkName(wholeName)) {
      return { items: [{ name: wholeName, known: false, amount: trailing }], ambiguous: null };
    }
    const stapleParts = splitUnknownName(wholeName);
    if (stapleParts.length > 1) {
      const items = stapleParts.map((part, i, list) => {
        const amount = i === list.length - 1 ? trailing : null;
        const hit = lookup(index, [part]);
        if (hit) return { name: hit.name, baseName: hit.baseName, data: hit.data, known: true, amount };
        return { name: part, known: false, amount };
      });
      return { items, ambiguous: null };
    }

    const conservative = parseChunk(raw, index, { keepProduct: true });
    const aggressive = parseChunk(raw, index, { keepProduct: false });
    if (conservative.skippedUnknownAmount && aggressive.items.length > 1 && conservative.items.length === 1) {
      return {
        items: conservative.items,
        ambiguous: { phrase: wholeName, one: conservative.items, two: aggressive.items },
      };
    }
    return { items: conservative.items, ambiguous: null };
  }

  // 기준(basis)량 g: "100g" → 100. 없으면 serving 이 "NNg" 이면 그 값
  function basisGrams(data) {
    const m = String(data.basis || data.serving || '').match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    return m ? Number(m[1]) : null;
  }
  // 한 개(알·조각…)의 무게 g: 단위 표·DB 의 unitGrams·"1개 60g" 문구. 없으면 null
  function unitGramsFor(data, unit, foodName) {
    const U = unitsApi();
    if (U) {
      const hit = U.gramsForUnit(foodName || data?.name, unit, data);
      if (hit) return hit;
    }
    const table = data.unitGrams && typeof data.unitGrams === 'object' ? data.unitGrams : null;
    if (table) {
      if (unit && Number(table[unit]) > 0) return { unit, grams: Number(table[unit]) };
      if (!unit) { const [u, g] = Object.entries(table)[0] || []; if (Number(g) > 0) return { unit: u, grams: Number(g) }; }
    }
    const m = String(data.serving || '').match(new RegExp(`^1\\s*(${COUNT_UNITS.join('|')})\\s+(\\d+(?:\\.\\d+)?)\\s*g$`, 'u'));
    if (m && (!unit || unit === m[1])) return { unit: m[1], grams: Number(m[2]) };
    return null;
  }

  function scaleFood(item) {
    const data = item.data ? { ...item.data } : null;
    const U = unitsApi();
    if (!data) {
      const result = { name: item.name };
      if (item.amount) {
        result.serving = item.amount.text;
        result.servingAmount = item.amount.value;
        result.servingUnit = item.amount.unit || undefined;
        if (U && item.amount.unit) {
          const resolved = U.resolveAmount(item.name, item.amount.value, item.amount.unit, null);
          if (resolved) {
            result.serving = servingLabel(item.amount, resolved);
            result.servingAmount = resolved.value;
            result.servingUnit = resolved.unit;
            if (resolved.grams != null) result.servingGrams = resolved.grams;
            result.servingGramsEstimated = Boolean(resolved.estimated);
          }
        } else if (item.amount.unit === 'ml') {
          result.servingAmount = item.amount.value;
          result.servingUnit = 'ml';
        }
      }
      return result;
    }
    const result = { name: item.name, ...data };
    delete result.description; delete result.descriptionEn;
    if (item.name !== item.baseName) { delete result.nameEn; result.baseFood = item.baseName; }
    const foodName = item.baseName || item.name;
    if (U) {
      const withBasis = U.attachBasis(result, data);
      let amount = item.amount;
      if (!amount) {
        const typ = U.typicalServing(foodName, data);
        if (typ) amount = typ;
      } else if (amount.unit === '접시' || amount.unit) {
        amount = { value: amount.value, unit: amount.unit, text: amount.text };
      }
      if (!amount) return withBasis;
      const scaled = U.applyAmount(withBasis, amount, data);
      if (item.amount && CUP_LABELS.has(item.amount.text)) scaled.serving = item.amount.text;
      return scaled;
    }
    const basisG = basisGrams(data);
    let amount = item.amount;
    if (!amount && basisG && data.unitGrams) {
      const u = unitGramsFor(data, null, foodName);
      if (u) amount = { value: 1, unit: u.unit, text: `1${u.unit}` };
    }
    if (!amount) return result;
    const servingMatch = String(data.serving || '').match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    const countMatch = String(data.serving || '').match(new RegExp(`^1\\s*(${COUNT_UNITS.join('|')})`, 'u'));
    const isCount = !amount.unit || COUNT_UNITS.includes(amount.unit);
    let factor = null;
    let grams = null;
    if (amount.unit && ['g', 'ml'].includes(amount.unit) && servingMatch && servingMatch[2].toLowerCase() === amount.unit) {
      factor = amount.value / Number(servingMatch[1]);
    } else if (amount.unit === 'kg' && servingMatch && servingMatch[2].toLowerCase() === 'g') {
      factor = (amount.value * 1000) / Number(servingMatch[1]);
    } else if (isCount && basisG && unitGramsFor(data, amount.unit || null, foodName)) {
      const u = unitGramsFor(data, amount.unit || null, foodName);
      grams = Math.round(amount.value * u.grams * 10) / 10;
      factor = grams / basisG;
      if (!amount.unit) amount = { ...amount, unit: u.unit, text: `${amount.value}${u.unit}` };
    } else if (countMatch && (amount.unit === countMatch[1] || !amount.unit)) {
      factor = amount.value;
    }
    if (factor == null || !Number.isFinite(factor) || factor <= 0) {
      result.quantityNote = amount.text;
      return result;
    }
    NUTRIENT_KEYS.forEach(key => {
      if (typeof result[key] === 'number') result[key] = Math.round(result[key] * factor * 10) / 10;
    });
    result.serving = amount.text;
    if (grams != null) {
      result.servingAmount = amount.value;
      result.servingUnit = amount.unit;
      result.servingGrams = grams;
    }
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
    const time = detectTime(raw);
    const empty = {
      mealId: meal ? meal.mealId : mealForTime(options.now || new Date()),
      mealExplicit: Boolean(meal),
      date,
      dateExplicit: Boolean(date),
      time,
      timeExplicit: Boolean(time),
      recordIntent,
      items: [],
      ambiguous: null,
    };
    if (isInstructionText(raw)) return empty;
    let body = stripTimeWords(stripDateWords(stripMealWords(raw)));
    body = body
      .replace(/(먹었어요|먹었어|먹었다|먹었음|먹었는데|먹었고|먹은\s*거|먹은것|먹음|마셨어요|마셨어|마셨다|마셨고|마심)/gu, ' ')
      .replace(/(식단에?\s*)?(기록|등록|추가)(해\s*줘|해주세요|해줘|해|할게|할래)?/gu, ' ')
      .replace(/[.!~]+/g, ' ');
    // 물음표는 질문으로 보고 음식으로 나누지 않음(? 는 위에서 isInstructionText가 처리. 남아 있으면 공백)
    body = body.replace(/[?？]/g, ' ');
    const chunks = splitFoodChunks(body);
    const ambiguous = [];
    const items = chunks.flatMap(chunk => {
      const parsed = itemsFromChunk(chunk, index);
      if (parsed.ambiguous) ambiguous.push(parsed.ambiguous);
      return parsed.items;
    })
      .filter(item => item.name && item.name.length <= 120 && !isJunkFoodName(item.name))
      .map(item => ({ ...item, food: scaleFood(item) }));
    return {
      ...empty,
      recordIntent,
      items,
      ambiguous: ambiguous.length === 1 ? ambiguous[0] : (ambiguous.length ? ambiguous : null),
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

  const api = { parseQuickEntry, detectDate, detectTime, isNutritionMissing, countNutritionMissing, mealForTime, parseAmountAt, parseCupSize, scaleFood, isDrinkName, isInstructionText, splitFoodChunks, QUICK_ALIASES, CUP_SIZES, NUTRITION_CORE };
  global.RebuildersQuickEntry = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
