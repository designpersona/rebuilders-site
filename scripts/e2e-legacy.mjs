// 예전 방식으로 저장된 기록(이름만·문자열·null·AI 새 필드·'내일, 바나나'·이상한 간식 슬롯·이상한 날짜 키)이
// 화면에 보이고, 수정 창이 열리고, 지워지는지 확인합니다. Headless Chrome(CDP), Node 22.
// 사용법: (저장소 루트) python3 -m http.server 8765 --bind 127.0.0.1 → node scripts/e2e-legacy.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9344, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-legacy-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=430,900', ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const errors = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const page = list.find(t => t.type === 'page'); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(200);
  }
  throw new Error('chrome not reachable');
}
function send(method, params = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }); }
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}
async function load(url = null) {
  if (url) await send('Page.navigate', { url }); else await send('Page.reload', { ignoreCache: true });
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready')`)) return; } catch {} }
  throw new Error('app not ready');
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
// 10/20 아침: 예전 코드가 펼쳐 저장한 문자열({0:'바',...}), '내일, 바나나'(cal 문자열), AI 새 필드(serving 객체·source 객체), null, 숫자 이름 / 간식: 이름만 초콜릿(슬롯 'x') / 점심: 영양 nutrition 객체
const LEGACY = {
  '2026-10-20': {
    breakfast: [{ 0: '바', 1: '나', 2: '나' }, { name: '내일, 바나나', cal: '93', carbs: '24', protein: null, fat: undefined }, { name: '이삭 햄치즈', officialName: '이삭토스트 햄치즈', inputName: '이삭 햄치즈', estimated: true, source: { name: 'FatSecret', url: 'https://www.fatsecret.kr/x' }, cal: 400, serving: { amount: 1, unit: '개' } }, null, { name: 12345, cal: NaN }],
    lunch: [{ name: '초코우유', nutrition: { kcal: '180', carbs: 25 } }],
    snack: [{ name: '초콜릿', slot: 'x' }, '요거트'],
    dinner: [],
  },
  '2026-10-19T09:00:00.000Z': { dinner: [{ name: '김밥', cal: 300 }] },
};
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); const all = await storageRepository.getAll(); Object.assign(all, ${JSON.stringify(LEGACY).replace('"fat":null', '"fat":null')}); all['2026-10-20'].breakfast[4].cal = NaN; await storageRepository.replaceAll(all); localStorage.removeItem('rebuilders.entriesMigrated.v1'); return 1;`);
  await load();
  const mig = await evaluate(`const all = await storageRepository.getAll(); const d = all['2026-10-20']; const flat = [...d.breakfast, ...d.lunch, ...d.snack, ...d.dinner]; return { n: d.breakfast.length, ids: flat.every(f => typeof f.id === 'string' && f.id), names: flat.every(f => typeof f.name === 'string' && f.name), cal: d.breakfast[1].cal, nan: d.breakfast[3].cal, serving: d.breakfast[2].serving, kept: d.breakfast[2].officialName === '이삭토스트 햄치즈' && d.breakfast[2].estimated === true, lunchCal: d.lunch[0].cal, slot: d.snack[0].slot, yog: d.snack[1]?.name, moved: !all['2026-10-19T09:00:00.000Z'] && all['2026-10-19']?.dinner?.[0]?.name === '김밥', flag: !!localStorage.getItem('rebuilders.entriesMigrated.v1') };`);
  check('한 번 정리: id 부여·이름 글자·숫자 고침·AI 필드 유지·null 항목만 빠짐·간식 슬롯 보정·날짜 키 옮김(지우지 않음)', mig.n === 4 && mig.ids && mig.names && mig.cal === 93 && mig.nan === null && mig.serving === '1개' && mig.kept && mig.lunchCal === 180 && mig.slot === 3 && mig.yog === '요거트' && mig.moved && mig.flag, JSON.stringify(mig));
  const shown = await evaluate(`currentDate = new Date(2026, 9, 20); await loadCurrentDay(); updateDateDisplay(); renderAll(false); await new Promise(r => setTimeout(r, 200)); const names = id => [...document.querySelectorAll('#' + id + ' .food-item .food-name')].map(e => e.textContent); return { b: names('breakfast-items'), snack: [...document.querySelectorAll('.food-item .food-name')].map(e => e.textContent).includes('초콜릿'), kcal: document.getElementById('breakfast-kcal').textContent };`);
  check('10/20 아침·초콜릿이 오류 없이 보임', shown.b.length === 4 && shown.b.includes('내일, 바나나') && shown.snack && /^\d+kcal$/.test(shown.kcal), JSON.stringify(shown));
  const edit = await evaluate(`const idx = meals.snack.foods.findIndex(f => f.name === '초콜릿'); openFoodEdit('snack', idx); await new Promise(r => setTimeout(r, 200)); const title = document.getElementById('edit-food-title')?.textContent || document.querySelector('#meal-detail-modal .open, #meal-detail-modal')?.textContent?.slice(0, 40); const open = document.getElementById('meal-detail-modal').classList.contains('open'); document.getElementById('meal-detail-modal').classList.remove('open'); return { open, title };`);
  check('초콜릿 수정 창 열림', edit.open && String(edit.title).includes('초콜릿'), JSON.stringify(edit));
  const del = await evaluate(`
    const clickDel = name => { const item = [...document.querySelectorAll('.food-item')].find(el => el.querySelector('.food-name')?.textContent === name); if (!item) return false; item.querySelector('.food-del').click(); return true; };
    const a = clickDel('초콜릿'); await new Promise(r => setTimeout(r, 700));
    const b = clickDel('내일, 바나나'); await new Promise(r => setTimeout(r, 700));
    const c = clickDel('12345'); await new Promise(r => setTimeout(r, 700));
    const d = await storageRepository.getDay('2026-10-20');
    const toast = [...document.querySelectorAll('.toast')].map(t => t.textContent).join('|');
    return { clicked: [a, b, c], snack: d.snack.length, breakfast: d.breakfast.map(f => f.name), lunch: d.lunch.length, toast };`);
  check('초콜릿·아침 항목 삭제 → 저장소에서도 빠지고 나머지는 그대로, 오류 안내 없음', del.clicked.every(Boolean) && del.snack === 1 && del.breakfast.join(',') === '바나나,이삭 햄치즈' && del.lunch === 1 && !/못|error|Error/.test(del.toast), JSON.stringify(del));
  const stale = await evaluate(`const f = meals.breakfast.foods[1]; await removeFood('breakfast', 0, f); const d = await storageRepository.getDay('2026-10-20'); return d.breakfast.map(x => x.name).join(',');`);
  check('번호가 어긋나도 id 로 정확한 항목 삭제', stale === '바나나', stale);
  await load();
  const again = await evaluate(`return { runs: await migrateLegacyEntriesOnce() };`);
  check('정리는 한 번만', again.runs?.skipped === true, JSON.stringify(again));
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (error) {
  failed++; results.push('ERROR ' + error.message); results.push('page errors: ' + errors.slice(0, 5).join(' | '));
} finally {
  console.log(results.join('\n'));
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
