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

  function plugin() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.()) return null;
    // 번들러 없이 쓰므로 네이티브에 등록된 플러그인을 이름으로 연결합니다.
    return cap.Plugins?.Keyboard || cap.registerPlugin?.('Keyboard') || null;
  }

  function initNative(keyboard) {
    try {
      keyboard.addListener('keyboardWillShow', () => setOpen(true));
      keyboard.addListener('keyboardDidShow', () => setOpen(true));
      keyboard.addListener('keyboardWillHide', () => setOpen(false));
      keyboard.addListener('keyboardDidHide', () => setOpen(false));
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

  const keyboard = plugin();
  if (!(keyboard && initNative(keyboard))) initWebFallback();
})(globalThis);
