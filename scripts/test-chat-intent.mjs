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
const { classifyChat, isQuestion, isInstructionOnly, parseEditIntent, parseClarifyReply, extractFoodHint, matchLocalInstant, matchLocalFood, exactCatalogHit, findCatalogMatches, parsePortionPhrase, parseInterpretResult, editFromInterpret, buildInterpretPayload } = ctx.RebuildersChatIntent;

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

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
