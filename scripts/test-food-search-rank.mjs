// 검색 순서·중복 제거 테스트: node scripts/test-food-search-rank.mjs
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { globalThis: null };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'food-search-rank.js'), 'utf8'), ctx);
const {
  organizeSearchSections, isUserFood, isEstimateFood, dedupeKey, compactName,
} = ctx.RebuildersFoodSearchRank;

let failed = 0;
function check(name, cond, info) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`);
  if (!cond) failed++;
}

const user = { name: '랭킹테스트바', data: { cal: 80, serving: '1개', sourceTrust: 'user', sourceLabel: '내 음식' }, aliases: ['랭킹테스트'] };
const userDup = { name: '랭킹테스트바', data: { cal: 999, serving: '1개', maker: '', sourceTrust: 'user' } };
const official = { name: '랭킹테스트바', data: { cal: 100, serving: '100g', nutritionSource: { provider: 'USDA' } }, tier: 0 };
const branded = { name: '랭킹테스트바 초코', data: { cal: 200, serving: '1개', maker: '브랜드A', mfdsKind: '가공식품' }, tier: 1, mfds: true };
const generic = { name: '랭킹테스트바 생것', data: { cal: 50, serving: '100g', mfdsKind: '원재료' }, tier: 0, mfds: true, plain: true };
const recentOff = { name: '랭킹최근밥', data: { cal: 130, serving: '1공기', nutritionSource: { provider: 'USDA' } }, lastServing: '1공기' };
const dbRice = { name: '랭킹최근밥', data: { cal: 130, serving: '100g', nutritionSource: { provider: 'USDA' } }, tier: 0 };
const estimate = { name: '랭킹추정쿠키', data: { cal: 90, serving: '1개', aiEstimate: true, sourceTrust: 'estimate' } };
const estimateSame = { name: '랭킹테스트바', data: { cal: 70, serving: '1개', aiEstimate: true, source: 'openclaw' } };

check('사용자 등록은 내 음식', isUserFood(user.data) && !isEstimateFood(user.data), user.data);
check('AI 추정은 추정', isEstimateFood(estimate.data) && !isUserFood(estimate.data), estimate.data);

const sections = organizeSearchSections({
  mine: [user, userDup],
  recent: [recentOff, { ...user, lastServing: '2개' }],
  db: [official, branded, generic, dbRice],
  estimate: [estimate, estimateSame],
});
const map = Object.fromEntries(sections.map(s => [s.key, s.items]));
check('묶음 순서: 내 음식, 최근, 공식, 추정', sections.map(s => s.key).join(',') === 'mine,recent,db,estimate', sections.map(s => s.key));

const mineNames = map.mine.map(i => i.name);
check('같은 이름+브랜드 사용자 음식은 한 줄, 사용자 값(80kcal)을 씀', map.mine.length === 1 && map.mine[0].name === '랭킹테스트바' && map.mine[0].data.cal === 80, map.mine);
check('사용자 음식은 최근·공식·추정에 다시 안 나옴',
  !map.recent.some(i => i.name === '랭킹테스트바') && !map.db.some(i => compactName(i.name) === '랭킹테스트바' && !i.data.maker) && !map.estimate.some(i => i.name === '랭킹테스트바'),
  { recent: map.recent.map(i => i.name), db: map.db.map(i => i.name), estimate: map.estimate.map(i => i.name) });

check('최근 먹은 공식 음식은 최근 묶음(공식 묶음에 중복 없음)',
  map.recent.some(i => i.name === '랭킹최근밥' && i.lastServing === '1공기') && !map.db.some(i => i.name === '랭킹최근밥'),
  { recent: map.recent, db: map.db.map(i => i.name) });

const dbNames = map.db.map(i => i.name);
const genIdx = dbNames.indexOf('랭킹테스트바 생것');
const brandIdx = dbNames.indexOf('랭킹테스트바 초코');
check('공식 DB는 일반(브랜드 없음)이 브랜드 제품보다 앞', genIdx !== -1 && brandIdx !== -1 && genIdx < brandIdx, dbNames);

check('AI 추정만 있는 음식은 추정 묶음', map.estimate.some(i => i.name === '랭킹추정쿠키' && i.data.aiEstimate), map.estimate);

check('같은 이름 다른 브랜드 키는 다름',
  dedupeKey({ name: '동일바', data: { maker: 'A' } }) !== dedupeKey({ name: '동일바', data: { maker: 'B' } }),
  true);

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
