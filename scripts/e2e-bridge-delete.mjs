// 영양 채우기(맥 미니) 대기·진행 중에 음식을 지워도 오류·되살아남 없음. 브리지는 가짜(lookup 바꿔치기), 실제 맥 미니·토큰 안 씀.
// 사용법: 정적 서버 8765 → node scripts/e2e-bridge-delete.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9381, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-bridge-del-'));
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
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const setup = `RebuildersBridge.setConfig({ url: 'http://127.0.0.1:9', token: 'dummy-test-token-not-real-0000' });
    window.__calls = []; window.__release = null;
    RebuildersBridge.lookup = job => { __calls.push(job.items.map(i => i.name)); return new Promise(res => { __release = () => res({ items: job.items.map(i => ({ name: i.name, kcal: 300, carbs_g: 30, protein_g: 10, fat_g: 5 })), failed: [] }); }); };`;
  // 1) 대기 중 삭제 → 대기 목록에서도 빠짐
  const a = await evaluate(`${setup}
    await addFood('breakfast', { name: '테스트김밥' });
    RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: 'breakfast', items: [{ name: '테스트김밥' }] });
    const q0 = RebuildersBridge.getQueue().length;
    const i = meals.breakfast.foods.findIndex(f => f.name === '테스트김밥');
    await removeFood('breakfast', i, meals.breakfast.foods[i]);
    return { q0, q1: RebuildersBridge.getQueue().length, left: meals.breakfast.foods.filter(f => f.name === '테스트김밥').length, chip: document.getElementById('bridge-pending')?.hidden };`);
  check('대기 중 삭제 → 대기 목록에서도 빠짐(칩 숨김)', a.q0 === 1 && a.q1 === 0 && a.left === 0, JSON.stringify(a));
  // 2) 채우는 중(맥 미니 응답 기다림) 삭제 → 응답 와도 되살아나지 않음, 오류 없음
  const b = await evaluate(`${setup}
    await addFood('lunch', { name: '테스트라면' }); await addFood('lunch', { name: '테스트만두' });
    RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: 'lunch', items: [{ name: '테스트라면' }, { name: '테스트만두' }] });
    const run = processBridgeQueue();
    for (let k = 0; k < 40 && !__release; k++) await new Promise(r => setTimeout(r, 50));
    if (!__release) return { stuck: true, q: RebuildersBridge.getQueue(), busy: !!bridgeRunPromise, calls: __calls };
    const i = meals.lunch.foods.findIndex(f => f.name === '테스트라면');
    await removeFood('lunch', i, meals.lunch.foods[i]);
    __release(); await run; await new Promise(r => setTimeout(r, 100));
    const saved = await storageRepository.getDay(dateKey(currentDate));
    return { ramen: meals.lunch.foods.filter(f => f.name === '테스트라면').length, savedRamen: (saved?.lunch || []).filter(f => f.name === '테스트라면').length, dumpling: meals.lunch.foods.find(f => f.name === '테스트만두')?.cal, q: RebuildersBridge.getQueue().length };`);
  check('채우는 중 삭제 → 지운 음식 안 되살아남, 남은 음식만 채움, 대기 비움', b.ramen === 0 && b.savedRamen === 0 && b.dumpling === 300 && b.q === 0, JSON.stringify(b));
  // 3) 앱 다시 켰을 때: 이미 지운 음식의 대기 작업은 묻지 않고 조용히 지움
  const c = await evaluate(`${setup}
    RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: 'dinner', items: [{ name: '없는음식' }] });
    const n = await processBridgeQueue();
    return { n, calls: __calls.length, q: RebuildersBridge.getQueue().length };`);
  check('지운 음식만 남은 대기 작업 → 맥 미니에 안 묻고 대기에서 지움', c.n === 0 && c.calls === 0 && c.q === 0, JSON.stringify(c));
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (err) { results.push('ERROR ' + (err.stack || err.message)); failed++; }
finally {
  console.log(results.join('\n'));
  console.log(failed ? `FAIL ${failed}` : `통과 ${results.length}`);
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
