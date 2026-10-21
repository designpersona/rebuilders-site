/* ============================
   FOOD DB (식품안전처 + USDA 기준)
   ============================ */
const FOOD_DB = globalThis.NILIRI_FOOD_CATALOG || {};

const FOOD_IMAGE_BY_NAME = Object.freeze({
  '그릭요거트': 'assets/icon/Food/Yogurt.jpg',
  '요거트': 'assets/icon/Food/Yogurt.jpg',
  '바나나': 'assets/icon/Food/banana.jpg',
  '삶은 달걀': 'assets/icon/Food/boiled_egg.jpg',
  '닭가슴살': 'assets/icon/Food/chicken_breast.jpg',
  '닭고기': 'assets/icon/Food/chicken.jpg',
  '현미밥': 'assets/icon/Food/brown_rice%20.jpg',
  '아보카도': 'assets/icon/Food/avocado.jpg',
  '사과': 'assets/icon/Food/apple.jpg',
  '케이크': 'assets/icon/Food/cake.jpg',
  '아메리카노': 'assets/icon/Food/coffee.jpg',
  '커피': 'assets/icon/Food/coffee.jpg',
  '두부': 'assets/icon/Food/tofu.jpg',
  '오트밀': 'assets/icon/Food/oatmeal.jpg',
  '샐러드': 'assets/icon/Food/salad.jpg',
  '아몬드': 'assets/icon/Food/almond.jpg',
  '도넛': 'assets/icon/Food/Donuts.jpg',
  '초밥': 'assets/icon/Food/Sushi.jpg',
  '방울토마토': 'assets/icon/Food/cherry_tomato.jpg',
  '로메인': 'assets/icon/Food/romaine.png',
  '블루베리': 'assets/icon/Food/blueberry.png',
  '초콜릿': 'assets/icon/Food/chocolate.jpg',
  '햄버거': 'assets/icon/Food/hamburger.jpg',
  '피자': 'assets/icon/Food/pizza.jpg',
  '프로틴바': 'assets/icon/Food/protein_bar.jpg',
  '딸기': 'assets/icon/Food/strawberry.jpg',
  '토마토': 'assets/icon/Food/tomato.jpg',
  '제로콜라': 'assets/icon/Food/zero-sugar_cola.jpg',
});

const CHARACTER_ASSETS = Object.freeze({
  hungry: 'assets/character/01%20jamie_hungry.jpg',
  balanced: 'assets/character/02%20jamie.jpg',
  full: 'assets/character/03%20jamie_full.jpg',
});

const FOOD_NAME_EN = Object.freeze({
  '그릭요거트': 'Greek Yogurt',
  '바나나': 'Banana',
  '삶은 달걀': 'Boiled Egg',
  '닭가슴살': 'Chicken Breast',
  '현미밥': 'Brown Rice',
  '아보카도': 'Avocado',
  '사과': 'Apple',
  '케이크': 'Cake',
  '아메리카노': 'Americano',
  '두부': 'Tofu',
  '오트밀': 'Oatmeal',
  '샐러드': 'Salad',
  '아몬드': 'Almonds',
  '닭고기': 'Chicken', '도넛': 'Donut', '초밥': 'Sushi', '방울토마토': 'Cherry Tomato',
  '로메인': 'Romaine Lettuce', '블루베리': 'Blueberries',
  '초콜릿': 'Chocolate', '햄버거': 'Hamburger', '피자': 'Pizza', '프로틴바': 'Protein Bar',
  '딸기': 'Strawberry', '토마토': 'Tomato', '제로콜라': 'Zero Sugar Cola',
});

const FOOD_NAME_ALIASES = Object.freeze({
  '그릭요거트': ['요거트', '그릭 요거트', 'yogurt', 'yoghurt', 'greek yoghurt'],
  '로메인': ['romaine'],
  '방울토마토': ['cherry tomatoes'],
  '삶은 달걀': ['boiled eggs'],
});

function displayFoodName(foodOrName) {
  const food = typeof foodOrName === 'string' ? null : foodOrName;
  const name = typeof foodOrName === 'string' ? foodOrName : foodOrName?.name || '';
  if (ACTIVE_LOCALE !== 'en') return name;
  return food?.nameEn || FOOD_NAME_EN[name] || name;
}

/* ============================
   프로필 및 목표 영양소
   ============================ */
const DEFAULT_LOCALE = (globalThis.navigator?.languages || [globalThis.navigator?.language || ''])
  .some(language => String(language).toLowerCase().startsWith('ko')) ? 'ko' : 'en';

let PROFILE = {
  height: 169,
  weight: 50,
  targetCal: 1300,
  locale: 'ko',
};

const UI_COPY = {
  ko: {
    appTitle: 'Rebuilders — Food Tracker',
    brandSub: 'Design your body.',
    todayMeals: '오늘 식단',
    snack: '간식',
    breakfast: '아침', lunch: '점심', dinner: '저녁',
    noRecords: '기록 없음',
    addFood: '음식 추가',
    addSnack: '+ 간식',
    searchFood: '음식 이름 검색...',
    quickAdd: '빠른 추가',
    search: '검색', recent: '최근', custom: '직접 등록', myProducts: '내 제품', library: '식도감', ai: 'AI', chat: '채팅', shoppingNav: '그로서리',
    home: '식단', stats: '리포트', profile: '내정보',
    searchOnlyTitle: '음식 검색', searchOnlyKicker: '검색',
    fridgeTitle: '그로서리', fridgeKicker: '냉장고',
    foodexNav: '식도감', foodexTab: '음식', recipeTab: '레시피', badgeTab: '뱃지',
    shopping: '장보기', stockTab: '창고', storeTab: '스토어',
    languageTitle: '언어',
    languageDescription: '처음에는 기기 언어에 맞춰 표시됩니다. 여기서 선택하면 이 기기에 저장됩니다.',
    profileSub: '신체 정보와 목표 칼로리를 관리해요',
    height: '키', weight: '몸무게', target: '목표',
    profileEdit: '신체 · 목표 수정',
    heightField: '키 (cm)', weightField: '몸무게 (kg)', targetField: '목표 칼로리 (kcal)',
    save: '저장하기',
    foodName: '음식 이름', serving: '기준량', calories: '칼로리', carbs: '탄수화물', protein: '단백질', fat: '지방',
    saveAndAdd: '저장하고 추가',
    edit: '편집', done: '완료',
    calorieEaten: '먹은 칼로리', calorieRemaining: '남은 칼로리', calorieOver: '초과 칼로리', calorieTarget: '목표 칼로리',
    calorieSwitch: '탭해서 다른 수치 보기',
    snackPosition: '타임라인 위치',
    snackModalTitle: '간식 추가',
    recordPosition: '기록 위치',
    mealModalTitle: '{meal}에 음식 추가',
    mealTime: '섭취 시간', totalCalories: '총 칼로리', foodCount: '음식 수', loggedFoods: '기록한 음식',
    foodDetailsHint: '음식을 누르면 영양성분을 볼 수 있어요', searchFoodAction: '음식 검색', backToMeals: '식단',
    searchHubTitle: '식도감', foodIndex: '식도감', foodIndexAction: '식도감 열기 ↗', collection: '내 컬렉션', shopping: '장보기', searchLibraryNote: '내장 음식과 직접 등록한 음식을 검색합니다.',
    clearDay: '전체 삭제', statsTitle: '식단 리포트', statsSub: '달력으로 기록과 추이를 살펴보세요', snackWhen: '언제 먹었나요?',
    statsSelectedDay: '선택한 날', statsCalories: '칼로리', statsCarbs: '탄수화물', statsProtein: '단백질', statsFat: '지방', statsUnder: '여유', statsOnTarget: '적정', statsOver: '초과', statsEmpty: '이 날에는 기록이 없어요.', statsWeekTitle: '최근 7일 섭취 칼로리', statsWeekHint: '진한 선 최근 7일 · 연한 선 이전 7일 · 점선 목표', statsMonthTitle: '이번 달 요약', statsLoggedDays: '기록 일수', statsAverage: '평균 kcal', statsUnderDays: '목표 이내 기록일',
    collectionRecipes: '내 레시피', collectionProducts: '내 제품', collectionFridge: '내 냉장고', collectionMacros: '탄·단·지', collectionDelete: '삭제', collectionDeleteTitle: '컬렉션 삭제', collectionExpand: '재료 펼쳐보기', collectionCollapse: '재료 접어두기', foodexClose: 'Foodpedia 닫기', foodexViewOptions: 'Foodpedia 정렬과 보기 방식', foodexSort: '정렬', foodexFoodSort: '음식 정렬',
    beforeBreakfast: '아침 전', afterBreakfast: '아침 후', afterLunch: '점심 후', afterDinner: '저녁 후',
    aiCoach: 'AI 식단 기록 도우미', aiReady: '이 기기에 저장', aiWelcome: '말로 식단 기록',
  },
  en: {
    appTitle: 'Rebuilders — Food Tracker',
    brandSub: 'Design your body.',
    todayMeals: "Today's meals",
    snack: 'Snack',
    breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
    noRecords: 'No entries',
    addFood: 'Add food',
    addSnack: '+ Snack',
    searchFood: 'Search food name...',
    quickAdd: 'Quick add',
    search: 'Search', recent: 'Recent', custom: 'Custom', myProducts: 'My products', library: 'Food guide', ai: 'AI', chat: 'Chat', shoppingNav: 'Grocery',
    home: 'Meals', stats: 'Report', profile: 'Profile',
    searchOnlyTitle: 'Food search', searchOnlyKicker: 'Search',
    fridgeTitle: 'Grocery', fridgeKicker: 'Fridge',
    foodexNav: 'Foodpedia', foodexTab: 'Food', recipeTab: 'Recipes', badgeTab: 'Badges',
    shopping: 'Shopping', stockTab: 'Stock', storeTab: 'Store',
    languageTitle: 'Language',
    languageDescription: 'The first visit follows your device language. Your choice here is saved on this device.',
    profileSub: 'Manage your body information and calorie target',
    height: 'Height', weight: 'Weight', target: 'Target',
    profileEdit: 'Edit body & target',
    heightField: 'Height (cm)', weightField: 'Weight (kg)', targetField: 'Calorie target (kcal)',
    save: 'Save',
    foodName: 'Food name', serving: 'Serving size', calories: 'Calories', carbs: 'Carbs', protein: 'Protein', fat: 'Fat',
    saveAndAdd: 'Save and add',
    edit: 'Edit', done: 'Done',
    calorieEaten: 'Calories eaten', calorieRemaining: 'Calories left', calorieOver: 'Calories over', calorieTarget: 'Calorie target',
    calorieSwitch: 'Tap to show another value',
    snackPosition: 'Timeline position',
    snackModalTitle: 'Add snack',
    recordPosition: 'Add to',
    mealModalTitle: 'Add food to {meal}',
    mealTime: 'Time', totalCalories: 'Total calories', foodCount: 'Foods', loggedFoods: 'Logged foods',
    foodDetailsHint: 'Tap a food to view nutrition', searchFoodAction: 'Search food', backToMeals: 'Meals',
    searchHubTitle: 'Foodpedia', foodIndex: 'Foodpedia', foodIndexAction: 'Open Foodpedia ↗', collection: 'Collection', shopping: 'Shopping', searchLibraryNote: 'Search built-in foods and foods you registered.',
    clearDay: 'Delete all', statsTitle: 'Meal report', statsSub: 'Review your records and trends on the calendar', snackWhen: 'When did you eat it?',
    statsSelectedDay: 'Selected day', statsCalories: 'Calories', statsCarbs: 'Carbs', statsProtein: 'Protein', statsFat: 'Fat', statsUnder: 'Under', statsOnTarget: 'On target', statsOver: 'Over', statsEmpty: 'No meal log for this day.', statsWeekTitle: 'Calories eaten in the last 7 days', statsWeekHint: 'Dark: last 7 days · Light: previous 7 days · Dashed: target', statsMonthTitle: 'This month', statsLoggedDays: 'Days logged', statsAverage: 'Average kcal', statsUnderDays: 'Days at or under target',
    collectionRecipes: 'My recipes', collectionProducts: 'My products', collectionFridge: 'My fridge', collectionMacros: 'Carbs·Protein·Fat', collectionDelete: 'Delete', collectionDeleteTitle: 'Delete collection', collectionExpand: 'Expand ingredients', collectionCollapse: 'Collapse ingredients', foodexClose: 'Close Foodpedia', foodexViewOptions: 'Foodpedia sorting and view options', foodexSort: 'Sort', foodexFoodSort: 'Sort foods',
    beforeBreakfast: 'Before breakfast', afterBreakfast: 'After breakfast', afterLunch: 'After lunch', afterDinner: 'After dinner',
    aiCoach: 'AI meal logging assistant', aiReady: 'Saved on this device', aiWelcome: 'Log meals by chat',
  },
};

let ACTIVE_LOCALE = PROFILE.locale;

function t(key, vars = {}) {
  const template = UI_COPY[ACTIVE_LOCALE]?.[key] ?? UI_COPY.ko[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

function mealLabel(id) {
  return t(id);
}

const BUILT_IN_SERVING_LABELS = Object.freeze({
  '햄버거|1개 100g': '1 item · 100g',
  '피자|1조각 100g': '1 slice · 100g',
  '프로틴바|1개 60g': '1 bar · 60g',
  '홈메이드 샐러드|1접시': '1 plate',
});

function displayServing(foodOrName, fallback = '') {
  const food = typeof foodOrName === 'object' && foodOrName ? foodOrName : {};
  const name = typeof foodOrName === 'string' ? foodOrName : food.name || '';
  const estimated = food.sourceTrust === 'estimate' || food.servingGramsEstimated === true;
  const amount = food.servingAmount;
  const unit = food.servingUnit;
  let serving = '';

  if (amount !== undefined && amount !== null && unit) {
    const primary = `${amount}${unit}`;
    const grams = food.servingGrams;
    serving = grams !== undefined && grams !== null && unit !== 'g'
      ? (estimated ? `${primary} (${grams}g 추정)` : `${primary} · ${grams}g`)
      : primary;
  } else {
    serving = String(food.serving || fallback || '').trim().replace(/\s*추정$/, '');
    const gramSuffix = serving.match(/^(.+?)\s*\(([\d.]+)\s*g\)$/i);
    if (gramSuffix) {
      serving = estimated
        ? `${gramSuffix[1].trim()} (${gramSuffix[2]}g 추정)`
        : `${gramSuffix[1].trim()} · ${gramSuffix[2]}g`;
    }
  }

  if (ACTIVE_LOCALE !== 'en' || !serving) return serving;
  return BUILT_IN_SERVING_LABELS[`${name}|${serving}`] || serving.replace(' 추정', ' estimated');
}

function applyLanguage(render = true) {
  document.documentElement.lang = ACTIVE_LOCALE;
  document.title = t('appTitle');
  const staticText = {
    '.brand-sub': t('brandSub'),
    '.section-title': t('todayMeals'),
    '#add-snack-global': t('addSnack'),
    '#food-search': null,
    '#quick-add-label': t('quickAdd'),
    '#nav-home span': t('home'),
    '#nav-search span': t('foodexNav'),
    '#nav-stats span': t('stats'),
    '#nav-chat span': t('chat'),
    '#nav-shopping span': t('shoppingNav'),
    '#foodex-tab-index': t('foodexTab'),
    '#foodex-tab-recipe': t('recipeTab'),
    '#foodex-tab-badge': t('badgeTab'),
    '#language-settings-title': t('languageTitle'),
    '.language-settings-copy': t('languageDescription'),
    '#timeline-edit-btn': timelineEditing ? t('done') : t('edit'),
    '#view-profile .stats-page-title': t('profile'),
    '#view-profile .stats-page-sub': t('profileSub'),
    '#view-profile .profile-settings-form + #settings-save': t('save'),
    '#custom-save': t('saveAndAdd'),
    '#search-hub-tab-search': t('recent'),
    '#search-hub-tab-products': t('myProducts'),
    '#search-hub-tab-custom': t('custom'),
    '#search-hub-tab-shopping': t('shopping'),
    '#search-hub-tab-stock': t('stockTab'),
    '#search-hub-tab-store': t('storeTab'),
    '#view-search .search-hub-note': t('searchLibraryNote'),
    '#clear-day-btn': t('clearDay'),
    '#stats-page-title-text': t('statsTitle'),
    '#modal-snack-selector .modal-snack-label': t('snackWhen'),
    '#agent-page-title': ACTIVE_LOCALE === 'en' ? 'AI Chat' : 'AI 채팅',
    '#agent-display-name': ACTIVE_LOCALE === 'en' ? 'AI Meal Manager' : 'AI 식단관리사',
    '#agent-greeting-text': ACTIVE_LOCALE === 'en' ? 'What did you eat today?' : '오늘 무엇을 먹었나요?',
  };
  Object.entries(staticText).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
  });
  const homeLogo = document.querySelector('.home-brand-logo');
  if (homeLogo) homeLogo.alt = 'Rebuilders';
  applyExtendedStaticCopy();
  const search = document.getElementById('food-search');
  if (search) search.placeholder = t('searchFood');
  const hubSearch = document.getElementById('search-hub-input');
  if (hubSearch) hubSearch.placeholder = t('searchFood');
  document.querySelectorAll('.food-tab').forEach(tab => {
    const key = tab.dataset.tab === 'products' ? 'myProducts' : tab.dataset.tab;
    tab.textContent = t(key);
  });
  document.querySelectorAll('.snack-name').forEach(el => { el.textContent = t('snack'); });
  const macroLabels = ACTIVE_LOCALE === 'en' ? ['C', 'P', 'F'] : ['탄', '단', '지'];
  document.querySelectorAll('#view-home .macro-label').forEach((el, index) => {
    el.textContent = macroLabels[index] || '';
  });
  document.querySelectorAll('.modal-record-opt').forEach(button => {
    button.textContent = mealLabel(button.dataset.mealTarget);
  });
  document.querySelectorAll('.timeline-time-button').forEach(button => {
    button.setAttribute('aria-label', ACTIVE_LOCALE === 'en' ? 'Edit meal time' : '섭취 시간 수정');
  });
  MEAL_IDS.forEach(id => {
    const drag = document.querySelector(`.drag-handle[data-meal="${id}"]`);
    if (drag) drag.setAttribute('aria-label', ACTIVE_LOCALE === 'en' ? `Move ${mealLabel(id)} meal` : `${mealLabel(id)} 식사 옮기기`);
    const add = document.getElementById(`add-${id}`);
    if (add) add.setAttribute('aria-label', ACTIVE_LOCALE === 'en' ? `Add ${mealLabel(id)} food` : `${mealLabel(id)} 식사 추가`);
  });
  document.querySelectorAll('.drag-handle[data-drag="snack"]').forEach(button => {
    button.setAttribute('aria-label', ACTIVE_LOCALE === 'en' ? 'Move snack' : '간식 옮기기');
  });
  const snackSlotCopy = [t('beforeBreakfast'), t('afterBreakfast'), t('afterLunch'), t('afterDinner')];
  document.querySelectorAll('#modal-snack-slot-select option').forEach((option, index) => {
    option.textContent = snackSlotCopy[index] || '';
  });
  SNACK_SLOTS.forEach((slot, index) => {
    const add = document.getElementById(`add-snack-${slot}`);
    if (add) add.setAttribute('aria-label', ACTIVE_LOCALE === 'en'
      ? `Add snack ${snackSlotCopy[index]}`
      : `${snackSlotCopy[index]} 간식 추가`);
  });
  const recordPosition = document.querySelector('#modal-record-selector .modal-snack-label');
  if (recordPosition) recordPosition.textContent = t('recordPosition');
  const profileLabels = [t('height'), t('weight'), t('target')];
  document.querySelectorAll('#view-profile .profile-summary-label').forEach((el, index) => { el.textContent = profileLabels[index] || ''; });
  const fieldCopy = {
    'input-height': t('heightField'), 'input-weight': t('weightField'), 'input-target-cal': t('targetField'),
    'custom-name': t('foodName'),
    'custom-serving-amount': ACTIVE_LOCALE === 'en' ? 'Serving (number · unit)' : '기준량 (숫자 · 단위)',
    'custom-cal': t('calories'),
    'custom-carbs': t('carbs'), 'custom-protein': t('protein'), 'custom-fat': t('fat'),
    'custom-description': ACTIVE_LOCALE === 'en' ? 'Description' : '제품 소개',
    'custom-sugar': ACTIVE_LOCALE === 'en' ? 'Sugar' : '당류',
    'custom-fiber': ACTIVE_LOCALE === 'en' ? 'Fiber' : '식이섬유',
    'custom-saturated-fat': ACTIVE_LOCALE === 'en' ? 'Saturated fat' : '포화지방',
    'custom-trans-fat': ACTIVE_LOCALE === 'en' ? 'Trans fat' : '트랜스지방',
    'custom-cholesterol': ACTIVE_LOCALE === 'en' ? 'Cholesterol' : '콜레스테롤',
    'custom-sodium': ACTIVE_LOCALE === 'en' ? 'Sodium' : '나트륨',
    'custom-potassium': ACTIVE_LOCALE === 'en' ? 'Potassium' : '칼륨',
    'custom-calcium': ACTIVE_LOCALE === 'en' ? 'Calcium' : '칼슘',
    'custom-iron': ACTIVE_LOCALE === 'en' ? 'Iron' : '철분',
    'custom-magnesium': ACTIVE_LOCALE === 'en' ? 'Magnesium' : '마그네슘',
    'custom-vitamin-d': ACTIVE_LOCALE === 'en' ? 'Vitamin D' : '비타민 D',
    'custom-vitamin-c': ACTIVE_LOCALE === 'en' ? 'Vitamin C' : '비타민 C',
  };
  Object.entries(fieldCopy).forEach(([id, label]) => {
    const input = document.getElementById(id);
    const formLabel = input ? document.querySelector(`label[for="${id}"]`) : null;
    if (formLabel) formLabel.textContent = label;
  });
  const profileEditTitle = document.querySelector('#view-profile .profile-form-card .stats-section-title');
  if (profileEditTitle) profileEditTitle.textContent = t('profileEdit');
  const profileAvatar = document.querySelector('#view-profile .profile-avatar');
  if (profileAvatar) profileAvatar.textContent = ACTIVE_LOCALE === 'en' ? 'N' : '니';
  document.querySelectorAll('.language-option[data-language]').forEach(button => {
    const active = button.dataset.language === ACTIVE_LOCALE;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const searchView = document.getElementById('view-search');
  if (searchView && !searchView.hidden) renderSearchHub();
  renderQuickFoods(getFoodEntries());
  renderRecentFoods();
  updateCustomSaveLabel();
  updateDateDisplay();
  if (render) renderAll(true);
}

function calcTargets(cal) {
  return {
    cal: cal,
    carbs: 130,
    protein: 81,
    fat: 51,
  };
}

let TARGETS = calcTargets(PROFILE.targetCal);
let CUSTOM_FOODS = {};
let RECENT_FOODS = [];
let editingCustomFoodName = null;
let activeFoodTab = 'recent';
let currentSnackSlot = 3; // 간식 추가 시 어느 슬롯에 넣을지 (0=아침전, 1=아침후, 2=점심후, 3=저녁후)

const MEAL_META = {
  breakfast: { label: '아침' },
  lunch: { label: '점심' },
  snack: { label: '간식' },
  dinner: { label: '저녁' },
};

const MEAL_IDS = ['breakfast', 'lunch', 'dinner']; // snack은 별도 섹션으로 분리
const SNACK_SLOTS = [0, 1, 2, 3];
const SNACK_SLOT_LABELS = {
  0: '아침 전',
  1: '아침 후',
  2: '점심 후',
  3: '저녁 후',
};

const DEFAULT_MEAL_TIME_VALUES = Object.freeze({ breakfast: '08:00', lunch: '12:30', dinner: '18:30' });

function currentClockTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function normaliseTimeEntry(value, fallback = '') {
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) return { value, manual: true };
  if (value && /^\d{2}:\d{2}$/.test(value.value || '')) {
    return { value: value.value, manual: Boolean(value.manual) };
  }
  return { value: fallback, manual: false };
}

function defaultMealTimes() {
  return {
    breakfast: normaliseTimeEntry(null, DEFAULT_MEAL_TIME_VALUES.breakfast),
    lunch: normaliseTimeEntry(null, DEFAULT_MEAL_TIME_VALUES.lunch),
    dinner: normaliseTimeEntry(null, DEFAULT_MEAL_TIME_VALUES.dinner),
    snack: Object.fromEntries(SNACK_SLOTS.map(slot => [slot, normaliseTimeEntry(null)])),
  };
}

function normaliseMealTimes(raw) {
  const next = defaultMealTimes();
  MEAL_IDS.forEach(id => { next[id] = normaliseTimeEntry(raw?.[id], DEFAULT_MEAL_TIME_VALUES[id]); });
  SNACK_SLOTS.forEach(slot => { next.snack[slot] = normaliseTimeEntry(raw?.snack?.[slot]); });
  return next;
}

function cloneMealTimes() {
  return normaliseMealTimes(mealTimes);
}

function timeEntryFor(mealId, slot = null) {
  return mealId === 'snack' ? mealTimes.snack[slot] : mealTimes[mealId];
}

function resetCardTime(mealId, slot = null) {
  if (mealId === 'snack') mealTimes.snack[slot] = normaliseTimeEntry(null, DEFAULT_SNACK_TIME_VALUES[slot]);
  else mealTimes[mealId] = normaliseTimeEntry(null, DEFAULT_MEAL_TIME_VALUES[mealId]);
}

function setCardTime(mealId, slot, value, manual = true) {
  const entry = { value, manual };
  if (mealId === 'snack') mealTimes.snack[slot] = entry;
  else mealTimes[mealId] = entry;
}

function setAutoTimeForFirstFood(mealId, slot, wasEmpty) {
  if (!wasEmpty) return;
  const entry = timeEntryFor(mealId, slot);
  if (!entry.manual) {
    // 사용자가 직접 설정하지 않으면 평균 고정 시간 유지
    const fixed = mealId === 'snack' ? null : DEFAULT_MEAL_TIME_VALUES[mealId];
    entry.value = fixed || currentClockTime();
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================
   브라우저 저장소
   ============================ */

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const FORCE_INDEXEDDB = new URLSearchParams(globalThis.location?.search || '')
  .get('storage') === 'indexeddb';
const APP_CONFIG = globalThis.REBUILDERS_CONFIG || {};
// Capacitor 네이티브 앱 안에서 실행 중인지.
const IS_NATIVE_APP = Boolean(globalThis.Capacitor?.isNativePlatform?.());
const IS_STANDALONE_PWA = Boolean(
  globalThis.navigator?.standalone
  || globalThis.matchMedia?.('(display-mode: standalone)')?.matches,
);
// 앱 모드: 스토어 앱·홈 화면 앱·앱 빌드 번들. 데모/로컬서버 전용 UI를 숨깁니다.
const APP_MODE = IS_NATIVE_APP || IS_STANDALONE_PWA || APP_CONFIG.buildTarget === 'app';
// LOCAL_MODE(로컬 서버 연동)는 명시적으로 허용된 웹 빌드에서만, 네이티브가 아닐 때, localhost 에서만 켜집니다.
// 앱 번들의 app-config.js 는 allowLocalMode:false 이므로 앱에서는 절대 켜지지 않습니다.
const LOCAL_MODE = APP_CONFIG.allowLocalMode === true
  && !IS_NATIVE_APP
  && globalThis.location?.protocol === 'http:'
  && LOCAL_HOSTS.has(globalThis.location?.hostname)
  && !FORCE_INDEXEDDB;
let storageRepository = NiliriStorage.createRepository(LOCAL_MODE ? 'localapi' : 'indexeddb');
// 장보기·창고(state.shopping). initializeApp 에서 저장소 값으로 채웁니다.
let SHOPPING = NiliriStorage.normalizeShopping(null);
let shoppingSaveChain = Promise.resolve();

async function initializeStorageRepository() {
  if (LOCAL_MODE) {
    try {
      const localRepo = NiliriStorage.createRepository('localapi');
      await localRepo.initialize();
      storageRepository = localRepo;
      return 'local';
    } catch (error) {
      console.warn('Local API unavailable, falling back to IndexedDB:', error);
    }
  }
  const idbRepo = NiliriStorage.createRepository('indexeddb');
  await idbRepo.initialize();
  storageRepository = idbRepo;
  return LOCAL_MODE ? 'offline' : 'web';
}

function updateLocalModeStatus(state) {
  const status = document.getElementById('agent-connection-status');
  if (!status) return;
  const copy = {
    local: ACTIVE_LOCALE === 'en' ? 'Local server connected' : '로컬 서버 연결됨',
    offline: ACTIVE_LOCALE === 'en' ? 'Local server disconnected' : '로컬 서버 연결 안 됨',
    web: ACTIVE_LOCALE === 'en' ? 'Saved on this device only' : '이 기기에만 저장',
  };
  status.textContent = copy[state] || copy.web;
  status.dataset.state = state;
}

/* 토스트 (저장 실패·안내) */
function showToast(message, type = 'info') {
  const host = document.getElementById('toast-host');
  if (!host) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 280);
  }, 2600);
}

async function loadStorage() {
  return storageRepository.getAll();
}

function storageErrorMessage(error) {
  if (error?.name === 'QuotaExceededError') {
    return ACTIVE_LOCALE === 'en'
      ? 'There is not enough browser storage. Clear unnecessary site data and try again.'
      : '브라우저 저장 공간이 부족해 저장하지 못했어요. 불필요한 사이트 데이터를 정리한 뒤 다시 시도해 주세요.';
  }
  if (error?.name === 'NotSupportedError' || error?.name === 'SecurityError') {
    return ACTIVE_LOCALE === 'en'
      ? 'Local storage is unavailable in this browser. Try standard browsing mode or another browser.'
      : '이 브라우저에서는 로컬 저장소를 사용할 수 없어요. 일반 브라우징 모드나 다른 브라우저에서 다시 시도해 주세요.';
  }
  if (error?.name === 'InvalidStateError') {
    return ACTIVE_LOCALE === 'en'
      ? 'Browser storage is locked. Close other Rebuilders tabs and try again.'
      : '브라우저 저장소가 잠겨 있어요. 다른 Rebuilders 탭을 닫은 뒤 다시 시도해 주세요.';
  }
  return ACTIVE_LOCALE === 'en'
    ? 'Could not save in this browser. Try again in a moment.'
    : '이 브라우저에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

function showStorageFailure(error) {
  console.error('브라우저 저장소 오류:', error);
  const code = error?.name && error.name !== 'Error' ? error.name : (error?.message || '').slice(0, 40);
  showToast(storageErrorMessage(error) + (code ? ` (${code})` : ''), 'error');
}

function setButtonPending(button, pending) {
  if (!button) return;
  if (pending) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}

async function runButtonAction(button, action) {
  if (!button || button.disabled || button.dataset.actionLocked === 'true') return false;
  button.dataset.actionLocked = 'true';
  setButtonPending(button, true);
  try {
    await action();
    return true;
  } catch (error) {
    showStorageFailure(error);
    return false;
  } finally {
    setButtonPending(button, false);
    setTimeout(() => { delete button.dataset.actionLocked; }, 400);
  }
}

function foodSourceMeta(data, name) {
  if (data?.sourceTrust === 'reference' || data?.source === 'Open Food Facts') {
    const basis = data.basis === '100g'
      ? (ACTIVE_LOCALE === 'en' ? 'per 100g' : '100g 참고')
      : (ACTIVE_LOCALE === 'en' ? 'per serving' : '1회 참고');
    return { label: `${ACTIVE_LOCALE === 'en' ? 'Reference' : '참고'} · ${basis}`, cls: 'source-ref' };
  }
  if (CUSTOM_FOODS[name]) return { label: ACTIVE_LOCALE === 'en' ? 'Mine' : '내 등록', cls: 'source-mine' };
  if (FOOD_DB[name]) return { label: ACTIVE_LOCALE === 'en' ? 'Built-in' : '기본', cls: 'source-local' };
  if (data?.source) return { label: escapeHtml(data.source), cls: 'source-ref' };
  return { label: ACTIVE_LOCALE === 'en' ? 'Local' : '로컬', cls: 'source-local' };
}


/* =====================================================================
   통합 음식 검색(아이폰 검색처럼): 최근 먹은 → 내 식도감 → 영양 DB 순 묶음
   - 이름 색인은 저장소(IndexedDB)에서 한 번만 만들고, 하루 기록 저장·내 음식 추가/삭제 때 그 부분만 고침
   - 로컬 결과는 바로, 바깥 조회(있을 때만)는 2글자 이상·200ms 멈춘 뒤·이전 요청은 취소
   ===================================================================== */
const FoodSearch = (() => {
  const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
  const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
  const eaten = new Map(); // 이름 → { count, last, food }
  const dayNames = new Map(); // 날짜 → [이름…] (고칠 때 예전 것을 빼기 위해)
  const hayCache = new Map();
  const stats = { readMs: 0, buildMs: 0, days: 0, entries: 0, lastSearchMs: 0, externalCalls: 0, builds: 0 };
  let ready = false; let building = null; let attached = null;
  const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  function hay(name, data) {
    const key = `${ACTIVE_LOCALE}\u0001${name}`;
    let v = hayCache.get(key);
    if (v === undefined) {
      let shown = name;
      try { shown = displayFoodName({ name, ...(data || {}) }) || name; } catch { /* 이름만 */ }
      v = shown !== name ? `${norm(name)}\u0001${norm(shown)}` : norm(name);
      hayCache.set(key, v);
    }
    return v;
  }
  function inc(name, key, food) {
    let e = eaten.get(name);
    if (!e) { e = { count: 0, last: '', food: null }; eaten.set(name, e); }
    e.count += 1;
    if (key >= e.last) { e.last = key; e.food = food; }
  }
  function dec(name) {
    const e = eaten.get(name);
    if (!e) return;
    e.count -= 1;
    if (e.count <= 0) eaten.delete(name);
  }
  function indexDay(key, day) {
    const old = dayNames.get(key);
    if (old) old.forEach(dec);
    const names = [];
    for (const meal of MEALS) {
      const list = Array.isArray(day?.[meal]) ? day[meal] : [];
      for (const food of list) {
        if (!food?.name) continue;
        names.push(food.name);
        inc(food.name, key, { ...food });
      }
    }
    if (names.length) dayNames.set(key, names); else dayNames.delete(key);
    return names.length;
  }
  // 저장소 저장 함수에 살짝 얹어 색인을 같이 고침(저장 동작은 그대로)
  function attach(repo) {
    if (!repo || attached === repo || repo.__foodSearchHooked) { attached = repo; return; }
    const wrap = (method, after) => {
      const original = repo[method];
      if (typeof original !== 'function') return;
      repo[method] = async function (...args) {
        const result = await original.apply(this, args);
        try { after(...args); } catch { /* 색인은 다음 검색 때 다시 */ }
        return result;
      };
    };
    wrap('saveDay', (key, day) => { if (ready && DAY_KEY.test(key)) indexDay(key, day); });
    wrap('saveDayAndRecent', (key, day) => { if (ready && DAY_KEY.test(key)) indexDay(key, day); });
    wrap('replaceAll', () => invalidate());
    repo.__foodSearchHooked = true;
    attached = repo;
  }
  async function build() {
    attach(storageRepository);
    if (ready) return stats;
    if (building) return building;
    building = (async () => {
      const t0 = performance.now();
      const all = await storageRepository.getAll();
      const t1 = performance.now();
      eaten.clear(); dayNames.clear();
      let entries = 0;
      for (const key of Object.keys(all)) if (DAY_KEY.test(key)) entries += indexDay(key, all[key]);
      stats.readMs = Math.round((t1 - t0) * 10) / 10;
      stats.buildMs = Math.round((performance.now() - t1) * 10) / 10;
      stats.days = dayNames.size; stats.entries = entries; stats.builds += 1;
      ready = true;
      return stats;
    })();
    try { return await building; } finally { building = null; }
  }
  function invalidate() { ready = false; hayCache.clear(); }
  function forgetName(name) { for (const key of [...hayCache.keys()]) if (key.endsWith(`\u0001${name}`)) hayCache.delete(key); }
  function count(name) { return eaten.get(name)?.count || 0; }
  function search(query) {
    const t0 = performance.now();
    const nq = norm(query);
    if (!nq) return null;
    const rank = h => { const i = h.indexOf(nq); return i < 0 ? -1 : (i === 0 || h[i - 1] === '\u0001' ? 0 : 1); };
    const seen = new Set();
    const recent = [];
    // 식도감에서 지운 음식은(기록은 남아도) 검색에 다시 안 나오게: 내 식도감·기본 목록에 있는 것만
    const inCatalog = name => Boolean(CUSTOM_FOODS[name] || FOOD_DB[name]);
    for (const [name, e] of eaten) {
      if (!inCatalog(name)) continue;
      const data = CUSTOM_FOODS[name] || FOOD_DB[name] || e.food || {};
      const r = rank(hay(name, data));
      if (r < 0) continue;
      recent.push({ name, data, count: e.count, last: e.last, r, ri: 99 });
      seen.add(name);
    }
    (RECENT_FOODS || []).forEach((food, i) => {
      if (!food?.name || seen.has(food.name) || !inCatalog(food.name)) return;
      const data = CUSTOM_FOODS[food.name] || FOOD_DB[food.name] || food;
      const r = rank(hay(food.name, data));
      if (r < 0) return;
      recent.push({ name: food.name, data, count: 0, last: '', r, ri: i });
      seen.add(food.name);
    });
    recent.sort((a, b) => b.count - a.count || (a.last < b.last ? 1 : a.last > b.last ? -1 : 0) || a.ri - b.ri || a.r - b.r);
    const collect = source => {
      const out = [];
      for (const name in source) {
        if (seen.has(name)) continue;
        const r = rank(hay(name, source[name]));
        if (r < 0) continue;
        out.push({ name, data: source[name], r });
      }
      out.sort((a, b) => a.r - b.r || a.name.length - b.name.length || a.name.localeCompare(b.name, 'ko'));
      out.forEach(item => seen.add(item.name));
      return out;
    };
    const mine = collect(CUSTOM_FOODS);
    const db = collect(FOOD_DB);
    stats.lastSearchMs = Math.round((performance.now() - t0) * 100) / 100;
    return { query, sections: [{ key: 'recent', items: recent }, { key: 'mine', items: mine }, { key: 'db', items: db }], ms: stats.lastSearchMs };
  }
  // 바깥 조회: 로컬 서버(개발용)에서만. 앱 번들은 없음 → 호출 안 함. 테스트에서 바꿔 끼울 수 있음
  let externalProvider = (typeof LOCAL_MODE !== 'undefined' && LOCAL_MODE)
    ? async (q, signal) => {
      const result = await storageRepository.resolveFood({ name: q }, { register: false, signal });
      return result?.food ? [{ ...result.food, name: result.food.name || q }] : [];
    }
    : null;
  return {
    build, search, count, invalidate, forgetName, attach, stats,
    ready: () => ready,
    get externalProvider() { return externalProvider; },
    set externalProvider(fn) { externalProvider = typeof fn === 'function' ? fn : null; },
  };
})();
globalThis.FoodSearch = FoodSearch;

const FOOD_SEARCH_PAGE = 5;
function foodSearchSectionLabel(key) {
  const en = ACTIVE_LOCALE === 'en';
  return { recent: en ? 'Recently eaten' : '최근 먹은', mine: en ? 'My Foodpedia' : '내 식도감', db: en ? 'Nutrition DB' : '영양 DB' }[key] || key;
}
function foodMacroLine(data) {
  const en = ACTIVE_LOCALE === 'en';
  const v = x => Math.round((Number(x) || 0) * 10) / 10;
  return `${en ? 'C' : '탄'}${v(data.carbs)}g · ${en ? 'P' : '단'}${v(data.protein)}g · ${en ? 'F' : '지'}${v(data.fat)}g`;
}
function foodSearchRow(item, onPick) {
  const { name } = item;
  const data = item.data || {};
  const food = { ...data, name };
  const en = ACTIVE_LOCALE === 'en';
  const src = item.external
    ? { label: escapeHtml(data.source || (en ? 'Lookup' : '조회')) }
    : foodSourceMeta(data, name);
  const tag = data.aiEstimate ? (en ? 'AI estimate' : 'AI 추정') : src.label;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fs-row';
  button.dataset.name = name;
  button.innerHTML = `
    <span class="fs-main"><span class="fs-name">${escapeHtml(displayFoodName(food))}</span>
      <span class="fs-sub">${data.serving ? `<span class="fs-amount">${escapeHtml(displayServing(food, data.serving))}</span>` : ''}<span class="fs-src">${tag}</span></span></span>
    <span class="fs-nut">${isNutritionMissing(data)
      ? `<span class="fs-missing">${escapeHtml(nutritionMissingLabel())}</span>`
      : `<span class="fs-kcal">${Math.round(Number(data.cal) || 0)}kcal</span><span class="fs-macros">${foodMacroLine(data)}</span>`}</span>`;
  button.addEventListener('click', () => onPick(food, item));
  return button;
}
/* 묶음 결과 그리기(식도감·음식 추가 시트 공용). state.more = { 묶음: 보여 줄 개수 } */
function renderFoodSearchResults(container, result, state, handlers) {
  const en = ACTIVE_LOCALE === 'en';
  container.replaceChildren();
  const q = result.query;
  const sections = result.sections.map(section => section.key === 'db' && state.external?.length
    ? { ...section, items: [...section.items, ...state.external.filter(f => f?.name && !result.sections.some(s => s.items.some(i => i.name === f.name))).map(f => ({ name: f.name, data: f, external: true }))] }
    : section);
  let shown = 0;
  for (const section of sections) {
    if (!section.items.length) continue;
    const limit = state.more[section.key] || FOOD_SEARCH_PAGE;
    const wrap = document.createElement('section');
    wrap.className = 'fs-section';
    wrap.dataset.section = section.key;
    wrap.innerHTML = `<h3 class="fs-head">${foodSearchSectionLabel(section.key)}<span class="fs-count">${section.items.length}</span></h3>`;
    const list = document.createElement('div');
    list.className = 'fs-list';
    section.items.slice(0, limit).forEach(item => list.appendChild(foodSearchRow(item, handlers.onPick)));
    wrap.appendChild(list);
    const rest = section.items.length - limit;
    if (rest > 0) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'fs-more';
      more.textContent = en ? `Show more (${rest})` : `더 보기 (${rest}개)`;
      more.addEventListener('click', () => { state.more[section.key] = limit + 20; handlers.onMore(); });
      wrap.appendChild(more);
    }
    container.appendChild(wrap);
    shown += 1;
  }
  if (!shown) {
    const empty = document.createElement('p');
    empty.className = 'fs-empty';
    empty.textContent = en ? `No food matches '${q}'.` : `'${q}'와(과) 맞는 음식이 없어요.`;
    container.appendChild(empty);
  }
  const actions = document.createElement('div');
  actions.className = 'fs-actions';
  const register = document.createElement('button');
  register.type = 'button';
  register.className = 'fs-register';
  register.innerHTML = `<span class="fs-plus" aria-hidden="true">+</span><span>${en ? `Register '${escapeHtml(q)}'` : `'${escapeHtml(q)}' 직접 등록하기`}</span>`;
  register.addEventListener('click', () => handlers.onRegister(q));
  actions.appendChild(register);
  if (handlers.onAi && globalThis.RebuildersBridge?.isConfigured?.()) {
    const ai = document.createElement('button');
    ai.type = 'button';
    ai.className = 'fs-ai';
    ai.innerHTML = `<span class="fs-plus" aria-hidden="true">✦</span><span>${en ? 'Find with AI' : 'AI로 찾기'}</span>`;
    ai.addEventListener('click', () => handlers.onAi(q, ai));
    actions.appendChild(ai);
  }
  container.appendChild(actions);
}

/* 식도감 검색 상태 */
const foodexSearchState = { q: '', more: {}, external: [], token: 0, timer: null, abort: null };
function foodexSearchQuery() { return (document.getElementById('foodex-search-input')?.value || '').trim(); }
function setFoodexResultsMode(on) {
  const panel = document.querySelector('[data-foodex-panel="index"]');
  if (!panel) return;
  panel.classList.toggle('is-searching', on);
  const results = document.getElementById('foodex-results');
  if (results) results.hidden = !on;
}
function renderFoodexResults() {
  const container = document.getElementById('foodex-results');
  const q = foodexSearchQuery();
  if (!container) return;
  if (!q) { setFoodexResultsMode(false); container.replaceChildren(); return; }
  const result = FoodSearch.search(q);
  setFoodexResultsMode(true);
  renderFoodSearchResults(container, result, foodexSearchState, {
    onPick: food => openFoodDex(food, { mode: 'index' }),
    onMore: renderFoodexResults,
    onRegister: name => openFoodRegistration(name),
    onAi: (name, button) => findFoodWithAi(name, button),
  });
}
function scheduleFoodexExternal(q) {
  clearTimeout(foodexSearchState.timer);
  foodexSearchState.abort?.abort();
  foodexSearchState.abort = null;
  const provider = FoodSearch.externalProvider;
  if (!provider || q.length < 2) return;
  foodexSearchState.timer = setTimeout(async () => {
    const controller = new AbortController();
    foodexSearchState.abort = controller;
    const token = ++foodexSearchState.token;
    FoodSearch.stats.externalCalls += 1;
    try {
      const list = await provider(q, controller.signal);
      if (controller.signal.aborted || token !== foodexSearchState.token || foodexSearchQuery() !== q) return;
      foodexSearchState.external = Array.isArray(list) ? list : [];
      renderFoodexResults();
    } catch { /* 바깥 조회 실패는 조용히(로컬 결과는 이미 보임) */ }
  }, 200);
}
function onFoodexSearchInput() {
  const q = foodexSearchQuery();
  if (q !== foodexSearchState.q) { foodexSearchState.more = {}; foodexSearchState.external = []; }
  foodexSearchState.q = q;
  scheduleFoodexExternal(q);
  if (!q) { setFoodexResultsMode(false); renderSearchHub(); return; }
  if (!FoodSearch.ready()) FoodSearch.build().then(() => { if (foodexSearchQuery() === q) renderFoodexResults(); }).catch(() => {});
  renderFoodexResults();
}
function openFoodRegistration(name) {
  openProductRegistration();
  const input = document.getElementById('custom-name');
  if (input) input.value = name;
  document.getElementById('modal-title').textContent = ACTIVE_LOCALE === 'en' ? 'Register a food' : '음식 직접 등록';
}
async function findFoodWithAi(name, button) {
  const en = ACTIVE_LOCALE === 'en';
  if (!globalThis.RebuildersBridge?.isConfigured?.()) return;
  const label = button.querySelector('span:last-child');
  const before = label.textContent;
  button.disabled = true;
  label.textContent = en ? 'AI is searching…' : 'AI가 찾는 중…';
  try {
    const result = await RebuildersBridge.lookup({ date: dateKey(currentDate), meal: 'snack', items: [{ name }] });
    const item = result.items?.[0];
    const fields = item ? RebuildersBridge.toFoodFields(item) : null;
    if (!fields) { showToast(en ? 'AI could not find it. Register it yourself.' : 'AI가 찾지 못했어요. 직접 등록해 주세요.', 'info'); return; }
    const { displayName, ...rest } = fields;
    const foodName = displayName || name;
    await saveCustomFood(foodName, { ...rest, discoveredAt: new Date().toISOString(), discoveryOrigin: 'ai', unlocked: true });
    renderFoodexResults();
    openFoodDex({ name: foodName, ...CUSTOM_FOODS[foodName] }, { mode: 'index' });
  } catch {
    showToast(en ? 'Could not reach the AI. Try again later.' : 'AI에 연결하지 못했어요. 잠시 뒤 다시 해 주세요.', 'info');
  } finally {
    button.disabled = false;
    label.textContent = before;
  }
}

/* 음식 상세 → 식단에 추가(끼니 고르기) */
function syncFoodDexAdd(mode, food) {
  const wrap = document.getElementById('food-dex-add');
  if (!wrap) return;
  wrap.hidden = mode !== 'index' || !food?.name;
  wrap.__food = food;
  document.getElementById('food-dex-add-picker').hidden = true;
  document.getElementById('food-dex-add-btn').hidden = false;
  const date = document.getElementById('food-dex-add-date');
  if (date) date.textContent = `${formatDate(currentDate)} ${ACTIVE_LOCALE === 'en' ? '— pick a meal' : '· 어느 끼니에 넣을까요?'}`;
  document.querySelectorAll('#food-dex-add [data-add-meal]').forEach(button => { button.textContent = mealLabel(button.dataset.addMeal); });
}
document.getElementById('food-dex-add-btn')?.addEventListener('click', () => {
  document.getElementById('food-dex-add-btn').hidden = true;
  document.getElementById('food-dex-add-picker').hidden = false;
});
document.querySelectorAll('#food-dex-add [data-add-meal]').forEach(button => button.addEventListener('click', async () => {
  const food = document.getElementById('food-dex-add')?.__food;
  if (!food?.name) return;
  const mealId = button.dataset.addMeal;
  const { id, _isNew, ...clean } = food;
  void id; void _isNew;
  button.disabled = true;
  try {
    await addFood(mealId, clean);
    await registerLoggedFoods([clean]);
    closeFoodDex();
    showToast(ACTIVE_LOCALE === 'en' ? `Added to ${mealLabel(mealId)}` : `${mealLabel(mealId)}에 추가했어요`, 'success');
  } finally {
    button.disabled = false;
  }
}));

function getFoodEntries() {
  return Object.entries({ ...FOOD_DB, ...CUSTOM_FOODS });
}

async function loadCustomFoods() {
  const all = await storageRepository.getAll();
  CUSTOM_FOODS = all.customFoods || {};
  RECENT_FOODS = all.recentFoods || [];
}

async function saveRecentFood(food) {
  RECENT_FOODS = await storageRepository.saveRecentFood(food);
  return RECENT_FOODS;
}

async function saveCustomFood(name, foodData, previousName = null) {
  CUSTOM_FOODS = await storageRepository.saveCustomFood(name, foodData, previousName);
  return CUSTOM_FOODS;
}

// 기록하면서 처음 본 음식(내장 목록·내 음식에 없는 것)은 식도감에도 저장. 영양정보가 비어 있어도 이름으로 먼저 등록하고, 나중에 채워지면 갱신
async function registerLoggedFoods(foods) {
  let added = 0;
  for (const food of foods || []) {
    const name = food?.name;
    if (!name || FOOD_DB[name] || CUSTOM_FOODS[name]) continue;
    const { id, _isNew, slot, loggedVia, inputName, ...rest } = food;
    void id; void _isNew; void slot; void loggedVia; void inputName;
    try {
      await saveCustomFood(name, { ...rest, discoveredAt: new Date().toISOString(), discoveryOrigin: 'meal', unlocked: true });
      added += 1;
    } catch (error) { console.warn('register food', error); }
  }
  if (added && activeView === 'foodex') renderSearchHub();
  return added;
}

async function deleteCustomFood(name) {
  CUSTOM_FOODS = await storageRepository.deleteCustomFood(name);
  return CUSTOM_FOODS;
}


// 설정(프로필) 로드 및 UI 반영
async function loadSettings() {
  const settings = await storageRepository.getProfile();
  if (settings) {
    const savedLocale = settings.locale === 'ko' || settings.locale === 'en' ? settings.locale : DEFAULT_LOCALE;
    PROFILE = { ...PROFILE, ...settings, locale: savedLocale };
  }
  else PROFILE = { ...PROFILE, locale: DEFAULT_LOCALE };
  ACTIVE_LOCALE = PROFILE.locale === 'en' ? 'en' : 'ko';
  TARGETS = calcTargets(PROFILE.targetCal);
  updateProfileUI();
}

// 설정(프로필) 저장
async function saveSettings(profileData) {
  return storageRepository.saveProfile(profileData);
}

/** 특정 날짜의 식사 데이터 불러오기 */
async function loadDayFoods(dateStr) {
  return storageRepository.getDay(dateStr);
}

/** 현재 meals를 IndexedDB에 저장 */
async function saveDayFoods(dateStr, mealsData) {
  const day = dayDataFromMeals(mealsData);
  return storageRepository.saveDay(dateStr, day);
}

function dayDataFromMeals(mealsData) {
  return {
    breakfast: mealsData.breakfast.foods,
    lunch: mealsData.lunch.foods,
    snack: mealsData.snack.foods,
    dinner: mealsData.dinner.foods,
    mealTimes: cloneMealTimes(),
  };
}

/* ============================
   앱 상태
   ============================ */
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
let currentDate = new Date(); // 오늘 날짜로 시작
let currentMeal = null;
let mealTimes = defaultMealTimes();
let timelineEditing = false;
let activeMealPageContext = null;

// meals 객체: foods 배열은 날짜 전환 시 교체됨
const meals = {
  breakfast: { id: 'breakfast', ...MEAL_META.breakfast, foods: [] },
  lunch: { id: 'lunch', ...MEAL_META.lunch, foods: [] },
  snack: { id: 'snack', ...MEAL_META.snack, foods: [] },
  dinner: { id: 'dinner', ...MEAL_META.dinner, foods: [] },
};

/* ============================
   날짜 키 생성
   ============================ */
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ============================
   날짜별 데이터 로드
   ============================ */
async function loadCurrentDay() {
  const key = dateKey(currentDate);
  const data = await loadDayFoods(key);
  applyCurrentDayData(data);
}

function applyCurrentDayData(data) {
  const day = normalizeDayRecord(data || {}).day;
  MEAL_IDS.forEach(id => {
    meals[id].foods = day[id].map(f => ({ ...f }));
  });
  // snack은 MEAL_IDS에 없지만 별도로 로드
  meals.snack.foods = day.snack.map(f => ({ ...f }));
  mealTimes = normaliseMealTimes(data?.mealTimes);
}

/* ============================
   예전 방식으로 저장된 기록 정리(텔레그램 링크·이름만·AI 새 필드·'내일, 바나나' 등)
   - 지우지 않고 고침: id 부여, 이름은 글자로, 숫자 필드는 숫자 또는 비움(null), 간식 슬롯 보정
   ============================ */
const FOOD_NUMBER_FIELDS = ['cal', 'carbs', 'protein', 'fat', 'sugar', 'fiber', 'sodium', 'servingAmount'];
let foodIdSequence = 0;
function newFoodId() {
  foodIdSequence += 1;
  return `f-${Date.now().toString(36)}-${foodIdSequence.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}
function normalizeFoodEntry(raw, mealId) {
  if (raw === null || raw === undefined) return null;
  let food;
  if (typeof raw === 'string') food = { name: raw };
  else if (typeof raw === 'object' && !Array.isArray(raw)) food = { ...raw };
  else food = { name: String(raw) };
  // 예전 코드가 글자 하나짜리 기록('바나나')을 펼쳐 저장한 경우 {0:'바',1:'나',2:'나'} → 이름 되살리기
  if ((typeof food.name !== 'string' || !food.name.trim()) && typeof food[0] === 'string') {
    let chars = '';
    for (let i = 0; typeof food[i] === 'string'; i += 1) { chars += food[i]; delete food[i]; }
    if (chars.trim()) food.name = chars.trim();
  }
  if (typeof food.name !== 'string' || !food.name.trim()) {
    const alt = [food.name, food.officialName, food.displayName, food.inputName].find(v => (typeof v === 'string' && v.trim()) || typeof v === 'number');
    food.name = alt !== undefined ? String(alt).trim() : (ACTIVE_LOCALE === 'en' ? 'Unnamed food' : '이름 없는 음식');
  }
  if (typeof food.id !== 'string' || !food.id) food.id = newFoodId();
  if ((food.cal === undefined || food.cal === null) && food.nutrition && typeof food.nutrition === 'object') {
    const n = food.nutrition;
    const pick = (...keys) => keys.map(k => toNumberOrNull(n[k])).find(v => v !== null);
    const cal = pick('cal', 'kcal', 'calories');
    if (cal !== undefined) food.cal = cal;
    ['carbs', 'protein', 'fat'].forEach(k => { if (food[k] === undefined || food[k] === null) { const v = pick(k); if (v !== undefined) food[k] = v; } });
  }
  FOOD_NUMBER_FIELDS.forEach(key => {
    if (!(key in food)) return;
    const value = food[key];
    if (value === null || typeof value === 'number' && Number.isFinite(value)) return;
    food[key] = toNumberOrNull(value);
  });
  if (food.serving !== undefined && food.serving !== null && typeof food.serving !== 'string') {
    const s = food.serving;
    food.serving = typeof s === 'number' ? String(s)
      : Array.isArray(s) ? s.filter(v => typeof v === 'string' || typeof v === 'number').join(' ')
      : (typeof s === 'object' && typeof s.text === 'string') ? s.text
      : (typeof s === 'object' && s.amount !== undefined) ? `${s.amount}${typeof s.unit === 'string' ? s.unit : ''}`
      : '';
  }
  if (food.servingUnit !== undefined && food.servingUnit !== null && typeof food.servingUnit !== 'string') food.servingUnit = String(food.servingUnit);
  if (mealId === 'snack') {
    const slot = Number(food.slot);
    food.slot = SNACK_SLOTS.includes(slot) ? slot : 3;
  }
  return food;
}
function normalizeDayRecord(day) {
  const src = day && typeof day === 'object' ? day : {};
  const next = { ...src };
  ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealId => {
    let list = src[mealId];
    if (!Array.isArray(list)) list = list && typeof list === 'object' ? Object.values(list) : [];
    next[mealId] = list.map(item => normalizeFoodEntry(item, mealId)).filter(Boolean);
  });
  let changed = false;
  try { changed = JSON.stringify(next) !== JSON.stringify(src); } catch { changed = true; }
  return { day: next, changed };
}
/* 한 번만: 저장된 모든 날짜 기록 정리. 'YYYY-M-D'·'YYYY/MM/DD'·시간이 붙은 키는 'YYYY-MM-DD' 로 옮겨 합침(지우지 않음) */
const LEGACY_MIGRATION_KEY = 'rebuilders.entriesMigrated.v1';
async function migrateLegacyEntriesOnce() {
  try {
    if (localStorage.getItem(LEGACY_MIGRATION_KEY)) return { skipped: true };
  } catch { /* localStorage 없음 → 그래도 진행 */ }
  try {
    const all = await storageRepository.getAll();
    const next = { ...all };
    let changed = false;
    let moved = 0;
    let fixed = 0;
    Object.keys(all).forEach(key => {
      const m = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:$|[T\s])/.exec(key);
      if (!m) return;
      const canonical = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      const { day, changed: dayChanged } = normalizeDayRecord(all[key]);
      if (canonical !== key) {
        const target = normalizeDayRecord(next[canonical] || {}).day;
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach(id => { target[id] = [...target[id], ...day[id]]; });
        if (!target.mealTimes && day.mealTimes) target.mealTimes = day.mealTimes;
        next[canonical] = target;
        delete next[key];
        moved += 1;
        changed = true;
      } else if (dayChanged) {
        next[key] = day;
        fixed += 1;
        changed = true;
      }
    });
    if (changed) await storageRepository.replaceAll(next);
    try { localStorage.setItem(LEGACY_MIGRATION_KEY, new Date().toISOString()); } catch { /* ignore */ }
    if (changed) console.info('예전 기록 정리:', { fixed, moved });
    return { fixed, moved };
  } catch (error) {
    console.warn('예전 기록 정리 실패(앱은 계속 동작):', error);
    return { error: String(error) };
  }
}
/* 화면에 그리기 전 id 가 없는 항목에 id 부여(새로 추가한 항목 포함) */
function ensureFoodIds() {
  Object.entries(meals).forEach(([mealId, meal]) => {
    if (!Array.isArray(meal.foods)) { meal.foods = []; return; }
    if (meal.foods.some(f => !f || typeof f !== 'object' || typeof f.id !== 'string' || typeof f.name !== 'string')) {
      meal.foods = meal.foods.map(f => normalizeFoodEntry(f, mealId)).filter(Boolean);
    }
  });
}
/* 지금 목록에서 이 음식의 위치(id → 같은 객체 → 원래 번호 순) */
function resolveFoodIndex(mealId, idx, food) {
  const list = meals[mealId]?.foods;
  if (!Array.isArray(list)) return -1;
  if (food && typeof food === 'object' && food.id) {
    const byId = list.findIndex(f => f && f.id === food.id);
    if (byId >= 0) return byId;
  }
  if (food) {
    const byRef = list.indexOf(food);
    if (byRef >= 0) return byRef;
  }
  return Number.isInteger(idx) && idx >= 0 && idx < list.length ? idx : -1;
}

async function saveCurrentDay() {
  const k = dateKey(currentDate);
  const day = dayDataFromMeals(meals);
  if (statsCache) statsCache[k] = day;
  await saveDayFoods(k, meals);
}

/* ============================
   날짜 표시
   ============================ */
function formatDate(d) {
  if (ACTIVE_LOCALE === 'en') {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}(${DAYS[d.getDay()]})`;
}

function formatHomeDate(d) {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  if (ACTIVE_LOCALE === 'en') {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d).toLowerCase();
    return `${month}.${day} (${weekday})`;
  }
  return `${month}.${day} (${DAYS[d.getDay()]})`;
}

function isToday(d) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate();
}

function updateDateDisplay() {
  document.getElementById('current-date').textContent = formatHomeDate(currentDate);
  const badge = document.getElementById('date-badge') || document.querySelector('.date-badge');
  const goToday = document.getElementById('go-today');
  const today = isToday(currentDate);
  // 오늘이 아니면 어제/내일만 작게, 그 밖의 날은 비움
  const dayDiff = Math.round((new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 86400000);
  const relative = dayDiff === 0 ? ['오늘', 'Today'] : dayDiff === -1 ? ['어제', 'Yesterday'] : dayDiff === 1 ? ['내일', 'Tomorrow'] : null;
  if (badge) {
    badge.textContent = relative ? relative[ACTIVE_LOCALE === 'en' ? 1 : 0] : '';
    badge.hidden = !relative;
    badge.classList.toggle('is-relative', !today && !!relative);
  }
  document.getElementById('date-display')?.setAttribute('aria-label', `${formatHomeDate(currentDate)}. ${ACTIVE_LOCALE === 'en' ? 'Tap to go to today' : '눌러서 오늘로'}`);
  if (goToday) goToday.hidden = today;
  // 홈 건강 카드도 선택한 날짜로(연결 안 했으면 아무 일 없음)
  if (typeof refreshHeartRate === 'function' && globalThis.RebuildersHealth?.isSupported()) refreshHeartRate();
}

async function changeDate(delta) {
  currentDate.setDate(currentDate.getDate() + delta);
  await loadCurrentDay();
  updateDateDisplay();
  renderAll(true);
  if (activeView === 'search') renderSearchHub();
  if (activeView === 'stats') {
    renderStatsCalendar();
    renderStatsSelectedDay();
    renderStatsWeekChart();
    renderStatsMonthSummary();
  }
}

function applyExtendedStaticCopy() {
  const en = ACTIVE_LOCALE === 'en';
  const set = (selector, ko, english) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = en ? english : ko;
  };
  const label = (selector, ko, english) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('aria-label', en ? english : ko);
  };
  const placeholder = (selector, ko, english) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('placeholder', en ? english : ko);
  };

  label('.profile-summary-card', '현재 프로필', 'Current profile');
  label('#view-profile .profile-form-card', '신체 정보 수정', 'Edit body information');
  label('.language-choice', '언어', 'Language');
  set('#profile-save-hint', '저장됐어요', 'Saved');
  placeholder('#input-height', '예: 169', 'e.g. 169');
  placeholder('#input-weight', '예: 50', 'e.g. 50');
  placeholder('#input-target-cal', '예: 1300', 'e.g. 1300');
  label('.home-brand', 'Rebuilders Food Tracker 홈. Design your body.', 'Rebuilders Food Tracker home. Design your body.');
  label('#home-search', '음식 검색', 'Search foods');
  label('#search-hub-close', '음식 검색 닫기', 'Close food search');
  label('#btn-open-profile', '설정과 내정보 열기', 'Open settings and profile');
  label('#profile-close', '설정 닫기', 'Close settings');
  label('.day-summary', '영양소 현황', 'Nutrition summary');
  label('#prev-day', '이전 날', 'Previous day');
  label('#next-day', '다음 날', 'Next day');
  label('.player-measurements', '신체 정보', 'Body information');
  document.querySelectorAll('.vital-label[data-en]').forEach(el => { el.textContent = ACTIVE_LOCALE === 'en' ? el.dataset.en : el.dataset.ko; });
  label('.main-avatar', '사용자 픽셀 캐릭터', 'User pixel character');
  const macroAria = [t('carbs'), t('protein'), t('fat')];
  document.querySelectorAll('#view-home .macro-bar-track').forEach((item, index) => {
    item.setAttribute('aria-label', macroAria[index] || '');
  });
  label('.meals-section', '식사 기록', 'Meal records');
  set('#data-transfer-title', '내 데이터', 'My data');
  set('.data-transfer-sub', '기록을 파일로 백업하고 복원해요', 'Back up and restore your records with a file.');
  set('.local-data-badge', '이 기기에 저장', 'Saved on this device');
  set('#export-backup strong', '백업 파일로 내보내기', 'Export a backup file');
  set('#export-backup small', '식단·설정·내 음식을 JSON 파일 하나로 저장해요', 'Save meals, settings, and custom foods as one JSON file');
  set('.data-import-copy strong', '백업 파일에서 가져오기', 'Import from a backup file');
  set('.data-import-copy small', '이 앱에서 내보낸 JSON(.json) 파일만 가져올 수 있어요', 'Only JSON (.json) files exported from this app can be imported');
  set('.data-mode-label', '가져오는 방법', 'Import method');
  set('#import-mode option[value="replace"]', '전체를 백업 내용으로 교체', 'Replace everything with the backup');
  set('#import-mode option[value="merge"]', '기존 기록과 합치기 (같은 날짜는 백업 우선)', 'Merge with current records (backup wins on the same date)');
  set('#choose-import-file strong', '백업 파일 선택', 'Choose a backup file');
  set('#choose-import-file small', '선택 후 내용을 확인하고 가져와요', 'Review the contents before importing');
  set('#confirm-import', '이 내용 가져오기', 'Import these records');
  set('#cancel-import', '취소', 'Cancel');
  set('#load-sample strong', '샘플 식단 불러오기', 'Load sample meals');
  set('#load-sample small', '가상의 4일치 식단을 추가해 앱을 둘러봐요', 'Add four fictional days of meals to look around');
  set('#data-transfer-note', '백업 파일은 직접 보관해 주세요(예: iCloud Drive, 파일 앱). 앱을 삭제하거나 기기를 바꾸면 이 기기의 기록은 사라져요.', 'Keep your backup file somewhere safe (for example iCloud Drive or the Files app). Deleting the app or changing devices removes the records on this device.');
  set('#data-source-note', '내장 음식의 영양 정보는 USDA FoodData Central(fdc.nal.usda.gov)을 참고했고, 일부는 추정값이에요. 직접 등록한 음식은 입력한 값 그대로 사용돼요. 영양 정보는 참고용이며 의학적 조언이 아니에요.', 'Built-in nutrition information is based on USDA FoodData Central (fdc.nal.usda.gov); some values are estimates. Foods you add use the values you enter. Nutrition information is for reference only and is not medical advice.');
  set('#privacy-link', '개인정보 처리방침', 'Privacy policy');
  set('#reminder-title', '식사 기록 알림', 'Meal logging reminders');
  set('#reminder-copy', '정해진 시간에 이 기기에서 알려드려요. 서버를 거치지 않아요.', 'Reminders are scheduled on this device. Nothing goes through a server.');
  set('[data-reminder-enabled="off"]', '끄기', 'Off');
  set('[data-reminder-enabled="on"]', '켜기', 'On');
  set('label[for="reminder-breakfast"]', '아침', 'Breakfast');
  set('label[for="reminder-lunch"]', '점심', 'Lunch');
  set('label[for="reminder-dinner"]', '저녁', 'Dinner');
  set('#reminder-save', '알림 저장', 'Save reminders');

  label('#page-tabs', '페이지', 'Pages');
  label('#nav-settings', '설정', 'Settings');
  set('#nav-settings span', '설정', 'Settings');
  label('#nav-home', '식단', 'Meals');
  label('#nav-search', '식도감', 'Foodpedia');
  label('#nav-stats', '리포트', 'Report');
  label('#nav-chat', '채팅', 'Chat');
  label('#nav-shopping', '그로서리', 'Grocery');
  label('#foodex-tab-index', '음식', 'Food');
  set('#food-dex-add-btn', '식단에 추가', 'Add to meals');
  label('#foodex-tab-badge', '뱃지', 'Badges');
  set('#badge-title', '뱃지', 'Badges');
  set('#badge-sub', '기록을 이어가면 뱃지가 하나씩 열려요. 곧 만나요.', 'Badges unlock as you keep logging. Coming soon.');
  document.querySelectorAll('#badge-grid .badge-name').forEach(el => { el.textContent = ACTIVE_LOCALE === 'en' ? 'Coming soon' : '준비 중'; });
  { const fx = document.getElementById('foodex-search-input'); if (fx) { fx.placeholder = ACTIVE_LOCALE === 'en' ? 'Search Foodpedia' : '식도감에서 음식 검색'; fx.setAttribute('aria-label', fx.placeholder); } }
  label('#foodex-search-lead', '식도감 검색', 'Search Foodpedia');
  label('#foodex-search-send', '검색', 'Search');
  set('#food-dex-delete-btn', '식도감에서 지우기', 'Remove from Foodpedia');
  set('#food-dex-delete-msg', '이 음식을 식도감에서 지울까요? 이미 적은 식단 기록은 그대로 남아요.', 'Remove this food from Foodpedia? Meals you already logged stay as they are.');
  set('#food-dex-delete-cancel', '취소', 'Cancel');
  set('#food-dex-delete-yes', '삭제', 'Delete');
  label('#foodex-tab-recipe', '레시피', 'Recipes');

  label('#meal-page-back', '식단으로 돌아가기', 'Back to meals');
  label('.meal-page-summary', '끼니 요약', 'Meal summary');
  label('.cal-card', '월간 달력', 'Monthly calendar');
  label('#cal-prev-month', '이전 달', 'Previous month');
  label('#cal-month-picker', '연월 선택', 'Select year and month');
  label('#cal-next-month', '다음 달', 'Next month');
  label('#cal-grid', '날짜 선택', 'Select date');
  label('#stats-day-card', '선택한 날 요약', 'Selected day summary');
  label('#stats-day-meals', '선택한 날 끼니 상세', 'Selected day meal details');
  label('.stats-week-card', t('statsWeekTitle'), t('statsWeekTitle'));
  label('.stats-month-summary', t('statsMonthTitle'), t('statsMonthTitle'));
  set('.stats-day-label', t('statsSelectedDay'), t('statsSelectedDay'));
  set('#stats-day-empty', t('statsEmpty'), t('statsEmpty'));
  set('.stats-week-card .stats-section-title', t('statsWeekTitle'), t('statsWeekTitle'));
  set('.stats-week-hint', t('statsWeekHint'), t('statsWeekHint'));
  set('.stats-month-summary .stats-section-title', t('statsMonthTitle'), t('statsMonthTitle'));
  set('#stats-month-days + .stats-month-cap', t('statsLoggedDays'), t('statsLoggedDays'));
  set('#stats-month-avg + .stats-month-cap', t('statsAverage'), t('statsAverage'));
  set('#stats-month-hit + .stats-month-cap', t('statsUnderDays'), t('statsUnderDays'));
  set('#go-today', '오늘로', 'Today');
  set('#meal-page-back span', '식단', 'Meals');
  set('.meal-page-summary div:nth-child(1) > span', '섭취 시간', 'Time');
  set('.meal-page-summary div:nth-child(2) > span', '총 칼로리', 'Total calories');
  set('.meal-page-summary div:nth-child(3) > span', '음식 수', 'Foods');
  set('#meal-page-list-title', '기록한 음식', 'Logged foods');
  set('.meal-page-list-section > header > span', '음식을 누르면 영양성분을 볼 수 있어요', 'Tap a food to view nutrition');
  set('#meal-page-add span', '음식 검색', 'Search foods');
  set('#meal-page-empty-add', '+ 음식 검색하기', '+ Search foods');
  set('#cal-expand-toggle', document.getElementById('cal-expand-toggle')?.getAttribute('aria-expanded') === 'true' ? '접어두기' : '전체보기', document.getElementById('cal-expand-toggle')?.getAttribute('aria-expanded') === 'true' ? 'Collapse' : 'View all');
  set('#food-dex-nutrition-title', '영양성분', 'Nutrition');
  set('#food-dex-edit-record', '기록 수정', 'Edit this log');
  label('#time-edit-hour', '시', 'Hour');
  label('#time-edit-minute', '분', 'Minute');
  placeholder('#time-edit-input', '예: 03:19', 'e.g. 03:19');
  set('#storage-unavailable h1', '브라우저 저장소를 사용할 수 없어요', 'Browser storage is unavailable');
  set('#storage-unavailable-message', '식단을 안전하게 보관하려면 브라우저의 로컬 저장소가 필요해요.', 'Browser storage is required to safely keep your meal log.');
  set('#storage-unavailable .storage-unavailable-help', '사생활 보호 모드를 끄거나 사이트 데이터 저장을 허용한 뒤 다시 시도해 주세요.', 'Turn off private browsing or allow site data, then try again.');
  set('#storage-retry', '다시 시도', 'Try again');
  set('#food-dex-category', '오늘 먹은 음식', 'Today\'s food');
  set('#stats-open-day', '기록 보기', 'View log');
  document.querySelectorAll('.stats-day-metric-label').forEach((el, index) => el.textContent = [t('statsCalories'), t('statsCarbs'), t('statsProtein'), t('statsFat')][index] || '');
  document.querySelectorAll('.cal-legend-item').forEach((el, index) => el.lastChild.textContent = [t('statsUnder'), t('statsOnTarget'), t('statsOver')][index] || '');
  label('#foodex-library-close', t('foodexClose'), t('foodexClose'));
  label('#food-dex-close', '음식 정보 닫기', 'Close food information');
  label('#time-edit-modal .time-period-toggle', '오전 또는 오후', 'AM or PM');
  label('.search-index-viewbar', t('foodexViewOptions'), t('foodexViewOptions'));
  set('.search-index-sort .sr-only', t('foodexSort'), t('foodexSort'));
  label('#search-index-sort', t('foodexFoodSort'), t('foodexFoodSort'));
  set('[data-collection-view="recipes"]', t('collectionRecipes'), t('collectionRecipes'));
  set('[data-collection-view="products"]', t('collectionProducts'), t('collectionProducts'));
  set('[data-collection-view="fridge"]', t('collectionFridge'), t('collectionFridge'));
  set('[data-collection-id="demo-salad"] .collection-nutrition span',
    '탄수화물 12.1g · 단백질 8.4g · 지방 5.8g',
    'Carbs 12.1g · Protein 8.4g · Fat 5.8g');
  set('.collection-edit', '편집', 'Edit');
  set('.collection-log', '오늘 식단에 기록', 'Log today');
  document.querySelectorAll('.collection-card').forEach(card => ensureCollectionCardControls(card));
  label('.search-hub-tabs', '음식 찾기 기능', 'Food search features');
  label('.search-purpose-strip', '목적별 추천 검색', 'Goal-based suggestions');
  label('#search-index-categories', '음식 카테고리', 'Food categories');
  label('.collection-subtabs', '내 컬렉션 종류', 'Collection categories');

  set('#modal-close', '닫기', 'Close');
  label('#modal-overlay', '음식 추가', 'Add food');
  label('#food-modal-x', '음식 추가 창 닫기', 'Close add food');
  label('.food-tabs', '음식 추가 방식', 'Food entry method');
  label('.modal-record-options', '기록할 끼니', 'Meal to record');
  set('#modal-title', '음식 추가', 'Add food');
  set('#meal-detail-close', '취소', 'Cancel');
  set('#meal-detail-save-btn', '저장', 'Save');
  label('#meal-detail-modal', '음식 수정', 'Edit food');
  label('#meal-detail-x', '음식 수정 창 닫기', 'Close food editor');
  set('#edit-food-title', '음식 수정', 'Edit food');
  set('#time-edit-close', '취소', 'Cancel');
  set('#time-edit-save', '저장', 'Save');
  set('.time-edit-field > span', '정확한 시간 직접 입력', 'Exact time');
  set('[data-time-period="am"]', '오전', 'AM');
  set('[data-time-period="pm"]', '오후', 'PM');
  set('.time-quick-fields label:nth-child(1) > span', '시', 'Hour');
  set('.time-quick-fields label:nth-child(2) > span', '분', 'Minute');
  document.querySelectorAll('#time-edit-hour option').forEach(option => {
    option.textContent = en ? option.value : `${option.value}시`;
  });
  document.querySelectorAll('#time-edit-minute option').forEach(option => {
    option.textContent = en ? option.value : `${option.value}분`;
  });
  label('#time-edit-modal', '섭취 시간 수정', 'Edit meal time');
  set('#time-edit-title', '섭취 시간', 'Meal time');
  set('#tab-recent .recent-label-row > span', '최근 음식', 'Recent foods');
  placeholder('#custom-name', '예: 편의점 닭가슴살 샐러드', 'e.g. Chicken breast salad');
  placeholder('#custom-serving-amount', '예: 100', 'e.g. 100');
  placeholder('#custom-serving-grams', '선택', 'Optional');
  set('.serving-conversion-label', '환산 중량 g (선택 · 추정 가능)', 'Weight in g (optional · may be estimated)');
  const servingUnitLabels = en
    ? { g: 'g', ml: 'ml', '개': 'item', '봉지': 'bag', '팩': 'pack', '컵': 'cup', '접시': 'plate', '큰술': 'tbsp', '작은술': 'tsp' }
    : { g: 'g', ml: 'ml', '개': '개', '봉지': '봉지', '팩': '팩', '컵': '컵', '접시': '접시', '큰술': '큰술', '작은술': '작은술' };
  const servingUnitSelect = document.getElementById('custom-serving-unit');
  servingUnitSelect?.setAttribute('aria-label', en ? 'Serving unit' : '기준량 단위');
  servingUnitSelect?.querySelectorAll('option').forEach(option => {
    option.textContent = servingUnitLabels[option.value] || option.value;
  });
  placeholder('#custom-description', '맛, 특징, 먹는 방법 등을 적어보세요.', 'Add notes about taste, features, or how you eat it.');
  const advancedToggle = document.getElementById('custom-advanced-toggle');
  if (advancedToggle) {
    const expanded = advancedToggle.getAttribute('aria-expanded') === 'true';
    advancedToggle.textContent = en
      ? (expanded ? 'Hide detailed nutrition' : 'Show detailed nutrition')
      : (expanded ? '상세 영양성분 접기' : '상세 영양성분 펼치기');
  }

  label('#agent-help', 'AI 식단 기록 도움말', 'AI meal logging help');
  label('.chat-action-banners', '채팅 사용 안내', 'Chat usage guides');
  label('#agent-help-close', '도움말 닫기', 'Close help');
  label('#agent-voice', '음성으로 입력', 'Use voice input');
  label('#agent-send', '메시지 보내기', 'Send message');
  set('#agent-help-dialog .agent-help-card > span', '사용 안내', 'USER GUIDE');
  set('#agent-help-title', 'AI 채팅으로 식단 기록하기', 'Log meals with AI chat');
  set('#agent-help-dialog .agent-help-card > p', '앱 채팅은 음식과 끼니를 빠르게 기록합니다. 정확한 양은 저장 결과에서 확인·수정하세요.', 'In-app chat quickly records a known food and meal. Review and correct the exact amount after saving.');
  const helpRows = [...document.querySelectorAll('#agent-help-dialog dl > div')];
  const helpCopy = en ? [
    ['Log in app chat', 'Write a known food and meal, such as “I had a banana for breakfast.”'],
    ['Check the result', 'When the confirmation shows the meal and food, it has been added to today’s log.'],
    ['Register a new food', 'If it is not in Foodpedia, select Register manually, review nutrition, and save it.'],
    ['Log from an AI messaging app', 'Open the agent chat → confirm Rebuilders is connected → send meal, food, and amount → check the saved reply.'],
  ] : [
    ['앱 채팅으로 기록', '“아침 바나나”, “점심 이삭 햄치즈, 아아”처럼 끼니와 음식만 짧게 적어도 돼요. 쉼표·랑·하고로 여러 개를 한 번에 기록해요.'],
    ['저장 결과 확인', '완료 메시지에 끼니와 음식이 표시되면 오늘 식단에 기록된 상태예요.'],
    ['새 음식 등록', '식도감에 없는 음식은 이름만 먼저 저장돼요. 영양정보는 나중에 기록 상세에서 채우면 돼요.'],
    ['AI 메시지 앱으로 기록', '에이전트 대화 열기 → Rebuilders 연결 확인 → 끼니·음식·양 보내기 → 저장 완료 응답 확인 순서로 사용해요.'],
  ];
  helpRows.forEach((row, index) => {
    const copy = helpCopy[index];
    if (!copy) return;
    if (row.querySelector('dt')) row.querySelector('dt').textContent = copy[0];
    if (row.querySelector('dd')) row.querySelector('dd').textContent = copy[1];
  });
  refreshTelegramBannerState();

  const stockGuide = en ? [
    '<strong>Shopping</strong>: select ○ beside an item to mark it bought and move it to Stock.',
    'Or select <strong>Add item</strong> below to add food you already have.',
  ] : [
    '<strong>장보기</strong> 탭에서 항목 왼쪽 ○를 누르면 구매 완료 → 창고로 이동',
    '또는 아래 <strong>직접 추가</strong>로 보유 식품을 바로 적을 수 있어요',
  ];
  document.querySelectorAll('.stock-howto li').forEach((item, index) => {
    item.innerHTML = stockGuide[index] || '';
  });

  set('#view-search .search-index-intro p', '먹은 음식과 새 음식을 한곳에서 확인해요.', 'Review foods you eat and discover new ones in one place.');
  set('#search-index-sort option[value="alpha"]', '가나다순', 'A–Z');
  set('#search-index-sort option[value="frequent"]', '자주 먹은 순', 'Most eaten');
  set('#search-index-sort option[value="latest"]', '최신 등록순', 'Newest');
  set('#search-index-layout-cards', '카드 보기', 'Cards');
  set('#search-index-layout-list', '리스트 보기', 'List');
  set('.food-purpose-strip > strong', '목적별 추천', 'Goals');
  const purposes = en ? ['Balanced', 'Weight goals', 'Around workouts', 'Gentle meals'] : ['균형 식사', '체중 관리', '운동 전후', '부드러운 식사'];
  document.querySelectorAll('.food-purpose-strip > button').forEach((el, index) => { el.textContent = purposes[index] || ''; });

  set('[data-foodex-panel="recipe"] .collection-section > header h2', '마이 레시피', 'My recipes');
  set('[data-foodex-panel="recipe"] .collection-section > header p', '내가 만든 요리를 모아 한 번에 기록해요.', 'Save dishes you make and log them in one tap.');
  set('.search-inline-custom-head h2', '직접 등록', 'Register manually');
  set('.search-inline-custom-head p', '새 음식과 영양정보를 직접 입력해 내 제품에 저장해요.', 'Enter a food and its nutrition to save it to My products.');
  set('.search-products-section > header h2', '내 제품', 'My products');
  set('.search-products-section > header p', '직접 등록한 제품을 여기서 찾고 다시 기록할 수 있어요.', 'Find foods you registered and log them again.');
  set('[data-search-panel="stock"] .stock-section > header h2', '창고', 'Stock');
  set('[data-search-panel="stock"] .stock-section > header p', '집에 있는 재료·보유 식품을 관리해요.', 'Track ingredients and foods you already have.');
  set('[data-search-panel="store"] .store-placeholder h2', '스토어', 'Store');
  const storeCopy = document.querySelector('[data-search-panel="store"] .store-placeholder p');
  if (storeCopy) {
    storeCopy.textContent = en ? 'Coming soon.' : '곧 출시됩니다.';
  }
  set('#foodex-library-title', '식도감', 'Food guide');
  set('.collection-card-copy h3', '홈메이드 샐러드', 'Homemade Salad');
  set('.collection-card-copy p', '로메인 80g · 방울토마토 60g · 블루베리 30g · 삶은 달걀 1개', 'Romaine 80g · Cherry tomatoes 60g · Blueberries 30g · Boiled egg 1');
  set('#collection-add-demo', '오늘 식단에 기록', 'Log today');
  const collectionCreate = document.getElementById('collection-create');
  if (collectionCreate) {
    collectionCreate.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>';
    collectionCreate.setAttribute('aria-label', en ? 'Create collection' : '새 컬렉션 만들기');
    collectionCreate.title = en ? 'Create collection' : '새 컬렉션 만들기';
  }
  set('.collection-card .collection-edit', '편집', 'Edit');
  document.querySelectorAll('.collection-card').forEach(card => renderCollectionEvolution(card));

  set('.shopping-section > header h2', '장보기', 'Shopping list');
  set('.shopping-section > header p', '구매할 식품을 상태별로 관리해요.', 'Organize items by what to buy next.');
  set('#shopping-add-btn', '+ 항목 추가', '+ Add item');
  const shoppingHeadings = en
    ? { priority: 'Buy first', make: 'Make at home', compare: 'Compare', hold: 'Later' }
    : { priority: '먼저 구매', make: '직접 만들기', compare: '비교 중', hold: '나중에 확인' };
  NiliriStorage.SHOPPING_GROUPS.forEach((group, index) => {
    const h3 = document.querySelector(`.shopping-section [data-shopping-group="${group}"] > h3`);
    if (h3) h3.innerHTML = `${escapeHtml(shoppingHeadings[group])} <span>${index + 1}</span>`;
  });
  renderShopping();
  const fridgeHeading = document.querySelector('.shopping-fridge > h3');
  if (fridgeHeading) {
    fridgeHeading.innerHTML = `${en ? 'In stock' : '보유 중'} <span id="shopping-fridge-count">${document.querySelectorAll('#shopping-fridge-list article').length}</span>`;
  }
  set('.shopping-fridge-empty', '아직 창고에 담긴 식품이 없어요. 장보기에서 ○를 누르거나 직접 추가해 보세요.', 'Stock is empty. Check items on Shopping, or add them here.');
  set('#stock-add-btn', '+ 직접 추가', '+ Add item');
  set('.stock-section > header h2', '창고', 'Stock');
  set('.stock-section > header p', '집에 있는 재료·보유 식품을 관리해요.', 'Manage ingredients and foods you already have.');

  const weekdays = en ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['일', '월', '화', '수', '목', '금', '토'];
  document.querySelectorAll('.cal-weekdays span').forEach((el, index) => { el.textContent = weekdays[index] || ''; });
  const legend = en ? ['Under', 'On target', 'Over', 'Today'] : ['여유', '적정', '초과', '오늘'];
  document.querySelectorAll('.cal-legend-item').forEach((el, index) => {
    const marker = el.querySelector('i');
    el.textContent = legend[index] || '';
    if (marker) el.prepend(marker);
  });

  set('#agent-greeting-text', '오늘 무엇을 먹었나요?', 'What did you eat today?');
  set('#agent-display-name', 'AI 식단관리사', 'AI Meal Manager');
  set('#agent-page-title', 'AI 채팅', 'AI Chat');
  document.querySelectorAll('#view-ai .agent-name').forEach(el => {
    el.textContent = en ? 'AI Meal Manager' : 'AI 식단관리사';
  });
  const agentInput = document.getElementById('agent-input');
  if (agentInput) {
    agentInput.placeholder = en
      ? 'Log today’s meals'
      : '오늘 식단 기록하기';
  }
  set('#telegram-open-btn strong', '기록 안내', 'Logging guide');
  set('#telegram-open-btn small', '연결 후 텔레그램 사용', 'Set up Telegram');
  set('#telegram-share-btn strong', '공유하기', 'Share');
  set('#telegram-share-btn small', '링크 보내기', 'Send link');
  set('#telegram-help-btn strong', '사용 설명서', 'User guide');
  set('#telegram-help-btn small', '기능·설정 안내', 'Features & setup');
  refreshTelegramBannerState();
}

async function goToToday() {
  currentDate = new Date();
  await loadCurrentDay();
  updateDateDisplay();
  renderAll(true);
}

document.getElementById('prev-day').addEventListener('click', () => changeDate(-1));
document.getElementById('next-day').addEventListener('click', () => changeDate(+1));
document.getElementById('go-today')?.addEventListener('click', goToToday);
// 날짜를 누르면 언제나 오늘로 (이미 오늘이면 그대로)
document.getElementById('date-display')?.addEventListener('click', async () => {
  if (isToday(currentDate)) return;
  await goToToday();
  if (typeof playPageEnter === 'function' && activeView === 'home') playPageEnter(document.getElementById('view-home'));
});
// 전체 삭제: 편집할 때만, 시간 줄 위(왼쪽)에 작은 빨간 글자
{
  const clearBtn = document.getElementById('clear-day-btn');
  const head = document.querySelector('#view-home .section-head');
  if (clearBtn && head) head.insertBefore(clearBtn, head.firstChild);
}
document.getElementById('clear-day-btn')?.addEventListener('click', clearCurrentDay);

function setTimelineEditing(editing) {
  timelineEditing = editing;
  document.body.classList.toggle('timeline-editing', editing);
  const button = document.getElementById('timeline-edit-btn');
  if (button) {
    button.textContent = editing ? t('done') : t('edit');
    button.setAttribute('aria-pressed', String(editing));
  }
  renderAll(true);
}

document.getElementById('timeline-edit-btn')?.addEventListener('click', () => {
  setTimelineEditing(!timelineEditing);
});

/* ============================
   상태바 시각
   ============================ */
function updateStatusTime() {
  const now = new Date();
  document.getElementById('status-time').textContent =
    `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}
updateStatusTime();
setInterval(updateStatusTime, 30000);

/* ============================
   영양소 합산
   ============================ */
function getTotals() {
  return Object.values(meals).flatMap(m => m.foods).reduce(
    (acc, f) => {
      acc.cal += f.cal || 0;
      acc.carbs += f.carbs || 0;
      acc.protein += f.protein || 0;
      acc.fat += f.fat || 0;
      return acc;
    },
    { cal: 0, carbs: 0, protein: 0, fat: 0 }
  );
}

function getMealCal(mealId) {
  return meals[mealId].foods.reduce((s, f) => s + (f.cal || 0), 0);
}

/* 영양정보 미입력: 칼로리·탄수화물·단백질·지방 중 비어 있는 값이 있으면 미입력으로 봅니다.
   합계에서는 0으로 계산하되, 화면에는 "영양정보 미입력 n개"로 따로 알려줍니다. */
const NUTRITION_CORE_FIELDS = ['cal', 'carbs', 'protein', 'fat'];
function isBlankNutrient(value) {
  return value === undefined || value === null || value === '' || (typeof value === 'number' && !Number.isFinite(value));
}
function isNutritionMissing(food) {
  return Boolean(food) && NUTRITION_CORE_FIELDS.some(field => isBlankNutrient(food[field]));
}
function missingNutritionEntries() {
  const entries = [];
  [...MEAL_IDS, 'snack'].forEach(mealId => {
    (meals[mealId]?.foods || []).forEach((food, idx) => {
      if (isNutritionMissing(food)) entries.push({ mealId, idx, food });
    });
  });
  return entries;
}
function nutritionMissingLabel(count = 1) {
  if (ACTIVE_LOCALE === 'en') return count > 1 ? `${count} foods missing nutrition` : 'Nutrition not entered';
  return count > 1 ? `영양정보 미입력 ${count}개` : '영양정보 미입력';
}
function foodCalText(food) {
  return isBlankNutrient(food?.cal) ? (ACTIVE_LOCALE === 'en' ? '— kcal' : '— kcal') : `${Math.round(Number(food.cal) * 10) / 10}kcal`;
}
function updateNutritionMissingNote() {
  const note = document.getElementById('nutrition-missing-note');
  if (!note) return;
  const entries = missingNutritionEntries();
  note.hidden = entries.length === 0;
  if (!entries.length) return;
  note.innerHTML = `<span class="nutrition-missing-dot" aria-hidden="true"></span>${escapeHtml(ACTIVE_LOCALE === 'en' ? `${entries.length} missing nutrition` : `영양정보 미입력 ${entries.length}개`)}<em>${ACTIVE_LOCALE === 'en' ? 'Counted as 0 · Tap to fill in' : '합계에 0으로 계산 · 눌러서 채우기'}</em>`;
}

/* ============================
   칼로리 가로 게이지
   ============================ */
let ringAnimationFrame = null;
let displayedCalories = 0;
const RING_METRIC_MODES = ['eaten', 'remaining', 'target'];
let activeRingMetric = 'eaten';
/* 반원 게이지(캐릭터 자리): 먹은 ↔ 남은 칼로리. 고른 보기는 이 기기 localStorage 에만 기억 */
const KCAL_GAUGE_MODE_KEY = 'rebuilders.kcalGaugeMode.v1';
let kcalGaugeMode = (() => { try { return localStorage.getItem(KCAL_GAUGE_MODE_KEY) === 'left' ? 'left' : 'eaten'; } catch { return 'eaten'; } })();

function setKcalGaugeVisual(cal) {
  const gauge = document.getElementById('kcal-gauge');
  if (!gauge) return;
  const goal = Math.round(TARGETS.cal || 0);
  const eaten = Math.max(0, Math.round(cal));
  const diff = goal - eaten;
  const isOver = diff < 0;
  const isLeft = kcalGaugeMode === 'left';
  const ratio = goal > 0 ? Math.min(Math.max(cal, 0) / goal, 1) : 0;
  const fill = document.getElementById('kcal-gauge-fill');
  // 막대와 같은 방식: 넘으면 전체 = 먹은 양, 목표까지 검정·넘친 만큼 빨강
  const basePct = isOver && cal > 0 ? (goal / cal) * 100 : ratio * 100;
  const round2 = v => Math.round(v * 100) / 100;
  if (fill) fill.style.strokeDashoffset = String(round2(100 - basePct));
  if (fill) fill.style.opacity = basePct > 0.05 ? '1' : '0'; // 0kcal 일 때 둥근 끝 점 안 보이게
  const over = document.getElementById('kcal-gauge-over');
  if (over) {
    over.style.opacity = isOver ? '1' : '0';
    // 길이 0짜리 대시(둥근 끝 → 시작점 빨간 점)를 쓰지 않고, 넘친 길이만큼 대시를 목표 지점부터 시작
    over.style.strokeDasharray = isOver ? `${round2(100 - basePct)} 200` : '0 200';
    over.style.strokeDashoffset = isOver ? String(-round2(basePct)) : '0';
  }
  const labelText = isLeft ? t(isOver ? 'calorieOver' : 'calorieRemaining') : t('calorieEaten');
  const valueText = (isLeft ? Math.abs(diff) : eaten).toLocaleString();
  const label = document.getElementById('kcal-gauge-label');
  const value = document.getElementById('kcal-gauge-value');
  const goalEl = document.getElementById('kcal-gauge-goal');
  if (label) label.textContent = labelText;
  // 가운데 세 줄: 위 kcal · 큰 숫자 · 아래 줄(먹은 보기는 목표 숫자, 남음, 초과)
  const unitEl = gauge.querySelector('.kcal-gauge-unit');
  if (unitEl) unitEl.textContent = 'kcal';
  const statusEl = gauge.querySelector('.kcal-gauge-status');
  if (statusEl) statusEl.textContent = !isLeft ? (goal > 0 ? goal.toLocaleString() : '') : (ACTIVE_LOCALE === 'en' ? (isOver ? 'over' : 'left') : (isOver ? '초과' : '남음'));
  if (value) {
    value.textContent = valueText;
    // 긴 숫자는 글자를 줄여 게이지 안에 맞춤 (게이지 크기는 고정)
    value.classList.toggle('is-long', valueText.length >= 6);
    value.classList.toggle('is-xlong', valueText.length >= 8);
  }
  if (goalEl) goalEl.textContent = goal.toLocaleString();
  gauge.dataset.mode = kcalGaugeMode;
  gauge.classList.toggle('is-over', isOver);
  gauge.setAttribute('aria-pressed', String(isLeft));
  gauge.setAttribute('aria-label', `${labelText} ${valueText}kcal / ${goal.toLocaleString()}kcal. ${t('calorieSwitch')}`);
}

function setRingVisual(cal) {
  const roundedCal = Math.round(cal);
  setKcalGaugeVisual(cal);
  const progress = document.getElementById('calorie-progress-fill');
  const isOver = roundedCal > TARGETS.cal;
  const displayMax = isOver ? Math.max(roundedCal, TARGETS.cal + 1) : TARGETS.cal;
  const progressPercent = displayMax > 0 ? Math.min((cal / displayMax) * 100, 100) : 0;
  const targetPercent = displayMax > 0 ? Math.min((TARGETS.cal / displayMax) * 100, 100) : 0;
  const normalPercent = Math.min(progressPercent, targetPercent);
  if (progress) progress.style.width = `${normalPercent}%`;
  const overFill = document.getElementById('calorie-over-fill');
  if (overFill) {
    overFill.hidden = !isOver;
    overFill.style.left = `${targetPercent}%`;
    overFill.style.width = `${Math.max(0, progressPercent - targetPercent)}%`;
  }
  const calorieDifference = TARGETS.cal - roundedCal;
  const metric = activeRingMetric === 'target'
    ? { label: t('calorieTarget'), value: TARGETS.cal }
    : activeRingMetric === 'remaining'
      ? { label: t(calorieDifference < 0 ? 'calorieOver' : 'calorieRemaining'), value: Math.abs(calorieDifference) }
      : { label: t('calorieEaten'), value: roundedCal };
  const label = document.getElementById('ring-metric-label');
  const value = document.getElementById('ring-metric-value');
  const targetValue = document.getElementById('kcal-target-value');
  const overNote = document.getElementById('kcal-over-note');
  const targetMarker = document.getElementById('kcal-target-marker');
  const overBubble = document.getElementById('kcal-over-bubble');
  const toggle = document.getElementById('calorie-summary-toggle');
  updateCharacterVisual(roundedCal);
  const shortLabel = activeRingMetric === 'target'
    ? (ACTIVE_LOCALE === 'en' ? 'Target' : '목표')
    : activeRingMetric === 'remaining'
      ? (ACTIVE_LOCALE === 'en' ? (calorieDifference < 0 ? 'Over' : 'Left') : (calorieDifference < 0 ? '초과' : '남음'))
      : 'Kcal';
  if (label) label.textContent = shortLabel;
  if (value) value.textContent = Math.round(metric.value).toLocaleString();
  if (targetValue) targetValue.textContent = TARGETS.cal.toLocaleString();
  if (overNote) {
    overNote.hidden = true;
    overNote.textContent = '';
  }
  if (targetMarker) {
    targetMarker.hidden = !isOver;
    targetMarker.style.left = `${targetPercent}%`;
  }
  if (overBubble) {
    overBubble.hidden = !isOver;
    const markerPercent = (TARGETS.cal / displayMax) * 100;
    overBubble.style.left = `${markerPercent}%`;
    overBubble.classList.toggle('is-near-end', markerPercent > 88);
    overBubble.textContent = isOver
      ? `+${(roundedCal - TARGETS.cal).toLocaleString()} ${ACTIVE_LOCALE === 'en' ? 'over' : '초과'}`
      : '';
  }
  if (toggle) {
    toggle.classList.toggle('is-over', isOver);
    toggle.dataset.metric = activeRingMetric;
    toggle.setAttribute('aria-valuenow', String(Math.round(progressPercent)));
    toggle.setAttribute('aria-label', `${metric.label} ${Math.round(metric.value).toLocaleString()}kcal. ${t('calorieSwitch')}`);
  }
}

function updateCharacterVisual(calories) {
  const avatarWrap = document.querySelector('#view-home .main-avatar');
  const avatar = avatarWrap?.querySelector('.pixel-avatar');
  if (!avatarWrap || !avatar) return;

  const ratio = TARGETS.cal > 0 ? calories / TARGETS.cal : 0;
  const state = ratio > 1 ? 'full' : calories <= 0 ? 'hungry' : 'balanced';
  const labels = ACTIVE_LOCALE === 'en'
    ? { hungry: 'Calories are still low', balanced: 'Calories are in the target range', full: 'Calories are over the target' }
    : { hungry: '섭취 칼로리가 낮은 상태', balanced: '섭취 칼로리가 적정한 상태', full: '섭취 칼로리가 목표를 초과한 상태' };

  if (avatarWrap.dataset.calorieState !== state) {
    avatarWrap.dataset.calorieState = state;
    avatar.src = CHARACTER_ASSETS[state];
    updateLevelMessage(state);
  }
  avatarWrap.setAttribute('aria-label', labels[state]);
}

document.getElementById('calorie-summary-toggle')?.addEventListener('click', () => {
  const currentIndex = RING_METRIC_MODES.indexOf(activeRingMetric);
  activeRingMetric = RING_METRIC_MODES[(currentIndex + 1) % RING_METRIC_MODES.length];
  setRingVisual(displayedCalories);
});

document.getElementById('kcal-gauge')?.addEventListener('click', () => {
  kcalGaugeMode = kcalGaugeMode === 'left' ? 'eaten' : 'left';
  try { localStorage.setItem(KCAL_GAUGE_MODE_KEY, kcalGaugeMode); } catch {}
  setKcalGaugeVisual(displayedCalories);
});

function updateRing(totals, animate = false) {
  if (reduceMotion()) animate = false;
  const t = totals || getTotals();
  const targetCal = Math.round(t.cal);

  if (ringAnimationFrame) cancelAnimationFrame(ringAnimationFrame);

  if (!animate) {
    displayedCalories = targetCal;
    setRingVisual(displayedCalories);
    return;
  }

  const startCal = displayedCalories;
  const diff = targetCal - startCal;
  const duration = 450;
  const startedAt = performance.now();

  function step(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayedCalories = startCal + diff * eased;
    setRingVisual(displayedCalories);

    if (progress < 1) {
      ringAnimationFrame = requestAnimationFrame(step);
    } else {
      displayedCalories = targetCal;
      setRingVisual(displayedCalories);
      ringAnimationFrame = null;
    }
  }

  ringAnimationFrame = requestAnimationFrame(step);
}

/* ============================
   영양소 막대
   ============================ */
let macroAnimationFrame = null;
let displayedMacros = { carbs: 0, protein: 0, fat: 0 };

function setMacroVisual(t) {
  [
    { key: 'carbs', barId: 'bar-carbs', valId: 'val-carbs', target: TARGETS.carbs },
    { key: 'protein', barId: 'bar-protein', valId: 'val-protein', target: TARGETS.protein },
    { key: 'fat', barId: 'bar-fat', valId: 'val-fat', target: TARGETS.fat },
  ].forEach(({ key, barId, valId, target }) => {
    const val = Math.round(t[key] * 10) / 10;
    const isOver = val > target;
    const displayMax = isOver ? Math.max(val, target + 0.1) : target;
    const progressPercent = displayMax > 0 ? Math.min((val / displayMax) * 100, 100) : 0;
    const targetPercent = displayMax > 0 ? Math.min((target / displayMax) * 100, 100) : 0;
    const bar = document.getElementById(barId);
    bar.style.width = `${Math.min(progressPercent, targetPercent)}%`;
    const track = bar.closest('[role="progressbar"]');
    if (track) {
      let overFill = track.querySelector('.macro-over-fill');
      let marker = track.querySelector('.macro-target-marker');
      if (!overFill) {
        overFill = document.createElement('span');
        overFill.className = 'macro-over-fill';
        track.appendChild(overFill);
      }
      if (!marker) {
        marker = document.createElement('span');
        marker.className = 'macro-target-marker';
        track.appendChild(marker);
      }
      track.classList.toggle('is-over', isOver);
      overFill.hidden = !isOver;
      overFill.style.left = 'auto';
      overFill.style.right = '0';
      overFill.style.width = `${Math.max(0, progressPercent - targetPercent)}%`;
      marker.hidden = !isOver;
      marker.style.left = `${targetPercent}%`;
    }
    track?.setAttribute('aria-valuenow', String(Math.round((val / target) * 100)));
    track?.setAttribute('aria-valuetext', `${val}g / ${target}g`);
    document.getElementById(valId).textContent = `${val} / ${target}g`;
  });
}

function updateMacroBars(totals, animate = false) {
  if (reduceMotion()) animate = false;
  const targetValues = totals || getTotals();
  if (macroAnimationFrame) cancelAnimationFrame(macroAnimationFrame);

  if (!animate) {
    displayedMacros = {
      carbs: targetValues.carbs || 0,
      protein: targetValues.protein || 0,
      fat: targetValues.fat || 0,
    };
    setMacroVisual(displayedMacros);
    return;
  }

  const startValues = { ...displayedMacros };
  const endValues = {
    carbs: targetValues.carbs || 0,
    protein: targetValues.protein || 0,
    fat: targetValues.fat || 0,
  };
  const duration = 450;
  const startedAt = performance.now();

  function step(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayedMacros = {
      carbs: startValues.carbs + (endValues.carbs - startValues.carbs) * eased,
      protein: startValues.protein + (endValues.protein - startValues.protein) * eased,
      fat: startValues.fat + (endValues.fat - startValues.fat) * eased,
    };
    setMacroVisual(displayedMacros);

    if (progress < 1) {
      macroAnimationFrame = requestAnimationFrame(step);
    } else {
      displayedMacros = endValues;
      setMacroVisual(displayedMacros);
      macroAnimationFrame = null;
    }
  }

  macroAnimationFrame = requestAnimationFrame(step);
}

/* ============================
   식사 카드 렌더
   ============================ */
/* 맥 미니 AI가 채운 값(추정) 표시. 사용자가 직접 고치면 sourceTrust 가 'user' 로 바뀌어 사라짐 */
function isAiEstimate(food) {
  return Boolean(food?.aiEstimate) && food.sourceTrust !== 'user' && !isNutritionMissing(food);
}
function aiEstimateTag(food) {
  if (!isAiEstimate(food)) return '';
  return `<span class="macro-tag ai-estimate-tag">${ACTIVE_LOCALE === 'en' ? 'AI est.' : 'AI 추정'}</span>`;
}
function aiSourceText(food) {
  if (!isAiEstimate(food)) return '';
  return ACTIVE_LOCALE === 'en' ? 'AI estimate (found by the Mac mini AI). Please edit it if it looks wrong.' : 'AI 추정값이에요(맥 미니 AI가 찾음). 틀리면 수정해 주세요.';
}

/* 출처는 긴 주소 대신 짧은 사이트 이름만(예: FatSecret, USDA). 주소가 있으면 눌러서 열기 */
const SOURCE_SITE_NAMES = [
  [/fatsecret/i, 'FatSecret'], [/usda|fdc\.nal/i, 'USDA'], [/foodsafetykorea|mfds|식약처|식품의약품안전처/i, '식약처'],
  [/calo\.kr|칼로/i, '칼로'], [/pillyze|필라이즈/i, '필라이즈'], [/paris\.co\.kr|파리바게뜨/i, '파리바게뜨'],
  [/starbucks|스타벅스/i, '스타벅스'], [/myfitnesspal/i, 'MyFitnessPal'], [/nutritionix/i, 'Nutritionix'],
  [/isaac-toast|isaactoast|이삭토스트/i, '이삭토스트'], [/dietshin|다이어트신/i, '다이어트신'], [/openfoodfacts/i, 'Open Food Facts'],
];
function sourceSiteName(food) {
  let host = '';
  try { host = new URL(food?.sourceUrl || '').hostname.replace(/^www\./, ''); } catch { /* 주소 없음 */ }
  for (const [re, label] of SOURCE_SITE_NAMES) if (host && re.test(host)) return label;
  if (host) {
    const parts = host.split('.');
    const main = parts.length > 2 && /^(co|or|go|ac|com|net|ne)$/.test(parts[parts.length - 2]) ? parts[parts.length - 3] : (parts[parts.length - 2] || parts[0]);
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  const note = String(food?.sourceNote || '');
  for (const [re, label] of SOURCE_SITE_NAMES) if (re.test(note)) return label;
  return note.replace(/^추정:\s*/, '').split(/[\s(·,]/)[0].slice(0, 20);
}
function appendAiSourceLink(host, food) {
  const name = sourceSiteName(food);
  if (!name) return;
  const en = ACTIVE_LOCALE === 'en';
  host.appendChild(document.createTextNode(`\n${en ? 'Source' : '출처'}: `));
  let url = '';
  try { const u = new URL(food.sourceUrl || ''); if (u.protocol === 'https:') url = u.href; } catch { /* 없음 */ }
  if (!url) { host.appendChild(document.createTextNode(name)); return; }
  const link = document.createElement('a');
  link.className = 'ai-source-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = name;
  link.setAttribute('aria-label', en ? `Open source: ${name}` : `출처 열기: ${name}`);
  link.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); openExternalUrl(url); });
  host.appendChild(link);
}

function nutritionTags(food) {
  const tags = [
    ['carbs-tag', ACTIVE_LOCALE === 'en' ? 'C' : '탄', food.carbs, 'g'],
    ['protein-tag', ACTIVE_LOCALE === 'en' ? 'P' : '단', food.protein, 'g'],
    ['fat-tag', ACTIVE_LOCALE === 'en' ? 'F' : '지', food.fat, 'g'],
    ['sugar-tag', ACTIVE_LOCALE === 'en' ? 'Sugar' : '당', food.sugar, 'g'],
    ['fiber-tag', ACTIVE_LOCALE === 'en' ? 'Fiber' : '식섬', food.fiber, 'g'],
    ['sat-fat-tag', ACTIVE_LOCALE === 'en' ? 'Sat' : '포화', food.saturatedFat, 'g'],
    ['trans-fat-tag', ACTIVE_LOCALE === 'en' ? 'Trans' : '트랜스', food.transFat, 'g'],
    ['cholesterol-tag', ACTIVE_LOCALE === 'en' ? 'Chol' : '콜', food.cholesterol, 'mg'],
    ['sodium-tag', ACTIVE_LOCALE === 'en' ? 'Sodium' : '나트륨', food.sodium, 'mg'],
  ];

  return tags
    .filter(([, , value]) => value !== undefined && value !== null && value !== '')
    .map(([className, label, value, unit]) =>
      `<span class="macro-tag ${className}">${escapeHtml(label)} ${escapeHtml(value)}${escapeHtml(unit)}</span>`
    )
    .join('');
}

function dragHandleSvg() {
  return '<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.4"/><circle cx="9" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="9" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="9" cy="13" r="1.4"/></svg>';
}

function createFoodItemEl(food, dragCtx, onEdit, onDelete) {
  if (!food || typeof food !== 'object') food = { name: String(food ?? '') };
  const visibleName = displayFoodName(food);
  const dragLabel = ACTIVE_LOCALE === 'en' ? `${visibleName} drag to move` : `${visibleName} 드래그해서 이동`;
  const editLabel = ACTIVE_LOCALE === 'en' ? `Edit ${visibleName}` : `${visibleName} 수정`;
  const deleteLabel = ACTIVE_LOCALE === 'en' ? `Delete ${visibleName}` : `${visibleName} 삭제`;
  const div = document.createElement('div');
  if (food._isNew) {
    div.className = 'food-item newly-added';
    delete food._isNew;
  } else {
    div.className = 'food-item';
  }
  if (food.id) div.dataset.foodId = food.id;
  div.tabIndex = 0;
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `${visibleName} ${ACTIVE_LOCALE === 'en' ? 'nutrition details' : '제품 정보 보기'}`);
  div.innerHTML = `
    <button type="button" class="food-drag-handle" aria-label="${escapeHtml(dragLabel)}" title="${ACTIVE_LOCALE === 'en' ? 'Drag to move' : '드래그해서 이동'}">${dragHandleSvg()}</button>
    <div class="food-main">
      <span class="food-name">${escapeHtml(visibleName)}</span>
      <div class="food-detail-line">
        <span class="food-cal">${foodCalText(food)}</span>
        <div class="food-macros">${isNutritionMissing(food) ? `<span class="macro-tag nutrition-missing-tag">${escapeHtml(nutritionMissingLabel())}</span>` : ''}${aiEstimateTag(food)}${nutritionTags(food)}</div>
      </div>
    </div>
    <div class="food-actions">
      <button type="button" class="food-edit" aria-label="${escapeHtml(editLabel)}" title="${ACTIVE_LOCALE === 'en' ? 'Edit nutrition' : '영양 수정'}"><img src="assets/icon/buttons/pen.svg" width="16" height="16" alt="" aria-hidden="true" /></button>
      <button type="button" class="food-del" aria-label="${escapeHtml(deleteLabel)}"><img src="assets/icon/buttons/delete.svg" width="16" height="16" alt="" aria-hidden="true" /></button>
    </div>
  `;
  const openDetails = event => {
    if (event.target.closest('button')) return;
    openFoodDex(food, { mode: 'meal', editContext: dragCtx });
  };
  div.addEventListener('click', openDetails);
  div.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openFoodDex(food, { mode: 'meal', editContext: dragCtx });
  });
  setupFoodItemDragHandle(div.querySelector('.food-drag-handle'), dragCtx);
  div.querySelector('.food-edit').addEventListener('click', e => {
    e.stopPropagation();
    onEdit();
  });
  div.querySelector('.food-del').addEventListener('click', async e => {
    e.stopPropagation();
    await runButtonAction(e.currentTarget, onDelete);
  });
  return div;
}

function renderMeal(mealId) {
  const meal = meals[mealId];
  const cal = getMealCal(mealId);
  const foods = meal.foods;
  const card = document.getElementById(`${mealId}-card`);

  card.classList.toggle('has-items', foods.length > 0);
  if (!foods.length) card.classList.remove('expanded');
  card.querySelector('.drag-handle')?.classList.toggle('is-disabled', !foods.length || card.classList.contains('expanded'));
  const infoButton = card.querySelector('[data-expand-meal]');
  if (infoButton) {
    infoButton.disabled = foods.length === 0;
    infoButton.setAttribute('aria-disabled', String(foods.length === 0));
    infoButton.setAttribute('aria-label', foods.length
      ? (ACTIVE_LOCALE === 'en' ? `View ${mealLabel(mealId)} foods` : `${mealLabel(mealId)} 음식 목록 보기`)
      : (ACTIVE_LOCALE === 'en' ? `No ${mealLabel(mealId)} records` : `${mealLabel(mealId)} 기록 없음`));
    infoButton.setAttribute('aria-expanded', String(card.classList.contains('expanded')));
  }
  card.querySelector('.meal-name').textContent = mealLabel(mealId);
  ensureCardRecordActions(mealId);
  card.querySelector('.card-clear-record')?.toggleAttribute('disabled', !foods.length);
  renderTimeControl(mealId);

  document.getElementById(`${mealId}-kcal`).textContent = `${Math.round(cal)}kcal`;
  document.getElementById(`${mealId}-foods`).textContent =
    foods.length ? foods.map(displayFoodName).join(', ') : '';

  const itemsEl = document.getElementById(`${mealId}-items`);
  const isDragSource = itemsEl.querySelector('.food-item.is-dragging') !== null;

  if (!isDragSource) {
    itemsEl.innerHTML = '';
    foods.forEach((food, idx) => {
      itemsEl.appendChild(createFoodItemEl(
        food,
        { kind: 'meal', mealId, idx },
        () => openFoodEdit(mealId, resolveFoodIndex(mealId, idx, food)),
        () => removeFood(mealId, idx, food),
      ));
    });
  }
}

function dayHasAnyFood() {
  return Object.values(meals).some(m => (m.foods || []).length > 0);
}

function updateClearDayButton() {
  const btn = document.getElementById('clear-day-btn');
  if (!btn) return;
  const has = dayHasAnyFood();
  btn.disabled = !has;
  btn.title = has
    ? (ACTIVE_LOCALE === 'en' ? 'Delete every meal and snack logged on this day' : '이 날 아침·점심·저녁·간식을 모두 삭제')
    : (ACTIVE_LOCALE === 'en' ? 'Available when this day has a food log' : '이 날 기록이 있을 때 사용할 수 있어요');
}

async function clearCurrentDay() {
  if (!dayHasAnyFood()) {
    showToast(ACTIVE_LOCALE === 'en' ? 'There is no log to delete.' : '삭제할 기록이 없어요.', 'info');
    return;
  }
  const label = formatDate(currentDate);
  const message = ACTIVE_LOCALE === 'en'
    ? `Delete every meal and snack logged on ${label}?`
    : `${label} 식단을 모두 삭제할까요?\n아침·점심·저녁·간식이 전부 지워집니다.`;
  if (!confirm(message)) return;

  const before = snapshotMeals();
  MEAL_IDS.forEach(id => { meals[id].foods = []; });
  meals.snack.foods = [];
  mealTimes = defaultMealTimes();
  renderAll(false);
  try {
    await saveCurrentDay();
    document.querySelectorAll('.meal-card.expanded, .snack-card.expanded').forEach(el => {
      el.classList.remove('expanded');
      el.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
    });
  } catch (error) {
    restoreMeals(before);
    renderAll(true);
    showStorageFailure(error);
  }
}

/** skipAnimation이 false이면 링/막대가 현재 값까지 애니메이션됩니다. */
function updateTimelineStates() {
  const today = isToday(currentDate);

  // 끼니별 기준 시간대 (분 단위)
  const mealBoundaries = {
    breakfast: { start: 0, end: 11 * 60 },       // 00:00 ~ 11:00
    lunch: { start: 11 * 60, end: 17 * 60 },    // 11:00 ~ 17:00
    dinner: { start: 17 * 60, end: 24 * 60 },    // 17:00 ~ 24:00
  };

  MEAL_IDS.forEach(id => {
    const card = document.getElementById(`${id}-card`);
    if (!card) return;
    if (!today) {
      card.classList.remove('is-past', 'is-current', 'is-future');
      return;
    }
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const { start, end } = mealBoundaries[id];
    const isPast = nowMins >= end;
    const isCurrent = nowMins >= start && nowMins < end;
    card.classList.toggle('is-past', isPast && !isCurrent);
    card.classList.toggle('is-current', isCurrent);
    card.classList.toggle('is-future', !isPast && !isCurrent);
  });

  // 간식 슬롯도 동일 적용
  const snackBoundaries = [
    { start: 0, end: 8 * 60 },  // 아침 전
    { start: 8 * 60, end: 12 * 60 },  // 아침 후
    { start: 12 * 60, end: 17 * 60 },  // 점심 후
    { start: 17 * 60, end: 24 * 60 },  // 저녁 후
  ];
  SNACK_SLOTS.forEach(slot => {
    const card = document.getElementById(`snack-slot-${slot}`);
    if (!card) return;
    if (!today) {
      card.classList.remove('is-past', 'is-current', 'is-future');
      return;
    }
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const { end } = snackBoundaries[slot];
    const isPast = nowMins >= end;
    card.classList.toggle('is-past', isPast);
    card.classList.remove('is-current');
    card.classList.toggle('is-future', !isPast);
  });
}

function renderAll(skipAnimation = false) {
  ensureFoodIds();
  MEAL_IDS.forEach(renderMeal);
  renderSnack();
  updateTimelineStates();
  updateClearDayButton();
  updateNutritionMissingNote();
  const t = getTotals();

  if (skipAnimation) {
    updateRing(t, false);
    updateMacroBars(t, false);
  } else {
    updateRing(t, true);
    updateMacroBars(t, true);
  }
  if (activeMealPageContext) renderMealPage();
}

document.getElementById('nutrition-missing-note')?.addEventListener('click', () => {
  const first = missingNutritionEntries()[0];
  if (first) openFoodEdit(first.mealId, first.idx);
});

// 매 분마다 타임라인 상태 갱신
setInterval(updateTimelineStates, 60_000);


/* ============================
   간식 섹션 렌더 (먹은 슬롯만 표시)
   ============================ */
function snackFoodsForSlot(slot) {
  return meals.snack.foods
    .map((f, i) => ({ food: f, idx: i }))
    .filter(item => (item.food.slot ?? 3) === slot);
}

function getDefaultSnackSlot() {
  const hours = new Date().getHours();
  if (hours < 9) return 0;
  if (hours < 13) return 1;
  if (hours < 18) return 2;
  return 3;
}

function renderSnackSlot(slot) {
  const slotEl = document.getElementById(`snack-slot-${slot}`);
  const foodsEl = document.getElementById(`snack-chips-${slot}`);
  const kcalEl = document.getElementById(`snack-slot-kcal-${slot}`);
  const itemsEl = document.getElementById(`snack-items-${slot}`);
  if (!slotEl || !foodsEl || !itemsEl) return;

  const isDragSource = itemsEl.querySelector('.food-item.is-dragging') !== null;
  const entries = snackFoodsForSlot(slot);

  slotEl.querySelector('.snack-name').textContent = t('snack');
  ensureCardRecordActions('snack', slot);
  slotEl.querySelector('.card-clear-record')?.toggleAttribute('disabled', !entries.length);
  renderTimeControl('snack', slot);

  // 안 먹은 간식 슬롯은 평소 타임라인에 숨기고, 드래그 중에는 드롭 자리로만 보인다.
  if (!entries.length) {
    const isFoodDragActive = document.body.classList.contains('food-drag-active');
    const placeholderSlot = Number.parseInt(document.body.dataset.snackDropSlot ?? '', 10);
    const showPlaceholder = isFoodDragActive && placeholderSlot === slot;
    slotEl.hidden = !showPlaceholder;
    slotEl.classList.toggle('drop-placeholder', showPlaceholder);
    slotEl.classList.remove('expanded', 'has-items');
    itemsEl.innerHTML = '';
    if (kcalEl) kcalEl.textContent = '';
    foodsEl.textContent = '';
    return;
  }

  slotEl.hidden = false;
  slotEl.classList.remove('drop-placeholder');
  slotEl.classList.add('has-items');
  slotEl.querySelector('.drag-handle')?.classList.remove('is-disabled');

  const totalKcal = entries.reduce((s, { food }) => s + (food.cal || 0), 0);
  if (kcalEl) kcalEl.textContent = `${Math.round(totalKcal)}kcal`;
  foodsEl.textContent = entries.map(({ food }) => displayFoodName(food)).join(', ');

  if (!isDragSource) {
    itemsEl.innerHTML = '';
    entries.forEach(({ food, idx }) => {
      itemsEl.appendChild(createFoodItemEl(
        food,
        { kind: 'snack', mealId: 'snack', idx, slot },
        () => openFoodEdit('snack', resolveFoodIndex('snack', idx, food)),
        () => removeFood('snack', idx, food),
      ));
    });
  }
}

function renderSnack() {
  SNACK_SLOTS.forEach(renderSnackSlot);
}

/* ============================
   끼니별 음식 관리 페이지
   ============================ */
function mealPageEntries() {
  if (!activeMealPageContext) return [];
  const { mealId, slot } = activeMealPageContext;
  if (mealId === 'snack') return snackFoodsForSlot(slot);
  return (meals[mealId]?.foods || []).map((food, idx) => ({ food, idx }));
}

function renderMealPage() {
  const page = document.getElementById('view-meal-detail');
  if (!page || !activeMealPageContext) return;
  const { mealId, slot } = activeMealPageContext;
  const entries = mealPageEntries();
  const totalKcal = entries.reduce((sum, { food }) => sum + (food.cal || 0), 0);
  const time = timeEntryFor(mealId, mealId === 'snack' ? slot : null)?.value || '--:--';

  document.getElementById('meal-page-date').textContent = formatHomeDate(currentDate);
  document.getElementById('meal-page-title').textContent = mealLabel(mealId);
  document.getElementById('meal-page-time').textContent = time;
  document.getElementById('meal-page-kcal').textContent = `${Math.round(totalKcal)}kcal`;
  const missingCount = entries.filter(({ food }) => isNutritionMissing(food)).length;
  document.getElementById('meal-page-count').textContent = String(entries.length);
  const pageMissing = document.getElementById('meal-page-missing');
  if (pageMissing) {
    pageMissing.hidden = missingCount === 0;
    pageMissing.textContent = ACTIVE_LOCALE === 'en'
      ? `${missingCount} missing nutrition · counted as 0 in totals`
      : `영양정보 미입력 ${missingCount}개 · 합계에는 0으로 계산돼요`;
  }
  const summaryLabels = [t('mealTime'), t('totalCalories'), t('foodCount')];
  document.querySelectorAll('#view-meal-detail .meal-page-summary span').forEach((label, index) => {
    label.textContent = summaryLabels[index] || '';
  });
  document.getElementById('meal-page-list-title').textContent = t('loggedFoods');
  document.querySelector('#view-meal-detail .meal-page-list-head span').textContent = t('foodDetailsHint');
  const addActionLabel = document.querySelector('#meal-page-add span');
  if (addActionLabel) addActionLabel.textContent = t('searchFoodAction');
  const backLabel = document.querySelector('#meal-page-back span');
  if (backLabel) backLabel.textContent = t('backToMeals');
  document.getElementById('meal-page-empty-add').textContent = `+ ${t('searchFoodAction')}`;

  const items = document.getElementById('meal-page-items');
  items.innerHTML = '';
  entries.forEach(({ food, idx }) => {
    const item = createFoodItemEl(
      food,
      { kind: mealId === 'snack' ? 'snack' : 'meal', mealId, idx, slot },
      () => openFoodEdit(mealId, resolveFoodIndex(mealId, idx, food)),
      () => removeFood(mealId, idx, food),
    );
    item.querySelector('.food-drag-handle')?.addEventListener('pointerdown', () => {
      if (timelineEditing) closeMealPage();
    });
    items.appendChild(item);
  });

  document.getElementById('meal-page-empty-add').hidden = entries.length > 0;
}

function openMealPage(mealId, slot = null) {
  activeMealPageContext = { mealId, slot: mealId === 'snack' ? (slot ?? currentSnackSlot) : null };
  document.getElementById('view-home').hidden = true;
  document.getElementById('view-meal-detail').hidden = false;
  document.body.classList.add('meal-page-open');
  renderMealPage();
}

function closeMealPage() {
  activeMealPageContext = null;
  document.getElementById('view-meal-detail').hidden = true;
  document.getElementById('view-home').hidden = false;
  document.body.classList.remove('meal-page-open');
}

function openMealPageAdd() {
  if (!activeMealPageContext) return;
  const { mealId, slot } = activeMealPageContext;
  if (mealId === 'snack') currentSnackSlot = slot;
  openModal(mealId);
}

document.getElementById('meal-page-back')?.addEventListener('click', closeMealPage);
document.getElementById('meal-page-add')?.addEventListener('click', openMealPageAdd);
document.getElementById('meal-page-empty-add')?.addEventListener('click', openMealPageAdd);

function timeControlSelector(mealId, slot = null) {
  return mealId === 'snack' ? `#snack-slot-${slot}` : `#${mealId}-card`;
}

function ensureCardRecordActions(mealId, slot = null) {
  const card = document.querySelector(timeControlSelector(mealId, slot));
  const header = card?.querySelector('.meal-header, .snack-header');
  if (!card || !header || header.querySelector('.card-record-actions')) return;
  const label = timeContextLabel(mealId);
  const actions = document.createElement('div');
  actions.className = 'card-record-actions';
  actions.innerHTML = `
    <button type="button" class="card-clear-record" aria-label="${escapeHtml(ACTIVE_LOCALE === 'en' ? `Delete all ${label} records` : `${label} 기록 전체 삭제`)}" title="${ACTIVE_LOCALE === 'en' ? 'Delete all records' : '전체 삭제'}"><img src="assets/icon/buttons/delete.svg" width="15" height="15" alt="" aria-hidden="true" /></button>`;
  actions.querySelector('.card-clear-record').addEventListener('click', async event => {
    event.stopPropagation();
    const btn = event.currentTarget;
    const entries = mealId === 'snack' ? snackFoodsForSlot(slot) : (meals[mealId]?.foods || []);
    if (!entries.length) return;
    const lbl = timeContextLabel(mealId);
    const message = ACTIVE_LOCALE === 'en'
      ? `Delete every food logged for ${lbl}?`
      : `${lbl}에 기록한 음식을 모두 삭제할까요?`;
    if (!confirm(message)) return;
    if (btn) btn.disabled = true;
    try {
      await clearMealRecord(mealId, slot);
    } catch (error) {
      showStorageFailure(error);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  header.insertBefore(actions, header.querySelector('.add-btn'));
}

function ensureTimeControl(mealId, slot = null) {
  const card = document.querySelector(timeControlSelector(mealId, slot));
  if (!card || card.querySelector('.timeline-time-control')) return;
  const control = document.createElement('div');
  control.className = 'timeline-time-control';
  control.innerHTML = `<button type="button" class="timeline-time-button" aria-label="${ACTIVE_LOCALE === 'en' ? 'Edit meal time' : '섭취 시간 수정'}"></button>`;
  const button = control.querySelector('.timeline-time-button');
  button.addEventListener('click', event => {
    event.stopPropagation();
    openTimeEdit(mealId, slot);
  });
  card.appendChild(control);
}

function renderTimeControl(mealId, slot = null) {
  ensureTimeControl(mealId, slot);
  const card = document.querySelector(timeControlSelector(mealId, slot));
  const control = card?.querySelector('.timeline-time-control');
  if (!control) return;
  const entry = timeEntryFor(mealId, slot);
  const value = entry?.value || '--:--';
  const button = control.querySelector('.timeline-time-button');
  button.textContent = value;
  const hasFood = mealId === 'snack'
    ? snackFoodsForSlot(slot).length > 0
    : (meals[mealId]?.foods || []).length > 0;
  button.disabled = !hasFood;
}

function setupTimeControls() {
  MEAL_IDS.forEach(id => ensureTimeControl(id));
  SNACK_SLOTS.forEach(slot => ensureTimeControl('snack', slot));
}

function syncSnackSlotSelector(slot) {
  const selector = document.getElementById('modal-snack-selector');
  if (!selector) return;
  const select = selector.querySelector('#modal-snack-slot-select');
  if (select) select.value = String(slot);
}

/* ============================
   음식 추가 / 삭제 (저장 포함)
   ============================ */
function snapshotMeals() {
  return {
    foods: Object.fromEntries(
      Object.entries(meals).map(([id, meal]) => [id, (meal.foods || []).filter(Boolean).map(food => ({ ...food }))])
    ),
    mealTimes: cloneMealTimes(),
  };
}

function restoreMeals(snapshot) {
  const foodsByMeal = snapshot.foods || snapshot;
  Object.entries(foodsByMeal).forEach(([id, foods]) => {
    if (!meals[id] || !Array.isArray(foods)) return;
    meals[id].foods = foods.map(food => ({ ...food }));
  });
  mealTimes = normaliseMealTimes(snapshot.mealTimes);
}

async function persistMealsOrRestore(before) {
  try {
    await saveCurrentDay();
  } catch (error) {
    restoreMeals(before);
    renderAll(true);
    throw error;
  }
}

async function removeFood(mealId, idx, food = null) {
  if (!meals[mealId]) return;
  const at = resolveFoodIndex(mealId, idx, food);
  if (at < 0) { try { renderAll(false); } catch (error) { console.error(error); } return; }
  const before = snapshotMeals();
  const [removed] = meals[mealId].foods.splice(at, 1);
  try {
    if (mealId === 'snack') {
      const slot = removed?.slot ?? 3;
      if (!snackFoodsForSlot(slot).length) resetCardTime('snack', slot);
    } else if (!meals[mealId].foods.length) {
      resetCardTime(mealId);
    }
  } catch (error) { console.error('시간 초기화 실패(삭제는 계속):', error); }
  try { withFlip(() => renderAll(false)); } catch (error) { console.error('다시 그리기 실패(삭제는 계속):', error); }
  await persistMealsOrRestore(before);
}

async function clearMealRecord(mealId, slot = null) {
  const before = snapshotMeals();
  if (mealId === 'snack') {
    meals.snack.foods = meals.snack.foods.filter(food => (food.slot ?? 3) !== slot);
    resetCardTime('snack', slot);
  } else {
    meals[mealId].foods = [];
    resetCardTime(mealId);
  }
  withFlip(() => renderAll(false));
  await persistMealsOrRestore(before);
}

async function addFood(mealId, foodData) {
  const before = snapshotMeals();
  const data = { ...foodData, id: newFoodId(), _isNew: true };
  // 간식이면 현재 선택된 슬롯을 자동으로 태깅
  if (mealId === 'snack') data.slot = currentSnackSlot;
  const destinationSlot = mealId === 'snack' ? currentSnackSlot : null;
  const wasEmpty = mealId === 'snack'
    ? !snackFoodsForSlot(currentSnackSlot).length
    : !meals[mealId].foods.length;
  meals[mealId].foods.push(data);
  setAutoTimeForFirstFood(mealId, mealId === 'snack' ? currentSnackSlot : null, wasEmpty);
  withFlip(() => renderAll(false));
  try {
    const result = await storageRepository.saveDayAndRecent(
      dateKey(currentDate),
      dayDataFromMeals(meals),
      foodData,
    );
    RECENT_FOODS = result.recentFoods;
    closeModal();
    if (activeMealPageContext) {
      renderMealPage();
    } else if (activeView === 'home') {
      const card = mealId === 'snack'
        ? document.getElementById(`snack-slot-${destinationSlot}`)
        : document.getElementById(`${mealId}-card`);
      card?.classList.add('expanded');
      card?.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'true');
    }
  } catch (error) {
    restoreMeals(before);
    renderAll(true);
    throw error;
  }
}

/* 여러 음식을 한 번에 기록(빠른 입력). 저장은 한 번만 하고, 최근 음식에도 순서대로 넣습니다.
   반환값: 각 음식이 들어간 meals[mealId].foods 인덱스 목록 */
async function addFoods(mealId, foodList) {
  const list = (foodList || []).filter(food => food?.name);
  if (!list.length) return [];
  const before = snapshotMeals();
  if (mealId === 'snack' && (currentSnackSlot == null || Number.isNaN(currentSnackSlot))) currentSnackSlot = getDefaultSnackSlot();
  const destinationSlot = mealId === 'snack' ? currentSnackSlot : null;
  const wasEmpty = mealId === 'snack'
    ? !snackFoodsForSlot(currentSnackSlot).length
    : !meals[mealId].foods.length;
  const indexes = list.map(food => {
    const data = { ...food, _isNew: true };
    if (mealId === 'snack') data.slot = currentSnackSlot;
    meals[mealId].foods.push(data);
    return meals[mealId].foods.length - 1;
  });
  setAutoTimeForFirstFood(mealId, destinationSlot, wasEmpty);
  withFlip(() => renderAll(false));
  try {
    const result = await storageRepository.saveDayAndRecent(dateKey(currentDate), dayDataFromMeals(meals), list[list.length - 1]);
    RECENT_FOODS = result.recentFoods;
    for (const food of list.slice(0, -1).reverse()) {
      RECENT_FOODS = await storageRepository.saveRecentFood(food);
    }
  } catch (error) {
    restoreMeals(before);
    renderAll(true);
    throw error;
  }
  if (activeMealPageContext) renderMealPage();
  return indexes;
}

function quickEntryFoods() {
  return getFoodEntries().map(([name, data]) => [
    name,
    data,
    [displayFoodName({ name, ...data }), data.nameEn, FOOD_NAME_EN[name], ...(FOOD_NAME_ALIASES[name] || [])].filter(Boolean),
  ]);
}

function parseQuickFoodText(text) {
  if (!globalThis.RebuildersQuickEntry) return null;
  return RebuildersQuickEntry.parseQuickEntry(text, { foods: quickEntryFoods(), now: new Date() });
}

function quickItemSummary(food) {
  const visible = displayFoodName(food);
  if (isNutritionMissing(food)) return `${visible}(${ACTIVE_LOCALE === 'en' ? 'no nutrition yet' : '영양정보 미입력'})`;
  return `${visible} ${Math.round(food.cal || 0)}kcal${food.quantityNote ? ` · ${food.quantityNote}` : ''}`;
}

/* ============================
   + 버튼 / 펼침 / 핸들 전용 드래그
   ============================ */
function dropTargetAtPoint(x, y) {
  const targets = document.elementsFromPoint(x, y);
  return targets.find(target => target?.dataset.dropKind === 'meal')
    || targets.find(target => target?.dataset.dropKind === 'snack');
}

function updateSnackDropPlaceholderAtPoint(x, y) {
  if (!document.body.classList.contains('food-drag-active')) return;
  const target = dropTargetAtPoint(x, y);
  const nextSlot = target?.dataset?.dropKind === 'snack' ? target.dataset.slot : null;
  if (nextSlot === document.body.dataset.snackDropSlot) return;
  if (nextSlot == null) delete document.body.dataset.snackDropSlot;
  else document.body.dataset.snackDropSlot = nextSlot;
  renderSnack();
}

function cleanupDrag(drag) {
  clearCardReorder(drag);
  drag?.ghost?.remove();
  document.querySelectorAll('.food-item.is-dragging').forEach(el => el.classList.remove('is-dragging'));
  document.body.classList.remove('meal-drag-active', 'food-drag-active', 'card-drag-active');
  delete document.body.dataset.snackDropSlot;
  document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
  renderSnack();
}

function destinationAtPoint(x, y) {
  const target = dropTargetAtPoint(x, y);
  return { target, dest: destinationFromDropTarget(target) };
}

/* 끼니 카드 끌어 옮기기: 집은 카드는 들려서 손가락을 따라가고, 나머지 카드가 실시간으로 비켜 자리를 만듦.
   놓으면 그 자리로 내려앉고(250ms), 사이 카드들의 내용이 한 칸씩 밀림(자리 이름·시간 순서는 그대로) */
let cardSwapBatch = false;
const CARD_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
function cardDesc(card) {
  const h = card.querySelector('.drag-handle');
  return h?.dataset.drag === 'snack' ? { kind: 'snack', slot: parseInt(h.dataset.slot, 10) } : { kind: 'meal', mealId: h?.dataset.meal };
}
function setupCardReorder(drag) {
  const items = [...document.querySelectorAll('#view-home .meal-card, #view-home .snack-card')]
    .filter(c => c.getBoundingClientRect().height > 0 && c.querySelector('.drag-handle') && (c.classList.contains('meal-card') || c.classList.contains('has-items')));
  const from = items.indexOf(drag.card);
  if (from < 0 || items.length < 2) return;
  drag.reorder = { items, from, to: from, rects: items.map(c => c.getBoundingClientRect()) };
  drag.card.classList.add('is-drag-source');
  drag.ghost.classList.add('is-lifted');
}
function updateCardReorder(drag, forced, clientY) {
  const r = drag.reorder; if (!r) return;
  let to = forced;
  if (to == null) {
    // 손가락 위치 기준(복제본 크기·확대와 무관)
    const cy = clientY - drag.offsetY + r.rects[r.from].height / 2;
    to = 0;
    r.items.forEach((c, k) => { if (k !== r.from && r.rects[k].top + r.rects[k].height / 2 < cy) to++; });
  }
  if (to === r.to) return;
  r.to = to;
  const anim = reduceMotion() ? 'none' : `transform 200ms ${CARD_EASE}`;
  r.items.forEach((c, k) => {
    if (k === r.from) return;
    // 아래로 옮기면 사이 카드가 한 칸 위로, 위로 옮기면 한 칸 아래로
    const shift = (r.from < k && k <= to) ? r.rects[k - 1].top - r.rects[k].top
      : (to <= k && k < r.from) ? r.rects[k + 1].bottom - r.rects[k].bottom : 0;
    c.style.transition = anim;
    c.style.transform = shift ? `translateY(${Math.round(shift)}px)` : '';
  });
}
function clearCardReorder(drag) {
  const r = drag?.reorder; if (!r) return;
  r.items.forEach(c => { c.style.transition = 'none'; c.style.transform = ''; c.classList.remove('is-drag-source'); });
  requestAnimationFrame(() => r.items.forEach(c => { c.style.transition = ''; }));
  drag.reorder = null;
}
async function swapCardContents(a, b) {
  if (a.kind === 'meal' && b.kind === 'meal') return swapMealFoods(a.mealId, b.mealId);
  if (a.kind === 'snack' && b.kind === 'snack') return swapSnackSlots(a.slot, b.slot);
  const meal = a.kind === 'meal' ? a : b; const snack = a.kind === 'snack' ? a : b;
  return swapMealAndSnack(meal.mealId, snack.slot);
}
async function finishCardReorder(drag) {
  const r = drag.reorder;
  const { from, to, rects } = r;
  const ghost = drag.ghost;
  if (ghost && !reduceMotion()) {
    const top = to > from ? rects[to].bottom - rects[from].height : rects[to].top;
    try {
      await ghost.animate([
        { left: ghost.style.left, top: ghost.style.top, scale: '1.03' },
        { left: `${rects[from].left}px`, top: `${top}px`, scale: '1' },
      ], { duration: 250, easing: CARD_EASE, fill: 'forwards' }).finished;
    } catch { /* 취소됨 */ }
  }
  if (to === from) { clearCardReorder(drag); cleanupDrag(drag); return; }
  const before = snapshotMeals();
  const descs = r.items.map(cardDesc);
  cardSwapBatch = true;
  try {
    const step = to > from ? 1 : -1;
    for (let k = from; k !== to; k += step) await swapCardContents(descs[k], descs[k + step]);
  } finally { cardSwapBatch = false; }
  clearCardReorder(drag);
  renderAll(false);
  cleanupDrag(drag);
  try { await persistMealsOrRestore(before); } catch (error) { showStorageFailure(error); }
}

async function swapMealFoods(a, b) {
  if (a === b) return;
  const before = snapshotMeals();
  const tmp = meals[a].foods;
  meals[a].foods = meals[b].foods;
  meals[b].foods = tmp;
  const time = mealTimes[a];
  mealTimes[a] = mealTimes[b];
  mealTimes[b] = time;
  if (cardSwapBatch) return; // 카드 끌어 옮기기: 한 번에 그리고 저장
  withFlip(() => renderAll(false));
  await persistMealsOrRestore(before);
}

async function swapMealAndSnack(mealId, snackSlot) {
  const before = snapshotMeals();
  const mealFoods = meals[mealId].foods;
  const snackFoods = meals.snack.foods.filter(f => (f.slot ?? 3) === snackSlot);
  const remainingSnack = meals.snack.foods.filter(f => (f.slot ?? 3) !== snackSlot);

  // Swap food arrays (removing slot from snack, adding slot to meal)
  meals[mealId].foods = snackFoods.map(({ slot, ...rest }) => rest);
  meals.snack.foods = [
    ...remainingSnack,
    ...mealFoods.map(f => ({ ...f, slot: snackSlot }))
  ];

  // Swap times
  const mealTime = mealTimes[mealId] ? { ...mealTimes[mealId] } : null;
  const snackTime = mealTimes.snack[snackSlot] ? { ...mealTimes.snack[snackSlot] } : null;

  if (snackTime) mealTimes[mealId] = snackTime;
  else resetCardTime(mealId);

  if (mealTime) mealTimes.snack[snackSlot] = mealTime;
  else resetCardTime('snack', snackSlot);

  if (cardSwapBatch) return; // 카드 끌어 옮기기: 한 번에 그리고 저장
  withFlip(() => renderAll(false));
  await persistMealsOrRestore(before);
}

async function swapSnackSlots(slotA, slotB) {
  if (slotA === slotB) return;
  const before = snapshotMeals();

  // Swap slot tags on snack foods
  meals.snack.foods.forEach(f => {
    const s = f.slot ?? 3;
    if (s === slotA) f.slot = slotB;
    else if (s === slotB) f.slot = slotA;
  });

  // Swap times
  const timeA = mealTimes.snack[slotA] ? { ...mealTimes.snack[slotA] } : null;
  const timeB = mealTimes.snack[slotB] ? { ...mealTimes.snack[slotB] } : null;

  if (timeB) mealTimes.snack[slotA] = timeB;
  else resetCardTime('snack', slotA);

  if (timeA) mealTimes.snack[slotB] = timeA;
  else resetCardTime('snack', slotB);

  if (cardSwapBatch) return; // 카드 끌어 옮기기: 한 번에 그리고 저장
  withFlip(() => renderAll(false));
  await persistMealsOrRestore(before);
}

function sameFoodDestination(ctx, dest) {
  return dest.type === 'meal'
    ? ctx.kind === 'meal' && ctx.mealId === dest.mealId
    : ctx.kind === 'snack' && ctx.slot === dest.slot;
}

function destinationFromDropTarget(target) {
  if (!target) return null;
  if (target.dataset.dropKind === 'meal') return { type: 'meal', mealId: target.dataset.meal };
  if (target.dataset.dropKind === 'snack') return { type: 'snack', slot: parseInt(target.dataset.slot, 10) };
  return null;
}

function setupFoodItemDragHandle(handle, ctx) {
  if (!handle) return;
  let pending = null;
  let drag = null;

  handle.addEventListener('pointerdown', event => {
    if (!timelineEditing) return;
    event.preventDefault();
    event.stopPropagation();

    const item = handle.closest('.food-item');
    pending = {
      ...ctx,
      item,
      rect: item.getBoundingClientRect(),
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener('pointermove', event => {
    if (!pending || pending.pointerId !== event.pointerId) return;
    const dx = event.clientX - pending.startX;
    const dy = event.clientY - pending.startY;
    const distance = Math.hypot(dx, dy);

    if (!drag && distance > 8) {
      const rect = pending.rect;
      const ghost = pending.item.cloneNode(true);
      ghost.classList.add('meal-drag-ghost', 'food-drag-ghost');
      ghost.style.width = `${rect.width}px`;
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      document.body.appendChild(ghost);
      drag = {
        ...pending,
        ghost,
        offsetX: pending.startX - rect.left,
        offsetY: pending.startY - rect.top,
      };
      pending.item.classList.add('is-dragging');
      document.body.classList.add('meal-drag-active', 'food-drag-active');
      renderSnack();
    }

    if (!drag) return;
    drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
    drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
    updateSnackDropPlaceholderAtPoint(event.clientX, event.clientY);
    document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    const { target, dest } = destinationAtPoint(event.clientX, event.clientY);
    if (target && dest && !sameFoodDestination(drag, dest)) {
      target.classList.add('drop-target');
      target.setAttribute('data-dropzone-text', ACTIVE_LOCALE === 'en' ? 'Move food here' : '메뉴를 여기로 옮깁니다');
    }
    event.preventDefault();
  });

  handle.addEventListener('pointerup', async event => {
    if (!pending || pending.pointerId !== event.pointerId) return;
    if (drag) {
      const { dest } = destinationAtPoint(event.clientX, event.clientY);
      if (dest && !sameFoodDestination(drag, dest)) {
        try {
          await moveFoodToDestination(drag, dest);
        } catch (error) {
          showStorageFailure(error);
        }
      }
      cleanupDrag(drag);
      drag = null;
      pending = null;
      return;
    }
    pending = null;
  });

  handle.addEventListener('pointercancel', () => {
    cleanupDrag(drag);
    drag = null;
    pending = null;
  });
}

function setupDragHandles() {
  let pending = null;
  let drag = null;

  document.querySelectorAll('.drag-handle').forEach(handle => {
    handle.addEventListener('pointerdown', event => {
      const card = handle.closest('.meal-card, .snack-card');
      if (!timelineEditing || handle.classList.contains('is-disabled')) return;
      if (card?.classList.contains('expanded')) return;
      event.preventDefault();
      event.stopPropagation();

      const kind = handle.dataset.drag;
      pending = {
        kind,
        mealId: handle.dataset.meal || null,
        slot: handle.dataset.slot != null ? parseInt(handle.dataset.slot, 10) : null,
        card,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', event => {
      if (!pending || pending.pointerId !== event.pointerId) return;
      const dx = event.clientX - pending.startX;
      const dy = event.clientY - pending.startY;
      const distance = Math.hypot(dx, dy);

      if (!drag && distance > 8) {
        const rect = pending.card.getBoundingClientRect();
        const ghost = pending.card.cloneNode(true);
        ghost.classList.add('meal-drag-ghost');
        ghost.style.width = `${rect.width}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        document.body.appendChild(ghost);
        drag = {
          ...pending,
          ghost,
          offsetX: pending.startX - rect.left,
          offsetY: pending.startY - rect.top,
        };
        document.body.classList.add('meal-drag-active', 'card-drag-active');
        renderSnack();
        setupCardReorder(drag);
      }

      if (!drag) return;
      drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
      drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
      document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
      const { target, dest } = destinationAtPoint(event.clientX, event.clientY);
      // 빈 간식 자리 위면 예전처럼 '교체' 표시, 아니면 카드들이 비켜서 자리를 만듦
      const overPlaceholder = !!(target && drag.reorder && !drag.reorder.items.includes(target));
      if (drag.reorder) updateCardReorder(drag, overPlaceholder ? drag.reorder.from : null, event.clientY);
      if (target && target !== drag.card && (!drag.reorder || overPlaceholder)) {
        target.classList.add('drop-target');
        const srcLabel = drag.kind === 'meal' ? mealLabel(drag.mealId) : t('snack');
        const destLabel = dest?.type === 'meal' ? mealLabel(dest.mealId) : t('snack');
        target.setAttribute('data-dropzone-text', ACTIVE_LOCALE === 'en' ? `Swap ${srcLabel} with ${destLabel}` : `${srcLabel}을 ${destLabel} 메뉴와 교체합니다`);
      }
      event.preventDefault();
    });

    handle.addEventListener('pointerup', async event => {
      if (!pending || pending.pointerId !== event.pointerId) return;

      if (drag) {
        const { target, dest } = destinationAtPoint(event.clientX, event.clientY);
        const overPlaceholder = !!(target && drag.reorder && !drag.reorder.items.includes(target));
        if (drag.reorder && !overPlaceholder) {
          const d = drag; drag = null; pending = null;
          try { await finishCardReorder(d); } catch (error) { cleanupDrag(d); showStorageFailure(error); }
          return;
        }
        clearCardReorder(drag);
        if (dest && (dest.type === 'snack' || target !== drag.card)) {
          try {
            if (drag.kind === 'meal' && dest.type === 'meal') {
              await swapMealFoods(drag.mealId, dest.mealId);
            } else if (drag.kind === 'meal' && dest.type === 'snack') {
              await swapMealAndSnack(drag.mealId, dest.slot);
            } else if (drag.kind === 'snack' && dest.type === 'snack') {
              await swapSnackSlots(drag.slot, dest.slot);
            } else if (drag.kind === 'snack' && dest.type === 'meal') {
              await swapMealAndSnack(dest.mealId, drag.slot);
            }
          } catch (error) {
            showStorageFailure(error);
          }
        }
        cleanupDrag(drag);
        drag = null;
        pending = null;
        return;
      }

      pending = null;
    });

    handle.addEventListener('pointercancel', () => {
      cleanupDrag(drag);
      drag = null;
      pending = null;
    });
  });
}

function setupMealInteractions() {
  const toggleHomeCard = card => {
    const nextExpanded = !card.classList.contains('expanded');
    card.classList.toggle('expanded', nextExpanded);
    card.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', String(nextExpanded));
    card.querySelector('.drag-handle')?.classList.toggle('is-disabled', nextExpanded);
  };

  MEAL_IDS.forEach(id => {
    document.getElementById(`add-${id}`).addEventListener('click', e => {
      e.stopPropagation();
      openModal(id);
    });
    document.querySelector(`[data-expand-meal="${id}"]`)?.addEventListener('click', () => {
      if (!meals[id]?.foods?.length) return;
      toggleHomeCard(document.getElementById(`${id}-card`));
    });
  });

  SNACK_SLOTS.forEach(slot => {
    document.getElementById(`add-snack-${slot}`)?.addEventListener('click', e => {
      e.stopPropagation();
      currentSnackSlot = slot;
      openModal('snack');
    });
    document.querySelector(`[data-expand-snack="${slot}"]`)?.addEventListener('click', () => {
      if (!snackFoodsForSlot(slot).length) return;
      toggleHomeCard(document.getElementById(`snack-slot-${slot}`));
    });
  });

  // 상단 공통 추가는 간식 전용이다. 끼니 음식은 각 카드의 + 버튼에서 추가한다.
  document.getElementById('add-snack-global')?.addEventListener('click', () => {
    currentSnackSlot = getDefaultSnackSlot();
    openModal('snack');
  });

  document.querySelectorAll('.modal-record-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      setModalMealTarget(opt.dataset.mealTarget, true);
    });
  });

  document.getElementById('modal-snack-slot-select')?.addEventListener('change', event => {
    currentSnackSlot = Number.parseInt(event.currentTarget.value, 10);
    syncSnackSlotSelector(currentSnackSlot);
    document.getElementById('modal-title').textContent = t('snackModalTitle');
  });

  setupDragHandles();
}

/* ============================
   음식 단위 드래그 이동
   ============================ */
async function moveFoodToDestination(ctx, dest) {
  if (sameFoodDestination(ctx, dest)) return;
  const list = meals[ctx.mealId]?.foods;
  if (!list || ctx.idx < 0 || ctx.idx >= list.length) return;
  const before = snapshotMeals();
  const sourceSlot = ctx.kind === 'snack' ? ctx.slot : null;
  const sourceTime = { ...timeEntryFor(ctx.mealId, sourceSlot) };
  const destinationWasEmpty = dest.type === 'meal'
    ? !meals[dest.mealId].foods.length
    : !snackFoodsForSlot(dest.slot).length;
  const [food] = list.splice(ctx.idx, 1);
  if (!food) return;

  if (dest.type === 'meal') {
    const { slot, ...rest } = food;
    meals[dest.mealId].foods.push(rest);
    if (destinationWasEmpty) mealTimes[dest.mealId] = sourceTime;
  } else {
    meals.snack.foods.push({ ...food, slot: dest.slot });
    if (destinationWasEmpty) mealTimes.snack[dest.slot] = sourceTime;
  }

  const sourceIsEmpty = ctx.kind === 'snack'
    ? !snackFoodsForSlot(sourceSlot).length
    : !meals[ctx.mealId].foods.length;
  if (sourceIsEmpty) resetCardTime(ctx.mealId, sourceSlot);

  withFlip(() => renderAll(false));
  await persistMealsOrRestore(before);
}

setupMealInteractions();

/* ============================
   모달
   ============================ */
const overlay = document.getElementById('modal-overlay');
const foodSearchInput = document.getElementById('food-search');
const customForm = document.getElementById('custom-food-form');
const foodTabs = document.querySelectorAll('.food-tab');
const foodTabPanels = document.querySelectorAll('.food-tab-panel');
let modalOpenedFromGlobal = false;
let productRegistrationMode = false;

function mountCustomFoodForm(destination = 'modal') {
  const target = destination === 'hub'
    ? document.getElementById('search-inline-custom-host')
    : document.getElementById('tab-custom');
  if (!customForm || !target) return;
  if (customForm.parentElement !== target) target.appendChild(customForm);
  customForm.classList.toggle('is-inline-search', destination === 'hub');
}

function getSuggestedMealForNow() {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
}

function syncModalMealTarget(mealId) {
  document.querySelectorAll('.modal-record-opt').forEach(button => {
    const active = button.dataset.mealTarget === mealId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function setModalMealTarget(mealId, genericTitle = false) {
  currentMeal = mealId;
  const snackSelector = document.getElementById('modal-snack-selector');
  syncModalMealTarget(mealId);

  if (mealId === 'snack') {
    if (currentSnackSlot == null || Number.isNaN(currentSnackSlot)) currentSnackSlot = getDefaultSnackSlot();
    if (snackSelector) {
      snackSelector.hidden = false;
      syncSnackSlotSelector(currentSnackSlot);
    }
  } else if (snackSelector) {
    snackSelector.hidden = true;
  }

  document.getElementById('modal-title').textContent = genericTitle
    ? t('addFood')
    : mealId === 'snack'
      ? t('snackModalTitle')
      : t('mealModalTitle', { meal: mealLabel(mealId) });
}

function openModal(mealId, options = {}) {
  productRegistrationMode = false;
  modalOpenedFromGlobal = Boolean(options.showTargetSelector);
  const recordSelector = document.getElementById('modal-record-selector');
  if (recordSelector) recordSelector.hidden = !modalOpenedFromGlobal;
  setModalMealTarget(mealId, modalOpenedFromGlobal);

  foodSearchInput.value = '';
  resetCustomFoodForm();
  setFoodTab('recent');
  overlay.classList.toggle('snack-dialog', mealId === 'snack');
  overlay.classList.add('open');
  requestAnimationFrame(() => syncSegmented(document.querySelector('#modal-sheet .food-tabs'), true));
  setTimeout(() => foodSearchInput.focus(), 250);
  renderQuickFoods(getFoodEntries());
  renderRecentFoods();
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.classList.remove('snack-dialog');
  currentMeal = null;
  modalOpenedFromGlobal = false;
  productRegistrationMode = false;
  foodSearchInput.value = '';
  resetCustomFoodForm();
}

function renderModalProducts() {
  const list = document.getElementById('modal-products-list');
  if (!list) return;
  const entries = Object.entries(CUSTOM_FOODS);
  list.innerHTML = '';
  if (!entries.length) {
    list.innerHTML = `<p class="search-hub-empty">${ACTIVE_LOCALE === 'en' ? 'No products you registered yet.' : '직접 등록한 제품이 아직 없어요.'}</p>`;
    return;
  }
  renderFoodRows(list, entries, true);
}

function setFoodTab(tab) {
  if (tab === 'custom') mountCustomFoodForm('modal');
  activeFoodTab = tab;
  foodTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  foodTabPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tab));
  if (tab === 'recent') renderRecentFoods();
  if (tab === 'products') renderModalProducts();
}

foodTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    foodSearchInput.value = '';
    setFoodTab(btn.dataset.tab);
  });
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('food-modal-x')?.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

document.getElementById('custom-advanced-toggle')?.addEventListener('click', event => {
  const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
  event.currentTarget.setAttribute('aria-expanded', String(!expanded));
  event.currentTarget.textContent = !expanded
    ? (ACTIVE_LOCALE === 'en' ? 'Hide detailed nutrition' : '상세 영양성분 접기')
    : (ACTIVE_LOCALE === 'en' ? 'Show detailed nutrition' : '상세 영양성분 펼치기');
  document.querySelectorAll('.custom-advanced-field').forEach(field => { field.hidden = expanded; });
});

function renderFoodRows(container, entries, allowCustomActions = true) {
  entries.forEach(([name, data]) => {
    const visibleName = displayFoodName({ name, ...data });
    const row = document.createElement('div');
    row.className = 'quick-food-row';
    const src = foodSourceMeta(data, name);

    const btn = document.createElement('button');
    btn.className = 'quick-food-chip';
    btn.innerHTML = `
      <span class="chip-body">
        <span class="chip-name">${escapeHtml(visibleName)}</span>
        <span class="chip-serving">${escapeHtml(displayServing({ name, ...data }, data.serving || ''))}</span>
        <span class="chip-source ${src.cls}">${src.label}</span>
      </span>
      <span class="chip-meta">${isNutritionMissing(data)
        ? `<span class="chip-missing">${escapeHtml(nutritionMissingLabel())}</span>`
        : `<span>${data.cal || 0}kcal</span>
        <span class="chip-macros">${ACTIVE_LOCALE === 'en' ? 'C' : '탄'}${data.carbs || 0}g · ${ACTIVE_LOCALE === 'en' ? 'P' : '단'}${data.protein || 0}g · ${ACTIVE_LOCALE === 'en' ? 'F' : '지'}${data.fat || 0}g</span>`}
      </span>
    `;
    btn.addEventListener('click', async () => {
      if (!currentMeal) return;
      await runButtonAction(btn, async () => {
        await addFood(currentMeal, { name, ...data });
        showToast(`${visibleName} ${ACTIVE_LOCALE === 'en' ? 'saved' : '저장됨'}`, 'info');
      });
    });
    row.appendChild(btn);

    if (allowCustomActions && CUSTOM_FOODS[name]) {
      const actions = document.createElement('div');
      actions.className = 'custom-food-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'custom-edit-btn';
      editBtn.type = 'button';
      editBtn.textContent = ACTIVE_LOCALE === 'en' ? 'Edit' : '수정';
      editBtn.addEventListener('click', () => {
        startEditCustomFood(name, data);
        setFoodTab('custom');
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'custom-delete-btn';
      deleteBtn.type = 'button';
      deleteBtn.textContent = ACTIVE_LOCALE === 'en' ? 'Delete' : '삭제';
      deleteBtn.addEventListener('click', async () => {
        const message = ACTIVE_LOCALE === 'en'
          ? `Delete ${visibleName} from your custom foods?`
          : `${name}을(를) 등록 음식에서 삭제할까요?`;
        if (!confirm(message)) return;
        await runButtonAction(deleteBtn, async () => {
          await deleteCustomFood(name);
          resetCustomFoodForm();
          const q = foodSearchInput.value.trim().toLowerCase();
          const entries = getFoodEntries().filter(([entryName, entryData]) =>
            `${entryName} ${displayFoodName({ name: entryName, ...entryData })}`.toLowerCase().includes(q)
          );
          renderQuickFoods(entries);
          showToast(ACTIVE_LOCALE === 'en' ? `${visibleName} deleted` : `${name} 삭제됨`, 'info');
        });
      });
      actions.appendChild(deleteBtn);
      row.appendChild(actions);
    }

    container.appendChild(row);
  });
}


// 음식 추가 시트 검색도 같은 묶음(최근 먹은 → 내 식도감 → 영양 DB, 5개씩 + 더 보기). 누르면 바로 이 끼니에 추가(기존 동작)
const sheetSearchMore = { q: '', more: {} };
function renderGroupedQuickFoods(container, q) {
  if (sheetSearchMore.q !== q) { sheetSearchMore.q = q; sheetSearchMore.more = {}; }
  const result = FoodSearch.search(q);
  if (!result) return;
  for (const section of result.sections) {
    if (!section.items.length) continue;
    const limit = sheetSearchMore.more[section.key] || FOOD_SEARCH_PAGE;
    renderFoodSection(container, `${foodSearchSectionLabel(section.key)} · ${section.items.length}`, section.items.slice(0, limit).map(item => [item.name, item.data]), false); // 식도감 결과처럼 줄만(수정·삭제는 '내 제품' 탭에서)
    container.lastElementChild?.classList.add('fs-sheet-last');
    const rest = section.items.length - limit;
    if (rest > 0) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'fs-more';
      more.dataset.section = section.key;
      more.textContent = ACTIVE_LOCALE === 'en' ? `Show more (${rest})` : `더 보기 (${rest}개)`;
      more.addEventListener('click', () => { sheetSearchMore.more[section.key] = limit + 20; scheduleFoodSearch(); });
      container.appendChild(more);
    }
  }
}

function renderFoodSection(container, label, entries, allowCustomActions = true) {
  if (!entries.length) return;
  const title = document.createElement('div');
  title.className = 'quick-add-label food-section-label';
  title.textContent = label;
  container.appendChild(title);
  renderFoodRows(container, entries, allowCustomActions);
}

function scheduleFoodSearch() {
  const q = foodSearchInput.value.trim();
  const normalizedQuery = q.toLowerCase();
  const localEntries = getFoodEntries().filter(([name, data]) =>
    `${name} ${displayFoodName({ name, ...data })}`.toLowerCase().includes(normalizedQuery)
  );
  renderQuickFoods(localEntries);
  foodTabPanels.forEach(panel => {
    const active = q ? panel.dataset.panel === 'search' : panel.dataset.panel === activeFoodTab;
    panel.classList.toggle('active', active);
  });
  if (!q && activeFoodTab === 'recent') renderRecentFoods();
  if (!q && activeFoodTab === 'products') renderModalProducts();
  if (q) document.getElementById('custom-name').value = q;
}

function renderQuickFoods(entries) {
  const container = document.getElementById('quick-foods');
  container.innerHTML = '';

  const q = foodSearchInput.value.trim();

  if (q && document.getElementById('custom-name')) document.getElementById('custom-name').value = q;

  const quickButton = q ? buildQuickRecordButton(q) : null;
  // 검색 중인 한 단어(예: "바나")는 검색 결과를 먼저, 끼니·여러 음식이 들어간 입력은 바로 기록을 먼저 보여줍니다.
  const quickFirst = quickButton && !(quickButton.dataset.singleUnknown === 'true' && entries.length);
  if (quickButton && quickFirst) container.appendChild(quickButton);
  const askButton = quickButton?.dataset.askItems ? buildAskAiButton(quickButton.dataset.askMeal, JSON.parse(quickButton.dataset.askItems), 'ask-ai-btn', { query: q }) : null;
  if (askButton && quickFirst) container.appendChild(askButton);

  const sectionLabel = ACTIVE_LOCALE === 'en'
    ? (q ? 'My foods · Built-in (local)' : 'My foods · Built-in')
    : (q ? '내 음식 · 기본 (로컬)' : '내 음식 · 기본');
  if (q) renderGroupedQuickFoods(container, q); else renderFoodSection(container, sectionLabel, entries, true);
  if (quickButton && !quickFirst) container.appendChild(quickButton);
  if (askButton && !quickFirst) container.appendChild(askButton);

  if (!entries.length && !quickButton) {
    const empty = document.createElement('div');
    empty.className = 'food-empty-state';
    empty.textContent = ACTIVE_LOCALE === 'en'
      ? 'No results. You can add this food from the Custom tab.'
      : '검색 결과가 없어요. 직접 등록 탭에서 바로 추가할 수 있어요.';
    container.appendChild(empty);
  }
}

function renderRecentFoods() {
  // 밀고 있는 도중엔 다시 그리지 않음(줄이 바뀌면 손가락 동작이 끊김) → 끝나면 다시 그림
  if (swipeGestureActive) { swipeRenderPending = true; return; }
  const container = document.getElementById('recent-foods');
  const swipeHint = document.getElementById('recent-swipe-hint');
  if (swipeHint) swipeHint.hidden = !RECENT_FOODS.length;
  container.innerHTML = '';

  if (!RECENT_FOODS.length) {
    const empty = document.createElement('div');
    empty.className = 'food-empty-state';
    empty.textContent = ACTIVE_LOCALE === 'en'
      ? 'No recent foods yet. Foods you add will appear here.'
      : '아직 최근 음식이 없어요. 음식을 추가하면 여기에 쌓입니다.';
    container.appendChild(empty);
    return;
  }

  renderFoodRows(container, RECENT_FOODS.map(food => [food.name, food]), false);
  setupRecentEditButton();
  const names = RECENT_FOODS.map(food => food.name);
  container.querySelectorAll('.quick-food-row').forEach((row, i) => {
    if (names[i]) enableSwipeDelete(row, () => runButtonAction(row, () => deleteRecentFood(names[i])));
  });
}

/* 최근 음식 '편집' 버튼: 밀기가 안 될 때도 모든 줄에 '삭제'를 보여줌 */
function setupRecentEditButton() {
  const button = document.getElementById('recent-edit');
  const container = document.getElementById('recent-foods');
  if (!button || !container) return;
  const editing = container.classList.contains('is-editing') && RECENT_FOODS.length > 0;
  if (!RECENT_FOODS.length) container.classList.remove('is-editing');
  button.hidden = !RECENT_FOODS.length;
  button.textContent = editing ? (ACTIVE_LOCALE === 'en' ? 'Done' : '완료') : (ACTIVE_LOCALE === 'en' ? 'Edit' : '편집');
  button.setAttribute('aria-pressed', String(editing));
  if (button.dataset.ready) return;
  button.dataset.ready = 'true';
  button.addEventListener('click', () => {
    container.classList.toggle('is-editing');
    container.querySelectorAll('.swipe-row.is-open').forEach(row => row.__swipeClose?.());
    setupRecentEditButton();
  });
}

/* 왼쪽으로 밀면 빨간 '삭제' (iOS WKWebView 대응, 세 번째 버전)
   - 손가락: Touch Events, non-passive touchmove 에서 가로면 preventDefault(스크롤·시트가 가져가지 않게)
   - 마우스·펜: Pointer Events + setPointerCapture
   - 밀고 있는 동안 목록을 다시 그리지 않음(swipeGestureActive)
   - 길게 누르기(0.5초)·'편집' 버튼은 대체 방법 */
var swipeGestureActive = false; // var: 시작 시 renderRecentFoods 가 먼저 불려도 안전
var swipeRenderPending = false;
function finishSwipeGesture() {
  swipeGestureActive = false;
  if (swipeRenderPending) { swipeRenderPending = false; setTimeout(renderRecentFoods, 0); }
}
function enableSwipeDelete(row, onDelete) {
  const WIDTH = 52; // 열면 카드가 이만큼 비켜서 휴지통 아이콘(식단 편집과 같은 delete.svg)이 보임
  const OPEN_AT = 20;
  const content = document.createElement('div');
  content.className = 'swipe-content';
  while (row.firstChild) content.appendChild(row.firstChild);
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'swipe-delete-btn';
  del.innerHTML = `<img src="assets/icon/buttons/delete.svg" width="16" height="16" alt="" aria-hidden="true" /><span class="sr-only">${ACTIVE_LOCALE === 'en' ? 'Delete' : '삭제'}</span>`;
  del.tabIndex = -1;
  del.setAttribute('aria-label', ACTIVE_LOCALE === 'en' ? 'Delete from recent foods' : '최근 음식에서 삭제');
  row.classList.add('swipe-row');
  row.append(del, content);
  let startX = 0; let startY = 0; let base = 0; let x = 0; let mode = null; let pressTimer = null; let activeId = null; let tracking = false;
  const set = (value, animate) => {
    x = value;
    content.style.transition = animate ? 'transform 0.2s ease' : 'none';
    content.style.transform = value ? `translateX(${value}px)` : '';
    row.classList.toggle('is-open', value <= -WIDTH / 2);
    row.classList.toggle('is-revealed', value < 0); // 밀기 전엔 빨간 삭제를 아예 안 보임
    del.tabIndex = value < 0 ? 0 : -1;
  };
  const close = () => set(0, true);
  const open = () => { set(-WIDTH, true); row.__swipeAt = Date.now(); };
  const clearPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
  row.__swipeClose = close;
  const begin = (cx, cy) => {
    tracking = true;
    swipeGestureActive = true;
    startX = cx; startY = cy; mode = null;
    base = row.classList.contains('is-open') ? -WIDTH : 0;
    document.querySelectorAll('.swipe-row.is-open').forEach(other => { if (other !== row) other.__swipeClose?.(); });
    clearPress();
    pressTimer = setTimeout(() => { pressTimer = null; if (tracking && !mode) { mode = 'press'; open(); } }, 500);
  };
  const decide = (mx, my) => {
    if (!mode && (Math.abs(mx) >= 4 || Math.abs(my) >= 4)) mode = Math.abs(mx) > Math.abs(my) ? 'h' : 'v';
    return mode;
  };
  const move = (cx, cy) => {
    if (!tracking) return;
    const mx = cx - startX; const my = cy - startY;
    if (Math.abs(mx) > 6 || Math.abs(my) > 6) clearPress();
    if (decide(mx, my) !== 'h') return;
    set(Math.max(-WIDTH - 24, Math.min(0, base + mx)), false);
  };
  const end = () => {
    if (!tracking) return;
    tracking = false;
    clearPress();
    if (mode === 'h') {
      const moved = x - base;
      set(moved < -OPEN_AT || (base < 0 && moved < OPEN_AT) ? -WIDTH : 0, true);
      row.__swipeAt = Date.now();
    } else if (mode === 'press') {
      row.__swipeAt = Date.now();
    }
    mode = null;
    activeId = null;
    finishSwipeGesture();
  };
  // 손가락: Touch Events(iOS WKWebView 는 항상 보냄). touchmove 는 passive:false 라서 가로면 스크롤을 막을 수 있음
  content.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    const t = event.touches[0];
    begin(t.clientX, t.clientY);
  }, { passive: true });
  content.addEventListener('touchmove', event => {
    const t = event.touches[0];
    if (!t || !tracking) return;
    const mx = t.clientX - startX; const my = t.clientY - startY;
    move(t.clientX, t.clientY);
    const horizontal = mode === 'h' || (!mode && Math.abs(mx) > Math.abs(my));
    if (horizontal && event.cancelable) { event.preventDefault(); event.stopPropagation(); }
  }, { passive: false });
  content.addEventListener('touchend', end, { passive: true });
  content.addEventListener('touchcancel', end, { passive: true });
  // 마우스·펜: Pointer Events(손가락 포인터는 위 터치가 처리하므로 무시)
  if (window.PointerEvent) {
    content.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      activeId = event.pointerId;
      begin(event.clientX, event.clientY);
    });
    content.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || event.pointerId !== activeId) return;
      move(event.clientX, event.clientY);
      if (mode === 'h') { try { content.setPointerCapture(event.pointerId); } catch { /* ignore */ } }
    });
    ['pointerup', 'pointercancel'].forEach(type => content.addEventListener(type, event => {
      if (event.pointerType === 'touch' || event.pointerId !== activeId) return;
      end();
    }));
  }
  content.addEventListener('contextmenu', event => event.preventDefault());
  // 열려 있거나 방금 밀었거나 편집 중이면 탭해도 음식 추가하지 않음
  content.addEventListener('click', event => {
    const editing = row.parentElement?.classList.contains('is-editing');
    if (editing || row.classList.contains('is-open') || Date.now() - (row.__swipeAt || 0) < 350) {
      event.preventDefault(); event.stopPropagation();
      if (!editing) close();
    }
  }, true);
  del.addEventListener('click', event => { event.stopPropagation(); close(); onDelete(); });
}

/* 최근 음식에서만 지움(지난 식단 기록은 그대로). 되돌리기 토스트 제공. AI가 찾은 음식이면 맥 미니 캐시도 지움 */
async function deleteRecentFood(name) {
  const before = RECENT_FOODS.map(food => ({ ...food }));
  const removed = before.find(food => food.name === name);
  if (!removed) return;
  RECENT_FOODS = await storageRepository.replaceRecentFoods(before.filter(food => food.name !== name));
  renderRecentFoods();
  if (removed.aiEstimate && globalThis.RebuildersBridge?.isConfigured()) {
    RebuildersBridge.forget([removed.inputName, removed.name]);
  }
  const en = ACTIVE_LOCALE === 'en';
  showUndoToast(en ? `Removed ${displayFoodName(removed)} from recent foods` : `${displayFoodName(removed)} 최근 음식에서 삭제했어요`, async () => {
    RECENT_FOODS = await storageRepository.replaceRecentFoods(before);
    renderRecentFoods();
  });
}

function showUndoToast(message, onUndo) {
  const host = document.getElementById('toast-host');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast toast-info toast-undo';
  const text = document.createElement('span');
  text.textContent = message;
  const undo = document.createElement('button');
  undo.type = 'button';
  undo.textContent = ACTIVE_LOCALE === 'en' ? 'Undo' : '되돌리기';
  let done = false;
  const hide = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 280); };
  undo.addEventListener('click', async () => {
    if (done) return;
    done = true;
    hide();
    try { await onUndo(); } catch (error) { showStorageFailure(error); }
  });
  el.append(text, undo);
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { if (!done) hide(); }, 5000);
}

foodSearchInput.addEventListener('input', scheduleFoodSearch);

function quickRecordTarget(parsed) {
  if (!currentMeal || productRegistrationMode) return null;
  return parsed.mealExplicit ? parsed.mealId : currentMeal;
}

function buildQuickRecordButton(query) {
  const parsed = parseQuickFoodText(query);
  if (!parsed || !parsed.items.length) return null;
  const mealId = quickRecordTarget(parsed);
  if (!mealId) return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'quick-record-btn';
  const names = parsed.items.map(item => quickItemSummary(item.food)).join(', ');
  button.innerHTML = `<span class="quick-record-title">${escapeHtml(ACTIVE_LOCALE === 'en'
    ? `Log to ${mealLabel(mealId)} · ${parsed.items.length}`
    : `${entryDateLabel(parsed)}${mealLabel(mealId)}에 바로 기록 · ${parsed.items.length}개`)}</span><span class="quick-record-items">${escapeHtml(names)}</span>`;
  button.dataset.singleUnknown = String(parsed.items.length === 1 && !parsed.items[0].known && !parsed.mealExplicit);
  const unknown = parsed.items.filter(item => !item.known || isNutritionMissing(item.food));
  if (unknown.length) {
    button.dataset.askMeal = mealId;
    button.dataset.askItems = JSON.stringify(unknown.map(item => ({ name: item.food.name, serving: item.food.serving || '' })));
  }
  button.addEventListener('click', () => runButtonAction(button, () => submitQuickRecord(query)));
  return button;
}

/* "내일 아침 바나나"처럼 날짜를 말하면 그 날짜로 이동해서 기록. 반환: 이동했는지 */
async function goToEntryDate(parsed) {
  if (!parsed?.dateExplicit || !parsed.date || parsed.date === dateKey(currentDate)) return false;
  currentDate = parseDateKey(parsed.date);
  await loadCurrentDay();
  updateDateDisplay();
  renderAll(true);
  return true;
}
function entryDateLabel(parsed) {
  if (!parsed?.dateExplicit || !parsed.date) return '';
  const date = parseDateKey(parsed.date);
  return isToday(date) ? '' : `${formatHomeDate(date)} `;
}

async function submitQuickRecord(query) {
  const parsed = parseQuickFoodText(query);
  if (!parsed || !parsed.items.length) return false;
  const mealId = quickRecordTarget(parsed);
  if (!mealId) return false;
  await goToEntryDate(parsed);
  if (mealId === 'snack' && currentMeal !== 'snack') currentSnackSlot = getDefaultSnackSlot();
  const foods = parsed.items.map(item => item.food);
  await addFoods(mealId, foods);
  await registerLoggedFoods(foods);
  closeModal();
  const missing = foods.filter(isNutritionMissing).length;
  const queued = queueBridgeLookup(mealId, foods);
  showToast(ACTIVE_LOCALE === 'en'
    ? `Saved ${foods.length} to ${mealLabel(mealId)}${missing ? (queued ? ' · AI is finding nutrition…' : ` · ${missing} missing nutrition`) : ''}`
    : `${entryDateLabel(parsed)}${mealLabel(mealId)}에 ${foods.length}개 저장${missing ? (queued ? ' · AI가 영양성분 찾는 중…' : ` · 영양정보 미입력 ${missing}개`) : ''}`, 'info');
  return true;
}

foodSearchInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.isComposing) return;
  const q = foodSearchInput.value.trim();
  if (!q) return;
  event.preventDefault();
  // 맨 위에 보이는 항목(바로 기록 또는 첫 검색 결과)을 실행
  const button = document.querySelector('#quick-foods .quick-record-btn, #quick-foods .quick-food-chip');
  if (button) button.click();
});

function updateCustomSaveLabel() {
  const productOnly = currentMeal == null && (productRegistrationMode || customForm?.classList.contains('is-inline-search'));
  document.getElementById('custom-save').textContent = ACTIVE_LOCALE === 'en'
    ? (productOnly ? (editingCustomFoodName ? 'Update product' : 'Save product') : (editingCustomFoodName ? 'Update and add' : 'Save and add'))
    : (productOnly ? (editingCustomFoodName ? '제품 수정' : '제품 저장') : (editingCustomFoodName ? '수정하고 추가' : '저장하고 추가'));
}

const CUSTOM_INPUT_IDS = [
  'custom-name',
  'custom-serving-amount', 'custom-serving-grams',
  'custom-description',
  'custom-cal',
  'custom-carbs',
  'custom-sugar',
  'custom-fiber',
  'custom-protein',
  'custom-fat',
  'custom-saturated-fat',
  'custom-trans-fat',
  'custom-cholesterol',
  'custom-sodium',
  'custom-potassium', 'custom-calcium', 'custom-iron', 'custom-magnesium', 'custom-vitamin-d', 'custom-vitamin-c',
];

function setInputValue(id, value) {
  document.getElementById(id).value = value ?? '';
}

function numberFromInput(id) {
  return Number(document.getElementById(id).value) || 0;
}

function optionalNumberFromInput(id) {
  const value = document.getElementById(id).value;
  return value === '' ? undefined : Number(value) || 0;
}

function resetCustomFoodForm() {
  editingCustomFoodName = null;
  CUSTOM_INPUT_IDS.forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('custom-serving-unit').value = 'g';
  updateCustomSaveLabel();
  const advancedToggle = document.getElementById('custom-advanced-toggle');
  if (advancedToggle) {
    advancedToggle.setAttribute('aria-expanded', 'false');
    advancedToggle.textContent = ACTIVE_LOCALE === 'en' ? 'Show detailed nutrition' : '상세 영양성분 펼치기';
  }
  document.querySelectorAll('.custom-advanced-field').forEach(field => { field.hidden = true; });
}

function startEditCustomFood(name, data) {
  editingCustomFoodName = name;
  setInputValue('custom-name', name);
  const serving = parseServingValue(data.serving);
  setInputValue('custom-serving-amount', data.servingAmount ?? serving.amount ?? 100);
  setInputValue('custom-serving-grams', data.servingGrams);
  document.getElementById('custom-serving-unit').value = data.servingUnit || serving.unit || 'g';
  setInputValue('custom-description', data.description);
  setInputValue('custom-cal', data.cal);
  setInputValue('custom-carbs', data.carbs);
  setInputValue('custom-sugar', data.sugar);
  setInputValue('custom-fiber', data.fiber);
  setInputValue('custom-protein', data.protein);
  setInputValue('custom-fat', data.fat);
  setInputValue('custom-saturated-fat', data.saturatedFat);
  setInputValue('custom-trans-fat', data.transFat);
  setInputValue('custom-cholesterol', data.cholesterol);
  setInputValue('custom-sodium', data.sodium);
  setInputValue('custom-potassium', data.potassium);
  setInputValue('custom-calcium', data.calcium);
  setInputValue('custom-iron', data.iron);
  setInputValue('custom-magnesium', data.magnesium);
  setInputValue('custom-vitamin-d', data.vitaminD);
  setInputValue('custom-vitamin-c', data.vitaminC);
  updateCustomSaveLabel();
}

document.getElementById('custom-save').addEventListener('click', async () => {
  const button = document.getElementById('custom-save');
  const name = document.getElementById('custom-name').value.trim();
  const servingAmount = Number(document.getElementById('custom-serving-amount').value) || 100;
  const servingUnit = document.getElementById('custom-serving-unit').value || 'g';
  const servingGrams = optionalNumberFromInput('custom-serving-grams');
  const serving = `${servingAmount}${servingUnit}`;
  const description = document.getElementById('custom-description').value.trim();
  const foodData = {
    // 비워두면 0이 아니라 '미입력'으로 저장(나중에 기록 상세에서 채움)
    cal: optionalNumberFromInput('custom-cal'),
    carbs: optionalNumberFromInput('custom-carbs'),
    sugar: optionalNumberFromInput('custom-sugar'),
    fiber: optionalNumberFromInput('custom-fiber'),
    protein: optionalNumberFromInput('custom-protein'),
    fat: optionalNumberFromInput('custom-fat'),
    saturatedFat: optionalNumberFromInput('custom-saturated-fat'),
    transFat: optionalNumberFromInput('custom-trans-fat'),
    cholesterol: optionalNumberFromInput('custom-cholesterol'),
    sodium: optionalNumberFromInput('custom-sodium'),
    potassium: optionalNumberFromInput('custom-potassium'),
    calcium: optionalNumberFromInput('custom-calcium'),
    iron: optionalNumberFromInput('custom-iron'),
    magnesium: optionalNumberFromInput('custom-magnesium'),
    vitaminD: optionalNumberFromInput('custom-vitamin-d'),
    vitaminC: optionalNumberFromInput('custom-vitamin-c'),
    serving,
    servingAmount,
    servingUnit,
    servingGrams,
    description,
    foodId: CUSTOM_FOODS[editingCustomFoodName]?.foodId || `food-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    source: 'user-entry',
    sourceTrust: 'user',
    discoveredAt: CUSTOM_FOODS[editingCustomFoodName]?.discoveredAt || new Date().toISOString(),
    discoveryOrigin: CUSTOM_FOODS[editingCustomFoodName]?.discoveryOrigin || 'manual',
    unlocked: true,
  };

  if (!name) {
    alert(ACTIVE_LOCALE === 'en' ? 'Enter a food name.' : '음식 이름을 입력해주세요.');
    return;
  }

  const previousName = editingCustomFoodName;
  const shouldCloseProductModal = productRegistrationMode;
  await runButtonAction(button, async () => {
    await saveCustomFood(name, foodData, previousName);
    if (currentMeal) {
      await addFood(currentMeal, { name, ...foodData });
      showToast(isNutritionMissing(foodData)
        ? (ACTIVE_LOCALE === 'en' ? `${name} saved without nutrition. Fill it in later from the log.` : `${name} 저장 · 영양정보는 기록 상세에서 채울 수 있어요`)
        : (ACTIVE_LOCALE === 'en' ? `${name} saved and unlocked in Foodpedia` : `${name} 저장 · 식도감 해금`), 'info');
    } else {
      showToast(ACTIVE_LOCALE === 'en' ? `${name} unlocked in Foodpedia` : `${name} 식도감에 해금됨`, 'info');
    }
    // 실제 저장 완료 후에만 폼을 비운다.
    resetCustomFoodForm();
    renderCollectionProducts();
    if (document.getElementById('custom-name') && foodSearchInput?.value) {
      document.getElementById('custom-name').value = foodSearchInput.value.trim();
    }
    if (shouldCloseProductModal) closeModal();
  });
});


/* ============================
   음식 도감: 기록 상세 보기
   ============================ */
const foodDex = document.getElementById('food-dex');
const FOOD_NUTRITION_FIELDS = [
  ['cal', '칼로리', 'kcal'],
  ['carbs', '탄수화물', 'g'],
  ['protein', '단백질', 'g'],
  ['fat', '지방', 'g'],
  ['sugar', '당류', 'g'],
  ['fiber', '식이섬유', 'g'],
  ['saturatedFat', '포화지방', 'g'],
  ['transFat', '트랜스지방', 'g'],
  ['cholesterol', '콜레스테롤', 'mg'],
  ['sodium', '나트륨', 'mg'],
  ['potassium', '칼륨', 'mg'],
  ['calcium', '칼슘', 'mg'],
  ['iron', '철분', 'mg'],
  ['magnesium', '마그네슘', 'mg'],
  ['vitaminD', '비타민 D', 'µg'],
  ['vitaminC', '비타민 C', 'mg'],
];

function foodDexNumber(food) {
  const names = getFoodEntries().map(([name]) => name);
  const index = Math.max(names.indexOf(food.name), 0) + 1;
  return `NO. ${String(index).padStart(3, '0')}`;
}

let foodDexCanonicalFood = null;
let foodDexEditContext = null;

function foodLogCount(foodName) {
  if (FoodSearch.ready()) return FoodSearch.count(foodName); // 색인(한 번 만들고 저장 때 고침)
  const days = { ...(statsCache || {}), [dateKey(currentDate)]: dayDataFromMeals(meals) };
  return Object.values(days).reduce((count, day) => {
    return count + ['breakfast', 'lunch', 'dinner', 'snack']
      .flatMap(mealId => Array.isArray(day?.[mealId]) ? day[mealId] : [])
      .filter(food => food?.name === foodName).length;
  }, 0);
}

function foodDexBadge(food, count) {
  if (count < 1) return ACTIVE_LOCALE === 'en' ? 'First discovery' : '첫 발견';
  if (foodCategoryMeta(food.name).key === 'dessert' && count >= 2) return ACTIVE_LOCALE === 'en' ? 'Sweet tooth' : '달달이 러버';
  if (count >= 10) return ACTIVE_LOCALE === 'en' ? 'Everyday favorite' : '매일의 단골';
  if (count >= 5) return ACTIVE_LOCALE === 'en' ? 'Familiar favorite' : '익숙한 최애';
  return ACTIVE_LOCALE === 'en' ? 'Tasted' : '맛봄';
}

// 식도감에서 내가 등록한 음식 지우기(확인 한 번 더). 이미 적은 식단 기록은 음식 정보를 따로 들고 있어 그대로 남음
let foodDexDeleteName = null;
function syncFoodDexDelete(mode, food) {
  const wrap = document.getElementById('food-dex-delete');
  if (!wrap) return;
  const name = food?.name;
  const can = mode === 'index' && !!name && !!CUSTOM_FOODS[name] && !FOOD_DB[name];
  foodDexDeleteName = can ? name : null;
  wrap.hidden = !can;
  document.getElementById('food-dex-delete-confirm').hidden = true;
  document.getElementById('food-dex-delete-btn').hidden = false;
}
document.getElementById('food-dex-delete-btn')?.addEventListener('click', () => {
  document.getElementById('food-dex-delete-btn').hidden = true;
  document.getElementById('food-dex-delete-confirm').hidden = false;
  document.getElementById('food-dex-delete-cancel')?.focus();
});
document.getElementById('food-dex-delete-cancel')?.addEventListener('click', () => {
  document.getElementById('food-dex-delete-confirm').hidden = true;
  document.getElementById('food-dex-delete-btn').hidden = false;
});
document.getElementById('food-dex-delete-yes')?.addEventListener('click', async () => {
  const name = foodDexDeleteName;
  if (!name) return;
  try {
    await deleteCustomFood(name);
  } catch (error) {
    console.warn('delete food', error);
    showToast(ACTIVE_LOCALE === 'en' ? 'Could not delete. Try again.' : '지우지 못했어요. 다시 해 주세요.', 'info');
    return;
  }
  foodDexDeleteName = null;
  closeFoodDex();
  renderSearchHub();
  showToast(ACTIVE_LOCALE === 'en' ? 'Removed from Foodpedia' : '식도감에서 지웠어요', 'success');
});

function openFoodDex(food) {
  if (!foodDex || !food) return;
  const options = arguments[1] || {};
  const mode = options.mode || 'index';
  foodDex.dataset.mode = mode;
  if (mode === 'index') {
    foodDex.setAttribute('role', 'region');
    foodDex.removeAttribute('aria-modal');
  } else {
    foodDex.setAttribute('role', 'dialog');
    foodDex.setAttribute('aria-modal', 'true');
  }
  foodDexEditContext = mode === 'meal' ? (options.editContext || null) : null;
  foodDexCanonicalFood = FOOD_DB[food.name] ? { name: food.name, ...FOOD_DB[food.name] } : food;
  const referenceFood = mode === 'meal' ? food : foodDexCanonicalFood;
  syncFoodDexDelete(mode, referenceFood);
  syncFoodDexAdd(mode, referenceFood);
  const visibleName = displayFoodName(referenceFood);
  document.getElementById('food-dex-number').textContent = foodDexNumber(referenceFood);
  const category = foodCategoryMeta(referenceFood.name);
  const hero = document.getElementById('food-dex-icon');
  const imagePath = FOOD_IMAGE_BY_NAME[referenceFood.name];
  hero.replaceChildren();
  void imagePath;
  hero.classList.remove('has-food-image');
  hero.innerHTML = '<span class="food-dex-placeholder" aria-hidden="true"></span>';
  const categoryLabel = document.getElementById('food-dex-category');
  if (categoryLabel) {
    categoryLabel.hidden = mode === 'meal';
    categoryLabel.textContent = ACTIVE_LOCALE === 'en' ? 'FOOD INDEX' : '음식 도감';
  }
  document.getElementById('food-dex-name').textContent = visibleName || (ACTIVE_LOCALE === 'en' ? 'Food' : '음식');
  const servingText = referenceFood.serving || (ACTIVE_LOCALE === 'en' ? 'Serving not set' : '섭취량 미설정');
  const visibleServing = displayServing(referenceFood, servingText);
  document.getElementById('food-dex-serving').textContent = mode === 'meal'
    ? `${ACTIVE_LOCALE === 'en' ? 'Amount eaten' : '먹은 양'} ${visibleServing}`
    : visibleServing;
  const description = document.getElementById('food-dex-description');
  if (description) {
    const aiSource = mode === 'meal' ? aiSourceText(referenceFood) : '';
    description.hidden = mode === 'meal' && !aiSource;
    description.classList.toggle('food-dex-ai-source', Boolean(aiSource));
    description.textContent = aiSource || (ACTIVE_LOCALE === 'en'
      ? (referenceFood.descriptionEn || referenceFood.description || '')
      : (referenceFood.description || ''));
    if (aiSource) appendAiSourceLink(description, referenceFood);
  }
  const nutritionBasis = referenceFood.basis || visibleServing || (ACTIVE_LOCALE === 'en' ? 'not set' : '1회 제공량');
  document.getElementById('food-dex-nutrition-basis').textContent = ACTIVE_LOCALE === 'en'
    ? `Per serving: ${nutritionBasis}`
    : `${nutritionBasis} 기준`;

  const indexLink = document.getElementById('food-dex-index-link');
  if (indexLink) {
    indexLink.hidden = mode !== 'meal' || !FOOD_DB[food.name];
    indexLink.innerHTML = '<img src="assets/icon/buttons/note.svg" width="20" height="20" alt="" aria-hidden="true" />';
    indexLink.setAttribute('aria-label', ACTIVE_LOCALE === 'en'
      ? 'View reference nutrition in Foodpedia'
      : '식도감에서 기준 영양성분 보기');
  }
  const history = document.getElementById('food-dex-history');
  const count = foodLogCount(referenceFood.name);
  if (history) {
    history.hidden = mode !== 'index';
    history.innerHTML = mode === 'index'
      ? `<span>${ACTIVE_LOCALE === 'en' ? 'MY HISTORY' : '나의 기록'}</span><strong>${count}${ACTIVE_LOCALE === 'en' ? ' logs' : '회 먹음'}</strong><em>${escapeHtml(foodDexBadge(referenceFood, count))}</em><button type="button" class="food-dex-badges">${ACTIVE_LOCALE === 'en' ? 'Badge collection' : '배지 모음'}</button><div class="food-dex-badge-list" hidden><span>${ACTIVE_LOCALE === 'en' ? 'First discovery · Tasted · Familiar favorite · Everyday favorite · Sweet tooth' : '첫 발견 · 맛봄 · 익숙한 최애 · 매일의 단골 · 달달이 러버'}</span></div>`
      : '';
    history.querySelector('.food-dex-badges')?.addEventListener('click', event => {
      const list = history.querySelector('.food-dex-badge-list');
      if (!list) return;
      list.hidden = !list.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!list.hidden));
    });
  }

  const editRecord = document.getElementById('food-dex-edit-record');
  if (editRecord) {
    editRecord.hidden = mode !== 'meal' || !foodDexEditContext;
    editRecord.textContent = ACTIVE_LOCALE === 'en' ? 'Edit this log' : '이 기록 수정';
  }

  const grid = document.getElementById('food-dex-nutrition-grid');
  grid.innerHTML = '';
  const isBuiltInFood = Boolean(FOOD_DB[referenceFood.name]);
  FOOD_NUTRITION_FIELDS.forEach(([field, label, unit]) => {
    const value = referenceFood[field];
    const row = document.createElement('div');
    const hasValue = value !== undefined && value !== null && value !== '';
    row.classList.toggle('is-empty', !hasValue);
    const displayedValue = hasValue
      ? `${escapeHtml(value)}<small>${escapeHtml(unit)}</small>`
      : (isBuiltInFood
        ? '<span class="nutrition-not-reported">—</span>'
        : (NUTRITION_CORE_FIELDS.includes(field) ? `<span class="nutrition-not-reported">${ACTIVE_LOCALE === 'en' ? 'Not entered' : '미입력'}</span>` : ''));
    row.innerHTML = `<span>${escapeHtml(detailFieldLabel(field, label))}</span><strong>${displayedValue}</strong>`;
    grid.appendChild(row);
  });

  foodDex.hidden = false;
  document.body.classList.add('food-dex-open');
  const content = foodDex.querySelector('.food-dex-content');
  if (content) content.scrollTop = 0;
  requestAnimationFrame(() => foodDex.classList.add('open'));
  document.getElementById('food-dex-close')?.focus();
}

function closeFoodDex() {
  if (!foodDex) return;
  foodDex.classList.remove('open');
  document.body.classList.remove('food-dex-open');
  window.setTimeout(() => { foodDex.hidden = true; }, 220);
}

document.getElementById('food-dex-close')?.addEventListener('click', closeFoodDex);
document.getElementById('food-dex-edit-record')?.addEventListener('click', () => {
  if (!foodDexEditContext) return;
  const { mealId, idx } = foodDexEditContext;
  closeFoodDex();
  window.setTimeout(() => openFoodEdit(mealId, idx), 220);
});
document.getElementById('food-dex-index-link')?.addEventListener('click', () => {
  if (foodDexCanonicalFood) openFoodDex(foodDexCanonicalFood, { mode: 'index' });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (foodDex?.classList.contains('open')) closeFoodDex();
  else if (document.getElementById('foodex-library')?.classList.contains('open')) closeFoodexLibrary();
});

/* ============================
   음식 영양 수정 (가벼운 시트)
   ============================ */
const mealDetailModal = document.getElementById('meal-detail-modal');
const mealDetailSaveBtn = document.getElementById('meal-detail-save-btn');
const mealDetailCloseBtn = document.getElementById('meal-detail-close');
const mealDetailXBtn = document.getElementById('meal-detail-x');
const editFoodTitle = document.getElementById('edit-food-title');
const mealDetailEditGrid = document.getElementById('meal-detail-edit-grid');
let detailMealId = null;
let editingFoodIdx = null;

const DETAIL_FIELDS = [
  ['name', '이름', 'text', ''],
  ['serving', '기준량', 'text', ''],
  ['description', '제품 소개', 'textarea', ''],
  ['cal', '칼로리', 'number', 'kcal'],
  ['carbs', '탄수화물', 'number', 'g'],
  ['sugar', '당류', 'number', 'g'],
  ['fiber', '식이섬유', 'number', 'g'],
  ['protein', '단백질', 'number', 'g'],
  ['fat', '지방', 'number', 'g'],
  ['saturatedFat', '포화지방', 'number', 'g'],
  ['transFat', '트랜스지방', 'number', 'g'],
  ['cholesterol', '콜레스테롤', 'number', 'mg'],
  ['sodium', '나트륨', 'number', 'mg'],
];

function closeFoodEdit() {
  mealDetailModal.classList.remove('open');
  detailMealId = null;
  editingFoodIdx = null;
}

function parseServingValue(serving) {
  const match = String(serving || '').trim().match(/^([\d.]+)\s*(.*)$/);
  return match ? { amount: match[1], unit: match[2] || 'g' } : { amount: '', unit: 'g' };
}

function editNumberField(field, label, value, unit, className = '') {
  return `<label class="meal-detail-field ${className}">
    <span>${escapeHtml(label)}</span>
    <div class="meal-detail-input-wrap">
      <input class="settings-input meal-detail-input" data-edit-field="${field}" type="number" inputmode="decimal" min="0" step="0.1" value="${escapeHtml(value ?? '')}" />
      <small>${escapeHtml(unit)}</small>
    </div>
  </label>`;
}

function detailFieldLabel(field, korean) {
  if (ACTIVE_LOCALE !== 'en') return korean;
  return {
    cal: 'Calories', carbs: 'Carbs', sugar: 'Sugar', fiber: 'Fiber', protein: 'Protein', fat: 'Fat',
    saturatedFat: 'Saturated fat', transFat: 'Trans fat', cholesterol: 'Cholesterol', sodium: 'Sodium',
    potassium: 'Potassium', calcium: 'Calcium', iron: 'Iron', magnesium: 'Magnesium', vitaminD: 'Vitamin D', vitaminC: 'Vitamin C',
  }[field] || korean;
}

function servingUnitLabel(unit) {
  if (ACTIVE_LOCALE !== 'en') return unit;
  return {
    '개': 'item', '봉지': 'bag', '팩': 'pack', '접시': 'plate', '컵': 'cup', '큰술': 'tbsp', '작은술': 'tsp', '꼬집': 'pinch',
  }[unit] || unit;
}

function openFoodEdit(mealId, idx) {
  detailMealId = mealId;
  editingFoodIdx = idx;
  const food = meals[mealId].foods[idx];
  if (!food) return;

  editFoodTitle.textContent = ACTIVE_LOCALE === 'en'
    ? `Edit ${displayFoodName(food)}`
    : `${food.name} 수정`;
  const serving = food.servingAmount != null && food.servingUnit
    ? { amount: food.servingAmount, unit: food.servingUnit }
    : parseServingValue(food.serving);
  const servingUnits = ['g', '개', '봉지', '팩', '접시', 'ml', '컵', '큰술', '작은술', '꼬집'];
  if (serving.unit && !servingUnits.includes(serving.unit)) servingUnits.push(serving.unit);
  mealDetailEditGrid.innerHTML = `
    <section class="meal-edit-section meal-edit-identity">
      <h4>${ACTIVE_LOCALE === 'en' ? 'Name' : '이름'}</h4>
      <label class="meal-detail-field is-wide">
        <span>${ACTIVE_LOCALE === 'en' ? 'Food name' : '음식 이름'}</span>
        <div class="meal-detail-input-wrap"><input class="settings-input meal-detail-input" data-edit-field="name" type="text" value="${escapeHtml(food.name || '')}" /></div>
      </label>
    </section>
    <section class="meal-edit-section meal-edit-serving">
      <h4>${ACTIVE_LOCALE === 'en' ? 'Amount eaten' : '섭취량'}</h4>
      <div class="meal-serving-row">
        <label class="meal-detail-field"><span>${ACTIVE_LOCALE === 'en' ? 'Amount' : '수량'}</span><input class="settings-input meal-detail-input" data-serving-amount type="number" inputmode="decimal" min="0" step="0.1" value="${escapeHtml(serving.amount)}" /></label>
        <label class="meal-detail-field"><span>${ACTIVE_LOCALE === 'en' ? 'Unit' : '단위'}</span><select class="settings-input meal-serving-unit" data-serving-unit>${servingUnits.map(unit => `<option value="${escapeHtml(unit)}"${unit === serving.unit ? ' selected' : ''}>${escapeHtml(servingUnitLabel(unit))}</option>`).join('')}</select></label>
      </div>
    </section>
    <section class="meal-edit-section meal-edit-nutrition">
      <h4>${ACTIVE_LOCALE === 'en' ? 'Key nutrition' : '핵심 영양'}</h4>
      ${isNutritionMissing(food) ? `<p class="meal-edit-missing-note">${ACTIVE_LOCALE === 'en' ? 'Nutrition not entered yet. Fill in calories, carbs, protein, and fat. Blank values count as 0 in totals.' : '영양정보 미입력 상태예요. 칼로리·탄수화물·단백질·지방을 채워주세요. 비워둔 값은 합계에 0으로 계산돼요.'}</p><div class="meal-edit-ask-host"></div>` : ''}
      ${editNumberField('cal', detailFieldLabel('cal', '칼로리'), food.cal, 'kcal', 'is-wide')}
      <div class="meal-primary-nutrients">
        ${editNumberField('carbs', detailFieldLabel('carbs', '탄수화물'), food.carbs, 'g')}
        ${editNumberField('protein', detailFieldLabel('protein', '단백질'), food.protein, 'g')}
        ${editNumberField('fat', detailFieldLabel('fat', '지방'), food.fat, 'g')}
      </div>
      <details class="meal-advanced-nutrients">
        <summary>${ACTIVE_LOCALE === 'en' ? 'More nutrition (optional)' : '상세 영양성분 (선택)'}</summary>
        <div class="meal-advanced-grid">
          ${editNumberField('sugar', detailFieldLabel('sugar', '당류'), food.sugar, 'g')}
          ${editNumberField('fiber', detailFieldLabel('fiber', '식이섬유'), food.fiber, 'g')}
          ${editNumberField('saturatedFat', detailFieldLabel('saturatedFat', '포화지방'), food.saturatedFat, 'g')}
          ${editNumberField('transFat', detailFieldLabel('transFat', '트랜스지방'), food.transFat, 'g')}
          ${editNumberField('cholesterol', detailFieldLabel('cholesterol', '콜레스테롤'), food.cholesterol, 'mg')}
          ${editNumberField('sodium', detailFieldLabel('sodium', '나트륨'), food.sodium, 'mg')}
          ${editNumberField('potassium', detailFieldLabel('potassium', '칼륨'), food.potassium, 'mg')}
          ${editNumberField('calcium', detailFieldLabel('calcium', '칼슘'), food.calcium, 'mg')}
          ${editNumberField('iron', detailFieldLabel('iron', '철분'), food.iron, 'mg')}
          ${editNumberField('magnesium', detailFieldLabel('magnesium', '마그네슘'), food.magnesium, 'mg')}
          ${editNumberField('vitaminD', detailFieldLabel('vitaminD', '비타민 D'), food.vitaminD, 'µg')}
          ${editNumberField('vitaminC', detailFieldLabel('vitaminC', '비타민 C'), food.vitaminC, 'mg')}
        </div>
      </details>
    </section>
    <section class="meal-edit-section meal-edit-memo">
      <h4>${ACTIVE_LOCALE === 'en' ? 'Memo' : '메모'}</h4>
      <label class="meal-detail-field is-wide"><span>${ACTIVE_LOCALE === 'en' ? 'Optional note' : '선택 입력'}</span><textarea class="settings-input meal-detail-input meal-detail-description" data-edit-field="description" rows="3">${escapeHtml(food.description || '')}</textarea></label>
    </section>`;

  const askHost = mealDetailEditGrid.querySelector('.meal-edit-ask-host');
  if (askHost) askHost.appendChild(buildAskAiButton(mealId, [{ name: food.name, serving: food.serving || '' }], 'ask-ai-btn', { afterFill: () => closeFoodEdit() }));
  mealDetailModal.classList.add('open');
}

mealDetailCloseBtn.addEventListener('click', closeFoodEdit);
mealDetailXBtn?.addEventListener('click', closeFoodEdit);
mealDetailModal.addEventListener('click', event => {
  if (event.target === mealDetailModal) closeFoodEdit();
});

mealDetailSaveBtn.addEventListener('click', async () => {
  if (detailMealId === null || editingFoodIdx === null) return;
  const food = meals[detailMealId].foods[editingFoodIdx];
  if (!food) return;
  const next = { ...food };

  DETAIL_FIELDS.filter(([field]) => !['serving'].includes(field)).forEach(([field, , type]) => {
    const input = mealDetailEditGrid.querySelector(`[data-edit-field="${field}"]`);
    if (!input) return;
    if (type === 'number') {
      next[field] = input.value === '' ? undefined : Number(input.value) || 0;
    } else {
      next[field] = input.value.trim();
    }
  });
  const servingAmount = mealDetailEditGrid.querySelector('[data-serving-amount]')?.value.trim() || '';
  const servingUnit = mealDetailEditGrid.querySelector('[data-serving-unit]')?.value || 'g';
  next.serving = servingAmount ? `${servingAmount}${servingUnit}` : food.serving;
  next.servingAmount = servingAmount ? Number(servingAmount) : undefined;
  next.servingUnit = servingAmount ? servingUnit : undefined;
  next.source = 'user-entry';
  next.sourceTrust = 'user';
  next.servingGramsEstimated = false;
  next.name = next.name || food.name;
  if (food.icon) next.icon = food.icon;

  await runButtonAction(mealDetailSaveBtn, async () => {
    const before = snapshotMeals();
    meals[detailMealId].foods[editingFoodIdx] = next;
    renderAll(true);
    await persistMealsOrRestore(before);
    closeFoodEdit();
    showToast(ACTIVE_LOCALE === 'en' ? 'Food information saved.' : '음식 정보가 저장됐어요.', 'info');
  });
});

/* ============================
   섭취 시간 수정
   ============================ */
const timeEditModal = document.getElementById('time-edit-modal');
const timeEditInput = document.getElementById('time-edit-input');
const timeEditHour = document.getElementById('time-edit-hour');
const timeEditMinute = document.getElementById('time-edit-minute');
const timePeriodButtons = [...document.querySelectorAll('[data-time-period]')];
const timeEditSaveBtn = document.getElementById('time-edit-save');
const timeEditCloseBtn = document.getElementById('time-edit-close');
const timeEditTitle = document.getElementById('time-edit-title');
let editingTimeContext = null;
let selectedTimePeriod = 'am';

if (timeEditHour && !timeEditHour.options.length) {
  for (let hour = 1; hour <= 12; hour += 1) {
    const option = document.createElement('option');
    option.value = String(hour);
    option.textContent = `${hour}시`;
    timeEditHour.appendChild(option);
  }
}

function normaliseExactTime(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  const candidate = /^\d{1,2}:\d{2}$/.test(raw)
    ? raw
    : digits.length === 3
      ? `0${digits[0]}:${digits.slice(1)}`
      : digits.length === 4
        ? `${digits.slice(0, 2)}:${digits.slice(2)}`
        : '';
  const match = candidate.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function renderTimePeriodButtons() {
  timePeriodButtons.forEach(button => {
    const active = button.dataset.timePeriod === selectedTimePeriod;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function syncTimeQuickControls(value) {
  const normalised = normaliseExactTime(value);
  if (!normalised || !timeEditHour || !timeEditMinute) return;
  const [hour24, minute] = normalised.split(':').map(Number);
  selectedTimePeriod = hour24 >= 12 ? 'pm' : 'am';
  timeEditHour.value = String((hour24 % 12) || 12);
  const nearestQuarter = Math.min(45, Math.round(minute / 15) * 15);
  timeEditMinute.value = String(nearestQuarter).padStart(2, '0');
  renderTimePeriodButtons();
}

function updateExactTimeFromQuickControls() {
  if (!timeEditHour || !timeEditMinute) return;
  let hour = Number(timeEditHour.value) % 12;
  if (selectedTimePeriod === 'pm') hour += 12;
  timeEditInput.value = `${String(hour).padStart(2, '0')}:${timeEditMinute.value}`;
}

timePeriodButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedTimePeriod = button.dataset.timePeriod === 'pm' ? 'pm' : 'am';
    renderTimePeriodButtons();
    updateExactTimeFromQuickControls();
  });
});
timeEditHour?.addEventListener('change', updateExactTimeFromQuickControls);
timeEditMinute?.addEventListener('change', updateExactTimeFromQuickControls);
timeEditInput?.addEventListener('input', () => {
  const normalised = normaliseExactTime(timeEditInput.value);
  if (normalised) syncTimeQuickControls(normalised);
});

function closeTimeEdit() {
  timeEditModal.classList.remove('open');
  editingTimeContext = null;
}

function timeContextLabel(mealId) {
  return mealId === 'snack' ? t('snack') : mealLabel(mealId);
}

function openTimeEdit(mealId, slot = null) {
  editingTimeContext = { mealId, slot };
  const entry = timeEntryFor(mealId, slot);
  const value = entry?.value || '';
  timeEditTitle.textContent = ACTIVE_LOCALE === 'en'
    ? `${timeContextLabel(mealId)} time`
    : `${timeContextLabel(mealId)} 섭취 시간`;
  timeEditInput.value = /^\d{2}:\d{2}$/.test(value) ? value : '';
  syncTimeQuickControls(timeEditInput.value || '12:00');
  timeEditModal.classList.add('open');
  setTimeout(() => timeEditInput.focus(), 40);
}

timeEditCloseBtn.addEventListener('click', closeTimeEdit);
timeEditModal.addEventListener('click', event => {
  if (event.target === timeEditModal) closeTimeEdit();
});

timeEditSaveBtn.addEventListener('click', async () => {
  if (!editingTimeContext) return;
  const exactTime = normaliseExactTime(timeEditInput.value);
  if (!exactTime) {
    showToast(ACTIVE_LOCALE === 'en' ? 'Enter a valid time.' : '올바른 시간을 입력해주세요.', 'info');
    timeEditInput.focus();
    return;
  }
  const before = snapshotMeals();
  setCardTime(editingTimeContext.mealId, editingTimeContext.slot, exactTime, true);
  renderAll(true);
  await runButtonAction(timeEditSaveBtn, async () => {
    await persistMealsOrRestore(before);
    closeTimeEdit();
  });
});

/* ============================
   내정보 페이지
   ============================ */
function fillProfileForm() {
  const h = document.getElementById('input-height');
  const w = document.getElementById('input-weight');
  const cal = document.getElementById('input-target-cal');
  if (h) h.value = PROFILE.height;
  if (w) w.value = PROFILE.weight;
  if (cal) cal.value = PROFILE.targetCal;
  updateProfilePageSummary();
}

function updateProfilePageSummary() {
  const sh = document.getElementById('profile-summary-height');
  const sw = document.getElementById('profile-summary-weight');
  const sc = document.getElementById('profile-summary-cal');
  if (sh) sh.innerHTML = `${PROFILE.height}<small>cm</small>`;
  if (sw) sw.innerHTML = `${PROFILE.weight}<small>kg</small>`;
  if (sc) sc.innerHTML = `${PROFILE.targetCal.toLocaleString()}<small>kcal</small>`;
}

function updateProfileUI() {
  const h = document.getElementById('stat-height');
  const w = document.getElementById('stat-weight');
  const t = document.getElementById('stat-target-cal');
  if (w) w.innerHTML = `${PROFILE.weight}<small>kg</small>`;
  if (t) t.textContent = `${PROFILE.targetCal.toLocaleString()}kcal`;
  if (h) h.innerHTML = `${PROFILE.height}<small>cm</small>`;
  const healthWeight = document.getElementById('health-weight');
  const healthHeight = document.getElementById('health-height');
  const kcalTarget = document.getElementById('kcal-target-value');
  if (healthWeight) healthWeight.textContent = `${PROFILE.weight}kg`;
  if (healthHeight) healthHeight.textContent = `${PROFILE.height}cm`;
  if (kcalTarget) kcalTarget.textContent = PROFILE.targetCal.toLocaleString();
  const gaugeGoal = document.getElementById('kcal-gauge-goal');
  if (gaugeGoal) gaugeGoal.textContent = PROFILE.targetCal.toLocaleString();
  updateProfilePageSummary();
}

let previousView = 'home';
document.querySelectorAll('.open-profile-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveView('profile');
  });
});

document.getElementById('profile-close')?.addEventListener('click', () => {
  setActiveView(previousView || 'home');
});

document.getElementById('home-search')?.addEventListener('click', () => {
  setActiveView('search');
});

document.getElementById('search-hub-close')?.addEventListener('click', () => {
  const input = document.getElementById('search-hub-input');
  if (input) input.value = '';
  activePurposeKey = null;
  document.querySelectorAll('[data-purpose-key]').forEach(button => button.classList.remove('active'));
  setActiveView('home');
});

document.getElementById('settings-save')?.addEventListener('click', async () => {
  const btn = document.getElementById('settings-save');
  if (!btn || btn.disabled || btn.dataset.actionLocked === 'true') return;
  btn.dataset.actionLocked = 'true';
  const h = Number(document.getElementById('input-height').value) || 169;
  const w = Number(document.getElementById('input-weight').value) || 50;
  const cal = Number(document.getElementById('input-target-cal').value) || 1300;

  const nextProfile = { height: h, weight: w, targetCal: cal, locale: ACTIVE_LOCALE };
  const hint = document.getElementById('profile-save-hint');
  const prev = btn.textContent;
  setButtonPending(btn, true);
  btn.textContent = ACTIVE_LOCALE === 'en' ? 'Saving…' : '저장 중…';
  try {
    await saveSettings(nextProfile);
    PROFILE = { ...PROFILE, ...nextProfile };
    TARGETS = calcTargets(cal);
    updateProfileUI();
    renderAll(true);
    if (hint) {
      hint.hidden = false;
      clearTimeout(hint._timer);
      hint._timer = setTimeout(() => { hint.hidden = true; }, 1800);
    }
    btn.textContent = ACTIVE_LOCALE === 'en' ? 'Saved ✓' : '저장됨 ✓';
    clearTimeout(btn._timer);
    btn._timer = setTimeout(() => { btn.textContent = prev; }, 1800);
  } catch (error) {
    btn.textContent = prev;
    fillProfileForm();
    showStorageFailure(error);
  } finally {
    setButtonPending(btn, false);
    setTimeout(() => { delete btn.dataset.actionLocked; }, 400);
  }
});

document.querySelectorAll('.language-option[data-language]').forEach(button => {
  button.addEventListener('click', async () => {
    const nextLocale = button.dataset.language;
    if (nextLocale !== 'ko' && nextLocale !== 'en' || nextLocale === ACTIVE_LOCALE) return;
    const previousLocale = ACTIVE_LOCALE;
    ACTIVE_LOCALE = nextLocale;
    PROFILE = { ...PROFILE, locale: ACTIVE_LOCALE };
    applyLanguage();
    try {
      await saveSettings({ locale: ACTIVE_LOCALE });
      renderReminderForm(reminderDraft || currentReminderConfig());
      if (currentReminderConfig().enabled) NiliriReminders.apply(currentReminderConfig(), ACTIVE_LOCALE);
    } catch (error) {
      ACTIVE_LOCALE = previousLocale;
      PROFILE = { ...PROFILE, locale: previousLocale };
      applyLanguage();
      showStorageFailure(error);
    }
  });
});

/* ============================
   하단 탭 · 화면 전환 · 통계 달력
   ============================ */
let activeView = 'home';
let statsMonth = new Date(); // 연·월만 사용
let statsSelectedKey = dateKey(new Date());
let statsCache = {}; // loadStorage 스냅샷
let statsCalendarExpanded = false;

function dayFoodsFromData(dayData) {
  if (!dayData || typeof dayData !== 'object') return [];
  return ['breakfast', 'lunch', 'snack', 'dinner'].flatMap(k => dayData[k] || []);
}

function dayTotalsFromData(dayData) {
  return dayFoodsFromData(dayData).reduce(
    (acc, f) => {
      acc.cal += f.cal || 0;
      acc.carbs += f.carbs || 0;
      acc.protein += f.protein || 0;
      acc.fat += f.fat || 0;
      return acc;
    },
    { cal: 0, carbs: 0, protein: 0, fat: 0 }
  );
}

function hasDayLog(dayData) {
  return dayFoodsFromData(dayData).length > 0;
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const FOOD_CATEGORY_BY_NAME = Object.freeze({
  '그릭요거트': 'dairy', '바나나': 'produce', '삶은 달걀': 'protein', '닭가슴살': 'protein',
  '현미밥': 'grain', '아보카도': 'produce', '사과': 'produce', '케이크': 'dessert',
  '아메리카노': 'drink', '두부': 'vegan', '오트밀': 'grain', '샐러드': 'vegan', '아몬드': 'nuts',
  '닭고기': 'protein', '도넛': 'dessert', '초밥': 'protein', '방울토마토': 'produce',
  '로메인': 'produce', '블루베리': 'produce',
  '초콜릿': 'processed', '햄버거': 'fastfood', '피자': 'fastfood', '프로틴바': 'processed',
  '도넛': 'processed', '제로콜라': 'processed',
  '딸기': 'produce', '토마토': 'produce', '제로콜라': 'drink',
});

const FOOD_CATEGORY_COPY = Object.freeze({
  all: ['전체', 'All'], produce: ['농산', 'Produce'], vegan: ['비건', 'Vegan'], nuts: ['견과', 'Nuts'],
  protein: ['정육·단백질', 'Protein'], dairy: ['유제품', 'Dairy'], grain: ['곡물', 'Grains'],
  dessert: ['디저트', 'Dessert'], processed: ['가공식품', 'Processed foods'], fastfood: ['패스트푸드', 'Fast food'],
  drink: ['음료', 'Drinks'], other: ['기타', 'Other'],
});

let searchIndexCategory = null;
let foodexFilter = 'all';
let searchIndexLayout = 'cards';
let searchIndexSort = 'latest';
let activePurposeKey = null;
const FOOD_PURPOSE_GROUPS = Object.freeze({
  balanced: { ko: '균형 식사', en: 'Balanced meals', foods: ['현미밥', '닭가슴살', '삶은 달걀', '아보카도', '사과'] },
  weight: { ko: '체중 관리', en: 'Weight goals', foods: ['닭가슴살', '그릭요거트', '삶은 달걀', '샐러드', '아보카도'] },
  workout: { ko: '운동 전후', en: 'Around workouts', foods: ['바나나', '현미밥', '닭가슴살', '그릭요거트', '오트밀'] },
  gentle: { ko: '부드러운 식사', en: 'Gentle meals', foods: ['그릭요거트', '바나나', '삶은 달걀', '두부', '오트밀'] },
});

function foodCategoryMeta(name) {
  const key = FOOD_CATEGORY_BY_NAME[name] || 'other';
  const label = FOOD_CATEGORY_COPY[key]?.[ACTIVE_LOCALE === 'en' ? 1 : 0] || key;
  return { key, label };
}

function foodCategoryIcon(key) {
  const paths = {
    produce: '<path d="M6 15C6 9 9 5 15 4C15 10 12 14 6 15Z"/><path d="M6 15C8 11 10 9 14 6"/>',
    vegan: '<path d="M5 15C5 9 8 5 15 4C15 11 11 15 5 15Z"/><path d="M5 15L15 5"/>',
    nuts: '<path d="M7 4C12 3 16 7 15 12C14 16 9 17 6 14C3 11 4 6 7 4Z"/><path d="M8 6C9 9 9 12 7 14"/>',
    protein: '<path d="M6 6C8 3 12 3 15 6C17 8 16 12 13 13L7 16L4 13C2 10 3 7 6 6Z"/>',
    dairy: '<path d="M7 3H13L15 7V17H5V7L7 3Z"/><path d="M5 7H15M8 3V7"/>',
    grain: '<path d="M10 17V4M10 7L6 5M10 10L14 8M10 13L6 11"/><path d="M5 4C7 4 9 6 9 8C7 8 5 6 5 4ZM15 7C13 7 11 9 11 11C13 11 15 9 15 7Z"/>',
    dessert: '<path d="M4 15L7 6L16 10L14 16H5Z"/><path d="M7 6C10 3 14 5 16 10"/>',
    drink: '<path d="M5 6H15L14 17H6L5 6Z"/><path d="M8 3H14L12 8"/>',
    other: '<rect x="4" y="4" width="5" height="5"/><rect x="11" y="4" width="5" height="5"/><rect x="4" y="11" width="5" height="5"/><rect x="11" y="11" width="5" height="5"/>',
  };
  return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || paths.other}</svg>`;
}

function foodIndexIcon(name, categoryKey) {
  const imagePath = FOOD_IMAGE_BY_NAME[name];
  // Foods added outside the built-in catalog do not have artwork yet.
  // Keep the fallback neutral and consistent with the product's note action
  // instead of implying that a camera/photo workflow is already available.
  // 음식 그림은 잠시 쓰지 않음(FOOD_IMAGE_BY_NAME 은 그대로 둠): 같은 크기의 빈 자리만
  void imagePath;
  return '<span class="food-index-image food-index-placeholder" aria-hidden="true"></span>';
}

function renderSearchHub() {
  const results = document.getElementById('search-hub-results');
  const indexGrid = document.getElementById('search-index-grid');
  const categories = document.getElementById('search-index-categories');
  const input = document.getElementById('search-hub-input');
  const foodexInput = document.getElementById('foodex-search-input');
  if (!results || !indexGrid || !categories || !input) return;
  // 식도감에서 검색 중이면 묶음 결과만(전체 목록 정렬·그리기 건너뜀)
  if ((foodexInput?.value || '').trim() && document.getElementById('view-search')?.dataset.hubMode === 'foodex') { renderFoodexResults(); return; }

  document.querySelectorAll('[data-index-layout]').forEach(button => {
    const active = button.dataset.indexLayout === searchIndexLayout;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const query = input.value.trim().toLowerCase();
  const foodexQuery = (foodexInput?.value || '').trim().toLowerCase();
  const entries = [...getFoodEntries()].sort((a, b) => {
    if (searchIndexSort === 'frequent') {
      const frequencyDifference = foodLogCount(b[0]) - foodLogCount(a[0]);
      if (frequencyDifference) return frequencyDifference;
    }
    if (searchIndexSort === 'latest') {
      const aDate = a[1]?.discoveredAt || a[1]?.createdAt || a[1]?.updatedAt || '';
      const bDate = b[1]?.discoveredAt || b[1]?.createdAt || b[1]?.updatedAt || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
    }
    return displayFoodName({ name: a[0], ...a[1] }).localeCompare(
      displayFoodName({ name: b[0], ...b[1] }),
      ACTIVE_LOCALE === 'en' ? 'en' : 'ko',
    );
  });
  const matchQuery = (name, data, q) =>
    !q || `${name} ${displayFoodName({ name, ...data })} ${data.serving || ''}`.toLowerCase().includes(q);
  const filtered = entries.filter(([name, data]) => matchQuery(name, data, query));
  let indexEntries = entries.filter(([name, data]) => matchQuery(name, data, foodexQuery));
  // 식도감 필터: 최근 먹은(최근 음식 순서) · 자주 먹은(2번 이상, 많이 먹은 순)
  if (foodexFilter === 'recent') {
    const order = RECENT_FOODS.map(food => food?.name);
    indexEntries = indexEntries.filter(([name]) => order.includes(name)).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  } else if (foodexFilter === 'frequent') {
    const counts = new Map(indexEntries.map(([name]) => [name, foodLogCount(name)]));
    indexEntries = indexEntries.filter(([name]) => counts.get(name) >= 2).sort((a, b) => counts.get(b[0]) - counts.get(a[0]));
  }
  document.querySelectorAll('[data-foodex-filter]').forEach(button => {
    const on = button.dataset.foodexFilter === foodexFilter;
    button.classList.toggle('active', on);
    button.setAttribute('aria-pressed', String(on));
  });

  const createIndexButton = ([name, data], compact = false) => {
    const food = { name, ...data };
    const category = foodCategoryMeta(name);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = compact ? `search-index-item search-index-product ${searchIndexLayout === 'cards' ? 'is-product-card' : ''}` : 'search-result-item';
    button.innerHTML = compact
      ? `<span class="search-index-icon">${foodIndexIcon(name, category.key)}</span>
         <span class="search-index-category">${escapeHtml(category.label)}</span>
         <strong>${escapeHtml(displayFoodName(food))}</strong>
         <span class="search-index-meta">${Math.round(data.cal || 0)}kcal · ${escapeHtml(displayServing({ name, ...data }, data.serving || '100g'))}</span>`
      : `<span class="search-result-copy">
           <strong>${escapeHtml(displayFoodName(food))}</strong>
           <small>${escapeHtml(displayServing({ name, ...data }, data.serving || (ACTIVE_LOCALE === 'en' ? 'Serving not set' : '기준량 미설정')))}</small>
         </span>
         <span class="search-result-kcal">${Math.round(data.cal || 0)}<small>kcal</small></span>`;
    button.addEventListener('click', () => openFoodDex(food, { mode: 'index' }));
    return button;
  };

  results.innerHTML = '';
  if (!query && activePurposeKey && FOOD_PURPOSE_GROUPS[activePurposeKey]) {
    const purpose = FOOD_PURPOSE_GROUPS[activePurposeKey];
    const section = document.createElement('section');
    section.className = 'search-discovery-section purpose-results';
    section.innerHTML = `<div class="purpose-results-head"><h3>${escapeHtml(ACTIVE_LOCALE === 'en' ? purpose.en : purpose.ko)}</h3><span>${ACTIVE_LOCALE === 'en' ? 'Suggestions, not a fixed meal plan' : '고정 식단이 아닌 선택 제안'}</span></div>`;
    purpose.foods
      .map(name => entries.find(([entryName]) => entryName === name))
      .filter(Boolean)
      .forEach(entry => section.appendChild(createIndexButton(entry)));
    results.appendChild(section);
  } else if (!query) {
    const recent = RECENT_FOODS
      .map(food => entries.find(([name]) => name === food.name) || [food.name, food])
      .filter(Boolean);
    if (!recent.length) {
      results.innerHTML = `<p class="search-hub-empty">${ACTIVE_LOCALE === 'en'
        ? 'No recent foods yet. Use the search field to find a food.'
        : '아직 최근 음식이 없어요. 검색창에서 음식을 찾아보세요.'}</p>`;
    } else {
      const section = document.createElement('section');
      section.className = 'search-discovery-section';
      section.innerHTML = `<h3>${ACTIVE_LOCALE === 'en' ? 'Recently eaten' : '최근 먹은 음식'}</h3>`;
      recent.slice(0, 8).forEach(entry => section.appendChild(createIndexButton(entry)));
      results.appendChild(section);
    }
  } else if (!filtered.length) {
    results.innerHTML = `<p class="search-hub-empty">${ACTIVE_LOCALE === 'en' ? 'No matching food in the built-in library.' : '내장 음식에서 일치하는 결과가 없어요.'}</p>`;
  } else {
    filtered.forEach(entry => results.appendChild(createIndexButton(entry)));
  }

  const presentCategories = [...new Set(indexEntries.map(([name]) => foodCategoryMeta(name).key))];
  categories.innerHTML = '';
  indexGrid.innerHTML = '';
  indexGrid.classList.toggle('is-product-list', searchIndexLayout === 'list');
  indexGrid.classList.toggle('is-list-layout', searchIndexLayout === 'list');

  // Foodpedia 검색어가 있으면 카테고리 대신 결과 목록
  if (foodexQuery) { renderFoodexResults(); return; }
  setFoodexResultsMode(false);

  if (foodexFilter !== 'all') {
    categories.hidden = true;
    if (!indexEntries.length) {
      const empty = foodexFilter === 'recent'
        ? (ACTIVE_LOCALE === 'en' ? 'No recently eaten foods yet.' : '아직 최근 먹은 음식이 없어요.')
        : (ACTIVE_LOCALE === 'en' ? 'No food eaten twice or more yet.' : '두 번 이상 먹은 음식이 아직 없어요.');
      indexGrid.innerHTML = `<p class="search-hub-empty">${empty}</p>`;
      return;
    }
    indexEntries.forEach(entry => indexGrid.appendChild(createIndexButton(entry, true)));
    return;
  }

  if (searchIndexCategory) {
    categories.hidden = false;
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'search-index-back';
    back.innerHTML = `<span aria-hidden="true">←</span> ${ACTIVE_LOCALE === 'en' ? 'Categories' : '카테고리'}`;
    back.addEventListener('click', () => {
      searchIndexCategory = null;
      renderSearchHub();
    });
    const current = document.createElement('strong');
    current.className = 'search-index-current';
    current.textContent = FOOD_CATEGORY_COPY[searchIndexCategory]?.[ACTIVE_LOCALE === 'en' ? 1 : 0] || searchIndexCategory;
    categories.append(back, current);
    indexEntries
      .filter(([name]) => foodCategoryMeta(name).key === searchIndexCategory)
      .forEach(entry => indexGrid.appendChild(createIndexButton(entry, true)));
    return;
  }

  if (searchIndexLayout === 'list') {
    categories.hidden = true;
    indexEntries.forEach(entry => indexGrid.appendChild(createIndexButton(entry, true)));
    return;
  }

  categories.hidden = true;
  presentCategories.forEach(key => {
    const categoryEntries = indexEntries.filter(([name]) => foodCategoryMeta(name).key === key);
    const label = FOOD_CATEGORY_COPY[key]?.[ACTIVE_LOCALE === 'en' ? 1 : 0] || key;
    const sample = categoryEntries.slice(0, 2).map(([name, data]) => displayFoodName({ name, ...data })).join(', ');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-category-card';
    const representativeName = categoryEntries[0]?.[0];
    button.innerHTML = `
      <span class="search-index-icon">${foodIndexIcon(representativeName, key)}</span>
      <strong>${escapeHtml(label)}</strong>
      <span class="search-category-count">${ACTIVE_LOCALE === 'en'
        ? `${categoryEntries.length} ${categoryEntries.length === 1 ? 'food' : 'foods'}`
        : `${categoryEntries.length}개 음식`}</span>
      <small>${escapeHtml(sample)}</small>`;
    button.addEventListener('click', () => {
      searchIndexCategory = key;
      renderSearchHub();
    });
    indexGrid.appendChild(button);
  });
}

function setSearchHubView(view) {
  if (view === 'custom') {
    mountCustomFoodForm('hub');
    currentMeal = null;
    productRegistrationMode = false;
    resetCustomFoodForm();
  }
  document.querySelectorAll('.search-hub-tab').forEach(button => {
    const active = button.dataset.searchView === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.search-hub-panel').forEach(panel => {
    const active = panel.dataset.searchPanel === view;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
  if (view === 'search') document.getElementById('search-hub-input')?.focus();
  if (view === 'products') renderCollectionProducts();
  if (view === 'custom') window.setTimeout(() => document.getElementById('custom-name')?.focus(), 50);
}

/** 식도감 내부 탭: index(Foodpedia) | recipe(레시피) */
function setFoodexPageTab(tab = 'index') {
  const library = document.getElementById('foodex-library');
  if (!library) return;
  const next = tab === 'recipe' || tab === 'badge' ? tab : 'index';
  library.dataset.foodexTab = next;
  document.querySelectorAll('.foodex-page-tab').forEach(button => {
    const active = button.dataset.foodexTab === next;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-foodex-panel]').forEach(panel => {
    const active = panel.dataset.foodexPanel === next;
    panel.hidden = !active;
  });
  const searchToggle = document.getElementById('foodex-search-toggle');
  const searchBar = document.getElementById('foodex-search-bar');
  if (next !== 'index') {
    if (searchToggle) {
      searchToggle.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
    }
    if (searchBar) searchBar.hidden = true;
  } else {
    if (searchToggle) searchToggle.hidden = false;
    if (searchBar) searchBar.hidden = false;
  }
  if (next === 'index') renderSearchHub();
}

/** search | fridge | foodex — 같은 view-search 패널의 역할 모드 */
function setSearchHubMode(mode) {
  const hub = document.getElementById('view-search');
  if (!hub) return;
  hub.dataset.hubMode = mode;
  document.body.classList.toggle('foodex-tab-mode', mode === 'foodex');

  const kicker = document.getElementById('search-hub-kicker');
  const title = document.getElementById('search-hub-title');
  if (mode === 'fridge') {
    if (kicker) kicker.textContent = t('fridgeKicker');
    if (title) title.textContent = t('fridgeTitle');
  } else if (mode === 'search') {
    if (kicker) kicker.textContent = t('searchOnlyKicker');
    if (title) title.textContent = t('searchOnlyTitle');
  }

  const library = document.getElementById('foodex-library');
  const closeBtn = document.getElementById('foodex-library-close');
  const foodexSearchBar = document.getElementById('foodex-search-bar');
  const foodexSearchToggle = document.getElementById('foodex-search-toggle');
  const foodexSearchInput = document.getElementById('foodex-search-input');

  if (mode === 'foodex') {
    renderSearchHub();
    if (library) {
      library.hidden = false;
      library.classList.add('open', 'is-page');
      library.setAttribute('role', 'region');
      library.removeAttribute('aria-modal');
    }
    if (closeBtn) closeBtn.hidden = true;
    setFoodexPageTab(library?.dataset.foodexTab || 'index');
    document.body.classList.remove('foodex-library-open');
  } else if (library) {
    library.classList.remove('open', 'is-page');
    library.hidden = true;
    library.setAttribute('role', 'dialog');
    library.setAttribute('aria-modal', 'true');
    if (closeBtn) closeBtn.hidden = false;
    if (foodexSearchBar) foodexSearchBar.hidden = true;
    if (foodexSearchToggle) {
      foodexSearchToggle.hidden = true;
      foodexSearchToggle.setAttribute('aria-expanded', 'false');
    }
    if (foodexSearchInput) foodexSearchInput.value = '';
    document.body.classList.remove('foodex-library-open');
  }
}

function openFoodexLibrary() {
  const library = document.getElementById('foodex-library');
  if (!library) return;
  renderSearchHub();
  library.hidden = false;
  library.classList.remove('is-page');
  library.setAttribute('role', 'dialog');
  library.setAttribute('aria-modal', 'true');
  document.body.classList.add('foodex-library-open');
  requestAnimationFrame(() => library.classList.add('open'));
  document.getElementById('foodex-library-close')?.focus();
}

function closeFoodexLibrary() {
  const library = document.getElementById('foodex-library');
  if (!library || library.hidden) return;
  if (library.classList.contains('is-page')) return;
  library.classList.remove('open');
  document.body.classList.remove('foodex-library-open');
  window.setTimeout(() => { library.hidden = true; }, 220);
  document.getElementById('search-hub-tab-index')?.focus();
}

function setActiveView(view) {
  const prevPanel = visiblePanel();
  if (view === 'ai') { setActiveView('home'); setTimeout(() => focusAiDock(), 50); return; } // 예전 AI 탭 → 홈 하단 입력창
  if (view !== 'profile') {
    previousView = view;
  }
  activeMealPageContext = null;
  document.getElementById('view-meal-detail').hidden = true;
  document.body.classList.remove('meal-page-open');
  activeView = view;
  const aiDock = document.getElementById('home-ai-dock');
  if (aiDock) aiDock.hidden = view !== 'home';
  document.body.classList.toggle('has-ai-dock', view === 'home'); // 토스트를 입력창 위로
  document.body.classList.toggle('foodex-page', view === 'foodex'); // 식도감 아래 검색창
  if (view !== 'home') {
    document.querySelectorAll('#view-home .meal-card.expanded, #view-home .snack-card.expanded').forEach(card => {
      card.classList.remove('expanded', 'auto-expanded');
      card.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
    });
  }
  const panelView = (view === 'shopping' || view === 'fridge' || view === 'foodex') ? 'search' : view;
  const panels = {
    home: document.getElementById('view-home'),
    stats: document.getElementById('view-stats'),
    search: document.getElementById('view-search'),
    profile: document.getElementById('view-profile'),
    ai: document.getElementById('view-ai'),
  };
  Object.entries(panels).forEach(([name, el]) => {
    if (!el) return;
    el.hidden = name !== panelView;
  });

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
    if (btn.dataset.view === view) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });
  movePageTabIndicator();
  requestAnimationFrame(() => syncAllSegmented(true));
  const nowPanel = visiblePanel();
  if (nowPanel && nowPanel !== prevPanel && !suppressPageEnter) playPageEnter(nowPanel);
  setFabMenu(false);

  if (view === 'stats') {
    statsMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    statsSelectedKey = dateKey(currentDate);
    refreshStatsView();
  }

  if (view === 'search') {
    renderSearchHub();
    setSearchHubMode('search');
    setSearchHubView('search');
  }

  if (view === 'shopping' || view === 'fridge') {
    renderSearchHub();
    setSearchHubMode('fridge');
    setSearchHubView('shopping');
  }

  if (view === 'foodex') {
    setSearchHubMode('foodex');
    setFoodexPageTab('index');
  }

  if (view !== 'search' && view !== 'shopping' && view !== 'fridge' && view !== 'foodex') {
    const hub = document.getElementById('view-search');
    if (hub && hub.dataset.hubMode === 'foodex') {
      const library = document.getElementById('foodex-library');
      library?.classList.remove('open', 'is-page');
      if (library) library.hidden = true;
      document.body.classList.remove('foodex-tab-mode', 'foodex-library-open');
    }
  }

  if (view === 'profile') {
    fillProfileForm();
  }
}

/** 목표 대비: under(여유) / ok(적정) / over(초과) / null(기록 없음) */
function dayCalLevel(dayData) {
  if (!hasDayLog(dayData)) return null;
  const cal = dayTotalsFromData(dayData).cal;
  const target = PROFILE.targetCal || 1;
  const ratio = cal / target;
  if (ratio <= 0.9) return 'under';
  if (ratio <= 1.05) return 'ok';
  return 'over';
}

const LEVEL_LABELS = {
  ko: { under: '여유', ok: '적정', over: '초과' },
  en: { under: 'Under', ok: 'On target', over: 'Over' },
};

function levelLabel(level) {
  return LEVEL_LABELS[ACTIVE_LOCALE]?.[level] || LEVEL_LABELS.ko[level] || '';
}

async function refreshStatsView() {
  statsCache = await loadStorage();
  renderStatsCalendar();
  renderStatsSelectedDay();
  renderStatsWeekChart();
  renderStatsMonthSummary();
}

function changeStatsMonth(delta) {
  const currentSelected = parseDateKey(statsSelectedKey);
  statsMonth = new Date(statsMonth.getFullYear(), statsMonth.getMonth() + delta, 1);
  const maxDay = new Date(statsMonth.getFullYear(), statsMonth.getMonth() + 1, 0).getDate();
  statsSelectedKey = dateKey(new Date(statsMonth.getFullYear(), statsMonth.getMonth(), Math.min(currentSelected.getDate(), maxDay)));
  renderStatsCalendar();
  renderStatsSelectedDay();
  renderStatsWeekChart();
  renderStatsMonthSummary();
}

function renderStatsCalendar() {
  const grid = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;

  const year = statsMonth.getFullYear();
  const month = statsMonth.getMonth();
  label.textContent = ACTIVE_LOCALE === 'en'
    ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(statsMonth)
    : `${year}년 ${month + 1}월`;
  const monthPicker = document.getElementById('cal-month-picker');
  if (monthPicker) monthPicker.value = `${year}-${String(month + 1).padStart(2, '0')}`;

  const first = new Date(year, month, 1);
  const startPad = first.getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const todayKey = dateKey(new Date());
  const cells = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevDays - i;
    const dt = new Date(year, month - 1, d);
    cells.push({ date: dt, key: dateKey(dt), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ date: dt, key: dateKey(dt), outside: false });
  }
  while (cells.length < 42) {
    const d = cells.length - (startPad + daysInMonth) + 1;
    const dt = new Date(year, month + 1, d);
    cells.push({ date: dt, key: dateKey(dt), outside: true });
  }

  const selectedIndex = cells.findIndex(cell => cell.key === statsSelectedKey);
  const selectedWeekStart = selectedIndex >= 0 ? Math.floor(selectedIndex / 7) * 7 : 14;
  const compactStart = Math.max(0, Math.min(28, selectedWeekStart - 7)); // 접으면 지난주 + 이번 주(고른 날의 주)
  const visibleCells = statsCalendarExpanded ? cells : cells.slice(compactStart, compactStart + 14);
  const expandToggle = document.getElementById('cal-expand-toggle');
  const legend = document.getElementById('cal-legend');
  if (legend) legend.hidden = !statsCalendarExpanded;
  if (expandToggle) {
    expandToggle.textContent = statsCalendarExpanded
      ? (ACTIVE_LOCALE === 'en' ? 'Collapse' : '접어두기')
      : (ACTIVE_LOCALE === 'en' ? 'View all' : '전체보기');
    expandToggle.setAttribute('aria-expanded', String(statsCalendarExpanded));
  }

  grid.innerHTML = '';
  visibleCells.forEach(cell => {
    const dayData = statsCache[cell.key];
    const level = dayCalLevel(dayData);
    const calories = hasDayLog(dayData) ? Math.round(dayTotalsFromData(dayData).cal) : null;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-day';
    btn.dataset.key = cell.key;
    if (cell.outside) btn.classList.add('is-outside');
    if (cell.key === todayKey) btn.classList.add('is-today');
    if (cell.key === statsSelectedKey) btn.classList.add('is-selected');
    if (level) {
      btn.classList.add('has-log', `level-${level}`);
      btn.title = `${levelLabel(level)} · ${calories}kcal`;
    }

    btn.innerHTML = `
      <span class="cal-day-num">${cell.date.getDate()}</span>
      <span class="cal-day-kcal">${calories === null ? '' : calories}</span>
      ${cell.key === todayKey ? '<span class="cal-day-dot" aria-hidden="true"></span>' : ''}
    `;
    btn.addEventListener('click', () => {
      statsSelectedKey = cell.key;
      if (cell.outside) {
        statsMonth = new Date(cell.date.getFullYear(), cell.date.getMonth(), 1);
        renderStatsCalendar();
        renderStatsMonthSummary();
      } else {
        grid.querySelectorAll('.cal-day').forEach(el => {
          el.classList.toggle('is-selected', el.dataset.key === statsSelectedKey);
        });
      }
      renderStatsSelectedDay();
      renderStatsWeekChart();
    });
    grid.appendChild(btn);
  });
}

function renderStatsSelectedDay() {
  const dayData = statsCache[statsSelectedKey];
  const totals = dayTotalsFromData(dayData);
  const has = hasDayLog(dayData);
  const level = dayCalLevel(dayData);
  const d = parseDateKey(statsSelectedKey);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isFuture = d > todayStart;
  const openDayButton = document.getElementById('stats-open-day');
  if (openDayButton) openDayButton.textContent = isFuture
    ? (ACTIVE_LOCALE === 'en' ? 'Plan this day' : '이 날짜 식단 계획하기')
    : (ACTIVE_LOCALE === 'en' ? 'View log' : '기록 보기');

  const dateEl = document.getElementById('stats-day-date');
  const emptyEl = document.getElementById('stats-day-empty');
  const metrics = document.getElementById('stats-day-metrics');
  const badge = document.getElementById('stats-day-badge');
  const mealLinks = document.getElementById('stats-day-meals');
  if (dateEl) dateEl.textContent = formatDate(d);

  if (emptyEl) emptyEl.hidden = has;
  if (metrics) metrics.hidden = !has;

  if (badge) {
    if (level) {
      badge.hidden = false;
      badge.textContent = levelLabel(level);
      badge.className = `stats-day-badge level-${level}`;
    } else {
      badge.hidden = true;
      badge.textContent = '';
      badge.className = 'stats-day-badge';
    }
  }

  const calEl = document.getElementById('stats-day-cal');
  const carbsEl = document.getElementById('stats-day-carbs');
  const proteinEl = document.getElementById('stats-day-protein');
  const fatEl = document.getElementById('stats-day-fat');

  if (has) {
    if (calEl) calEl.textContent = `${Math.round(totals.cal).toLocaleString()} / ${PROFILE.targetCal.toLocaleString()}`;
    if (carbsEl) carbsEl.textContent = `${Math.round(totals.carbs * 10) / 10}g`;
    if (proteinEl) proteinEl.textContent = `${Math.round(totals.protein * 10) / 10}g`;
    if (fatEl) fatEl.textContent = `${Math.round(totals.fat * 10) / 10}g`;
  } else {
    if (calEl) calEl.textContent = '—';
    if (carbsEl) carbsEl.textContent = '—';
    if (proteinEl) proteinEl.textContent = '—';
    if (fatEl) fatEl.textContent = '—';
  }

  if (mealLinks) {
    mealLinks.innerHTML = '';
    mealLinks.hidden = !has;
    const appendMealLink = (mealId, foods, slot = null) => {
      if (!foods?.length) return;
      const calories = Math.round(foods.reduce((sum, food) => sum + (food.cal || 0), 0));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stats-day-meal-link';
      button.innerHTML = `<span>${escapeHtml(mealLabel(mealId))}</span><strong>${calories}kcal</strong><small>${foods.length}${ACTIVE_LOCALE === 'en' ? ' foods' : '개'}</small><i aria-hidden="true">›</i>`;
      button.addEventListener('click', () => openStatsMealDetail(mealId, slot));
      mealLinks.appendChild(button);
    };
    MEAL_IDS.forEach(mealId => appendMealLink(mealId, dayData?.[mealId] || []));
    const snacks = dayData?.snack || [];
    [...new Set(snacks.map(food => food.slot ?? 3))].forEach(slot => {
      appendMealLink('snack', snacks.filter(food => (food.slot ?? 3) === slot), slot);
    });
  }
}

/** 선택일 포함 최근 7일 선형·면적 그래프 */
function renderStatsWeekChart() {
  const chart = document.getElementById('week-chart');
  if (!chart) return;

  const end = parseDateKey(statsSelectedKey);
  const days = [];
  const previousDays = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(end);
    dt.setDate(end.getDate() - i);
    const key = dateKey(dt);
    const data = statsCache[key];
    const totals = dayTotalsFromData(data);
    const has = hasDayLog(data);
    days.push({
      key,
      date: dt,
      cal: has ? totals.cal : 0,
      has,
      level: dayCalLevel(data),
      isSelected: key === statsSelectedKey,
    });
    const previousDate = new Date(dt);
    previousDate.setDate(dt.getDate() - 7);
    const previousData = statsCache[dateKey(previousDate)];
    const previousTotals = dayTotalsFromData(previousData);
    const previousHas = hasDayLog(previousData);
    previousDays.push({
      cal: previousHas ? previousTotals.cal : 0,
      has: previousHas,
    });
  }

  const target = PROFILE.targetCal || 1;
  const maxCal = Math.max(
    target,
    ...days.filter(day => day.has).map(day => day.cal),
    ...previousDays.filter(day => day.has).map(day => day.cal),
    1,
  ) * 1.08;
  const viewWidth = 700;
  const plotTop = 8;
  const plotBottom = 106;
  const plotHeight = plotBottom - plotTop;
  const xAt = index => 22 + index * ((viewWidth - 44) / 6);
  const yAt = calories => plotBottom - Math.min(calories / maxCal, 1) * plotHeight;
  const recordedSegments = items => {
    const segments = [];
    let segment = [];
    items.forEach((item, index) => {
      if (item.has) {
        segment.push({ item, index });
      } else if (segment.length) {
        segments.push(segment);
        segment = [];
      }
    });
    if (segment.length) segments.push(segment);
    return segments;
  };
  const pointString = segment => segment
    .map(({ item, index }) => `${xAt(index).toFixed(1)},${yAt(item.cal).toFixed(1)}`)
    .join(' ');
  const currentSegments = recordedSegments(days);
  const compareSegments = recordedSegments(previousDays);
  const areaMarkup = currentSegments
    .filter(segment => segment.length > 1)
    .map(segment => `<polygon class="week-line-area" points="${xAt(segment[0].index)},${plotBottom} ${pointString(segment)} ${xAt(segment.at(-1).index)},${plotBottom}" />`)
    .join('');
  const currentLineMarkup = currentSegments
    .filter(segment => segment.length > 1)
    .map(segment => `<polyline class="week-line-path" points="${pointString(segment)}" />`)
    .join('');
  const compareLineMarkup = compareSegments
    .filter(segment => segment.length > 1)
    .map(segment => `<polyline class="week-line-compare" points="${pointString(segment)}" />`)
    .join('');
  const targetY = yAt(target).toFixed(1);
  const dots = days.map((day, index) => {
    if (!day.has) return '';
    const left = (xAt(index) / viewWidth) * 100;
    const top = (yAt(day.cal) / 116) * 100;
    return `<i class="week-line-dot${day.isSelected ? ' is-selected' : ''}" style="left:${left.toFixed(3)}%;top:${top.toFixed(3)}%"></i>`;
  }).join('');

  chart.innerHTML = `
    <div class="week-line-plot" aria-hidden="true">
      <svg viewBox="0 0 ${viewWidth} 116" preserveAspectRatio="none">
        <line class="week-line-target" x1="0" y1="${targetY}" x2="${viewWidth}" y2="${targetY}" />
        ${compareLineMarkup}
        ${areaMarkup}
        ${currentLineMarkup}
      </svg>
      <div class="week-line-dots">${dots}</div>
    </div>
    <div class="week-line-labels"></div>
  `;

  const labels = chart.querySelector('.week-line-labels');
  days.forEach(day => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `week-line-day${day.isSelected ? ' is-selected' : ''}`;
    const weekday = ACTIVE_LOCALE === 'en'
      ? new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day.date).slice(0, 1)
      : DAYS[day.date.getDay()];
    button.innerHTML = `<span>${weekday}</span><strong>${day.has ? Math.round(day.cal) : '—'}</strong>`;
    button.title = day.has
      ? `${formatDate(day.date)} · ${Math.round(day.cal)}kcal`
      : `${formatDate(day.date)} · ${ACTIVE_LOCALE === 'en' ? 'No meal log' : '식단 기록 없음'}`;
    button.addEventListener('click', () => {
      statsSelectedKey = day.key;
      statsMonth = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
      renderStatsCalendar();
      renderStatsSelectedDay();
      renderStatsWeekChart();
      renderStatsMonthSummary();
    });
    labels.appendChild(button);
  });
}

function renderStatsMonthSummary() {
  const year = statsMonth.getFullYear();
  const month = statsMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let loggedDays = 0;
  let calSum = 0;
  let underTarget = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(new Date(year, month, d));
    const data = statsCache[key];
    if (!hasDayLog(data)) continue;
    loggedDays += 1;
    const t = dayTotalsFromData(data);
    calSum += t.cal;
    if (t.cal <= PROFILE.targetCal) underTarget += 1;
  }

  const daysEl = document.getElementById('stats-month-days');
  const avgEl = document.getElementById('stats-month-avg');
  const hitEl = document.getElementById('stats-month-hit');
  if (daysEl) daysEl.textContent = String(loggedDays);
  if (avgEl) avgEl.textContent = loggedDays ? String(Math.round(calSum / loggedDays)) : '0';
  if (hitEl) hitEl.textContent = String(underTarget);
}

async function openStatsDayOnHome() {
  currentDate = parseDateKey(statsSelectedKey);
  await loadCurrentDay();
  updateDateDisplay();
  renderAll(true);
  setActiveView('home');
}

async function openStatsMealDetail(mealId, slot = null) {
  currentDate = parseDateKey(statsSelectedKey);
  await loadCurrentDay();
  updateDateDisplay();
  renderAll(true);
  setActiveView('home');
  openMealPage(mealId, slot);
}

document.getElementById('cal-prev-month')?.addEventListener('click', () => changeStatsMonth(-1));
document.getElementById('cal-next-month')?.addEventListener('click', () => changeStatsMonth(1));
function handleStatsMonthPicker(event) {
  const [year, month] = event.currentTarget.value.split('-').map(Number);
  if (!year || !month) return;
  const currentSelected = parseDateKey(statsSelectedKey);
  statsMonth = new Date(year, month - 1, 1);
  const maxDay = new Date(year, month, 0).getDate();
  statsSelectedKey = dateKey(new Date(year, month - 1, Math.min(currentSelected.getDate(), maxDay)));
  renderStatsCalendar();
  renderStatsSelectedDay();
  renderStatsWeekChart();
  renderStatsMonthSummary();
}
const statsMonthPicker = document.getElementById('cal-month-picker');
statsMonthPicker?.addEventListener('input', handleStatsMonthPicker);
statsMonthPicker?.addEventListener('change', handleStatsMonthPicker);
document.querySelector('.cal-month-picker-wrap')?.addEventListener('click', event => {
  if (event.target === statsMonthPicker || !statsMonthPicker) return;
  event.preventDefault();
  try {
    if (typeof statsMonthPicker.showPicker === 'function') {
      statsMonthPicker.showPicker();
    } else {
      statsMonthPicker.focus();
      statsMonthPicker.click();
    }
  } catch (_) {
    statsMonthPicker.focus();
    statsMonthPicker.click();
  }
});
document.getElementById('cal-expand-toggle')?.addEventListener('click', () => {
  statsCalendarExpanded = !statsCalendarExpanded;
  renderStatsCalendar();
});
document.getElementById('stats-open-day')?.addEventListener('click', openStatsDayOnHome);
document.querySelectorAll('.search-hub-tab').forEach(button => {
  button.addEventListener('click', () => setSearchHubView(button.dataset.searchView));
});
document.getElementById('search-hub-tab-index')?.addEventListener('click', openFoodexLibrary);
document.getElementById('foodex-library-close')?.addEventListener('click', closeFoodexLibrary);
document.querySelectorAll('[data-index-layout]').forEach(button => {
  button.addEventListener('click', () => {
    searchIndexLayout = button.dataset.indexLayout === 'list' ? 'list' : 'cards';
    if (searchIndexLayout === 'list') searchIndexCategory = null;
    renderSearchHub();
  });
});
document.getElementById('search-index-sort')?.addEventListener('change', event => {
  searchIndexSort = ['frequent', 'latest'].includes(event.currentTarget.value) ? event.currentTarget.value : 'alpha';
  renderSearchHub();
});
document.getElementById('search-hub-input')?.addEventListener('input', () => {
  activePurposeKey = null;
  document.querySelectorAll('[data-purpose-key]').forEach(button => button.classList.remove('active'));
  renderSearchHub();
});
document.querySelectorAll('.foodex-page-tab').forEach(button => {
  button.addEventListener('click', () => {
    setFoodexPageTab(button.dataset.foodexTab || 'index');
  });
});

document.getElementById('foodex-search-toggle')?.addEventListener('click', () => {
  const bar = document.getElementById('foodex-search-bar');
  const toggle = document.getElementById('foodex-search-toggle');
  const input = document.getElementById('foodex-search-input');
  if (!bar || !toggle) return;
  const open = bar.hasAttribute('hidden');
  bar.toggleAttribute('hidden', !open);
  toggle.setAttribute('aria-expanded', String(open));
  if (open) {
    input?.focus();
  } else if (input) {
    input.value = '';
    renderSearchHub();
  }
});
document.getElementById('foodex-search-input')?.addEventListener('input', onFoodexSearchInput);
document.querySelectorAll('[data-search-term]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById('search-hub-input');
    if (!input) return;
    input.value = button.dataset.searchTerm || '';
    renderSearchHub();
    input.focus();
  });
});
document.querySelectorAll('[data-purpose-key]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById('search-hub-input');
    if (!input) return;
    setSearchHubView('search');
    input.value = '';
    activePurposeKey = button.dataset.purposeKey || null;
    document.querySelectorAll('[data-purpose-key]').forEach(item => item.classList.toggle('active', item === button));
    renderSearchHub();
  });
});

function renderCollectionProducts() {
  const list = document.getElementById('collection-products-list');
  if (!list) return;
  const entries = Object.entries(CUSTOM_FOODS);
  if (!entries.length) {
    list.innerHTML = `<div class="collection-products-empty"><strong>${ACTIVE_LOCALE === 'en' ? 'No saved products yet' : '저장한 제품이 아직 없어요'}</strong><p>${ACTIVE_LOCALE === 'en' ? 'Foods registered by you or confirmed by AI are kept here and reused.' : '직접 등록하거나 AI로 확인한 제품은 여기에 보관되어 다음 기록에서 다시 사용됩니다.'}</p></div>`;
    return;
  }
  list.innerHTML = '';
  entries.forEach(([name, data]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-product-item';
    button.innerHTML = `<span><strong>${escapeHtml(displayFoodName({ name, ...data }))}</strong><small>${escapeHtml(displayServing({ name, ...data }, data.serving || '100g'))}</small></span><b>${isBlankNutrient(data.cal) ? (ACTIVE_LOCALE === 'en' ? 'Not entered' : '미입력') : `${Math.round(data.cal || 0)}kcal`}</b>`;
    button.addEventListener('click', () => openFoodDex({ name, ...data }, { mode: 'index' }));
    list.appendChild(button);
  });
}

function updateCollectionCreateLabel(view = 'recipes') {
  const button = document.getElementById('collection-create');
  if (!button) return;
  const labels = ACTIVE_LOCALE === 'en'
    ? { recipes: 'Create recipe', products: 'Add my product', fridge: 'Add fridge item' }
    : { recipes: '새 레시피 만들기', products: '내 제품 추가', fridge: '냉장고 식품 추가' };
  button.setAttribute('aria-label', labels[view] || labels.recipes);
  button.title = labels[view] || labels.recipes;
}

function placeCollectionCreateButton(view = 'recipes') {
  const button = document.getElementById('collection-create');
  const panel = document.querySelector(`[data-collection-panel="${view}"]`);
  if (button && panel && panel.lastElementChild !== button) panel.appendChild(button);
}

document.querySelectorAll('[data-collection-view]').forEach(button => {
  button.addEventListener('click', () => {
    const view = button.dataset.collectionView;
    document.querySelectorAll('[data-collection-view]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-collection-panel]').forEach(panel => {
      const active = panel.dataset.collectionPanel === view;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (view === 'products') renderCollectionProducts();
    updateCollectionCreateLabel(view);
    placeCollectionCreateButton(view);
  });
});

const DEMO_COLLECTION_FOOD = Object.freeze({
  name: '홈메이드 샐러드', nameEn: 'Homemade Salad', serving: '1접시', cal: 129,
  carbs: 12.1, protein: 8.4, fat: 5.8,
  description: '로메인, 방울토마토, 블루베리, 삶은 달걀으로 만든 홈메이드 샐러드입니다.',
  descriptionEn: 'A homemade salad with romaine, cherry tomatoes, blueberries, and boiled egg.',
});

function collectionIngredientParts(card) {
  const text = card.querySelector('.collection-card-copy p')?.textContent.trim() || '';
  if (!text || /편집을 눌러|Tap Edit|재료를 검색|Search ingredients/.test(text)) return [];
  return text.split(/\s*·\s*/).map(part => part.trim()).filter(Boolean).map((part, index) => {
    const found = getFoodEntries().find(([name, data]) => {
      const labels = [name, FOOD_NAME_EN[name], displayFoodName({ name, ...data }), ...(FOOD_NAME_ALIASES[name] || [])].filter(Boolean);
      return labels.some(label => part.toLowerCase().includes(label.toLowerCase()));
    });
    return { part, index, name: found?.[0] || '' };
  });
}

function collectionResultFoodName(card) {
  const title = card.querySelector('.collection-card-copy h3')?.textContent.trim() || '';
  const match = getFoodEntries()
    .map(([name]) => name)
    .sort((a, b) => b.length - a.length)
    .find(name => {
      const englishName = FOOD_NAME_EN[name];
      return title.includes(name) || Boolean(englishName && title.toLowerCase().includes(englishName.toLowerCase()));
    });
  return match || (title.includes('샐러드') || /salad/i.test(title) ? '샐러드' : '');
}

function setCollectionEvolutionExpanded(card, expanded) {
  const evolution = card.querySelector('.collection-evolution');
  const toggle = card.querySelector('.collection-evolution-toggle');
  if (evolution) evolution.hidden = !expanded;
  card.classList.toggle('is-evolution-expanded', expanded);
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? t('collectionCollapse') : t('collectionExpand'));
    toggle.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.75L8 9.75L11.5 6.75" /></svg>';
  }
}

function ensureCollectionCardControls(card) {
  let removeButton = card.querySelector('.collection-card-remove');
  if (!removeButton) {
    removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'collection-card-remove';
    removeButton.textContent = t('collectionDelete');
    removeButton.setAttribute('aria-label', t('collectionDeleteTitle'));
    removeButton.addEventListener('click', () => {
      const title = card.querySelector('.collection-card-copy h3')?.textContent.trim() || (ACTIVE_LOCALE === 'en' ? 'this collection' : '이 컬렉션');
      const message = ACTIVE_LOCALE === 'en'
        ? `Delete ${title}? This cannot be undone.`
        : `${title}을(를) 삭제할까요? 삭제 후에는 되돌릴 수 없어요.`;
      if (!confirm(message)) return;
      card.remove();
      showToast(ACTIVE_LOCALE === 'en' ? 'Collection deleted.' : '컬렉션을 삭제했어요.', 'info');
    });
    card.appendChild(removeButton);
  }
  removeButton.textContent = t('collectionDelete');
  removeButton.setAttribute('aria-label', t('collectionDeleteTitle'));

  let toggle = card.querySelector('.collection-evolution-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'collection-evolution-toggle';
    toggle.addEventListener('click', () => {
      setCollectionEvolutionExpanded(card, toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (card.lastElementChild !== removeButton) card.appendChild(removeButton);
  if (card.lastElementChild !== toggle) card.appendChild(toggle);
  if (!toggle.hasAttribute('aria-expanded')) setCollectionEvolutionExpanded(card, false);
  else setCollectionEvolutionExpanded(card, toggle.getAttribute('aria-expanded') === 'true');
}

function renderCollectionEvolution(card, editing = card.querySelector('.collection-card-copy h3')?.contentEditable === 'true') {
  const ingredients = collectionIngredientParts(card);
  let evolution = card.querySelector('.collection-evolution');
  if (!evolution) {
    evolution = document.createElement('section');
    evolution.className = 'collection-evolution';
    card.querySelector('.collection-nutrition')?.before(evolution);
  }
  const resultName = collectionResultFoodName(card);
  const title = card.querySelector('.collection-card-copy h3')?.textContent.trim() || (ACTIVE_LOCALE === 'en' ? 'New recipe' : '새 레시피');
  evolution.classList.toggle('is-editing', editing);
  evolution.innerHTML = `
    <div class="collection-evolution-stage collection-evolution-ingredients">
      <span class="collection-evolution-label">${ACTIVE_LOCALE === 'en' ? 'INGREDIENTS' : '재료'}</span>
      <div class="collection-ingredient-list">
        ${ingredients.length ? ingredients.map(item => {
    const category = item.name ? foodCategoryMeta(item.name).key : 'other';
    return `<div class="collection-ingredient-tile" data-ingredient-index="${item.index}">
            <span class="collection-ingredient-image">${foodIndexIcon(item.name, category)}</span>
            <span class="collection-ingredient-name">${escapeHtml(item.part)}</span>
            ${editing ? `<button type="button" class="collection-ingredient-remove" aria-label="${escapeHtml(item.part)} ${ACTIVE_LOCALE === 'en' ? 'remove' : '삭제'}">×</button>` : ''}
          </div>`;
  }).join('') : `<p class="collection-ingredient-empty">${ACTIVE_LOCALE === 'en' ? 'Add ingredients to build this recipe.' : '재료를 추가해 레시피를 만들어보세요.'}</p>`}
      </div>
    </div>
    <span class="collection-evolution-arrow" aria-hidden="true">→</span>
    <div class="collection-evolution-stage collection-evolution-result">
      <span class="collection-evolution-label">${ACTIVE_LOCALE === 'en' ? 'READY' : '완성'}</span>
      <div class="collection-result-card">
        <span class="collection-result-image">${foodIndexIcon(resultName, resultName ? foodCategoryMeta(resultName).key : 'other')}</span>
        <strong>${escapeHtml(title)}</strong>
      </div>
    </div>`;
  evolution.querySelectorAll('.collection-ingredient-remove').forEach(button => {
    button.addEventListener('click', () => {
      const removeIndex = Number(button.closest('[data-ingredient-index]')?.dataset.ingredientIndex);
      const remaining = collectionIngredientParts(card).filter(item => item.index !== removeIndex).map(item => item.part);
      const ingredientsText = card.querySelector('.collection-card-copy p');
      if (ingredientsText) ingredientsText.textContent = remaining.join(' · ');
      renderCollectionEvolution(card, true);
    });
  });
}

document.getElementById('collection-add-demo')?.addEventListener('click', event => {
  runButtonAction(event.currentTarget, async () => {
    const suggestedMeal = getSuggestedMealForNow();
    const mealId = suggestedMeal === 'snack' ? 'lunch' : suggestedMeal;
    await addFood(mealId, DEMO_COLLECTION_FOOD);
    showToast(ACTIVE_LOCALE === 'en'
      ? `Homemade Salad was added to ${mealLabel(mealId)}.`
      : `홈메이드 샐러드를 ${mealLabel(mealId)}에 기록했어요.`, 'success');
  });
});

function setCollectionEditing(card, editing) {
  const title = card.querySelector('.collection-card-copy h3');
  const ingredients = card.querySelector('.collection-card-copy p');
  const editButton = card.querySelector('.collection-edit');
  [title, ingredients].forEach(element => {
    if (!element) return;
    element.contentEditable = editing ? 'true' : 'false';
    element.classList.toggle('is-editing', editing);
  });
  if (editButton) editButton.textContent = editing
    ? (ACTIVE_LOCALE === 'en' ? 'Save' : '저장')
    : (ACTIVE_LOCALE === 'en' ? 'Edit' : '편집');
  let picker = card.querySelector('.collection-ingredient-picker');
  if (editing && !picker) {
    picker = document.createElement('div');
    picker.className = 'collection-ingredient-picker';
    const listId = `collection-foods-${Date.now()}`;
    picker.innerHTML = `<input class="settings-input" list="${listId}" placeholder="${ACTIVE_LOCALE === 'en' ? 'Search an ingredient' : '재료 검색'}" /><datalist id="${listId}">${getFoodEntries().map(([name, data]) => `<option value="${escapeHtml(displayFoodName({ name, ...data }))}">${escapeHtml(data.serving || '100g')}</option>`).join('')}</datalist><button type="button">${ACTIVE_LOCALE === 'en' ? 'Add' : '추가'}</button>`;
    picker.querySelector('button').addEventListener('click', () => {
      const input = picker.querySelector('input');
      const query = input.value.trim();
      if (!query) return;
      const found = getFoodEntries().find(([name, data]) => [name, displayFoodName({ name, ...data })].some(value => value.toLowerCase() === query.toLowerCase()));
      const text = found ? `${displayFoodName({ name: found[0], ...found[1] })} ${found[1].serving || '100g'}` : query;
      const current = ingredients.textContent.trim();
      ingredients.textContent = current && !/편집을 눌러|Tap Edit/.test(current) ? `${current} · ${text}` : text;
      input.value = '';
      renderCollectionEvolution(card, true);
    });
    card.querySelector('.collection-card-actions')?.before(picker);
  }
  if (!editing) picker?.remove();
  renderCollectionEvolution(card, editing);
  if (editing) setCollectionEvolutionExpanded(card, true);
  if (editing) title?.focus();
}

function bindCollectionCard(card) {
  renderCollectionEvolution(card);
  ensureCollectionCardControls(card);
  card.querySelector('.collection-edit')?.addEventListener('click', () => {
    const editing = card.querySelector('.collection-card-copy h3')?.contentEditable !== 'true';
    setCollectionEditing(card, editing);
    if (!editing) showToast(ACTIVE_LOCALE === 'en' ? 'Collection updated.' : '컬렉션을 수정했어요.', 'success');
  });
}

document.querySelectorAll('.collection-card').forEach(bindCollectionCard);

function createRecipeCollection() {
  const list = document.getElementById('collection-user-list');
  if (!list) return;
  const card = document.createElement('article');
  card.className = 'collection-card';
  card.innerHTML = `
    <div class="collection-card-mark" aria-hidden="true">${String(list.children.length + 2).padStart(2, '0')}</div>
    <div class="collection-card-copy"><span>CUSTOM</span><h3>${ACTIVE_LOCALE === 'en' ? 'New collection' : '새 컬렉션'}</h3><p>${ACTIVE_LOCALE === 'en' ? 'Search ingredients and set amounts' : '재료를 검색하고 용량을 적어보세요'}</p></div>
    <div class="collection-nutrition"><strong>0kcal</strong><span>${ACTIVE_LOCALE === 'en' ? 'Nutrition can be added later' : '영양정보는 추후 추가'}</span></div>
    <div class="collection-card-actions"><button type="button" class="collection-edit">${ACTIVE_LOCALE === 'en' ? 'Save' : '저장'}</button><button type="button" class="collection-log" disabled>${ACTIVE_LOCALE === 'en' ? 'Log today' : '오늘 식단에 기록'}</button></div>`;
  list.appendChild(card);
  bindCollectionCard(card);
  setCollectionEditing(card, true);
}

function openProductRegistration() {
  productRegistrationMode = true;
  currentMeal = null;
  modalOpenedFromGlobal = false;
  const recordSelector = document.getElementById('modal-record-selector');
  if (recordSelector) recordSelector.hidden = true;
  const snackSelector = document.getElementById('modal-snack-selector');
  if (snackSelector) snackSelector.hidden = true;
  foodSearchInput.value = '';
  resetCustomFoodForm();
  setFoodTab('custom');
  document.getElementById('modal-title').textContent = ACTIVE_LOCALE === 'en' ? 'Add my product' : '내 제품 추가';
  document.getElementById('custom-save').textContent = ACTIVE_LOCALE === 'en' ? 'Save product' : '제품 저장';
  overlay.classList.remove('snack-dialog');
  overlay.classList.add('open');
  setTimeout(() => document.getElementById('custom-name')?.focus(), 100);
}

/* ============================
   장보기 · 창고 (state.shopping 에 저장, 재시작 후에도 유지)
   ============================ */
const SHOPPING_STATUS_COPY = {
  make: { ko: ['재료 있음', '만들기 예정', '완료'], en: ['Ingredients ready', 'Plan to make', 'Done'] },
  compare: { ko: ['비교', '선택함', '구매 예정'], en: ['Compare', 'Selected', 'Plan to buy'] },
  hold: { ko: ['보류', '다시 검토', '구매 예정'], en: ['Hold', 'Review again', 'Plan to buy'] },
};

function shoppingStatuses(item) {
  const en = ACTIVE_LOCALE === 'en';
  if (item.group === 'priority' || !SHOPPING_STATUS_COPY[item.group]) {
    if (item.essential) return [en ? 'Essential' : '필수'];
    return [en ? 'To buy' : '구매 예정'];
  }
  return SHOPPING_STATUS_COPY[item.group][en ? 'en' : 'ko'];
}

function shoppingText(item, key) {
  return ACTIVE_LOCALE === 'en' && item[`${key}En`] ? item[`${key}En`] : (item[key] || '');
}

function shoppingGroupElement(group) {
  return document.querySelector(`.shopping-section [data-shopping-group="${group}"]`)
    || document.querySelector('.shopping-section [data-shopping-group="priority"]');
}

async function loadShopping() {
  SHOPPING = NiliriStorage.normalizeShopping(await storageRepository.getShopping());
  return SHOPPING;
}

/** 장보기 데이터를 바꾸고 화면을 다시 그린 뒤 저장합니다. 저장에 실패하면 이전 상태로 되돌립니다. */
function commitShopping(mutate) {
  const previous = SHOPPING;
  const draft = JSON.parse(JSON.stringify(SHOPPING));
  mutate(draft);
  SHOPPING = NiliriStorage.normalizeShopping(draft);
  renderShopping();
  const snapshot = SHOPPING;
  const save = shoppingSaveChain.then(() => storageRepository.saveShopping(snapshot));
  shoppingSaveChain = save.catch(() => {});
  return save.then(() => true).catch(error => {
    if (SHOPPING === snapshot) {
      SHOPPING = previous;
      renderShopping();
    }
    showStorageFailure(error);
    return false;
  });
}

function buildShoppingArticle(item) {
  const en = ACTIVE_LOCALE === 'en';
  const statuses = shoppingStatuses(item);
  const statusIndex = item.status % statuses.length;
  const name = shoppingText(item, 'name');
  const note = shoppingText(item, 'note') || (en ? 'Added by you' : '직접 추가한 항목');
  const article = document.createElement('article');
  article.dataset.shoppingId = item.id;
  article.classList.toggle('is-complete', item.bought);
  article.classList.toggle('is-progressing', statuses.length > 1 && statusIndex > 0);
  const statusAttr = statuses.length > 1 ? `data-statuses="${escapeHtml(statuses.join('|'))}"` : 'data-next="fridge"';
  article.innerHTML = `<button type="button" class="shopping-check${item.bought ? ' is-complete' : ''}" aria-label="${escapeHtml(name)} ${en ? 'mark as bought' : '구매 완료 표시'}"${item.bought ? ' aria-pressed="true"' : ''}></button><div><strong>${escapeHtml(name)}</strong><p>${escapeHtml(note)}</p></div><button type="button" class="shopping-action" ${statusAttr}>${escapeHtml(statuses[statusIndex])}</button><button type="button" class="shopping-remove" aria-label="${en ? 'Delete item' : '항목 삭제'}">×</button>`;

  article.querySelector('.shopping-check')?.addEventListener('click', () => {
    const bought = !item.bought;
    commitShopping(state => {
      const target = state.items.find(entry => entry.id === item.id);
      if (!target) return;
      target.bought = bought;
      if (bought) target.boughtAt = Date.now();
      else {
        delete target.boughtAt;
        // 예전 동작처럼 장보기로 되돌린 항목은 그룹 맨 아래로
        state.items = [...state.items.filter(entry => entry !== target), target];
      }
    });
    if (bought) showToast(en ? 'Moved to stock.' : '구매 완료 → 창고로 옮겼어요.', 'success');
    else showToast(en ? 'Moved back to the shopping list.' : '장보기 목록으로 되돌렸어요.', 'info');
  });
  if (statuses.length > 1) {
    article.querySelector('.shopping-action')?.addEventListener('click', () => {
      const next = (statusIndex + 1) % statuses.length;
      commitShopping(state => {
        const target = state.items.find(entry => entry.id === item.id);
        if (target) target.status = next;
      });
      showToast(`${name} · ${statuses[next]}`, 'info');
    });
  }
  article.querySelector('.shopping-remove')?.addEventListener('click', () => {
    commitShopping(state => { state.items = state.items.filter(entry => entry.id !== item.id); });
    showToast(en ? `${name} removed.` : `${name} 항목을 삭제했어요.`, 'info');
  });
  return article;
}

function buildStockArticle(item) {
  const en = ACTIVE_LOCALE === 'en';
  const article = document.createElement('article');
  article.className = 'collection-fridge-item';
  article.dataset.stockId = item.id;
  article.innerHTML = `<span class="collection-fridge-marker" aria-hidden="true">✓</span><div><strong>${escapeHtml(item.name)}</strong><p>${en ? 'Added directly' : '직접 추가'} · ${escapeHtml(item.amount || (en ? 'Amount not set' : '수량 미입력'))}</p></div><span class="collection-fridge-status">${en ? 'In stock' : '보유 중'}</span><button type="button" class="collection-fridge-remove" aria-label="${en ? 'Delete' : '삭제'}">×</button>`;
  article.querySelector('.collection-fridge-remove')?.addEventListener('click', () => {
    commitShopping(state => { state.stock = state.stock.filter(entry => entry.id !== item.id); });
  });
  return article;
}

/** state.shopping 으로 장보기 그룹과 창고 목록을 다시 그립니다. 작성 중인 입력칸은 그대로 둡니다. */
function renderShopping() {
  NiliriStorage.SHOPPING_GROUPS.forEach(group => {
    document.querySelector(`.shopping-section [data-shopping-group="${group}"]`)
      ?.querySelectorAll(':scope > article:not(.shopping-item-editor)').forEach(article => article.remove());
  });
  const fridge = document.getElementById('shopping-fridge-list');
  fridge?.querySelectorAll(':scope > article:not(.is-editing)').forEach(article => article.remove());
  SHOPPING.items.filter(item => !item.bought).forEach(item => {
    const group = shoppingGroupElement(item.group);
    if (!group) return;
    group.insertBefore(buildShoppingArticle(item), group.querySelector(':scope > .shopping-item-editor'));
  });
  if (fridge) {
    SHOPPING.stock.forEach(item => fridge.appendChild(buildStockArticle(item)));
    SHOPPING.items.filter(item => item.bought)
      .sort((a, b) => (a.boughtAt || 0) - (b.boughtAt || 0))
      .forEach(item => fridge.appendChild(buildShoppingArticle(item)));
  }
  updateShoppingFridge();
}

function createFridgeCollectionItem() {
  const list = document.getElementById('shopping-fridge-list');
  if (!list) return;
  // 창고 탭이 안 보이면 연 뒤 추가
  if (document.getElementById('view-search')?.dataset.hubMode === 'fridge') {
    setSearchHubView('stock');
  }
  const existing = list.querySelector(':scope > article.is-editing');
  if (existing) return existing.querySelector('input')?.focus();
  const article = document.createElement('article');
  article.className = 'collection-fridge-item is-editing';
  article.innerHTML = `<div class="collection-fridge-fields"><input type="text" class="settings-input collection-fridge-name" placeholder="${ACTIVE_LOCALE === 'en' ? 'Food in stock' : '보유 식품 이름'}" /><input type="text" class="settings-input collection-fridge-amount" placeholder="${ACTIVE_LOCALE === 'en' ? 'Amount, e.g. 1 box' : '수량 예: 1통'}" /></div><button type="button" class="collection-fridge-save">${ACTIVE_LOCALE === 'en' ? 'Save' : '저장'}</button><button type="button" class="collection-fridge-remove" aria-label="${ACTIVE_LOCALE === 'en' ? 'Delete' : '삭제'}">×</button>`;
  article.querySelector('.collection-fridge-save')?.addEventListener('click', () => {
    const nameInput = article.querySelector('.collection-fridge-name');
    const amount = article.querySelector('.collection-fridge-amount')?.value.trim();
    const name = nameInput?.value.trim();
    if (!name) return nameInput?.focus();
    article.remove();
    commitShopping(state => {
      state.stock.unshift({ id: NiliriStorage.shoppingId('stock'), name, amount: amount || '', createdAt: Date.now() });
    });
    showToast(ACTIVE_LOCALE === 'en' ? 'Added to stock.' : '창고에 추가했어요.', 'success');
  });
  article.querySelector('.collection-fridge-remove')?.addEventListener('click', () => {
    article.remove();
    updateShoppingFridge();
  });
  list.prepend(article);
  updateShoppingFridge();
  article.querySelector('input')?.focus();
}

document.getElementById('collection-create')?.addEventListener('click', () => {
  createRecipeCollection();
});

document.getElementById('stock-add-btn')?.addEventListener('click', () => {
  createFridgeCollectionItem();
});

function createShoppingListItem() {
  const group = document.querySelector('[data-shopping-group="priority"]');
  if (!group) return;
  const existing = group.querySelector('.shopping-item-editor');
  if (existing) return existing.querySelector('input')?.focus();
  group.hidden = false;
  const article = document.createElement('article');
  article.className = 'shopping-item-editor';
  article.innerHTML = `<input type="text" class="settings-input shopping-item-name" placeholder="${ACTIVE_LOCALE === 'en' ? 'Item to buy' : '구매할 항목'}" /><button type="button" class="shopping-item-save">${ACTIVE_LOCALE === 'en' ? 'Add' : '추가'}</button><button type="button" class="shopping-item-cancel" aria-label="${ACTIVE_LOCALE === 'en' ? 'Cancel' : '취소'}">×</button>`;
  const closeEditor = () => {
    article.remove();
    updateShoppingFridge();
  };
  article.querySelector('.shopping-item-cancel')?.addEventListener('click', closeEditor);
  const saveItem = () => {
    const input = article.querySelector('.shopping-item-name');
    const name = input?.value.trim();
    if (!name) return input?.focus();
    article.remove();
    commitShopping(state => {
      state.items.push({ id: NiliriStorage.shoppingId('item'), name, group: 'priority', status: 0, bought: false, createdAt: Date.now() });
    });
    showToast(ACTIVE_LOCALE === 'en' ? 'Added to the shopping list.' : '장보기 목록에 추가했어요.', 'success');
  };
  article.querySelector('.shopping-item-save')?.addEventListener('click', saveItem);
  article.querySelector('.shopping-item-name')?.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Enter') saveItem();
    if (event.key === 'Escape') closeEditor();
  });
  group.appendChild(article);
  updateShoppingFridge();
  article.querySelector('input')?.focus();
}

document.getElementById('shopping-add-btn')?.addEventListener('click', createShoppingListItem);

function updateShoppingFridge() {
  const list = document.getElementById('shopping-fridge-list');
  const count = list?.querySelectorAll('article').length || 0;
  const countEl = document.getElementById('shopping-fridge-count');
  if (countEl) countEl.textContent = String(count);
  list?.querySelector('.shopping-fridge-empty')?.toggleAttribute('hidden', count > 0);
  document.querySelectorAll('.shopping-section > .shopping-group:not(.shopping-fridge)').forEach(group => {
    const remaining = group.querySelectorAll(':scope > article').length;
    const countBadge = group.querySelector(':scope > h3 span');
    if (countBadge) countBadge.textContent = String(remaining);
    group.hidden = remaining === 0;
  });
}

updateShoppingFridge();

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === 'home' || view === 'stats' || view === 'search' || view === 'profile' || view === 'ai' || view === 'shopping' || view === 'fridge' || view === 'foodex') {
      // 위쪽 탭을 누르면 밀 때와 같은 방향으로 넘김
      const from = pageIndexOf(activeView), to = pageIndexOf(view);
      if (btn.classList.contains('page-tab') && from >= 0 && to >= 0 && from !== to && !document.body.classList.contains('meal-page-open')) { slideToPage(view, to > from ? 1 : -1); return; }
      if (foodDex?.classList.contains('open')) closeFoodDex();
      if (view !== 'foodex') closeFoodexLibrary();
      setActiveView(view);
    }
  });
});
document.querySelectorAll('[data-agent-view]').forEach(button => {
  button.addEventListener('click', () => {
    const view = button.dataset.agentView;
    setActiveView(view);
    if (view === 'search') setSearchHubView('search');
  });
});

const TELEGRAM_LINK_KEY = 'niliri.telegramBotUrl';
const TELEGRAM_CONNECTED_KEY = 'niliri.telegramConnected';

function getTelegramBotUrl() {
  try {
    return localStorage.getItem(TELEGRAM_LINK_KEY) || 'https://t.me/';
  } catch (_) {
    return 'https://t.me/';
  }
}

function isTelegramConnected() {
  try {
    return localStorage.getItem(TELEGRAM_CONNECTED_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function setTelegramConnected(connected, botUrl) {
  try {
    if (connected) {
      localStorage.setItem(TELEGRAM_CONNECTED_KEY, '1');
      if (botUrl) localStorage.setItem(TELEGRAM_LINK_KEY, botUrl);
    } else {
      localStorage.removeItem(TELEGRAM_CONNECTED_KEY);
    }
  } catch (_) { /* ignore */ }
  refreshTelegramBannerState();
}

function refreshTelegramBannerState() {
  const openBtn = document.getElementById('telegram-open-btn');
  const url = getTelegramBotUrl();
  const connected = isTelegramConnected() && url && url !== 'https://t.me/' && url !== 'https://t.me';
  if (openBtn) {
    openBtn.setAttribute('href', url);
    openBtn.classList.toggle('is-connected', connected);
    const strong = openBtn.querySelector('strong');
    const small = openBtn.querySelector('small');
    if (connected) {
      if (strong) strong.textContent = ACTIVE_LOCALE === 'en' ? 'Open Telegram' : '텔레그램 열기';
      if (small) small.textContent = ACTIVE_LOCALE === 'en' ? 'Connected' : '연결됨 · 바로 열기';
    } else {
      if (strong) strong.textContent = ACTIVE_LOCALE === 'en' ? 'Logging guide' : '기록 안내';
      if (small) small.textContent = ACTIVE_LOCALE === 'en' ? 'Set up Telegram' : '연결 후 텔레그램 사용';
    }
  }
  const setupButton = document.getElementById('telegram-mark-connected');
  if (setupButton) setupButton.textContent = connected
    ? (ACTIVE_LOCALE === 'en' ? 'Open Telegram' : '텔레그램 열기')
    : (ACTIVE_LOCALE === 'en' ? 'Set up Telegram (demo)' : '텔레그램 연결 설정 (데모)');
}

document.getElementById('telegram-share-btn')?.addEventListener('click', async () => {
  const shareText = ACTIVE_LOCALE === 'en'
    ? 'Ask your connected Telegram agent to log meals into Rebuilders.'
    : '연결한 텔레그램 에이전트에게 말하면 Rebuilders 식단에 기록해 줘요.';
  const shareUrl = getTelegramBotUrl();
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Rebuilders', text: shareText, url: shareUrl === 'https://t.me/' ? undefined : shareUrl });
      return;
    }
  } catch (_) {
    return;
  }
  try {
    await navigator.clipboard?.writeText(shareUrl && shareUrl !== 'https://t.me/' ? `${shareText}\n${shareUrl}` : shareText);
    showToast(ACTIVE_LOCALE === 'en' ? 'Copied.' : '복사했어요.', 'info');
  } catch (_) {
    showToast(ACTIVE_LOCALE === 'en' ? 'Share is not available on this device.' : '이 기기에서는 공유를 쓸 수 없어요.', 'info');
  }
});

document.getElementById('telegram-open-btn')?.addEventListener('click', (event) => {
  const href = getTelegramBotUrl();
  const connected = isTelegramConnected() && href && href !== 'https://t.me/' && href !== 'https://t.me';
  if (!connected) {
    event.preventDefault();
    document.getElementById('agent-help')?.click();
    showToast(ACTIVE_LOCALE === 'en' ? 'Connect Telegram in Help first.' : '먼저 도움말에서 연결 방법을 확인해 주세요.', 'info');
  }
});

document.getElementById('telegram-help-btn')?.addEventListener('click', () => {
  document.getElementById('agent-help')?.click();
});

document.getElementById('telegram-mark-connected')?.addEventListener('click', () => {
  const savedUrl = getTelegramBotUrl();
  const connected = isTelegramConnected() && savedUrl && savedUrl !== 'https://t.me/' && savedUrl !== 'https://t.me';
  if (connected) {
    window.open(savedUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  const url = window.prompt(
    ACTIVE_LOCALE === 'en' ? 'Telegram bot URL (e.g. https://t.me/your_bot)' : '텔레그램 봇 주소 (예: https://t.me/your_bot)',
    getTelegramBotUrl() === 'https://t.me/' ? 'https://t.me/' : getTelegramBotUrl(),
  );
  if (!url) return;
  const trimmed = url.trim();
  if (!/^https:\/\/t\.me\//i.test(trimmed)) {
    showToast(ACTIVE_LOCALE === 'en' ? 'Use a t.me link.' : 't.me 링크를 입력해 주세요.', 'info');
    return;
  }
  setTelegramConnected(true, trimmed);
  showToast(ACTIVE_LOCALE === 'en' ? 'Telegram marked as connected.' : '텔레그램 연결됨으로 저장했어요.', 'success');
  closeAgentHelp();
});

refreshTelegramBannerState();

function setAgentMessageText(message, text) {
  if (!message) return;
  const target = message.querySelector('.agent-bubble-text');
  if (target) target.textContent = text;
  else message.textContent = text;
}

function appendAgentMessage(text, kind = 'agent') {
  const log = document.getElementById('agent-log');
  if (!log) return null;
  const message = document.createElement('div');
  message.className = `agent-message is-${kind}`;
  const now = new Date();
  const stamp = now.toLocaleTimeString(ACTIVE_LOCALE === 'en' ? 'en-US' : 'ko-KR', { hour: 'numeric', minute: '2-digit' });
  message.innerHTML = `<div class="agent-message-body"><div class="agent-bubble"><span class="agent-bubble-text"></span></div><time class="agent-time" datetime="${now.toISOString()}">${stamp}</time></div>`;
  setAgentMessageText(message, text);
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
  if (kind !== 'user' && document.getElementById('ai-dock-panel')?.hidden) showToast(text, 'info');
  refreshAiDockToggle();
  return message;
}

function appendToAgentMessage(message, node) {
  if (!message || !node) return;
  const body = message.querySelector('.agent-message-body') || message;
  body.appendChild(node);
}

function withKoreanObjectParticle(text) {
  const value = String(text || '');
  const lastCode = value.charCodeAt(value.length - 1);
  const hasFinalConsonant = lastCode >= 0xAC00 && lastCode <= 0xD7A3
    ? (lastCode - 0xAC00) % 28 !== 0
    : false;
  return `${value}${hasFinalConsonant ? '을' : '를'}`;
}

function appendFillNutritionButton(message, mealId, idx) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'agent-confirm';
  button.textContent = ACTIVE_LOCALE === 'en' ? 'Fill in nutrition' : '영양정보 채우기';
  button.addEventListener('click', () => {
    if (meals[mealId]?.foods[idx]) openFoodEdit(mealId, idx);
  });
  appendToAgentMessage(message, button);
}

async function handleAgentCommand() {
  const input = document.getElementById('agent-input');
  const text = input?.value.trim();
  if (!text) return;
  appendAgentMessage(text, 'user');
  input.value = '';
  refreshAiDockSend();
  const parsed = parseQuickFoodText(text);
  if (!parsed || !parsed.items.length) {
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? 'Tell me the meal and food, such as “breakfast banana” or “lunch toast, iced americano.”'
      : '“아침 바나나”, “점심 햄치즈 토스트, 아아”처럼 끼니와 음식을 적어주세요.');
    return;
  }

  // 끼니를 적었거나, 먹었다/기록 같은 말이 있거나, 모두 아는 음식이면 바로 기록
  const allKnown = parsed.items.every(item => item.known);
  if (!parsed.mealExplicit && !parsed.recordIntent && !allKnown) {
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? `Add the meal in front to log it, such as “lunch ${parsed.items[0].name}.”`
      : `“점심 ${parsed.items[0].name}”처럼 끼니를 앞에 붙이면 바로 기록돼요.`);
    return;
  }

  const foods = [];
  const discoveries = [];
  for (const item of parsed.items) {
    let food = item.food;
    if (!item.known && LOCAL_MODE) {
      try {
        const result = await storageRepository.resolveFood({ name: item.name }, { register: false });
        food = { ...result.food, ...(item.amount && !result.food.serving ? { serving: item.amount.text } : {}) };
        discoveries.push(food);
      } catch {
        // 자동 조회가 안 되면 이름만 저장
      }
    }
    foods.push(food);
  }

  const mealId = parsed.mealId;
  await goToEntryDate(parsed);
  if (mealId === 'snack') currentSnackSlot = getDefaultSnackSlot();
  try {
    void discoveries;
    const indexes = await addFoods(mealId, foods);
    await registerLoggedFoods(foods);
    const missing = foods.map((food, i) => ({ food, idx: indexes[i] })).filter(({ food }) => isNutritionMissing(food));
    const summary = foods.map(quickItemSummary).join(', ');
    const queued = queueBridgeLookup(mealId, foods);
    const later = queued
      ? (ACTIVE_LOCALE === 'en' ? ' The Mac mini AI is finding nutrition and will fill it in.' : ' 맥 미니 AI가 영양성분을 찾아서 채워줄게요.')
      : (ACTIVE_LOCALE === 'en' ? ' You can fill in nutrition later.' : ' 영양정보는 나중에 채워도 돼요.');
    const message = appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? `Saved to ${mealLabel(mealId)}: ${summary}.${missing.length ? later : ''}`
      : `${entryDateLabel(parsed)}${mealLabel(mealId)}에 저장했어요: ${summary}.${missing.length ? later : ''}`);
    if (missing.length) {
      appendFillNutritionButton(message, mealId, missing[0].idx);
      appendToAgentMessage(message, buildAskAiButton(mealId, missing.map(({ food }) => ({ name: food.name, serving: food.serving || '' })), 'agent-confirm'));
    }
  } catch (error) {
    showStorageFailure(error);
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? 'Could not save. Please try again.'
      : '저장하지 못했어요. 다시 시도해 주세요.');
  }
}

// 보내기 버튼(type=submit)과 return 키는 #ai-dock-form 의 submit 으로 처리(위 refreshAiDockSend 옆)

const agentHelpDialog = document.getElementById('agent-help-dialog');
function closeAgentHelp() {
  agentHelpDialog?.classList.remove('open');
  setTimeout(() => { if (agentHelpDialog) agentHelpDialog.hidden = true; }, 180);
}

document.getElementById('agent-help')?.addEventListener('click', () => {
  if (!agentHelpDialog) return;
  agentHelpDialog.hidden = false;
  requestAnimationFrame(() => agentHelpDialog.classList.add('open'));
});
document.getElementById('agent-help-close')?.addEventListener('click', closeAgentHelp);
agentHelpDialog?.addEventListener('click', event => {
  if (event.target === agentHelpDialog) closeAgentHelp();
});

/* ============================
   홈 하단 AI 입력창: 보내기 버튼·최근 대화·음성·사진
   ============================ */
const agentInputEl = document.getElementById('agent-input');
const agentSendEl = document.getElementById('agent-send');
// 마이크(음성 입력)는 잠시 숨김. 플러그인은 그대로 두고 이 값만 true 로 바꾸면 다시 보임
const VOICE_ENABLED = false;
const agentVoiceButton = VOICE_ENABLED ? document.getElementById('agent-voice') : null;
if (!VOICE_ENABLED) document.getElementById('agent-voice')?.setAttribute('hidden', '');

/* 보내기 버튼은 항상 보이고, 글자가 없을 땐 흐리게(눌러도 아무 일 없음).
   iOS 한글 입력(조합 중)은 input 이벤트가 늦을 수 있어 여러 이벤트에서 확인 */
function refreshAiDockSend() {
  if (!agentSendEl) return;
  const empty = !agentInputEl?.value.trim();
  agentSendEl.hidden = false;
  agentSendEl.classList.toggle('is-empty', empty);
  agentSendEl.setAttribute('aria-disabled', String(empty));
}
['input', 'compositionupdate', 'compositionend', 'keyup', 'change', 'focus', 'blur'].forEach(type => agentInputEl?.addEventListener(type, refreshAiDockSend));
// return 키·보내기 버튼 = form 제출(한글 조합 중 return 도 iOS가 조합을 끝낸 뒤 제출)
// 식도감 아래 검색줄: 왼쪽 돋보기 = 입력칸으로, 오른쪽 검정 버튼·return = 검색하고 키보드 닫기
document.getElementById('foodex-search-lead')?.addEventListener('click', () => document.getElementById('foodex-search-input')?.focus());
document.getElementById('foodex-search-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.getElementById('foodex-search-input');
  input?.dispatchEvent(new Event('input', { bubbles: true }));
  input?.blur();
});
document.getElementById('ai-dock-form')?.addEventListener('submit', event => {
  event.preventDefault();
  handleAgentCommand();
});

function focusAiDock(text = '') {
  if (activeView !== 'home') setActiveView('home');
  if (!agentInputEl) return;
  if (text) agentInputEl.value = text;
  refreshAiDockSend();
  agentInputEl.focus();
}

function setAiDockPanel(open) {
  const panel = document.getElementById('ai-dock-panel');
  const toggle = document.getElementById('ai-dock-toggle');
  const history = document.getElementById('ai-dock-history');
  if (!panel) return;
  let backdrop = document.getElementById('ai-sheet-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'ai-sheet-backdrop';
    backdrop.className = 'ai-sheet-backdrop';
    backdrop.hidden = true;
    panel.parentElement.insertBefore(backdrop, panel);
  }
  clearTimeout(panel._closeTimer);
  panel.style.transform = '';
  panel.style.transition = '';
  if (open) {
    try { dismissAiDockKeyboard(); } catch {}
    panel.hidden = false;
    backdrop.hidden = false;
    void panel.offsetHeight;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    const log = document.getElementById('agent-log');
    if (log) log.scrollTop = log.scrollHeight;
  } else {
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    panel._closeTimer = setTimeout(() => { panel.hidden = true; backdrop.hidden = true; refreshAiDockToggle(); }, reduceMotion() ? 0 : 300);
  }
  toggle?.setAttribute('aria-expanded', String(open));
  history?.setAttribute('aria-expanded', String(open));
  refreshAiDockToggle();
}
function refreshAiDockToggle() {
  const toggle = document.getElementById('ai-dock-toggle');
  const panel = document.getElementById('ai-dock-panel');
  const count = document.querySelectorAll('#agent-log .agent-message').length;
  if (!toggle) return;
  toggle.hidden = !count || !panel?.hidden;
  toggle.textContent = ACTIVE_LOCALE === 'en' ? `Recent messages ${count}` : `최근 대화 ${count}`;
  const history = document.getElementById('ai-dock-history');
  if (history) history.dataset.count = String(count);
}
document.getElementById('ai-dock-toggle')?.addEventListener('click', () => setAiDockPanel(true));
// 최근 대화 패널 바깥을 누르면 닫기
document.addEventListener('pointerdown', event => {
  const panel = document.getElementById('ai-dock-panel');
  if (!panel || panel.hidden) return;
  if (panel.contains(event.target) || document.getElementById('ai-dock-toggle')?.contains(event.target) || document.getElementById('ai-dock-history')?.contains(event.target)) return;
  setAiDockPanel(false);
}, true);

/* 하단 탭바 대신 오른쪽 아래 떠 있는 메뉴 버튼. 누르면 위로 5개 버튼이 펼쳐짐 */
function setFabMenu(open) {
  const menu = document.getElementById('fab-menu');
  const items = document.getElementById('fab-items');
  const toggle = document.getElementById('fab-toggle');
  const backdrop = document.getElementById('fab-backdrop');
  if (!menu || !items || !toggle) return;
  const en = ACTIVE_LOCALE === 'en';
  menu.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? (en ? 'Close menu' : '메뉴 닫기') : (en ? 'Open menu' : '메뉴 열기'));
  items.setAttribute('aria-hidden', String(!open));
  items.inert = !open;
  if (backdrop) backdrop.hidden = !open;
  document.body.classList.toggle('fab-open', open); // 펼친 동안 최근 대화 칩 숨김(겹침 방지)
}
document.getElementById('fab-toggle')?.addEventListener('click', () => {
  const open = !document.getElementById('fab-menu')?.classList.contains('is-open');
  if (open) setAiDockPanel(false);
  setFabMenu(open);
});
document.getElementById('fab-backdrop')?.addEventListener('click', () => setFabMenu(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setFabMenu(false); });

/* 입력창 밖을 누르거나 화면을 밀면 키보드 닫기(누른 것은 그대로 동작: 이벤트를 막지 않음).
   입력창·보내기 버튼(#home-ai-dock 안)은 제외 */
// 아래 입력창(식단 채팅·식도감 검색) 키보드 닫기: 바깥 누르기 + 목록을 아래로 끌기(메시지 앱처럼)
function dismissAiDockKeyboard() {
  const input = document.activeElement;
  if (!input || !['agent-input', 'foodex-search-input'].includes(input.id)) return false;
  input.blur();
  try { globalThis.Capacitor?.isNativePlatform?.() && globalThis.Capacitor.Plugins?.Keyboard?.hide?.()?.catch?.(() => {}); } catch { /* ignore */ }
  return true;
}
function outsideAiDock(target) {
  return !(target && target.closest && target.closest('.home-ai-dock'));
}
let dockDragStartY = null;
document.addEventListener('pointerdown', event => { if (event.pointerType !== 'touch' && outsideAiDock(event.target)) dismissAiDockKeyboard(); }, { capture: true, passive: true });
document.addEventListener('touchstart', event => { dockDragStartY = outsideAiDock(event.target) ? event.touches[0]?.clientY ?? null : null; }, { capture: true, passive: true });
// 아래로 10px 넘게 끌면 키보드를 내림(위로 끌어 결과를 더 보는 것은 그대로)
document.addEventListener('touchmove', event => { if (dockDragStartY == null) return; const y = event.touches[0]?.clientY ?? dockDragStartY; if (y - dockDragStartY > 10 && dismissAiDockKeyboard()) dockDragStartY = null; }, { capture: true, passive: true });
// 바깥을 톡 누르면(끌지 않고) 키보드 내림
document.addEventListener('touchend', event => { if (dockDragStartY == null) return; const y = event.changedTouches[0]?.clientY ?? dockDragStartY; if (Math.abs(y - dockDragStartY) < 8) dismissAiDockKeyboard(); dockDragStartY = null; }, { capture: true, passive: true });
document.addEventListener('wheel', event => { if (outsideAiDock(event.target)) dismissAiDockKeyboard(); }, { capture: true, passive: true });

/* ============================
   위쪽 글자 탭 + 좌우로 밀어 옆 페이지로
   ============================ */
const PAGE_ORDER = ['fridge', 'foodex', 'home', 'stats', 'profile']; // 그로서리 · 식도감 · 식단 · 리포트 · 설정
function pageIndexOf(view) {
  if (view === 'shopping') return 0;
  if (view === 'search') return 2;
  return PAGE_ORDER.indexOf(view);
}
function visiblePanel() {
  return [...document.querySelectorAll('.app-content.view-panel')].find(el => !el.hidden) || null;
}
function slideToPage(view, dir) {
  // 탭 누름도 손가락으로 넘길 때와 같은 이동: 지금 페이지와 고른 페이지가 나란히 250ms 감속(넘침·되돌아옴·등장 효과 없음)
  if (foodDex?.classList.contains('open')) closeFoodDex();
  if (dir && typeof pageSlideTo === 'function' && pageSlideTo(view, dir)) return;
  const before = visiblePanel();
  commitPage(view);
  const panel = visiblePanel();
  if (dir && panel && panel === before && !reduceMotion()) {
    // 같은 판(그로서리↔식도감): 옆에서 짧게 들어옴
    panel.style.transition = 'none';
    panel.style.transform = `translate3d(${dir * (panel.getBoundingClientRect().width || innerWidth) * 0.3}px, 0, 0)`;
    void panel.offsetWidth;
    panel.style.transition = 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)';
    panel.style.transform = 'translate3d(0, 0, 0)';
    setTimeout(() => { panel.style.removeProperty('transform'); panel.style.removeProperty('transition'); }, 280);
  }
}
function pageSwipeBlocked(target, x) {
  if (x < 24 || x > innerWidth - 24) return true; // iOS 가장자리 제스처(뒤로가기·앱 전환)와 겹치지 않게 양쪽 24px 비움
  const panel = target.closest?.('.app-content.view-panel');
  if (!panel || panel.hidden || panel.id === 'view-meal-detail') return true;
  if (document.body.classList.contains('meal-page-open') || document.body.classList.contains('food-dex-open') || document.body.classList.contains('foodex-library-open')) return true;
  if (document.querySelector('.modal-overlay.open, .agent-help-overlay.open')) return true;
  if (!document.getElementById('ai-dock-panel')?.hidden) return true;
  if (target.closest('.swipe-row, .page-tabs, input, textarea, select, [contenteditable="true"], .ai-dock-panel, .home-ai-dock, .no-page-swipe')) return true;
  // 가로로 스크롤되는 영역 안에서 시작하면 그 영역이 우선
  for (let el = target; el && el !== panel; el = el.parentElement) {
    const ox = getComputedStyle(el).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 2) return true;
  }
  return false;
}
let pageSlideTo = null; // 아래 밀기 설정에서 채움(탭 누름 이동)
(function setupPageSwipe() {
  // X(트위터) 위쪽 탭처럼: 지금 페이지와 옆 페이지가 손가락을 1:1로 같이 따라오고, 밑줄도 진행만큼 이동.
  // 놓으면 250ms 감속(넘침·되돌아옴 없음). 너비 35% 넘기거나 빠르게(0.5px/ms) 튕기면 넘어감. 끝 페이지는 12px 까지만.
  const frame = document.querySelector('.phone-frame');
  if (!frame) return;
  const SETTLE_MS = 250;
  const EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
  const EDGE_MAX = 12;
  let sx = 0; let sy = 0; let mode = null; let active = false; let panel = null; let lastDx = 0; let samples = [];
  let W = 0; let idx = -1; let settling = false; let peek = null; // { view, el, dir }
  const edgePull = d => Math.sign(d) * EDGE_MAX * (1 - Math.exp(-Math.abs(d) / 80));
  const panelFor = view => document.getElementById(view === 'fridge' || view === 'foodex' || view === 'shopping' ? 'view-search' : `view-${view}`);
  const bar = () => document.querySelector('#page-tabs .page-tab-indicator');
  const tabFor = view => document.querySelector(`#page-tabs .page-tab[data-view="${view}"]`);
  // 밑줄 위치: 켜진 탭은 [아이콘+글자], 꺼진 탭은 켜졌을 때 모양(아이콘 자리만큼 넓어지고 가운데 유지)으로 예상
  const tabGeom = tab => {
    if (!tab) return null;
    if (tab.classList.contains('active')) return { left: tab.offsetLeft, width: tab.offsetWidth };
    const cur = document.querySelector('#page-tabs .page-tab.active .page-tab-icon');
    const extra = cur && cur.offsetWidth ? cur.offsetWidth + 4 : 19;
    return { left: tab.offsetLeft - extra / 2, width: tab.offsetWidth + extra };
  };
  const setBar = (g, transition) => {
    const b = bar(); if (!b || !g) return;
    b.style.transition = transition;
    b.style.transform = `translateX(${g.left}px) scaleX(${g.width / 100})`;
  };
  const trackBar = (fromView, toView, p) => {
    const a = tabGeom(tabFor(fromView)); const b = tabGeom(tabFor(toView));
    if (!a || !b) return;
    setBar({ left: a.left + (b.left - a.left) * p, width: a.width + (b.width - a.width) * p }, 'none');
  };
  const prepareStats = () => { try { statsMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); statsSelectedKey = dateKey(currentDate); refreshStatsView(); } catch { /* 넘어간 뒤 다시 그림 */ } };
  const prepareSearch = view => {
    try {
      if (view === 'foodex') { setSearchHubMode('foodex'); setFoodexPageTab('index'); }
      else { renderSearchHub(); setSearchHubMode('fridge'); setSearchHubView('shopping'); }
    } catch { /* 넘어간 뒤 다시 그림 */ }
  };
  const showPeek = dir => {
    const view = PAGE_ORDER[idx + dir];
    return view ? showPeekView(view, dir) : null;
  };
  const showPeekView = (view, dir) => {
    const el = panelFor(view);
    if (!el || el === panel) return { view, el: null, dir }; // 그로서리↔식도감은 같은 판: 지금 판만 움직임
    if (view === 'stats') prepareStats();
    if (view === 'profile') { try { fillProfileForm(); } catch { /* 무시 */ } }
    if (view === 'fridge' || view === 'foodex') prepareSearch(view);
    const r = panel.getBoundingClientRect();
    el.classList.add('page-peek');
    el.style.top = `${r.top}px`; el.style.left = `${r.left}px`; el.style.width = `${r.width}px`; el.style.height = `${r.height}px`;
    el.hidden = false;
    return { view, el, dir };
  };
  const hidePeek = () => {
    if (!peek) return;
    const el = peek.el;
    if (el) {
      el.classList.remove('page-peek');
      ['top', 'left', 'width', 'height', 'transform', 'transition'].forEach(k => el.style.removeProperty(k));
      el.hidden = el.id !== panelFor(activeView)?.id; // 넘어갔으면 그대로 보이고, 아니면 다시 숨김
    }
    peek = null;
  };
  const place = (x, transition = 'none') => {
    if (panel) { panel.style.transition = transition; panel.style.transform = x ? `translate3d(${x}px, 0, 0)` : ''; }
    if (peek?.el) { peek.el.style.transition = transition; peek.el.style.transform = `translate3d(${x + peek.dir * W}px, 0, 0)`; }
  };
  const clearPanel = p => { if (p) { p.style.removeProperty('transform'); p.style.removeProperty('transition'); } };
  frame.addEventListener('touchstart', event => {
    active = false; mode = null; lastDx = 0; samples = [];
    if (settling || event.touches.length !== 1) return;
    const t = event.touches[0];
    if (pageSwipeBlocked(event.target, t.clientX)) return;
    panel = visiblePanel(); idx = pageIndexOf(activeView);
    if (!panel || idx < 0) return;
    active = true; sx = t.clientX; sy = t.clientY; W = panel.getBoundingClientRect().width || innerWidth;
  }, { passive: true });
  frame.addEventListener('touchmove', event => {
    if (!active) return;
    const t = event.touches[0];
    let dx = t.clientX - sx; const dy = t.clientY - sy;
    if (!mode) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      mode = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v';
      if (mode === 'h') { sx = t.clientX; dx = 0; } // 방향이 정해진 지점부터 1:1(튀지 않게)
    }
    if (mode === 'v' || document.body.classList.contains('meal-drag-active') || document.body.classList.contains('card-drag-active')) { active = false; hidePeek(); place(0); clearPanel(panel); movePageTabIndicator(true); return; }
    if (event.cancelable) event.preventDefault();
    lastDx = dx;
    const now = performance.now();
    samples.push({ x: t.clientX, t: now });
    while (samples.length > 2 && now - samples[0].t > 100) samples.shift();
    const dir = dx < 0 ? 1 : -1;
    if (dx !== 0 && (!peek || peek.dir !== dir)) { hidePeek(); peek = showPeek(dir); }
    const atEdge = !peek;
    const x = atEdge ? edgePull(dx) : Math.max(-W, Math.min(W, dx));
    place(Math.round(x * 10) / 10);
    if (peek) trackBar(activeView, peek.view, Math.min(1, Math.abs(x) / W));
  }, { passive: false });
  const settle = (commit, fromX) => {
    const dur = reduceMotion() ? 0 : SETTLE_MS;
    const transition = dur ? `transform ${dur}ms ${EASE}` : 'none';
    const p = panel; const pk = peek; const view = pk?.view; const fromView = activeView;
    const target = commit ? -pk.dir * W : 0;
    settling = true;
    place(target, transition);
    if (pk) setBar(tabGeom(tabFor(commit ? view : activeView)), dur ? `transform ${dur}ms ${EASE}` : 'none');
    else setBar(tabGeom(tabFor(activeView)), transition);
    const done = () => {
      if (commit && activeView !== fromView) {
        // 움직이는 중에 다른 곳에서 페이지를 바꿨으면 그쪽을 따름(되돌아가지 않게)
        clearPanel(p); hidePeek(); clearPanel(visiblePanel());
      } else if (commit) {
        const samePanel = !pk.el;
        commitPage(view);
        clearPanel(p);
        hidePeek();
        clearPanel(visiblePanel());
        if (samePanel && dur) {
          // 같은 판(그로서리↔식도감): 반대쪽에서 짧게 들어옴
          const np = visiblePanel();
          np.style.transition = 'none'; np.style.transform = `translate3d(${pk.dir * W * 0.3}px, 0, 0)`;
          void np.offsetWidth;
          np.style.transition = `transform ${dur}ms ${EASE}`; np.style.transform = 'translate3d(0, 0, 0)';
          setTimeout(() => clearPanel(np), dur + 30);
        }
      } else {
        clearPanel(p);
        hidePeek();
      }
      const b = bar(); if (b) b.style.removeProperty('transition');
      movePageTabIndicator(true);
      settling = false;
    };
    if (dur) setTimeout(done, dur + 20); else done();
  };
  const finish = () => {
    if (!active) return;
    active = false;
    if (mode !== 'h') { hidePeek(); clearPanel(panel); return; }
    const dx = lastDx;
    const a = samples[0]; const b = samples[samples.length - 1];
    const vx = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0;
    const flick = Math.abs(vx) > 0.5 && Math.abs(dx) >= 20;
    const commit = !!peek && (flick ? Math.sign(vx) === Math.sign(dx) : Math.abs(dx) >= W * 0.35);
    settle(commit, dx);
  };
  // 탭 누름: 지금 페이지와 고른 페이지를 나란히 붙여 한 번에 이동(여러 칸 건너뛰어도 사이 페이지 없이, 되돌아옴 없음)
  pageSlideTo = (view, dir) => {
    if (settling) return true;
    active = false;
    const cur = visiblePanel(); const target = panelFor(view);
    if (!cur || !target || target === cur || reduceMotion()) return false;
    panel = cur; idx = pageIndexOf(activeView); W = cur.getBoundingClientRect().width || innerWidth;
    hidePeek();
    peek = showPeekView(view, dir);
    place(0);
    void cur.offsetWidth;
    settle(true, 0);
    return true;
  };
  frame.addEventListener('touchend', finish, { passive: true });
  frame.addEventListener('touchcancel', () => { if (!active) return; active = false; settle(false, lastDx); }, { passive: true });
})();
// 밀어서 넘긴 뒤 마무리: 들어오기·차례로 나타나기 없이 바로 그 페이지로
function commitPage(view) {
  if (foodDex?.classList.contains('open')) closeFoodDex();
  if (view !== 'foodex') closeFoodexLibrary();
  suppressPageEnter = true;
  try { setActiveView(view); } finally { suppressPageEnter = false; }
  document.querySelector('#page-tabs .page-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}
document.getElementById('ai-dock-panel-close')?.addEventListener('click', () => setAiDockPanel(false));

/* 음성 입력: 앱은 @capgo/capacitor-speech-recognition(iOS 음성 인식, 가능하면 기기 안 인식, ko-KR),
   브라우저는 Web Speech, 둘 다 없으면 입력칸에 포커스(키보드의 받아쓰기 마이크 사용) */
let voiceSession = null;
function speechPlugin() {
  const cap = globalThis.Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return cap.Plugins?.SpeechRecognition || cap.registerPlugin?.('SpeechRecognition') || null;
}
function setVoiceUi(listening) {
  agentVoiceButton?.classList.toggle('is-listening', listening);
  agentVoiceButton?.setAttribute('aria-pressed', String(listening));
  agentVoiceButton?.setAttribute('aria-label', listening
    ? (ACTIVE_LOCALE === 'en' ? 'Stop voice input' : '음성 입력 멈추기')
    : (ACTIVE_LOCALE === 'en' ? 'Voice input' : '음성으로 입력'));
  if (agentInputEl) agentInputEl.placeholder = listening ? (ACTIVE_LOCALE === 'en' ? 'Listening…' : '듣고 있어요…') : (ACTIVE_LOCALE === 'en' ? 'Log today’s meals' : '오늘 식단 기록하기');
}
function fillFromVoice(text) {
  const value = String(text || '').trim();
  if (!value || !agentInputEl) return;
  agentInputEl.value = value;
  refreshAiDockSend();
}
function voiceFallbackToKeyboard() {
  focusAiDock();
  showToast(ACTIVE_LOCALE === 'en' ? 'Use the mic key on the keyboard to dictate.' : '키보드의 마이크 버튼으로 받아쓰기할 수 있어요.', 'info');
}
async function stopVoice() {
  const session = voiceSession;
  voiceSession = null;
  setVoiceUi(false);
  try { await session?.stop?.(); } catch { /* 이미 멈춤 */ }
  try { session?.cleanup?.(); } catch { /* ignore */ }
}
async function startNativeVoice(plugin) {
  const lang = ACTIVE_LOCALE === 'en' ? 'en-US' : 'ko-KR';
  const { available } = await plugin.available();
  if (!available) throw new Error('unavailable');
  let perm = await plugin.checkPermissions();
  if (perm.speechRecognition !== 'granted') perm = await plugin.requestPermissions();
  if (perm.speechRecognition !== 'granted') {
    showToast(ACTIVE_LOCALE === 'en' ? 'Allow speech recognition in Settings to use the mic.' : '설정에서 음성 인식·마이크를 허용하면 쓸 수 있어요.', 'info');
    return;
  }
  let onDevice = false;
  try { onDevice = Boolean((await plugin.isOnDeviceRecognitionAvailable({ language: lang }))?.available); } catch { /* 지원 안 함 */ }
  const handles = [];
  const session = {
    stop: () => plugin.stop(),
    cleanup: () => handles.forEach(h => { try { h.remove(); } catch { /* ignore */ } }),
  };
  voiceSession = session;
  setVoiceUi(true);
  handles.push(await plugin.addListener('partialResults', event => fillFromVoice(event?.matches?.[0])));
  handles.push(await plugin.addListener('listeningState', event => {
    if (voiceSession === session && event?.state === 'stopped') { voiceSession = null; setVoiceUi(false); session.cleanup(); }
  }));
  handles.push(await plugin.addListener('error', () => {
    if (voiceSession === session) stopVoice();
  }));
  const result = await plugin.start({ language: lang, maxResults: 1, partialResults: true, popup: false, addPunctuation: false, useOnDeviceRecognition: onDevice });
  if (result?.matches?.[0]) fillFromVoice(result.matches[0]);
}
function startWebVoice(Api) {
  const recognition = new Api();
  recognition.lang = ACTIVE_LOCALE === 'en' ? 'en-US' : 'ko-KR';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  voiceSession = { stop: () => recognition.stop() };
  setVoiceUi(true);
  recognition.addEventListener('result', event => {
    const last = event.results?.[event.results.length - 1];
    fillFromVoice(last?.[0]?.transcript);
  });
  recognition.addEventListener('error', () => { voiceSession = null; setVoiceUi(false); voiceFallbackToKeyboard(); });
  recognition.addEventListener('end', () => { voiceSession = null; setVoiceUi(false); });
  recognition.start();
}
agentVoiceButton?.addEventListener('click', async () => {
  if (voiceSession) { await stopVoice(); return; }
  try {
    const plugin = speechPlugin();
    if (plugin) { await startNativeVoice(plugin); return; }
    const WebApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (WebApi) { startWebVoice(WebApi); return; }
    voiceFallbackToKeyboard();
  } catch {
    await stopVoice();
    voiceFallbackToKeyboard();
  }
});

/* 사진으로 기록: 사진을 줄여(긴 변 1280px, 약 2MB 이하 JPEG) 맥 미니로 보내면
   맥 미니가 사진 속 음식을 알아보고(Grok 이미지 모델) 영양성분을 찾아 바로 기록 */
const PHOTO_CONSENT_KEY = 'rebuilders-photo-consent';
// 사진 기록은 보류 중: false 면 버튼을 숨기고 사진 경로를 막음(코드는 그대로 둠). 맥 미니 브리지도 REBUILDERS_PHOTO=1 일 때만 받음
const PHOTO_ENABLED = false;
const aiPhotoButton = document.getElementById('ai-photo');
if (aiPhotoButton) aiPhotoButton.hidden = !PHOTO_ENABLED;
let bridgePhotoBusy = false;

async function resizePhoto(file, maxSide = 1280, maxBytes = 2 * 1024 * 1024) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image'));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.7, 0.55, 0.4]) {
      const data = canvas.toDataURL('image/jpeg', quality).split(',')[1] || '';
      if (data.length * 0.75 <= maxBytes) return data;
    }
    throw new Error('too_big');
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function confirmPhotoConsent() {
  try { if (localStorage.getItem(PHOTO_CONSENT_KEY) === '1') return true; } catch { /* ignore */ }
  const ok = confirm(ACTIVE_LOCALE === 'en'
    ? 'The photo goes to your Mac mini, which sends it to xAI (Grok) to recognize the food. Nothing else from the app is sent. Continue?'
    : '사진은 집의 맥 미니를 거쳐 xAI(Grok)로 보내 음식을 알아봐요. 앱의 다른 정보는 보내지 않아요. 계속할까요?');
  if (ok) { try { localStorage.setItem(PHOTO_CONSENT_KEY, '1'); } catch { /* ignore */ } }
  return ok;
}

document.getElementById('ai-photo')?.addEventListener('click', async () => {
  const en = ACTIVE_LOCALE === 'en';
  if (!PHOTO_ENABLED) { showToast(en ? 'Photo logging is coming soon.' : '사진 인식은 준비 중이에요.', 'info'); return; }
  if (!globalThis.RebuildersBridge?.isConfigured()) {
    showToast(en ? 'Connect the Mac mini in Settings to log from photos.' : '사진 기록은 설정에서 맥 미니를 연결하면 쓸 수 있어요.', 'info');
    return;
  }
  if (bridgePhotoBusy) return;
  if (!(await confirmPhotoConsent())) return;
  document.getElementById('ai-photo-input')?.click();
});

document.getElementById('ai-photo-input')?.addEventListener('change', async event => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  input.value = '';
  if (!file || !PHOTO_ENABLED) return;
  const en = ACTIVE_LOCALE === 'en';
  const typed = agentInputEl?.value.trim() || '';
  const parsed = typed ? parseQuickFoodText(typed) : null;
  const mealId = parsed?.mealExplicit ? parsed.mealId : (globalThis.RebuildersQuickEntry?.mealForTime(new Date()) || 'lunch');
  if (parsed?.dateExplicit) await goToEntryDate(parsed);
  bridgePhotoBusy = true;
  renderBridgePending();
  try {
    const image = await resizePhoto(file);
    const result = await RebuildersBridge.lookupPhoto({ image, date: dateKey(currentDate), meal: mealId });
    const foods = result.items.map(item => {
      const fields = RebuildersBridge.toFoodFields(item);
      if (!fields) return null;
      const { displayName, ...rest } = fields;
      return { name: displayName || item.name, ...rest, inputName: item.name, loggedVia: 'bridge-photo' };
    }).filter(Boolean);
    if (!foods.length) {
      showToast(en ? 'Could not find food in the photo.' : '사진에서 음식을 찾지 못했어요.', 'info');
      return;
    }
    if (mealId === 'snack') currentSnackSlot = getDefaultSnackSlot();
    await addFoods(mealId, foods);
    await registerLoggedFoods(foods);
    if (typed && parsed && !parsed.items.length) { agentInputEl.value = ''; refreshAiDockSend(); }
    appendAgentMessage(en ? `Photo → ${mealLabel(mealId)}: ${foods.map(quickItemSummary).join(', ')} (AI estimate)` : `사진 → ${mealLabel(mealId)}에 기록: ${foods.map(quickItemSummary).join(', ')} (AI 추정)`);
    showToast(en ? `Logged ${foods.length} from the photo (AI estimate)` : `사진에서 ${foods.length}개 찾아 기록했어요 (AI 추정)`, 'success');
  } catch (error) {
    const kind = error instanceof RebuildersBridge.BridgeError ? error.kind : (error?.message || 'error');
    showToast(kind === 'too_big' ? (en ? 'The photo is too large.' : '사진이 너무 커요.')
      : bridgeStopMessage(kind === 'unreachable' || kind === 'unauthorized' ? kind : 'agent_failed').replace('대기 중이에요. 집 와이파이에서 앱을 열면 자동으로 채워요.', '사진은 집 와이파이에서 다시 보내주세요.'), 'info');
  } finally {
    bridgePhotoBusy = false;
    renderBridgePending();
  }
});

// 홈 카드의 픽셀 캐릭터·말풍선: 지금은 숨김(true 로 바꾸면 다시 보임)
const SHOW_CHARACTER = false;
document.body?.classList.toggle('no-character', !SHOW_CHARACTER);
function updateLevelMessage(state = 'hungry') {
  const messagesByState = {
    hungry: ['TIME TO FUEL!', 'ENERGY LOW!', "LET'S EAT!"],
    balanced: ['NICE BALANCE!', 'KEEP GOING!', 'RIGHT ON TRACK!'],
    full: ['TAKE IT EASY!', 'BALANCE NEXT!', 'LIGHTER NEXT!'],
  };
  const messages = messagesByState[state] || messagesByState.balanced;
  const bubble = document.querySelector('#view-home .level-bubble');
  if (bubble) bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
}

/* ============================
   앱 모드 · 서비스 워커
   ============================ */
function setupAppModeUi() {
  if (!APP_MODE) return;
  // 텔레그램 데모·AI 메시지 앱 안내는 스토어 앱에서 사용하지 않습니다.
  document.getElementById('telegram-mark-connected')?.remove();
  document.querySelectorAll('#agent-help-dialog dl > div')[3]?.remove();
  document.querySelectorAll('#telegram-open-btn, #telegram-share-btn, #telegram-help-btn, .chat-action-banners')
    .forEach(el => el.remove());
  // WKWebView 에서는 웹 음성 인식을 신뢰할 수 없고 마이크/음성 권한 문구가 필요해져 앱에서는 숨깁니다.
  if (IS_NATIVE_APP && agentVoiceButton) agentVoiceButton.style.display = 'none';
}

function registerServiceWorker() {
  if (IS_NATIVE_APP || LOCAL_MODE || !('serviceWorker' in navigator)) return;
  if (!(location.protocol === 'https:' || location.hostname === 'localhost')) return;
  navigator.serviceWorker.register('sw.js').catch(error => console.warn('Service worker 등록 실패:', error));
}

/* ============================
   식사 기록 알림 (앱에서만 표시)
   ============================ */
let reminderDraft = null;

function currentReminderConfig() {
  return NiliriReminders.normalize(PROFILE.mealReminders);
}

function renderReminderForm(config) {
  document.querySelectorAll('[data-reminder-enabled]').forEach(button => {
    const active = (button.dataset.reminderEnabled === 'on') === config.enabled;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const times = document.getElementById('reminder-times');
  if (times) times.hidden = !config.enabled;
  for (const meal of NiliriReminders.MEALS) {
    const input = document.getElementById(`reminder-${meal}`);
    if (input) input.value = config.times[meal];
  }
}

function setupReminderUi() {
  const card = document.getElementById('reminder-card');
  if (!card) return;
  if (!NiliriReminders.isSupported()) {
    card.hidden = true; // 웹/PWA: 로컬 알림 플러그인이 없으므로 숨김(아무 동작 없음)
    return;
  }
  card.hidden = false;
  reminderDraft = currentReminderConfig();
  renderReminderForm(reminderDraft);
  // 앱을 열 때 저장된 설정으로 알림을 다시 맞춥니다(권한 팝업은 띄우지 않음).
  NiliriReminders.apply(reminderDraft, ACTIVE_LOCALE);
}

document.querySelectorAll('[data-reminder-enabled]').forEach(button => {
  button.addEventListener('click', () => {
    reminderDraft = { ...(reminderDraft || currentReminderConfig()), enabled: button.dataset.reminderEnabled === 'on' };
    renderReminderForm(reminderDraft);
  });
});

document.getElementById('reminder-save')?.addEventListener('click', async event => {
  const btn = event.currentTarget;
  if (btn.dataset.actionLocked === 'true') return;
  btn.dataset.actionLocked = 'true';
  setButtonPending(btn, true);
  const hint = document.getElementById('reminder-hint');
  const showHint = text => {
    if (!hint) return;
    hint.textContent = text;
    hint.hidden = false;
    clearTimeout(hint._timer);
    hint._timer = setTimeout(() => { hint.hidden = true; }, 3200);
  };
  try {
    const draft = reminderDraft || currentReminderConfig();
    const times = {};
    for (const meal of NiliriReminders.MEALS) times[meal] = document.getElementById(`reminder-${meal}`)?.value || '';
    let config = NiliriReminders.normalize({ enabled: draft.enabled, times });
    const result = await NiliriReminders.apply(config, ACTIVE_LOCALE, { requestPermission: true });
    let message = ACTIVE_LOCALE === 'en' ? 'Saved' : '저장됐어요';
    if (result.status === 'denied') {
      config = { ...config, enabled: false };
      message = ACTIVE_LOCALE === 'en'
        ? 'Notifications are off. Allow them in iOS Settings > Rebuilders.'
        : '알림 권한이 꺼져 있어요. iOS 설정 > 리빌더스에서 알림을 허용해 주세요.';
    } else if (result.status === 'error') {
      config = { ...config, enabled: false };
      message = ACTIVE_LOCALE === 'en' ? 'Could not schedule reminders.' : '알림을 예약하지 못했어요.';
    } else if (result.status === 'scheduled') {
      message = ACTIVE_LOCALE === 'en' ? 'Reminders scheduled' : '알림을 예약했어요';
    }
    await saveSettings({ mealReminders: config });
    PROFILE = { ...PROFILE, mealReminders: config };
    reminderDraft = config;
    renderReminderForm(config);
    showHint(message);
  } catch (error) {
    showStorageFailure(error);
  } finally {
    setButtonPending(btn, false);
    setTimeout(() => { delete btn.dataset.actionLocked; }, 400);
  }
});

/* ============================
   JSON 백업 · 가져오기 · 샘플
   ============================ */
let pendingImport = null; // { state, summary }

const tx = (ko, en) => (ACTIVE_LOCALE === 'en' ? en : ko);

function describeSummary(summary) {
  const shopping = (summary.shoppingItems || 0) + (summary.stockItems || 0);
  const range = summary.firstDate
    ? `${summary.firstDate} ~ ${summary.lastDate}`
    : tx('식단 기록 없음', 'No meal records');
  return ACTIVE_LOCALE === 'en'
    ? `${summary.days} days · ${summary.foods} foods · ${summary.customFoods} custom foods${shopping ? ` · ${shopping} shopping/stock items` : ''} · ${range}`
    : `${summary.days}일 · 음식 ${summary.foods}개 · 내 음식 ${summary.customFoods}개${shopping ? ` · 장보기·창고 ${shopping}개` : ''} · ${range}`;
}

function hideImportPreview() {
  pendingImport = null;
  const preview = document.getElementById('import-preview');
  if (preview) preview.hidden = true;
  const fileInput = document.getElementById('import-file');
  if (fileInput) fileInput.value = '';
}

function showImportPreview(result) {
  const preview = document.getElementById('import-preview');
  const title = document.getElementById('import-preview-title');
  const meta = document.getElementById('import-preview-meta');
  const issues = document.getElementById('import-preview-issues');
  const confirmButton = document.getElementById('confirm-import');
  if (!preview || !title || !meta || !issues || !confirmButton) return;
  issues.textContent = '';
  const addIssue = text => { const li = document.createElement('li'); li.textContent = text; issues.appendChild(li); };
  if (result.ok) {
    title.textContent = tx('백업 파일을 확인했어요', 'Backup file checked');
    const exported = result.exportedAt ? new Date(result.exportedAt) : null;
    const exportedText = exported && !Number.isNaN(exported.getTime())
      ? `${tx('내보낸 시각', 'Exported')}: ${exported.toLocaleString(ACTIVE_LOCALE === 'en' ? 'en-US' : 'ko-KR')}`
      : '';
    meta.textContent = [describeSummary(result.summary), exportedText].filter(Boolean).join('\n');
    (result.warnings || []).forEach(addIssue);
    confirmButton.hidden = false;
  } else {
    title.textContent = tx('가져올 수 없는 파일이에요', 'This file cannot be imported');
    meta.textContent = tx('현재 기록은 바뀌지 않았어요.', 'Your current records were not changed.');
    (result.errors || []).forEach(addIssue);
    if (result.moreErrors) addIssue(tx(`그 외 ${result.moreErrors}건`, `${result.moreErrors} more`));
    confirmButton.hidden = true;
  }
  preview.hidden = false;
}

document.getElementById('export-backup')?.addEventListener('click', async event => {
  const btn = event.currentTarget;
  if (btn.dataset.actionLocked === 'true') return;
  btn.dataset.actionLocked = 'true';
  setButtonPending(btn, true);
  try {
    const state = await storageRepository.getAll();
    const result = await NiliriBackup.exportBackup(state);
    if (result.method === 'download') {
      showToast(tx(`${result.fileName} 파일을 저장했어요. 파일 앱에서 확인하세요.`, `Saved ${result.fileName}. Check your Files app.`), 'success');
    } else if (result.method !== 'cancelled') {
      showToast(tx('백업 파일을 내보냈어요.', 'Backup file exported.'), 'success');
    }
  } catch (error) {
    console.warn('백업 내보내기 실패:', error);
    showToast(tx('백업 파일을 만들지 못했어요.', 'Could not create the backup file.'), 'error');
  } finally {
    setButtonPending(btn, false);
    setTimeout(() => { delete btn.dataset.actionLocked; }, 400);
  }
});

document.getElementById('choose-import-file')?.addEventListener('click', () => {
  document.getElementById('import-file')?.click();
});

document.getElementById('import-file')?.addEventListener('change', async event => {
  const file = event.target.files?.[0];
  pendingImport = null;
  if (!file) return;
  if (file.size > NiliriBackup.MAX_FILE_BYTES) {
    showImportPreview({ ok: false, errors: [tx('파일이 너무 커요(최대 20MB).', 'The file is too large (max 20MB).')] });
    return;
  }
  let text;
  try {
    text = await file.text();
  } catch (_) {
    showImportPreview({ ok: false, errors: [tx('파일을 읽지 못했어요.', 'Could not read the file.')] });
    return;
  }
  const result = NiliriBackup.parseBackup(text);
  if (result.ok) pendingImport = { state: result.state, summary: result.summary };
  showImportPreview(result);
});

document.getElementById('cancel-import')?.addEventListener('click', hideImportPreview);

document.getElementById('confirm-import')?.addEventListener('click', async event => {
  const btn = event.currentTarget;
  if (!pendingImport || btn.dataset.actionLocked === 'true') return;
  btn.dataset.actionLocked = 'true';
  setButtonPending(btn, true);
  try {
    const mode = document.getElementById('import-mode')?.value === 'merge' ? 'merge' : 'replace';
    const current = await storageRepository.getAll();
    const currentSummary = NiliriBackup.summarize(current);
    const message = mode === 'replace'
      ? tx(
        `현재 기록(${describeSummary(currentSummary)})이 모두 지워지고 백업 내용(${describeSummary(pendingImport.summary)})으로 바뀌어요.\n되돌릴 수 없어요. 계속할까요?`,
        `Your current records (${describeSummary(currentSummary)}) will be erased and replaced with the backup (${describeSummary(pendingImport.summary)}).\nThis cannot be undone. Continue?`,
      )
      : tx(
        `백업 내용(${describeSummary(pendingImport.summary)})을 현재 기록과 합쳐요. 같은 날짜는 백업 내용으로 바뀌어요. 계속할까요?`,
        `The backup (${describeSummary(pendingImport.summary)}) will be merged into your current records. Days that exist in both are replaced by the backup. Continue?`,
      );
    if (!confirm(message)) return;
    const next = mode === 'replace' ? pendingImport.state : NiliriBackup.mergeStates(current, pendingImport.state);
    await storageRepository.replaceAll(next);
    hideImportPreview();
    showToast(tx('가져왔어요. 화면을 새로 불러와요.', 'Imported. Reloading.'), 'success');
    setTimeout(() => globalThis.location.reload(), 700);
  } catch (error) {
    showStorageFailure(error);
  } finally {
    setButtonPending(btn, false);
    setTimeout(() => { delete btn.dataset.actionLocked; }, 400);
  }
});

document.getElementById('load-sample')?.addEventListener('click', async event => {
  const btn = event.currentTarget;
  if (btn.dataset.actionLocked === 'true' || !globalThis.RebuildersDemo) return;
  btn.dataset.actionLocked = 'true';
  try {
    if (!confirm(tx(
      '가상의 샘플 식단 4일치를 기록이 비어 있는 날짜에, 장보기 예시 4개를 장보기·창고가 비어 있을 때 추가해요. 실제 기록이 아니며, 필요 없으면 직접 지워야 해요. 추가할까요?',
      'This adds four fictional sample days to dates with no records, and four example shopping items if Shopping and Stock are empty. They are not real records, and you must delete them yourself if you do not want them. Add them?',
    ))) return;
    const days = RebuildersDemo.addSampleDays(await storageRepository.getAll());
    const shopping = RebuildersDemo.addSampleShopping
      ? RebuildersDemo.addSampleShopping(days.state)
      : { state: days.state, added: 0 };
    const state = shopping.state;
    const added = days.added + shopping.added;
    if (!added) {
      showToast(tx('최근 4일에 이미 기록이 있고 장보기도 비어 있지 않아 추가하지 않았어요.', 'The last four days already have records and Shopping is not empty, so nothing was added.'), 'info');
      return;
    }
    await storageRepository.replaceAll(state);
    showToast(tx('샘플 식단을 추가했어요. 화면을 새로 불러와요.', 'Sample meals added. Reloading.'), 'success');
    setTimeout(() => globalThis.location.reload(), 700);
  } catch (error) {
    showStorageFailure(error);
  } finally {
    setTimeout(() => { delete btn.dataset.actionLocked; }, 400);
  }
});

/* ============================
   초기화
   ============================ */
function showStorageUnavailable(error) {
  const screen = document.getElementById('storage-unavailable');
  const phone = document.querySelector('.phone-frame');
  const message = document.getElementById('storage-unavailable-message');
  if (message) message.textContent = storageErrorMessage(error);
  if (phone) phone.hidden = true;
  if (screen) screen.hidden = false;
  document.body.classList.add('app-ready'); motionOnReady(); setTimeout(() => FoodSearch.build().catch(() => {}), 300);
}

function showAppScreen() {
  const screen = document.getElementById('storage-unavailable');
  const phone = document.querySelector('.phone-frame');
  if (screen) screen.hidden = true;
  if (phone) phone.hidden = false;
}

/* ============================
   건강 앱(HealthKit) 심박수: 읽기 전용, 화면 표시만(저장·백업·전송 안 함)
   ============================ */
let heartRateTimer = null;

function healthCopy(key) {
  const en = ACTIVE_LOCALE === 'en';
  return {
    connect: en ? 'Connect Apple Health' : '건강 앱 연결하기',
    disconnect: en ? 'Disconnect' : '연결 끊기',
    connected: en ? 'Connected. Heart rate and steps are read on this device only.' : '연결됨 · 심박수와 걸음 수는 이 기기에서만 읽어 보여줘요.',
    disconnected: en ? 'Disconnected in the app. To fully revoke access: Settings > Health > Data Access & Devices > Rebuilders.' : '앱에서 연결을 끊었어요. 권한까지 끄려면 설정 > 건강 > 데이터 접근 및 기기 > 리빌더스에서 꺼주세요.',
    noData: en ? 'No heart rate for this day' : '이 날 심박수 기록 없음',
    addSteps: en ? 'Allow step count' : '걸음 수 권한 추가',
  }[key];
}

function renderHealthSettings(message = '') {
  const card = document.getElementById('health-card');
  if (!card) return;
  const supported = globalThis.RebuildersHealth?.isSupported();
  card.hidden = !supported;
  if (!supported) return;
  const connected = RebuildersHealth.isConnected();
  const button = document.getElementById('health-connect');
  button.textContent = connected ? healthCopy('disconnect') : healthCopy('connect');
  const stepsButton = document.getElementById('health-steps-permission');
  if (stepsButton) {
    stepsButton.hidden = !RebuildersHealth.needsStepsPermission();
    stepsButton.textContent = healthCopy('addSteps');
  }
  const hint = document.getElementById('health-hint');
  const text = message || (connected ? healthCopy('connected') : '');
  hint.hidden = !text;
  hint.textContent = text;
}

let healthRefreshSeq = 0;
function setGlanceRows({ heart = false, steps = false, link = false } = {}) {
  document.getElementById('glance-heart').hidden = !heart;
  document.getElementById('glance-steps').hidden = !steps;
  document.getElementById('health-glance-connect').hidden = !link;
}

/* 홈 캐릭터 옆(원래 vital 자리)에 선택한 날짜의 심박수·걸음 수를 작게 표시. 메모리 표시만. */
async function refreshHeartRate(options = {}) {
  const glance = document.getElementById('health-glance');
  if (!glance) return;
  const health = globalThis.RebuildersHealth;
  if (!health?.isSupported()) { setGlanceRows(); return; } // 웹: 빈 자리
  if (!health.isConnected()) { setGlanceRows({ link: true }); return; } // 연결 전: 작은 링크
  const seq = ++healthRefreshSeq;
  const en = ACTIVE_LOCALE === 'en';
  const date = new Date(currentDate);
  try {
    if (options.force) health.clearCache();
    const day = await health.readDay(date);
    if (seq !== healthRefreshSeq) return; // 날짜를 빨리 넘긴 경우 마지막 요청만 반영
    const hasHeart = !day.outOfRange && day.heartCount > 0;
    const setValue = (id, value, text) => { const el = document.getElementById(id); el.dataset.value = value; el.textContent = text; };
    const latest = hasHeart ? String(day.heartLatest) : '--';
    const steps = !day.outOfRange && day.steps != null ? day.steps.toLocaleString(en ? 'en-US' : 'ko-KR') : '--';
    setValue('heart-rate-latest', latest, `${latest}bpm`);
    setValue('health-steps-value', steps, steps);
    let latestTime = '';
    if (hasHeart && day.heartLatestAt) {
      const at = new Date(day.heartLatestAt);
      latestTime = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
    }
    document.getElementById('glance-heart').title = day.outOfRange
      ? (en ? 'Only the last 7 days are shown.' : '최근 7일 기록만 보여줘요.')
      : (latestTime ? `${en ? 'Latest' : '최근'} ${latestTime}` : healthCopy('noData'));
    setGlanceRows({ heart: true, steps: !health.needsStepsPermission() });
  } catch {
    if (seq === healthRefreshSeq) setGlanceRows(); // 읽기 실패(권한 없음 등)면 조용히 비움
  }
}

document.getElementById('health-glance-connect')?.addEventListener('click', () => {
  // 설정의 '건강 앱 연결' 카드로 이동(권한 요청은 거기서 사용자가 누를 때만)
  document.getElementById('btn-open-profile')?.click();
  setTimeout(() => document.getElementById('health-card')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
});

document.getElementById('health-steps-permission')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  if (button.dataset.actionLocked === 'true') return;
  button.dataset.actionLocked = 'true';
  try {
    await RebuildersHealth.connect(); // 심박수+걸음 수 읽기 권한(쓰기 없음)
    renderHealthSettings();
    await refreshHeartRate({ force: true });
  } catch (error) {
    renderHealthSettings(String(error?.message || error));
  } finally {
    delete button.dataset.actionLocked;
  }
});

function setupHealthUi() {
  renderHealthSettings();
  refreshHeartRate();
  clearInterval(heartRateTimer);
  if (globalThis.RebuildersHealth?.isSupported()) {
    heartRateTimer = setInterval(() => { if (!document.hidden) refreshHeartRate({ force: true }); }, 5 * 60_000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshHeartRate({ force: true }); });
  }
}

document.getElementById('health-connect')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  if (button.dataset.actionLocked === 'true') return;
  button.dataset.actionLocked = 'true';
  try {
    if (RebuildersHealth.isConnected()) {
      RebuildersHealth.disconnect();
      renderHealthSettings(healthCopy('disconnected'));
    } else {
      await RebuildersHealth.connect();
      renderHealthSettings();
    }
    await refreshHeartRate();
  } catch (error) {
    renderHealthSettings(String(error?.message || error));
  } finally {
    delete button.dataset.actionLocked;
  }
});

/* ============================
   AI(맥 미니 OpenClaw · 텔레그램)에게 영양성분 물어보기 + 링크로 받은 기록 확인
   - 보내는 내용: 음식 이름·양·끼니(·날짜)만. 체중·심박수·걸음 수 등은 보내지 않음.
   - 받는 링크(rebuilders://log?d=...)는 확인 시트에서 사용자가 '기록'을 눌러야만 저장.
   ============================ */
const TELEGRAM_BOT_KEY = 'rebuilders-telegram-bot';

function normalizeBotId(value) {
  const id = String(value || '').trim().replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '').split(/[/?#]/)[0];
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(id) ? id : '';
}
function getTelegramBotId() {
  try { return normalizeBotId(localStorage.getItem(TELEGRAM_BOT_KEY)); } catch { return ''; }
}

function buildAskText(mealId, items, date = currentDate) {
  const list = items.map(item => `${item.name}${item.serving ? ` ${item.serving}` : ''}`).join(', ');
  const dateText = isToday(date) ? '' : ` (${dateKey(date)})`;
  return `[리빌더스] ${MEAL_META[mealId]?.label || '간식'}${dateText}: ${list}\n1회 제공량 기준 칼로리·탄수화물·단백질·지방 찾아서 리빌더스 기록 링크 보내줘.`;
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* 아래 방식으로 */ }
  try {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch { return false; }
}

function openExternalUrl(url) {
  // Capacitor(iOS)는 앱 밖 주소를 시스템(텔레그램 앱/사파리)으로 엽니다.
  const opened = window.open(url, '_blank');
  if (!opened) location.href = url;
}

function openAiLookupSettings() {
  document.getElementById('btn-open-profile')?.click();
  setTimeout(() => document.getElementById('ai-lookup-card')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
}

async function askAiForFoods(mealId, items, options = {}) {
  const clean = (items || []).filter(item => item?.name).slice(0, 10);
  if (!clean.length) return;
  // 맥 미니 주소·토큰이 있으면 텔레그램·클립보드 없이 바로 찾아서 저장
  if (globalThis.RebuildersBridge?.isConfigured()) return askBridgeForFoods(mealId, clean, options);
  const bot = getTelegramBotId();
  if (!bot) {
    showToast(ACTIVE_LOCALE === 'en' ? 'Enter your Telegram bot ID in Settings first.' : '설정에서 텔레그램 봇 아이디를 먼저 넣어주세요.', 'info');
    openAiLookupSettings();
    return;
  }
  const text = buildAskText(mealId, clean);
  const copied = await copyText(text);
  // 봇 채팅은 ?text= 미리 채우기가 안 될 수 있어 클립보드에도 복사해 둡니다.
  openExternalUrl(`https://t.me/${bot}?text=${encodeURIComponent(text)}`);
  showToast(copied
    ? (ACTIVE_LOCALE === 'en' ? 'Question copied. Paste it in Telegram if it is not filled in.' : '질문을 복사했어요. 입력칸이 비어 있으면 붙여넣고 보내주세요.')
    : (ACTIVE_LOCALE === 'en' ? 'Opening Telegram…' : '텔레그램을 열고 있어요…'), 'info');
}

function buildAskAiButton(mealId, items, className = 'ask-ai-btn', options = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className === 'agent-confirm' ? 'agent-confirm ask-ai-btn' : className;
  button.dataset.askAi = 'true';
  button.textContent = ACTIVE_LOCALE === 'en' ? 'Ask AI' : 'AI에게 물어보기';
  button.addEventListener('click', event => { event.stopPropagation(); askAiForFoods(mealId, items, { ...options, button }); });
  return button;
}

function renderAiLookupSettings(message = '') {
  const input = document.getElementById('telegram-bot-id');
  if (input && document.activeElement !== input) input.value = getTelegramBotId();
  const hint = document.getElementById('telegram-bot-hint');
  if (!hint) return;
  hint.hidden = !message;
  hint.textContent = message;
}

document.getElementById('telegram-bot-save')?.addEventListener('click', () => {
  const raw = document.getElementById('telegram-bot-id')?.value || '';
  const id = normalizeBotId(raw);
  try {
    if (!raw.trim()) localStorage.removeItem(TELEGRAM_BOT_KEY);
    else if (id) localStorage.setItem(TELEGRAM_BOT_KEY, id);
  } catch { /* ignore */ }
  renderAiLookupSettings(!raw.trim()
    ? (ACTIVE_LOCALE === 'en' ? 'Bot ID removed.' : '봇 아이디를 지웠어요.')
    : id ? (ACTIVE_LOCALE === 'en' ? `Saved @${id}` : `@${id} 저장했어요.`)
      : (ACTIVE_LOCALE === 'en' ? 'Check the bot ID (letters, numbers, _).' : '봇 아이디를 확인해주세요(영문·숫자·_).'));
});

let pendingLogLink = null;
const logLinkModal = document.getElementById('log-link-modal');

function logFoodLine(food) {
  const has = value => value !== undefined && value !== null;
  const en = ACTIVE_LOCALE === 'en';
  const labels = en ? { carbs: 'Carbs', protein: 'Protein', fat: 'Fat' } : { carbs: '탄수', protein: '단백질', fat: '지방' };
  const macro = ['carbs', 'protein', 'fat'].map(key => `${labels[key]} ${has(food[key]) ? `${food[key]}g` : '—'}`).join(' · ');
  return `<li class="log-link-food"><div><strong>${escapeHtml(food.name)}</strong>${food.serving ? `<small>${escapeHtml(food.serving)}</small>` : ''}${food.estimate ? `<em class="log-link-estimate">${en ? 'Estimate' : '추정'}</em>` : ''}</div>
    <span class="log-link-kcal">${has(food.cal) ? `${food.cal}kcal` : (en ? 'kcal —' : 'kcal 미입력')}</span>
    <span class="log-link-macros">${escapeHtml(macro)}</span>
    ${food.sourceNote ? `<span class="log-link-source">${en ? 'Source' : '출처'}: ${escapeHtml(food.sourceNote)}</span>` : ''}</li>`;
}

function renderLogLinkSheet() {
  if (!pendingLogLink) return;
  const { data, meal, warnings } = pendingLogLink;
  const date = parseDateKey(data.date);
  const en = ACTIVE_LOCALE === 'en';
  document.getElementById('log-link-date').textContent = `${isToday(date) ? (en ? 'Today' : '오늘') : formatHomeDate(date)} · ${data.source === 'openclaw' ? (en ? 'found by AI (Telegram)' : 'AI(텔레그램)가 찾은 값') : (en ? 'from a link' : '링크로 받은 값')}`;
  document.querySelectorAll('[data-log-meal]').forEach(button => {
    const active = button.dataset.logMeal === meal;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = mealLabel(button.dataset.logMeal);
  });
  document.getElementById('log-link-foods').innerHTML = data.foods.map(logFoodLine).join('');
  const warn = document.getElementById('log-link-warnings');
  warn.hidden = !warnings.length;
  warn.textContent = warnings.slice(0, 3).join(' ');
  document.getElementById('log-link-save').textContent = en ? `Log ${data.foods.length}` : `${data.foods.length}개 기록`;
}

function closeLogLinkSheet() {
  logLinkModal?.classList.remove('open');
  pendingLogLink = null;
}

function handleIncomingLogUrl(url) {
  if (!globalThis.RebuildersLogLink) return false;
  const result = RebuildersLogLink.parseLogUrl(url);
  if (!result.ok) {
    showToast(result.errors[0] || (ACTIVE_LOCALE === 'en' ? 'Could not read the link.' : '링크를 읽을 수 없어요.'), 'error');
    return false;
  }
  pendingLogLink = { data: result.data, meal: result.data.meal, warnings: result.warnings };
  renderLogLinkSheet();
  logLinkModal?.classList.add('open');
  return true;
}

const compactFoodName = name => String(name || '').toLowerCase().replace(/\s+/g, '');

async function savePendingLogLink() {
  if (!pendingLogLink) return;
  const { data, meal } = pendingLogLink;
  if (data.date !== dateKey(currentDate)) {
    currentDate = parseDateKey(data.date);
    await loadCurrentDay();
    updateDateDisplay();
    renderAll(true);
  }
  if (meal === 'snack') currentSnackSlot = getDefaultSnackSlot();
  const before = snapshotMeals();
  const wasEmpty = meal === 'snack' ? !snackFoodsForSlot(currentSnackSlot).length : !meals[meal].foods.length;
  let filled = 0;
  let added = 0;
  data.foods.forEach(food => {
    const record = { ...food, source: 'openclaw', sourceTrust: food.estimate ? 'estimate' : 'ai', loggedVia: 'link' };
    // 이름만 저장해 둔 같은 음식(영양 미입력)이 있으면 새로 추가하지 않고 그 기록을 채움
    const idx = meals[meal].foods.findIndex(existing => isNutritionMissing(existing) && compactFoodName(existing.name) === compactFoodName(food.name));
    if (idx >= 0) {
      const existing = meals[meal].foods[idx];
      meals[meal].foods[idx] = { ...existing, ...record, serving: record.serving || existing.serving, slot: existing.slot };
      filled += 1;
    } else {
      if (meal === 'snack') record.slot = currentSnackSlot;
      record._isNew = true;
      meals[meal].foods.push(record);
      added += 1;
    }
  });
  setAutoTimeForFirstFood(meal, meal === 'snack' ? currentSnackSlot : null, wasEmpty);
  renderAll(false);
  await persistMealsOrRestore(before);
  closeLogLinkSheet();
  const en = ACTIVE_LOCALE === 'en';
  const parts = en
    ? [added ? `${added} added` : '', filled ? `${filled} filled in` : '']
    : [added ? `${added}개 기록` : '', filled ? `${filled}개 영양정보 채움` : ''];
  showToast(`${mealLabel(meal)}${en ? ': ' : '에 '}${parts.filter(Boolean).join(', ')}`, 'success');
}

document.querySelectorAll('[data-log-meal]').forEach(button => {
  button.addEventListener('click', () => {
    if (!pendingLogLink) return;
    pendingLogLink.meal = button.dataset.logMeal;
    renderLogLinkSheet();
  });
});
document.getElementById('log-link-save')?.addEventListener('click', event => runButtonAction(event.currentTarget, savePendingLogLink));
document.getElementById('log-link-cancel')?.addEventListener('click', closeLogLinkSheet);
document.getElementById('log-link-x')?.addEventListener('click', closeLogLinkSheet);
logLinkModal?.addEventListener('click', event => { if (event.target === logLinkModal) closeLogLinkSheet(); });

/* ============================
   맥 미니 브리지(집 와이파이) 자동 영양 채우기 — bridge.js
   - 빠른 입력/채팅으로 저장한 '영양정보 미입력' 음식의 이름·양만 맥 미니로 보내고,
     받은 값(AI 추정)으로 그 기록을 바로 채움. 연결이 안 되면 대기 → 앱을 열거나 다시 볼 때 재시도.
   - 텔레그램 'AI에게 물어보기'는 그대로 대체 방법으로 남김.
   ============================ */
let bridgeProcessing = false;
let bridgeRerun = false;
let bridgeAnnounce = false;
let bridgeRunPromise = null;
let bridgeListenersReady = false;

function bridgeItemsFrom(foods) {
  return (foods || [])
    .filter(food => food?.name && isNutritionMissing(food))
    .map(food => ({ name: food.name, serving: food.serving || '' }));
}

/* 저장 직후 호출: 브리지가 설정돼 있고 미입력 음식이 있으면 대기 목록에 넣고 바로 시도. 반환: 넣었는지 */
function queueBridgeLookup(mealId, foods, date = currentDate) {
  if (!globalThis.RebuildersBridge?.isConfigured()) return false;
  const items = bridgeItemsFrom(foods);
  if (!items.length) return false;
  const job = RebuildersBridge.enqueue({ date: dateKey(date), meal: mealId, items });
  if (!job) return false;
  renderBridgePending();
  processBridgeQueue({ announce: true });
  return true;
}

/* list(해당 끼니 foods 배열)에서 이름이 같은 미입력 기록을 찾아 채움. 반환: 채운 개수 */
function fillFoodsFromBridge(list, found, records = []) {
  let filled = 0;
  found.forEach(({ name, fields }) => {
    const idx = list.findIndex(existing => isNutritionMissing(existing) && compactFoodName(existing.name) === compactFoodName(name));
    if (idx < 0) return; // 그사이 지웠거나 직접 채웠으면 건드리지 않음
    const existing = list[idx];
    const { displayName, ...rest } = fields;
    // 제목 = 공식 브랜드+메뉴명(양·괄호 없음), 양 = 따로(사용자가 적은 양 우선), 영양 = kcal·탄·단·지
    const next = { ...existing, ...rest, name: displayName || existing.name };
    if (displayName && displayName !== existing.name) next.inputName = existing.name;
    if (existing.serving) next.serving = existing.serving;
    if (existing.slot !== undefined) next.slot = existing.slot;
    list[idx] = next;
    records.push(next);
    filled += 1;
  });
  return filled;
}

/* 이름만 저장됐던 최근 음식을 AI가 채운 값으로 바꿈(같은 이름 중복은 정리) */
async function refreshRecentAfterBridge(records) {
  if (!records.length) return;
  let list = RECENT_FOODS.map(food => ({ ...food }));
  let changed = false;
  records.forEach(record => {
    const original = record.inputName || record.name;
    const idx = list.findIndex(item => isNutritionMissing(item) && compactFoodName(item.name) === compactFoodName(original));
    if (idx < 0) return;
    const { slot, _isNew, ...clean } = record;
    list[idx] = clean;
    list = list.filter((item, i) => i === idx || item.name !== clean.name);
    changed = true;
  });
  if (!changed) return;
  RECENT_FOODS = await storageRepository.replaceRecentFoods(list);
  renderRecentFoods();
}

async function applyBridgeResult(job, result) {
  const found = result.items
    .map(item => ({ name: item?.name, fields: RebuildersBridge.toFoodFields(item) }))
    .filter(entry => entry.name && entry.fields);
  if (!found.length) return 0;
  if (job.date === dateKey(currentDate)) {
    const before = snapshotMeals();
    const records = [];
    const filled = fillFoodsFromBridge(meals[job.meal].foods, found, records);
    if (filled) {
      renderAll(false);
      await persistMealsOrRestore(before);
      if (activeMealPageContext) renderMealPage();
      await refreshRecentAfterBridge(records);
    }
    return filled;
  }
  const day = await storageRepository.getDay(job.date);
  const list = (day?.[job.meal] || []).map(food => ({ ...food }));
  const records = [];
  const filled = fillFoodsFromBridge(list, found, records);
  if (filled) {
    const next = { ...day, [job.meal]: list };
    await storageRepository.saveDay(job.date, next);
    if (statsCache) statsCache[job.date] = next;
    await refreshRecentAfterBridge(records);
  }
  return filled;
}

function bridgeStopMessage(kind) {
  const en = ACTIVE_LOCALE === 'en';
  if (kind === 'unreachable') return en ? 'Cannot reach the Mac mini. It will fill in when you open the app on home Wi-Fi.' : '맥 미니에 연결이 안 돼 대기 중이에요. 집 와이파이에서 앱을 열면 자동으로 채워요.';
  if (kind === 'unauthorized') return en ? 'The Mac mini token does not match. Check it in Settings.' : '맥 미니 연결 토큰이 맞지 않아요. 설정에서 확인해 주세요.';
  return en ? 'The AI could not answer right now. It will try again later.' : 'AI가 지금 답을 못 했어요. 조금 뒤에 다시 시도할게요.';
}

/* 대기 목록을 한 번 훑어 처리. 반환: { filled, stopKind } */
async function runBridgeQueueOnce({ announce = false } = {}) {
  if (!RebuildersBridge.isConfigured() || !RebuildersBridge.getQueue().length) return { filled: 0, stopKind: '' };
  bridgeProcessing = true;
  renderBridgePending();
  let total = 0;
  let stopKind = '';
  const failedNames = [];
  try {
    for (const job of RebuildersBridge.getQueue()) {
      try {
        const result = await RebuildersBridge.lookup(job);
        total += await applyBridgeResult(job, result);
        RebuildersBridge.removeJob(job.id);
        failedNames.push(...result.failed);
      } catch (error) {
        const kind = error instanceof RebuildersBridge.BridgeError ? error.kind : 'error';
        stopKind = kind;
        // 집 밖(연결 안 됨)·토큰 오류는 그대로 남겨두고 다음에, AI 실패·시간 초과는 몇 번까지만 다시
        if (kind === 'unreachable' || kind === 'unauthorized') break;
        RebuildersBridge.bumpAttempt(job.id);
      }
    }
  } finally {
    bridgeProcessing = false;
    renderBridgePending();
  }
  const en = ACTIVE_LOCALE === 'en';
  if (total) showToast(en ? `AI filled in nutrition for ${total} (AI estimate)` : `AI가 ${total}개 영양성분을 채웠어요 (AI 추정)`, 'success');
  if (failedNames.length && announce) {
    showToast(en ? `Could not find: ${failedNames.join(', ')}. Please enter it yourself.` : `${failedNames.join(', ')}은(는) 못 찾았어요. 직접 입력해 주세요.`, 'info');
  } else if (!total && announce && stopKind) {
    showToast(bridgeStopMessage(stopKind), stopKind === 'unauthorized' ? 'error' : 'info');
  }
  return { filled: total, stopKind };
}

/* 대기 목록 처리(이미 도는 중이면 같은 작업을 기다림). 반환: 채운 개수 */
function processBridgeQueue({ announce = false } = {}) {
  if (!globalThis.RebuildersBridge) return Promise.resolve(0);
  if (announce) bridgeAnnounce = true;
  if (bridgeRunPromise) { bridgeRerun = true; return bridgeRunPromise; }
  if (!RebuildersBridge.isConfigured() || !RebuildersBridge.getQueue().length) {
    bridgeAnnounce = false;
    renderBridgePending();
    return Promise.resolve(0);
  }
  bridgeRunPromise = (async () => {
    let total = 0;
    do {
      bridgeRerun = false;
      const announceNow = bridgeAnnounce;
      bridgeAnnounce = false;
      const { filled, stopKind } = await runBridgeQueueOnce({ announce: announceNow });
      total += filled;
      if (stopKind === 'unreachable' || stopKind === 'unauthorized') break;
    } while (bridgeRerun);
    return total;
  })().finally(() => {
    bridgeRunPromise = null;
    bridgeRerun = false;
    renderBridgePending();
  });
  return bridgeRunPromise;
}

/* 'AI에게 물어보기'(브리지 설정 시): 텔레그램·클립보드 없이 맥 미니에 바로 물어보고 기록을 채움.
   - query: 음식 추가 검색에서 누른 경우 → 이름만 먼저 저장하고 채움
   - 그 외(채팅·수정 시트): 이미 저장된 '미입력' 기록을 이름으로 찾아 채움 */
async function askBridgeForFoods(mealId, items, { button, query, afterFill } = {}) {
  if (button?.dataset.bridgeBusy === 'true') return;
  const en = ACTIVE_LOCALE === 'en';
  const label = button?.textContent;
  if (button) {
    button.dataset.bridgeBusy = 'true';
    button.disabled = true;
    button.classList.add('is-busy');
    button.textContent = en ? 'AI is finding…' : 'AI가 찾는 중…';
  }
  try {
    let filled = 0;
    if (query) {
      const saved = await submitQuickRecord(query);
      if (saved) filled = await processBridgeQueue({ announce: true });
    } else {
      const clean = (items || []).filter(item => item?.name).slice(0, 8);
      if (!clean.length || !RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: mealId, items: clean })) return;
      renderBridgePending();
      filled = await processBridgeQueue({ announce: true });
    }
    if (filled && afterFill) afterFill();
  } catch (error) {
    showStorageFailure(error);
  } finally {
    if (button) {
      delete button.dataset.bridgeBusy;
      button.disabled = false;
      button.classList.remove('is-busy');
      if (label) button.textContent = label;
    }
  }
}

function renderBridgePending() {
  const el = document.getElementById('bridge-pending');
  if (!el || !globalThis.RebuildersBridge) return;
  const count = RebuildersBridge.getQueue().reduce((sum, job) => sum + job.items.length, 0);
  const en = ACTIVE_LOCALE === 'en';
  el.hidden = !count;
  el.classList.toggle('is-working', bridgeProcessing);
  const photo = typeof bridgePhotoBusy !== 'undefined' && bridgePhotoBusy;
  el.hidden = !count && !photo;
  el.classList.toggle('is-working', bridgeProcessing || photo);
  el.textContent = photo ? (en ? 'AI is looking at the photo…' : 'AI가 사진 보는 중…') : bridgeProcessing ? (en ? 'AI is finding…' : 'AI가 찾는 중…') : (en ? `AI waiting ${count}` : `AI 대기 ${count}`);
  el.setAttribute('aria-label', en
    ? `${count} foods waiting for the Mac mini AI. Tap to try again.`
    : `맥 미니 AI가 채울 음식 ${count}개 대기 중. 누르면 다시 시도해요.`);
}

function renderBridgeSettings(message = '') {
  if (!globalThis.RebuildersBridge) return;
  const { url, token } = RebuildersBridge.getConfig();
  const urlInput = document.getElementById('bridge-url');
  const tokenInput = document.getElementById('bridge-token');
  const en = ACTIVE_LOCALE === 'en';
  if (urlInput && document.activeElement !== urlInput) urlInput.value = url;
  if (tokenInput && document.activeElement !== tokenInput) {
    tokenInput.value = '';
    tokenInput.placeholder = token
      ? (en ? 'Saved (enter a new one to change)' : '저장됨 (바꾸려면 새로 입력)')
      : (en ? 'Contents of the token file on the Mac' : '맥 미니 token 파일 내용');
  }
  const hint = document.getElementById('bridge-hint');
  if (hint) {
    hint.hidden = !message;
    hint.textContent = message;
  }
}

function saveBridgeSettingsFromInputs() {
  const en = ACTIVE_LOCALE === 'en';
  const rawUrl = document.getElementById('bridge-url')?.value.trim() || '';
  const rawToken = document.getElementById('bridge-token')?.value.trim() || '';
  if (rawUrl && !RebuildersBridge.normalizeUrl(rawUrl)) return en ? 'Check the Mac mini address.' : '맥 미니 주소를 확인해 주세요.';
  if (rawToken && !RebuildersBridge.normalizeToken(rawToken)) return en ? 'Check the token (letters, numbers, - and _).' : '토큰을 확인해 주세요(영문·숫자·-·_).';
  RebuildersBridge.setConfig({ url: rawUrl, ...(rawToken ? { token: rawToken } : {}) });
  if (!rawUrl) RebuildersBridge.setConfig({ token: '' });
  return '';
}

function setupBridge() {
  const dock = document.getElementById('home-ai-dock');
  if (dock) dock.hidden = activeView !== 'home';
  document.body.classList.toggle('has-ai-dock', activeView === 'home');
  renderBridgeSettings();
  renderBridgePending();
  processBridgeQueue();
  if (bridgeListenersReady) return;
  bridgeListenersReady = true;
  const en = () => ACTIVE_LOCALE === 'en';
  document.getElementById('bridge-save')?.addEventListener('click', () => {
    const error = saveBridgeSettingsFromInputs();
    const configured = RebuildersBridge.isConfigured();
    renderBridgeSettings(error || (configured
      ? (en() ? 'Saved. New entries will be filled in automatically at home.' : '저장했어요. 이제 집 와이파이에서 기록하면 자동으로 채워져요.')
      : (RebuildersBridge.getConfig().url
        ? (en() ? 'Address saved. Enter the token too.' : '주소를 저장했어요. 토큰도 넣어주세요.')
        : (en() ? 'Mac mini connection removed.' : '맥 미니 연결을 지웠어요.'))));
    renderBridgePending();
    if (!error && configured) processBridgeQueue();
  });
  document.getElementById('bridge-check')?.addEventListener('click', event => runButtonAction(event.currentTarget, async () => {
    const error = saveBridgeSettingsFromInputs();
    if (error) { renderBridgeSettings(error); return; }
    renderBridgeSettings(en() ? 'Checking…' : '확인 중…');
    const state = await RebuildersBridge.checkConnection();
    const messages = {
      ok: en() ? 'Connected to the Mac mini.' : '맥 미니와 연결됐어요.',
      unauthorized: en() ? 'Address OK, but the token does not match.' : '주소는 맞는데 토큰이 달라요.',
      unreachable: en() ? 'Cannot reach it. Check home Wi-Fi, the address, and Local Network permission.' : '연결이 안 돼요. 집 와이파이, 주소, 로컬 네트워크 권한을 확인해 주세요.',
      timeout: en() ? 'No answer (timeout).' : '응답이 없어요(시간 초과).',
      not_configured: en() ? 'Enter the address first.' : '주소를 먼저 넣어주세요.',
    };
    renderBridgeSettings(messages[state] || (en() ? 'Could not check the connection.' : '연결을 확인하지 못했어요.'));
    if (state === 'ok') processBridgeQueue({ announce: true });
  }));
  document.getElementById('bridge-pending')?.addEventListener('click', () => processBridgeQueue({ announce: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) processBridgeQueue(); });
  window.addEventListener('online', () => processBridgeQueue());
  setInterval(() => { if (!document.hidden && RebuildersBridge.getQueue().length) processBridgeQueue(); }, 120000);
  const cap = globalThis.Capacitor;
  const appPlugin = cap?.isNativePlatform?.() ? (cap.Plugins?.App || cap.registerPlugin?.('App')) : null;
  appPlugin?.addListener?.('appStateChange', state => { if (state?.isActive) processBridgeQueue(); });
}

function setupDeepLinks() {
  renderAiLookupSettings();
  const cap = globalThis.Capacitor;
  if (!cap?.isNativePlatform?.()) return;
  const appPlugin = cap.Plugins?.App || cap.registerPlugin?.('App');
  if (!appPlugin) return;
  appPlugin.addListener?.('appUrlOpen', event => handleIncomingLogUrl(event?.url));
  appPlugin.getLaunchUrl?.().then(result => { if (result?.url) handleIncomingLogUrl(result.url); }).catch(() => {});
}

async function initializeApp() {
  const modeState = await initializeStorageRepository();
  updateLocalModeStatus(modeState);
  // 브라우저가 저장 공간을 임의로 지우지 않도록 요청(결과와 상관없이 앱은 계속 동작).
  NiliriStorage.requestPersistentStorage();
  await loadSettings();
  await loadCustomFoods();
  await loadShopping();
  await migrateLegacyEntriesOnce();
  await loadCurrentDay();
  statsCache = await loadStorage();
  setupTimeControls();
  updateDateDisplay();
  renderQuickFoods(getFoodEntries());
  renderRecentFoods();
  updateProfileUI();
  updateLevelMessage('hungry');
  applyLanguage(false);
  renderShopping();
  displayedCalories = 0;
  setRingVisual(0);
  renderAll(false);
  setupAppModeUi();
  setupReminderUi();
  setupHealthUi();
  setupDeepLinks();
  setupBridge();
  showAppScreen();
  document.body.classList.add('app-ready'); motionOnReady(); setTimeout(() => FoodSearch.build().catch(() => {}), 300);
  registerServiceWorker();
}

async function refreshLocalDay() {
  if (!LOCAL_MODE || document.hidden || !(storageRepository instanceof NiliriStorage.LocalApiStorage)) return;
  try {
    const all = await loadStorage();
    applyCurrentDayData(all[dateKey(currentDate)] || {});
    CUSTOM_FOODS = all.customFoods || {};
    RECENT_FOODS = all.recentFoods || [];
    statsCache = all;
    renderAll(false);
    renderRecentFoods();
    if (activeView === 'search') renderSearchHub();
    updateLocalModeStatus('local');
  } catch (error) {
    updateLocalModeStatus('offline');
    console.warn('로컬 서버 동기화 실패:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const retryButton = document.getElementById('storage-retry');
  retryButton?.addEventListener('click', async () => {
    if (retryButton.disabled) return;
    const original = retryButton.textContent;
    setButtonPending(retryButton, true);
    retryButton.textContent = ACTIVE_LOCALE === 'en' ? 'Checking…' : '확인 중…';
    try {
      await initializeApp();
    } catch (error) {
      showStorageUnavailable(error);
    } finally {
      retryButton.textContent = original;
      setButtonPending(retryButton, false);
    }
  });

  try {
    await initializeApp();
    if (LOCAL_MODE) setInterval(refreshLocalDay, 5000);
  } catch (error) {
    updateLocalModeStatus(LOCAL_MODE ? 'offline' : 'web');
    showStorageUnavailable(error);
  }
});

/* ============================
   가벼운 움직임: transform·opacity 만 (GPU), 150–350ms, 동작 줄이기 설정이면 끔
   ============================ */
function reduceMotion() {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}
// 페이지가 보일 때 한 번만: 카드·끼니 줄이 살짝 아래에서 차례로 (다시 그릴 때는 안 함)
function playPageEnter(panel) {
  if (!panel || reduceMotion()) return;
  const items = (panel.id === 'view-home'
    ? [...panel.querySelectorAll('.date-header, .meal-card, .snack-card, .day-summary')]
    : [...panel.children]).filter(el => !el.hidden && el.offsetParent !== null).slice(0, 10);
  clearTimeout(panel._staggerTimer);
  items.forEach((el, i) => { el.classList.remove('stagger-in'); el.style.setProperty('--stagger', String(i)); });
  void panel.offsetWidth;
  items.forEach(el => el.classList.add('stagger-in'));
  panel._staggerTimer = setTimeout(() => items.forEach(el => { el.classList.remove('stagger-in'); el.style.removeProperty('--stagger'); }), 900);
}
// 위쪽 탭 밑줄: 고른 탭으로 미끄러짐 (translateX + scaleX)
function movePageTabIndicator(instant = false) {
  const nav = document.getElementById('page-tabs');
  if (!nav) return;
  let bar = nav.querySelector('.page-tab-indicator');
  if (!bar) {
    bar = document.createElement('span');
    bar.className = 'page-tab-indicator';
    bar.setAttribute('aria-hidden', 'true');
    nav.appendChild(bar);
    instant = true;
  }
  const tab = nav.querySelector('.page-tab.active');
  if (!tab || !tab.offsetWidth) { bar.style.opacity = '0'; return; }
  if (instant) bar.classList.add('no-anim');
  bar.style.opacity = '1';
  // 밑줄: 아이콘 왼쪽 끝 ~ 글자 오른쪽 끝 (글자 위치는 그대로, 밑줄만 왼쪽으로 늘어남)
  const icon = tab.querySelector('.page-tab-icon');
  const iconLeft = icon && icon.offsetWidth ? Math.min(0, icon.offsetLeft) : 0;
  const left = tab.offsetLeft + iconLeft;
  const width = tab.offsetWidth - iconLeft;
  bar.style.transform = `translateX(${left}px) scaleX(${width / 100})`;
  if (instant) { void bar.offsetWidth; requestAnimationFrame(() => bar.classList.remove('no-anim')); }
}
let motionReadyDone = false;
function motionOnReady() {
  if (motionReadyDone) return;
  motionReadyDone = true;
  movePageTabIndicator(true);
  playPageEnter(visiblePanel());
  document.fonts?.ready?.then(() => movePageTabIndicator(true)).catch?.(() => {});
}
addEventListener('resize', () => movePageTabIndicator(true));

/* 식도감 필터 칩 */
document.querySelectorAll('[data-foodex-filter]').forEach(button => {
  button.addEventListener('click', () => {
    foodexFilter = ['recent', 'frequent'].includes(button.dataset.foodexFilter) ? button.dataset.foodexFilter : 'all';
    searchIndexCategory = null;
    renderSearchHub();
  });
});
/* 리포트 일/주/월: 일 = 달력+고른 날, 주 = 달력(2주)+최근 7일, 월 = 달력 전체+이번 달 요약. 고른 기간은 기기에 기억 */
const REPORT_RANGE_KEY = 'rebuilders.reportRange.v1';
let reportRange = (() => { try { const v = localStorage.getItem(REPORT_RANGE_KEY); return ['day', 'week', 'month'].includes(v) ? v : 'day'; } catch { return 'day'; } })();
function applyReportRange(range = reportRange, save = false) {
  reportRange = ['day', 'week', 'month'].includes(range) ? range : 'day';
  if (save) { try { localStorage.setItem(REPORT_RANGE_KEY, reportRange); } catch {} }
  const view = document.getElementById('view-stats');
  if (view) view.dataset.reportRange = reportRange;
  document.querySelectorAll('[data-report-range]').forEach(button => {
    const on = button.dataset.reportRange === reportRange;
    button.classList.toggle('active', on);
    button.setAttribute('aria-selected', String(on));
  });
  statsCalendarExpanded = reportRange === 'month';
  try { renderStatsCalendar(); } catch {}
}
document.querySelectorAll('[data-report-range]').forEach(button => {
  button.addEventListener('click', () => applyReportRange(button.dataset.reportRange, true));
});
{
  const labels = { day: ['일', 'Day'], week: ['주', 'Week'], month: ['월', 'Month'] };
  const chips = { all: ['전체', 'All'], recent: ['최근 먹은', 'Recent'], frequent: ['자주 먹은', 'Frequent'] };
  const en = typeof ACTIVE_LOCALE !== 'undefined' && ACTIVE_LOCALE === 'en';
  document.querySelectorAll('[data-report-range]').forEach(b => { b.textContent = labels[b.dataset.reportRange][en ? 1 : 0]; });
  document.querySelectorAll('[data-foodex-filter]').forEach(b => { b.textContent = chips[b.dataset.foodexFilter][en ? 1 : 0]; });
  const view = document.getElementById('view-stats');
  if (view) view.dataset.reportRange = reportRange;
  document.querySelectorAll('[data-report-range]').forEach(b => { const on = b.dataset.reportRange === reportRange; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
  statsCalendarExpanded = reportRange === 'month';
}

var suppressPageEnter = false;
/* ============================
   FLIP: 다시 그리기 전후 위치를 재서 옮겨진 음식 줄·끼니 카드가 실제로 움직여 자리 잡게 (transform 만)
   ============================ */
function flipKeyedElements() {
  const out = new Map();
  document.querySelectorAll('#view-home .food-item[data-food-id]').forEach(el => out.set('f:' + el.dataset.foodId, el));
  document.querySelectorAll('#view-home .meal-card, #view-home .snack-card, #view-home .day-clear-row, #view-home .day-summary').forEach((el, i) => out.set('c:' + (el.id || el.className + i), el));
  return out;
}
function flipSnapshot() {
  const snap = new Map();
  if (reduceMotion() || activeView !== 'home') return snap;
  flipKeyedElements().forEach((el, key) => {
    const r = el.getBoundingClientRect();
    if (r.width || r.height) snap.set(key, r);
  });
  // 끌어서 놓은 경우: 손가락 아래 떠 있던 복제본 위치에서 출발
  const ghost = document.querySelector('.food-drag-ghost[data-food-id]');
  if (ghost) snap.set('f:' + ghost.dataset.foodId, ghost.getBoundingClientRect());
  return snap;
}
function flipPlay(snap) {
  if (!snap?.size || reduceMotion()) return;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  flipKeyedElements().forEach((el, key) => {
    const before = snap.get(key);
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    if (!before) {
      if (key.startsWith('f:')) el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: ease });
      return;
    }
    const dx = before.left - r.left; const dy = before.top - r.top;
    const isCard = key.startsWith('c:');
    // 카드 높이가 바뀌면 위·아래로 살짝 늘어나듯(scaleY 는 글자를 찌그러뜨려서 대신 위치만 부드럽게)
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    el.animate([
      { transform: `translate(${dx}px, ${dy}px)`, ...(isCard ? {} : { zIndex: 5 }) },
      { transform: 'none', ...(isCard ? {} : { zIndex: 5 }) },
    ], { duration: 350, easing: ease });
  });
}
function withFlip(render) {
  const snap = flipSnapshot();
  render();
  try { flipPlay(snap); } catch (error) { console.warn('flip', error); }
}
/* 최근 대화 버튼(입력창 왼쪽) + 시트 아래로 밀어 닫기 */
document.getElementById('ai-dock-history')?.addEventListener('click', () => {
  const panel = document.getElementById('ai-dock-panel');
  setAiDockPanel(!panel || panel.hidden || !panel.classList.contains('is-open'));
});
(function setupSheetSwipeDown() {
  const panel = document.getElementById('ai-dock-panel');
  if (!panel) return;
  let y0 = null; let dy = 0;
  panel.addEventListener('touchstart', event => {
    const log = document.getElementById('agent-log');
    if (event.touches.length !== 1 || (log && log.contains(event.target) && log.scrollTop > 0)) { y0 = null; return; }
    y0 = event.touches[0].clientY; dy = 0;
  }, { passive: true });
  panel.addEventListener('touchmove', event => {
    if (y0 == null) return;
    dy = Math.max(0, event.touches[0].clientY - y0);
    if (dy > 0) { panel.style.transition = 'none'; panel.style.transform = `translateY(${dy}px)`; if (event.cancelable) event.preventDefault(); }
  }, { passive: false });
  panel.addEventListener('touchend', () => {
    if (y0 == null) return;
    y0 = null;
    panel.style.transition = '';
    if (dy > 80) setAiDockPanel(false);
    else panel.style.transform = '';
  }, { passive: true });
})();

/* ============================
   공용 세그먼트(.rb-seg): 회색 알약 트랙 + 흰 선택 칸이 미끄러짐. 기존 버튼·active 클래스는 그대로 두고 위에 얹음
   ============================ */
function segmentedActive(seg) {
  return [...seg.querySelectorAll(':scope > button')].find(b => b.offsetParent !== null && (b.classList.contains('active') || b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true'));
}
function syncSegmented(seg, instant = false) {
  if (!seg || !seg.offsetWidth) return;
  let thumb = seg.querySelector(':scope > .rb-seg-thumb');
  if (!thumb) {
    thumb = document.createElement('span');
    thumb.className = 'rb-seg-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    seg.prepend(thumb);
    instant = true;
  }
  const active = segmentedActive(seg);
  if (!active) { thumb.style.opacity = '0'; return; }
  if (instant) thumb.classList.add('no-anim');
  thumb.style.opacity = '1';
  thumb.style.width = `${active.offsetWidth}px`;
  thumb.style.transform = `translateX(${active.offsetLeft}px)`;
  if (instant) { void thumb.offsetWidth; requestAnimationFrame(() => thumb.classList.remove('no-anim')); }
}
function syncAllSegmented(instant = false) {
  document.querySelectorAll('.rb-seg').forEach(seg => syncSegmented(seg, instant));
}
document.querySelectorAll('.rb-seg').forEach(seg => {
  new MutationObserver(() => syncSegmented(seg)).observe(seg, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-pressed'] });
});
addEventListener('resize', () => syncAllSegmented(true));
document.fonts?.ready?.then(() => syncAllSegmented(true)).catch?.(() => {});
setTimeout(() => syncAllSegmented(true), 0);
