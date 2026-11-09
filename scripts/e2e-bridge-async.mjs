// 맥 미니 브리지 '맡기고 나중에 받기'(POST /jobs → GET /jobs/<id>): 폰이 오래 기다리지 않고, 먼저 찾은 음식부터 채움.
// 가짜 브리지(fetch 바꿔치기)만 씀 — 실제 맥 미니·토큰·사용자 기록 안 씀(임시 크롬 프로필).
// 사용법: 정적 서버 8765 → node scripts/e2e-bridge-async.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9383, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-bridge-async-'));
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
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const JOB = 'a'.repeat(32);
  // 가짜 브리지: /jobs 맡기면 바로 job_id, 결과는 GET 할 때마다 하나씩(케이크 → 라떼) 끝남
  const fake = `
    RebuildersBridge.setConfig({ url: 'http://127.0.0.1:9', token: 'dummy-test-token-not-real-0000' }); RebuildersBridge.resetOffline();
    const val = (name, kcal) => ({ name, display_name: name, serving: '1개', kcal, carbs_g: 30, protein_g: 8, fat_g: 12, sugar_g: 20, sodium_mg: 150, source_type: '블로그·앱', source_url: 'https://example.com/x', source_note: '블로그', estimated: true });
    window.__calls = []; window.__polls = 0; window.__mode = window.__mode || 'jobs';
    window.fetch = async (url, opts = {}) => {
      const path = new URL(String(url)).pathname; const method = opts.method || 'GET'; __calls.push(method + ' ' + path);
      const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
      if (path === '/health') return json(200, { ok: true, version: 2, jobs: true });
      if (path === '/jobs' && method === 'POST') {
        if (__mode === 'old') return json(404, { ok: false, error: 'not_found' });
        const names = JSON.parse(opts.body).items.map(i => i.name);
        return json(200, { ok: true, job_id: '${JOB}', done: false, items: [], failed: [], pending: names });
      }
      if (path === '/jobs/${JOB}') {
        if (__mode === 'lost') { __mode = 'jobs'; return json(404, { ok: false, error: 'job_not_found' }); }
        __polls++;
        const items = [val('테스트케이크', 1028), val('내라떼', 999)];
        if (__polls >= 2) items.push(val('테스트라떼', 285));
        return json(200, { ok: true, job_id: '${JOB}', done: __polls >= 2, items, failed: [], pending: __polls >= 2 ? [] : ['테스트라떼'] });
      }
      if (path === '/log' && method === 'POST') { const names = JSON.parse(opts.body).items.map(i => i.name); return json(200, { ok: true, items: names.map(n => val(n, 111)), failed: [] }); }
      return json(404, { ok: false, error: 'not_found' });
    }; true;`;
  const dinner = `const d = await storageRepository.getDay(dateKey(currentDate)); return Object.fromEntries((d?.dinner || []).map(f => [f.inputName || f.name, { cal: f.cal ?? null, sugar: f.sugar ?? null, sodium: f.sodium ?? null, label: f.sourceLabel || '', type: f.sourceType || '', est: !!f.aiEstimate }]));`;

  // 1) 맡기기: 폰은 바로 끝나고(긴 요청 없음) 작업 번호만 남김
  const a = await evaluate(`${fake}
    await addFood('dinner', { name: '테스트라떼', serving: '톨' }); await addFood('dinner', { name: '테스트케이크', serving: '1개' });
    await addFood('dinner', { name: '내라떼', cal: 100, carbs: 10, protein: 5, fat: 3, sourceLabel: '내 음식', sourceTrust: 'user' });
    const t0 = performance.now();
    queueBridgeLookup('dinner', meals.dinner.foods);
    await bridgeRunPromise; const ms = Math.round(performance.now() - t0);
    const q = RebuildersBridge.getQueue(); const chip = document.getElementById('bridge-pending');
    return { ms, calls: __calls, q: q.map(j => ({ remote: j.remoteId, items: j.items.map(i => i.name) })), chip: chip.textContent, hidden: chip.hidden, timer: !!bridgePollTimer };`);
  check('맡기기: 바로 끝남(1초 안), POST /jobs 한 번, 음식 2개만 보냄(내 음식 안 보냄)', a.ms < 1000 && JSON.stringify(a.calls) === '["GET /health","POST /jobs"]' && a.q.length === 1 && a.q[0].items.length === 2, JSON.stringify(a));
  check("대기 목록에 작업 번호 저장 + 칩 'AI가 찾는 중 2' + 자동 다시 묻기 예약", a.q[0]?.remote === JOB && a.chip === 'AI가 찾는 중 2' && !a.hidden && a.timer, JSON.stringify(a));

  // 2) 3초 뒤 자동으로 결과만 받아옴 → 먼저 찾은 케이크만 채움, 라떼는 계속 대기
  await sleep(3600);
  const b = await evaluate(`const v = await (async () => { ${dinner} })(); const q = RebuildersBridge.getQueue(); return { v, q: q.map(j => ({ remote: j.remoteId, items: j.items.map(i => i.name) })), calls: __calls, chip: document.getElementById('bridge-pending').textContent };`);
  const cake = b.v['테스트케이크'];
  check('자동으로 GET /jobs/<id> → 케이크 먼저 채움', b.calls.includes(`GET /jobs/${JOB}`) && cake?.cal === 1028 && b.v['테스트라떼']?.cal === null, JSON.stringify(b));
  check("채운 값: 당류·나트륨·찾은 곳(블로그·앱), 표시는 '추정'", cake?.sugar === 20 && cake?.sodium === 150 && cake?.type === '블로그·앱' && cake?.label === '추정' && cake?.est, JSON.stringify(cake));
  check('내 음식(직접 넣은 값)은 안 덮어씀', b.v['내라떼']?.cal === 100 && b.v['내라떼']?.label === '내 음식', JSON.stringify(b.v['내라떼']));
  check("남은 라떼만 대기(작업 번호 유지), 칩 'AI가 찾는 중 1'", b.q.length === 1 && b.q[0].remote === JOB && JSON.stringify(b.q[0].items) === '["테스트라떼"]' && b.chip === 'AI가 찾는 중 1', JSON.stringify(b.q));

  // 3) 화면 복귀 → 나머지 채우고 대기·칩 사라짐
  const c = await evaluate(`document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 50)); await bridgeRunPromise; await new Promise(r => setTimeout(r, 100));
    const v = await (async () => { ${dinner} })(); return { latte: v['테스트라떼'], q: RebuildersBridge.getQueue().length, hidden: document.getElementById('bridge-pending').hidden, timer: !!bridgePollTimer };`);
  check('화면 복귀 → 라떼 채움, 대기 비고 칩 숨김, 예약 없음', c.latte?.cal === 285 && c.q === 0 && c.hidden && !c.timer, JSON.stringify(c));

  // 4) 맥 미니가 다시 켜져 작업이 사라졌으면(404) 새로 맡김
  const d = await evaluate(`${fake} window.__mode = 'lost';
    const r = await RebuildersBridge.lookup({ date: dateKey(currentDate), meal: 'dinner', items: [{ name: '테스트라떼' }], remoteId: '${JOB}' });
    return { calls: __calls, pending: r.pending, remote: r.remoteId };`);
  check('작업이 사라졌으면(404) 다시 POST /jobs', JSON.stringify(d.calls.filter(x => x !== 'GET /health')) === `["GET /jobs/${JOB}","POST /jobs"]` && d.remote === JOB, JSON.stringify(d));

  // 5) 예전 브리지(/jobs 없음) → POST /log 로 대신
  const e = await evaluate(`window.__mode = 'old'; ${fake}
    const r = await RebuildersBridge.lookup({ date: dateKey(currentDate), meal: 'dinner', items: [{ name: '옛날떡' }] }); window.__mode = 'jobs';
    return { calls: __calls.filter(x => x !== 'GET /health'), items: r.items.map(i => i.name), pending: r.pending, remote: r.remoteId };`);
  check('예전 브리지면 POST /log 로 대신(호환)', JSON.stringify(e.calls) === '["POST /jobs","POST /log"]' && e.items[0] === '옛날떡' && !e.pending.length && !e.remote, JSON.stringify(e));

  // 6) 바로 필요할 때(AI로 찾기): 짧게 여러 번 물어 다 모음
  const f = await evaluate(`window.__mode = 'jobs'; ${fake}
    const r = await RebuildersBridge.lookupAndWait({ date: dateKey(currentDate), meal: 'snack', items: [{ name: '테스트라떼' }, { name: '테스트케이크' }] }, { intervalMs: 50, maxMs: 3000 });
    return { names: r.items.map(i => i.name).sort(), pending: r.pending, failed: r.failed, longest: 'none' };`);
  check('lookupAndWait: 짧은 요청 여러 번으로 결과 모음', f.names.includes('테스트라떼') && f.names.includes('테스트케이크') && !f.pending.length && !f.failed.length, JSON.stringify(f));
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
