// Headless Chrome(CDP)로 맥 미니 브리지 자동 채우기를 확인합니다. Node 22 내장 WebSocket 사용.
// 사용법: (저장소 루트에서) python3 -m http.server 8765 --bind 127.0.0.1
//        RB_BRIDGE_TOKEN="$(cat ~/rebuilders-bridge/token)" node scripts/e2e-bridge.mjs
// 브리지(127.0.0.1:3400)가 켜져 있어야 하고, '이삭 햄치즈'가 브리지 캐시에 있으면 AI를 부르지 않고 바로 끝나요.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9337, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const BRIDGE = process.env.RB_BRIDGE_URL || 'http://127.0.0.1:3400';
const TOKEN = process.env.RB_BRIDGE_TOKEN || '';
if (!TOKEN) { console.error('RB_BRIDGE_TOKEN 이 필요해요'); process.exit(2); }
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-bridge-'));
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
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof RebuildersBridge !== 'undefined'`)) return; } catch {} }
  throw new Error('app not ready');
}
async function waitFor(expr, ms = 70000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await evaluate(expr)) return true; await sleep(300); }
  return false;
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const keyOf = `const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');`;
const stored = meal => `${keyOf} const a = await storageRepository.getAll(); return (a[key(new Date())]?.${meal} || []).map(f => ({ name: f.name, cal: f.cal ?? null, carbs: f.carbs ?? null, protein: f.protein ?? null, fat: f.fat ?? null, aiEstimate: !!f.aiEstimate, sourceNote: f.sourceNote ?? null, serving: f.serving ?? null, sourceUrl: f.sourceUrl ?? null }));`;
const chat = text => `const i = document.getElementById('agent-input'); i.value = ${JSON.stringify(text)}; await handleAgentCommand(); return true;`;
const setCfg = (url, token) => `const u = document.getElementById('bridge-url'); const t = document.getElementById('bridge-token'); u.value = ${JSON.stringify(url)}; t.value = ${JSON.stringify(token)}; document.getElementById('bridge-save').click(); return document.getElementById('bridge-hint').textContent;`;
try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ')); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return true;`); await load();

  // 1) 설정 UI
  const ui = await evaluate(`return ['bridge-url', 'bridge-token', 'bridge-save', 'bridge-check'].every(id => document.getElementById(id))`);
  check('설정에 맥 미니 주소·토큰·저장·연결 확인', ui);
  const bad = await evaluate(setCfg('javascript:alert(1)', ''));
  check('잘못된 주소 거절', bad.includes('확인'), bad);
  const okHint = await evaluate(setCfg(BRIDGE, TOKEN));
  const cfg = await evaluate(`const c = RebuildersBridge.getConfig(); return { url: c.url, hasToken: !!c.token, tokenShown: document.getElementById('bridge-token').value.length }`);
  check('주소·토큰 저장(토큰 입력칸은 비움)', cfg.url === BRIDGE && cfg.hasToken && cfg.tokenShown === 0, okHint);
  const conn = await evaluate(`return await RebuildersBridge.checkConnection()`);
  check('연결 확인 = ok', conn === 'ok', conn);

  // 2) 채팅 빠른 기록 → 자동 채움
  await evaluate(chat('점심 이삭 햄치즈'));
  const filled = await waitFor(`const l = await (async () => { ${stored('lunch')} })(); return l.some(f => f.aiEstimate && f.cal !== null)`);
  const lunch = await evaluate(stored('lunch'));
  const ham = lunch.find(f => f.aiEstimate);
  check('제목은 공식 이름만(양·괄호 없음), 양은 따로', ham && ham.name.includes('햄치즈') && !/[()（）]|\d/.test(ham.name) && !!ham.serving && !/[()]/.test(ham.serving), `${ham?.name} | ${ham?.serving}`);
  check('점심 이삭 햄치즈 자동 채움(칼로리·탄·단·지)', filled && ham && [ham.cal, ham.carbs, ham.protein, ham.fat].every(v => typeof v === 'number'), JSON.stringify(ham));
  check('AI 추정·출처 저장', ham?.aiEstimate === true && !!ham?.sourceNote, ham?.sourceNote || '');
  const tag = await evaluate(`return [...document.querySelectorAll('#lunch-card .ai-estimate-tag, .ai-estimate-tag')].map(t => t.textContent)[0] || ''`);
  check('식단 목록에 "AI 추정" 배지', tag === 'AI 추정', tag);
  check('대기 목록 비어 있음', await evaluate(`return RebuildersBridge.getQueue().length === 0 && document.getElementById('bridge-pending').hidden`));

  // 3) 연결 안 됨(집 밖 가정) → 대기 → 다시 연결되면 자동 채움
  await evaluate(setCfg('http://127.0.0.1:3999', ''));
  await evaluate(chat('저녁 이삭 햄치즈'));
  await sleep(1500);
  const waiting = await evaluate(`const el = document.getElementById('bridge-pending'); return { queue: RebuildersBridge.getQueue().length, shown: !el.hidden, text: el.textContent }`);
  check('연결 안 되면 대기 + 작은 표시', waiting.queue === 1 && waiting.shown, JSON.stringify(waiting));
  await evaluate(setCfg(BRIDGE, ''));
  await evaluate(`document.dispatchEvent(new Event('visibilitychange')); return true;`);
  const retried = await waitFor(`const l = await (async () => { ${stored('dinner')} })(); return l.some(f => f.aiEstimate && f.cal !== null) && RebuildersBridge.getQueue().length === 0`);
  check('다시 연결되면 대기분 자동 채움', retried);
  check('대기 표시 사라짐', await evaluate(`return document.getElementById('bridge-pending').hidden`));

  // 3-2) 'AI에게 물어보기' 버튼: 브리지가 있으면 텔레그램·클립보드 없이 바로 채움
  await evaluate(`window.__opened = []; window.open = u => { window.__opened.push(u); return {}; }; window.__copied = []; navigator.clipboard.writeText = async t => { window.__copied.push(t); }; return true;`);
  await evaluate(setCfg('http://127.0.0.1:3999', ''));
  await evaluate(chat('간식 이삭 햄치즈'));
  await sleep(1200);
  await evaluate(`localStorage.removeItem('rebuilders-bridge-pending'); renderBridgePending(); return true;`);
  await evaluate(setCfg(BRIDGE, ''));
  const busy = await evaluate(`const b = [...document.querySelectorAll('#agent-log .ask-ai-btn')].pop(); const seen = []; const mo = new MutationObserver(() => seen.push(b.textContent)); mo.observe(b, { childList: true, characterData: true, subtree: true }); b.click(); seen.push(b.textContent); await new Promise(r => setTimeout(r, 1500)); mo.disconnect(); return seen.includes('AI가 찾는 중…') ? 'AI가 찾는 중…' : seen.join(' / ');`);
  check('물어보기 누르면 "AI가 찾는 중…" 표시', busy === 'AI가 찾는 중…', busy);
  const askFilled = await waitFor(`const l = await (async () => { ${stored('snack')} })(); return l.some(f => f.aiEstimate && f.cal !== null)`);
  const sent = await evaluate(`return { opened: window.__opened.length, copied: window.__copied.length }`);
  check('물어보기 → 브리지로 바로 채움(텔레그램·클립보드 안 씀)', askFilled && sent.opened === 0 && sent.copied === 0, JSON.stringify(sent));

  // 4) 토큰 틀림
  await evaluate(setCfg(BRIDGE, 'wrong-token-wrong-token-123'));
  const unauth = await evaluate(`return await RebuildersBridge.checkConnection()`);
  check('토큰 틀리면 unauthorized', unauth === 'unauthorized', unauth);

  // 5) 사용자가 고치면 배지 사라짐(직접 수정값 우선)
  const editable = await evaluate(`const f = meals.lunch.foods.find(x => x.aiEstimate); return aiEstimateTag({ ...f, sourceTrust: 'user' }) === ''`);
  check('직접 수정한 값에는 AI 추정 배지 없음', editable);
  check('스크립트 오류 없음', !errors.length, errors.slice(0, 3).join(' | '));
} catch (error) {
  check('실행', false, String(error?.message || error));
} finally {
  console.log(results.join('\n'));
  console.log(failed ? `${failed}개 실패` : '모두 통과');
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome 종료 중 */ }
  process.exit(failed ? 1 : 0);
}
