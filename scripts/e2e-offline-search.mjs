// 맥 미니(브리지) 꺼짐·느림: 식도감 통합 검색과 AI 칩이 '찾는 중'에 멈추지 않는지 (연결 3초 제한·45초 쉬기·안내 문구).
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-offline-search.mjs  (실제 브리지는 쓰지 않음: fetch를 바꿔 끼움)
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9373, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-offline-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=430,900', ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const errors = []; const netLog = [];
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
const touch = (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Network.requestWillBeSent') netLog.push(m.params.request.url); if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
  await evaluate(`await saveCustomFood('오프테스트 요거트', { cal: 90, carbs: 12, protein: 5, fat: 2, serving: '1개' });
    window.__realFetch = window.fetch; window.__calls = [];
    // 꺼진 맥 미니처럼: 응답 없이 붙잡고, 취소될 때만 끝남
    window.__hang = (url, opts = {}) => { window.__calls.push(String(url)); return new Promise((_, rej) => opts.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))); };
    window.__slow = (url, opts = {}) => { window.__calls.push(String(url)); const body = String(url).endsWith('/health') ? { ok: true } : { ok: true, items: [{ name: '오프라인떡', display_name: '오프라인떡', kcal: 200, carbs_g: 40, protein_g: 3, fat_g: 1, serving: '1개' }], failed: [] };
      return new Promise(res => setTimeout(() => res(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })), String(url).endsWith('/health') ? 50 : 1500)); };
    document.querySelector('#page-tabs .page-tab[data-view="foodex"]').click(); ${W8(500)} return 1;`);
  const type = v => `{ const i = document.getElementById('foodex-search-input'); i.value = '${v}'; i.dispatchEvent(new Event('input', { bubbles: true })); }`;
  const view = `const c = document.getElementById('foodex-results'); return { rows: [...c.querySelectorAll('.fs-row .fs-name')].map(n => n.textContent), note: c.querySelector('.fs-note')?.textContent || '', noteFont: c.querySelector('.fs-note') ? getComputedStyle(c.querySelector('.fs-note')).font : '', empty: c.querySelector('.fs-empty')?.textContent || '', register: !!c.querySelector('.fs-register'), spin: document.querySelectorAll('#foodex-results .is-busy, #foodex-results [aria-busy="true"]').length };`;
  const mfdsBefore = await evaluate(`return MfdsDB.ready;`); netLog.length = 0; // 여기부터 실제 네트워크 요청 기록(바깥 조회는 fetch 를 바꿔 끼워 실제 요청 없음)
  // 1. 바깥 조회가 응답 없음(느린/꺼진 연결): 로컬 결과는 바로, 3초 뒤 안내 문구, 요청은 취소
  const r1 = await evaluate(`let aborted = 0; window.__ext = 0;
    FoodSearch.externalProvider = (q, signal) => { window.__ext++; return new Promise(() => signal.addEventListener('abort', () => aborted++)); };
    ${type('오프테스트')} const local = [...document.querySelectorAll('#foodex-results .fs-row .fs-name')].map(n => n.textContent);
    ${W8(1000)} const mid = document.querySelector('#foodex-results .fs-note') ? 1 : 0; ${W8(2600)}
    const v = (() => { ${view} })(); return { local, mid, aborted, ext: window.__ext, ...v };`);
  check('바깥 조회가 멈춰도 로컬 결과는 바로, 3초 뒤 회색 안내(12px/500) + 요청 취소', r1.local.includes('오프테스트 요거트') && r1.mid === 0 && /맥 미니에 연결되지 않아 영양 DB는 찾지 못했어요/.test(r1.note) && /500 12px/.test(r1.noteFont) && r1.aborted === 1 && r1.rows.includes('오프테스트 요거트') && r1.spin === 0, JSON.stringify(r1));
  // 2. 쉬는 시간(45초) 동안 글자를 더 쳐도 바깥 조회를 다시 기다리지 않음
  const r2 = await evaluate(`const before = window.__ext; ${type('오프테스트 요')} ${W8(400)} ${type('오프테스트 요거')} ${W8(400)} const v = (() => { ${view} })(); return { calls: window.__ext - before, ...v };`);
  check('연결 실패 뒤 쉬는 동안 키 입력마다 다시 부르지 않고 안내만 유지', r2.calls === 0 && /영양 DB는 찾지 못했어요/.test(r2.note) && r2.rows.includes('오프테스트 요거트'), JSON.stringify(r2));
  // 3. 어디에도 없으면: 결과 없음 + 직접 등록 줄 + 안내, 멈춘 표시 없음
  const r3 = await evaluate(`${type('존재하지않는음식xyz')} ${W8(500)} return (() => { ${view} })();`);
  check("아무것도 없으면 '결과 없음' + 직접 등록 줄(+ 연결 안내), 도는 표시 없음", r3.empty === '결과 없음' && r3.register && r3.rows.length === 0 && r3.spin === 0, JSON.stringify(r3));
  // 4. 오류로 끝나는 바깥 조회도 같은 처리
  const r4 = await evaluate(`FoodSearch.externalOfflineUntil = 0; FoodSearch.externalProvider = () => Promise.reject(new TypeError('Load failed')); ${type('')} ${W8(100)} ${type('오프테스트')} ${W8(600)} const v = (() => { ${view} })(); FoodSearch.externalProvider = null; FoodSearch.externalOfflineUntil = 0; ${type('')} return v;`);
  check('바깥 조회 오류도 바로 안내로 끝남', /영양 DB는 찾지 못했어요/.test(r4.note) && r4.rows.includes('오프테스트 요거트'), JSON.stringify(r4));
  // 5. 브리지 꺼짐: AI 칩이 3초 안팎에 '맥 미니 연결 대기'로 끝나고, 대기 기록은 그대로(시도 횟수 안 늘어남)
  const r5 = await evaluate(`RebuildersBridge.setConfig({ url: '127.0.0.1:3999', token: 'test_token_for_offline_e2e_000' }); RebuildersBridge.resetOffline();
    window.fetch = window.__hang; window.__calls = [];
    await addFood('snack', { name: '오프라인떡' }); RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: 'snack', items: [{ name: '오프라인떡' }] }); // 실제처럼 이름만 저장된 기록이 있어야 대기(지운 음식 대기는 정리됨)
    const t0 = performance.now(); const p = processBridgeQueue({ announce: true }); ${W8(300)}
    const chipMid = document.getElementById('bridge-pending').textContent; await p; const ms = Math.round(performance.now() - t0);
    const chip = document.getElementById('bridge-pending'); const q = RebuildersBridge.getQueue();
    return { ms, chipMid, chip: chip.textContent, working: chip.classList.contains('is-working'), hidden: chip.hidden, queue: q.length, attempts: q[0]?.attempts, calls: window.__calls.map(u => u.replace(/^https?:\\/\\/[^/]+/, '')) };`);
  check("브리지 꺼짐: 'AI가 찾는 중'이 3초 안팎에 끝나고 칩은 '맥 미니 연결 대기 1', 기록은 대기 유지(시도 0)", /채우는 중/.test(r5.chipMid) && r5.ms >= 2800 && r5.ms < 4500 && r5.chip === '맥 미니 연결 대기 1' && !r5.working && !r5.hidden && r5.queue === 1 && r5.attempts === 0 && JSON.stringify(r5.calls) === '["/health"]', JSON.stringify(r5));
  // 6. 쉬는 동안 화면 복귀·자동 재시도는 네트워크 없이 바로 끝남, AI로 찾기 버튼도 바로 원래대로
  const r6 = await evaluate(`window.__calls = []; const t0 = performance.now(); await processBridgeQueue(); const ms = Math.round(performance.now() - t0);
    const b = document.createElement('button'); b.innerHTML = '<span>✦</span><span>AI로 찾기</span>'; const t1 = performance.now(); await findFoodWithAi('오프라인떡', b); const aiMs = Math.round(performance.now() - t1);
    return { ms, aiMs, label: b.querySelector('span:last-child').textContent, disabled: b.disabled, calls: window.__calls.length, chip: document.getElementById('bridge-pending').textContent };`);
  check('쉬는 동안 재시도·AI로 찾기는 네트워크 없이 바로 끝나고 버튼 원래대로', r6.ms < 300 && r6.aiMs < 300 && r6.label === 'AI로 찾기' && !r6.disabled && r6.calls === 0 && r6.chip === '맥 미니 연결 대기 1', JSON.stringify(r6));
  // 7. 느린 맥 미니(연결은 됨, 답이 1.5초): 칩을 눌러 다시 시도 → 쉬는 시간 무시, 채워지고 칩 사라짐
  const r7 = await evaluate(`window.fetch = window.__slow; window.__calls = []; await addFood('snack', { name: '오프라인떡', serving: '1개' }); ${W8(200)}
    document.getElementById('bridge-pending').click(); ${W8(400)} const mid = document.getElementById('bridge-pending').textContent;
    for (let k = 0; k < 40 && RebuildersBridge.getQueue().length; k++) ${W8(100)} ${W8(300)}
    const chip = document.getElementById('bridge-pending'); const f = meals.snack.foods.find(x => x.name === '오프라인떡');
    window.fetch = window.__realFetch; RebuildersBridge.setConfig({ url: '', token: '' });
    return { mid, hidden: chip.hidden, working: chip.classList.contains('is-working'), cal: f?.cal, queue: RebuildersBridge.getQueue().length, calls: window.__calls.map(u => u.replace(/^https?:\\/\\/[^/]+/, '')) };`);
  check('느린 맥 미니: 칩 눌러 다시 시도하면 기다렸다가 채우고 칩이 사라짐', /채우는 중/.test(r7.mid) && r7.hidden && !r7.working && r7.cal === 200 && r7.queue === 0 && r7.calls[0] === '/health' && (r7.calls.includes('/jobs') || r7.calls.includes('/log')), JSON.stringify(r7));
  // 8. 식약처 내장 DB: 첫 검색 때만 앱 안 파일(data/mfds.json) 하나를 읽고, 검색 중 다른 요청은 없음
  await evaluate(`window.fetch = window.__realFetch; FoodSearch.externalProvider = null; FoodSearch.externalOfflineUntil = 0; ${type('')} return 1;`);
  const r8 = await evaluate(`const t0 = performance.now(); ${type('햇반')} for (let k = 0; k < 100 && !MfdsDB.ready; k++) ${W8(50)} ${W8(200)} const firstMs = Math.round(performance.now() - t0);
    const sec = document.querySelector('#foodex-results [data-section="db"]');
    const rows = sec ? [...sec.querySelectorAll('.fs-row')].map(b => ({ name: b.querySelector('.fs-name').textContent, src: b.querySelector('.fs-src').textContent })) : [];
    const lat = []; for (const q of ['햇', '햇반', '닭가슴살', '라면', '김치']) { FoodSearch.search(q); lat.push(FoodSearch.stats.lastSearchMs); }
    return { firstMs, loadMs: MfdsDB.state.loadMs, parseMs: MfdsDB.state.parseMs, total: FoodSearch.stats.mfdsTotal, rows, lat };`);
  const req8 = netLog.slice();
  check("'햇반': 영양 DB 묶음에 CJ 제품, 검색하는 동안 바깥 요청 0, 앱 안 data/mfds.json 은 첫 검색 때 한 번(그 밖엔 화면 아이콘뿐)", !mfdsBefore && r8.rows.some(r => /햇반/.test(r.name) && /씨제이|CJ/i.test(r.src)) && req8.filter(u => /\/data\/mfds\.json$/.test(u)).length === 1 && req8.every(u => u.startsWith(new globalThis.URL(URL).origin + '/') && !/\.(json|php)$|\/(log|health|photo)$/.test(u.replace(/\/data\/mfds\.json$/, ''))), JSON.stringify({ ...r8, rows: r8.rows.slice(0, 3), req8 }));
  console.log(`MFDS 첫 검색 ${r8.firstMs}ms (파일 읽기 ${r8.loadMs}ms + 색인 ${r8.parseMs}ms), 검색 ${JSON.stringify(r8.lat)}ms`);
  netLog.length = 0;
  const r9 = await evaluate(`${type('김치찌개')} ${W8(300)} const sec = document.querySelector('#foodex-results [data-section="db"]');
    return { rows: sec ? [...sec.querySelectorAll('.fs-row')].map(b => ({ name: b.querySelector('.fs-name').textContent, src: b.querySelector('.fs-src').textContent })) : [] };`);
  check("'김치찌개': 영양 DB 묶음에 식약처 음식, 두 번째 검색부터는 요청 0", r9.rows.length > 0 && r9.rows.every(r => /김치찌개/.test(r.name)) && r9.rows.some(r => /식약처/.test(r.src)) && netLog.length === 0, JSON.stringify({ rows: r9.rows.slice(0, 3), net: netLog }));
  // 10. 고른 식약처 음식을 끼니에 넣고 수정 창에서 g 을 바꾸면 kcal 이 비례
  const r10 = await evaluate(`const item = MfdsDB.search('김치찌개', 5)[0].data; setActiveView('home'); Object.keys(meals).forEach(k => { meals[k].foods = []; }); renderAll(true);
    await addFood('lunch', item); ${W8(300)} openFoodEdit('lunch', 0); ${W8(300)}
    const amt = document.querySelector('[data-serving-amount]'); const cal = () => document.querySelector('#meal-detail-edit-grid [data-edit-field="cal"]').value;
    const a = { amount: amt.value, unit: document.querySelector('[data-serving-unit]').value, cal: cal() };
    amt.value = String(Number(amt.value) * 2); amt.dispatchEvent(new Event('input', { bubbles: true })); const b = { amount: amt.value, cal: cal() };
    document.querySelector('#meal-detail-modal .modal-close, #meal-detail-close')?.click(); closeFoodEdit?.(); return { item: { name: item.name, cal: item.cal, serving: item.serving, per100: item.per100 }, a, b };`);
  check('식약처 음식 추가 → 수정 창에서 양 2배 → kcal 2배', Number(r10.a.cal) === r10.item.cal && Math.abs(Number(r10.b.cal) - r10.item.cal * 2) <= 1 && r10.item.serving === `${r10.a.amount}${r10.a.unit}`, JSON.stringify(r10));
  if (process.env.SHOT) { await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="foodex"]')?.click(); ${W8(400)} ${type('햇반')} ${W8(400)} return 1;`); const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(process.env.SHOT, Buffer.from(r.data, 'base64')); }
  // 식약처 검색 순서·묶기: '귤' → 첫 줄은 귤 생것 묶음(대표 1줄 + 비슷한 항목), 위 5개에 가공식품 없음, 목록 이름 정리('(생것)'), 시트엔 그룹 5개 + '비슷한 항목 N개 더 보기'
  const gq = await evaluate(`await MfdsDB.load(); await FoodSearch.build(); const r = FoodSearch.search('귤'); const db = r.sections.find(s => s.key === 'db').items;
    const egg = FoodSearch.search('계란').sections.find(s => s.key === 'db').items[0];
    closeModal?.(); openModal('snack'); ${W8(400)} const f = document.getElementById('food-search'); f.value = '귤'; f.dispatchEvent(new Event('input', { bubbles: true })); ${W8(600)}
    const rows = [...document.querySelectorAll('#quick-foods .sheet-food-row')]; const names = rows.map(x => x.querySelector('.chip-name').textContent);
    const sim = document.querySelector('#quick-foods .fs-similar')?.textContent || ''; const attrib = document.querySelector('#quick-foods .fs-attrib')?.textContent || '';
    const sub = rows[0]?.querySelector('.chip-sub')?.textContent || '';
    rows[0].querySelector('.quick-food-chip').click(); ${W8(100)} const src = document.querySelector('#food-pick-detail .fpd-source')?.textContent || ''; document.getElementById('fpd-add').click(); ${W8(50)}
    const before = meals.snack.foods.length; document.getElementById('food-tray-save').click(); ${W8(900)} const logged = meals.snack.foods[before] || {};
    const bap = FoodSearch.search('밥').sections.find(s => s.key === 'db').items.slice(0, 5).map(x => x.name);
    closeModal(); return { first: db[0]?.name, firstOrig: db[0]?.data?.nutritionSource?.name, firstSim: db[0]?.similar?.length || 0, top5Kinds: db.slice(0, 5).map(x => x.data?.mfdsKind || 'app'), egg: [egg?.name, egg?.data?.serving, egg?.data?.servingGrams, egg?.data?.cal], names: names.slice(0, 6), sub, src, logged: [logged.name, logged.cal, logged.serving, logged.nutritionSource?.name, 'genericHint' in logged], bap, dbRows: rows.length, sim, attrib };`);
  check("'귤' 검색: 첫 줄은 그냥 '귤'(온주밀감 생것 기준 힌트), 상세에 원래 이름, 기록 이름 '귤'·39kcal·원래 이름 보관·힌트는 기록 안 됨, 위 5개 가공식품 없음, 비슷한 항목 더 보기, 식약처 작게 · '계란' → '계란' 1개 50g 68kcal · '밥' 위 5개에 밥 옥광 없음", gq.first === '귤' && gq.firstOrig === '귤 온주밀감 생것' && gq.firstSim >= 5 && !gq.top5Kinds.includes('가공식품') && gq.names[0] === '귤' && gq.sub === '온주밀감 생것 기준 · 100g · 39kcal' && /귤 온주밀감 생것/.test(gq.src) && JSON.stringify(gq.logged) === JSON.stringify(['귤', 39, '100g', '귤 온주밀감 생것', false]) && /^비슷한 항목 \d+개 더 보기$/.test(gq.sim) && gq.attrib === '식약처' && JSON.stringify(gq.egg) === JSON.stringify(['계란', '1개', 50, 68]) && !gq.bap.some(n => /옥광/.test(n)) && gq.dbRows <= 6, JSON.stringify(gq));
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
