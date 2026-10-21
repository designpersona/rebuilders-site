// 성능: 내 음식 5,000개 + 식단 기록 20,000개에서 통합 검색 색인·검색·그리기·바깥 조회 기다림 시간 측정(PERF 줄에 숫자)
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9369, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-perf-search-'));
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
const touch = (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
const panelX = view => evaluate(`const m = (document.getElementById('${view}').style.transform || '').match(/translate(?:X|3d)\\((-?[\\d.]+)px/); return m ? parseFloat(m[1]) : 0;`);
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
  // 큰 데이터: 내 음식 5,000개 + 식단 기록 20,000개(1,000일 × 20개)
  await evaluate(`const all = await storageRepository.getAll(); const words = ['닭', '소고기', '두부', '김치', '현미', '고구마', '연어', '요거트', '샐러드', '라면', '우유', '사과', '바나나', '오트밀', '계란'];
    const custom = {}; for (let k = 0; k < 5000; k++) { const n = words[k % words.length] + ' 큰데이터 ' + k; custom[n] = { cal: 50 + (k % 400), carbs: k % 60, protein: k % 30, fat: k % 20, serving: '100g', discoveryOrigin: 'meal' }; }
    all.customFoods = { ...(all.customFoods || {}), ...custom };
    const names = Object.keys(custom); const start = new Date(); start.setDate(start.getDate() - 1000);
    for (let d = 0; d < 1000; d++) { const t = new Date(start); t.setDate(start.getDate() + d); const key = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
      const day = { breakfast: [], lunch: [], snack: [], dinner: [] }; for (let j = 0; j < 20; j++) { const n = names[(d * 7 + j * 13) % 900]; day[['breakfast', 'lunch', 'snack', 'dinner'][j % 4]].push({ name: n, ...custom[n] }); } all[key] = day; }
    await storageRepository.replaceAll(all); return Object.keys(all).length;`);
  const t0 = Date.now(); await load(); const startMs = Date.now() - t0;
  const perf = await evaluate(`for (let k = 0; k < 100 && !FoodSearch.ready(); k++) ${W8(50)}
    const first = { ...FoodSearch.stats };
    FoodSearch.invalidate(); const b0 = performance.now(); await FoodSearch.build(); const rebuild = performance.now() - b0;
    const qs = ['닭', '김치 큰', '큰데이터 4321', '바나나', '없는음식zz']; const times = {};
    for (const q of qs) { FoodSearch.search(q); const a = performance.now(); for (let k = 0; k < 20; k++) FoodSearch.search(q); times[q] = +((performance.now() - a) / 20).toFixed(2); }
    const counts = Object.fromEntries(qs.map(q => [q, FoodSearch.search(q).sections.map(s => s.key + ':' + s.items.length).join(' ')]));
    setActiveView('foodex'); setFoodexPageTab('index'); ${W8(400)}
    const i = document.getElementById('foodex-search-input'); const r0 = performance.now(); i.value = '닭'; i.dispatchEvent(new Event('input', { bubbles: true })); const render = performance.now() - r0;
    const rows = document.querySelectorAll('#foodex-results .fs-row').length;
    const calls = []; FoodSearch.externalProvider = (q, signal) => new Promise(res => { calls.push(q); setTimeout(() => res([]), 30); });
    const before = FoodSearch.stats.externalCalls; for (const v of ['김', '김치', '김치 ', '김치 큰', '김치 큰데']) { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); ${W8(40)} } ${W8(320)}
    const ext = FoodSearch.stats.externalCalls - before; FoodSearch.externalProvider = null;
    const c0 = performance.now(); foodLogCount('닭 큰데이터 0'); const countMs = performance.now() - c0;
    return { first, rebuild: +rebuild.toFixed(1), times, counts, render: +render.toFixed(1), rows, ext, calls, countMs: +countMs.toFixed(3) };`);
  console.log('PERF ' + JSON.stringify({ startMs, ...perf }));
  check('색인 만들기(앱 켜고 한 번, 기록 20,000개): 읽기+만들기 1.5초 안, 전체 날짜·기록 수 맞음', perf.first.days >= 1000 && perf.first.entries >= 20000 && perf.first.readMs + perf.first.buildMs < 1500, JSON.stringify(perf.first));
  check('검색 한 번(음식 5,000개+기본 목록): 평균 30ms 안', Object.values(perf.times).every(ms => ms < 30), JSON.stringify(perf.times));
  check('글자 치면 바로 결과 그리기(5줄씩): 60ms 안', perf.render < 60 && perf.rows > 0 && perf.rows <= 15, JSON.stringify([perf.render, perf.rows]));
  check('빠르게 5번 치면 바깥 조회는 1번(마지막 글자)', perf.ext === 1 && perf.calls.length === 1 && perf.calls[0] === '김치 큰데', JSON.stringify(perf.calls));
  check('먹은 횟수 세기(식도감 정렬용)는 색인으로 즉시', perf.countMs < 2, String(perf.countMs));
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
