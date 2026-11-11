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
    return { text: msg.querySelector('.agent-bubble-text')?.textContent || '', hasLater: /채워줄게요|찾는 중/.test(msg.textContent), searching: msg.classList.contains('is-searching') };
  `);
  check('영양을 채우면 채팅이 kcal로 바뀌고 찾는 중 안내가 사라짐', /테스트채움음식/.test(r.text) && /120kcal/.test(r.text) && !r.hasLater && !r.searching, JSON.stringify(r));

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

  // 8b. 기존에 없는 음식은 문장 통째로 /interpret 에 보내고, 나온 이름으로 저장한 뒤 영양을 찾음
  r = await evaluate(`
    window.__bridgeCalls = [];
    window.__lastInterpretBody = null;
    const prev = window.fetch;
    window.fetch = async (url, opts = {}) => {
      const path = '/' + String(url).split('/').slice(3).join('/');
      const method = (opts.method || 'GET').toUpperCase();
      window.__bridgeCalls.push(method + ' ' + path);
      if (path === '/health') return new Response(JSON.stringify({ ok: true, interpret: true, jobs: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (path === '/jobs' && method === 'POST') {
        return new Response(JSON.stringify({ ok: true, job_id: 'd'.repeat(32), done: false, pending: ['기존없는음식xyz테스트'] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (path === '/interpret' && method === 'POST') {
        window.__lastInterpretBody = JSON.parse(opts.body || '{}');
        return new Response(JSON.stringify({ ok: true, job_id: 'e'.repeat(32), done: true, pending: [], intent: 'log', items: [{ name: '기존없는음식xyz테스트' }], edits: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return prev(url, opts);
    };
    return 1;
  `);
  r = await evaluate(chat('기존없는음식xyz테스트'));
  const unknownCalls = await evaluate(`return { calls: window.__bridgeCalls.slice(), interpret: window.__lastInterpretBody, searching: [...document.querySelectorAll('#agent-log .agent-message.is-agent')].pop()?.classList.contains('is-searching'), custom: Object.keys(CUSTOM_FOODS || {}), missing: (CUSTOM_FOODS['기존없는음식xyz테스트'] ? 'has' : 'none') };`);
  const unknownUi = await evaluate(`return { searching: [...document.querySelectorAll('#agent-log .agent-message.is-agent')].pop()?.classList.contains('is-searching'), inline: !!document.querySelector('.agent-inline-nutrients') };`);
  check('기존에 없는 음식은 /interpret 로 보낸 뒤 저장되고, 영양이 없으면 kcal·중량 칸만 보이며 찾는 중·/jobs 는 없음', r.foods.some(f => f.name === '기존없는음식xyz테스트') && /저장했어요/.test(r.reply) && /kcal과 중량/.test(r.reply) && unknownCalls.calls.some(c => c === 'POST /interpret') && !unknownCalls.calls.some(c => c === 'POST /jobs') && unknownCalls.interpret?.text === '기존없는음식xyz테스트' && !unknownCalls.searching && !unknownUi.searching && unknownUi.inline, JSON.stringify({ r, unknownCalls, unknownUi }));
  const resolved = await evaluate(`
    const job = RebuildersBridge.getQueue()[0];
    const item = {
      name: '기존없는음식xyz테스트',
      display_name: '공식테스트음식xyz',
      kcal: 200, carbs_g: 20, protein_g: 5, fat_g: 8,
      source_type: '공식', serving: '1개', package_grams: 100,
    };
    const filled = await applyBridgeResult(job || { date: dateKey(currentDate), meal: 'dinner' }, { items: [item], pending: [] });
    return {
      filled,
      custom: Object.keys(CUSTOM_FOODS || {}),
      hasPlaceholder: !!CUSTOM_FOODS['기존없는음식xyz테스트'],
      hasOfficial: !!CUSTOM_FOODS['공식테스트음식xyz'],
      foods: meals.dinner.foods.filter(f => /기존없는음식xyz테스트|공식테스트음식xyz/.test(f.name || f.inputName || '')).map(f => ({ name: f.name, inputName: f.inputName || '', cal: f.cal })),
    };
  `);
  check('찾기가 다른 공식 이름으로 끝나면 빈 자리 이름은 내 음식에서 사라지고 공식 이름으로 합쳐짐',
    resolved.hasOfficial && !resolved.hasPlaceholder && resolved.foods.some(f => f.name === '공식테스트음식xyz' && f.cal === 200),
    JSON.stringify(resolved));

  // 8c. interpret 가 제품 1개 기준 영양을 같이 주면 /jobs 없이 바로 기록
  r = await evaluate(`
    window.__bridgeCalls = [];
    window.__lastInterpretBody = null;
    window.__interpretReply = { intent: 'log', items: [{
      name: '스타벅스 브륄레 쿠키 치즈케이크', brand: '스타벅스',
      amount: 1, unit: '개', package_grams: 380, kcal: 1400, carbs_g: 103, protein_g: 13, fat_g: 104,
      source_type: '공식', source_note: '포장지', meal: 'lunch',
    }], edits: [] };
    const prev = window.fetch;
    window.fetch = async (url, opts = {}) => {
      const path = '/' + String(url).split('/').slice(3).join('/');
      const method = (opts.method || 'GET').toUpperCase();
      window.__bridgeCalls.push(method + ' ' + path);
      if (path === '/health') return new Response(JSON.stringify({ ok: true, interpret: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      if (path === '/interpret' && method === 'POST') {
        window.__lastInterpretBody = JSON.parse(opts.body || '{}');
        return new Response(JSON.stringify({ ok: true, job_id: 'c'.repeat(32), done: true, pending: [], ...window.__interpretReply }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return prev(url, opts);
    };
    return 1;
  `);
  r = await evaluate(chat('점심에 스벅 브륄레 치즈 케익 먹었어'));
  const oneShot = await evaluate(`return {
    calls: window.__bridgeCalls.slice(),
    lunch: meals.lunch.foods.filter(f => /브륄레/.test(f.name)).map(f => ({ name: f.name, cal: f.cal, serving: f.serving, grams: f.servingGrams, pack: f.packageGrams, brand: f.brand, source: f.sourceLabel })),
    custom: !!CUSTOM_FOODS['스타벅스 브륄레 쿠키 치즈케이크'],
    searching: [...document.querySelectorAll('#agent-log .agent-message.is-agent')].pop()?.classList.contains('is-searching'),
  };`);
  check('interpret 가 영양을 같이 주면 1개 1400kcal로 바로 저장하고 /jobs·찾는 중은 없음',
    r.foods.some(f => f.name === '스타벅스 브륄레 쿠키 치즈케이크' && f.cal === 1400)
      && /1400kcal/.test(r.reply) && !/찾는 중/.test(r.reply)
      && oneShot.calls.some(c => c === 'POST /interpret') && !oneShot.calls.some(c => c === 'POST /jobs')
      && oneShot.lunch[0]?.cal === 1400 && oneShot.lunch[0]?.pack === 380 && oneShot.lunch[0]?.source === '공식'
      && oneShot.custom && !oneShot.searching,
    JSON.stringify({ r, oneShot }));

  // 9. 애매한 말은 원문 통째로 /interpret
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

  r = await evaluate(`
    window.__interpretReply = { intent: 'clarify', items: [], edits: [], clarifyQuestion: '한 제품이에요, 두 개예요?', clarifyOptions: ['한 제품', '두 개'] };
    await interpretOrFallback('신제품모호한입력xyz');
    return {
      reply: [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].pop()?.textContent || '',
      choices: [...document.querySelectorAll('#agent-log .agent-choice')].map(b => b.textContent),
    };
  `);
  check('interpret clarify 는 선택 버튼을 보여 줌', /한 제품이에요, 두 개예요\?/.test(r.reply) && r.choices.slice(-2).join('|') === '한 제품|두 개', JSON.stringify(r));

  // 10b. 저장된 브륄레는 줄임말로 바로 넣고, 이어서 말한 1/4은 AI 없이 수정. 점심 시각은 그대로.
  r = await evaluate(`
    window.__bridgeCalls = [];
    await saveCustomFood('스타벅스 브륄레 쿠키 치즈케이크', {
      cal: 1400, carbs: 103, protein: 13, fat: 104,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      packageGrams: 380, unitGrams: { '개': 380 }, servingGrams: 380,
      brand: '스타벅스', sourceTrust: 'user', sourceLabel: '내 음식',
      basisNutrients: { cal: 1400, carbs: 103, protein: 13, fat: 104 },
      basisGrams: 380, basis: '380g',
    });
    await saveCustomFood('스타벅스 더블치즈케이크', {
      cal: 503, carbs: 40, protein: 8, fat: 30,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      brand: '스타벅스', sourceTrust: 'user', sourceLabel: '내 음식',
    });
    meals.lunch.foods = (meals.lunch.foods || []).filter(f => !/브륄레/.test(f.name || ''));
    mealTimes = defaultMealTimes();
    return { lunch: mealTimes.lunch.value, calls: window.__bridgeCalls.slice() };
  `);
  const timeBefore = await evaluate(`return mealTimes.lunch.value;`);
  r = await evaluate(chat('점심에 스벅 브륄레 치즈 케익 먹었어'));
  const afterFirst = await evaluate(`
    const lunch = meals.lunch.foods.map(f => ({ id: f.id, name: f.name, cal: f.cal, serving: f.serving, amount: f.servingAmount, unit: f.servingUnit }));
    return { lunch, time: mealTimes.lunch.value, calls: window.__bridgeCalls.slice(), custom: Object.keys(CUSTOM_FOODS || {}) };
  `);
  const bruleeFirst = afterFirst.lunch.filter(f => f.name === '스타벅스 브륄레 쿠키 치즈케이크');
  check('저장된 브륄레는 줄임말로 바로 1개 1400kcal, /interpret 없음',
    bruleeFirst.length === 1 && bruleeFirst[0].cal === 1400
      && /저장했어요/.test(r.reply) && !afterFirst.calls.some(c => /\/(interpret|jobs|log)/.test(c)),
    JSON.stringify({ r, afterFirst }));
  check('점심 시각은 음식을 넣어도 그대로', afterFirst.time === timeBefore && timeBefore === '12:30', JSON.stringify({ timeBefore, after: afterFirst.time }));

  r = await evaluate(chat('4조각으로 나눠서 1조각만 먹었어'));
  const afterQuarter = await evaluate(`
    const lunch = meals.lunch.foods.map(f => ({ name: f.name, cal: f.cal, serving: f.serving, amount: f.servingAmount, unit: f.servingUnit, grams: f.servingGrams }));
    return { lunch, time: mealTimes.lunch.value, calls: window.__bridgeCalls.slice() };
  `);
  const bruleeQ = afterQuarter.lunch.filter(f => f.name === '스타벅스 브륄레 쿠키 치즈케이크');
  check('이어서 1/4 말하면 한 기록이 350kcal로 바뀌고 새 음식을 넣지 않음',
    bruleeQ.length === 1 && bruleeQ[0].cal === 350 && (bruleeQ[0].amount === 0.25 || bruleeQ[0].grams === 95)
      && !afterQuarter.calls.some(c => /\/(interpret|jobs|log)/.test(c)),
    JSON.stringify({ r, afterQuarter }));

  // 10c. 애매한 이름은 아무 메뉴나 고르지 않고 후보 버튼을 보여 줌
  r = await evaluate(`window.__bridgeCalls = []; return 1;`);
  r = await evaluate(chat('스타벅스 치즈케이크'));
  const amb = await evaluate(`
    return {
      reply: [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].pop()?.textContent || '',
      choices: [...document.querySelectorAll('#agent-log .agent-choice')].map(b => b.textContent),
      foods: ${allFoods},
      calls: window.__bridgeCalls.slice(),
    };
  `);
  check('스타벅스 치즈케이크는 더블과 브륄레 후보 버튼을 보여 주고 자동으로 고르지 않음',
    /어떤 음식이에요?/.test(amb.reply) && amb.choices.some(l => /브륄레/.test(l)) && amb.choices.some(l => /더블/.test(l))
      && !amb.foods.some(f => f.name === '스타벅스 더블치즈케이크' && f.meal !== 'lunch' ? false : false)
      && !amb.calls.some(c => /\/interpret/.test(c)),
    JSON.stringify(amb));
  // 후보를 고르기 전에는 새 기록이 없어야 함(점심 브륄레 1개만 유지)
  check('후보를 고르기 전에는 새 기록을 넣지 않음',
    amb.foods.filter(f => /치즈케이크/.test(f.name)).length === 1 && amb.foods.some(f => f.name === '스타벅스 브륄레 쿠키 치즈케이크' && f.cal === 350),
    JSON.stringify(amb.foods));

  // 11. 브리지가 꺼지면 기존 규칙으로 넣고 짧게 알림
  r = await evaluate(`
    pendingClarify = null;
    window.fetch = async () => { throw new TypeError('Failed to fetch'); };
    RebuildersBridge.resetOffline();
    return 1;
  `);
  r = await evaluate(chat('해석실패테스트바나나'));
  const fallbackNotes = await evaluate(`return [...document.querySelectorAll('#agent-log .agent-message.is-agent .agent-bubble-text')].slice(-3).map(el => el.textContent);`);
  check('브리지가 꺼져도 기존에 없는 음식은 바로 저장됨', r.foods.some(f => /해석실패테스트바나나|바나나/.test(f.name)) && fallbackNotes.some(t => /저장했어요/.test(t)), JSON.stringify({ fallbackNotes, foods: r.foods, reply: r.reply }));

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
