/* 화면 키보드가 열려 있는 동안 body 에 keyboard-open 클래스를 붙입니다.
 * (style.css 에서 이 클래스로 하단 탭바를 숨겨, 탭바가 키보드 위로 따라 올라오지 않게 합니다.)
 * 앱(Capacitor): @capacitor/keyboard 의 keyboardWillShow/keyboardWillHide 사용.
 * 웹/PWA: visualViewport 높이 변화 + 입력칸 포커스로 감지(폴백). */
(function initRebuildersKeyboard(global) {
  'use strict';

  const CLASS = 'keyboard-open';
  const doc = global.document;
  if (!doc) return;

  function setOpen(open) {
    if (!doc.body) return;
    doc.body.classList.toggle(CLASS, Boolean(open));
  }

  /* 앱: 키보드 높이만큼 화면(.phone-frame)을 키보드와 같은 시간·곡선으로 줄임(style.css 의 --kb-h).
     resize:'none' 이라 iOS 가 웹뷰를 늦게 줄이지 않음 → 입력창이 키보드에 딱 붙어 같이 올라감 */
  function setKeyboardHeight(height) {
    const h = Math.max(0, Math.round(Number(height) || 0));
    doc.documentElement.style.setProperty('--kb-h', `${h}px`);
    doc.documentElement.classList.toggle('kb-native', true);
  }
  /* 아래 입력창(식단 채팅·식도감 검색)에 커서가 가면 iOS(WebKit)가 화면 전체를 위로 밀어 올림
     → 화면·바깥 틀·잘림 상자의 스크롤을 늘 0으로 되돌려 위쪽(탭·내용)은 제자리, 입력창만 키보드 위로 */
  const inDock = el => Boolean(el?.closest?.('.home-ai-dock'));
  function resetPan() {
    const frame = doc.querySelector('.phone-frame');
    const list = [doc.scrollingElement, doc.documentElement, doc.body, frame];
    const active = doc.activeElement;
    if (inDock(active)) {
      for (let a = active.parentElement; a && a !== doc.body; a = a.parentElement) {
        const s = global.getComputedStyle(a);
        if (s.overflowY === 'hidden' || s.overflowY === 'clip' || s.overflowX === 'hidden') list.push(a);
      }
    }
    for (const el of list) if (el && (el.scrollTop || el.scrollLeft)) { el.scrollTop = 0; el.scrollLeft = 0; }
    if (global.scrollY || global.scrollX) global.scrollTo(0, 0);
  }
  let panTimer = 0;
  function holdPan() { // 포커스 직후 몇 프레임 동안(WebKit 이 늦게 미는 것까지) 되돌림
    resetPan();
    let n = 0; const step = () => { resetPan(); if (++n < 4) global.requestAnimationFrame?.(step); };
    global.requestAnimationFrame?.(step);
    clearTimeout(panTimer); [60, 160, 320].forEach(ms => { panTimer = setTimeout(resetPan, ms); });
  }
  doc.addEventListener('focusin', event => { if (inDock(event.target)) holdPan(); });
  global.addEventListener('scroll', () => { if (inDock(doc.activeElement) || doc.body?.classList.contains(CLASS)) resetPan(); }, { passive: true });
  global.visualViewport?.addEventListener('scroll', () => { if (inDock(doc.activeElement)) resetPan(); });
  doc.addEventListener('scroll', event => { const t = event.target; if (t && (t === doc || t === doc.body || t.classList?.contains('phone-frame')) && (inDock(doc.activeElement) || doc.body?.classList.contains(CLASS))) resetPan(); }, { capture: true, passive: true });

  function revealFocused() {
    const el = doc.activeElement;
    if (!el || el === doc.body || inDock(el)) { resetPan(); return; }
    try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch { /* ignore */ }
  }

  function plugin() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.()) return null;
    // 번들러 없이 쓰므로 네이티브에 등록된 플러그인을 이름으로 연결합니다.
    return cap.Plugins?.Keyboard || cap.registerPlugin?.('Keyboard') || null;
  }

  function initNative(keyboard) {
    try {
      // iOS 는 웹뷰 스크롤을 직접 움직이지 않게(화면 크기를 우리가 줄이므로 이중으로 밀리지 않음)
      try { keyboard.setScroll?.({ isDisabled: true })?.catch?.(() => {}); } catch { /* ignore */ }
      keyboard.addListener('keyboardWillShow', info => { setKeyboardHeight(info?.keyboardHeight); setOpen(true); resetPan(); });
      keyboard.addListener('keyboardDidShow', info => { if (info?.keyboardHeight) setKeyboardHeight(info.keyboardHeight); setOpen(true); revealFocused(); });
      keyboard.addListener('keyboardWillHide', () => { setKeyboardHeight(0); setOpen(false); });
      keyboard.addListener('keyboardDidHide', () => { setKeyboardHeight(0); setOpen(false); });
      return true;
    } catch (error) {
      console.warn('[keyboard] 네이티브 키보드 리스너 등록 실패', error);
      return false;
    }
  }

  function isEditable(el) {
    if (!el || el === doc.body) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    const type = String(el.type || 'text').toLowerCase();
    return !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file', 'image', 'hidden'].includes(type);
  }

  function initWebFallback() {
    const vv = global.visualViewport;
    if (!vv) return;
    const THRESHOLD = 150; // 이 이상 줄어들면 키보드가 열린 것으로 봅니다.
    let baseline = Math.max(vv.height, global.innerHeight || 0);
    function update() {
      const active = isEditable(doc.activeElement);
      if (!active) baseline = Math.max(baseline, vv.height);
      setOpen(active && baseline - vv.height > THRESHOLD);
    }
    vv.addEventListener('resize', update);
    global.addEventListener('orientationchange', () => { baseline = 0; setTimeout(() => { baseline = Math.max(vv.height, global.innerHeight || 0); update(); }, 300); });
    doc.addEventListener('focusin', () => setTimeout(update, 50));
    doc.addEventListener('focusout', () => setTimeout(update, 50));
  }

  // 시험·진단용: 키보드 높이를 흉내 냄(헤드리스 검사에서 씀)
  global.RebuildersKeyboard = {
    resetPan,
    simulate(height) { setKeyboardHeight(height); setOpen(height > 0); resetPan(); },
  };

  const keyboard = plugin();
  if (!(keyboard && initNative(keyboard))) initWebFallback();
})(globalThis);
