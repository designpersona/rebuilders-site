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
    search: '검색', recent: '최근', custom: '직접 등록', myProducts: '내 제품', library: '음식사전', ai: 'AI', chat: '채팅', shoppingNav: '내 냉장고',
    home: '홈', stats: '통계', profile: '내정보',
    searchOnlyTitle: '음식 검색', searchOnlyKicker: '검색',
    fridgeTitle: '내 냉장고', fridgeKicker: '냉장고',
    foodexNav: '음식사전', foodexTab: 'Foodex', recipeTab: '레시피',
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
    searchHubTitle: '푸드피디아', foodIndex: 'Foodex', foodIndexAction: 'Foodex 열기 ↗', collection: '내 컬렉션', shopping: '장보기', searchLibraryNote: '내장 음식과 직접 등록한 음식을 검색합니다.',
    clearDay: '전체 삭제', statsTitle: '식단 리포트', statsSub: '달력으로 기록과 추이를 살펴보세요', snackWhen: '언제 먹었나요?',
    statsSelectedDay: '선택한 날', statsCalories: '칼로리', statsCarbs: '탄수화물', statsProtein: '단백질', statsFat: '지방', statsUnder: '여유', statsOnTarget: '적정', statsOver: '초과', statsEmpty: '이 날에는 기록이 없어요.', statsWeekTitle: '최근 7일 섭취 칼로리', statsWeekHint: '진한 선 최근 7일 · 연한 선 이전 7일 · 점선 목표', statsMonthTitle: '이번 달 요약', statsLoggedDays: '기록 일수', statsAverage: '평균 kcal', statsUnderDays: '목표 이내 기록일',
    collectionRecipes: '내 레시피', collectionProducts: '내 제품', collectionFridge: '내 냉장고', collectionMacros: '탄·단·지', collectionDelete: '삭제', collectionDeleteTitle: '컬렉션 삭제', collectionExpand: '재료 펼쳐보기', collectionCollapse: '재료 접어두기', foodexClose: 'Foodex 닫기', foodexViewOptions: 'Foodex 정렬과 보기 방식', foodexSort: '정렬', foodexFoodSort: '음식 정렬',
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
    search: 'Search', recent: 'Recent', custom: 'Custom', myProducts: 'My products', library: 'Foodpedia', ai: 'AI', chat: 'Chat', shoppingNav: 'My fridge',
    home: 'Home', stats: 'Stats', profile: 'Profile',
    searchOnlyTitle: 'Food search', searchOnlyKicker: 'Search',
    fridgeTitle: 'My fridge', fridgeKicker: 'Fridge',
    foodexNav: 'Foodpedia', foodexTab: 'Foodex', recipeTab: 'Recipes',
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
    searchHubTitle: 'Foodpedia', foodIndex: 'Foodex', foodIndexAction: 'Go Foodex ↗', collection: 'Collection', shopping: 'Shopping', searchLibraryNote: 'Search built-in foods and foods you registered.',
    clearDay: 'Delete all', statsTitle: 'Meal report', statsSub: 'Review your records and trends on the calendar', snackWhen: 'When did you eat it?',
    statsSelectedDay: 'Selected day', statsCalories: 'Calories', statsCarbs: 'Carbs', statsProtein: 'Protein', statsFat: 'Fat', statsUnder: 'Under', statsOnTarget: 'On target', statsOver: 'Over', statsEmpty: 'No meal log for this day.', statsWeekTitle: 'Calories eaten in the last 7 days', statsWeekHint: 'Dark: last 7 days · Light: previous 7 days · Dashed: target', statsMonthTitle: 'This month', statsLoggedDays: 'Days logged', statsAverage: 'Average kcal', statsUnderDays: 'Days at or under target',
    collectionRecipes: 'My recipes', collectionProducts: 'My products', collectionFridge: 'My fridge', collectionMacros: 'Carbs·Protein·Fat', collectionDelete: 'Delete', collectionDeleteTitle: 'Delete collection', collectionExpand: 'Expand ingredients', collectionCollapse: 'Collapse ingredients', foodexClose: 'Close Foodex', foodexViewOptions: 'Foodex sorting and view options', foodexSort: 'Sort', foodexFoodSort: 'Sort foods',
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
    '#view-search .search-index-intro h2': t('foodIndex'),
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
  const macroLabels = [t('carbs'), t('protein'), t('fat')];
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
  showToast(storageErrorMessage(error), 'error');
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
  MEAL_IDS.forEach(id => {
    meals[id].foods = (data[id] || []).map(f => ({ ...f }));
  });
  // snack은 MEAL_IDS에 없지만 별도로 로드
  meals.snack.foods = (data.snack || []).map(f => ({ ...f }));
  mealTimes = normaliseMealTimes(data.mealTimes);
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
  if (badge) {
    badge.textContent = today ? (ACTIVE_LOCALE === 'en' ? 'Today' : '오늘') : '';
    badge.hidden = !today;
  }
  if (goToday) goToday.hidden = today;
  // 홈 건강 카드도 선택한 날짜로(연결 안 했으면 아무 일 없음)
  if (typeof refreshHeartRate === 'function' && globalThis.RebuildersHealth?.isConnected()) refreshHeartRate();
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

  label('.bottom-nav', '하단 네비게이션', 'Bottom navigation');
  label('#nav-home', '홈', 'Home');
  label('#nav-search', '음식사전', 'Foodpedia');
  label('#nav-stats', '통계', 'Stats');
  label('#nav-chat', '채팅', 'Chat');
  label('#nav-shopping', '내 냉장고', 'My fridge');
  label('#foodex-tab-index', 'Foodex', 'Foodex');
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
  set('#tab-recent .quick-add-label', '최근 음식', 'Recent foods');
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
    ['Register a new food', 'If it is not in Foodex, select Register manually, review nutrition, and save it.'],
    ['Log from an AI messaging app', 'Open the agent chat → confirm Rebuilders is connected → send meal, food, and amount → check the saved reply.'],
  ] : [
    ['앱 채팅으로 기록', '“아침 바나나”, “점심 이삭 햄치즈, 아아”처럼 끼니와 음식만 짧게 적어도 돼요. 쉼표·랑·하고로 여러 개를 한 번에 기록해요.'],
    ['저장 결과 확인', '완료 메시지에 끼니와 음식이 표시되면 오늘 식단에 기록된 상태예요.'],
    ['새 음식 등록', 'Foodex에 없는 음식은 이름만 먼저 저장돼요. 영양정보는 나중에 기록 상세에서 채우면 돼요.'],
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
  set('#foodex-library-title', '음식사전', 'Foodpedia');
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
      ? 'Try "breakfast banana" or "lunch toast, iced americano".'
      : '"아침 바나나", "점심 햄치즈 토스트, 아아"처럼 짧게 써도 돼요.';
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

function setRingVisual(cal) {
  const roundedCal = Math.round(cal);
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

function updateRing(totals, animate = false) {
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
  const duration = 850;
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
  const duration = 850;
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
  div.tabIndex = 0;
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `${visibleName} ${ACTIVE_LOCALE === 'en' ? 'nutrition details' : '제품 정보 보기'}`);
  div.innerHTML = `
    <button type="button" class="food-drag-handle" aria-label="${escapeHtml(dragLabel)}" title="${ACTIVE_LOCALE === 'en' ? 'Drag to move' : '드래그해서 이동'}">${dragHandleSvg()}</button>
    <div class="food-main">
      <span class="food-name">${escapeHtml(visibleName)}</span>
      <div class="food-detail-line">
        <span class="food-cal">${foodCalText(food)}</span>
        <div class="food-macros">${isNutritionMissing(food) ? `<span class="macro-tag nutrition-missing-tag">${escapeHtml(nutritionMissingLabel())}</span>` : ''}${nutritionTags(food)}</div>
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
        () => openFoodEdit(mealId, idx),
        () => removeFood(mealId, idx),
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
        () => openFoodEdit('snack', idx),
        () => removeFood('snack', idx),
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
      () => openFoodEdit(mealId, idx),
      () => removeFood(mealId, idx),
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
      Object.entries(meals).map(([id, meal]) => [id, meal.foods.map(food => ({ ...food }))])
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

async function removeFood(mealId, idx) {
  const before = snapshotMeals();
  meals[mealId].foods.splice(idx, 1);
  if (mealId === 'snack') {
    const slot = before.foods.snack[idx]?.slot ?? 3;
    if (!snackFoodsForSlot(slot).length) resetCardTime('snack', slot);
  } else if (!meals[mealId].foods.length) {
    resetCardTime(mealId);
  }
  renderAll(false);
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
  renderAll(false);
  await persistMealsOrRestore(before);
}

async function addFood(mealId, foodData) {
  const before = snapshotMeals();
  const data = { ...foodData, _isNew: true };
  // 간식이면 현재 선택된 슬롯을 자동으로 태깅
  if (mealId === 'snack') data.slot = currentSnackSlot;
  const destinationSlot = mealId === 'snack' ? currentSnackSlot : null;
  const wasEmpty = mealId === 'snack'
    ? !snackFoodsForSlot(currentSnackSlot).length
    : !meals[mealId].foods.length;
  meals[mealId].foods.push(data);
  setAutoTimeForFirstFood(mealId, mealId === 'snack' ? currentSnackSlot : null, wasEmpty);
  renderAll(false);
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
  renderAll(false);
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

async function swapMealFoods(a, b) {
  if (a === b) return;
  const before = snapshotMeals();
  const tmp = meals[a].foods;
  meals[a].foods = meals[b].foods;
  meals[b].foods = tmp;
  const time = mealTimes[a];
  mealTimes[a] = mealTimes[b];
  mealTimes[b] = time;
  renderAll(false);
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

  renderAll(false);
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

  renderAll(false);
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
      }

      if (!drag) return;
      drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
      drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
      document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
      const { target, dest } = destinationAtPoint(event.clientX, event.clientY);
      if (target && target !== drag.card) {
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

  renderAll(false);
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

  const sectionLabel = ACTIVE_LOCALE === 'en'
    ? (q ? 'My foods · Built-in (local)' : 'My foods · Built-in')
    : (q ? '내 음식 · 기본 (로컬)' : '내 음식 · 기본');
  renderFoodSection(container, sectionLabel, entries, true);
  if (quickButton && !quickFirst) container.appendChild(quickButton);

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
  const container = document.getElementById('recent-foods');
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
    : `${mealLabel(mealId)}에 바로 기록 · ${parsed.items.length}개`)}</span><span class="quick-record-items">${escapeHtml(names)}</span>`;
  button.dataset.singleUnknown = String(parsed.items.length === 1 && !parsed.items[0].known && !parsed.mealExplicit);
  button.addEventListener('click', () => runButtonAction(button, () => submitQuickRecord(query)));
  return button;
}

async function submitQuickRecord(query) {
  const parsed = parseQuickFoodText(query);
  if (!parsed || !parsed.items.length) return false;
  const mealId = quickRecordTarget(parsed);
  if (!mealId) return false;
  if (mealId === 'snack' && currentMeal !== 'snack') currentSnackSlot = getDefaultSnackSlot();
  const foods = parsed.items.map(item => item.food);
  await addFoods(mealId, foods);
  closeModal();
  const missing = foods.filter(isNutritionMissing).length;
  showToast(ACTIVE_LOCALE === 'en'
    ? `Saved ${foods.length} to ${mealLabel(mealId)}${missing ? ` · ${missing} missing nutrition` : ''}`
    : `${mealLabel(mealId)}에 ${foods.length}개 저장${missing ? ` · 영양정보 미입력 ${missing}개` : ''}`, 'info');
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
        : (ACTIVE_LOCALE === 'en' ? `${name} saved and unlocked in Foodex` : `${name} 저장 · 푸덱스 해금`), 'info');
    } else {
      showToast(ACTIVE_LOCALE === 'en' ? `${name} unlocked in Foodex` : `${name} 푸덱스에 해금됨`, 'info');
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
  const visibleName = displayFoodName(referenceFood);
  document.getElementById('food-dex-number').textContent = foodDexNumber(referenceFood);
  const category = foodCategoryMeta(referenceFood.name);
  const hero = document.getElementById('food-dex-icon');
  const imagePath = FOOD_IMAGE_BY_NAME[referenceFood.name];
  hero.replaceChildren();
  hero.classList.toggle('has-food-image', Boolean(imagePath));
  if (imagePath) {
    const image = document.createElement('img');
    image.className = 'food-dex-image';
    image.src = imagePath;
    image.alt = '';
    hero.appendChild(image);
  } else {
    hero.innerHTML = foodIndexIcon(referenceFood.name, category.key);
  }
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
    description.hidden = mode === 'meal';
    description.textContent = ACTIVE_LOCALE === 'en'
      ? (referenceFood.descriptionEn || referenceFood.description || '')
      : (referenceFood.description || '');
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
      ? 'View reference nutrition in Foodex'
      : 'Foodex에서 기준 영양성분 보기');
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
      ${isNutritionMissing(food) ? `<p class="meal-edit-missing-note">${ACTIVE_LOCALE === 'en' ? 'Nutrition not entered yet. Fill in calories, carbs, protein, and fat. Blank values count as 0 in totals.' : '영양정보 미입력 상태예요. 칼로리·탄수화물·단백질·지방을 채워주세요. 비워둔 값은 합계에 0으로 계산돼요.'}</p>` : ''}
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
  if (!imagePath) {
    return '<img class="food-index-image food-index-note" src="assets/icon/buttons/note.svg" alt="" aria-hidden="true" />';
  }
  return `<img class="food-index-image" src="${escapeHtml(imagePath)}" alt="" aria-hidden="true" />`;
}

function renderSearchHub() {
  const results = document.getElementById('search-hub-results');
  const indexGrid = document.getElementById('search-index-grid');
  const categories = document.getElementById('search-index-categories');
  const input = document.getElementById('search-hub-input');
  const foodexInput = document.getElementById('foodex-search-input');
  if (!results || !indexGrid || !categories || !input) return;

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
  const indexEntries = entries.filter(([name, data]) => matchQuery(name, data, foodexQuery));

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

  // Foodex 검색어가 있으면 카테고리 대신 결과 목록
  if (foodexQuery) {
    categories.hidden = true;
    if (!indexEntries.length) {
      indexGrid.innerHTML = `<p class="search-hub-empty">${ACTIVE_LOCALE === 'en' ? 'No matching food in Foodex.' : 'Foodex에서 일치하는 음식이 없어요.'}</p>`;
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

/** 푸드피디아 내부 탭: index(Foodex) | recipe(레시피) */
function setFoodexPageTab(tab = 'index') {
  const library = document.getElementById('foodex-library');
  if (!library) return;
  const next = tab === 'recipe' ? 'recipe' : 'index';
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
  if (next === 'recipe') {
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
  if (view !== 'profile') {
    previousView = view;
  }
  activeMealPageContext = null;
  document.getElementById('view-meal-detail').hidden = true;
  document.body.classList.remove('meal-page-open');
  activeView = view;
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
  });

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
  const compactStart = Math.max(0, Math.min(21, selectedWeekStart - 7));
  const visibleCells = statsCalendarExpanded ? cells : cells.slice(compactStart, compactStart + 21);
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
document.getElementById('foodex-search-input')?.addEventListener('input', () => {
  renderSearchHub();
});
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
  if (kind === 'user') {
    message.innerHTML = `<div class="agent-message-body"><div class="agent-bubble"><span class="agent-bubble-text"></span></div></div>`;
  } else {
    message.innerHTML = `<img class="agent-avatar" src="assets/icon/buttons/robot.svg" width="40" height="40" alt="" decoding="async" aria-hidden="true" /><div class="agent-message-body"><span class="agent-name">${ACTIVE_LOCALE === 'en' ? 'AI Meal Manager' : 'AI 식단관리사'}</span><div class="agent-bubble"><span class="agent-bubble-text"></span></div></div>`;
  }
  setAgentMessageText(message, text);
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
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
  if (mealId === 'snack') currentSnackSlot = getDefaultSnackSlot();
  try {
    for (const food of discoveries) {
      if (FOOD_DB[food.name] || CUSTOM_FOODS[food.name]) continue;
      await saveCustomFood(food.name, { ...food, discoveredAt: new Date().toISOString(), discoveryOrigin: 'meal', unlocked: true });
    }
    const indexes = await addFoods(mealId, foods);
    const missing = foods.map((food, i) => ({ food, idx: indexes[i] })).filter(({ food }) => isNutritionMissing(food));
    const summary = foods.map(quickItemSummary).join(', ');
    const message = appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? `Saved to ${mealLabel(mealId)}: ${summary}.${missing.length ? ' You can fill in nutrition later.' : ''}`
      : `${mealLabel(mealId)}에 저장했어요: ${summary}.${missing.length ? ' 영양정보는 나중에 채워도 돼요.' : ''}`);
    if (missing.length) appendFillNutritionButton(message, mealId, missing[0].idx);
  } catch (error) {
    showStorageFailure(error);
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? 'Could not save. Please try again.'
      : '저장하지 못했어요. 다시 시도해 주세요.');
  }
}

document.getElementById('agent-send')?.addEventListener('click', handleAgentCommand);
document.getElementById('agent-input')?.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.isComposing) return;
  event.preventDefault();
  handleAgentCommand();
});

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

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
const agentVoiceButton = document.getElementById('agent-voice');
let agentRecognition = null;

if (!SpeechRecognitionApi && agentVoiceButton) {
  agentVoiceButton.disabled = true;
  agentVoiceButton.title = ACTIVE_LOCALE === 'en' ? 'Voice input is not available in this browser.' : '이 브라우저에서는 음성 입력을 사용할 수 없어요.';
}

agentVoiceButton?.addEventListener('click', () => {
  if (!SpeechRecognitionApi || agentRecognition) return;
  agentRecognition = new SpeechRecognitionApi();
  agentRecognition.lang = ACTIVE_LOCALE === 'en' ? 'en-US' : 'ko-KR';
  agentRecognition.interimResults = false;
  agentRecognition.maxAlternatives = 1;
  agentVoiceButton.classList.add('is-listening');
  agentVoiceButton.setAttribute('aria-pressed', 'true');
  agentRecognition.addEventListener('result', event => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    const input = document.getElementById('agent-input');
    if (transcript && input) {
      input.value = transcript;
      input.focus();
    }
  });
  agentRecognition.addEventListener('error', () => {
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? 'Voice input could not start. You can continue by typing.'
      : '음성 입력을 시작하지 못했어요. 텍스트로 계속 입력할 수 있어요.');
  });
  agentRecognition.addEventListener('end', () => {
    agentRecognition = null;
    agentVoiceButton.classList.remove('is-listening');
    agentVoiceButton.setAttribute('aria-pressed', 'false');
  });
  try {
    agentRecognition.start();
  } catch (error) {
    agentRecognition = null;
    agentVoiceButton.classList.remove('is-listening');
    agentVoiceButton.setAttribute('aria-pressed', 'false');
    appendAgentMessage(ACTIVE_LOCALE === 'en'
      ? 'Voice input is already active or unavailable. You can continue by typing.'
      : '음성 입력을 시작할 수 없어요. 텍스트로 계속 입력해주세요.');
  }
});

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
  document.body.classList.add('app-ready');
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
  const hint = document.getElementById('health-hint');
  const text = message || (connected ? healthCopy('connected') : '');
  hint.hidden = !text;
  hint.textContent = text;
}

let healthRefreshSeq = 0;
async function refreshHeartRate(options = {}) {
  const card = document.getElementById('heart-rate-card');
  if (!card) return;
  if (!globalThis.RebuildersHealth?.isConnected()) { card.hidden = true; return; }
  const seq = ++healthRefreshSeq;
  const en = ACTIVE_LOCALE === 'en';
  const date = new Date(currentDate);
  try {
    if (options.force) RebuildersHealth.clearCache();
    const day = await RebuildersHealth.readDay(date);
    if (seq !== healthRefreshSeq) return; // 날짜를 빨리 넘긴 경우 마지막 요청만 반영
    card.hidden = false;
    document.getElementById('health-day-label').textContent = isToday(date)
      ? (en ? 'Today' : '오늘')
      : formatHomeDate(date);
    const hasHeart = !day.outOfRange && day.heartCount > 0;
    document.getElementById('heart-rate-average').textContent = hasHeart ? String(day.heartAverage) : '--';
    document.getElementById('heart-rate-latest').textContent = hasHeart ? String(day.heartLatest) : '--';
    const time = document.getElementById('heart-rate-latest-time');
    if (hasHeart && day.heartLatestAt) {
      const at = new Date(day.heartLatestAt);
      time.textContent = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
    } else {
      time.textContent = '';
    }
    const needsSteps = RebuildersHealth.needsStepsPermission();
    document.getElementById('health-steps-metric').hidden = needsSteps;
    document.getElementById('health-steps-value').textContent = !day.outOfRange && day.steps != null
      ? day.steps.toLocaleString(en ? 'en-US' : 'ko-KR')
      : '--';
    document.getElementById('health-steps-permission').hidden = !needsSteps;
    const note = document.getElementById('health-card-note');
    const noteText = day.outOfRange
      ? (en ? 'Only the last 7 days are shown.' : '최근 7일 기록만 보여줘요.')
      : (!hasHeart ? healthCopy('noData') : '');
    note.hidden = !noteText;
    note.textContent = noteText;
  } catch {
    if (seq === healthRefreshSeq) card.hidden = true; // 읽기 실패(권한 없음 등)면 조용히 숨김
  }
}

document.getElementById('health-steps-permission')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  if (button.dataset.actionLocked === 'true') return;
  button.dataset.actionLocked = 'true';
  try {
    await RebuildersHealth.connect(); // 심박수+걸음 수 읽기 권한(쓰기 없음)
    renderHealthSettings();
    await refreshHeartRate({ force: true });
  } catch (error) {
    const note = document.getElementById('health-card-note');
    note.hidden = false;
    note.textContent = String(error?.message || error);
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

async function initializeApp() {
  const modeState = await initializeStorageRepository();
  updateLocalModeStatus(modeState);
  // 브라우저가 저장 공간을 임의로 지우지 않도록 요청(결과와 상관없이 앱은 계속 동작).
  NiliriStorage.requestPersistentStorage();
  await loadSettings();
  await loadCustomFoods();
  await loadShopping();
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
  showAppScreen();
  document.body.classList.add('app-ready');
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
