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
  const nav = url ? send('Page.navigate', { url }) : send('Page.reload', { ignoreCache: true });
  await nav;
  let last = '';
  for (let i = 0; i < 120; i++) {
    await sleep(150);
    try {
      if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof RebuildersQuickEntry !== 'undefined'`)) return;
    } catch (error) { last = String(error.message || error); }
  }
  throw new Error('app not ready' + (last ? ' — ' + last : ''));
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

  // 8. 내 음식 재사용: 브리지 호출 없이 저장값 그대로
  r = await evaluate(`
    await saveCustomFood('오리지널너트한줌럭셔리', { cal: 123, carbs: 6, protein: 4, fat: 9, serving: '20g', sourceTrust: 'user', sourceLabel: '내 음식' });
    window.__realFetch = window.fetch; window.__bridgeCalls = [];
    RebuildersBridge.setConfig({ url: 'http://127.0.0.1:9', token: 'dummy-test-token-not-real-0000' });
    RebuildersBridge.resetOffline();
    window.fetch = async (url, opts = {}) => {
      const path = '/' + String(url).split('/').slice(3).join('/');
      window.__bridgeCalls.push((opts.method || 'GET').toUpperCase() + ' ' + path);
      if (path === '/health') return new Response(JSON.stringify({ ok: true, interpret: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ ok: true, job_id: 'a'.repeat(32), done: true, pending: [], intent: 'log', items: [], edits: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    return 1;
  `);
  r = await evaluate(chat('오리지널너트한줌럭셔리'));
  check('내 음식 오리지널너트한줌럭셔리는 브리지 없이 123kcal 그대로', r.foods.some(f => f.name === '오리지널너트한줌럭셔리' && f.cal === 123) && /저장했어요/.test(r.reply), JSON.stringify(r));
  const callsAfterMine = await evaluate(`return window.__bridgeCalls.slice();`);
  check('내 음식 재사용은 /interpret·/jobs·/log 를 부르지 않음', !callsAfterMine.some(c => /\/(interpret|jobs|log)/.test(c)), JSON.stringify(callsAfterMine));

  // 9. 모르는 말은 원문 통째로 /interpret
  r = await evaluate(`
    window.__bridgeCalls = [];
    window.__lastInterpretBody = null;
    window.__interpretReply = { intent: 'log', items: [{ name: '블루베리 토마토 사과 주스', amount: 1, unit: '컵' }, { name: '너트한줌 럭셔리신제품' }], edits: [] };
    const prev = window.fetch;
    window.fetch = async (url, opts = {}) => {
      const path = '/' + String(url).split('/').slice(3).join('/');
      const method = (opts.method || 'GET').toUpperCase();
      window.__bridgeCalls.push(method + ' ' + path);
      if (path === '/health') return new Response(JSON.stringify({ ok: true, interpret: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (path === '/interpret' && method === 'POST') {
        window.__lastInterpretBody = JSON.parse(opts.body || '{}');
        return new Response(JSON.stringify({ ok: true, job_id: 'b'.repeat(32), done: true, pending: [], ...window.__interpretReply }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return prev(url, opts);
    };
    return 1;
  `);
  r = await evaluate(chat('블루베리 토마토 사과 주스 한컵이랑 너트한줌 럭셔리신제품'));
  const interpretBody = await evaluate(`return { body: window.__lastInterpretBody, calls: window.__bridgeCalls };`);
  check('모르는 말은 /interpret 에 원문 전체를 보냄', interpretBody.body?.text === '블루베리 토마토 사과 주스 한컵이랑 너트한줌 럭셔리신제품' && interpretBody.calls.some(c => c === 'POST /interpret'), JSON.stringify(interpretBody));
  check('interpret log 결과는 주스와 제품을 나눠 저장', r.foods.some(f => f.name === '블루베리 토마토 사과 주스') && r.foods.some(f => f.name === '너트한줌 럭셔리신제품') && /저장했어요/.test(r.reply), JSON.stringify(r));

  // 10. interpret 로 수정·질문·되묻기
  r = await evaluate(`
    window.__interpretReply = { intent: 'edit', items: [], edits: [{ targetName: '너트한줌 럭셔리신제품', field: 'kcal', value: 77 }] };
    return 1;
  `);
  r = await evaluate(chat('아까 그 너트 77kcal로 바꿔줘'));
  check('interpret edit 는 기록을 수정하고 새로 넣지 않음', r.foods.filter(f => f.name === '너트한줌 럭셔리신제품').length === 1 && r.foods.some(f => f.name === '너트한줌 럭셔리신제품' && f.cal === 77) && /77kcal/.test(r.reply), JSON.stringify(r));

  const beforeQ = await evaluate(`return (${allFoods}).length;`);
  r = await evaluate(`window.__interpretReply = { intent: 'question', items: [], edits: [], answer: '지금은 확인된 값이 없어요' }; return 1;`);
  r = await evaluate(chat('스벅 브륄레 쿠키 치즈케이크 칼로리 얼마야?'));
  const afterQ = await evaluate(`return (${allFoods}).length;`);
  check('interpret question 은 답만 하고 기록을 추가하지 않음', afterQ === beforeQ && /확인된 값이 없어요/.test(r.reply), JSON.stringify({ afterQ, beforeQ, r }));

  r = await evaluate(`window.__interpretReply = { intent: 'clarify', items: [], edits: [], clarifyQuestion: '한 제품이에요, 두 개예요?', clarifyOptions: ['한 제품', '두 개'] }; return 1;`);
  r = await evaluate(chat('신제품모호한입력xyz'));
  check('interpret clarify 는 선택 버튼을 보여 줌', /한 제품이에요, 두 개예요\?/.test(r.reply) && r.choices.slice(-2).join('|') === '한 제품|두 개', JSON.stringify(r));

  // 11. 브리지가 꺼지면 기존 규칙으로 넣고 짧게 알림
  r = await evaluate(`
    pendingClarify = null;
    window.fetch = async () => { throw new TypeError('Failed to fetch'); };
    RebuildersBridge.resetOffline();
    return 1;
  `);
  r = await evaluate(chat('해석실패테스트바나나'));
  const fallbackNotes = await evaluate(`return [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].slice(-3).map(el => el.textContent);`);
  check('브리지가 꺼지면 휴대폰 규칙으로 넣고 연결이 안 된다고 알림', fallbackNotes.some(t => /맥 미니에 연결할 수 없어서/.test(t)) && r.foods.some(f => /해석실패테스트바나나|바나나/.test(f.name)), JSON.stringify({ fallbackNotes, foods: r.foods }));

  // 12. 검색 순서·중복 제거
  r = await evaluate(`
    window.fetch = window.__realFetch;
    RebuildersBridge.setConfig({ url: '', token: '' });
    RebuildersBridge.resetOffline();
    await saveCustomFood('랭킹테스트내것', { cal: 80, carbs: 8, protein: 2, fat: 1, serving: '1개', sourceTrust: 'user', sourceLabel: '내 음식' });
    await saveCustomFood('랭킹테스트공식', { cal: 80, carbs: 8, protein: 2, fat: 1, serving: '1개', sourceTrust: 'user', sourceLabel: '내 음식', nutritionSource: { provider: 'USDA FoodData Central' } });
    await saveCustomFood('랭킹테스트공식만', { cal: 55, carbs: 11, protein: 1, fat: 0, serving: '100g', nutritionSource: { provider: 'USDA FoodData Central' } });
    await saveCustomFood('랭킹테스트추정', { cal: 90, carbs: 12, protein: 1, fat: 3, serving: '1개', aiEstimate: true, sourceTrust: 'estimate', sourceLabel: '추정' });
    await saveCustomFood('랭킹테스트최근', { cal: 40, carbs: 4, protein: 1, fat: 1, serving: '1개', nutritionSource: { provider: 'USDA FoodData Central' } });
    await addFood('snack', { name: '랭킹테스트최근', cal: 40, carbs: 4, protein: 1, fat: 1, serving: '1개', nutritionSource: { provider: 'USDA FoodData Central' } });
    closeModal?.(); openModal('snack');
    await new Promise(s => setTimeout(s, 300));
    const f = document.getElementById('food-search');
    f.value = '랭킹테스트';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(s => setTimeout(s, 400));
    const labels = [...document.querySelectorAll('#quick-foods .food-section-label')].map(el => el.textContent.replace(/\s+/g, ' ').trim());
    const names = [...document.querySelectorAll('#quick-foods .sheet-food-row .chip-name')].map(el => el.textContent);
    const officialCount = names.filter(n => n === '랭킹테스트공식').length;
    const hasHint = [...document.querySelectorAll('#quick-foods .chip-hint')].length;
    closeModal();
    return { labels, names, officialCount, hasHint };
  `);
  const labelOrder = r.labels.map(l => l.replace(/· \d+$/, '').replace(/식약처/g, '').trim());
  const iMine = labelOrder.findIndex(l => /내 음식/.test(l));
  const iRecent = labelOrder.findIndex(l => /^최근/.test(l));
  const iDb = labelOrder.findIndex(l => /영양 DB/.test(l));
  const iEst = labelOrder.findIndex(l => /AI 추정/.test(l));
  check('검색 순서는 내 음식 → 최근 → 공식 DB → AI 추정', iMine !== -1 && iRecent !== -1 && iDb !== -1 && iEst !== -1 && iMine < iRecent && iRecent < iDb && iDb < iEst, JSON.stringify({ labels: r.labels, labelOrder, iMine, iRecent, iDb, iEst }));
  check('같은 음식(랭킹테스트공식)은 내 음식 한 줄만, 최근·공식만·추정도 보임', r.officialCount === 1 && r.names.includes('랭킹테스트내것') && r.names.includes('랭킹테스트추정') && r.names.includes('랭킹테스트최근') && r.names.includes('랭킹테스트공식만'), JSON.stringify(r));
  check('검색 목록에는 출처 라벨을 붙이지 않음', r.hasHint === 0, JSON.stringify(r));

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
