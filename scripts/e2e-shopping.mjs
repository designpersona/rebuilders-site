// Headless Chrome(CDP) 로 장보기 저장·유지와 백업 왕복을 확인합니다. Node 22 내장 WebSocket 사용.
import { spawn } from 'node:child_process';
const PORT = 9333, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 사용법: npm run build && python3 -m http.server 8765 --bind 127.0.0.1 -d www  (다른 터미널) → node scripts/e2e-shopping.mjs
const profile = process.argv[3] || (await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(), 'rb-e2e-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=430,900', 'about:blank'], { stdio: 'ignore' });
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
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof SHOPPING !== 'undefined'`)) return; } catch {} }
  throw new Error('app not ready');
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const snapshot = `return {
  groups: Object.fromEntries(NiliriStorage.SHOPPING_GROUPS.map(g => [g, [...document.querySelectorAll('[data-shopping-group="'+g+'"] > article strong')].map(e => e.textContent)])),
  hidden: NiliriStorage.SHOPPING_GROUPS.filter(g => document.querySelector('[data-shopping-group="'+g+'"]').hidden),
  fridge: [...document.querySelectorAll('#shopping-fridge-list > article strong')].map(e => e.textContent),
  fridgeCount: document.getElementById('shopping-fridge-count')?.textContent,
  stored: (await storageRepository.getAll()).shopping || null,
};`;
const addShopping = name => `document.getElementById('shopping-add-btn').click(); const ed = document.querySelector('.shopping-item-editor'); ed.querySelector('input').value = ${JSON.stringify(name)}; ed.querySelector('.shopping-item-save').click(); await shoppingSaveChain; return true;`;
const addStock = (name, amount) => `document.getElementById('stock-add-btn').click(); const ed = document.querySelector('#shopping-fridge-list > article.is-editing'); ed.querySelector('.collection-fridge-name').value = ${JSON.stringify(name)}; ed.querySelector('.collection-fridge-amount').value = ${JSON.stringify(amount)}; ed.querySelector('.collection-fridge-save').click(); await shoppingSaveChain; return true;`;
const clickIn = (name, sel) => `const a = [...document.querySelectorAll('.shopping-section article')].find(x => x.querySelector('strong')?.textContent === ${JSON.stringify(name)}); a.querySelector(${JSON.stringify(sel)}).click(); await shoppingSaveChain; return true;`;
try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ')); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  let s = await evaluate(snapshot);
  check('첫 실행: 장보기·창고 비어 있음', Object.values(s.groups).every(g => !g.length) && !s.fridge.length && s.hidden.length === 4, JSON.stringify(s.groups));
  check('첫 실행: 저장소에 shopping 키 없음(예전 데이터 형태 유지)', s.stored === null);

  await evaluate(addShopping('서울우유 1L')); await evaluate(addShopping('두부')); await evaluate(addShopping('바나나'));
  await evaluate(clickIn('두부', '.shopping-check'));
  await evaluate(addStock('계란', '10개'));
  s = await evaluate(snapshot);
  check('추가·구매완료 즉시 반영', s.groups.priority.join() === '서울우유 1L,바나나' && s.fridge.join() === '계란,두부', JSON.stringify(s));
  await load();
  s = await evaluate(snapshot);
  check('새로고침 후 유지(장보기 2, 창고 2)', s.groups.priority.join() === '서울우유 1L,바나나' && s.fridge.join() === '계란,두부' && s.fridgeCount === '2', JSON.stringify(s.groups) + ' / ' + s.fridge);

  await evaluate(clickIn('서울우유 1L', '.shopping-remove'));
  await evaluate(clickIn('두부', '.shopping-check')); // 구매 취소 → 장보기로 되돌림
  await load();
  s = await evaluate(snapshot);
  check('삭제·되돌리기 후 새로고침 유지', s.groups.priority.join() === '바나나,두부' && s.fridge.join() === '계란', JSON.stringify(s.groups) + ' / ' + s.fridge);

  // 전부 삭제 → 새로고침해도 다시 생기지 않음(이번 버그)
  await evaluate(clickIn('바나나', '.shopping-remove')); await evaluate(clickIn('두부', '.shopping-remove'));
  await evaluate(`document.querySelector('#shopping-fridge-list .collection-fridge-remove').click(); await shoppingSaveChain; return true;`);
  await load();
  s = await evaluate(snapshot);
  check('전부 삭제 후 새로고침해도 빈 상태 유지', Object.values(s.groups).every(g => !g.length) && !s.fridge.length && s.stored && !s.stored.items.length && !s.stored.stock.length, JSON.stringify(s.stored));

  // 백업 왕복
  await evaluate(addShopping('그릭요거트')); await evaluate(addStock('현미밥', '3개')); await evaluate(clickIn('그릭요거트', '.shopping-check'));
  await evaluate(`await storageRepository.saveDay('2026-10-19', { breakfast: [{ name: '바나나', cal: 93 }], lunch: [], snack: [], dinner: [] }); return true;`);
  const rt = await evaluate(`
    const before = await storageRepository.getAll();
    const text = JSON.stringify(NiliriBackup.buildBackup(before));
    const parsed = NiliriBackup.parseBackup(text);
    await storageRepository.replaceAll({});
    await storageRepository.replaceAll(parsed.state);
    return { ok: parsed.ok, inFile: JSON.parse(text).data.shopping, summary: parsed.summary, before: before.shopping };`);
  check('백업 파일에 shopping 포함', rt.inFile && rt.inFile.items.length === 1 && rt.inFile.stock.length === 1);
  check('백업 검증 통과·요약에 장보기 개수', rt.ok && rt.summary.shoppingItems === 1 && rt.summary.stockItems === 1);
  await load();
  s = await evaluate(snapshot);
  const day = await evaluate(`return (await storageRepository.getAll())['2026-10-19']?.breakfast?.length`);
  check('백업 비우기→가져오기→새로고침 후 동일', JSON.stringify(s.stored) === JSON.stringify(rt.before) && s.fridge.join() === '현미밥,그릭요거트' && day === 1, s.fridge.join());
  const merge = await evaluate(`
    const cur = await storageRepository.getAll();
    const inc = { shopping: { items: [{ id: 'x1', name: '사과', group: 'priority', status: 0, bought: false }], stock: [] } };
    return NiliriBackup.mergeStates(cur, NiliriBackup.validateBackup({ format: 'rebuilders-backup', app: 'rebuilders-food-tracker', version: 1, data: inc }).state).shopping.items.map(i => i.name);`);
  check('합치기 모드: 기존 장보기 + 백업 장보기', merge.join() === '그릭요거트,사과', merge.join());
  const oldBackup = await evaluate(`const r = NiliriBackup.validateBackup({ format: 'rebuilders-backup', app: 'rebuilders-food-tracker', version: 1, data: { '2026-10-18': { breakfast: [], lunch: [], snack: [], dinner: [] }, settings: { weight: 60 } } }); return { ok: r.ok, hasShopping: 'shopping' in r.state, warnings: r.warnings };`);
  check('예전 백업(shopping 없음) 가져오기 호환', oldBackup.ok && !oldBackup.hasShopping && !oldBackup.warnings.length);
  const bad = await evaluate(`return NiliriBackup.validateBackup({ format: 'rebuilders-backup', app: 'rebuilders-food-tracker', version: 1, data: { shopping: { items: 'x' } } }).ok`);
  check('잘못된 shopping 형식은 거부', bad === false);

  // 예전 저장 데이터(shopping 키 없음) 마이그레이션
  await evaluate(`await storageRepository.replaceAll({ '2026-10-17': { breakfast: [{ name: '사과', cal: 52 }], lunch: [], snack: [], dinner: [] }, settings: { weight: 61, height: 170, targetCal: 1800, locale: 'ko' }, customFoods: { '내우유': { cal: 60, serving: '100ml' } }, recentFoods: [] }); return true;`);
  await load();
  s = await evaluate(snapshot);
  const legacy = await evaluate(`const a = await storageRepository.getAll(); return { day: a['2026-10-17']?.breakfast?.length, w: a.settings?.weight, cf: Object.keys(a.customFoods || {}).length, shopping: 'shopping' in a };`);
  check('예전 데이터 로드: 장보기 빈 상태, 식단·설정·내 음식 그대로', !s.fridge.length && Object.values(s.groups).every(g => !g.length) && legacy.day === 1 && legacy.w === 61 && legacy.cf === 1, JSON.stringify(legacy));

  // 상태 버튼 저장(샘플)
  await evaluate(`window.confirm = () => true; document.getElementById('load-sample').click(); return true;`);
  await sleep(1500);
  await load();
  s = await evaluate(snapshot);
  check('샘플 불러오기: 장보기 예시 4개 추가', Object.values(s.groups).flat().length === 4, JSON.stringify(s.groups));
  await evaluate(clickIn('그릭요거트', '.shopping-action'));
  await load();
  const st = await evaluate(`return [...document.querySelectorAll('[data-shopping-group="make"] .shopping-action')].map(b => b.textContent).join()`);
  check('상태 버튼(재료 있음→만들기 예정) 새로고침 후 유지', st === '만들기 예정', st);
  await evaluate(`await saveSettings({ locale: 'en' }); return true;`); await load();
  const en = await evaluate(`return [...document.querySelectorAll('.shopping-section article strong')].map(e => e.textContent).join()`);
  check('영어 전환 시 샘플 항목 영어 표시(사용자 항목 덮어쓰지 않음)', en.includes('Eggs') && en.includes('Greek Yogurt'), en);
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (error) {
  failed++; results.push('ERROR ' + error.message); results.push('page errors: ' + errors.slice(0,5).join(' | ')); try { results.push('state: ' + JSON.stringify(await evaluate("return { ready: document.body?.className, url: location.href, sh: typeof SHOPPING, title: document.title }"))); } catch (e) { results.push('eval fail ' + e.message); }
} finally {
  console.log(results.join('\n'));
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  try { ws?.close(); } catch {}
  chrome.kill();
  process.exit(failed ? 1 : 0);
}
