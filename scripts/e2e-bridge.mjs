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

  // 3-3) 출처는 짧은 사이트 이름 링크(긴 주소 안 보임)
  const src = await evaluate(`const f = meals.lunch.foods.find(x => x.aiEstimate); openFoodDex(f, { mode: 'meal' }); const d = document.getElementById('food-dex-description'); const a = d.querySelector('a.ai-source-link'); const out = { text: d.textContent, link: a?.textContent || '', href: a?.href || '', hidden: d.hidden }; document.querySelector('#food-dex .food-dex-close, #food-dex-close, [data-dex-close]')?.click(); return out;`);
  check('출처: 짧은 이름 링크, 긴 주소 안 보임', src.link === 'FatSecret' && src.href.startsWith('https://www.fatsecret.kr/') && !src.text.includes('https://') && !src.hidden, `${src.link} | ${src.text.slice(0, 60)}`);

  // 3-4) 최근 음식: AI가 채운 값으로 바뀜 + 왼쪽으로 밀어 삭제 + 되돌리기(식단 기록은 그대로)
  const recent = await evaluate(`return RECENT_FOODS.map(f => ({ name: f.name, cal: f.cal ?? null }))`);
  check('최근 음식이 AI가 채운 이름·값으로 바뀜', recent.some(f => f.name.includes('햄치즈') && f.cal !== null) && !recent.some(f => f.name === '이삭 햄치즈' && f.cal === null), JSON.stringify(recent.slice(0, 4)));
  const swipe = await evaluate(`
    window.__forgot = []; const realForget = RebuildersBridge.forget; RebuildersBridge.forget = async names => { window.__forgot.push(...names); return true; };
    renderRecentFoods();
    const name = RECENT_FOODS.find(f => f.aiEstimate)?.name;
    const rows = [...document.querySelectorAll('#recent-foods .swipe-row')];
    const row = rows[RECENT_FOODS.findIndex(f => f.name === name)];
    const content = row.querySelector('.swipe-content');
    const touch = x => new Touch({ identifier: 1, target: content, clientX: x, clientY: 100 });
    content.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(300)], bubbles: true, cancelable: true }));
    content.dispatchEvent(new TouchEvent('touchmove', { touches: [touch(250)], bubbles: true, cancelable: true }));
    content.dispatchEvent(new TouchEvent('touchmove', { touches: [touch(190)], bubbles: true, cancelable: true }));
    content.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch(190)], bubbles: true, cancelable: true }));
    const open = row.classList.contains('is-open'); const btn = row.querySelector('.swipe-delete-btn')?.textContent;
    row.querySelector('.swipe-delete-btn').click();
    await new Promise(r => setTimeout(r, 400));
    const stored = await storageRepository.getRecentFoods();
    const all = await storageRepository.getAll(); const k = dateKey(new Date());
    const diaryKept = (all[k]?.lunch || []).some(f => f.name === name);
    const undoBtn = [...document.querySelectorAll('.toast-undo button')].pop();
    const removed = !stored.some(f => f.name === name);
    undoBtn?.click(); await new Promise(r => setTimeout(r, 400));
    const restored = (await storageRepository.getRecentFoods()).some(f => f.name === name);
    RebuildersBridge.forget = realForget;
    return { open, btn, removed, diaryKept, undo: !!undoBtn, restored, forgot: window.__forgot };`);
  check('왼쪽으로 밀면 빨간 "삭제"', swipe.open && swipe.btn === '삭제', JSON.stringify(swipe));
  check('삭제 → 최근 음식에서만 빠짐(식단 기록 유지)', swipe.removed && swipe.diaryKept);
  check('되돌리기 토스트로 복구', swipe.undo && swipe.restored);
  check('AI 음식이면 맥 미니 캐시도 지우기 요청', swipe.forgot.some(n => n.includes('햄치즈')), swipe.forgot.join(', '));
  const forgetOk = await evaluate(`return await RebuildersBridge.forget(['없는음식테스트'])`);
  check('브리지 /forget 응답', forgetOk === true);

  // 4) 토큰 틀림
  await evaluate(setCfg(BRIDGE, 'wrong-token-wrong-token-123'));
  const unauth = await evaluate(`return await RebuildersBridge.checkConnection()`);
  check('토큰 틀리면 unauthorized', unauth === 'unauthorized', unauth);

  // 5) 사용자가 고치면 배지 사라짐(직접 수정값 우선)
  const editable = await evaluate(`const f = meals.lunch.foods.find(x => x.aiEstimate); return aiEstimateTag({ ...f, sourceTrust: 'user' }) === ''`);
  check('직접 수정한 값에는 AI 추정 배지 없음', editable);
  // 6) 최근 음식 '편집' 모드(밀기가 안 될 때 대체)
  const editMode = await evaluate(`
    renderRecentFoods(); const btn = document.getElementById('recent-edit'); const shown = !btn.hidden; btn.click();
    const editing = document.getElementById('recent-foods').classList.contains('is-editing'); const label = btn.textContent;
    const before = RECENT_FOODS.length; const name = RECENT_FOODS[0].name;
    document.querySelector('#recent-foods .swipe-row .swipe-delete-btn').click(); await new Promise(r => setTimeout(r, 400));
    const removed = !RECENT_FOODS.some(f => f.name === name) && RECENT_FOODS.length === before - 1;
    [...document.querySelectorAll('.toast-undo button')].pop()?.click(); await new Promise(r => setTimeout(r, 400));
    const back = RECENT_FOODS.some(f => f.name === name); btn.click();
    return { shown, editing, label, removed, back, done: btn.textContent };`);
  check('최근 음식 "편집" → 삭제 버튼, 삭제·되돌리기', editMode.shown && editMode.editing && editMode.label === '완료' && editMode.removed && editMode.back && editMode.done === '편집', JSON.stringify(editMode));

  // 7) 날짜 말: "내일 아침 바나나" → 내일 아침에 '바나나'(이름에 '내일' 없음)
  await evaluate(chat('내일 아침 바나나'));
  const tomorrow = await evaluate(`${keyOf} const d = new Date(); d.setDate(d.getDate() + 1); const a = await storageRepository.getAll(); return { t: (a[key(d)]?.breakfast || []).map(f => f.name), today: (a[key(new Date())]?.breakfast || []).map(f => f.name), shown: dateKey(currentDate) === key(d) };`);
  check('내일 아침 바나나 → 내일 아침 [바나나], 오늘엔 없음', tomorrow.t.includes('바나나') && !tomorrow.t.some(n => n.includes('내일')) && !tomorrow.today.some(n => /내일|바나나/.test(n)) && tomorrow.shown, JSON.stringify(tomorrow));
  // 8) 홈 하단 AI 입력창(AI 탭 없음)
  const dockUi = await evaluate(`setActiveView('home'); const i = document.getElementById('agent-input'); const send = document.getElementById('agent-send'); const emptyHidden = !send.hidden && send.classList.contains('is-empty') && send.getBoundingClientRect().width >= 36 && send.getBoundingClientRect().right <= innerWidth; i.value = '간식 바나나'; i.dispatchEvent(new Event('input')); const shown = !send.hidden && !send.classList.contains('is-empty'); const bar = document.querySelector('.ai-dock-capsule').getBoundingClientRect(); const sr0 = send.getBoundingClientRect(); return { noTab: !document.getElementById('nav-chat'), emptyHidden, shown, above: !document.querySelector('.bottom-nav') && !document.getElementById('fab-toggle') && Math.abs(sr0.top - bar.top) <= 1 && sr0.right <= innerWidth - 8, placeholder: i.placeholder, dock: !document.getElementById('home-ai-dock').hidden, photo: document.getElementById('ai-photo').hidden && getComputedStyle(document.getElementById('ai-photo')).display === 'none', inputLeft: Math.round(document.querySelector('.ai-dock-capsule').getBoundingClientRect().left - document.querySelector('.ai-dock-bar').getBoundingClientRect().left), pill: (() => { const c = document.querySelector('.ai-dock-capsule').getBoundingClientRect(); const sr = send.getBoundingClientRect(); return !!document.querySelector('.ai-dock-capsule .ai-dock-lead') && c.height >= 48 && Math.abs(sr.height - c.height) <= 1 && sr.right <= innerWidth && parseFloat(getComputedStyle(i).fontSize) >= 16; })(), mic: document.getElementById('agent-voice').hidden && getComputedStyle(document.getElementById('agent-voice')).display === 'none' };`);
  check('AI 탭 없음 + 홈 하단 입력창(입력·마이크, 글자 있으면 보내기, 사진 버튼 숨김·빈 자리 없음)', dockUi.noTab && dockUi.emptyHidden && dockUi.shown && dockUi.above && dockUi.dock && dockUi.photo && dockUi.inputLeft >= 44 && dockUi.inputLeft <= 60 && dockUi.mic && dockUi.pill && dockUi.placeholder === '오늘 식단 기록하기', JSON.stringify(dockUi));
  const dockSend = await evaluate(`document.getElementById('agent-send').click(); await new Promise(r => setTimeout(r, 600)); return { cleared: document.getElementById('agent-input').value === '', sendHidden: document.getElementById('agent-send').classList.contains('is-empty'), toggle: !document.getElementById('ai-dock-toggle').hidden };`);
  check('보내기 → 기록·입력칸 비움·최근 대화 버튼', dockSend.cleared && dockSend.sendHidden && dockSend.toggle, JSON.stringify(dockSend));
  // 한글 조합 중 return: keydown(isComposing) 은 무시되고 form 제출로 보냄
  const ime = await evaluate(`const i = document.getElementById('agent-input'); i.value = '간식 바나나'; i.dispatchEvent(new CompositionEvent('compositionend', { data: '나' })); const lit = !document.getElementById('agent-send').classList.contains('is-empty'); const before = document.querySelectorAll('#agent-log .agent-message.is-user').length; document.getElementById('ai-dock-form').requestSubmit(); await new Promise(r => setTimeout(r, 500)); return { lit, sent: document.querySelectorAll('#agent-log .agent-message.is-user').length === before + 1, cleared: i.value === '' };`);
  check('한글 조합 끝나면 보내기 활성 + return(제출)로 보내기', ime.lit && ime.sent && ime.cleared, JSON.stringify(ime));
  // 실제 터치 입력(CDP)으로 최근 음식 밀기
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await evaluate(`openModal('lunch'); await new Promise(r => setTimeout(r, 400)); setFoodTab('recent'); renderRecentFoods(); await new Promise(r => setTimeout(r, 300)); return 1`);
  const box = await evaluate(`const c = document.querySelector('#recent-foods .swipe-row .swipe-content'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height];`);
  const ty = box[1] + box[3] / 2; const tx = box[0] + box[2] - 30;
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] });
  for (let k = 1; k <= 6; k++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx - k * 16, y: ty }] }); await sleep(16); }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400);
  const realSwipe = await evaluate(`const row = document.querySelector('#recent-foods .swipe-row'); return { open: row.classList.contains('is-open'), hint: !document.getElementById('recent-swipe-hint').hidden, edit: getComputedStyle(document.getElementById('recent-edit')).display !== 'none' }`);
  check('실제 터치로 밀면 열림 + 안내·편집 버튼 보임', realSwipe.open && realSwipe.hint && realSwipe.edit, JSON.stringify(realSwipe));
  await evaluate(`closeModal(); return 1`);
  // 위쪽 글자 탭 + 좌우 밀기(CDP 실제 터치)
  const tabs = await evaluate(`setActiveView('home'); await new Promise(r => setTimeout(r, 200)); const t = [...document.querySelectorAll('#page-tabs .page-tab')]; const names = t.map(b => b.textContent.trim()).join('·'); const header = !document.querySelector('#view-home > .home-brand') || getComputedStyle(document.querySelector('#view-home > .home-brand')).display === 'none'; const active = document.querySelector('#page-tabs .page-tab.active')?.id; const grey = getComputedStyle(document.getElementById('nav-stats')).color !== getComputedStyle(document.getElementById('nav-home')).color; document.getElementById('nav-stats').click(); await new Promise(r => setTimeout(r, 350)); const stats = !document.getElementById('view-stats').hidden && document.getElementById('nav-stats').classList.contains('active') && document.getElementById('home-ai-dock').hidden; document.getElementById('nav-settings').click(); await new Promise(r => setTimeout(r, 350)); const settings = !document.getElementById('view-profile').hidden; setActiveView('home'); const panel = document.getElementById('ai-dock-panel'); setAiDockPanel(true); await new Promise(r => setTimeout(r, 400)); const pr = panel.getBoundingClientRect(); const onTop = panel.contains(document.elementFromPoint(pr.left + 20, pr.top + 10)); document.getElementById('view-home').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise(r => setTimeout(r, 400)); const closed = panel.hidden; return { names, header, active, grey, stats, settings, onTop, closed, noFab: getComputedStyle(document.getElementById('fab-menu') || document.body).display === 'none' || !document.getElementById('fab-menu') };`);
  check('위쪽 글자 탭(머리말 없음·현재 탭 진하게·이동) / 최근 대화 패널 맨 위·바깥 탭 닫힘 / 메뉴 버튼 없음', tabs.names === '그로서리·식도감·식단·리포트·설정' && tabs.header && tabs.active === 'nav-home' && tabs.grey && tabs.stats && tabs.settings && tabs.onTop && tabs.closed && tabs.noFab, JSON.stringify(tabs));
  const swipeTo = async (x0, x1, y) => { await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] }); for (let k = 1; k <= 6; k++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / 6, y }] }); await sleep(16); } await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400); return evaluate('return activeView'); };
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await evaluate(`setActiveView('home'); return 1`);
  const toStats = await (async () => { const a = await swipeTo(100, 260, 600); const b = await swipeTo(100, 260, 600); return [a, b]; })();
  const back = await swipeTo(330, 140, 600); // 넘김 기준(너비 35%)보다 확실히 길게
  const edge = await swipeTo(8, 200, 600);
  const small = await swipeTo(300, 270, 600);
  const vertical = await (async () => { await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 200 }] }); for (let k = 1; k <= 6; k++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200 - k * 12, y: 200 + k * 40 }] }); await sleep(16); } await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); return evaluate('return activeView'); })();
  check('좌우로 밀면 옆 페이지(식단→식도감→그로서리, 왼쪽으로 밀면 되돌아감), 가장자리·짧게·세로는 무시', toStats[0] === 'foodex' && toStats[1] === 'fridge' && back === 'foodex' && edge === 'foodex' && small === 'foodex' && vertical === 'foodex', JSON.stringify({ toStats, back, edge, small, vertical }));
  await evaluate(`setActiveView('home'); return 1`);
  // 입력창 밖 누르기·밀기 → 키보드 닫힘(누른 것은 그대로 동작), 입력창·보내기는 제외
  const blur = await evaluate(`setActiveView('home'); const i = document.getElementById('agent-input'); const f = () => document.activeElement === i;
    i.focus(); document.getElementById('agent-send').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const sendKeeps = f();
    i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const selfKeeps = f();
    const tab = document.getElementById('nav-stats'); tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const tapBlurs = !f(); tab.click(); const tapActs = !document.getElementById('view-stats').hidden;
    setActiveView('home'); i.focus(); const vh = document.getElementById('view-home'); const tp = y => [new Touch({ identifier: 1, target: vh, clientX: 100, clientY: y })]; vh.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: tp(200) })); vh.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, touches: tp(240) })); const scrollBlurs = !f(); vh.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: tp(240) })); // 아래로 끌면 닫힘
    return { sendKeeps, selfKeeps, tapBlurs, tapActs, scrollBlurs };`);
  check('입력창 밖 누르기·화면 밀기 → 키보드 닫힘, 누른 버튼은 그대로 동작, 입력창·보내기는 제외', blur.sendKeeps && blur.selfKeeps && blur.tapBlurs && blur.tapActs && blur.scrollBlurs, JSON.stringify(blur));
  const other = await evaluate(`setActiveView('stats'); const hidden = document.getElementById('home-ai-dock').hidden; setActiveView('ai'); await new Promise(r => setTimeout(r, 100)); return { hidden, back: activeView === 'home' };`);
  check('다른 탭에선 입력창 숨김, 예전 AI 화면 요청은 홈으로', other.hidden && other.back, JSON.stringify(other));
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
