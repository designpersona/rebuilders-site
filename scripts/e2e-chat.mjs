// AI 채팅: 상태 토스트·칩이 위 탭을 가리지 않고 입력창 바로 위에 뜸, 빈 대화 예시(15/400, 누르면 입력칸 채움), 도움말이 시트 위, 대화가 새로고침 뒤에도 남음(최근 200개).
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-chat.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9375, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-chat-'));
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
  await evaluate(`localStorage.removeItem('rebuilders-chat-log'); return 1;`);
  await load();
  const box = sel => `(() => { const e = document.querySelector('${sel}'); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; })()`;

  // 1. 토스트·AI 칩: 위 탭과 겹치지 않고 입력창 바로 위
  const r1 = await evaluate(`setActiveView('home'); ${W8(300)} showToast('영양 채웠어요 · 1개 (AI 추정)', 'success');
    RebuildersBridge.enqueue({ date: dateKey(currentDate), meal: 'snack', items: [{ name: '초코모찌' }] }); renderBridgePending(); ${W8(400)}
    return { toast: ${box('#toast-host .toast:last-child')}, chip: ${box('#bridge-pending')}, chipText: document.getElementById('bridge-pending').textContent, tabs: ${box('#page-tabs')}, form: ${box('#ai-dock-form')} };`);
  check('토스트·칩이 위 탭을 가리지 않음', r1.toast && r1.chip && r1.toast.top > r1.tabs.bottom + 200 && r1.chip.top > r1.tabs.bottom + 200, JSON.stringify(r1));
  check('칩은 입력창 바로 위(8px), 토스트는 칩 위 — 서로 안 겹침', r1.chip.bottom <= r1.form.top && r1.form.top - r1.chip.bottom <= 20 && r1.toast.bottom <= r1.chip.top, JSON.stringify(r1));
  check('짧은 상태 문구', /^영양 (대기|채우는 중)/.test(r1.chipText) || /^맥 미니 연결 대기/.test(r1.chipText), r1.chipText);
  await evaluate(`localStorage.removeItem('rebuilders-bridge-pending'); renderBridgePending(); document.querySelectorAll('#toast-host .toast').forEach(t => t.remove()); return 1;`);

  // 2. 빈 대화: 예시 3개(15px/400) + 한 문장, 누르면 입력칸 채움
  const r2 = await evaluate(`document.getElementById('ai-dock-history').click(); ${W8(450)}
    const ex = [...document.querySelectorAll('#agent-log .agent-example')]; const cs = ex[0] && getComputedStyle(ex[0]);
    const lead = document.querySelector('#agent-log .agent-empty-lead');
    const b = ex[0].getBoundingClientRect(); const hit = document.elementFromPoint(b.left + 10, b.top + b.height / 2);
    return { texts: ex.map(e => e.textContent), size: cs.fontSize, weight: cs.fontWeight, lead: lead?.textContent || '', leadSize: lead && getComputedStyle(lead).fontSize, onTop: hit === ex[0] };`);
  check('빈 대화 예시 3개 + 안내 한 문장 (15px/400, 가려지지 않음)', r2.texts.join('|') === '점심 이삭 햄치즈|어제 저녁 라면|간식 초코모찌' && r2.size === '15px' && r2.weight === '400' && r2.leadSize === '15px' && r2.lead.length > 5 && r2.onTop, JSON.stringify(r2));
  const r3 = await evaluate(`document.querySelectorAll('#agent-log .agent-example')[1].click(); ${W8(450)} return { value: document.getElementById('agent-input').value, panelHidden: document.getElementById('ai-dock-panel').hidden };`);
  check('예시 누르면 입력칸 채움·시트 닫힘', r3.value === '어제 저녁 라면' && r3.panelHidden, JSON.stringify(r3));

  // 3. 도움말이 시트·배경 위에 뜨고 누르면 그대로
  const r4 = await evaluate(`document.getElementById('ai-dock-history').click(); ${W8(450)} document.getElementById('agent-help').click(); ${W8(400)}
    const c = document.querySelector('#agent-help-dialog .agent-help-card').getBoundingClientRect(); const hit = document.elementFromPoint(c.left + c.width / 2, c.top + 40);
    const dd = document.querySelector('#agent-help-dialog dd');
    return { onTop: !!hit?.closest('#agent-help-dialog'), dd: dd && getComputedStyle(dd).fontSize };`);
  check('도움말이 최근 대화 시트 위에 보이고 본문 15px', r4.onTop && r4.dd === '15px', JSON.stringify(r4));
  await evaluate(`closeAgentHelp(); setAiDockPanel(false); ${W8(400)} return 1;`);

  // 4. 대화가 새로고침(앱 다시 열기) 뒤에도 남고, 최대 200개
  await evaluate(`const i = document.getElementById('agent-input'); i.value = '간식 초코모찌'; document.getElementById('ai-dock-form').requestSubmit(); ${W8(900)} return 1;`);
  const before = await evaluate(`return [...document.querySelectorAll('#agent-log .agent-message .agent-bubble-text')].map(e => e.textContent);`);
  await load();
  const after = await evaluate(`return { texts: [...document.querySelectorAll('#agent-log .agent-message .agent-bubble-text')].map(e => e.textContent), toasts: document.querySelectorAll('#toast-host .toast').length, toggle: document.getElementById('ai-dock-history').dataset.count };`);
  check('새로고침 뒤에도 대화 남음(토스트 다시 안 뜸)', before.length >= 2 && JSON.stringify(after.texts) === JSON.stringify(before) && after.toasts === 0 && after.toggle === String(before.length), JSON.stringify({ before, after }));
  const r5 = await evaluate(`for (let k = 0; k < 230; k++) appendAgentMessage('m' + k, 'agent', null); document.querySelectorAll('#toast-host .toast').forEach(t => t.remove());
    const list = JSON.parse(localStorage.getItem('rebuilders-chat-log')); return { n: list.length, last: list[list.length - 1].text };`);
  check('기기에 최근 200개만 저장', r5.n === 200 && r5.last === 'm229', JSON.stringify(r5));
  check('콘솔 오류 없음', !errors.length, errors.join(' | '));
} catch (err) { results.push('ERROR ' + (err.stack || err.message)); failed++; }
finally {
  console.log(results.join('\n'));
  console.log(failed ? `FAIL ${failed}` : `통과 ${results.length}`);
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
