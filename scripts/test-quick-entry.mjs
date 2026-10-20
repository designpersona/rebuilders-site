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
vm.runInContext(readFileSync(join(root, 'food-catalog.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(join(root, 'quick-entry.js'), 'utf8'), ctx);
const { parseQuickEntry, isNutritionMissing, countNutritionMissing } = ctx.RebuildersQuickEntry;
const foods = Object.entries(ctx.NILIRI_FOOD_CATALOG).map(([n, d]) => [n, d, n === '그릭요거트' ? ['요거트'] : []]);
const at = h => new Date(2026, 9, 20, h, 0, 0);

let failed = 0;
function check(name, cond, info) { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`); if (!cond) failed++; }
const names = r => r.items.map(i => i.name);
const p = (text, h = 12) => parseQuickEntry(text, { foods, now: at(h) });

let r = p('아침 바나나');
check('아침 바나나 → 아침, [바나나] 기본 DB', r.mealId === 'breakfast' && r.mealExplicit && names(r).join() === '바나나' && r.items[0].known && r.items[0].food.cal === 89, r);

r = p('점심 이삭 햄치즈, 아아');
check('점심 이삭 햄치즈, 아아 → 2개, 아아=아이스 아메리카노', r.mealId === 'lunch' && names(r).join('|') === '이삭 햄치즈|아이스 아메리카노' && !r.items[0].known && r.items[1].known, r);
check('미등록 음식은 영양값을 0으로 채우지 않음', r.items[0].food.cal === undefined && r.items[0].food.carbs === undefined && isNutritionMissing(r.items[0].food), r.items[0]);
check('아아는 아메리카노 영양값 사용', r.items[1].food.cal === 3 && r.items[1].food.baseFood === '아메리카노', r.items[1]);

r = p('저녁 밥 반공기 김치');
check('저녁 밥 반공기 김치 → [밥(반공기), 김치]', r.mealId === 'dinner' && names(r).join('|') === '밥|김치' && r.items[0].food.serving === '반공기', r);

r = p('아침에 바나나 먹었어');
check('기존 문장 "아침에 바나나 먹었어" 유지', r.mealId === 'breakfast' && names(r).join() === '바나나' && r.recordIntent, r);

r = p('간식으로 딸기우유 먹었어');
check('간식으로 딸기우유 먹었어 → 간식, [딸기우유]', r.mealId === 'snack' && names(r).join() === '딸기우유', r);

r = p('바나나랑 요거트');
check('끼니 생략 → 현재 시각(12시=점심), 랑으로 분리, 별칭 요거트', r.mealId === 'lunch' && !r.mealExplicit && names(r).join('|') === '바나나|그릭요거트', r);
check('끼니 생략 8시 → 아침', p('바나나', 8).mealId === 'breakfast');
check('끼니 생략 20시 → 저녁', p('바나나', 20).mealId === 'dinner');
check('끼니 생략 15시 → 간식', p('바나나', 15).mealId === 'snack');

r = p('점심 닭가슴살이랑 현미밥하고 샐러드');
check('이랑·하고 분리', names(r).join('|') === '닭가슴살|현미밥|샐러드', r);

r = p('저녁\n삼겹살\n된장찌개');
check('줄바꿈 분리', r.mealId === 'dinner' && names(r).join('|') === '삼겹살|된장찌개', r);

r = p('점심 이삭 햄치즈 토스트 아아');
check('쉼표 없이: 미등록 여러 단어 + 기본 음식', names(r).join('|') === '이삭 햄치즈 토스트|아이스 아메리카노', r);

r = p('아침 바나나 150g');
check('g 단위는 기준량 비례 계산', r.items[0].food.cal === 133.5 && r.items[0].food.serving === '150g', r.items[0].food);

r = p('아침 바나나2개');
check('붙여 쓴 양(바나나2개): 단위 변환 불가 → 기준량 유지 + 메모', names(r).join() === '바나나' && r.items[0].food.cal === 89 && r.items[0].food.quantityNote === '2개', r.items[0]);

r = p('간식 프로틴바 2개');
check('1개 기준 음식은 개수만큼 곱함', r.items[0].food.cal === 700 && r.items[0].food.serving === '2개', r.items[0].food);

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

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
