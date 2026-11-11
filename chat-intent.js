/* 채팅 의도: 질문·수정·확인 답을 음식 이름과 구분합니다. DOM·저장소에 의존하지 않는 순수 함수입니다. */
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

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
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

  const api = {
    classifyChat,
    isQuestion,
    isInstructionOnly,
    parseEditIntent,
    parseClarifyReply,
    extractFoodHint,
    mealIdFrom,
  };
  global.RebuildersChatIntent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
