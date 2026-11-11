/* 단위 → 평균 무게 표.
   영양성분표(보통 100g)는 기준이고, 기록에는 실제로 먹은 양만큼 환산한 값을 보여 줍니다.
   공식·표준이 있으면 그걸 쓰고, 없으면 estimated:true(표시는 '추정'). */
(function rebuildersUnits(global) {
  'use strict';

  const NUTRIENT_KEYS = ['cal', 'carbs', 'protein', 'fat', 'sugar', 'fiber', 'saturatedFat', 'transFat',
    'cholesterol', 'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'vitaminD', 'vitaminC'];

  const compact = value => String(value || '').toLowerCase().replace(/\s+/g, '');

  // 한국에서 흔히 쓰는 단위. 컵·큰술·작은술은 한국 계량(200ml / 15ml / 5ml).
  const GENERIC_UNITS = {
    '개': { step: 1, kind: 'count' },
    '알': { step: 1, kind: 'count' },
    '조각': { step: 1, kind: 'count', grams: 100, estimated: true },
    '쪽': { step: 1, kind: 'count', grams: 20, estimated: true },
    '장': { step: 1, kind: 'count', grams: 20, estimated: true },
    '줄': { step: 1, kind: 'count', grams: 20, estimated: true },
    '공기': { step: 0.5, kind: 'count', grams: 210, official: true, source: '한국 상용 밥 1공기 210g' },
    '그릇': { step: 0.5, kind: 'count', grams: 400, estimated: true },
    '접시': { step: 0.5, kind: 'count', grams: 150, estimated: true },
    '인분': { step: 0.5, kind: 'count', grams: 400, estimated: true },
    '컵': { step: 0.5, kind: 'volume', ml: 200, grams: 200, official: true, source: '한국 계량컵 200ml' },
    '잔': { step: 0.5, kind: 'volume', ml: 355, grams: 355, estimated: true, source: '커피 톨 355ml' },
    '봉': { step: 1, kind: 'count', grams: 20, estimated: true },
    '봉지': { step: 1, kind: 'count', grams: 20, estimated: true },
    '팩': { step: 1, kind: 'count', grams: 100, estimated: true },
    '캔': { step: 1, kind: 'volume', ml: 355, grams: 355, estimated: true },
    '병': { step: 1, kind: 'volume', ml: 500, grams: 500, estimated: true },
    '큰술': { step: 1, kind: 'volume', ml: 15, grams: 15, official: true, source: '한국 계량 큰술 15ml' },
    '스푼': { step: 1, kind: 'volume', ml: 15, grams: 15, official: true, source: '큰술과 같음' },
    '숟가락': { step: 1, kind: 'volume', ml: 15, grams: 15, official: true, source: '큰술과 같음' },
    '작은술': { step: 1, kind: 'volume', ml: 5, grams: 5, official: true, source: '한국 계량 작은술 5ml' },
    '줌': { step: 1, kind: 'count', grams: 20, estimated: true },
    '한줌': { step: 1, kind: 'count', grams: 20, estimated: true },
    '회': { step: 1, kind: 'count' },
    'g': { step: 10, kind: 'mass', grams: 1 },
    'ml': { step: 10, kind: 'volume', ml: 1, grams: 1 },
    'kg': { step: 0.1, kind: 'mass', grams: 1000 },
    'l': { step: 0.1, kind: 'volume', ml: 1000, grams: 1000 },
  };

  // 음식별 한 단위 무게·흔한 1회 양. official 이 아니면 추정.
  const FOOD_UNITS = {
    '토마토': {
      units: { '개': { grams: 123, official: true, source: 'USDA FDC 170457 medium 123g' }, '알': { grams: 123, official: true, source: 'USDA medium 123g' } },
      typical: { value: 1, unit: '개' },
      plateCount: 3,
    },
    '방울토마토': {
      units: { '개': { grams: 17, official: true, source: 'USDA cherry tomato ~17g' }, '알': { grams: 17, official: true, source: 'USDA cherry tomato ~17g' } },
      typical: { value: 1, unit: '접시' },
      plateCount: 15,
    },
    '삶은 달걀': {
      units: { '개': { grams: 50, official: true, source: 'USDA FDC 173424 1 large = 50g' }, '알': { grams: 50, official: true, source: 'USDA 1 large = 50g' } },
      typical: { value: 1, unit: '개' },
    },
    '바나나': {
      units: { '개': { grams: 118, official: true, source: 'USDA FDC 173944 medium 118g' } },
      typical: { value: 1, unit: '개' },
    },
    '사과': {
      units: { '개': { grams: 182, official: true, source: 'USDA FDC 171688 medium 182g' } },
      typical: { value: 1, unit: '개' },
    },
    '귤': {
      units: { '개': { grams: 88, official: true, source: 'USDA mandarin/tangerine medium 88g' } },
      typical: { value: 1, unit: '개' },
    },
    '그릭요거트': {
      units: { '회': { grams: 100, estimated: true }, '개': { grams: 100, estimated: true }, '컵': { grams: 200, official: true, source: '계량컵 200ml, 요거트 밀도 약 1g/ml' } },
      typical: { value: 1, unit: '회' },
    },
    '믹스너트': {
      units: { '봉': { grams: 20, estimated: true }, '봉지': { grams: 20, estimated: true }, '줌': { grams: 20, estimated: true }, '한줌': { grams: 20, estimated: true }, '개': { grams: 20, estimated: true } },
      typical: { value: 1, unit: '봉' },
    },
    '비스킷': {
      units: { '개': { grams: 8, estimated: true } },
      typical: { value: 1, unit: '개' },
    },
    '비스코프': {
      units: { '개': { grams: 8, estimated: true } },
      typical: { value: 1, unit: '개' },
    },
    '김치찌개': {
      units: { '그릇': { grams: 400, estimated: true }, '인분': { grams: 400, estimated: true } },
      typical: { value: 1, unit: '그릇' },
    },
    '밥': {
      units: { '공기': { grams: 210, official: true, source: '한국 상용 밥 1공기 210g' }, '그릇': { grams: 210, official: true, source: '1공기와 같음' } },
      typical: { value: 1, unit: '공기' },
    },
    '현미밥': {
      units: { '공기': { grams: 210, official: true, source: '한국 상용 밥 1공기 210g' }, '그릇': { grams: 210, official: true, source: '1공기와 같음' } },
      typical: { value: 1, unit: '공기' },
    },
    '아메리카노': {
      units: { '잔': { ml: 355, grams: 355, estimated: true, source: '톨 355ml' }, '컵': { ml: 200, grams: 200, official: true, source: '한국 계량컵 200ml' } },
      typical: { value: 1, unit: '잔' },
    },
    '딸기': {
      units: { '개': { grams: 12, official: true, source: 'USDA strawberry medium ~12g' }, '알': { grams: 12, official: true, source: 'USDA medium ~12g' } },
      typical: { value: 8, unit: '개' },
    },
    '아보카도': {
      units: { '개': { grams: 150, official: true, source: 'USDA avocado 1 fruit ~150g edible' } },
      typical: { value: 0.5, unit: '개' },
    },
    '블루베리': {
      units: { '개': { grams: 2, estimated: true }, '알': { grams: 2, estimated: true }, '컵': { grams: 150, estimated: true } },
      typical: { value: 1, unit: '컵' },
    },
    '햄버거': {
      units: { '개': { grams: 100, official: true, source: '내장 DB 1개 100g' } },
      typical: { value: 1, unit: '개' },
    },
    '피자': {
      units: { '조각': { grams: 100, official: true, source: '내장 DB 1조각 100g' } },
      typical: { value: 1, unit: '조각' },
    },
    '프로틴바': {
      units: { '개': { grams: 60, official: true, source: '내장 DB 1개 60g' } },
      typical: { value: 1, unit: '개' },
    },
    '도넛': {
      units: { '개': { grams: 60, estimated: true } },
      typical: { value: 1, unit: '개' },
    },
    '케이크': {
      units: { '조각': { grams: 80, estimated: true }, '개': { grams: 80, estimated: true } },
      typical: { value: 1, unit: '조각' },
    },
    '아몬드': {
      units: { '개': { grams: 1.2, official: true, source: 'USDA almond ~1.2g' }, '줌': { grams: 20, estimated: true }, '한줌': { grams: 20, estimated: true }, '봉': { grams: 20, estimated: true } },
      typical: { value: 1, unit: '한줌' },
    },
    '두부': {
      units: { '모': { grams: 300, estimated: true }, '개': { grams: 100, estimated: true } },
      typical: { value: 1, unit: '개' },
    },
  };

  const NAME_ALIASES = {
    '쌀밥': '밥', '백미밥': '밥', '공기밥': '밥', '흰밥': '밥', '흰쌀밥': '밥',
    '계란': '삶은 달걀', '달걀': '삶은 달걀', '삶은계란': '삶은 달걀', '삶은달걀': '삶은 달걀',
    '요거트': '그릭요거트', '그릭 요거트': '그릭요거트',
    '아이스아메리카노': '아메리카노', '아이스 아메리카노': '아메리카노',
    '믹스 너트': '믹스너트', '견과믹스': '믹스너트', '견과류': '믹스너트',
    'lotus 비스코프': '비스코프', 'lotus biscoff': '비스코프', 'biscoff': '비스코프',
    '로투스 비스코프': '비스코프', '로투스비스코프': '비스코프',
    '로투스 비스코프 오리지널': '비스코프', '로투스 비스코프 오리지널 쿠키': '비스코프',
    'lotus biscoff original': '비스코프', 'lotus biscoff original cookie': '비스코프',
    '참치김치찌개': '김치찌개',
  };

  const STAPLE_NAMES = ['밥', '쌀밥', '백미밥', '공기밥', '흰밥', '흰쌀밥', '현미밥', '잡곡밥', '보리밥'];
  const STAPLE_ALT = STAPLE_NAMES.slice().sort((a, b) => b.length - a.length).join('|');
  const COMPOUND_DISH_RE = /(볶음밥|비빔밥|덮밥|김밥|주먹밥|초밥|카레밥|오므라이스|리조또|국밥|컵밥|주먹김|김초밥)$/u;

  function canonicalFoodName(name) {
    const raw = String(name || '').trim();
    if (!raw) return '';
    const hit = NAME_ALIASES[raw] || NAME_ALIASES[compact(raw)];
    return hit || raw;
  }

  function lookupFood(name) {
    const canon = canonicalFoodName(name);
    return FOOD_UNITS[canon] || FOOD_UNITS[compact(canon)] || null;
  }

  function isStapleName(name) {
    const c = compact(canonicalFoodName(name));
    return STAPLE_NAMES.some(s => compact(s) === c);
  }

  function isCompoundDish(name) {
    const c = compact(name);
    return COMPOUND_DISH_RE.test(c);
  }

  function stepFor(unit) {
    const info = GENERIC_UNITS[unit] || GENERIC_UNITS[String(unit || '').toLowerCase()];
    return info && Number(info.step) > 0 ? info.step : 1;
  }

  // −/+ : 개·조각은 1 아래를 0.5 → 0.25로 내릴 수 있게. g는 최소 1.
  function nudgeAmount(unit, current, dir) {
    const u = String(unit || '개');
    const cur = Number(current);
    const base = Number.isFinite(cur) && cur > 0 ? cur : stepFor(u);
    const sign = dir < 0 ? -1 : 1;
    if (isMassUnit(u)) {
      const step = stepFor(u);
      const next = Math.round((base + sign * step) * 100) / 100;
      const min = (u === 'kg' || u === 'l') ? 0.1 : 1;
      return Math.max(min, next);
    }
    if (sign > 0) {
      if (base < 0.25) return 0.25;
      if (base < 0.5) return 0.5;
      if (base < 1) return 1;
      const step = stepFor(u);
      return Math.round((base + step) * 100) / 100;
    }
    if (base > 1) {
      const step = stepFor(u);
      const next = Math.round((base - step) * 100) / 100;
      return Math.max(0.25, next);
    }
    if (base > 0.5) return 0.5;
    if (base > 0.25) return 0.25;
    return 0.25;
  }

  function isMassUnit(unit) {
    return ['g', 'kg', 'ml', 'l'].includes(String(unit || '').toLowerCase());
  }

  function gramsForUnit(foodName, unit, data) {
    if (!unit) return null;
    const u = String(unit);
    const lower = u.toLowerCase();
    if (lower === 'g' || lower === 'ml') return { grams: 1, unit: lower, estimated: false };
    if (lower === 'kg' || lower === 'l') return { grams: 1000, unit: lower, estimated: false };

    // 이 기록에 적힌 한 개 무게가 있으면 표를 덮어쓰지 않음(직접 고친 양·제품 무게).
    const table = data && data.unitGrams && typeof data.unitGrams === 'object' ? data.unitGrams : null;
    if (table && Number(table[u]) > 0) return { grams: Number(table[u]), unit: u, estimated: Boolean(data.servingGramsEstimated) };
    if (data && String(data.servingUnit || '') === u && Number(data.servingGrams) > 0 && Number(data.servingAmount) > 0) {
      return {
        grams: Number(data.servingGrams) / Number(data.servingAmount),
        unit: u,
        estimated: Boolean(data.servingGramsEstimated),
      };
    }
    const food = lookupFood(foodName);
    if (food && food.units && food.units[u] && Number(food.units[u].grams) > 0) {
      return { grams: Number(food.units[u].grams), unit: u, estimated: !food.units[u].official, source: food.units[u].source };
    }
    const generic = GENERIC_UNITS[u] || GENERIC_UNITS[lower];
    if (generic && Number(generic.grams) > 0) {
      return { grams: Number(generic.grams), unit: u, estimated: !generic.official, source: generic.source };
    }
    return null;
  }

  function plateCountFor(foodName) {
    const n = lookupFood(foodName)?.plateCount;
    return Number(n) > 0 ? Number(n) : null;
  }

  function typicalServing(foodName, data) {
    const food = lookupFood(foodName);
    if (food && food.typical) {
      return resolveAmount(foodName, food.typical.value, food.typical.unit, data);
    }
    const one = String(data?.serving || '').match(/^1\s*([가-힣A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*g$/u);
    if (one) return resolveAmount(foodName, 1, one[1], { ...data, unitGrams: { ...(data?.unitGrams || {}), [one[1]]: Number(one[2]) } });
    if (data?.unitGrams && typeof data.unitGrams === 'object') {
      const [u, g] = Object.entries(data.unitGrams).find(([, v]) => Number(v) > 0) || [];
      if (u) return resolveAmount(foodName, 1, u, data);
    }
    const sm = String(data?.serving || '').match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    if (sm && Number(sm[1]) !== 100) {
      return { value: Number(sm[1]), unit: sm[2].toLowerCase(), text: `${trimNum(sm[1])}${sm[2].toLowerCase()}`, grams: Number(sm[1]), estimated: false };
    }
    return null;
  }

  function trimNum(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? '');
    const t = Math.round(n * 100) / 100;
    return Number.isInteger(t) ? String(t) : String(t);
  }

  function resolveAmount(foodName, value, unit, data) {
    let v = Number(value);
    let u = unit || '';
    if (!Number.isFinite(v) || v <= 0) return null;
    if (!u) {
      const typ = lookupFood(foodName)?.typical?.unit;
      const table = data && data.unitGrams && typeof data.unitGrams === 'object' ? data.unitGrams : null;
      const fromTable = table && Object.keys(table).find(key => Number(table[key]) > 0);
      u = typ || fromTable || '';
      if (!u) return null;
    }
    let estimated = false;
    if (u === '접시') {
      const count = plateCountFor(foodName);
      const per = gramsForUnit(foodName, '개', data);
      if (count && per) {
        v = Math.round(v * count * 100) / 100;
        u = '개';
        estimated = per.estimated;
      }
    }
    const per = gramsForUnit(foodName, u, data);
    let grams = null;
    if (isMassUnit(u)) {
      const mul = (u === 'kg' || u === 'l') ? 1000 : 1;
      grams = v * mul;
    } else if (per) {
      grams = v * per.grams;
      estimated = estimated || per.estimated;
    }
    const text = v === 0.5 && !isMassUnit(u) ? `반${u}` : `${trimNum(v)}${u}`;
    return {
      value: v,
      unit: u,
      text,
      grams: grams != null ? Math.round(grams * 10) / 10 : null,
      estimated: Boolean(estimated),
    };
  }

  function formatAmount(amount, options = {}) {
    if (!amount || amount.value == null || !amount.unit) return '';
    const primary = amount.value === 0.5 && !isMassUnit(amount.unit) ? `반${amount.unit}` : `${trimNum(amount.value)}${amount.unit}`;
    const grams = amount.grams;
    const estimated = Boolean(amount.estimated || options.estimated);
    if (grams != null && !isMassUnit(amount.unit)) {
      return estimated ? `${primary} (${trimNum(grams)}g 추정)` : `${primary} (${trimNum(grams)}g)`;
    }
    return primary;
  }

  function parseServing(text) {
    const raw = String(text || '').trim();
    if (!raw) return null;
    const cup = { '숏': 237, short: 237, '톨': 355, tall: 355, '그란데': 473, grande: 473, '벤티': 591, venti: 591 };
    const compactRaw = compact(raw).replace(/사이즈$/u, '');
    if (cup[compactRaw] || cup[raw]) {
      const ml = cup[compactRaw] || cup[raw];
      const label = ['숏', '톨', '그란데', '벤티'].find(k => compact(k) === compactRaw) || raw;
      return { value: ml, unit: 'ml', text: label, grams: ml, estimated: false };
    }
    const m = raw.match(/^((?:\d+\/\d+)|(?:\d+(?:\.\d+)?)|반|한|하나|두|둘|½|¼|¾)\s*([가-힣A-Za-z]+)?(?:\s*[·(]?\s*(\d+(?:\.\d+)?)\s*g)?/u);
    if (!m) return null;
    const words = { '반': 0.5, '한': 1, '하나': 1, '두': 2, '둘': 2, '½': 0.5, '¼': 0.25, '¾': 0.75, '1/2': 0.5, '1/4': 0.25, '3/4': 0.75 };
    let value;
    if (words[m[1]] != null) value = words[m[1]];
    else if (m[1].includes('/')) {
      const [a, b] = m[1].split('/').map(Number);
      value = b ? a / b : NaN;
    } else value = Number(m[1]);
    const unit = (m[2] || (String(raw).toLowerCase().includes('ml') ? 'ml' : 'g')).replace(/추정$/u, '');
    if (!Number.isFinite(value) || value <= 0) return null;
    const grams = m[3] ? Number(m[3]) : null;
    return { value, unit, text: `${trimNum(value)}${unit}`, grams };
  }

  function pickNutrients(src) {
    const nutrients = {};
    NUTRIENT_KEYS.forEach(key => { if (typeof src[key] === 'number') nutrients[key] = src[key]; });
    return nutrients;
  }

  function getBasis(food) {
    if (!food) return null;
    if (food.basisNutrients && Number(food.basisGrams) > 0) {
      return { nutrients: food.basisNutrients, grams: Number(food.basisGrams), label: food.basis || `${food.basisGrams}g` };
    }
    if (food.basisNutrients && Number(food.basisAmount) > 0 && food.basisUnit) {
      return {
        nutrients: food.basisNutrients,
        amount: Number(food.basisAmount),
        unit: food.basisUnit,
        grams: null,
        label: food.basis || `${trimNum(food.basisAmount)}${food.basisUnit}`,
      };
    }
    if (Number(food.servingGrams) > 0) {
      const nutrients = {};
      let any = false;
      NUTRIENT_KEYS.forEach(key => {
        if (typeof food[key] === 'number') { nutrients[key] = food[key] * (100 / Number(food.servingGrams)); any = true; }
      });
      if (any) return { nutrients, grams: 100, label: '100g', inferred: true };
    }
    const label = String(food.basis || food.serving || '');
    const m = label.match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    if (m && Number(m[1]) > 0) {
      const grams = Number(m[1]);
      const nutrients = pickNutrients(food);
      if (Object.keys(nutrients).length) return { nutrients, grams, label: `${trimNum(grams)}${m[2].toLowerCase()}` };
    }
    return null;
  }

  function attachBasis(food, data) {
    const next = { ...food };
    const src = data || food;
    if (next.basisNutrients && Number(next.basisGrams) > 0) return next;
    if (next.basisNutrients && Number(next.basisAmount) > 0 && next.basisUnit) return next;
    const nutrients = pickNutrients(src);
    if (!Object.keys(nutrients).length) return next;
    const m = String(src.basis || src.serving || '').match(/^(\d+(?:\.\d+)?)\s*(g|ml)$/i);
    if (m && Number(m[1]) > 0) {
      next.basisNutrients = nutrients;
      next.basisGrams = Number(m[1]);
      next.basis = src.basis || `${trimNum(m[1])}${m[2].toLowerCase()}`;
      return next;
    }
    if (Number(src.servingGrams) > 0) {
      next.basisNutrients = nutrients;
      next.basisGrams = Number(src.servingGrams);
      next.basis = `${trimNum(src.servingGrams)}g`;
      return next;
    }
    if (Number(src.servingAmount) > 0 && src.servingUnit) {
      next.basisNutrients = nutrients;
      next.basisAmount = Number(src.servingAmount);
      next.basisUnit = src.servingUnit;
      next.basis = src.serving || `${trimNum(src.servingAmount)}${src.servingUnit}`;
      return next;
    }
    const parsed = parseServing(src.serving || src.quantityNote || '');
    if (parsed && Number(parsed.value) > 0 && parsed.unit) {
      next.basisNutrients = nutrients;
      if (isMassUnit(parsed.unit)) {
        const grams = parsed.grams != null ? parsed.grams : (parsed.unit === 'kg' || parsed.unit === 'l' ? parsed.value * 1000 : parsed.value);
        next.basisGrams = grams;
        next.basis = `${trimNum(grams)}${parsed.unit === 'ml' || parsed.unit === 'l' ? 'ml' : 'g'}`;
      } else {
        next.basisAmount = parsed.value;
        next.basisUnit = parsed.unit;
        next.basis = parsed.text || `${trimNum(parsed.value)}${parsed.unit}`;
      }
    }
    return next;
  }

  function scaleNutrients(target, nutrients, numerator, denominator) {
    if (!(denominator > 0)) return;
    NUTRIENT_KEYS.forEach(key => {
      if (typeof nutrients[key] === 'number') {
        // 먼저 나누면 355/100 같은 값이 3.55가 아니게 되어 10.65가 10.6으로 떨어짐
        target[key] = Math.round(nutrients[key] * numerator * 10 / denominator) / 10;
      }
    });
  }

  function applyAmount(food, amount, data) {
    const name = food?.baseFood || food?.name || '';
    const src = data || food;
    const next = attachBasis({ ...food }, src);
    const resolved = resolveAmount(name, amount?.value, amount?.unit, src);
    if (!resolved) return next;
    const currentNutrients = pickNutrients(food);
    const fromGrams = Number(food?.servingGrams) > 0 ? Number(food.servingGrams) : null;
    const fromAmount = Number(food?.servingAmount) > 0 ? Number(food.servingAmount) : null;
    const fromUnit = food?.servingUnit;
    let numerator = null;
    let denominator = null;
    let basisNutrients = null;
    let storedGrams = null;
    let storedAmount = null;
    let storedUnit = null;
    let storedLabel = null;

    // 이미 기록된 먹은 양의 영양이 있으면 그걸 기준으로 비례(직접 고친 kcal·잘못된 100g 기준을 덮어씀).
    if (Object.keys(currentNutrients).length && fromGrams && resolved.grams != null) {
      numerator = resolved.grams;
      denominator = fromGrams;
      basisNutrients = currentNutrients;
      storedGrams = fromGrams;
      storedLabel = `${trimNum(fromGrams)}g`;
    } else if (Object.keys(currentNutrients).length && fromAmount && fromUnit && fromUnit === resolved.unit) {
      numerator = resolved.value;
      denominator = fromAmount;
      basisNutrients = currentNutrients;
      storedAmount = fromAmount;
      storedUnit = fromUnit;
      storedLabel = food.serving || `${trimNum(fromAmount)}${fromUnit}`;
      if (fromGrams) { storedGrams = fromGrams; storedLabel = `${trimNum(fromGrams)}g`; }
    } else {
      const basis = getBasis(next);
      if (basis && resolved.grams != null && Number(basis.grams) > 0) {
        numerator = resolved.grams;
        denominator = Number(basis.grams);
        basisNutrients = basis.nutrients;
        storedGrams = Number(basis.grams);
        storedLabel = basis.label;
      } else if (basis && Number(basis.amount) > 0 && basis.unit === resolved.unit) {
        numerator = resolved.value;
        denominator = Number(basis.amount);
        basisNutrients = basis.nutrients;
        storedAmount = Number(basis.amount);
        storedUnit = basis.unit;
        storedLabel = basis.label;
      }
    }

    if (numerator != null && denominator > 0 && Number.isFinite(numerator) && basisNutrients) {
      const prevCal = typeof food.cal === 'number' ? food.cal : null;
      scaleNutrients(next, basisNutrients, numerator, denominator);
      const factor = prevCal > 0 && typeof next.cal === 'number' ? next.cal / prevCal : 1;
      // 한 개 무게를 모르는 채 g로 바꾸면 수만·수백만 kcal이 나올 수 있음. 그런 값은 버리지 않고 영양은 그대로 둠.
      const absurd = typeof next.cal === 'number' && (next.cal > 10000 || next.cal < 0 || factor > 50 || (prevCal > 0 && factor < 1 / 50 && next.cal < 1));
      if (absurd) {
        NUTRIENT_KEYS.forEach(key => { if (typeof food[key] === 'number') next[key] = food[key]; });
        numerator = null;
      } else {
        next.basisNutrients = { ...basisNutrients };
        next.basis = storedLabel;
        if (storedGrams) {
          next.basisGrams = storedGrams;
          delete next.basisAmount;
          delete next.basisUnit;
        } else {
          next.basisAmount = storedAmount;
          next.basisUnit = storedUnit;
          delete next.basisGrams;
        }
      }
    }
    if (numerator == null && Object.keys(currentNutrients).length && resolved && fromUnit && fromUnit !== resolved.unit) {
      // 개 → g 처럼 무게를 몰라 비례할 수 없으면, 지금 kcal을 새 양의 기준으로 둠(지어낸 무게로 나누지 않음).
      next.basisNutrients = { ...currentNutrients };
      if (resolved.grams != null && isMassUnit(resolved.unit)) {
        next.basisGrams = resolved.grams;
        next.basis = `${trimNum(resolved.grams)}${resolved.unit === 'ml' || resolved.unit === 'l' ? 'ml' : 'g'}`;
        delete next.basisAmount;
        delete next.basisUnit;
      } else {
        next.basisAmount = resolved.value;
        next.basisUnit = resolved.unit;
        next.basis = resolved.text;
        delete next.basisGrams;
      }
      NUTRIENT_KEYS.forEach(key => { if (typeof food[key] === 'number') next[key] = food[key]; });
    }
    next.servingAmount = resolved.value;
    next.servingUnit = resolved.unit;
    next.servingGrams = resolved.grams;
    next.servingGramsEstimated = Boolean(resolved.estimated);
    next.serving = resolved.text;
    delete next.quantityNote;
    const per = gramsForUnit(name, resolved.unit, { ...src, ...next, servingAmount: resolved.value, servingUnit: resolved.unit, servingGrams: resolved.grams });
    if (per && !isMassUnit(resolved.unit)) {
      next.unitGrams = { ...(next.unitGrams || {}), [resolved.unit]: per.grams };
      if (next.servingGrams == null) next.servingGrams = Math.round(resolved.value * per.grams * 10) / 10;
    }
    return next;
  }

  function splitCombinedFoods(name) {
    const raw = String(name || '').replace(/\s+/g, ' ').trim();
    if (!raw || isCompoundDish(raw) || isStapleName(raw)) return [raw];
    const patterns = [
      new RegExp(`^(.+?)(?:에(?:는)?|와|과|랑|하고)\\s*(${STAPLE_ALT})$`, 'u'),
      new RegExp(`^(.+?)\\s*[+＋]\\s*(${STAPLE_ALT})$`, 'u'),
      new RegExp(`^(.+?)\\s+(${STAPLE_ALT})$`, 'u'),
    ];
    for (const re of patterns) {
      const m = raw.match(re);
      if (!m) continue;
      const head = m[1].trim().replace(/[에와과랑]$/u, '').trim();
      const staple = m[2];
      if (!head || isCompoundDish(head) || isCompoundDish(raw) || isStapleName(head)) continue;
      return [head, staple];
    }
    const attached = raw.match(new RegExp(`^(.+?)(${STAPLE_ALT})$`, 'u'));
    if (attached && attached[2] !== '밥' && attached[1].trim() && !isCompoundDish(raw) && !isStapleName(attached[1])) {
      return [attached[1].trim(), attached[2]];
    }
    return [raw];
  }

  const api = {
    NUTRIENT_KEYS,
    GENERIC_UNITS,
    FOOD_UNITS,
    NAME_ALIASES,
    STAPLE_NAMES,
    compact,
    canonicalFoodName,
    lookupFood,
    isStapleName,
    isCompoundDish,
    stepFor,
    nudgeAmount,
    isMassUnit,
    gramsForUnit,
    plateCountFor,
    typicalServing,
    resolveAmount,
    formatAmount,
    parseServing,
    getBasis,
    attachBasis,
    applyAmount,
    splitCombinedFoods,
    trimNum,
  };
  global.RebuildersUnits = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
