/* 화면 모드: 라이트 / 다크 / 시스템(기본, 기기 설정을 바로 따라감).
   첫 그림 전에 <head>에서 실행돼 잘못된 색이 번쩍이지 않음. 선택은 이 기기(localStorage)에만 저장. */
(function (global) {
  'use strict';
  const KEY = 'rebuilders-theme';
  const MODES = ['light', 'dark', 'system'];
  const mq = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;
  function getMode() {
    try { const m = global.localStorage.getItem(KEY); return MODES.includes(m) ? m : 'system'; } catch { return 'system'; }
  }
  function isDark(mode = getMode()) { return mode === 'dark' || (mode === 'system' && Boolean(mq && mq.matches)); }
  function apply({ animate = false } = {}) {
    const root = global.document.documentElement;
    const dark = isDark();
    const changed = root.classList.contains('theme-dark') !== dark;
    if (animate && changed && !(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      root.classList.add('theme-switching');
      clearTimeout(apply._t);
      apply._t = setTimeout(() => root.classList.remove('theme-switching'), 360);
    }
    root.classList.toggle('theme-dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.dataset.themeMode = getMode();
    const color = dark ? '#000000' : '#ffffff';
    global.document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
    const sb = global.document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (sb) sb.setAttribute('content', dark ? 'black' : 'default');
    if (changed) { try { global.dispatchEvent(new CustomEvent('rebuilders-theme', { detail: { dark, mode: getMode() } })); } catch {} }
    return dark;
  }
  function setMode(mode) {
    if (!MODES.includes(mode)) return getMode();
    try { if (mode === 'system') global.localStorage.removeItem(KEY); else global.localStorage.setItem(KEY, mode); } catch {}
    apply({ animate: true });
    return mode;
  }
  if (mq) {
    const onChange = () => { if (getMode() === 'system') apply({ animate: true }); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  apply();
  global.RebuildersTheme = { getMode, setMode, isDark, apply, KEY };
})(typeof window !== 'undefined' ? window : globalThis);
