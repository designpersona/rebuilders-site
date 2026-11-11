// 백업 내보내기→가져오기 왕복: 버튼으로 파일 만들기, 미리보기·확인 전에 기록 유지, 잘못된 파일 거부, 네이티브 공유 경로.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 → node scripts/e2e-backup.mjs [url]
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9388, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-backup-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=430,900', ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const errors = [];
const dialogs = []; const dialogWaiters = [];
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
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready') && typeof NiliriBackup !== 'undefined'`)) return; } catch {} }
  throw new Error('app not ready');
}
function waitDialog(ms = 4000) {
  return new Promise((res, rej) => {
    if (dialogs.length) return res(dialogs.shift());
    const t = setTimeout(() => rej(new Error('confirm dialog timeout')), ms);
    dialogWaiters.push(info => { clearTimeout(t); res(info); });
  });
}
async function confirmImport(accept) {
  if (accept) await evaluate(`window.__rbBackupPage = 1; return 1;`);
  const clickP = evaluate(`document.getElementById('confirm-import').click(); return true;`);
  const dialog = await waitDialog();
  await send('Page.handleJavaScriptDialog', { accept });
  await clickP;
  if (!accept) {
    await sleep(200);
    const result = await evaluate(`
      const preview = document.getElementById('import-preview');
      return { previewHidden: preview?.hidden === true, all: await storageRepository.getAll() };
    `);
    return { dialog, result };
  }
  // 가져오기 성공 시 700ms 뒤 새로고침됩니다. 새로고침 전의 app-ready만 보면 너무 이릅니다.
  for (let i = 0; i < 50; i++) {
    await sleep(150);
    try {
      if (await evaluate(`return !window.__rbBackupPage && document.body?.classList.contains('app-ready') && typeof NiliriBackup !== 'undefined'`)) break;
    } catch {}
  }
  const result = await evaluate(`
    const preview = document.getElementById('import-preview');
    return { previewHidden: preview?.hidden === true, all: await storageRepository.getAll() };
  `);
  return { dialog, result };
}
async function pickFile(name, contents, type = 'application/json') {
  return evaluate(`
    const text = ${JSON.stringify(contents)};
    const file = new File([text], ${JSON.stringify(name)}, { type: ${JSON.stringify(type)} });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.getElementById('import-file');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));
    const preview = document.getElementById('import-preview');
    return {
      hidden: preview?.hidden === true,
      title: document.getElementById('import-preview-title')?.textContent || '',
      meta: document.getElementById('import-preview-meta')?.textContent || '',
      issues: [...document.querySelectorAll('#import-preview-issues li')].map(li => li.textContent),
      confirmHidden: document.getElementById('confirm-import')?.hidden === true,
      all: await storageRepository.getAll(),
    };
  `);
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }

const SEED = `{
  '2026-11-10': { breakfast: [{ name: '밥', cal: 300, carbs: 70, protein: 6, fat: 1 }], lunch: [], snack: [], dinner: [] },
  settings: { weight: 60, locale: 'ko' },
  customFoods: { '집밥': { cal: 400 } },
  recentFoods: [{ name: '밥', cal: 300 }],
  shopping: { items: [{ id: 's1', name: '우유', group: 'priority' }], stock: [] },
}`;

try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Page.javascriptDialogOpening') {
      const info = m.params;
      if (dialogWaiters.length) dialogWaiters.shift()(info);
      else dialogs.push(info);
    }
  });
  await send('Runtime.enable'); await send('Page.enable');
  await load(URL);

  await evaluate(`await storageRepository.replaceAll(${SEED}); return 1;`);
  await load();

  const exported = await evaluate(`
    let captured = null;
    const orig = URL.createObjectURL;
    URL.createObjectURL = function (blob) { captured = blob; return orig.call(this, blob); };
    document.getElementById('export-backup').click();
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 50));
      if (captured) break;
    }
    URL.createObjectURL = orig;
    return captured ? { text: await captured.text(), name: captured.name || '', type: captured.type || '' } : null;
  `);
  check('내보내기 버튼이 JSON 백업 파일을 만듦', Boolean(exported?.text) && exported.name.startsWith('rebuilders-backup-v1-') && exported.name.endsWith('.json'), exported?.name || 'no file');
  const parsed = exported?.text ? JSON.parse(exported.text) : {};
  check('내보낸 파일이 리빌더스 백업 형식', parsed.format === 'rebuilders-backup' && parsed.app === 'rebuilders-food-tracker' && parsed.data?.['2026-11-10']?.breakfast?.[0]?.name === '밥' && parsed.data?.customFoods?.['집밥']?.cal === 400);

  await evaluate(`await storageRepository.replaceAll({}); return 1;`);
  await load();
  const empty = await evaluate(`const all = await storageRepository.getAll(); return { days: Object.keys(all).filter(k => /^\\d{4}-\\d{2}-\\d{2}$/.test(k)).length, customs: Object.keys(all.customFoods || {}).length, shopping: (all.shopping?.items || []).length };`);
  check('비운 뒤 기록이 없음', empty.days === 0 && empty.customs === 0 && empty.shopping === 0, JSON.stringify(empty));

  const bad = await pickFile('not-a-backup.json', '{ "hello": 1 }');
  check('잘못된 파일은 미리보기에서 거절하고 가져오기 버튼 숨김', bad.hidden === false && bad.confirmHidden === true && /가져올 수 없는/.test(bad.title) && /바뀌지 않았/.test(bad.meta), bad.title + ' / ' + bad.issues.join(';'));
  check('잘못된 파일을 골라도 현재 기록은 그대로', Object.keys(bad.all).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).length === 0);

  const preview = await pickFile(exported.name, exported.text);
  check('올바른 파일은 미리보기를 보여주고 가져오기 전에 기록을 바꾸지 않음', preview.hidden === false && preview.confirmHidden === false && /확인했어요/.test(preview.title) && /1일/.test(preview.meta) && /집밥|내 음식 1/.test(preview.meta) && Object.keys(preview.all).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).length === 0, preview.title + ' / ' + preview.meta);

  const cancelled = await confirmImport(false);
  check('확인 창에서 취소를 누르면 기록을 가져오지 않음', /교체|지워지고|바뀔/.test(cancelled.dialog?.message || '') && Object.keys(cancelled.result.all).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).length === 0, cancelled.dialog?.message?.slice(0, 80));

  // 확인 버튼은 취소 뒤 400ms 동안 다시 눌리지 않게 잠겨 있어요.
  await sleep(500);
  const accepted = await confirmImport(true);
  check('확인 후 가져오기를 누르면 미리보기가 닫힘', accepted.result.previewHidden === true, JSON.stringify({ hidden: accepted.result.previewHidden }));
  const restored = await evaluate(`
    const all = await storageRepository.getAll();
    return {
      rice: all['2026-11-10']?.breakfast?.[0]?.name,
      cal: all['2026-11-10']?.breakfast?.[0]?.cal,
      custom: all.customFoods?.['집밥']?.cal,
      weight: all.settings?.weight,
      milk: (all.shopping?.items || []).map(i => i.name).join(),
    };
  `);
  check('교체로 가져오면 내보낸 식단·내 음식·설정·장보기가 그대로 복원됨', restored.rice === '밥' && restored.cal === 300 && restored.custom === 400 && restored.weight === 60 && restored.milk === '우유', JSON.stringify(restored));

  // 합치기: 새 날을 남기고 백업의 같은 날짜만 덮음
  await evaluate(`
    const all = await storageRepository.getAll();
    all['2026-11-11'] = { breakfast: [{ name: '사과', cal: 52 }], lunch: [], snack: [], dinner: [] };
    all['2026-11-10'] = { breakfast: [{ name: '변경됨', cal: 1 }], lunch: [], snack: [], dinner: [] };
    await storageRepository.replaceAll(all);
    return 1;
  `);
  const documentMode = await evaluate(`document.getElementById('import-mode').value = 'merge'; return document.getElementById('import-mode').value;`);
  check('가져오는 방법을 합치기로 바꿈', documentMode === 'merge');
  await pickFile(exported.name, exported.text);
  const merged = await confirmImport(true);
  check('합치기 확인 문구가 나옴', /합쳐/.test(merged.dialog?.message || ''), merged.dialog?.message?.slice(0, 80));
  const afterMerge = await evaluate(`
    const all = await storageRepository.getAll();
    return {
      day10: all['2026-11-10']?.breakfast?.[0]?.name,
      day11: all['2026-11-11']?.breakfast?.[0]?.name,
    };
  `);
  check('합치면 같은 날짜는 백업 우선, 다른 날짜는 유지', afterMerge.day10 === '밥' && afterMerge.day11 === '사과', JSON.stringify(afterMerge));

  // 네이티브 공유 경로: 플러그인으로 임시 파일을 쓰고 공유하며, 실패 시 다운로드로 넘어가지 않음
  const nativeOk = await evaluate(`
    const calls = { write: null, share: null, download: 0 };
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = function (blob) { calls.download += 1; return origCreate.call(this, blob); };
    globalThis.Capacitor = {
      isNativePlatform: () => true,
      registerPlugin: name => {
        if (name === 'Filesystem') return {
          writeFile: async opts => { calls.write = opts; return { uri: 'file:///cache/' + opts.path }; },
          getUri: async opts => ({ uri: 'file:///cache/' + opts.path }),
        };
        if (name === 'Share') return { share: async opts => { calls.share = opts; return {}; } };
        return null;
      },
    };
    const state = await storageRepository.getAll();
    const result = await NiliriBackup.exportBackup(state, { now: new Date('2026-11-11T00:00:00') });
    URL.createObjectURL = origCreate;
    delete globalThis.Capacitor;
    return { result, calls };
  `);
  check('네이티브에서는 CACHE에 쓴 뒤 file:// 을 files로 공유함', nativeOk.result?.method === 'native-share' && nativeOk.calls.write?.directory === 'CACHE' && nativeOk.calls.write?.encoding === 'utf8' && nativeOk.calls.share?.files?.[0] === 'file:///cache/rebuilders-backup-v1-2026-11-11.json' && !nativeOk.calls.share?.url && nativeOk.calls.download === 0, JSON.stringify({ method: nativeOk.result?.method, dir: nativeOk.calls.write?.directory, files: nativeOk.calls.share?.files, url: nativeOk.calls.share?.url, download: nativeOk.calls.download }));

  const nativeCancel = await evaluate(`
    globalThis.Capacitor = {
      isNativePlatform: () => true,
      registerPlugin: name => {
        if (name === 'Filesystem') return { writeFile: async opts => ({ uri: 'file:///cache/' + opts.path }) };
        if (name === 'Share') return { share: async () => { throw new Error('Share canceled'); } };
        return null;
      },
    };
    const result = await NiliriBackup.exportBackup(await storageRepository.getAll());
    delete globalThis.Capacitor;
    return result;
  `);
  check('네이티브 공유를 취소하면 cancelled를 돌려줌', nativeCancel?.method === 'cancelled', JSON.stringify(nativeCancel));

  const nativeFail = await evaluate(`
    let downloaded = 0;
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = function (blob) { downloaded += 1; return origCreate.call(this, blob); };
    globalThis.Capacitor = {
      isNativePlatform: () => true,
      registerPlugin: name => {
        if (name === 'Filesystem') return { writeFile: async opts => ({ uri: 'file:///cache/' + opts.path }) };
        if (name === 'Share') return { share: async () => { throw new Error('boom'); } };
        return null;
      },
    };
    let error = null;
    try { await NiliriBackup.exportBackup(await storageRepository.getAll()); }
    catch (e) { error = String(e?.message || e); }
    URL.createObjectURL = origCreate;
    delete globalThis.Capacitor;
    return { error, downloaded };
  `);
  check('네이티브 공유 실패 시 다운로드 폴백을 쓰지 않음', /boom/.test(nativeFail.error || '') && nativeFail.downloaded === 0, JSON.stringify(nativeFail));

  const noPlugin = await evaluate(`
    let downloaded = 0;
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = function (blob) { downloaded += 1; return origCreate.call(this, blob); };
    globalThis.Capacitor = { isNativePlatform: () => true, registerPlugin: () => null };
    let error = null;
    try { await NiliriBackup.exportBackup(await storageRepository.getAll()); }
    catch (e) { error = String(e?.message || e); }
    URL.createObjectURL = origCreate;
    delete globalThis.Capacitor;
    return { error, downloaded };
  `);
  check('네이티브인데 플러그인이 없으면 다운로드로 넘어가지 않음', Boolean(noPlugin.error) && noPlugin.downloaded === 0, JSON.stringify(noPlugin));

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
