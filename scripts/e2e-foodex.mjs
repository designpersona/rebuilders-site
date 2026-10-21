// 식도감: 기록한 새 음식 등록(버그 재발 방지)·지우기(확인, 식단 기록 유지)·탭(식도감/레시피/뱃지)·빈 그림 자리·아래 검색창, 그로서리 탭, 홈 입력 안내, 대화 말풍선.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-foodex.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9361, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-foodex-'));
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
  // 1. 버그: 홈 채팅으로 처음 적은 음식이 식도감에 안 생김 → 기록과 함께 식도감(내 음식)에 등록
  const reg = await evaluate(`setActiveView('home'); ${W8(200)} const i = document.getElementById('agent-input'); i.value = '아침 테스트우유'; await handleAgentCommand(); ${W8(300)}
    return { custom: !!CUSTOM_FOODS['테스트우유'], stored: Object.keys(await storageRepository.getCustomFoods()), diary: meals.breakfast.foods.map(f => f.name) };`);
  check('채팅으로 처음 적은 음식: 식단에 기록되고 식도감(내 음식)·저장소에도 등록', reg.custom && reg.stored.includes('테스트우유') && reg.diary.includes('테스트우유'), JSON.stringify(reg));
  // 빠른 기록 창(직접 입력)으로 적은 새 음식도
  const quick = await evaluate(`await registerLoggedFoods([{ name: '테스트두유', serving: '1팩', kcal: 0, _isNew: true, id: 'x1' }]); return { c: CUSTOM_FOODS['테스트두유'] || null };`);
  check('기록 경로 공통 등록 함수: 목록에 없는 음식만 등록, 기록 전용 값(id·_isNew)은 빼고 저장', !!quick.c && !('id' in quick.c) && !('_isNew' in quick.c) && quick.c.discoveryOrigin === 'meal', JSON.stringify(quick));
  const known = await evaluate(`const before = Object.keys(CUSTOM_FOODS).length; await registerLoggedFoods([{ name: '바나나', kcal: 93 }]); return Object.keys(CUSTOM_FOODS).length - before;`);
  check('이미 목록에 있는 음식(바나나)은 다시 등록 안 함', known === 0, String(known));
  await load();
  const after = await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="foodex"]').click(); ${W8(500)}
    const i = document.getElementById('foodex-search-input'); i.value = '테스트우유'; i.dispatchEvent(new Event('input', { bubbles: true })); ${W8(400)}
    const txt = document.getElementById('search-index-grid').innerText; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); ${W8(200)}
    return { view: activeView, found: txt.includes('테스트우유'), custom: !!CUSTOM_FOODS['테스트우유'] };`);
  check('새로고침 뒤에도 식도감 검색에 그대로 나옴', after.view === 'foodex' && after.found && after.custom, JSON.stringify(after));
  // 2. 지우기: 확인 한 번 더, 지워도 이미 적은 식단은 그대로
  const del1 = await evaluate(`openFoodDex({ name: '테스트우유', ...CUSTOM_FOODS['테스트우유'] }, { mode: 'index' }); ${W8(400)}
    const wrap = document.getElementById('food-dex-delete'); const btn = document.getElementById('food-dex-delete-btn');
    const shown = !wrap.hidden && getComputedStyle(btn).display !== 'none'; btn.click(); ${W8(100)}
    const confirmShown = !document.getElementById('food-dex-delete-confirm').hidden; const stillThere = !!CUSTOM_FOODS['테스트우유'];
    document.getElementById('food-dex-delete-cancel').click(); ${W8(100)}
    const cancelled = !!CUSTOM_FOODS['테스트우유'] && document.getElementById('food-dex-delete-confirm').hidden && !btn.hidden;
    return { shown, confirmShown, stillThere, cancelled };`);
  check('지우기: 내가 등록한 음식에만 버튼, 누르면 확인이 먼저 나오고 취소하면 그대로', del1.shown && del1.confirmShown && del1.stillThere && del1.cancelled, JSON.stringify(del1));
  const del2 = await evaluate(`document.getElementById('food-dex-delete-btn').click(); ${W8(80)} document.getElementById('food-dex-delete-yes').click(); ${W8(500)}
    const stored = Object.keys(await storageRepository.getCustomFoods());
    const i = document.getElementById('foodex-search-input'); i.value = '테스트우유'; i.dispatchEvent(new Event('input', { bubbles: true })); ${W8(400)}
    const found = document.getElementById('search-index-grid').innerText.includes('테스트우유'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveView('home'); ${W8(300)}
    const diary = meals.breakfast.foods.find(f => f.name === '테스트우유');
    const card = document.querySelector('#view-home')?.innerText.includes('테스트우유');
    openMealPage?.('breakfast'); ${W8(400)} const page = document.getElementById('view-meal-detail'); const pageOk = page && !page.hidden && page.innerText.includes('테스트우유'); closeMealPage?.(); ${W8(200)}
    return { gone: !CUSTOM_FOODS['테스트우유'], stored, found, dexClosed: !document.getElementById('food-dex').classList.contains('open'), diary: !!diary, card, pageOk };`);
  check('삭제 확인 → 식도감·저장소에서 사라지고 검색에도 없음, 이미 적은 아침 기록·식단 카드·끼니 상세는 그대로', del2.gone && !del2.stored.includes('테스트우유') && !del2.found && del2.dexClosed && del2.diary && del2.card && del2.pageOk, JSON.stringify(del2));
  const builtIn = await evaluate(`openFoodDex({ name: '바나나', ...FOOD_DB['바나나'] }, { mode: 'index' }); ${W8(300)} const h = document.getElementById('food-dex-delete').hidden; closeFoodDex(); ${W8(200)} return h;`);
  check('기본 음식(바나나)에는 지우기 없음', builtIn === true);
  // 3. 식도감 화면: 탭 식도감/레시피/뱃지, 그림 대신 빈 자리, 이름 바꿈, 정렬·보기 글자만
  const page = await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="foodex"]').click(); ${W8(500)}
    const tabs = [...document.querySelectorAll('.foodex-page-tab')].map(b => b.textContent.trim());
    const grid = document.getElementById('search-index-grid');
    const imgs = document.querySelectorAll('#search-index-grid img, #search-index-categories img').length; const holes = grid.querySelectorAll('.food-index-placeholder').length;
    openFoodDex({ name: '바나나', ...FOOD_DB['바나나'] }, { mode: 'index' }); ${W8(300)} const heroImg = document.querySelectorAll('#food-dex-icon img').length; const heroHole = !!document.querySelector('#food-dex-icon .food-dex-placeholder'); closeFoodDex(); ${W8(200)}
    const visibleText = [...document.querySelectorAll('#view-search, #page-tabs, #food-dex')].map(e => e.innerText).join(' ') + [...document.querySelectorAll('[placeholder], [aria-label]')].map(e => (e.getAttribute('placeholder') || '') + (e.getAttribute('aria-label') || '')).join(' ');
    const bg = sel => { const e = document.querySelector(sel); const c = getComputedStyle(e); return c.backgroundColor + '|' + c.boxShadow + '|' + c.backgroundImage.slice(0, 4); };
    return { tabs, imgs, holes, heroImg, heroHole, old: /Foodex|푸덱스|푸드피디아/.test(visibleText), sortBg: bg('#search-index-sort'), toggleBg: bg('.search-index-view-toggle'), viewbarBg: bg('.search-index-viewbar') };`);
  const clear = v => v.startsWith('rgba(0, 0, 0, 0)|none');
  check('식도감 탭: 식도감 / 레시피 / 뱃지', JSON.stringify(page.tabs) === JSON.stringify(['식도감', '레시피', '뱃지']), JSON.stringify(page.tabs));
  check('음식 그림 없음(목록·상세) — 같은 자리에 빈 자리만', page.imgs === 0 && page.holes > 0 && page.heroImg === 0 && page.heroHole, JSON.stringify(page));
  check("화면 글자에 'Foodex/푸덱스/푸드피디아' 없음", !page.old);
  check('정렬·보기 방식: 흰 상자 없이 글자만', clear(page.sortBg) && clear(page.toggleBg) && clear(page.viewbarBg), JSON.stringify([page.sortBg, page.toggleBg, page.viewbarBg]));
  // 4. 검색창: 홈 입력창과 같은 자리·같은 알약, 목록 밖(아래 고정), 다른 탭·페이지에선 숨김
  const dock = await evaluate(`const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height), Math.round(b.bottom)]; };
    const d = document.getElementById('foodex-search-bar'); const cap = d.querySelector('.ai-dock-capsule'); const fd = r(d), fc = r(cap), cs = getComputedStyle(cap);
    const inScroll = !!d.closest('.foodex-library-scroll, .app-content');
    const listBottom = document.querySelector('[data-foodex-panel="index"]').getBoundingClientRect().bottom;
    document.getElementById('foodex-tab-badge').click(); ${W8(200)}
    const badge = { dock: getComputedStyle(d).display, slots: document.querySelectorAll('#badge-grid .badge-slot').length, visible: !document.querySelector('[data-foodex-panel="badge"]').hidden };
    document.getElementById('foodex-tab-recipe').click(); ${W8(150)} const recipeDock = getComputedStyle(d).display;
    document.getElementById('foodex-tab-index').click(); ${W8(150)}
    setActiveView('home'); ${W8(300)} const homeDock = r(document.getElementById('home-ai-dock')), homeCap = r(document.querySelector('#home-ai-dock .ai-dock-capsule')), hcs = getComputedStyle(document.querySelector('#home-ai-dock .ai-dock-capsule'));
    const onHome = getComputedStyle(d).display;
    return { fd, fc, homeDock, homeCap, rad: [cs.borderRadius, hcs.borderRadius], bgc: [cs.backgroundColor, hcs.backgroundColor], inScroll, listBottom: Math.round(listBottom), badge, recipeDock, onHome, ph: document.getElementById('foodex-search-input').placeholder };`);
  check('식도감 검색창: 홈 입력창과 같은 아래 자리·같은 높이·같은 알약 모양, 목록 밖(목록은 그 위에서 끝남)', dock.fd[1] === dock.homeDock[1] && dock.fd[4] === dock.homeDock[4] && dock.fc[3] === dock.homeCap[3] && dock.fc[1] === dock.homeCap[1] && dock.rad[0] === dock.rad[1] && dock.bgc[0] === dock.bgc[1] && !dock.inScroll && dock.listBottom <= dock.fd[1] + 1 && dock.ph === '식도감에서 음식 검색', JSON.stringify(dock));
  check('뱃지 탭: 빈 자리 격자(아직 내용 없음), 검색창은 식도감 탭에서만 · 다른 페이지에선 숨김', dock.badge.visible && dock.badge.slots >= 6 && dock.badge.dock === 'none' && dock.recipeDock === 'none' && dock.onHome === 'none', JSON.stringify(dock.badge));
  // 4-1. 식단 입력줄과 같은 모양: [왼쪽 동그라미 돋보기] [알약 입력] [오른쪽 검정 동그라미], 크기·간격·안내 글자 같음
  const bar = await evaluate(`const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    const look = e => { const s = getComputedStyle(e); return [s.backgroundColor, s.borderRadius, s.color].join('|'); };
    setActiveView('home'); ${W8(300)} const hi = document.getElementById('agent-input'); const home = { lead: r(document.getElementById('ai-dock-history')), cap: r(document.querySelector('#ai-dock-form .ai-dock-capsule')), send: r(document.getElementById('agent-send')), leadLook: look(document.getElementById('ai-dock-history')), ph: getComputedStyle(hi, '::placeholder').color + getComputedStyle(hi, '::placeholder').fontWeight + getComputedStyle(hi).fontSize };
    document.querySelector('#page-tabs .page-tab[data-view="foodex"]').click(); ${W8(500)}
    const fi = document.getElementById('foodex-search-input'); const lead = document.getElementById('foodex-search-lead'); const send = document.getElementById('foodex-search-send');
    const fx = { lead: r(lead), cap: r(document.querySelector('#foodex-search-bar .ai-dock-capsule')), send: r(send), leadLook: look(lead), ph: getComputedStyle(fi, '::placeholder').color + getComputedStyle(fi, '::placeholder').fontWeight + getComputedStyle(fi).fontSize };
    const sendBg = getComputedStyle(send).backgroundColor.match(/\\d+/g).map(Number); const sendFg = getComputedStyle(send).color;
    const mag = !!lead.querySelector('svg circle'); const leadColor = getComputedStyle(lead).color;
    lead.click(); ${W8(100)} const focused = document.activeElement === fi;
    fi.value = '바나나'; send.click(); ${W8(300)} const searched = document.getElementById('search-index-grid').innerText.includes('바나나') && document.activeElement !== fi; fi.value = ''; fi.dispatchEvent(new Event('input', { bubbles: true })); ${W8(200)}
    return { home, fx, dark: sendBg.slice(0, 3).every(v => v < 60), sendFg, mag, leadColor, focused, searched };`);
  const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 1);
  check('식도감 검색줄 = 식단 입력줄 모양: 왼쪽 동그라미 돋보기(최근 대화 버튼과 같은 모양)·알약·오른쪽 검정 동그라미 버튼, 같은 크기·자리·안내 글자, 돋보기=입력, 버튼=검색', same(bar.fx.lead, bar.home.lead) && same(bar.fx.cap, bar.home.cap) && same(bar.fx.send, bar.home.send) && bar.fx.leadLook === bar.home.leadLook && bar.fx.ph === bar.home.ph && bar.dark && bar.sendFg === 'rgb(255, 255, 255)' && bar.mag && bar.focused && bar.searched, JSON.stringify(bar));
  // 5. 그로서리: 장보기·창고만(스토어 코드는 남겨 둠)
  const gro = await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="fridge"]').click(); ${W8(500)}
    return { tabs: [...document.querySelectorAll('#view-search .search-hub-main-tabs button')].filter(b => getComputedStyle(b).display !== 'none' && b.offsetWidth > 0).map(b => b.textContent.trim()), store: !!document.querySelector('[data-search-panel="store"]') };`);
  check('그로서리 탭: 장보기·창고만 보임, 스토어 화면 코드는 그대로', JSON.stringify(gro.tabs) === JSON.stringify(['장보기', '창고']) && gro.store, JSON.stringify(gro));
  // 6. 홈 입력 안내 글자 + 최근 대화 말풍선
  const chat = await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="home"]').click(); ${W8(500)}
    const i = document.getElementById('agent-input'); const ph = getComputedStyle(i, '::placeholder');
    appendAgentMessage('점심 김치볶음밥 1인분이랑 콜라 기록해줘 길게 길게 길게 길게 길게 길게 길게', 'user'); appendAgentMessage('점심에 김치볶음밥과 콜라를 기록했어요. 합계 약 720kcal예요. 길게 길게 길게 길게');
    setAiDockPanel(true); ${W8(500)}
    const log = document.getElementById('agent-log'); const lc = getComputedStyle(log), b0 = log.getBoundingClientRect(); const lr = { left: b0.left + parseFloat(lc.paddingLeft), right: b0.right - parseFloat(lc.paddingRight), width: b0.width - parseFloat(lc.paddingLeft) - parseFloat(lc.paddingRight) };
    const msgs = [...log.querySelectorAll('.agent-message')].slice(-2).map(m => { const b = m.querySelector('.agent-bubble').getBoundingClientRect(); const c = getComputedStyle(m.querySelector('.agent-bubble')); return { user: m.classList.contains('is-user'), l: b.left - lr.left, r: lr.right - b.right, w: b.width, bg: c.backgroundColor, rad: c.borderTopLeftRadius, time: !!m.querySelector('.agent-time') }; });
    const avatars = log.querySelectorAll('.agent-avatar, .agent-name, img').length;
    setAiDockPanel(false); ${W8(300)}
    return { ph: i.placeholder, phColor: ph.color, phWeight: ph.fontWeight, logW: lr.width, msgs, avatars };`);
  const [u, a] = chat.msgs; const lum = c => { const m = c.match(/\d+/g).map(Number); return (m[0] + m[1] + m[2]) / 3; };
  check("홈 입력창 안내: '오늘 식단 기록하기', 연한 회색·가는 글씨", chat.ph === '오늘 식단 기록하기' && lum(chat.phColor) > 150 && Number(chat.phWeight) <= 400, JSON.stringify([chat.ph, chat.phColor, chat.phWeight]));
  check('최근 대화: 아바타·이름 없음, 내 말 오른쪽 짙은 말풍선·AI 왼쪽 연회색, 폭 75% 이하, 같은 둥글기, 시간 표시', chat.avatars === 0 && u.user && u.r <= 2 && u.l > 20 && lum(u.bg) < 60 && !a.user && a.l <= 2 && a.r > 20 && lum(a.bg) > 200 && u.w <= chat.logW * 0.76 && a.w <= chat.logW * 0.76 && u.rad === a.rad && u.time && a.time, JSON.stringify(chat));
  // 7. 영어: Foodpedia
  await evaluate(`await saveSettings({ locale: 'en' }); return 1;`); await load();
  const en = await evaluate(`document.querySelector('#page-tabs .page-tab[data-view="foodex"]').click(); ${W8(500)} return { tabs: [...document.querySelectorAll('.foodex-page-tab')].map(b => b.textContent.trim()), nav: document.querySelector('#page-tabs .page-tab[data-view="foodex"]').innerText.trim(), h2: document.querySelector('#view-search .search-index-intro h2').textContent, ph: document.getElementById('agent-input').placeholder };`);
  check('영어: Foodpedia / Recipes / Badges', en.tabs[0] === 'Foodpedia' && en.tabs[2] === 'Badges' && en.h2 === 'Foodpedia' && en.nav === 'Foodpedia', JSON.stringify(en));
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
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
