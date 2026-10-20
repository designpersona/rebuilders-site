// 홈 반원 칼로리 게이지: 먹은 ↔ 남은(초과) 칼로리 탭 전환, 기기에 기억, 채움 비율. Headless Chrome(CDP), Node 22.
// 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-gauge.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9352, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-gauge-'));
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
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); localStorage.removeItem('rebuilders.kcalGaugeMode.v1'); return 1;`);
  await load();
  const read = `const g = document.getElementById('kcal-gauge'); const r = g.getBoundingClientRect(); return { mode: g.dataset.mode, label: document.getElementById('kcal-gauge-label').textContent, value: document.getElementById('kcal-gauge-value').textContent, goal: document.getElementById('kcal-gauge-goal').textContent, off: parseFloat(document.getElementById('kcal-gauge-fill').style.strokeDashoffset), over: g.classList.contains('is-over'), saved: localStorage.getItem('rebuilders.kcalGaugeMode.v1'), shown: r.width > 0 && r.height > 0, meterHidden: getComputedStyle(document.getElementById('calorie-summary-toggle')).display === 'none', avatar: getComputedStyle(document.querySelector('#view-home .main-avatar')).display };`;
  const goal = await evaluate(`return TARGETS.cal;`);
  await evaluate(`updateRing({ cal: 500, carbs: 60, protein: 20, fat: 10 }, false); return 1;`);
  const a = await evaluate(read);
  check('게이지 보임·캐릭터와 예전 Kcal 막대 숨김', a.shown && a.meterHidden && a.avatar === 'none', JSON.stringify(a));
  check('처음엔 먹은 칼로리 500 / 목표, 채움 = 먹은/목표', a.mode === 'eaten' && a.label === '먹은 칼로리' && a.value === '500' && a.goal === goal.toLocaleString() && Math.abs(a.off - (100 - 500 / goal * 100)) < 0.1, JSON.stringify(a));
  await evaluate(`document.getElementById('kcal-gauge').click(); return 1;`);
  const b = await evaluate(read);
  check('탭 → 남은 칼로리(목표 − 먹은), 기기에 기억, 채움은 그대로', b.mode === 'left' && b.label === '남은 칼로리' && b.value === (goal - 500).toLocaleString() && b.saved === 'left' && b.off === a.off, JSON.stringify(b));
  await load();
  await evaluate(`updateRing({ cal: 500, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
  const c = await evaluate(read);
  check('다시 열어도 남은 칼로리 보기 유지', c.mode === 'left' && c.label === '남은 칼로리', JSON.stringify(c));
  await evaluate(`updateRing({ cal: ${goal} + 200, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
  const d = await evaluate(read);
  check('목표 넘으면 초과 칼로리 200, 게이지 가득', d.label === '초과 칼로리' && d.value === '200' && d.over && d.off === 0, JSON.stringify(d));
  await evaluate(`document.getElementById('kcal-gauge').click(); return 1;`);
  const e = await evaluate(read);
  check('다시 탭 → 먹은 칼로리로 돌아옴', e.mode === 'eaten' && e.label === '먹은 칼로리' && e.value === (goal + 200).toLocaleString() && e.saved === 'eaten', JSON.stringify(e));
  const m = await evaluate(`const rows = [...document.querySelectorAll('#view-home .macro-row')].map(r => r.getBoundingClientRect()); return { n: rows.length, oneRow: rows.every(r => Math.abs(r.top - rows[0].top) < 2), vals: [...document.querySelectorAll('#view-home .macro-val')].map(v => v.textContent) };`);
  check('탄·단·지 막대 한 줄에 세 개, g / 목표 표시', m.n === 3 && m.oneRow && m.vals.every(v => /\/ \d+g$/.test(v)), JSON.stringify(m));
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
