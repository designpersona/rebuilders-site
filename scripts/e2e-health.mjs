// Headless Chrome(CDP) 로 건강 앱(심박수) 연결 흐름을 가짜 네이티브 플러그인으로 확인합니다. Node 22 내장 WebSocket 사용.
import { spawn } from 'node:child_process';
const PORT = 9335, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 사용법: npm run build && python3 -m http.server 8765 --bind 127.0.0.1 -d .  (다른 터미널, 저장소 루트: www 에는 실제 Capacitor 런타임이 들어 있어 가짜 플러그인을 덮어씀) → node scripts/e2e-health.mjs
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
const MOCK = `(() => {
  const calls = [];
  const now = new Date();
  const dayStart = offset => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - offset); return d; };
  const at = (offset, h, m = 0) => { const d = dayStart(offset); d.setHours(h, m); return d.toISOString(); };
  // 오늘: 64(1시간 전), 80(1분 전) / 어제: 70, 90(최근 21:30)
  const today1 = new Date(now.getTime() - 3600000).toISOString(), today2 = new Date(now.getTime() - 60000).toISOString();
  const heart = [
    { value: 80, startDate: today2, endDate: today2 }, { value: 64, startDate: today1, endDate: today1 },
    { value: 90, startDate: at(1, 21, 30), endDate: at(1, 21, 30) }, { value: 70, startDate: at(1, 9), endDate: at(1, 9) },
  ].map(x => ({ dataType: 'heartRate', unit: 'bpm', ...x }));
  const Health = {
    isAvailable: async () => ({ available: true }),
    requestAuthorization: async opts => { calls.push(['requestAuthorization', opts]); return { readAuthorized: opts.read, readDenied: [], writeAuthorized: [], writeDenied: [] }; },
    readSamples: async opts => { calls.push(['readSamples', opts]); return { samples: opts.dataType === 'heartRate' ? heart : [] }; },
    queryAggregated: async opts => {
      calls.push(['queryAggregated', opts]);
      if (opts.dataType === 'steps') return { samples: [{ startDate: dayStart(0).toISOString(), value: 3456 }, { startDate: dayStart(1).toISOString(), value: 8000.4 }] };
      return { samples: [{ startDate: dayStart(1).toISOString(), value: 79.6 }] };
    },
    saveSample: async () => { calls.push(['saveSample']); },
  };
  window.__healthCalls = calls;
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: { Health }, registerPlugin: name => (name === 'Health' ? Health : undefined) };
})();`;
try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  // 1) 웹(플러그인 없음): 설정 카드·홈 카드 모두 숨김
  await load(URL);
  let st = await evaluate(`return { settings: document.getElementById('health-card').hidden, home: document.getElementById('glance-heart').hidden, supported: RebuildersHealth.isSupported() }`);
  const webLink = await evaluate(`return document.getElementById('health-glance-connect').hidden && document.getElementById('glance-steps').hidden`);
  check('웹: 설정 건강 카드 숨김, 캐릭터 옆 자리는 비움(링크도 없음)', st.settings && st.home && !st.supported && webLink, JSON.stringify(st));

  // 2) 아이폰(가짜 플러그인): 설정 카드 보임, 누르기 전엔 권한 요청 없음
  await send('Page.addScriptToEvaluateOnNewDocument', { source: MOCK });
  await load();
  await evaluate(`localStorage.removeItem('rebuilders-health-connected'); return true;`); await load();
  st = await evaluate(`return { settings: document.getElementById('health-card').hidden, home: document.getElementById('glance-heart').hidden, calls: window.__healthCalls.map(c => c[0]) }`);
  const link = await evaluate(`return !document.getElementById('health-glance-connect').hidden && !!document.querySelector('.player-card #health-glance-connect')`);
  check('앱: 설정에 "건강 앱 연결" 보임, 연결 전 캐릭터 옆엔 "건강 앱 연결" 작은 링크만', !st.settings && st.home && link, JSON.stringify(st));
  check('앱을 열기만 해서는 권한 요청 안 함', !st.calls.includes('requestAuthorization'), JSON.stringify(st.calls));

  // 3) 연결 버튼 → 읽기 전용 권한 요청 → 홈 카드 표시
  await evaluate(`document.getElementById('health-connect').click(); await new Promise(r => setTimeout(r, 300)); return true;`);
  st = await evaluate(`const auth = window.__healthCalls.find(c => c[0] === 'requestAuthorization'); return { auth: auth && auth[1], home: document.getElementById('glance-heart').hidden, avg: document.getElementById('heart-rate-average').dataset.value, latest: document.getElementById('heart-rate-latest').dataset.value, btn: document.getElementById('health-connect').textContent, writes: window.__healthCalls.filter(c => c[0] === 'saveSample').length }`);
  check('권한 요청은 읽기(심박수·걸음 수)만, 쓰기·체중 없음', JSON.stringify(st.auth) === JSON.stringify({ read: ['heartRate', 'steps'], write: [] }) && st.writes === 0, JSON.stringify(st.auth));
  check('홈에 오늘 평균 72 / 최근 80 bpm 표시', !st.home && st.avg === '72' && st.latest === '80', JSON.stringify(st));
  st = await evaluate(`return { steps: document.getElementById('health-steps-value').dataset.value, perm: document.getElementById('health-steps-permission').hidden, inCard: !!document.querySelector('.player-card #health-glance #glance-steps:not([hidden])'), link: document.getElementById('health-glance-connect').hidden }`);
  check('오늘 걸음 3,456이 캐릭터 카드 안(원래 vital 자리)에 표시, 링크·권한 추가 버튼 숨김', st.steps === '3,456' && st.perm && st.inCard && st.link, JSON.stringify(st));

  // 날짜 이동: 어제 → 어제 값, 8일 전 → 최근 7일 안내
  await evaluate(`await changeDate(-1); await new Promise(r => setTimeout(r, 300)); return true;`);
  st = await evaluate(`return { avg: document.getElementById('heart-rate-average').dataset.value, latest: document.getElementById('heart-rate-latest').dataset.value, time: document.getElementById('glance-heart').title, steps: document.getElementById('health-steps-value').dataset.value }`);
  check('어제 선택: 평균 80(HealthKit 일 평균) / 최근 90(21:30) / 걸음 8,000', st.avg === '80' && st.latest === '90' && st.time.includes('21:30') && st.steps === '8,000', JSON.stringify(st));
  await evaluate(`for (let i = 0; i < 7; i++) await changeDate(-1); await new Promise(r => setTimeout(r, 300)); return true;`);
  st = await evaluate(`return { avg: document.getElementById('heart-rate-average').dataset.value, note: document.getElementById('glance-heart').title }`);
  check('8일 전: 값 없음 + "최근 7일" 안내', st.avg === '--' && st.note.includes('최근 7일'), JSON.stringify(st));
  await evaluate(`await goToToday(); await new Promise(r => setTimeout(r, 300)); return true;`);

  // 예전에 심박수만 연결한 사용자 → '걸음 수 권한 추가' → 재요청
  await evaluate(`localStorage.setItem('rebuilders-health-connected', '1'); window.__healthCalls.length = 0; renderHealthSettings(); await refreshHeartRate({ force: true }); return true;`);
  st = await evaluate(`return { perm: document.getElementById('health-steps-permission').hidden, stepsShown: !document.getElementById('glance-steps').hidden, stepQueries: window.__healthCalls.filter(c => c[1]?.dataType === 'steps').length }`);
  check('심박수만 연결한 사용자: 설정에 "걸음 수 권한 추가" 보임, 걸음 조회 안 함', !st.perm && !st.stepsShown && st.stepQueries === 0, JSON.stringify(st));
  await evaluate(`document.getElementById('health-steps-permission').click(); await new Promise(r => setTimeout(r, 300)); return true;`);
  st = await evaluate(`const auth = window.__healthCalls.find(c => c[0] === 'requestAuthorization'); return { auth: auth && auth[1], perm: document.getElementById('health-steps-permission').hidden, steps: document.getElementById('health-steps-value').dataset.value, level: localStorage.getItem('rebuilders-health-connected') }`);
  check('권한 추가 누르면 읽기 재요청 후 걸음 표시', JSON.stringify(st.auth) === JSON.stringify({ read: ['heartRate', 'steps'], write: [] }) && st.perm && st.steps === '3,456' && st.level === '2', JSON.stringify(st));
  const btnText = await evaluate(`return document.getElementById('health-connect').textContent`);
  check('설정 버튼이 "연결 끊기"로 바뀜', btnText === '연결 끊기', btnText);

  // 4) 심박수는 저장소·백업에 없음
  const leak = await evaluate(`const all = await storageRepository.getAll(); const text = JSON.stringify(NiliriBackup.buildBackup(all)) + JSON.stringify(all); return { heart: /heartRate|bpm|steps|3456|8000|79\\.6/.test(text), keys: Object.keys(all) }`);
  check('심박수·걸음 수가 기기 저장소·백업 JSON에 없음', !leak.heart, JSON.stringify(leak));

  // 5) 새로고침 후에도 연결 유지, 연결 끊기 → 홈 카드 숨김
  await load();
  st = await evaluate(`await new Promise(r => setTimeout(r, 300)); return document.getElementById('glance-heart').hidden`);
  check('다시 열어도 연결 유지(캐릭터 옆 심박수 보임)', st === false);
  await evaluate(`document.getElementById('health-connect').click(); await new Promise(r => setTimeout(r, 200)); return true;`);
  st = await evaluate(`return { home: document.getElementById('glance-heart').hidden, hint: document.getElementById('health-hint').textContent }`);
  check('연결 끊기 → 캐릭터 옆 값 숨김, 설정 앱에서 권한 끄는 방법 안내', st.home && st.hint.includes('설정 > 건강'), JSON.stringify(st));
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
