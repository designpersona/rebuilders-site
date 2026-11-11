// 채팅 의도: 제품 이름 유지·수정·질문·검색 폴백·채운 뒤 메시지 갱신. Headless Chrome(CDP).
// 사용법: npm run build && python3 -m http.server 9876 --bind 127.0.0.1 -d www  → node scripts/e2e-chat-intent.mjs http://127.0.0.1:9876/index.html
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9398, URL = process.argv[2] || 'http://127.0.0.1:9876/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-intent-'));
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
const allFoods = `(() => { const out = []; ['breakfast','lunch','dinner','snack'].forEach(m => (meals[m]?.foods || []).forEach(f => out.push({ meal: m, name: f.name, cal: f.cal ?? null, serving: f.serving ?? null }))); return out; })()`;
const chat = text => `const i = document.getElementById('agent-input'); i.value = ${JSON.stringify(text)}; await handleAgentCommand(); return { reply: [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].pop()?.textContent || '', foods: ${allFoods}, choices: [...document.querySelectorAll('#agent-log .agent-choice')].map(b => b.textContent), undo: !!document.querySelector('#agent-log .agent-undo') };`;
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();

  // 1. 제품 이름 하나 → 되묻기, 한 제품으로 저장
  let r = await evaluate(chat('너트한줌 럭셔리'));
  check("'너트한줌 럭셔리'는 바로 쪼개지 않고 되물음", /한 제품이에요, 두 개예요\?/.test(r.reply) && r.choices.join('|') === '한 제품|두 개' && r.foods.length === 0, JSON.stringify(r));
  r = await evaluate(`document.querySelector('#agent-log .agent-choice')?.click(); await new Promise(s => setTimeout(s, 400)); return { reply: [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].pop()?.textContent || '', foods: ${allFoods} };`);
  check('한 제품을 고르면 한 항목만 저장', r.foods.length === 1 && r.foods[0].name === '너트한줌 럭셔리' && /저장했어요/.test(r.reply), JSON.stringify(r));

  // 2. 칼로리 수정 + 되돌리기 버튼
  r = await evaluate(chat('99kcal로 바꿔줘'));
  check("'99kcal로 바꿔줘'는 새 음식이 아니라 수정", r.foods.length === 1 && r.foods[0].cal === 99 && r.foods[0].name === '너트한줌 럭셔리' && /99kcal/.test(r.reply) && r.undo, JSON.stringify(r));

  // 3. 질문은 기록하지 않고 답만
  const beforeN = 1;
  r = await evaluate(chat('이거 몇 kcal야?'));
  check("'이거 몇 kcal야?'는 답만 하고 기록을 추가하지 않음", r.foods.length === beforeN && /99kcal/.test(r.reply) && !/저장했어요/.test(r.reply), JSON.stringify(r));

  // 4. 혼합 주스는 한 항목
  r = await evaluate(chat('토마토 블루베리 주스 200ml'));
  check("'토마토 블루베리 주스 200ml'는 한 항목", r.foods.filter(f => /주스/.test(f.name)).length === 1 && r.foods.some(f => f.name === '토마토 블루베리 주스' && f.serving === '200ml') && !/한 제품이에요/.test(r.reply), JSON.stringify(r));

  // 5. 찌개+밥은 계속 둘로
  const before = r.foods.length;
  r = await evaluate(chat('점심 참치김치찌개 백미밥'));
  const lunch = r.foods.filter(f => f.meal === 'lunch').map(f => f.name);
  check("'참치김치찌개 백미밥'은 두 항목", lunch.includes('참치김치찌개') && lunch.includes('밥') && r.foods.length === before + 2, JSON.stringify({ lunch, foods: r.foods }));

  // 6. 채운 뒤 채팅 문구가 kcal로 바뀜
  r = await evaluate(`
    const i = document.getElementById('agent-input'); i.value = '간식 테스트채움음식'; await handleAgentCommand();
    const msg = [...document.querySelectorAll('#agent-log .agent-message.is-agent')].pop();
    const food = meals.snack.foods.find(f => f.name === '테스트채움음식');
    food.cal = 120; food.carbs = 10; food.protein = 5; food.fat = 4;
    pendingFillChats.push({ chatId: msg.dataset.chatId, date: dateKey(currentDate), mealId: 'snack', ids: [food.id], names: [food.name] });
    announceBridgeFill({ date: dateKey(currentDate), meal: 'snack' }, [food]);
    return { text: msg.querySelector('.agent-bubble-text')?.textContent || '', hasLater: /채워줄게요/.test(msg.textContent) };
  `);
  check('영양을 채우면 채팅이 kcal로 바뀌고 채워줄게요는 사라짐', /테스트채움음식/.test(r.text) && /120kcal/.test(r.text) && !r.hasLater, JSON.stringify(r));

  // 7. 검색 시트 폴백
  r = await evaluate(`
    openModal('snack');
    const s = document.getElementById('food-search');
    s.value = '너트한줌럭셔리xyz테스트';
    s.dispatchEvent(new Event('input'));
    await new Promise(done => setTimeout(done, 200));
    const first = document.querySelector('#quick-foods > :first-child');
    const second = document.querySelector('#quick-foods .quick-record-btn.is-secondary');
    const bg = first && getComputedStyle(first).backgroundColor;
    document.querySelector('#quick-foods .fs-ai-find')?.click();
    await new Promise(done => setTimeout(done, 250));
    return {
      first: first?.textContent || '',
      firstClass: first?.className || '',
      second: second?.textContent || '',
      bg,
      error: document.querySelector('#quick-foods .fs-lookup-error')?.textContent || '',
      kcal: !!document.querySelector('#quick-foods .fs-manual-kcal'),
      amount: !!document.querySelector('#quick-foods .fs-manual-amount'),
    };
  `);
  check('검색 실패 시 AI로 찾아서 넣기가 첫 버튼(어두운 배경)', /AI로 찾아서 넣기/.test(r.first) && /fs-ai-find/.test(r.firstClass) && r.bg === 'rgb(24, 24, 27)', JSON.stringify(r));
  check('바로 기록 (영양정보 미입력)이 보조 버튼', /바로 기록 \(영양정보 미입력\)/.test(r.second), JSON.stringify(r));
  check('AI 실패 시 이유와 kcal·양 칸을 바로 보여 줌', r.error === '맥 미니에 연결할 수 없어요' && r.kcal && r.amount, JSON.stringify(r));

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
