// Headless Chrome(CDP)로 'AI에게 물어보기'와 링크 기록(확인 후 저장)을 확인합니다. Node 22 내장 WebSocket 사용.
// 사용법: (저장소 루트에서) python3 -m http.server 8765 --bind 127.0.0.1  → node scripts/e2e-log-link.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9336, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-link-'));
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
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof RebuildersLogLink !== 'undefined'`)) return; } catch {} }
  throw new Error('app not ready');
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const keyOf = `const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');`;
const stored = (meal, offset = 0) => `${keyOf} const d = new Date(); d.setDate(d.getDate() + (${offset})); const a = await storageRepository.getAll(); return (a[key(d)]?.${meal} || []).map(f => ({ name: f.name, cal: f.cal ?? null, carbs: f.carbs ?? null, protein: f.protein ?? null, fat: f.fat ?? null, serving: f.serving ?? null, source: f.source ?? null, sourceTrust: f.sourceTrust ?? null, sourceNote: f.sourceNote ?? null }));`;
const chat = text => `const i = document.getElementById('agent-input'); i.value = ${JSON.stringify(text)}; await handleAgentCommand(); return true;`;
const modalOpen = `return document.getElementById('log-link-modal').classList.contains('open')`;
const lastToast = `return [...document.querySelectorAll('.toast, #toast, .toast-message')].map(t => t.textContent).join(' | ')`;
try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ')); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return true;`); await load();
  // window.open·클립보드 가로채기(실제로 텔레그램을 열지 않음)
  const stub = `window.__opened = []; window.open = u => { window.__opened.push(u); return {}; }; window.__copied = []; navigator.clipboard.writeText = async t => { window.__copied.push(t); };`;
  await evaluate(stub + ' return true;');

  // 1) 채팅으로 이름만 저장 → AI에게 물어보기 버튼
  await evaluate(chat('점심 이삭 햄치즈'));
  const askBtn = await evaluate(`return [...document.querySelectorAll('#agent-log .ask-ai-btn')].pop()?.textContent || ''`);
  check('채팅 답장에 "AI에게 물어보기" 버튼(미입력 항목)', askBtn === 'AI에게 물어보기', askBtn);

  // 2) 봇 아이디 없으면 설정으로 안내, 열지 않음
  await evaluate(`localStorage.removeItem('rebuilders-telegram-bot'); [...document.querySelectorAll('#agent-log .ask-ai-btn')].pop().click(); await new Promise(r => setTimeout(r, 400)); return true;`);
  let opened = await evaluate(`return window.__opened.length`);
  check('봇 아이디 없으면 텔레그램을 열지 않음', opened === 0, String(opened));
  const settings = await evaluate(`return !!document.getElementById('ai-lookup-card') && document.getElementById('telegram-bot-id') !== null`);
  check('설정에 "텔레그램 봇 아이디" 입력칸', settings);
  const saveHint = await evaluate(`const i = document.getElementById('telegram-bot-id'); i.value = '@https_bad!'; document.getElementById('telegram-bot-save').click(); const bad = document.getElementById('telegram-bot-hint').textContent; i.value = 'https://t.me/My_food_bot'; document.getElementById('telegram-bot-save').click(); return { bad, ok: document.getElementById('telegram-bot-hint').textContent, stored: localStorage.getItem('rebuilders-telegram-bot') }`);
  check('봇 아이디 검증·정리(t.me 주소 → 아이디)', saveHint.bad.includes('확인') && saveHint.stored === 'My_food_bot', JSON.stringify(saveHint));
  await evaluate(`document.querySelector('#view-profile .back-btn, [data-view-back], #profile-back')?.click(); return true;`);

  // 3) 물어보기: t.me 링크 + 클립보드, 음식 이름·양·끼니만
  await evaluate(`[...document.querySelectorAll('#agent-log .ask-ai-btn')].pop().click(); await new Promise(r => setTimeout(r, 300)); return true;`);
  const ask = await evaluate(`return { url: window.__opened[0] || '', text: window.__copied[0] || '' }`);
  const decoded = decodeURIComponent((ask.url.split('?text=')[1] || ''));
  check('https://t.me/<봇>?text= 로 열기', ask.url.startsWith('https://t.me/My_food_bot?text='), ask.url.slice(0, 60));
  check('같은 질문을 클립보드에도 복사', ask.text && ask.text === decoded, ask.text);
  check('질문 내용: [리빌더스] 끼니: 음식', decoded.startsWith('[리빌더스] 점심: 이삭 햄치즈'), decoded);
  check('체중·심박·걸음 등은 보내지 않음', !/kg|bpm|심박|걸음|체중|70/.test(decoded), decoded);

  // 4) 링크 수신 → 확인 시트(자동 저장 안 함)
  const payload = { meal: 'lunch', source: 'openclaw', foods: [
    { name: '이삭 햄치즈', serving: '1개', cal: 420, carbs: 45, protein: 18, fat: 17, estimate: true, sourceNote: '이삭토스트 공식 영양정보' },
    { name: '아이스 아메리카노', serving: '355ml', cal: 10, carbs: 2, protein: 0.5, fat: 0 } ] };
  await evaluate(`window.__url = RebuildersLogLink.buildLogUrl(${JSON.stringify(payload)}); handleIncomingLogUrl(window.__url); return true;`);
  let sheet = await evaluate(`return { open: document.getElementById('log-link-modal').classList.contains('open'), foods: [...document.querySelectorAll('#log-link-foods .log-link-food')].map(li => li.textContent.replace(/\\s+/g, ' ').trim()), meal: document.querySelector('[data-log-meal].active')?.dataset.logMeal, save: document.getElementById('log-link-save').textContent }`);
  check('링크 받으면 확인 시트(음식·kcal·탄단지·추정·출처, 점심 선택)', sheet.open && sheet.foods.length === 2 && sheet.foods[0].includes('420kcal') && sheet.foods[0].includes('탄수 45g') && sheet.foods[0].includes('추정') && sheet.foods[0].includes('출처') && sheet.meal === 'lunch' && sheet.save === '2개 기록', JSON.stringify(sheet));
  let lunch = await evaluate(stored('lunch'));
  check('확인 전에는 저장 안 됨', lunch.length === 1 && lunch[0].cal === null, JSON.stringify(lunch));
  await evaluate(`document.getElementById('log-link-cancel').click(); return true;`);
  lunch = await evaluate(stored('lunch'));
  check('취소하면 아무것도 저장 안 됨', lunch.length === 1 && !(await evaluate(modalOpen)), JSON.stringify(lunch));

  // 5) 다시 열어 '기록' → 이름만 있던 기록은 채우고, 새 음식은 추가
  await evaluate(`handleIncomingLogUrl(window.__url); document.getElementById('log-link-save').click(); await new Promise(r => setTimeout(r, 500)); return true;`);
  lunch = await evaluate(stored('lunch'));
  check('기록: 이삭 햄치즈는 채움(중복 없음), 아메리카노 추가', lunch.length === 2 && lunch[0].name === '이삭 햄치즈' && lunch[0].cal === 420 && lunch[0].fat === 17 && lunch[0].serving === '1개' && lunch[1].name === '아이스 아메리카노' && lunch[1].cal === 10, JSON.stringify(lunch));
  check('출처·추정 표시 저장(source=openclaw, sourceTrust=estimate)', lunch[0].source === 'openclaw' && lunch[0].sourceTrust === 'estimate' && lunch[0].sourceNote.includes('공식') && lunch[1].sourceTrust === 'ai', JSON.stringify(lunch[0]));
  check('저장 후 시트 닫힘', !(await evaluate(modalOpen)));

  // 6) 끼니 바꿔 저장 + 어제 날짜
  await evaluate(`${keyOf} const y = new Date(); y.setDate(y.getDate() - 1); handleIncomingLogUrl(RebuildersLogLink.buildLogUrl({ date: key(y), meal: 'breakfast', source: 'openclaw', foods: [{ name: '바나나', serving: '1개', cal: 89, carbs: 23, protein: 1.1, fat: 0.3 }] })); document.querySelector('[data-log-meal="snack"]').click(); document.getElementById('log-link-save').click(); await new Promise(r => setTimeout(r, 600)); return true;`);
  const ysnack = await evaluate(stored('snack', -1));
  const ybreak = await evaluate(stored('breakfast', -1));
  const viewing = await evaluate(`${keyOf} const y = new Date(); y.setDate(y.getDate() - 1); return dateKey(currentDate) === key(y)`);
  check('어제 날짜 링크: 시트에서 고른 끼니(간식)로 어제에 저장, 그 날짜로 이동', ysnack.some(f => f.name === '바나나' && f.cal === 89) && !ybreak.length && viewing, JSON.stringify({ ysnack, ybreak, viewing }));
  await evaluate(`await goToToday(); return true;`);

  // 7) 잘못된 링크는 시트 안 열림
  await evaluate(`handleIncomingLogUrl('rebuilders://log?d=@@@'); return true;`);
  check('깨진 링크: 시트 열지 않음', !(await evaluate(modalOpen)));
  await evaluate(`handleIncomingLogUrl('https://evil.example/log.html?d=' + window.__url.split('d=')[1]); return true;`);
  check('다른 도메인 링크: 시트 열지 않음', !(await evaluate(modalOpen)));
  await evaluate(`handleIncomingLogUrl(RebuildersLogLink.buildLogUrl({ meal: 'lunch', foods: [{ name: '<img src=x onerror=alert(1)>', cal: 1 }] })); return true;`);
  const xss = await evaluate(`return { img: !!document.querySelector('#log-link-foods img'), text: document.getElementById('log-link-foods').textContent.includes('<img') }`);
  check('음식 이름 HTML은 글자로만 표시', !xss.img && xss.text, JSON.stringify(xss));
  await evaluate(`document.getElementById('log-link-x').click(); return true;`);

  // 8) 음식 추가 시트·수정 시트에서도 버튼
  await evaluate(`openModal('dinner'); const s = document.getElementById('food-search'); s.value = '저녁 엄마표 잡채'; s.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 300)); return true;`);
  const quickAsk = await evaluate(`return document.querySelector('#quick-foods .ask-ai-btn')?.textContent || ''`);
  check('음식 추가 시트: 모르는 음식이면 "AI에게 물어보기"', quickAsk === 'AI에게 물어보기', quickAsk);
  const knownAsk = await evaluate(`const s = document.getElementById('food-search'); s.value = '저녁 바나나'; s.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 300)); return !!document.querySelector('#quick-foods .ask-ai-btn')`);
  check('DB에 있는 음식만이면 버튼 없음', knownAsk === false);
  await evaluate(`closeModal(); await addFoods('dinner', [{ name: '엄마표 잡채', serving: '1접시' }]); openFoodEdit('dinner', meals.dinner.foods.length - 1); return true;`);
  const editAsk = await evaluate(`return document.querySelector('#meal-detail-edit-grid .ask-ai-btn')?.textContent || ''`);
  check('영양 미입력 기록 수정 시트에 "AI에게 물어보기"', editAsk === 'AI에게 물어보기', editAsk);
  await evaluate(`window.__opened = []; window.__copied = []; document.querySelector('#meal-detail-edit-grid .ask-ai-btn').click(); await new Promise(r => setTimeout(r, 300)); return true;`);
  const editText = await evaluate(`return window.__copied[0] || ''`);
  check('수정 시트 질문: 저녁 + 음식 + 양', editText.startsWith('[리빌더스] 저녁: 엄마표 잡채 1접시'), editText);

  // 9) 백업 JSON에 봇 아이디·링크 내용 외 민감정보 없음(봇 아이디는 기기 설정)
  const backup = await evaluate(`const b = await (globalThis.RebuildersBackup?.buildBackup?.() || storageRepository.getAll()); return JSON.stringify(b)`);
  check('백업에 봇 아이디 포함 안 됨', !backup.includes('My_food_bot'));
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (error) {
  failed++; results.push('ERROR ' + error.message); results.push('page errors: ' + errors.slice(0, 5).join(' | '));
} finally {
  console.log(results.join('\n'));
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  try { ws?.close(); } catch {}
  chrome.kill();
  process.exit(failed ? 1 : 0);
}
