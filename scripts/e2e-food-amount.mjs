// 먹은 양: 채팅 '계란 2개' → 한 개 50g(USDA 173424) × 개수로 기록, 수정 창에서 양을 바꾸면 칼로리·탄단지가 바로 비례, 칼로리 직접 고치면 그 값이 기준.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-food-amount.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9379, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-amount-'));
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
  const vals = `const v = f => document.querySelector('#meal-detail-edit-grid [data-edit-field="' + f + '"]').value; const out = () => ({ amount: document.querySelector('[data-serving-amount]').value, unit: document.querySelector('[data-serving-unit]').value, cal: v('cal'), carbs: v('carbs'), protein: v('protein'), fat: v('fat'), sodium: v('sodium') });
    const setAmt = x => { const i = document.querySelector('[data-serving-amount]'); i.value = String(x); i.dispatchEvent(new Event('input', { bubbles: true })); };
    const setUnit = u => { const s = document.querySelector('[data-serving-unit]'); s.value = u; s.dispatchEvent(new Event('change', { bubbles: true })); };
    const setField = (f, x) => { const i = document.querySelector('#meal-detail-edit-grid [data-edit-field="' + f + '"]'); i.value = String(x); i.dispatchEvent(new Event('input', { bubbles: true })); };`;
  // 1. 채팅 '아침 계란 2개' → 100g 만큼(155kcal), "2개 · 100g"
  const r1 = await evaluate(`setActiveView('home'); Object.keys(meals).forEach(k => { meals[k].foods = []; }); renderAll(true); const i = document.getElementById('agent-input'); i.value = '아침 계란 2개'; document.getElementById('ai-dock-form').requestSubmit(); ${W8(900)}
    const f = meals.breakfast.foods[0] || {}; return { name: f.name, cal: f.cal, protein: f.protein, grams: f.servingGrams, serving: f.serving, shown: displayServing(f), note: f.quantityNote || '' };`);
  check("채팅 '아침 계란 2개' → 2개 × 50g = 100g 만큼 155kcal·단백질 12.6g, 표시 '2개 · 100g'", r1.name === '삶은 달걀' && r1.cal === 155 && r1.protein === 12.6 && r1.grams === 100 && r1.serving === '2개' && r1.shown === '2개 · 100g' && !r1.note, JSON.stringify(r1));
  // 2. 수정 창: 2개 → 1개 바로 절반, g 로 바꿔 150 → 150g 만큼
  const r2 = await evaluate(`${vals} openFoodEdit('breakfast', 0); ${W8(300)} const a = out(); setAmt(1); const b = out(); setUnit('g'); setAmt(150); const c = out(); return { a, b, c };`);
  check('수정 창: 2개(155) → 1개 입력하면 바로 77.5kcal·탄 0.6·단 6.3·지 5.3, 단위를 g 로 바꾸고 150 → 232.5kcal', r2.a.amount === '2' && r2.a.unit === '개' && r2.b.cal === '77.5' && r2.b.carbs === '0.6' && r2.b.protein === '6.3' && r2.b.fat === '5.3' && r2.c.cal === '232.5' && r2.c.protein === '18.9' && r2.c.sodium === '186', JSON.stringify(r2));
  await shotIfAsked();
  // 3. 칼로리 직접 고치면 그 값이 기준(직접 입력 표시): 150g 에서 300kcal → 75g 이면 150kcal, 탄단지는 원래 비율
  const r3 = await evaluate(`${vals} setField('cal', 300); setAmt(75); const d = out(); document.getElementById('meal-detail-save-btn').click(); ${W8(500)} const f = meals.breakfast.foods[0]; return { d, saved: { cal: f.cal, protein: f.protein, serving: f.serving, custom: f.nutritionCustom === true, grams: f.servingGrams ?? null, note: f.quantityNote ?? null } };`);
  check('칼로리를 300 으로 직접 고친 뒤 75g → 150kcal(고친 값에서 비례)·단백질 9.5g, 저장하면 직접 입력 표시', r3.d.cal === '150' && r3.d.protein === '9.5' && r3.saved.cal === 150 && r3.saved.serving === '75g' && r3.saved.custom && r3.saved.grams === null, JSON.stringify(r3));
  // 4. 예전 기록(100g 값 + '1개' 메모): 단위를 개, 양 1 로 바꾸면 DB 의 한 개 무게(50g)로 77.5kcal
  const r4 = await evaluate(`${vals} meals.breakfast.foods = [{ ...NILIRI_FOOD_CATALOG['삶은 달걀'], unitGrams: undefined, name: '삶은 달걀', serving: '100g', quantityNote: '1개', id: 'old-egg' }]; renderAll(true); openFoodEdit('breakfast', 0); ${W8(300)} const a = out(); setUnit('개'); setAmt(1); const b = out(); document.getElementById('meal-detail-save-btn').click(); ${W8(500)} const f = meals.breakfast.foods[0]; return { a, b, saved: { cal: f.cal, serving: f.serving, grams: f.servingGrams, note: f.quantityNote ?? null, shown: displayServing(f) } };`);
  check("예전 기록(100g·155kcal, 메모 '1개'): 1개로 고치면 77.5kcal, 저장 '1개 · 50g', 메모 없어짐", r4.a.amount === '100' && r4.a.unit === 'g' && r4.b.cal === '77.5' && r4.saved.cal === 77.5 && r4.saved.grams === 50 && r4.saved.shown === '1개 · 50g' && r4.saved.note === null, JSON.stringify(r4));
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
async function shotIfAsked() {
  if (!process.env.SHOT) return;
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.env.SHOT, Buffer.from(r.data, 'base64'));
}
