// 채팅 의도 분류 테스트: node scripts/test-chat-intent.mjs
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { globalThis: null };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'units.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'quick-entry.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'chat-intent.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'food-catalog.js'), 'utf8'), ctx);
const { classifyChat, isQuestion, isInstructionOnly, parseEditIntent, parseClarifyReply, extractFoodHint, matchLocalInstant, matchLocalFood, exactCatalogHit, findCatalogMatches, parsePortionPhrase, parseInterpretResult, foodDataFromInterpretItem, editFromInterpret, buildInterpretPayload, foldName, sourceFromInterpret } = ctx.RebuildersChatIntent;

let failed = 0;
function check(name, cond, info) { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`); if (!cond) failed++; }

let r = classifyChat('이거 몇 kcal야?');
check('이거 몇 kcal야? → 질문', r.type === 'question' && r.topic === 'kcal', r);
check('질문은 기록이 아님', isQuestion('이거 몇 kcal야?') && isInstructionOnly('바나나 먹어도 돼?'), true);
check('물음표 없는 몇 kcal이야', isQuestion('바나나 몇 kcal이야'), isQuestion('바나나 몇 kcal이야'));
check('먹어도 돼?', isQuestion('이거 먹어도 돼?'), true);
check('일반 음식 문장은 질문이 아님', !isQuestion('아침 바나나') && classifyChat('아침 바나나').type === 'food', classifyChat('아침 바나나'));
check('주스는 200ml야 는 질문이 아님', !isQuestion('주스는 200ml야'), true);

r = parseEditIntent('아까 너트 99kcal로 바꿔줘');
check('아까 너트 99kcal로 바꿔줘 → set-kcal 99, hint 너트', r?.action === 'set-kcal' && r.kcal === 99 && r.foodHint.includes('너트'), r);
r = parseEditIntent('99kcal로 적어줘');
check('99kcal로 적어줘 → set-kcal', r?.action === 'set-kcal' && r.kcal === 99, r);
r = parseEditIntent('그거 하나로 합쳐줘');
check('그거 하나로 합쳐줘 → merge', r?.action === 'merge', r);
r = parseEditIntent('두 개 따로 기록해줘');
check('두 개 따로 기록해줘 → split', r?.action === 'split', r);
r = parseEditIntent('주스는 200ml야');
check('주스는 200ml야 → set-amount 200ml, hint 주스', r?.action === 'set-amount' && r.amount?.value === 200 && r.amount?.unit === 'ml' && r.foodHint === '주스', r);
r = parseEditIntent('방금 거 지워줘');
check('방금 거 지워줘 → delete', r?.action === 'delete', r);
r = parseEditIntent('점심으로 옮겨줘');
check('점심으로 옮겨줘 → move lunch', r?.action === 'move' && r.mealId === 'lunch', r);
check('음식 문장은 edit가 아님', !parseEditIntent('점심 이삭 햄치즈') && !isInstructionOnly('점심 이삭 햄치즈'), parseEditIntent('점심 이삭 햄치즈'));

check('한 제품이에요 → one', parseClarifyReply('한 제품이에요') === 'one', parseClarifyReply('한 제품이에요'));
check('두 개예요 → two', parseClarifyReply('두 개예요') === 'two', parseClarifyReply('두 개예요'));
check('clarify 상태에서 한 제품', classifyChat('한 제품', { pendingClarify: true }).type === 'clarify-reply' && classifyChat('한 제품', { pendingClarify: true }).choice === 'one');
check('hint strips instruction words', extractFoodHint('아까 너트 99kcal로 바꿔줘') === '너트', extractFoodHint('아까 너트 99kcal로 바꿔줘'));

const catalogs = {
  mine: [{ name: '너트한줌 럭셔리', data: { cal: 99, carbs: 4, protein: 3, fat: 8, serving: '20g', sourceTrust: 'user' }, aliases: ['너트한줌럭셔리'], lastServing: '20g' }],
  recent: [{ name: '그릭요거트', data: { cal: 68, carbs: 3, protein: 10, fat: 0.4, serving: '40g' }, aliases: ['그릭 요거트'], lastServing: '40g', lastAmount: 40, lastUnit: 'g' }],
  db: [{ name: '바나나', data: { cal: 89, carbs: 23, protein: 1.1, fat: 0.3, serving: '100g' }, aliases: [] }],
};

let local = matchLocalInstant('너트한줌 럭셔리', catalogs);
check('내 음식 너트한줌 럭셔리는 한 항목으로 바로 매칭', local.ok && local.items.length === 1 && local.items[0].name === '너트한줌 럭셔리' && local.items[0].food?.cal === 99, local);
local = matchLocalInstant('그릭요거트', catalogs);
check('최근 그릭요거트는 마지막 양 40g을 기본으로 씀', local.ok && local.items.length === 1 && /40/.test(String(local.items[0].food?.serving || local.items[0].amount?.text || '')) && local.items[0].food?.cal === 68, local.items?.[0]);
local = matchLocalInstant('바나나 100g', catalogs);
check('공식 DB 바나나는 바로 매칭', local.ok && local.items[0].name === '바나나' && local.items[0].food?.cal === 89, local.items?.[0]);
local = matchLocalInstant('신제품블루베리주스xyz', catalogs);
check('처음 보는 말은 바로 매칭하지 않음', !local.ok, local);
local = matchLocalInstant('아까 너트 99kcal로 바꿔줘', catalogs);
check('수정 말은 바로 기록 경로가 아님', !local.ok && local.instruction, local);

const parsed = parseInterpretResult({
  intent: 'log',
  items: [{ name: '블루베리 토마토 사과 주스', amount: 1, unit: '컵', meal: 'breakfast' }, { name: '너트한줌 럭셔리' }],
  edits: [],
});
check('interpret log: 혼합 주스와 제품이 두 항목', parsed?.intent === 'log' && parsed.items.length === 2 && parsed.items[0].name === '블루베리 토마토 사과 주스' && parsed.items[1].name === '너트한줌 럭셔리', parsed);
check('interpret edit kcal', editFromInterpret({ field: 'kcal', value: 99, targetName: '너트' })?.action === 'set-kcal' && editFromInterpret({ field: 'kcal', value: 99, targetName: '너트' }).kcal === 99);
const payload = buildInterpretPayload('스벅 브륄레 쿠키', { meal: 'snack', candidates: ['브륄레'], date: '2026-11-11' });
check('interpret 요청에 원문 전체가 들어감', payload.text === '스벅 브륄레 쿠키' && payload.meal === 'snack' && payload.candidates[0] === '브륄레', payload);
check('image 자리는 요청에 없을 때 안 붙임', !('image' in payload), payload);
const withImage = buildInterpretPayload('영양표', { image: 'reserved' });
check('image 필드를 넘기면 그대로 자리를 연다', withImage.image === 'reserved', withImage);

check('exact catalog hit prefers mine', exactCatalogHit('너트한줌럭셔리', catalogs)?.origin === 'mine' && exactCatalogHit('너트한줌럭셔리', catalogs).data.cal === 99);

const bruleeFood = {
  name: '스타벅스 브륄레 쿠키 치즈케이크',
  data: { cal: 1400, carbs: 103, protein: 13, fat: 104, serving: '1개', servingAmount: 1, servingUnit: '개', packageGrams: 380, unitGrams: { '개': 380 }, servingGrams: 380, brand: '스타벅스', sourceTrust: 'user' },
  aliases: ['브륄레 쿠키 치즈케이크', '브륄래 치즈케익'],
};
const doubleFood = {
  name: '스타벅스 더블치즈케이크',
  data: { cal: 503, carbs: 40, protein: 8, fat: 30, serving: '1개', servingAmount: 1, servingUnit: '개', brand: '스타벅스', sourceTrust: 'user' },
  aliases: ['더블치즈케이크'],
};
const savedCatalogs = { mine: [bruleeFood, doubleFood], recent: [], db: [] };

r = parsePortionPhrase('4조각으로 나눠서 1조각만 먹었어');
check('4조각으로 나눠서 1조각 = 1/4', r?.value === 0.25 && r?.parts?.total === 4 && r?.parts?.eaten === 1, r);
r = parsePortionPhrase('반 먹었어');
check('반 먹었어 = 1/2', r?.value === 0.5, r);
r = parsePortionPhrase('5조각 중 2조각');
check('5조각 중 2조각 = 2/5', r?.value === 0.4 && r?.parts?.eaten === 2 && r?.parts?.total === 5, r);
r = parsePortionPhrase('95g');
check('95g 은 그램', r?.value === 95 && r?.unit === 'g', r);
r = classifyChat('4조각으로 나눠서 1조각만 먹었어');
check('양만 이어서 말하면 edit(set-amount 1/4)', r.type === 'edit' && r.action === 'set-amount' && r.amount?.value === 0.25, r);
check('점심 이삭 햄치즈는 여전히 음식 문장', classifyChat('점심 이삭 햄치즈').type === 'food', classifyChat('점심 이삭 햄치즈'));

let localFood = matchLocalFood('점심에 스벅 브륄레 치즈 케익 먹었어', savedCatalogs);
check('스벅 브륄레 치즈 케익은 저장된 브륄레 케이크와 바로 매칭(AI 없음)',
  localFood.ok && localFood.items?.[0]?.name === '스타벅스 브륄레 쿠키 치즈케이크' && localFood.items[0].food?.cal === 1400,
  localFood.items?.[0] || localFood);
localFood = matchLocalFood('스타벅스 치즈케이크', savedCatalogs);
check('스타벅스 치즈케이크는 후보가 둘이면 고르지 않음',
  !localFood.ok && localFood.ambiguousCandidates?.length >= 2
    && localFood.ambiguousCandidates.some(e => e.name.includes('브륄레'))
    && localFood.ambiguousCandidates.some(e => e.name.includes('더블')),
  localFood.ambiguousCandidates?.map(e => e.name) || localFood);

const found = findCatalogMatches('브륄래 케익', savedCatalogs);
check('브륄래/케익 오타도 브륄레 케이크로 매칭', found.best?.name === '스타벅스 브륄레 쿠키 치즈케이크' && !found.ambiguous, found);
const loose = findCatalogMatches('너트한줌 럭셔리신제품', { mine: catalogs.mine, recent: [], db: [] });
check('비슷한 짧은 이름에 단어를 더한 신제품은 자동으로 같은 음식으로 보지 않음', !loose.best, loose);

const noBrulee = {
  mine: [
    { name: '스타벅스 치즈케이크', data: { cal: 0, brand: '스타벅스' }, origin: 'mine' },
    { name: '스타벅스 더블치즈케이크', data: { cal: 503, brand: '스타벅스' }, origin: 'mine' },
  ],
  recent: [],
  db: [],
};
localFood = matchLocalFood('점심에 스벅 브륄레 치즈 케익 먹었어', noBrulee);
check('저장된 음식에 브륄레가 없으면 다른 치즈케이크를 후보로 고르지 않고 AI로 넘김',
  !localFood.ok && !(localFood.ambiguousCandidates && localFood.ambiguousCandidates.length),
  localFood.ambiguousCandidates?.map(e => e.name) || localFood);


const payload2 = buildInterpretPayload('4조각으로 나눠서 1조각만 먹었어', {
  meal: 'lunch',
  lastBatch: { ids: ['food-1'], names: ['스타벅스 브륄레 쿠키 치즈케이크'] },
  todayRecords: [{ id: 'food-1', name: '스타벅스 브륄레 쿠키 치즈케이크', meal: 'lunch', amount: '1개', kcal: 1400 }],
  savedFoods: [{ name: '스타벅스 브륄레 쿠키 치즈케이크', brand: '스타벅스' }],
});
check('interpret 요청에 오늘 기록과 내 음식이 들어감',
  payload2.todayRecords?.[0]?.id === 'food-1' && payload2.savedFoods?.[0]?.brand === '스타벅스' && payload2.lastBatch?.ids?.[0] === 'food-1',
  payload2);

const parsedEdit = parseInterpretResult({
  intent: 'edit',
  items: [],
  edits: [{ field: 'amount', value: 0.25, targetId: 'food-1', targetName: '스타벅스 브륄레 쿠키 치즈케이크' }],
});
check('interpret edit amount 0.25',
  parsedEdit?.intent === 'edit' && editFromInterpret(parsedEdit.edits[0])?.action === 'set-amount'
    && editFromInterpret(parsedEdit.edits[0]).amount?.value === 0.25
    && editFromInterpret(parsedEdit.edits[0]).targetId === 'food-1',
  parsedEdit);


const parsedNutrients = parseInterpretResult({
  intent: 'log',
  items: [{
    name: '스타벅스 브륄레 쿠키 치즈케이크', brand: '스타벅스',
    amount: 1, unit: '개', package_grams: 380, kcal: 1400, carbs_g: 103, protein_g: 13, fat_g: 104,
    source_type: '공식', source_note: '포장지', meal: 'lunch',
  }],
  edits: [],
});
check('interpret log 에 제품 1개 중량·kcal·탄단지가 들어감',
  parsedNutrients?.items?.[0]?.packageGrams === 380 && parsedNutrients.items[0].kcal === 1400
    && parsedNutrients.items[0].carbs === 103 && parsedNutrients.items[0].sourceType === '공식',
  parsedNutrients?.items?.[0]);
const fromItem = foodDataFromInterpretItem(parsedNutrients.items[0]);
check('interpret 영양은 1개 380g 1400kcal 기준으로 저장할 수 있음',
  fromItem?.cal === 1400 && fromItem.packageGrams === 380 && fromItem.unitGrams?.['개'] === 380
    && fromItem.sourceLabel === '공식' && fromItem.sourceTrust === 'reference' && fromItem.brand === '스타벅스',
  fromItem);

check('별다방→스타벅스, 스벅→스타벅스, 버킹→버거킹',
  foldName('별다방 라떼') === '스타벅스라떼' && foldName('스벅 아메리카노') === '스타벅스아메리카노' && foldName('버킹 와퍼') === '버거킹와퍼');

const latteCatalogs = {
  mine: [{ name: '라떼', data: { cal: 180, serving: '1잔 355ml' }, aliases: [] }],
  recent: [],
  db: [{ name: '아메리카노', data: { cal: 3, carbs: 0.3, protein: 0.1, fat: 0, serving: '100ml' }, aliases: [] }],
};
let brandLocal = matchLocalFood('별다방 라떼 먹었어', latteCatalogs);
check('별다방 라떼는 일반 라떼로 떨어지지 않음', !brandLocal.ok, brandLocal.items?.[0] || brandLocal);
brandLocal = matchLocalFood('라떼 먹었어', latteCatalogs);
check('라떼만 말하면 일반 라떼와 바로 매칭', brandLocal.ok && brandLocal.items?.[0]?.name === '라떼' && brandLocal.items[0].food?.cal === 180, brandLocal.items?.[0] || brandLocal);
brandLocal = matchLocalFood('스벅 아메리카노 먹었어', latteCatalogs);
check('스벅 아메리카노는 일반 아메리카노로 떨어지지 않음', !brandLocal.ok, brandLocal.items?.[0] || brandLocal);
brandLocal = matchLocalFood('아메리카노 먹었어', latteCatalogs);
check('아메리카노만 말하면 바로 매칭', brandLocal.ok && brandLocal.items?.[0]?.name === '아메리카노', brandLocal.items?.[0] || brandLocal);

const emptyLatte = { mine: [{ name: '스타벅스 카페라떼', data: { brand: '스타벅스' }, aliases: ['카페라떼', '라떼'] }], recent: [], db: [] };
brandLocal = matchLocalFood('별다방 라떼 먹었어', emptyLatte);
check('영양 없는 브랜드 라떼는 바로 매칭하지 않고 AI로 넘김', !brandLocal.ok, brandLocal.items?.[0] || brandLocal);

const pie = ctx.NILIRI_FOOD_CATALOG['버거킹 애플파이 로얄'];
check('베이스에 버거킹 애플파이 로얄 61g 188kcal 추정이 들어 있음',
  pie?.cal === 188 && pie.servingGrams === 61 && pie.packageGrams === 61 && pie.protein === 2 && pie.sugar === 6
    && pie.sodium === 120 && pie.saturatedFat === 2.5 && pie.brand === '버거킹' && pie.sourceType === '추정' && pie.sourceTrust === 'estimate'
    && !('carbs' in pie) && !('fat' in pie), pie);
const pieCatalogs = { mine: [], recent: [], db: [{ name: '버거킹 애플파이 로얄', data: pie, brand: pie.brand, aliases: pie.aliases }] };
brandLocal = matchLocalFood('점심에 버거킹 애플파이 먹었어', pieCatalogs);
check('버거킹 애플파이는 로얄 188kcal과 바로 매칭',
  brandLocal.ok && brandLocal.items?.[0]?.name === '버거킹 애플파이 로얄' && brandLocal.items[0].food?.cal === 188,
  brandLocal.items?.[0] || brandLocal);

const officialFromType = sourceFromInterpret({ source_type: '공식', source_url: 'https://example.com/nutrition.pdf', kcal: 188 });
check('source_type 공식은 공식', officialFromType?.sourceType === '공식' && officialFromType.sourceTrust === 'reference', officialFromType);
const memoryEstimate = sourceFromInterpret({ source_type: '추정', source_note: '공식 영양표처럼 기억남', kcal: 290 });
check('모델 기억은 추정(노트에 공식이 있어도 격상하지 않음)', memoryEstimate?.sourceType === '추정' && memoryEstimate.sourceTrust === 'estimate', memoryEstimate);


const { parseDayLog, applyBareGrams, normalizeBrandText, isMealHeaderLine, leftoverUnmatched, formatDayLogForInterpret } = ctx.RebuildersChatIntent;
check('끼니 헤더(앞에 - 있어도)를 인식', isMealHeaderLine('아침') === 'breakfast' && isMealHeaderLine('- 점심') === 'lunch' && isMealHeaderLine('저녁:') === 'dinner' && isMealHeaderLine('간식') === 'snack' && !isMealHeaderLine('아침 바나나'), { breakfast: isMealHeaderLine('아침'), lunch: isMealHeaderLine('- 점심') });
check('단위 없는 끝 숫자는 g', applyBareGrams('바나나 120') === '바나나 120g' && applyBareGrams('계란 1알 50g') === '계란 1알 50g' && applyBareGrams('밥 160') === '밥 160g', { banana: applyBareGrams('바나나 120'), egg: applyBareGrams('계란 1알 50g') });
check('별칭은 붙여넣기 문구에서 정규화', normalizeBrandText('별다방 라떼') === '스타벅스 라떼' && normalizeBrandText('맥날 불고기버거') === '맥도날드 불고기버거' && normalizeBrandText('버킹 와퍼') === '버거킹 와퍼', normalizeBrandText('별다방 라떼'));

const memo = `아침
등촌 칼국수 한그릇
간식
네스프레소 캡슐
말차모찌
점심
요즘 그릭 요거트 100g
바나나 120
계란 1알 50g
저녁
떡갈비 60
계란말이 40
밥 160
진라면 소컵 순한맛`;
const dayLog = parseDayLog(memo);
const meals = Object.fromEntries(['breakfast','snack','lunch','dinner'].map(m => [m, dayLog.lines.filter(l => l.mealId === m).map(l => l.text)]));
check('하루치 붙여넣기는 끼니별로 나뉜다', dayLog.ok && dayLog.lines.length === 10
  && meals.breakfast.join('|') === '등촌 칼국수 한그릇'
  && meals.snack.join('|') === '네스프레소 캡슐|말차모찌'
  && meals.lunch.join('|') === '요즘 그릭 요거트 100g|바나나 120g|계란 1알 50g'
  && meals.dinner.join('|') === '떡갈비 60g|계란말이 40g|밥 160g|진라면 소컵 순한맛', meals);
check('헤더 없는 여러 줄은 하루치로 보지 않음', !parseDayLog('바나나 120\n계란 1알').ok);
const leftoverBanana = leftoverUnmatched('바나나 120g', { name: '바나나', data: { cal: 93 } });
check('양 토큰은 로컬 매칭 잔여로 보지 않음', leftoverBanana.length === 0, leftoverBanana);
check('interpret용 문구도 끼니 헤더를 유지', formatDayLogForInterpret(dayLog.lines).includes('아침\n등촌 칼국수 한그릇') && formatDayLogForInterpret(dayLog.lines).includes('저녁\n떡갈비 60g'), formatDayLogForInterpret(dayLog.lines));

const oneLine = '오늘거 아침 등촌 칼국수 한그릇 간식 네스프레소 캡슐 말차모찌 점심 요즘 그릭 요거트 100g 바나나 120 계란 1알 50g 저녁 떡갈비 60 계란말이 40 밥 160 진라면 소컵 순한맛';
const oneLog = parseDayLog(oneLine);
const oneMeals = Object.fromEntries(['breakfast','snack','lunch','dinner'].map(m => [m, oneLog.lines.filter(l => l.mealId === m).map(l => l.text)]));
check('한 줄+오늘거도 끼니·음식 단위로 나뉜다', oneLog.ok && oneLog.lines.length === 10
  && oneMeals.breakfast.join('|') === '등촌 칼국수 한그릇'
  && oneMeals.snack.join('|') === '네스프레소 캡슐|말차모찌'
  && oneMeals.lunch.join('|') === '요즘 그릭 요거트 100g|바나나 120g|계란 1알 50g'
  && oneMeals.dinner.join('|') === '떡갈비 60g|계란말이 40g|밥 160g|진라면 소컵 순한맛', oneMeals);
check('한 줄도 interpret 문구가 음식마다 줄바꿈된다', formatDayLogForInterpret(oneLog.lines).includes('점심\n요즘 그릭 요거트 100g\n바나나 120g\n계란 1알 50g'), formatDayLogForInterpret(oneLog.lines));
check('지시문은 음식 목록에 안 넣는다', !formatDayLogForInterpret(oneLog.lines).includes('여러 음식이 한 줄에 있으면') && !oneLog.lines.some(l => l.text.includes('items로 나눠')), formatDayLogForInterpret(oneLog.lines));
check('가운데 맨숫자도 g로 붙는다', applyBareGrams('요즘 그릭 요거트 100g 바나나 120 계란 1알 50g') === '요즘 그릭 요거트 100g 바나나 120g 계란 1알 50g');
const { defaultCapsuleAmount, amountNearName } = ctx.RebuildersChatIntent;
check('캡슐은 1잔', defaultCapsuleAmount('네스프레소 캡슐')?.unit === '잔' && defaultCapsuleAmount('네스프레소 캡슐')?.value === 1, defaultCapsuleAmount('네스프레소 캡슐'));
check('항목 옆 g만 읽는다', amountNearName(oneMeals.lunch.join(' '), '바나나')?.value === 120 && amountNearName(oneMeals.lunch.join(' '), '계란')?.value === 50 && amountNearName(oneMeals.lunch.join(' '), '요거트')?.value === 100, {
  banana: amountNearName(oneMeals.lunch.join(' '), '바나나'),
  egg: amountNearName(oneMeals.lunch.join(' '), '계란'),
  yogurt: amountNearName(oneMeals.lunch.join(' '), '요거트'),
});


const eggData = {
  cal: 156, carbs: 1, protein: 12, fat: 11,
  serving: '1알 60g', servingGrams: 60, servingAmount: 1, servingUnit: '알',
  unitGrams: { '알': 60 }, aliases: ['계란'], sourceType: '공공DB',
};
const eggCatalogs = {
  mine: [],
  recent: [{ name: '삶은 달걀', data: eggData, aliases: eggData.aliases, lastServing: '1알', lastAmount: 1, lastUnit: '알' }],
  db: [],
};
const eggGram = matchLocalFood('계란 1알 50g', eggCatalogs);
check('사용자가 g을 적으면 저장된 계란도 그 g으로 재계산',
  eggGram.ok && eggGram.items?.[0]?.amount?.unit === 'g' && eggGram.items[0].amount.value === 50
    && Math.round(eggGram.items[0].food?.cal) === Math.round(156 * 50 / 60),
  eggGram.items?.[0] || eggGram);

const capsuleCatalogs = {
  mine: [{ name: '네스프레소 캡슐커피', data: { cal: 0, serving: '100g', servingGrams: 100 }, lastServing: '100g', lastAmount: 100, lastUnit: 'g' }],
  recent: [],
  db: [],
};
const capsuleHit = matchLocalFood('네스프레소 캡슐', capsuleCatalogs);
check('네스프레소 캡슐은 저장된 100g가 아니라 1잔',
  capsuleHit.ok && capsuleHit.items?.[0]?.amount?.unit === '잔' && capsuleHit.items[0].amount.value === 1,
  capsuleHit.items?.[0] || capsuleHit);

const { splitFoodPhrases, isInstructionLine, nutritionSanity, expandPackedItems } = ctx.RebuildersChatIntent;
check('이름+양 덩어리로 나눈다', splitFoodPhrases('요즘 그릭 요거트 100g 바나나 120g 계란 1알 50g').join('|') === '요즘 그릭 요거트 100g|바나나 120g|계란 1알 50g'
  && splitFoodPhrases('떡갈비 60g 계란말이 40g 밥 160g 진라면 소컵 순한맛').join('|') === '떡갈비 60g|계란말이 40g|밥 160g|진라면 소컵 순한맛'
  && splitFoodPhrases('네스프레소 캡슐 말차모찌').join('|') === '네스프레소 캡슐|말차모찌', {
    lunch: splitFoodPhrases('요즘 그릭 요거트 100g 바나나 120g 계란 1알 50g'),
    snack: splitFoodPhrases('네스프레소 캡슐 말차모찌'),
  });
check('지시문 줄은 음식이 아니다', isInstructionLine('여러 음식이 한 줄에 있으면 items로 나눠 기록하고, 각 항목의 meal을 유지해.') && splitFoodPhrases('여러 음식이 한 줄에 있으면 items로 나눠 기록하고, 각 항목의 meal을 유지해.').length === 0);
const packed = parseInterpretResult({
  intent: 'log',
  items: [
    { name: '여러 음식이 한 줄에 있으면 items로 나눠 기록하고, 각 항목의 meal을 유지해.' },
    { name: '요즘 그릭 요거트 100g 바나나 120g 계란 1알 50g', meal: 'lunch', kcal: 45, amount: 50, unit: 'g' },
  ],
  edits: [],
});
check('interpret 결과의 묶인 이름도 나누고 지시문은 뺀다', packed && packed.items.length === 3
  && packed.items[0].name === '요즘 그릭 요거트 100g'
  && packed.items[1].name === '바나나 120g'
  && packed.items[2].name === '계란 1알 50g'
  && packed.items.every(it => it.kcal == null), packed?.items);
check('간식 923kcal 추정은 거절', nutritionSanity({ cal: 923, servingGrams: 355, serving: '1잔', sourceType: '추정' }, { mealId: 'snack' }).ok === false);
check('g당 5kcal 초과 추정은 거절', nutritionSanity({ cal: 400, servingGrams: 50, serving: '50g', sourceType: '추정' }).ok === false);
check('칼국수 650kcal 추정은 통과', nutritionSanity({ cal: 650, servingGrams: 500, serving: '한그릇', sourceType: '추정' }, { mealId: 'breakfast' }).ok === true);

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
