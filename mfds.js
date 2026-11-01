/* 식약처 식품영양성분 DB(앱 안에 내장, data/mfds.json) — 폰 안에서만 검색
   - 앱 시작 때가 아니라 첫 검색 때 한 번만 읽고(같은 앱 번들 파일), 이름 색인을 만듦
   - 검색할 때 바깥으로 나가는 요청 없음 */
(function initMfds(global) {
  'use strict';
  const URL = 'data/mfds.json';
  const KIND = ['음식', '가공식품', '원재료'];
  const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  const state = { ready: false, loading: null, rows: [], makers: [], hay: [], date: '', loadMs: 0, parseMs: 0, lastMs: 0, error: '' };
  function load() {
    if (state.ready) return Promise.resolve(true);
    if (state.loading) return state.loading;
    state.loading = (async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const t1 = performance.now();
        state.rows = data.rows || []; state.makers = data.makers || []; state.date = data.date || '';
        state.hay = state.rows.map(r => norm(r[0]) + '\u0001' + norm(state.makers[r[1]] || ''));
        state.loadMs = Math.round(t1 - t0); state.parseMs = Math.round(performance.now() - t1);
        state.ready = true;
        return true;
      } catch (error) {
        state.error = String(error?.message || error);
        return false;
      } finally { state.loading = null; }
    })();
    return state.loading;
  }
  const r1 = v => Math.round((Number(v) || 0) * 10) / 10;
  // 한 줄 → 앱 음식 데이터(기본 양: 1회 중량, 없으면 100). 양을 바꾸면 기존 g 비례 계산 그대로
  function toFood(row) {
    const [name, mi, kind, unitFlag, w, kcal, carbs, protein, fat] = row;
    const unit = unitFlag ? 'ml' : 'g';
    const amount = w > 0 ? w : 100;
    const f = amount / 100;
    return {
      name, cal: Math.round(kcal * f), carbs: r1(carbs * f), protein: r1(protein * f), fat: r1(fat * f),
      serving: `${amount}${unit}`, basis: `100${unit}`,
      per100: { cal: kcal, carbs, protein, fat },
      maker: state.makers[mi] || '', mfdsKind: KIND[kind] || '',
      source: '식약처', nutritionSource: { provider: '식품의약품안전처 식품영양성분 DB', date: state.date },
    };
  }
  // nq: 정규화한 검색어. 앞에서 맞는 것 먼저, 그다음 짧은 이름. limit 개까지
  function search(query, limit = 200) {
    if (!state.ready) return [];
    const t0 = performance.now();
    const nq = norm(query);
    if (!nq) return [];
    const hits = [];
    const hay = state.hay;
    for (let i = 0; i < hay.length; i++) {
      const j = hay[i].indexOf(nq);
      if (j < 0) continue;
      const nameLen = hay[i].indexOf('\u0001');
      hits.push({ i, r: j === 0 ? 0 : j < nameLen ? 1 : 2, len: nameLen, kind: state.rows[i][2] });
    }
    hits.sort((a, b) => a.r - b.r || a.len - b.len || a.kind - b.kind || a.i - b.i);
    const out = hits.slice(0, limit).map(h => ({ name: state.rows[h.i][0], data: toFood(state.rows[h.i]), r: Math.min(h.r, 1), len: h.len, mfds: true }));
    state.lastMs = Math.round((performance.now() - t0) * 100) / 100;
    out.total = hits.length;
    return out;
  }
  global.MfdsDB = { load, search, toFood, norm, state, get ready() { return state.ready; } };
})(globalThis);
