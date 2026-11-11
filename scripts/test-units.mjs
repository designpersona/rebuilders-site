// 단위·환산·합친 음식 나누기 테스트: node scripts/test-units.mjs
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
const U = ctx.RebuildersUnits;
let failed = 0;
function check(name, cond, info) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`);
  if (!cond) failed++;
}

check('컵 200ml', U.GENERIC_UNITS['컵'].ml === 200 && U.GENERIC_UNITS['컵'].official);
check('공기 210g', U.GENERIC_UNITS['공기'].grams === 210 && U.GENERIC_UNITS['공기'].official);
check('큰술 15ml · 작은술 5ml', U.GENERIC_UNITS['큰술'].ml === 15 && U.GENERIC_UNITS['작은술'].ml === 5);
check('한줌 20g 추정', U.GENERIC_UNITS['한줌'].grams === 20 && U.GENERIC_UNITS['한줌'].estimated);

check('토마토 1개 123g', U.gramsForUnit('토마토', '개').grams === 123 && !U.gramsForUnit('토마토', '개').estimated);
check('토마토 한 접시 → 3개', U.resolveAmount('토마토', 1, '접시').value === 3 && U.resolveAmount('토마토', 1, '접시').unit === '개' && U.resolveAmount('토마토', 1, '접시').grams === 369);
check('방울토마토 1접시 → 15개', U.resolveAmount('방울토마토', 1, '접시').value === 15 && U.resolveAmount('방울토마토', 1, '접시').grams === 255);
check('계란 별칭 → 50g', U.gramsForUnit('계란', '개').grams === 50);
check('바나나 1개 118g', U.typicalServing('바나나').grams === 118 && U.typicalServing('바나나').unit === '개');
check('사과 182g · 귤 88g', U.gramsForUnit('사과', '개').grams === 182 && U.gramsForUnit('귤', '개').grams === 88);
check('밥·쌀밥·백미밥 1공기 210g', U.typicalServing('밥').grams === 210 && U.typicalServing('쌀밥').grams === 210 && U.typicalServing('백미밥').unit === '공기');
check('믹스너트 1봉 20g', U.typicalServing('믹스너트').grams === 20);
check('김치찌개 1그릇 400g', U.typicalServing('김치찌개').grams === 400);
check('스텝: 개=1, 공기=0.5, g=10', U.stepFor('개') === 1 && U.stepFor('공기') === 0.5 && U.stepFor('g') === 10);

const banana = U.applyAmount({
  name: '바나나', cal: 89, carbs: 23, protein: 1.1, fat: 0.3,
  basis: '100g', basisGrams: 100, basisNutrients: { cal: 89, carbs: 23, protein: 1.1, fat: 0.3 },
}, { value: 1, unit: '개' });
check('바나나 1개 = 118g, 105kcal', banana.servingGrams === 118 && banana.cal === 105 && banana.serving === '1개' && banana.servingAmount === 1, banana);
check('표시 1개 (118g)', U.formatAmount(U.typicalServing('바나나')) === '1개 (118g)');

const halfRice = U.applyAmount({
  name: '밥', cal: 130, carbs: 28.6, protein: 2.4, fat: 0.2,
  basis: '100g', basisGrams: 100, basisNutrients: { cal: 130, carbs: 28.6, protein: 2.4, fat: 0.2 },
}, { value: 0.5, unit: '공기' });
check('밥 반 공기 = 105g, 136.5kcal', halfRice.servingGrams === 105 && halfRice.cal === 136.5 && halfRice.serving === '반공기', halfRice);

check('김치찌개에 밥 나누기', U.splitCombinedFoods('김치찌개에 밥').join('|') === '김치찌개|밥');
check('김치찌개+밥 나누기', U.splitCombinedFoods('김치찌개+밥').join('|') === '김치찌개|밥');
check('참치김치찌개 백미밥 나누기', U.splitCombinedFoods('참치김치찌개 백미밥').join('|') === '참치김치찌개|백미밥');
check('김치볶음밥은 나누지 않음', U.splitCombinedFoods('김치볶음밥').join() === '김치볶음밥' && U.isCompoundDish('김치볶음밥'));
check('비빔밥은 나누지 않음', U.splitCombinedFoods('비빔밥').join() === '비빔밥');
check('참치김밥은 나누지 않음', U.splitCombinedFoods('참치김밥').join() === '참치김밥' && U.isCompoundDish('참치김밥'));
check('밥 혼자는 나누지 않음', U.splitCombinedFoods('밥').join() === '밥');

const old = { name: '그릭요거트', cal: 24, carbs: 1, protein: 4, fat: 0.2, serving: '100g' };
check('양 없는 예전 기록은 값 유지(기준만 읽음)', U.getBasis(old).grams === 100 && old.cal === 24);

const typG = U.parseServing('1개 118g');
check('parseServing 1개 118g', typG.value === 1 && typG.unit === '개' && typG.grams === 118);
check('parseServing 톨', U.parseServing('톨').value === 355 && U.parseServing('톨').unit === 'ml');

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
