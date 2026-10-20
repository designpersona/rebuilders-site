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
  const read = `const g = document.getElementById('kcal-gauge'); const r = g.getBoundingClientRect(); return { mode: g.dataset.mode, label: document.getElementById('kcal-gauge-label').textContent, value: document.getElementById('kcal-gauge-value').textContent, goal: g.getAttribute('aria-label').split('/ ')[1].split('kcal')[0], noGoalLine: !document.querySelector('.kcal-gauge-goal'), unit: document.querySelector('.kcal-gauge-unit')?.textContent, status: document.getElementById('kcal-gauge-status')?.textContent, kcalOnTop: document.querySelector('.kcal-gauge-unit').getBoundingClientRect().bottom <= document.getElementById('kcal-gauge-value').getBoundingClientRect().top + 2 && document.getElementById('kcal-gauge-status').getBoundingClientRect().top >= document.getElementById('kcal-gauge-value').getBoundingClientRect().bottom - 2, labelHidden: getComputedStyle(document.getElementById('kcal-gauge-label')).display === 'none', off: parseFloat(document.getElementById('kcal-gauge-fill').style.strokeDashoffset), overDash: document.getElementById('kcal-gauge-over').style.strokeDasharray, overOff: parseFloat(document.getElementById('kcal-gauge-over').style.strokeDashoffset), overFirst: document.getElementById('kcal-gauge-over').nextElementSibling?.id === 'kcal-gauge-fill', overOn: document.getElementById('kcal-gauge-over').style.opacity === '1', fillColor: getComputedStyle(document.getElementById('kcal-gauge-fill')).stroke, over: g.classList.contains('is-over'), saved: localStorage.getItem('rebuilders.kcalGaugeMode.v1'), shown: r.width > 0 && r.height > 0, meterHidden: getComputedStyle(document.getElementById('calorie-summary-toggle')).display === 'none', avatar: getComputedStyle(document.querySelector('#view-home .main-avatar')).display };`;
  const goal = await evaluate(`return TARGETS.cal;`);
  await evaluate(`updateRing({ cal: 500, carbs: 60, protein: 20, fat: 10 }, false); return 1;`);
  const a = await evaluate(read);
  check('게이지 보임·캐릭터와 예전 Kcal 막대 숨김', a.shown && a.meterHidden && a.avatar === 'none', JSON.stringify(a));
  check('처음엔 먹은 칼로리 500 / 목표, 채움 = 먹은/목표', a.mode === 'eaten' && a.label === '먹은 칼로리' && a.value === '500' && a.goal === goal.toLocaleString() && a.noGoalLine && a.unit === 'kcal' && a.status === '' && a.kcalOnTop && a.labelHidden && Math.abs(a.off - (100 - 500 / goal * 100)) < 0.1, JSON.stringify(a));
  await evaluate(`document.getElementById('kcal-gauge').click(); return 1;`);
  const b = await evaluate(read);
  check('탭 → 남은 칼로리(목표 − 먹은), 기기에 기억, 채움은 그대로', b.mode === 'left' && b.label === '남은 칼로리' && b.unit === 'kcal' && b.status === '남음' && b.kcalOnTop && b.value === (goal - 500).toLocaleString() && b.saved === 'left' && b.off === a.off, JSON.stringify(b));
  await load();
  await evaluate(`updateRing({ cal: 500, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
  const c = await evaluate(read);
  check('다시 열어도 남은 칼로리 보기 유지', c.mode === 'left' && c.label === '남은 칼로리', JSON.stringify(c));
  await evaluate(`updateRing({ cal: ${goal} + 200, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
  const d = await evaluate(read);
  const basePct = goal / (goal + 200) * 100; const overParts = String(d.overDash).split(/[ ,]+/).map(parseFloat);
  check('목표 넘으면 초과 칼로리 200, 막대처럼 목표까지 검정·넘친 만큼만 빨강', d.label === '초과 칼로리' && d.unit === 'kcal' && d.status === '초과' && d.value === '200' && d.over && d.overOn && Math.abs(d.off - (100 - basePct)) < 0.1 && overParts.length === 2 && Math.abs(overParts[0] - (100 - basePct)) < 0.1 && overParts[1] >= 100 && Math.abs(-d.overOff - basePct) < 0.1 && d.overFirst && !/229, 72, 77|226, 61, 61/.test(d.fillColor), JSON.stringify(d));
  const many = [];
  for (const extra of [1, 350, 1300, 3700]) {
    await evaluate(`updateRing({ cal: ${goal} + ${extra}, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
    const r = await evaluate(read);
    const parts = String(r.overDash).split(/[ ,]+/).map(parseFloat);
    const base = goal / (goal + extra) * 100;
    // 빨강은 [시작 = -offset, 시작 + 길이] 구간만, 대시가 0 길이로 시작점에 생기지 않음
    many.push({ extra, ok: r.overOn && parts.length === 2 && parts[0] > 0 && Math.abs(-r.overOff - base) < 0.1 && Math.abs(parts[0] + base - 100) < 0.1 && parts[1] >= 100 });
  }
  await evaluate(`updateRing({ cal: ${goal} + 200, carbs: 0, protein: 0, fat: 0 }, false); return 1;`);
  check('초과 1·350·1300·3700kcal: 빨강은 목표 지점부터 끝까지만(시작점 점 없음)', many.every(m => m.ok), JSON.stringify(many));
  check('목표 안이면 빨간 구간 없음', !a.overOn && !b.overOn, JSON.stringify({ a: a.overDash, b: b.overDash }));
  await evaluate(`document.getElementById('kcal-gauge').click(); return 1;`);
  const e = await evaluate(read);
  check('다시 탭 → 먹은 칼로리로 돌아옴', e.mode === 'eaten' && e.label === '먹은 칼로리' && e.value === (goal + 200).toLocaleString() && e.saved === 'eaten', JSON.stringify(e));
  const m = await evaluate(`const rows = [...document.querySelectorAll('#view-home .macro-row')].map(r => r.getBoundingClientRect()); const gr = document.getElementById('kcal-gauge').getBoundingClientRect(); return { n: rows.length, oneRow: rows.every((r, i) => i === 0 || r.top > rows[i - 1].bottom - 1) && rows.every(r => r.left >= gr.right), vitals: (() => { const v = document.getElementById('health-glance').getBoundingClientRect(); return v.top >= gr.bottom - 1 && !!document.querySelector('#health-glance #health-weight') && getComputedStyle(document.querySelector('.dash-card .player-measurements')).display === 'none'; })(), vals: [...document.querySelectorAll('#view-home .macro-val')].map(v => v.textContent) };`);
  check('게이지 오른쪽에 탄·단·지 막대 세로로, g / 목표 표시, 아래 줄에 심박·몸무게·걸음(키는 숨김)', m.n === 3 && m.oneRow && m.vitals && m.vals.every(v => /\/ \d+g$/.test(v)), JSON.stringify(m));
  const boxes = [];
  for (const mode of ['eaten', 'left']) {
    await evaluate(`kcalGaugeMode = '${mode}'; return 1;`);
    for (const cal of [0, 820, 1650, 12345]) {
      boxes.push(await evaluate(`updateRing({ cal: ${cal}, carbs: 0, protein: 0, fat: 0 }, false); const q = s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); }; const v = document.getElementById('kcal-gauge-value'); const c = document.querySelector('.kcal-gauge-center').getBoundingClientRect(); return { mode: '${mode}', cal: ${cal}, gauge: q('#kcal-gauge'), svg: q('#kcal-gauge .kcal-gauge-svg'), left: q('#view-home .player-measurements'), right: q('#health-glance'), fits: v.scrollWidth <= c.width + 0.5, text: v.textContent };`));
    }
  }
  await evaluate(`kcalGaugeMode = 'eaten'; return 1;`);
  const same = k => boxes.every(b => b[k] === boxes[0][k]);
  check('0·820·1650·12345, 먹은/남은 모두 게이지·양옆 칸 크기·위치 같음, 숫자는 안에 맞음', same('gauge') && same('svg') && same('left') && same('right') && boxes.every(b => b.fits), JSON.stringify(boxes.map(b => [b.mode, b.text, b.gauge, b.fits])));
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
