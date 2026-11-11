// 공식 DB 브랜드 검색: node scripts/test-mfds-brand.mjs
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { globalThis: null, performance: { now: () => Date.now() } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'mfds.js'), 'utf8'), ctx);
const Mfds = ctx.MfdsDB;

let failed = 0;
function check(name, cond, info) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`);
  if (!cond) failed++;
}

const fixture = {
  date: '2026-09-29',
  makers: ['버거킹', '파리바게뜨', '뚜레쥬르'],
  rows: [
    ['햄버거 와퍼', 0, 0, 0, 286, 247, 20, 15, 13],
    ['햄버거 치즈와퍼', 0, 0, 0, 310, 258, 21, 16, 14],
    ['파이/만주 클래식애플파이', 1, 0, 0, 75, 313, 40, 4, 15],
    ['파이/만주 카라멜애플파이', 2, 0, 0, 80, 300, 38, 4, 14],
    ['사과파이', -1, 0, 0, 100, 250, 35, 3, 12],
  ],
};
Mfds.applyData(fixture);

const whopper = Mfds.search('버거킹 와퍼', 10);
check('버거킹 와퍼는 버거킹 와퍼만 정확 매칭',
  whopper[0]?.name === '햄버거 와퍼' && whopper[0]?.data.maker === '버거킹' && whopper[0]?.brandExact, whopper);
check('버거킹 와퍼는 치즈와퍼를 정확 매칭하지 않음',
  !whopper.some(item => item.name === '햄버거 치즈와퍼' && item.brandExact), whopper);

const missing = Mfds.search('버거킹 애플파이', 10);
check('버거킹 애플파이는 다른 브랜드 파이와 매칭하지 않음', missing.length === 0, missing);

const bakery = Mfds.search('파리바게뜨 애플파이', 10);
check('파리바게뜨 애플파이는 파리바게뜨만',
  bakery.length >= 1 && bakery.every(item => item.data.maker === '파리바게뜨'), bakery);

const plain = Mfds.search('애플파이', 10);
check('애플파이만 검색하면 파리바게뜨 파이도 나오지만 버거킹으로 붙지 않음',
  plain.some(item => item.name.includes('애플파이') && item.data.maker === '파리바게뜨')
  && !plain.some(item => item.data.maker === '버거킹'), plain);

const realPath = join(root, 'data/mfds.json');
if (existsSync(realPath)) {
  const data = JSON.parse(readFileSync(realPath, 'utf8'));
  Mfds.applyData(data);
  const real = Mfds.search('버거킹 와퍼', 5);
  check('실제 식약처 DB에서 버거킹 와퍼를 찾음',
    real[0]?.data.maker === '버거킹' && /와퍼/.test(real[0]?.name) && real[0]?.brandExact && real[0]?.data.cal > 0, real[0]);
  const pie = Mfds.search('버거킹 애플파이', 10);
  check('실제 식약처 DB에 버거킹 애플파이는 없음(다른 브랜드 파이로 대체하지 않음)', pie.length === 0, pie);
  const count = data.rows.filter(row => row[1] >= 0 && data.makers[row[1]] === '버거킹').length;
  check('실제 DB에 버거킹 메뉴가 여러 개 있음', count >= 20, count);
}

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
