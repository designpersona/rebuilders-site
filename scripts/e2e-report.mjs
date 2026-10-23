// 건강리포트 한 페이지: 일/주/월 버튼 없음, 위 달력(접힘 = 한 주 = 리포트 기간 주, 펼침 = 한 달), 높이 250ms 감속(넘침 없음), 기록한 날 점·오늘 표시,
// 날짜 누르면 선택한 날 카드, < > 는 주/달 이동, 손잡이 끌기, 가로 밀기 없음, 디자인 숫자(20/17/15/13/12·28px·12px), 많은 기록에서도 빠름. 사용법: 정적 서버 8765 → node scripts/e2e-report.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9377, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-report-'));
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
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
  // 기록: 2025-09-01 ~ 2026-12-31 중 날짜(일)가 3의 배수가 아닌 날마다 아침 300 + 점심 500 kcal (약 330일치)
  const seed = `const out = {}; for (let d = new Date(2025, 8, 1); d <= new Date(2026, 11, 31); d.setDate(d.getDate() + 1)) { if (d.getDate() % 3 === 0) continue; out[dateKey(d)] = { breakfast: [{ name: '그릭요거트', cal: 300, carbs: 30, protein: 20, fat: 10 }], lunch: [{ name: '이삭 햄치즈', cal: 500, carbs: 50, protein: 20, fat: 20 }], dinner: [], snack: [] }; } return out;`;
  await evaluate(`localStorage.removeItem('rebuilders.reportCalExpanded.v1'); return 1;`);
  await load();
  await evaluate(`setActiveView('stats'); ${W8(600)} statsCache = (() => { ${seed} })(); statsCalendarExpanded = false; statsSelectedKey = '2026-10-14'; rerenderStats(); ${W8(100)} return 1;`);
  const state = () => evaluate(`const vp = document.getElementById('cal-viewport').getBoundingClientRect(); const cells = [...document.querySelectorAll('#cal-grid .cal-day')]; const vis = cells.filter(c => { const b = c.getBoundingClientRect(); return b.top >= vp.top - 0.5 && b.bottom <= vp.bottom + 0.5; });
    return { h: Math.round(vp.height), vis: vis.map(c => c.dataset.key), sel: document.querySelector('#cal-grid .is-selected')?.dataset.key, title: document.querySelector('.report-period-title')?.textContent, range: document.querySelector('.report-period-range')?.textContent, logged: document.getElementById('report-logged-days')?.textContent, avg: document.getElementById('report-avg-cal')?.textContent, day: document.getElementById('stats-day-date')?.textContent, month: document.getElementById('cal-month-label').textContent, expanded: document.getElementById('cal-expand-toggle').getAttribute('aria-expanded'), seg: document.querySelectorAll('#report-range, [data-report-range]').length };`);
  const s1 = await state();
  check('일/주/월 버튼 없음, 접힘: 고른 날의 한 주(일~토)만 보이고 리포트 = 그 주(10.11–10.17, 기록 5/7·평균 800)', s1.seg === 0 && s1.h === 50 && s1.vis.join() === '2026-10-11,2026-10-12,2026-10-13,2026-10-14,2026-10-15,2026-10-16,2026-10-17' && s1.sel === '2026-10-14' && s1.range === '10.11 – 10.17' && s1.logged === '5/7' && s1.avg === '800' && s1.expanded === 'false', JSON.stringify(s1));
  const dots = await evaluate(`const g = k => document.querySelector('#cal-grid .cal-day[data-key="' + k + '"]'); return { logged: !!g('2026-10-13')?.querySelector('.cal-day-dot'), none: !g('2026-10-12')?.querySelector('.cal-day-dot'), today: document.querySelectorAll('#cal-grid .is-today').length };`);
  await evaluate(`statsSelectedKey = dateKey(new Date()); rerenderStats(); return 1;`);
  const today = await evaluate(`const t = document.querySelector('#cal-grid .cal-day.is-today'); return !!t && t.dataset.key === dateKey(new Date());`);
  await evaluate(`statsSelectedKey = '2026-10-14'; rerenderStats(); return 1;`);
  check('오늘 표시', dots.today === 1 && today, JSON.stringify({ dots, today }));
  // 날짜 아래 작은 kcal(10/500, 여유·적정·초과 색), 기록 있는 날 점 없음, 고른 날은 흰 글자, 320px 에서도 칸 안에
  const kc = await evaluate(`const g = k => document.querySelector('#cal-grid .cal-day[data-key="' + k + '"]'); const k13 = g('2026-10-13').querySelector('.cal-day-kcal'); const cs = getComputedStyle(k13); const sel = getComputedStyle(g('2026-10-14').querySelector('.cal-day-kcal'));
    const t = document.getElementById('cal-expand-toggle'); const tb = t.getBoundingClientRect();
    return { text: k13.textContent, font: cs.fontSize + '/' + cs.fontWeight, color: cs.color, level: g('2026-10-13').className.match(/level-\\w+/)?.[0], empty: g('2026-10-12').querySelector('.cal-day-kcal').textContent, dots: document.querySelectorAll('#cal-grid .cal-day-dot').length, selColor: sel.color, selText: g('2026-10-14').querySelector('.cal-day-kcal').textContent,
      handle: { h: Math.round(tb.height), text: t.textContent.trim(), svg: t.querySelectorAll('svg').length, bar: !!t.querySelector('.cal-grabber') } };`);
  check('날짜 아래 kcal 10/500·차분한 여유 색, 기록 없는 날 비움, 점 없음, 고른 날 kcal 흰색, 손잡이는 회색 막대만(글자·화살표 없음, 32px)', kc.text === '800' && kc.font === '10px/500' && kc.level === 'level-under' && kc.color === 'rgb(63, 143, 107)' && kc.empty === '' && kc.dots === 0 && kc.selText === '800' && kc.selColor === 'rgba(255, 255, 255, 0.85)' && kc.handle.h === 32 && !kc.handle.text && !kc.handle.svg && kc.handle.bar, JSON.stringify(kc));
  // 펼치기: 높이·위치가 한 방향으로만 250ms 안팎(넘침 없음) → 한 달, 리포트 = 그 달(10월 21/31)
  const traj = await evaluate(`const vp = document.getElementById('cal-viewport'); const out = []; const t0 = performance.now(); document.getElementById('cal-expand-toggle').click();
    await new Promise(res => { const tick = () => { out.push([Math.round(performance.now() - t0), Math.round(vp.getBoundingClientRect().height * 10) / 10]); if (performance.now() - t0 < 450) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); }); return out;`);
  const s2 = await state();
  const full = 5 * 54 - 4; // 2026년 10월 = 5줄
  const mono = traj.every((f, i) => i === 0 || f[1] >= traj[i - 1][1] - 0.5);
  const doneAt = (traj.find(f => Math.abs(f[1] - full) < 0.5) || [999])[0];
  check('펼치면 한 달(5줄), 높이 한 방향으로만·넘침 없음·약 250ms, 리포트 = 10월(기록 21/31)', mono && traj.every(f => f[1] <= full + 0.5) && doneAt <= 330 && traj[1][1] < full && s2.h === full && s2.vis.length === 35 && s2.title === '10월' && s2.logged === '21/31' && s2.expanded === 'true', JSON.stringify({ doneAt, n: traj.length, first: traj.slice(0, 3), s2: { ...s2, vis: s2.vis.length } }));
  // 날짜 누르기: 선택한 날 카드가 그 날, 기간은 그대로(펼침 = 달)
  const s3 = await evaluate(`document.querySelector('#cal-grid .cal-day[data-key="2026-10-20"]').click(); ${W8(100)} return 1;`).then(state);
  check('날짜 누르면 그 날이 선택한 날 카드에, 기간(10월)은 그대로', s3.sel === '2026-10-20' && /10\.20/.test(s3.day) && s3.title === '10월' && s3.logged === '21/31', JSON.stringify(s3));
  // < > : 펼침 = 달, 접힘 = 주
  const s4 = await evaluate(`document.getElementById('cal-next-month').click(); ${W8(100)} return 1;`).then(state);
  await evaluate(`document.getElementById('cal-prev-month').click(); ${W8(100)} document.getElementById('cal-expand-toggle').click(); ${W8(400)} return 1;`);
  const s5 = await state();
  const s6 = await evaluate(`document.getElementById('cal-next-month').click(); ${W8(100)} return 1;`).then(state);
  check('< > : 펼침이면 다음 달(11월), 접힘이면 다음 주(고른 날 +7, 리포트 = 그 주)', s4.title === '11월' && s4.month === '2026년 11월' && s5.h === 50 && s5.range === '10.18 – 10.24' && s6.sel === '2026-10-27' && s6.range === '10.25 – 10.31' && s6.vis.length === 7, JSON.stringify({ s4: s4.title, s5: s5.range, s6: { sel: s6.sel, range: s6.range, logged: s6.logged } }));
  // 손잡이를 아래로 끌면 펼침, 위로 끌면 접힘
  const hb = await evaluate(`const b = document.getElementById('cal-expand-toggle').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2];`);
  await touch('touchStart', hb[0], hb[1]); for (let k = 1; k <= 5; k++) { await touch('touchMove', hb[0], hb[1] + k * 10); await sleep(16); } await touch('touchEnd'); await sleep(400);
  const dragDown = (await state()).expanded;
  const hb2 = await evaluate(`const b = document.getElementById('cal-expand-toggle').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2];`);
  await touch('touchStart', hb2[0], hb2[1]); for (let k = 1; k <= 5; k++) { await touch('touchMove', hb2[0], hb2[1] - k * 10); await sleep(16); } await touch('touchEnd'); await sleep(400);
  const dragUp = (await state()).expanded;
  check('손잡이 아래로 끌면 펼침, 위로 끌면 접힘', dragDown === 'true' && dragUp === 'false', JSON.stringify({ dragDown, dragUp }));
  // 가로 밀기: 아무 일 없음
  const before = await state();
  await touch('touchStart', 330, 600); for (let k = 1; k <= 8; k++) { await touch('touchMove', 330 - k * 32, 600); await sleep(16); } await touch('touchEnd'); await sleep(400);
  const after = await state();
  check('건강리포트에서 가로 밀기 → 페이지·기간·고른 날 그대로', after.sel === before.sel && after.range === before.range && await evaluate(`return activeView === 'stats' && !document.getElementById('view-stats').style.transform`), JSON.stringify({ before: before.range, after: after.range }));
  // 디자인 숫자
  const ds = await evaluate(`const v = document.getElementById('view-stats'); const f = sel => { const e = v.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return c.fontSize + '/' + c.fontWeight; }; const vs = getComputedStyle(v);
    const cards = [...v.querySelectorAll(':scope > .cal-card, :scope > .stats-day-card, .report-card')].filter(e => !e.hidden && e.offsetHeight); const gaps = cards.slice(1).map((c, i) => Math.round(c.getBoundingClientRect().top - cards[i].getBoundingClientRect().bottom)).filter(g => g < 40);
    return { title: f('.report-period-title'), section: f('.report-card .stats-section-title'), body: f('.report-value'), label: f('.report-label'), caption: f('.report-period-range'), pad: [vs.paddingLeft, vs.paddingRight], inner: getComputedStyle(cards[2]).paddingLeft, gaps, left: Math.round(cards[0].getBoundingClientRect().left) };`);
  check('제목 20/700 · 섹션 17/700 · 본문 15/400 · 라벨 13/600 · 캡션 12/500 · 좌우 28px · 카드 간격 12px · 안쪽 16px', ds.title === '20px/700' && ds.section === '17px/700' && ds.body === '15px/400' && ds.label === '13px/600' && ds.caption === '12px/500' && ds.pad.join() === '28px,28px' && ds.inner === '16px' && ds.left === 28 && ds.gaps.every(g => g === 12), JSON.stringify(ds));
  // 많은 기록에서도 빠름: 다시 그리기 평균
  const ms = await evaluate(`statsCalendarExpanded = true; const t0 = performance.now(); for (let i = 0; i < 20; i++) { statsSelectedKey = dateKey(new Date(2026, i % 12, 10)); statsMonth = new Date(2026, i % 12, 1); rerenderStats(); } return (performance.now() - t0) / 20;`);
  check('기록 약 330일에서 다시 그리기 평균 20ms 이하', ms < 20, ms.toFixed(1) + 'ms');
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true }); await sleep(300);
  const fit = await evaluate(`statsCache[dateKey(new Date(2026, 9, 14))].lunch = [{ name: 'x', cal: 1850, carbs: 0, protein: 0, fat: 0 }]; statsSelectedKey = '2026-10-14'; statsMonth = new Date(2026, 9, 1); rerenderStats(); await new Promise(r => setTimeout(r, 100));
    return [...document.querySelectorAll('#cal-grid .cal-day')].map(c => { const a = c.getBoundingClientRect(); const k = c.querySelector('.cal-day-kcal'); const b = k.getBoundingClientRect(); return k.textContent && (b.left < a.left - 0.5 || b.right > a.right + 0.5 || k.scrollWidth > k.clientWidth + 1) ? c.dataset.key + ':' + k.textContent : null; }).filter(Boolean);`);
  check('320px: 2150 같은 네 자리 kcal 도 칸 안에', fit.length === 0, JSON.stringify(fit));
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
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
