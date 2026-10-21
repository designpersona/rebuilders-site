// 시트·창: 음식 추가 시트(쉴 때 빨간 삭제 안 보임·밀기·편집 모양·세그먼트·검색칸)와 모든 시트의 진한 선 검사.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-sheets.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9363, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-sheets-'));
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
  await evaluate(`window.__heavy = root => { const out = []; for (const e of root.querySelectorAll('*')) { if (!e.offsetWidth || !e.offsetHeight) continue; const s = getComputedStyle(e); if (s.visibility === 'hidden' || +s.opacity === 0) continue;
    for (const side of ['Top','Right','Bottom','Left']) { const w = parseFloat(s['border'+side+'Width']); if (!w || s['border'+side+'Style'] === 'none') continue; const c = s['border'+side+'Color'].match(/[\\d.]+/g).map(Number); const a = c.length > 3 ? c[3] : 1; const lum = (c[0]+c[1]+c[2])/3; if (a > 0.25 && (w >= 1.5 || lum < 120)) { out.push((e.id ? '#' + e.id : '') + '.' + [...e.classList].join('.') + ' ' + side + ' ' + w + 'px'); break; } } } return [...new Set(out)]; }; return 1;`);
  // 1. 쉴 때: 빨간 삭제가 전혀 안 보임(가려짐 + 안 보이게), 줄 가장자리에서도 안 잡힘
  const rest = await evaluate(`for (const f of [{ name: '이자카야 식사', cal: 900, carbs: 70, protein: 45, fat: 40, serving: '1회' }, { name: '사과', cal: 52, serving: '100g' }, { name: '이삭 토스트 햄치즈', serving: '2개' }, { name: '바나나', cal: 89, serving: '100g' }]) await saveRecentFood(f);
    openModal('breakfast'); ${W8(600)}
    const rows = [...document.querySelectorAll('#recent-foods .swipe-row')];
    const info = rows.map(row => { const d = row.querySelector('.swipe-delete-btn'); const s = getComputedStyle(d); const rr = row.getBoundingClientRect(); const chip = row.querySelector('.quick-food-chip').getBoundingClientRect(); const db = d.getBoundingClientRect();
      const pts = [[rr.right - 2, rr.top + rr.height / 2], [rr.right - 2, rr.top + 3], [rr.right - 2, rr.bottom - 2], [db.left + db.width / 2, db.top + db.height / 2]];
      const hit = pts.some(([x, y]) => document.elementFromPoint(x, y)?.closest('.swipe-delete-btn'));
      return { vis: s.visibility, op: +s.opacity, hit, covered: db.left >= chip.left && db.right <= chip.right + 0.5 && db.top >= chip.top - 0.5 && db.bottom <= chip.bottom + 0.5 }; });
    return { n: rows.length, info };`);
  check('쉴 때 빨간 삭제 안 보임: 모든 최근 음식 줄에서 숨김·카드 뒤에 완전히 가려짐·가장자리에서도 안 잡힘', rest.n >= 4 && rest.info.every(i => i.vis === 'hidden' && i.op === 0 && !i.hit && i.covered), JSON.stringify(rest));
  // 2. 밀면 보임
  const r0 = await evaluate(`const c = document.querySelector('#recent-foods .swipe-row .swipe-content').getBoundingClientRect(); return [Math.round(c.right - 40), Math.round(c.top + c.height / 2)];`);
  await touch('touchStart', r0[0], r0[1]);
  for (let k = 1; k <= 8; k++) { await touch('touchMove', r0[0] - k * 14, r0[1]); await sleep(16); }
  await touch('touchEnd'); await sleep(350);
  const swiped = await evaluate(`const row = document.querySelector('#recent-foods .swipe-row'); const d = row.querySelector('.swipe-delete-btn'); const s = getComputedStyle(d); const chip = row.querySelector('.quick-food-chip'); return { open: row.classList.contains('is-open'), vis: s.visibility, op: +s.opacity, rad: [s.borderTopLeftRadius, getComputedStyle(chip).borderTopLeftRadius], gap: Math.round(d.getBoundingClientRect().left - chip.getBoundingClientRect().right) };`);
  check('왼쪽으로 밀면 둥근 빨간 삭제가 카드 옆에(같은 둥글기, 사이 띄움)', swiped.open && swiped.vis === 'visible' && swiped.op === 1 && swiped.rad[0] === swiped.rad[1] && swiped.gap >= 4, JSON.stringify(swiped));
  await evaluate(`document.querySelectorAll('#recent-foods .swipe-row.is-open').forEach(r => r.__swipeClose?.()); ${W8(300)} return 1;`);
  // 3. 편집: 카드가 잘리지 않고 폭만 줄고, 모든 줄에 둥근 삭제
  const edit = await evaluate(`const b = document.getElementById('recent-edit'); const bs = getComputedStyle(b); const before = { border: bs.borderTopWidth + ' ' + bs.borderTopStyle, bg: bs.backgroundColor };
    b.click(); ${W8(400)}
    const sheet = document.getElementById('modal-sheet').getBoundingClientRect();
    const rows = [...document.querySelectorAll('#recent-foods .swipe-row')].map(row => { const rr = row.getBoundingClientRect(); const chip = row.querySelector('.quick-food-chip').getBoundingClientRect(); const d = row.querySelector('.swipe-delete-btn'); const db = d.getBoundingClientRect(); const s = getComputedStyle(d);
      const name = row.querySelector('.quick-food-chip strong, .quick-food-name, .quick-food-chip span'); const nr = name?.getBoundingClientRect();
      return { inside: chip.left >= rr.left - 0.5 && chip.right <= db.left - 4, vis: s.visibility === 'visible' && +s.opacity === 1, rad: s.borderTopLeftRadius === getComputedStyle(row.querySelector('.quick-food-chip')).borderTopLeftRadius, text: !nr || (nr.left >= chip.left - 0.5 && nr.right <= chip.right + 0.5) }; });
    const label = b.textContent; b.click(); ${W8(300)}
    return { before, label, rows };`);
  check("편집: 카드는 잘리지 않고 폭만 줄고(글자 안 잘림) 모든 줄에 카드와 같은 둥근 빨간 삭제, '편집'은 테두리 없는 연한 버튼", edit.label === '완료' && edit.rows.length >= 4 && edit.rows.every(r => r.inside && r.vis && r.rad && r.text) && edit.before.border.startsWith('0px') && edit.before.bg === 'rgb(241, 242, 245)', JSON.stringify(edit));
  // 4. 최근/내 제품/직접 등록 = 리포트 일/주/월과 같은 회색 세그먼트
  const seg = await evaluate(`const t = document.querySelector('#modal-sheet .food-tabs'); const ts = getComputedStyle(t); const active = t.querySelector('.food-tab.active'); const as = getComputedStyle(active); const thumb = t.querySelector('.rb-seg-thumb');
    const rr = document.getElementById('report-range'); const rs = getComputedStyle(rr);
    const thumbOk = !!thumb && Math.abs(thumb.getBoundingClientRect().width - active.getBoundingClientRect().width) <= 1 && Math.abs(thumb.getBoundingClientRect().left - active.getBoundingClientRect().left) <= 1;
    const tabBorders = [...t.querySelectorAll('.food-tab')].map(b => getComputedStyle(b).borderTopWidth);
    setFoodTab('custom'); ${W8(350)} const moved = Math.abs(thumb.getBoundingClientRect().left - t.querySelector('.food-tab[data-tab="custom"]').getBoundingClientRect().left) <= 1; setFoodTab('recent'); ${W8(300)}
    return { rbseg: t.classList.contains('rb-seg'), bg: [ts.backgroundColor, rs.backgroundColor], rad: [ts.borderRadius, rs.borderRadius], activeBg: as.backgroundColor, activeColor: as.color, thumbOk, moved, tabBorders };`);
  check('최근/내 제품/직접 등록: 리포트 일/주/월과 같은 회색 세그먼트(흰 선택 칸이 옮겨감, 테두리 없음)', seg.rbseg && seg.bg[0] === seg.bg[1] && seg.rad[0] === seg.rad[1] && seg.activeBg === 'rgba(0, 0, 0, 0)' && seg.activeColor === 'rgb(17, 18, 22)' && seg.thumbOk && seg.moved && seg.tabBorders.every(w => w === '0px'), JSON.stringify(seg));
  const search = await evaluate(`const s = getComputedStyle(document.getElementById('food-search')); return { border: s.borderTopWidth, rad: s.borderRadius, bg: s.backgroundColor };`);
  check('검색칸: 테두리 없는 연회색 알약', search.border === '0px' && search.rad === '999px', JSON.stringify(search));
  // 5. 다른 시트·창에도 진한 선 없음
  const heavy = await evaluate(`const o = {};
    for (const t of ['recent', 'products', 'custom']) { setFoodTab(t); ${W8(200)} o['add-' + t] = __heavy(document.getElementById('modal-sheet')); }
    closeModal(); ${W8(400)}
    for (const id of ['meal-detail-modal', 'log-link-modal', 'time-edit-modal']) { const m = document.getElementById(id); m.classList.add('open'); m.hidden = false; ${W8(350)} o[id] = __heavy(m); m.classList.remove('open'); ${W8(300)} }
    const h = document.getElementById('agent-help-dialog'); h.hidden = false; h.classList.add('open'); ${W8(300)} o.help = __heavy(h); h.classList.remove('open'); h.hidden = true;
    openFoodDex({ name: '바나나', ...FOOD_DB['바나나'] }, { mode: 'index' }); ${W8(400)} o.foodDex = __heavy(document.getElementById('food-dex')); closeFoodDex(); ${W8(300)}
    return o;`);
  check('음식 추가(세 탭)·음식 수정·링크 기록·시간 수정·도움말·음식 상세: 진한 선 없음', Object.values(heavy).every(a => a.length === 0), JSON.stringify(heavy));
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
