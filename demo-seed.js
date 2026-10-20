(function rebuildersSampleData(global) {
  'use strict';

  const round = value => Math.round(value * 10) / 10;
  const scale = (name, amount, unit = 'g') => {
    const base = global.NILIRI_FOOD_CATALOG?.[name] || {};
    const factor = amount / 100;
    const scaled = { name, serving: `${amount}${unit}` };
    [
      'cal', 'carbs', 'protein', 'fat', 'sugar', 'fiber', 'saturatedFat',
      'transFat', 'cholesterol', 'sodium', 'potassium', 'calcium', 'iron',
      'magnesium', 'vitaminD', 'vitaminC',
    ].forEach(key => {
      if (base[key] !== undefined) scaled[key] = round(base[key] * factor);
    });
    return scaled;
  };

  const customPasta = {
    name: '홈메이드 토마토 파스타',
    nameEn: 'Homemade Tomato Pasta',
    serving: '1접시',
    cal: 566,
    carbs: 72,
    protein: 28,
    fat: 18,
    sugar: 9,
    fiber: 7,
    saturatedFat: 3.2,
    transFat: 0,
    cholesterol: 88,
    sodium: 640,
    source: 'demo-estimate',
    sourceTrust: 'estimate',
    description: '토마토, 새우, 마늘로 만든 가상 데모 식단입니다.',
    descriptionEn: 'A fictional demo meal made with tomato, shrimp, and garlic.',
  };

  const dayKey = offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const day = (breakfast, lunch, snack, dinner) => ({
    breakfast,
    lunch,
    snack,
    dinner,
    mealTimes: {
      breakfast: { value: '08:10', manual: false },
      lunch: { value: '12:35', manual: false },
      snack: [{ value: '16:10', manual: false }],
      dinner: { value: '19:05', manual: false },
    },
  });

  /*
   * 샘플 식단은 자동으로 들어가지 않습니다. 설정 > 내 데이터 > "샘플 식단 불러오기"에서
   * 사용자가 확인한 뒤에만 buildSampleDays() 결과가 기존 기록에 추가됩니다.
   * 기존에 기록이 있는 날짜, 설정, 내 음식은 건드리지 않고 비어 있는 날짜에만 채웁니다.
   */
  function buildSampleDays() {
    const breakfast = [scale('그릭요거트', 150), scale('블루베리', 50)];
    const lunch = [scale('닭가슴살', 120), scale('현미밥', 150), scale('방울토마토', 80)];
    const snack = [scale('프로틴바', 60)];
    const dinner = [{ ...customPasta }];
    return {
      [dayKey(-3)]: day([scale('오트밀', 180)], [scale('닭가슴살', 100), scale('현미밥', 140)], [scale('사과', 150)], [scale('두부', 180), scale('로메인', 100)]),
      [dayKey(-2)]: day([scale('삶은 달걀', 100), scale('아메리카노', 250, 'ml')], [scale('초밥', 220)], [scale('아몬드', 25)], [scale('닭고기', 140), scale('방울토마토', 100)]),
      [dayKey(-1)]: day([scale('그릭요거트', 150), scale('딸기', 80)], [scale('두부', 160), scale('현미밥', 150)], [scale('바나나', 110)], [scale('샐러드', 250), scale('삶은 달걀', 100)]),
      [dayKey(0)]: day(breakfast, lunch, snack, dinner),
    };
  }

  /** 기존 상태에 샘플 날짜를 비어 있는 날짜에만 추가한 새 상태와 추가된 날짜 수를 돌려줍니다. */
  function addSampleDays(existing) {
    const next = { ...(existing || {}) };
    let added = 0;
    for (const [key, value] of Object.entries(buildSampleDays())) {
      const current = next[key];
      const hasMeals = current && ['breakfast', 'lunch', 'snack', 'dinner'].some(meal => (current[meal] || []).length);
      if (hasMeals) continue;
      next[key] = value;
      added += 1;
    }
    return { state: next, added };
  }

  /** 장보기 예시(예전 화면에 고정돼 있던 4개). 샘플 불러오기에서만 추가됩니다. */
  function buildSampleShopping() {
    const now = Date.now();
    return {
      items: [
        { id: 'sample-eggs', name: '달걀', nameEn: 'Eggs', note: '다음 장보기에 구매', noteEn: 'Buy on the next shopping trip.', group: 'priority', status: 0, bought: false, essential: true, createdAt: now },
        { id: 'sample-greek-yogurt', name: '그릭요거트', nameEn: 'Greek Yogurt', note: '재료를 확인한 뒤 만들기', noteEn: 'Check ingredients, then make it.', group: 'make', status: 0, bought: false, createdAt: now },
        { id: 'sample-citrus', name: '귤 · 오렌지 · 레몬즙', nameEn: 'Tangerines · Oranges · Lemon juice', note: '하나를 골라 구매', noteEn: 'Choose one to buy.', group: 'compare', status: 0, bought: false, createdAt: now },
        { id: 'sample-soba-pork', name: '모밀국수 · 돈까스', nameEn: 'Soba noodles · Pork cutlet', note: '다음 장보기에 다시 확인', noteEn: 'Review again on the next shopping trip.', group: 'hold', status: 0, bought: false, createdAt: now },
      ],
      stock: [],
    };
  }

  /** 장보기·창고가 완전히 비어 있을 때만 예시를 넣습니다. */
  function addSampleShopping(existing) {
    const next = { ...(existing || {}) };
    const shopping = next.shopping || {};
    if ((shopping.items || []).length || (shopping.stock || []).length) return { state: next, added: 0 };
    next.shopping = buildSampleShopping();
    return { state: next, added: next.shopping.items.length };
  }

  global.RebuildersDemo = { buildSampleDays, addSampleDays, buildSampleShopping, addSampleShopping };
})(globalThis);
