// 빠른 입력 파서 테스트: node scripts/test-quick-entry.mjs
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { globalThis: null };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'units.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'food-catalog.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'quick-entry.js'), 'utf8'), ctx);
const { parseQuickEntry, detectTime, isNutritionMissing, countNutritionMissing } = ctx.RebuildersQuickEntry;
const foods = Object.entries(ctx.NILIRI_FOOD_CATALOG).map(([n, d]) => [n, d, n === '그릭요거트' ? ['요거트'] : []]);
const at = h => new Date(2026, 9, 20, h, 0, 0);

let failed = 0;
function check(name, cond, info) { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`); if (!cond) failed++; }
const names = r => r.items.map(i => i.name);
const p = (text, h = 12) => parseQuickEntry(text, { foods, now: at(h) });

let r = p('아침 바나나');
check('아침 바나나 → 아침, [바나나] 기본 DB, 양을 안 쓰면 1개(118g)로 환산', r.mealId === 'breakfast' && r.mealExplicit && names(r).join() === '바나나' && r.items[0].known && r.items[0].food.cal === 105 && r.items[0].food.servingGrams === 118 && r.items[0].food.serving === '1개', r);

r = p('점심 이삭 햄치즈, 아아');
check('점심 이삭 햄치즈, 아아 → 2개, 아아=아이스 아메리카노', r.mealId === 'lunch' && names(r).join('|') === '이삭 햄치즈|아이스 아메리카노' && !r.items[0].known && r.items[1].known, r);
check('미등록 음식은 영양값을 0으로 채우지 않음', r.items[0].food.cal === undefined && r.items[0].food.carbs === undefined && isNutritionMissing(r.items[0].food), r.items[0]);
check('아아는 아메리카노 영양값 사용(1잔 톨 355ml)', r.items[1].food.cal === 10.7 && r.items[1].food.baseFood === '아메리카노' && r.items[1].food.servingGrams === 355, r.items[1]);

r = p('저녁 밥 반공기 김치');
check('저녁 밥 반공기 김치 → [밥(반공기 105g), 김치]', r.mealId === 'dinner' && names(r).join('|') === '밥|김치' && r.items[0].known && r.items[0].food.serving === '반공기' && r.items[0].food.servingGrams === 105 && r.items[0].food.cal === 136.5, r);

r = p('아침에 바나나 먹었어');
check('기존 문장 "아침에 바나나 먹었어" 유지', r.mealId === 'breakfast' && names(r).join() === '바나나' && r.recordIntent, r);

r = p('간식으로 딸기우유 먹었어');
check('간식으로 딸기우유 먹었어 → 간식, [딸기우유]', r.mealId === 'snack' && names(r).join() === '딸기우유', r);

r = p('바나나랑 요거트');
check('끼니 생략 → 현재 시각(12시=점심), 랑으로 분리, 별칭 요거트', r.mealId === 'lunch' && !r.mealExplicit && names(r).join('|') === '바나나|그릭요거트', r);
check('끼니 생략 8시 → 아침', p('바나나', 8).mealId === 'breakfast');
check('끼니 생략 10시 → 아침(카드와 같음, 11시 전까지)', p('바나나', 10).mealId === 'breakfast');
check('끼니 생략 20시 → 저녁', p('바나나', 20).mealId === 'dinner');
check('끼니 생략 15시 → 점심(카드와 같음, 17시 전까지. 간식은 말할 때만)', p('바나나', 15).mealId === 'lunch');
check('끼니 생략 17시 → 저녁', p('바나나', 17).mealId === 'dinner');

r = p('점심 닭가슴살이랑 현미밥하고 샐러드');
check('이랑·하고 분리', names(r).join('|') === '닭가슴살|현미밥|샐러드', r);

r = p('저녁\n삼겹살\n된장찌개');
check('줄바꿈 분리', r.mealId === 'dinner' && names(r).join('|') === '삼겹살|된장찌개', r);

r = p('점심 이삭 햄치즈 토스트 아아');
check('쉼표 없이: 미등록 여러 단어 + 기본 음식', names(r).join('|') === '이삭 햄치즈 토스트|아이스 아메리카노', r);

r = p('아침 바나나 150g');
check('g 단위는 기준량 비례 계산', r.items[0].food.cal === 133.5 && r.items[0].food.serving === '150g', r.items[0].food);

r = p('아침 바나나2개');
check('붙여 쓴 양(바나나2개): 2개=236g로 환산', names(r).join() === '바나나' && r.items[0].food.cal === 210 && r.items[0].food.serving === '2개' && r.items[0].food.servingGrams === 236 && !r.items[0].food.quantityNote, r.items[0]);

r = p('간식 프로틴바 2개');
check('"1개 60g" 기준(영양은 100g 기준) → 2개 = 120g 만큼(350 × 1.2 = 420kcal)', r.items[0].food.cal === 420 && r.items[0].food.serving === '2개' && r.items[0].food.servingGrams === 120, r.items[0].food);

// 계란: USDA 173424 의 '1 large = 50 g'(unitGrams) × 개수, 영양은 100g 기준에서 비례
for (const [text, n] of [['아침 계란', 1], ['아침 계란 1개', 1], ['아침 계란 2개', 2], ['아침 계란 한 알', 1], ['아침 계란 하나', 1], ['아침 달걀 두 개', 2], ['아침 계란2개', 2]]) {
  r = p(text);
  const f = r.items[0]?.food || {};
  check(`${text} → ${n}개 = ${n * 50}g, ${155 * n / 2}kcal·단백질 ${Math.round(12.6 * n / 2 * 10) / 10}g`, r.items.length === 1 && f.name === '삶은 달걀' && f.servingGrams === n * 50 && f.servingAmount === n && f.cal === Math.round(155 * n / 2 * 10) / 10 && f.protein === Math.round(12.6 * n / 2 * 10) / 10 && !f.quantityNote, f);
}
r = p('아침 계란 120g');
check('계란 120g → g 그대로 비례(186kcal)', r.items[0].food.cal === 186 && r.items[0].food.serving === '120g', r.items[0].food);

r = p('바나나를 먹었어');
check('조사 제거(바나나를)', names(r).join() === '바나나', r);

check('빈 입력 → 항목 없음', p('   ').items.length === 0);
check('끼니만 → 항목 없음', p('점심').items.length === 0);
check('countNutritionMissing', countNutritionMissing([{ name: 'a' }, { name: 'b', cal: 0, carbs: 0, protein: 0, fat: 0 }, { name: 'c', cal: 100 }]) === 2);
check('영양값 0은 미입력 아님', !isNutritionMissing({ cal: 0, carbs: 0, protein: 0, fat: 0 }));

// 날짜 말(기준: 2026-10-20 화)
r = p('내일 아침 바나나');
check('내일 아침 바나나 → 10-21 아침 [바나나]', r.date === '2026-10-21' && r.dateExplicit && r.mealId === 'breakfast' && names(r).join() === '바나나', r);
r = p('아침 내일 바나나');
check('아침 내일 바나나(순서 바꿔도)', r.date === '2026-10-21' && r.mealId === 'breakfast' && names(r).join() === '바나나', r);
r = p('어제 저녁에 김치, 밥');
check('어제 저녁에 → 10-19 저녁, 이름에 날짜 없음', r.date === '2026-10-19' && r.mealId === 'dinner' && !names(r).some(n => /어제|저녁/.test(n)), r);
check('그제/그저께 → 10-18', p('그제 점심 바나나').date === '2026-10-18' && p('그저께 점심 바나나').date === '2026-10-18');
check('모레 → 10-22, 오늘 → 10-20', p('모레 간식 바나나').date === '2026-10-22' && p('오늘 야식 바나나').date === '2026-10-20' && p('오늘 야식 바나나').mealId === 'snack');
r = p('10/22 점심 바나나');
check('10/22 → 2026-10-22, 이름에 숫자 없음', r.date === '2026-10-22' && names(r).join() === '바나나', r);
r = p('22일 점심 이삭 햄치즈');
check('22일 → 이번 달 22일', r.date === '2026-10-22' && names(r).join() === '이삭 햄치즈', r);
check('10월 19일 저녁 바나나', p('10월 19일 저녁 바나나').date === '2026-10-19');
r = p('점심 바나나 2개');
check('날짜 없으면 date 없음, 양(2개)은 그대로', r.date === null && !r.dateExplicit && r.items[0].amount?.value === 2, r);
check('내일은 아침 바나나(조사)', p('내일은 아침 바나나').date === '2026-10-21' && names(p('내일은 아침 바나나')).join() === '바나나');

r = p('저녁 밥 반 공기');
check('밥 반 공기 → 한 항목, 0.5공기(105g) 기본 DB', r.items.length === 1 && r.items[0].name === '밥' && r.items[0].known && r.items[0].amount?.value === 0.5 && r.items[0].amount?.unit === '공기' && r.items[0].food.serving === '반공기' && r.items[0].food.servingGrams === 105, r);
r = p('저녁 밥 반공기 김치');
check('저녁 밥 반공기 김치(붙여 쓴 양) 유지', r.mealId === 'dinner' && names(r).join('|') === '밥|김치' && r.items[0].food.serving === '반공기' && r.items[0].known, r);
r = p('스타벅스 윈터 스카치 바닐라 라떼 톨');
check('라떼 톨 → 이름 유지, 355ml(톨)', r.items.length === 1 && r.items[0].name === '스타벅스 윈터 스카치 바닐라 라떼' && r.items[0].amount?.value === 355 && r.items[0].amount?.unit === 'ml' && r.items[0].food.serving === '톨', r);
r = p('아메리카노 그란데');
check('아메리카노 그란데 → 아는 음식, 473ml로 비례', r.items.length === 1 && r.items[0].known && r.items[0].name === '아메리카노' && r.items[0].food.serving === '그란데' && r.items[0].food.cal === 14.2, r.items[0]);
r = p('저녁에 스타벅스 윈터 스카치 바닐라 라떼 톨이랑 루돌프 쿠키 치즈 케이크 먹었어');
check('예문: 라떼+케이크 두 항목(케이크를 기본 DB로 쪼개지 않음)', r.mealId === 'dinner' && r.items.length === 2 && names(r).join('|') === '스타벅스 윈터 스카치 바닐라 라떼|루돌프 쿠키 치즈 케이크' && r.items[0].food.serving === '톨' && !r.items[1].known, r);
r = p('점심 이삭 햄치즈 토스트 아아');
check('쉼표 없이 아아 별칭은 계속 분리', names(r).join('|') === '이삭 햄치즈 토스트|아이스 아메리카노', r);
r = p('라떼 톨사이즈');
check('톨사이즈 → 톨(355ml)', r.items[0].food.serving === '톨' && r.items[0].amount?.value === 355, r.items[0]);
r = p('현미밥 1공기');
check('현미밥 1공기 = 210g, 315kcal', r.items[0].name === '현미밥' && r.items[0].amount?.value === 1 && r.items[0].amount?.unit === '공기' && r.items[0].food.servingGrams === 210 && r.items[0].food.cal === 315, r.items[0]);


// 합친 음식 나누기 · 시각 · 기본 1회 양
r = p('점심 참치김치찌개 백미밥');
check('참치김치찌개 백미밥 → 두 항목(찌개 + 밥)', names(r).join('|') === '참치김치찌개|밥' && r.items[1].known && r.items[1].food.serving === '1공기' && r.items[1].food.servingGrams === 210, r);
r = p('점심 김치찌개에 밥');
check('김치찌개에 밥 → 두 항목', names(r).join('|') === '김치찌개|밥' && r.items[1].known, r);
r = p('점심 김치찌개+밥');
check('김치찌개+밥 → 두 항목', names(r).join('|') === '김치찌개|밥', r);
r = p('점심 김치볶음밥');
check('김치볶음밥은 나누지 않음', r.items.length === 1 && r.items[0].name === '김치볶음밥' && !r.items[0].known, r);
r = p('점심 비빔밥');
check('비빔밥은 나누지 않음', r.items.length === 1 && names(r).join() === '비빔밥', r);
r = p('점심 참치김밥');
check('참치김밥은 나누지 않음', r.items.length === 1 && names(r).join() === '참치김밥', r);
r = p('토마토 한 접시');
check('토마토 한 접시 → 3개(369g)', r.items[0].name === '토마토' && r.items[0].food.servingAmount === 3 && r.items[0].food.servingUnit === '개' && r.items[0].food.servingGrams === 369, r.items[0].food);
r = p('계란');
check('계란만 써도 1개 50g로 맞춤(AI 없이)', r.items[0].known && r.items[0].food.name === '삶은 달걀' && r.items[0].food.servingGrams === 50 && r.items[0].food.cal === 77.5, r.items[0].food);

check('detectTime 오후 2시 → 14:00', detectTime('오후 2시에 라떼') === '14:00');
check('detectTime 저녁 7시 반 → 19:30', detectTime('저녁 7시 반에 밥') === '19:30');
check('detectTime 14:30', detectTime('14:30 점심 김치') === '14:30');
check('detectTime 오전 9시 15분', detectTime('오늘 오전 9시 15분 요거트') === '09:15');
r = p('오후 3시에 라떼');
check('말한 시각은 time으로, 끼니는 점심(17시 전)', r.time === '15:00' && r.timeExplicit && r.mealId === 'lunch', r);

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
