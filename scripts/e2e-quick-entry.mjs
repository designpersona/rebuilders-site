// Headless Chrome(CDP) 로 빠른 입력·이름만 저장·데모 버튼 제거를 확인합니다. Node 22 내장 WebSocket 사용.
import { spawn } from 'node:child_process';
const PORT = 9334, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 사용법: npm run build && python3 -m http.server 8765 --bind 127.0.0.1 -d www  (다른 터미널) → node scripts/e2e-quick-entry.mjs
const profile = process.argv[3] || (await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(), 'rb-e2e-'));
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
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof RebuildersQuickEntry !== 'undefined'`)) return; } catch {} }
  throw new Error('app not ready');
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const today = `const d = new Date(); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');`;
const stored = meal => `${today} const a = await storageRepository.getAll(); return (a[k]?.${meal} || []).map(f => ({ name: f.name, cal: f.cal ?? null, carbs: f.carbs ?? null, protein: f.protein ?? null, fat: f.fat ?? null, serving: f.serving ?? null }));`;
const chat = text => `const i = document.getElementById('agent-input'); i.value = ${JSON.stringify(text)}; await handleAgentCommand(); return [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].pop()?.textContent || '';`;
try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ')); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return true;`); await load();

  // 1) 채팅 빠른 입력: 끼니 + 쉼표 + 별칭 + 미등록 음식
  let reply = await evaluate(chat('점심 이삭 햄치즈, 아아'));
  let lunch = await evaluate(stored('lunch'));
  check('채팅 "점심 이삭 햄치즈, 아아" → 점심에 2개 저장', lunch.map(f => f.name).join('|') === '이삭 햄치즈|아이스 아메리카노', JSON.stringify(lunch));
  check('미등록 음식은 영양값 없이 저장(0으로 채우지 않음)', lunch[0] && lunch[0].cal === null && lunch[0].carbs === null, JSON.stringify(lunch[0]));
  check('아아 = 아이스 아메리카노, 아메리카노 영양값', lunch[1]?.cal === 3, JSON.stringify(lunch[1]));
  check('답장에 미입력 안내', reply.includes('영양정보 미입력') && reply.includes('점심'), reply);
  const fillBtn = await evaluate(`return [...document.querySelectorAll('#agent-log .agent-confirm:not(.ask-ai-btn)')].pop()?.textContent || ''`);
  check('답장에 "영양정보 채우기" 버튼', fillBtn === '영양정보 채우기', fillBtn);

  // 2) 홈 표시
  let note = await evaluate(`const n = document.getElementById('nutrition-missing-note'); return { hidden: n.hidden, text: n.textContent }`);
  check('홈에 "영양정보 미입력 1개" 표시', !note.hidden && note.text.includes('영양정보 미입력 1개'), JSON.stringify(note));
  const tag = await evaluate(`return [...document.querySelectorAll('#lunch-items .food-item')].map(el => el.querySelector('.food-name').textContent + ':' + el.querySelector('.food-cal').textContent + ':' + (el.querySelector('.nutrition-missing-tag')?.textContent || ''))`);
  check('기록 항목에 미입력 태그, kcal은 "— kcal"', tag[0] === '이삭 햄치즈:— kcal:영양정보 미입력' && !tag[1].endsWith('미입력'), JSON.stringify(tag));
  const kcal = await evaluate(`return getTotals().cal`);
  check('합계는 미입력을 0으로 계산(3kcal)', kcal === 3, String(kcal));

  // 3) 기록 상세에서 핵심 4개 채우기
  const sheet = await evaluate(`document.getElementById('nutrition-missing-note').click(); await new Promise(r => setTimeout(r, 50)); const g = document.getElementById('meal-detail-edit-grid'); return { title: document.getElementById('edit-food-title').textContent, note: !!g.querySelector('.meal-edit-missing-note'), core: ['cal','carbs','protein','fat'].every(f => g.querySelector('.meal-edit-nutrition [data-edit-field="'+f+'"]')), advancedClosed: !g.querySelector('details.meal-advanced-nutrients').open }`);
  check('미입력 표시 누르면 해당 기록 수정 시트(핵심 4개 + 상세 접힘)', sheet.title.includes('이삭 햄치즈') && sheet.note && sheet.core && sheet.advancedClosed, JSON.stringify(sheet));
  await evaluate(`const g = document.getElementById('meal-detail-edit-grid'); const set = (f, v) => g.querySelector('[data-edit-field="'+f+'"]').value = v; set('cal', 420); set('carbs', 45); set('protein', 18); set('fat', 17); document.getElementById('meal-detail-save-btn').click(); await new Promise(r => setTimeout(r, 300)); return true;`);
  lunch = await evaluate(stored('lunch'));
  note = await evaluate(`return document.getElementById('nutrition-missing-note').hidden`);
  check('채운 값 저장, 미입력 표시 사라짐', lunch[0]?.cal === 420 && lunch[0]?.fat === 17 && note === true, JSON.stringify(lunch[0]));

  // 4) 음식 추가 시트 검색창 빠른 입력 + Enter
  await evaluate(`openModal('breakfast'); const s = document.getElementById('food-search'); s.value = '저녁 밥 반공기 김치'; s.dispatchEvent(new Event('input')); return true;`);
  const preview = await evaluate(`return document.querySelector('#quick-foods > :first-child')?.className + ' | ' + (document.querySelector('#quick-foods .quick-record-btn')?.textContent || '')`);
  check('검색창 "저녁 밥 반공기 김치" → 저녁 바로 기록 미리보기', preview.startsWith('quick-record-btn') && preview.includes('저녁에 바로 기록 · 2개'), preview);
  await evaluate(`document.getElementById('food-search').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise(r => setTimeout(r, 400)); return true;`);
  let dinner = await evaluate(stored('dinner'));
  check('Enter로 저녁에 밥(반공기)·김치 기록', dinner.map(f => f.name + '/' + f.serving).join('|') === '밥/반공기|김치/null', JSON.stringify(dinner));
  const closed = await evaluate(`return !document.getElementById('modal-overlay').classList.contains('open')`);
  check('기록 후 시트 닫힘', closed);

  // 5) 검색 중인 단어는 검색 결과가 먼저
  await evaluate(`openModal('snack'); const s = document.getElementById('food-search'); s.value = '바나'; s.dispatchEvent(new Event('input')); return true;`);
  const first = await evaluate(`const f = document.querySelector('#quick-foods .quick-food-chip, #quick-foods .quick-record-btn'); return f.className + ':' + (f.querySelector('.chip-name')?.textContent || f.textContent)`);
  check('"바나" 검색: 첫 항목은 바나나 검색 결과', first.startsWith('quick-food-chip') && first.endsWith('바나나'), first);
  await evaluate(`closeModal(); return true;`);

  // 6) 직접 등록 이름만 저장
  await evaluate(`openModal('breakfast'); setFoodTab('custom'); document.getElementById('custom-name').value = '엄마표 잡채'; document.getElementById('custom-save').click(); await new Promise(r => setTimeout(r, 400)); return true;`);
  let breakfast = await evaluate(stored('breakfast'));
  const custom = await evaluate(`return CUSTOM_FOODS['엄마표 잡채'] ? { cal: CUSTOM_FOODS['엄마표 잡채'].cal ?? null } : null`);
  check('직접 등록: 이름만으로 저장(영양값 미입력)', breakfast.some(f => f.name === '엄마표 잡채' && f.cal === null) && custom && custom.cal === null, JSON.stringify({ breakfast, custom }));

  // 7) 기존 문장 계속 동작
  reply = await evaluate(chat('아침에 바나나 먹었어'));
  breakfast = await evaluate(stored('breakfast'));
  check('기존 문장 "아침에 바나나 먹었어" → 아침 바나나 89kcal', breakfast.some(f => f.name === '바나나' && f.cal === 89), JSON.stringify(breakfast));
  reply = await evaluate(chat('바나나랑 요거트 먹었어'));
  check('끼니 생략 + 랑 분리 → 2개 저장', /2|바나나.*그릭요거트/.test(reply) && reply.includes('그릭요거트'), reply);

  // 8) 새로고침 후 유지 + 미입력 개수
  await load();
  note = await evaluate(`const n = document.getElementById('nutrition-missing-note'); return { hidden: n.hidden, text: n.textContent }`);
  dinner = await evaluate(stored('dinner'));
  check('새로고침 후 기록 유지, 미입력 3개(밥·김치·잡채)', ['밥', '김치'].every(n => dinner.some(f => f.name === n)) && !note.hidden && note.text.includes('미입력 3개'), JSON.stringify(note));

  // 9) 데모 제품 버튼 제거
  const demo = await evaluate(`CUSTOM_FOODS = {}; renderCollectionProducts(); return { btn: !!document.querySelector('.collection-demo-product'), text: document.getElementById('collection-products-list')?.textContent.includes('데모 제품') }`);
  check('내 제품 빈 화면에 "데모 제품 추가" 버튼 없음', !demo.btn && !demo.text, JSON.stringify(demo));
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (error) {
  failed++; results.push('ERROR ' + error.message); results.push('page errors: ' + errors.slice(0,5).join(' | '));
} finally {
  console.log(results.join('\n'));
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  try { ws?.close(); } catch {}
  chrome.kill();
  process.exit(failed ? 1 : 0);
}
