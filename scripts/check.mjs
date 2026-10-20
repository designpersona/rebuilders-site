// 간단 점검: JS 문법 + 외부 전송 코드/추적 코드 0건 확인.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = ['app.js', 'app-config.js', 'storage.js', 'backup.js', 'notifications.js', 'keyboard.js', 'food-catalog.js', 'demo-seed.js', 'quick-entry.js', 'health.js', 'log-link.js', 'bridge.js', 'sw.js'];
let failed = false;
for (const file of js) {
  try { execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' }); console.log('문법 OK', file); }
  catch (error) { failed = true; console.error('문법 오류', file, String(error.stderr || error)); }
}
const web = ['index.html', 'privacy.html', 'log.html', ...js];
const pattern = /clarity|googletagmanager|google-analytics|\bgtag\(|sendBeacon|XMLHttpRequest|\bfetch\(|WebSocket\(/i;
for (const file of web) {
  const text = readFileSync(join(root, file), 'utf8');
  // sw.js 의 fetch 는 서비스 워커 이벤트 처리(동일 출처 정적 파일)이므로 제외
  if (file === 'sw.js') continue;
  // bridge.js 는 사용자가 설정한 맥 미니(집 와이파이) 주소로만 fetch — 추적 도구만 검사
  if (file === 'bridge.js') { if (/clarity|googletagmanager|google-analytics|\bgtag\(|sendBeacon|XMLHttpRequest|WebSocket\(/i.test(text)) { failed = true; console.error('추적 의심 코드:', file); } continue; }
  if (pattern.test(text)) { failed = true; console.error('외부 전송/추적 의심 코드:', file); }
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
const external = [...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/g)].map(m => m[1]);
console.log('index.html 외부 URL 참조:', external.length ? external : '없음');
if (external.length) failed = true;
process.exit(failed ? 1 : 0);
