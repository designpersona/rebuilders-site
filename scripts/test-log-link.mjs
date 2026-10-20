// 기록 링크 파서·검증 테스트: node scripts/test-log-link.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../log-link.js');
const now = new Date(2026, 9, 20, 12, 0, 0);
let failed = 0;
const check = (name, cond, info) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`); if (!cond) failed++; };
const enc = obj => L.buildLogUrl(obj);
const good = { date: '2026-10-20', meal: 'lunch', source: 'openclaw', foods: [
  { name: '이삭토스트 햄치즈', serving: '1개', cal: 420, carbs: 45, protein: 18, fat: 17, sodium: 900, estimate: true, sourceNote: '이삭토스트 공식 영양정보', sourceUrl: 'https://isaac-toast.co.kr/menu' },
  { name: '아이스 아메리카노', serving: '355ml', cal: 10, carbs: 2, protein: 0.5, fat: 0 },
] };

let r = L.parseLogUrl(enc(good), now);
check('정상 링크(rebuilders://) 파싱', r.ok && r.data.meal === 'lunch' && r.data.foods.length === 2 && r.data.foods[0].cal === 420 && r.data.source === 'openclaw', r);
check('추정·출처·출처 URL 유지', r.data.foods[0].estimate === true && r.data.foods[0].sourceNote.includes('공식') && r.data.foods[0].sourceUrl.startsWith('https://'), r.data.foods[0]);
r = L.parseLogUrl(L.buildLogUrl(good, { web: true }), now);
check('https://rebuilders.co.kr/log.html?d= 링크도 파싱', r.ok && r.data.foods.length === 2, r);
r = L.parseLogUrl(enc({ ...good, meal: '점심', date: undefined }), now);
check('한국어 끼니 + 날짜 생략 → 오늘', r.ok && r.data.meal === 'lunch' && r.data.date === '2026-10-20', r);
r = L.parseLogUrl(enc({ meal: 'dinner', foods: [{ name: 'x', cal: 99999, carbs: -1, protein: 'abc', fat: 10, hacker: '<script>', __proto__x: 1 }] }), now);
check('범위 밖·잘못된 숫자는 버리고 알 수 없는 필드는 무시', r.ok && r.data.foods[0].cal === undefined && r.data.foods[0].carbs === undefined && r.data.foods[0].protein === undefined && r.data.foods[0].fat === 10 && !('hacker' in r.data.foods[0]) && r.warnings.length >= 3, r);
r = L.parseLogUrl(enc({ meal: 'lunch', foods: [{ name: 'a'.repeat(300), serving: 'b'.repeat(100) }] }), now);
check('이름 80자·양 40자로 자름', r.ok && r.data.foods[0].name.length === 80 && r.data.foods[0].serving.length === 40, r.data?.foods[0]);
r = L.parseLogUrl(enc({ meal: 'lunch', foods: Array.from({ length: 30 }, (_, i) => ({ name: 'f' + i })) }), now);
check('음식 20개까지만', r.ok && r.data.foods.length === 20, r.data?.foods.length);
check('끼니 없음 → 오류', !L.parseLogUrl(enc({ foods: [{ name: 'a' }] }), now).ok);
check('음식 없음 → 오류', !L.parseLogUrl(enc({ meal: 'lunch', foods: [] }), now).ok);
r = L.parseLogUrl(enc({ ...good, date: '2020-01-01' }), now);
check('1년보다 오래된 날짜 → 오늘 + 경고', r.ok && r.data.date === '2026-10-20' && r.warnings.length, r);
r = L.parseLogUrl(enc({ ...good, date: '2026-02-30' }), now);
check('없는 날짜 → 오늘', r.ok && r.data.date === '2026-10-20', r);
check('다른 도메인 https 링크 거부', !L.parseLogUrl('https://evil.example/log.html?d=' + enc(good).split('d=')[1], now).ok);
check('다른 경로 거부', !L.parseLogUrl('rebuilders://delete?d=' + enc(good).split('d=')[1], now).ok);
check('깨진 base64 거부', !L.parseLogUrl('rebuilders://log?d=@@@', now).ok);
check('JSON 아님 거부', !L.parseLogUrl('rebuilders://log?d=' + L.base64UrlEncode('not json'), now).ok);
check('너무 긴 링크 거부', !L.parseLogUrl('rebuilders://log?d=' + 'A'.repeat(L.MAX_PARAM + 1), now).ok);
r = L.parseLogUrl(enc({ meal: 'snack', foods: [{ name: '비타민', sourceUrl: 'javascript:alert(1)' }] }), now);
check('https가 아닌 출처 URL은 버림', r.ok && r.data.foods[0].sourceUrl === undefined, r.data?.foods[0]);
r = L.parseLogUrl(enc({ meal: 'snack', foods: [{ name: 'a\u0000b\u202ec' }] }), now);
check('제어문자 제거', r.ok && r.data.foods[0].name === 'a b c', r.data?.foods[0]);
check('source가 openclaw가 아니면 link', L.parseLogUrl(enc({ meal: 'snack', foods: [{ name: 'a' }], source: 'x' }), now).data.source === 'link');
console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
