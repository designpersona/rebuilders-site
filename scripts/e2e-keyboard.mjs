// 키보드: 아래 입력줄(식도감 검색·식단 채팅)에 커서가 가도 위 탭·내용은 제자리, 줄만 키보드 위로, 결과 칸은 줄고 스크롤,
// 아래로 끌거나 바깥을 누르면 키보드 내림. (실제 iOS 키보드 대신 keyboard.js 가 받는 높이를 흉내)
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9367, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-keyboard-'));
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
  // 키보드 흉내: 앱에서 keyboard.js 가 받는 키보드 높이(300px)를 그대로 넣음(--kb-h, html.kb-native) + WebKit 이 화면을 미는 것(scrollTop)도 흉내
  await evaluate(`for (let k = 1; k <= 30; k++) await saveCustomFood('키보드테스트 ' + String(k).padStart(2, '0'), { cal: 100 + k, carbs: 10, protein: 5, fat: 2, serving: '1개' }); return 1;`);
  const KB = 300;
  const kbState = (inputId, dockSel, listSel) => `
    const tabs0 = document.getElementById('page-tabs').getBoundingClientRect().top; const sub0 = document.querySelector('${listSel}')?.getBoundingClientRect().top;
    const input = document.getElementById('${inputId}'); input.focus();
    RebuildersKeyboard.simulate(${KB}); ${W8(60)}
    const frame = document.querySelector('.phone-frame'); frame.scrollTop = 140; document.scrollingElement.scrollTop = 140; document.body.scrollTop = 140; frame.dispatchEvent(new Event('scroll')); window.dispatchEvent(new Event('scroll')); ${W8(400)}
    const dock = document.querySelector('${dockSel}').getBoundingClientRect(); const list = document.querySelector('${listSel}'); const lb = list.getBoundingClientRect();
    const r = { tabsMoved: Math.round(document.getElementById('page-tabs').getBoundingClientRect().top - tabs0), listTopMoved: Math.round(lb.top - sub0), dockBottom: Math.round(dock.bottom), want: innerHeight - ${KB}, listBottom: Math.round(lb.bottom), dockTop: Math.round(dock.top),
      pan: [frame.scrollTop, document.scrollingElement.scrollTop, document.body.scrollTop], focused: document.activeElement === input, scrollable: list.scrollHeight > list.clientHeight + 20 };
    return r;`;
  const ok = r => r.tabsMoved === 0 && r.listTopMoved === 0 && Math.abs(r.dockBottom - r.want) <= 2 && r.listBottom <= r.dockTop + 1 && r.pan.every(v => v === 0) && r.focused;
  // 1) 식도감 검색
  const fx = await evaluate(`setActiveView('foodex'); setFoodexPageTab('index'); ${W8(400)} const i = document.getElementById('foodex-search-input'); i.value = '키보드'; i.dispatchEvent(new Event('input', { bubbles: true })); ${W8(50)}
    document.querySelector('#foodex-results .fs-more')?.click(); ${W8(50)} return 1;`);
  const f1 = await evaluate(kbState('foodex-search-input', '#foodex-search-bar', '[data-foodex-panel="index"]'));
  check('식도감 검색 + 키보드: 위 탭·내용은 제자리, 검색줄만 키보드 바로 위, 결과 칸은 줄어들고 스크롤됨, 화면 밀림(scrollTop) 되돌림', ok(f1) && f1.scrollable, JSON.stringify(f1));
  // 2) 결과를 위로 밀어(더 보기) 스크롤해도 키보드 유지, 아래로 끌면 키보드 내림(메시지 앱처럼)
  const pt = await evaluate(`const b = document.querySelector('[data-foodex-panel="index"]').getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)];`);
  await touch('touchStart', pt[0], pt[1]); for (let k = 1; k <= 6; k++) { await touch('touchMove', pt[0], pt[1] - k * 12); await sleep(16); } await touch('touchEnd'); await sleep(150);
  const up = await evaluate(`return document.activeElement?.id;`);
  await touch('touchStart', pt[0], pt[1] - 60); for (let k = 1; k <= 6; k++) { await touch('touchMove', pt[0], pt[1] - 60 + k * 12); await sleep(16); } await sleep(50);
  const down = await evaluate(`return document.activeElement?.id || 'body';`); await touch('touchEnd'); await sleep(100);
  check('결과를 위로 밀면 키보드 그대로, 아래로 끌면 입력창에서 빠져 키보드 내려감', up === 'foodex-search-input' && down !== 'foodex-search-input', JSON.stringify({ up, down }));
  // 3) 바깥 톡 누르기로도 내림
  const tap = await evaluate(`const i = document.getElementById('foodex-search-input'); i.focus(); return document.activeElement === i;`);
  const hp = await evaluate(`const h = document.querySelector('#foodex-results .fs-head').getBoundingClientRect(); return [Math.round(h.left + 20), Math.round(h.top + h.height / 2)];`);
  await touch('touchStart', hp[0], hp[1]); await sleep(40); await touch('touchEnd'); await sleep(100);
  const afterTap = await evaluate(`return document.activeElement?.id || 'body';`);
  check('바깥을 톡 누르면 키보드 내림(누른 것은 그대로 동작)', tap && afterTap !== 'foodex-search-input', afterTap);
  // 4) 키보드 닫힘 → 줄이 다시 아래로(높이 원래대로)
  const closed = await evaluate(`RebuildersKeyboard.simulate(0); ${W8(400)} const d = document.getElementById('foodex-search-bar').getBoundingClientRect(); const f = document.querySelector('.phone-frame').getBoundingClientRect(); return { dock: Math.round(d.bottom), frame: Math.round(f.bottom), h: innerHeight, kb: getComputedStyle(document.documentElement).getPropertyValue('--kb-h').trim() };`);
  check('키보드 닫히면 검색줄이 원래 자리로 내려옴', closed.frame === closed.h && closed.kb === '0px' && closed.dock > closed.h - 120, JSON.stringify(closed));
  // 5) 홈 채팅줄도 같게
  await evaluate(`const i = document.getElementById('foodex-search-input'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); setActiveView('home'); ${W8(400)} return 1;`);
  const h1 = await evaluate(kbState('agent-input', '#home-ai-dock', '#view-home'));
  check('식단 채팅줄 + 키보드: 위 탭·내용 제자리, 채팅줄만 키보드 바로 위, 밀림 되돌림', h1.tabsMoved === 0 && h1.listTopMoved === 0 && Math.abs(h1.dockBottom - h1.want) <= 2 && h1.pan.every(v => v === 0) && h1.focused, JSON.stringify(h1));
  const hpt = await evaluate(`const b = document.getElementById('view-home').getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + 160)];`);
  await touch('touchStart', hpt[0], hpt[1]); for (let k = 1; k <= 6; k++) { await touch('touchMove', hpt[0], hpt[1] + k * 12); await sleep(16); } await sleep(50);
  const hdown = await evaluate(`return document.activeElement?.id || 'body';`); await touch('touchEnd'); await sleep(100);
  check('식단 화면도 아래로 끌면 키보드 내림', hdown !== 'agent-input', hdown);
  await evaluate(`RebuildersKeyboard.simulate(0); return 1;`);
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
