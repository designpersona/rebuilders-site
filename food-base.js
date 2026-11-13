/* 흔한 한국 음식의 식약처 식품영양성분 DB 값만 모은 작은 표.
   출처: 앱에 내장된 data/mfds.json (식품의약품안전처 식품영양성분 데이터베이스, 기준일 2026-09-29).
   공식 DB에 없는 값은 넣지 않는다. */
(function initFoodBase(global) {
  'use strict';

  const SOURCE = {
    provider: '식품의약품안전처 식품영양성분 DB',
    date: '2026-09-29',
  };

  function entry(row) {
    const per100 = row.per100;
    const servingGrams = row.servingGrams || 100;
    const unit = row.servingUnit || 'g';
    const f = servingGrams / 100;
    const r1 = v => (v == null || !Number.isFinite(Number(v))) ? undefined : Math.round(Number(v) * f * 10) / 10;
    const food = {
      name: row.name,
      cal: Math.round(per100.cal * f),
      serving: `${servingGrams}${unit}`,
      servingAmount: servingGrams,
      servingUnit: unit,
      servingGrams,
      basis: `100${unit}`,
      basisGrams: 100,
      per100: { cal: per100.cal, carbs: per100.carbs, protein: per100.protein, fat: per100.fat },
      source: '식약처',
      sourceType: '공공DB',
      sourceLabel: '식약처',
      sourceTrust: 'reference',
      nutritionSource: { ...SOURCE, name: row.mfdsName },
      aliases: row.aliases || [],
    };
    if (per100.carbs != null) food.carbs = r1(per100.carbs);
    if (per100.protein != null) food.protein = r1(per100.protein);
    if (per100.fat != null) food.fat = r1(per100.fat);
    if (row.unitGrams) food.unitGrams = row.unitGrams;
    if (row.brand) food.brand = row.brand;
    return food;
  }

  // per100 숫자는 mfds.json 해당 행을 그대로 옮긴 값이다.
  const ROWS = [
    {
      name: '바나나',
      mfdsName: '바나나 생것',
      aliases: ['바나나 생것', '바나나생것'],
      per100: { cal: 77, carbs: 20, protein: 1.1, fat: 0.2 },
    },
    {
      name: '계란',
      mfdsName: '달걀 삶은것',
      aliases: ['달걀', '삶은 계란', '삶은 달걀', '삶은계란', '삶은달걀', '달걀 삶은것', '계란 삶은것'],
      per100: { cal: 145, carbs: 1.4, protein: 13.5, fat: 8.7 },
      unitGrams: { '알': 50, '개': 50 },
    },
    {
      name: '밥',
      mfdsName: '쌀밥',
      aliases: ['쌀밥', '흰밥', '흰쌀밥', '공기밥', '백미밥'],
      per100: { cal: 166, carbs: 37.3, protein: 3.4, fat: 0.3 },
      servingGrams: 210,
      unitGrams: { '공기': 210, '그릇': 210 },
    },
    {
      name: '계란말이',
      mfdsName: '달걀말이',
      aliases: ['달걀말이', '계란 말이', '달걀 말이'],
      per100: { cal: 193, carbs: 1.4, protein: 17.2, fat: 13.2 },
    },
    {
      name: '떡갈비',
      mfdsName: '떡갈비',
      aliases: [],
      per100: { cal: 202, carbs: 2.5, protein: 21.4, fat: 11.8 },
    },
    {
      name: '요즘 그릭 요거트',
      mfdsName: '플레인 그릭요거트',
      brand: '요즘',
      aliases: ['요즘 그릭요거트', '요즘그릭요거트', '요즘 그릭 요거트 플레인', '플레인 그릭요거트'],
      per100: { cal: 116, carbs: 4, protein: 7, fat: 8 },
    },
    {
      name: '칼국수',
      mfdsName: '칼국수',
      aliases: [],
      per100: { cal: 77, carbs: 14.9, protein: 3.3, fat: 0.5 },
      servingGrams: 700,
      unitGrams: { '그릇': 700, '개': 700 },
    },
    {
      name: '라면',
      mfdsName: '라면',
      aliases: ['라면 한그릇'],
      per100: { cal: 82, carbs: 13.7, protein: 1.7, fat: 2.3 },
      servingGrams: 550,
      unitGrams: { '그릇': 550, '개': 550, '인분': 550 },
    },
    {
      name: '김밥',
      mfdsName: '김밥',
      aliases: ['김밥 한줄'],
      per100: { cal: 140, carbs: 20, protein: 4.8, fat: 4.5 },
      servingGrams: 230,
      unitGrams: { '줄': 230, '개': 230 },
    },
    {
      name: '스타벅스 카페 라떼',
      mfdsName: '커피 카페 라떼 핫(HOT) (Tall)',
      brand: '스타벅스',
      aliases: ['스벅 라떼', '스벅 라떼 톨', '스벅 카페라떼', '스벅 카페 라떼', '스타벅스 라떼', '스타벅스 라떼 톨', '스타벅스 카페라떼', '스타벅스 카페 라떼 톨', '스벅 라떼 tall'],
      per100: { cal: 51, protein: 2.8 },
      servingGrams: 355,
      servingUnit: 'ml',
      unitGrams: { '잔': 355, '톨': 355, 'tall': 355 },
    },
  ];

  const FOODS = ROWS.map(entry);

  function compact(value) {
    return String(value || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  }

  const BRAND_OR_PLACE_RE = /등촌|스벅|스타벅스|starbucks|네스프레소|nespresso|진라면|신라면|너구리|안성탕면|짜파게티|열라면|오뚜기|농심|삼양|팔도|비비고|풀무원|맥도날드|맥날|버거킹|롯데리아|맘스터치|파리바게뜨|배스킨|던킨|투썸|이디야|메가커피|컴포즈|빽다방|설빙|교촌|이삭|서브웨이|한솥|노브랜드|소컵|컵라면|용기면/i;

  function hasBrandOrPlace(name, ownBrand) {
    const q = String(name || '');
    if (!q) return false;
    if (/요즘/.test(q) && /요거트|요구르트|yogurt/i.test(q)) return true;
    if (ownBrand) {
      const folded = compact(q);
      const brand = compact(ownBrand);
      if (brand && folded.includes(brand)) {
        const stripped = folded.split(brand).join('');
        return BRAND_OR_PLACE_RE.test(stripped) && !compact(stripped).includes(brand);
      }
    }
    return BRAND_OR_PLACE_RE.test(q);
  }

  function leftoverAfterKey(q, key) {
    if (q === key) return '';
    if (q.startsWith(key)) return q.slice(key.length);
    if (key.length >= 2 && q.endsWith(key)) return q.slice(0, q.length - key.length);
    return null;
  }

  function isAmountOrPrep(value) {
    const x = compact(value);
    if (!x) return true;
    // '1알50g'처럼 양이 두 번 이어져도 허용.
    return /^((한)?(\d+(?:\.\d+)?)?(g|ml|그램|개|알|그릇|공기|잔|컵|줄|조각|봉|팩|인분|줌|톨|tall|hot|아이스|ice|삶은것|삶은|흰|생것|생))+$/.test(x);
  }

  function isIcedLatte(q) {
    return /아이스|ice|아샷추/.test(q);
  }

  function isFlavoredLatte(q) {
    return /돌체|바닐라|오트|말차|차이|쑥|까망/.test(q);
  }

  function isRamenBrandCup(q) {
    return /진라면|신라면|너구리|안성탕면|육개장|짜파게티|열라면|소컵|컵라면|용기면/.test(q);
  }

  function isCompoundRice(q) {
    return /(볶음밥|비빔밥|덮밥|김밥|주먹밥|초밥|카레밥|오므라이스|리조또|국밥|컵밥)$/.test(q) || /김밥/.test(q);
  }

  const INDEX = [];
  FOODS.forEach(food => {
    const keys = [food.name, ...(food.aliases || [])].map(compact).filter(Boolean);
    INDEX.push({ keys: [...new Set(keys)], food });
  });

  function lookup(name) {
    const raw = String(name || '').trim();
    if (!raw) return null;
    const q = compact(raw);
    if (!q) return null;
    let best = null;
    let bestKey = '';
    let bestLen = 0;
    for (const row of INDEX) {
      for (const key of row.keys) {
        if (q === key || q.startsWith(key) || (key.length >= 2 && q.endsWith(key))) {
          if (key.length > bestLen) {
            best = row.food;
            bestKey = key;
            bestLen = key.length;
          }
        }
      }
    }
    if (!best) return null;
    const n = compact(best.name);
    if (n === compact('라면') && isRamenBrandCup(q) && q !== n) return null;
    if (n === compact('밥') && isCompoundRice(q)) return null;
    if (n === compact('스타벅스 카페 라떼') && (isIcedLatte(q) || isFlavoredLatte(q))) return null;
    if (n === compact('계란') && /말이/.test(q)) return null;
    if (n === compact('요즘 그릭 요거트') && !/요즘/.test(q) && compact(raw) !== compact('플레인 그릭요거트')) return null;
    const entryBrand = best.brand || '';
    if (entryBrand) {
      // 브랜드 전용 행은 그 브랜드가 이름에 있을 때만.
    } else {
      if (hasBrandOrPlace(raw)) return null;
      const leftover = leftoverAfterKey(q, bestKey);
      if (leftover && leftover !== '' && !isAmountOrPrep(leftover)) return null;
    }
    return { name: best.name, data: best, origin: 'mfds-base' };
  }

  function entries() {
    return FOODS.map(food => ({ name: food.name, data: food, aliases: food.aliases || [], brand: food.brand || '' }));
  }

  const api = { FOODS, lookup, entries, hasBrandOrPlace, sourceDate: SOURCE.date, sourceProvider: SOURCE.provider };
  global.RebuildersFoodBase = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
