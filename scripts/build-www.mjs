// 앱(Capacitor) 번들 생성: 허용 목록에 있는 파일만 www/ 로 복사합니다.
// (.git, CNAME, .nojekyll, robots.txt, sw.js, README, node_modules, ios 등은 포함되지 않습니다.)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');

const FILES = [
  'index.html', 'privacy.html', 'style.css', 'app.js', 'storage.js', 'backup.js',
  'notifications.js', 'keyboard.js', 'food-catalog.js', 'demo-seed.js', 'quick-entry.js', 'health.js', 'log-link.js', 'manifest.webmanifest',
];
const DIRS = ['assets'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of FILES) {
  const from = join(root, file);
  if (!existsSync(from)) throw new Error(`빌드에 필요한 파일이 없어요: ${file}`);
  cpSync(from, join(out, file));
}
for (const dir of DIRS) {
  cpSync(join(root, dir), join(out, dir), {
    recursive: true,
    filter: src => !/(^|[\\/])\.DS_Store$/.test(src),
  });
}

// 번들러가 없으므로 Capacitor 런타임(core)의 브라우저용 빌드(IIFE)를 vendor/ 로 복사하고
// 앱 번들의 index.html 에만 <script> 로 끼워 넣습니다. (웹 사이트 index.html 에는 영향 없음)
// 플러그인(LocalNotifications/Filesystem/Share)은 네이티브 코드만 쓰고, JS 쪽은
// Capacitor.registerPlugin('이름') 으로 연결합니다(notifications.js, backup.js).
const VENDOR = ['@capacitor/core/dist/capacitor.js'];
mkdirSync(join(out, 'vendor'), { recursive: true });
const tags = [];
VENDOR.forEach((spec, index) => {
  const from = join(root, 'node_modules', spec);
  if (!existsSync(from)) throw new Error(`npm install 이 필요해요: ${spec}`);
  const name = `${String(index).padStart(2, '0')}-${spec.split('/')[1]}.js`;
  const text = readFileSync(from, 'utf8').replace(/\n?\/\/# sourceMappingURL=.*$/m, '');
  writeFileSync(join(out, 'vendor', name), text);
  tags.push(`  <script src="vendor/${name}"></script>`);
});
const indexPath = join(out, 'index.html');
const marker = '  <script src="app-config.js';
const html = readFileSync(indexPath, 'utf8');
if (!html.includes(marker)) throw new Error('index.html 에서 app-config.js 스크립트를 찾지 못했어요.');
writeFileSync(indexPath, html.replace(marker, `${tags.join('\n')}\n${marker}`));

// 앱 번들은 로컬 서버 모드를 허용하지 않습니다(LOCAL_MODE 항상 꺼짐).
writeFileSync(join(out, 'app-config.js'), `/* 자동 생성: scripts/build-www.mjs (앱 번들) */
(function (global) {
  'use strict';
  global.REBUILDERS_CONFIG = Object.freeze({ buildTarget: 'app', allowLocalMode: false });
})(globalThis);
`);

// 앱 번들에 외부로 나가는 코드가 없는지 확인합니다.
const bad = [];
function scan(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { scan(path); continue; }
    if (!/\.(html|js|css|webmanifest)$/.test(name) || path.includes(`${join(out, 'vendor')}`)) continue;
    const text = readFileSync(path, 'utf8');
    if (/clarity\.ms|googletagmanager|google-analytics|\bgtag\(|sendBeacon|XMLHttpRequest|\bfetch\(/.test(text)) {
      bad.push(path);
    }
  }
}
scan(out);
if (bad.length) {
  console.error('외부 전송 의심 코드가 있어 빌드를 중단해요:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('www/ 생성 완료');
