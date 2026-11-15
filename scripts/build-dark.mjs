// style.css 의 고정 색을 읽어 다크 모드용 덮어쓰기(theme-dark.css)를 만든다.
// 규칙: html.theme-dark 아래에서만 적용. 무채색은 밝기 반전(흰 카드 → #1c1c1f, 검은 글자 → 밝은 글자),
// 파스텔 배경은 어두운 색조, 진한 색 글자는 밝게, 그림자는 검정 유지, 화면 가림막(backdrop·overlay)은 어둡게 유지.
// 실행: node scripts/build-dark.mjs  (style.css 를 고치면 다시 실행)
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const COLOR_PROPS = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left)(-color)?|border-color|outline|outline-color|box-shadow|fill|stroke|caret-color|text-decoration-color|-webkit-text-fill-color|text-shadow|--[\w-]+)$/i;
const COLOR_RE = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\([^)]*\)|\b(?:white|black)\b/gi;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function parse(c) {
  c = c.toLowerCase();
  if (c === 'white') return [255, 255, 255, 1];
  if (c === 'black') return [0, 0, 0, 1];
  if (c[0] === '#') {
    let h = c.slice(1);
    if (h.length <= 4) h = [...h].map(x => x + x).join('');
    const n = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    return [...n, h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const p = c.replace(/rgba?\(|\)/g, '').split(/[\s,/]+/).filter(Boolean).map(Number);
  if (p.length < 3 || p.some(x => !Number.isFinite(x))) return null;
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function fromHsl([h, s, l]) {
  if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255));
}
const fmt = ([r, g, b], a) => (a >= 1 ? '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') : `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`);
function mapColor(c, { prop, sel }) {
  const rgba = parse(c);
  if (!rgba) return c;
  const a = rgba[3];
  const [h, s, l] = toHsl(rgba);
  const shadow = /shadow/i.test(prop);
  const scrim = /backdrop|overlay|scrim|dim\b|sheet-back/i.test(sel) && /background/i.test(prop);
  if (shadow) return fmt([0, 0, 0], clamp(a * 1.8, 0, 0.7));
  if (scrim && a < 1) return fmt([0, 0, 0], clamp(a * 1.5, 0.3, 0.7)); // 화면 가림막은 어둡게
  if (s < 0.18 || l > 0.97 || l < 0.03) {
    if (scrim && l < 0.5) return fmt([0, 0, 0], clamp(a * 1.6, 0, 0.75));
    if (a < 1 && l < 0.5) return fmt([255, 255, 255], a);          // 옅은 검정 선·바탕 → 옅은 흰색
    if (a < 1 && l >= 0.5) return fmt([28, 28, 31], a);            // 반투명 흰 바탕 → 반투명 어두운 바탕
    const nl = 0.11 + (1 - l) * 0.85;
    return fmt(fromHsl([h, s * 0.5, nl]), a);
  }
  if (l > 0.85) return fmt(fromHsl([h, s * 0.55, 0.2]), a);        // 파스텔 바탕 → 어두운 색조
  if (l < 0.38) return fmt(fromHsl([h, Math.min(s, 0.8), 0.72]), a); // 진한 색 글자 → 밝게
  return fmt(fromHsl([h, s, Math.max(l, 0.58)]), a);
}
// 아주 단순한 CSS 분해(중괄호 짝 맞춤)
function walk(text, wrap, out) {
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open < 0) break;
    const head = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
    const body = text.slice(open + 1, j - 1);
    if (head.startsWith('@media') || head.startsWith('@supports')) walk(body, [...wrap, head], out);
    else if (head.startsWith('@')) { /* keyframes·font-face 건너뜀 */ }
    else {
      const decls = [];
      body.split(';').forEach(d => {
        const k = d.indexOf(':'); if (k < 0) return;
        const prop = d.slice(0, k).trim(); let value = d.slice(k + 1).trim();
        if (!COLOR_PROPS.test(prop) || !COLOR_RE.test(value)) return;
        COLOR_RE.lastIndex = 0;
        const imp = /!important/i.test(value);
        value = value.replace(/!important/i, '').trim();
        if (/var\(/.test(value) && !/#|rgb/i.test(value)) return;
        const mapped = value.replace(COLOR_RE, c => mapColor(c, { prop, sel: head }));
        if (mapped !== value) decls.push(`${prop}: ${mapped}${imp ? ' !important' : ''}`);
      });
      if (decls.length) {
        const sel = head.split(',').map(x => x.trim()).filter(Boolean).map(x => {
          if (/^:root\b/.test(x)) return x.replace(/^:root/, 'html.theme-dark');
          if (/^html\b/.test(x)) return x.replace(/^html/, 'html.theme-dark');
          return `html.theme-dark ${x}`;
        }).join(',\n');
        out.push({ wrap, css: `${sel} { ${decls.join('; ')}; }` });
      }
    }
    i = j;
  }
}
const out = [];
walk(src, [], out);
let css = '/* 자동 생성: node scripts/build-dark.mjs — 직접 고치지 말고 theme-dark-extra 부분(아래)이나 style.css 를 고친 뒤 다시 실행 */\n';
out.forEach(r => { css += r.wrap.reduceRight((acc, w) => `${w} { ${acc} }`, r.css) + '\n'; });
const extra = fs.readFileSync(new URL('./theme-dark-extra.css', import.meta.url), 'utf8');
css += '\n/* ---- 손으로 맞춘 다크 값(scripts/theme-dark-extra.css) ---- */\n' + extra;
fs.writeFileSync(new URL('../theme-dark.css', import.meta.url), css);
console.log(`theme-dark.css: ${out.length} rules, ${css.length} bytes`);
