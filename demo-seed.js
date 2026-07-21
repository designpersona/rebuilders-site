(function seedRebuildersPublicDemo(global) {
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

  global.REBUILDERS_DEMO_READY = (async () => {
    const repository = new global.NiliriStorage.IndexedDbStorage();
    await repository.initialize();
    const existing = await repository.getAll();
    const alreadyUsed = Object.keys(existing).some(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
    if (alreadyUsed) {
      repository.close();
      return;
    }

    const breakfast = [scale('그릭요거트', 150), scale('블루베리', 50)];
    const lunch = [scale('닭가슴살', 120), scale('현미밥', 150), scale('방울토마토', 80)];
    const snack = [scale('프로틴바', 60)];
    const dinner = [{ ...customPasta }];

    const demoState = {
      ...existing,
      settings: { height: 169, weight: 56, targetCal: 1800, locale: 'ko' },
      customFoods: {
        ...(existing.customFoods || {}),
        [customPasta.name]: { ...customPasta, foodId: 'demo-homemade-tomato-pasta', unlocked: true },
      },
      recentFoods: [customPasta, ...lunch, ...breakfast],
      [dayKey(-3)]: day([scale('오트밀', 180)], [scale('닭가슴살', 100), scale('현미밥', 140)], [scale('사과', 150)], [scale('두부', 180), scale('로메인', 100)]),
      [dayKey(-2)]: day([scale('삶은 달걀', 100), scale('아메리카노', 250, 'ml')], [scale('초밥', 220)], [scale('아몬드', 25)], [scale('닭고기', 140), scale('방울토마토', 100)]),
      [dayKey(-1)]: day([scale('그릭요거트', 150), scale('딸기', 80)], [scale('두부', 160), scale('현미밥', 150)], [scale('바나나', 110)], [scale('샐러드', 250), scale('삶은 달걀', 100)]),
      [dayKey(0)]: day(breakfast, lunch, snack, dinner),
    };

    await repository.replaceAll(demoState);
    repository.close();
  })().catch(error => {
    console.warn('Demo data could not be prepared:', error);
  });
})(globalThis);
