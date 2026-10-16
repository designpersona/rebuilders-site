/*
 * 빌드 대상 설정. 이 파일은 `npm run build`가 www/app-config.js 로 복사할 때
 * 앱(Capacitor) 값으로 덮어씁니다. (scripts/build-www.mjs 참고)
 *
 * buildTarget   : 'web' = rebuilders.co.kr 정적 사이트, 'app' = Capacitor 앱 번들
 * allowLocalMode: true 일 때만 http://localhost 에서 로컬 서버(LocalApiStorage)를 시도합니다.
 *                 앱 번들은 항상 false 이므로 의도치 않게 켜질 수 없습니다.
 */
(function (global) {
  'use strict';
  global.REBUILDERS_CONFIG = Object.freeze({
    buildTarget: 'web',
    allowLocalMode: true,
  });
})(globalThis);
