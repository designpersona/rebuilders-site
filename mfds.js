/* 식약처 식품영양성분 DB(앱 안에 내장, data/mfds.json) — 폰 안에서만 검색
   - 앱 시작 때가 아니라 첫 검색 때 한 번만 읽고(같은 앱 번들 파일), 이름 색인을 만듦
   - 검색할 때 바깥으로 나가는 요청 없음 */
(function initMfds(global) {
  'use strict';
  const URL = 'data/mfds.json';
  const KIND = ['음식', '가공식품', '원재료'];
  const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  const state = { ready: false, loading: null, rows: [], makers: [], hay: [], date: '', loadMs: 0, parseMs: 0, lastMs: 0, error: '' };

  function applyData(data) {
    state.rows = data.rows || [];
    state.makers = data.makers || [];
    state.date = data.date || '';
    state.hay = state.rows.map(r => norm(r[0]) + '\u0001' + norm(state.makers[r[1]] || ''));
    state.ready = true;
    state.error = '';
  }

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
        applyData(data);
        state.loadMs = Math.round(t1 - t0); state.parseMs = Math.round(performance.now() - t1);
        return true;
      } catch (error) {
        state.error = String(error?.message || error);
        return false;
      } finally { state.loading = null; }
    })();
    return state.loading;
  }

  const r1 = v => Math.round((Number(v) || 0) * 10) / 10;

  // 음식(외식) 식품명은 '대표식품 세부명' 형태. 브랜드와 붙일 때는 대표식품만 떼어 씀.
  function dishName(name, kind) {
    const s = String(name || '').trim();
    if (kind !== 0) return s;
    const i = s.search(/\s+/);
    return i > 0 ? s.slice(i).trim() : s;
  }

  function longestMakerPrefix(nq, makers) {
    let best = null;
    for (let i = 0; i < makers.length; i++) {
      const nm = norm(makers[i]);
      if (nm.length < 2 || !nq.startsWith(nm)) continue;
      if (!best || nm.length > best.nlen) best = { i, nm, nlen: nm.length, rest: nq.slice(nm.length) };
    }
    return best;
  }

  function brandAliases(name, maker, kind) {
    const m = String(maker || '').trim();
    const n = String(name || '').trim();
    if (!m || !n) return [];
    const dish = dishName(n, kind);
    const out = [`${m} ${n}`];
    if (dish && dish !== n) out.push(`${m} ${dish}`);
    return out;
  }

  // 한 줄 → 앱 음식 데이터. 기본 양은 식품중량(한 포장·1회)의 영양, 총중량도 같이 저장.
  function toFood(row) {
    const [name, mi, kind, unitFlag, w, kcal, carbs, protein, fat] = row;
    const unit = unitFlag ? 'ml' : 'g';
    const amount = w > 0 ? w : 100;
    const f = amount / 100;
    const maker = state.makers[mi] || '';
    const food = {
      name, cal: Math.round(kcal * f), carbs: r1(carbs * f), protein: r1(protein * f), fat: r1(fat * f),
      serving: `${amount}${unit}`, servingAmount: amount, servingUnit: unit,
      servingGrams: amount, basis: `100${unit}`, basisGrams: 100,
      per100: { cal: kcal, carbs, protein, fat },
      maker, mfdsKind: KIND[kind] || '',
      source: '식약처', nutritionSource: { provider: '식품의약품안전처 식품영양성분 DB', date: state.date },
    };
    if (kind === 1 && w > 0) {
      food.sourceLabel = '공식';
      food.sourceTrust = 'reference';
      food.packageGrams = amount;
      food.unitGrams = { '개': amount };
    }
    return food;
  }

  function searchRecords(query, db, limit = 200) {
    const nq = norm(query);
    if (!nq) return [];
    const rows = db.rows || [];
    const makers = db.makers || [];
    const hay = db.hay || rows.map(r => norm(r[0]) + '\u0001' + norm(makers[r[1]] || ''));
    const brand = longestMakerPrefix(nq, makers);
    const hits = [];
    if (brand && brand.rest) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][1] !== brand.i) continue;
        const nameN = norm(rows[i][0]);
        const dishN = norm(dishName(rows[i][0], rows[i][2]));
        if (!nameN.includes(brand.rest) && !dishN.includes(brand.rest)) continue;
        let r = 2;
        if (nameN === brand.rest || dishN === brand.rest) r = 0;
        else if (dishN.startsWith(brand.rest) || nameN.endsWith(brand.rest)) r = 1;
        hits.push({ i, r, len: nameN.length, kind: rows[i][2], brandExact: r === 0 });
      }
    } else {
      for (let i = 0; i < hay.length; i++) {
        const j = hay[i].indexOf(nq);
        if (j < 0) continue;
        const nameLen = hay[i].indexOf('\u0001');
        hits.push({ i, r: j === 0 ? 0 : j < nameLen ? 1 : 2, len: nameLen, kind: rows[i][2], brandExact: false });
      }
    }
    hits.sort((a, b) => a.r - b.r || a.len - b.len || a.kind - b.kind || a.i - b.i);
    const out = hits.slice(0, limit).map(h => {
      const row = rows[h.i];
      return {
        name: row[0],
        data: toFood(row),
        r: Math.min(h.r, 1),
        len: h.len,
        mfds: true,
        brandExact: Boolean(h.brandExact),
      };
    });
    out.total = hits.length;
    return out;
  }

  // nq: 정규화한 검색어. 브랜드+메뉴면 그 업체만. 앞에서 맞는 것 먼저, 그다음 짧은 이름. limit 개까지
  function search(query, limit = 200) {
    if (!state.ready) return [];
    const t0 = performance.now();
    const out = searchRecords(query, state, limit);
    state.lastMs = Math.round((performance.now() - t0) * 100) / 100;
    return out;
  }

  global.MfdsDB = {
    load, search, searchRecords, toFood, norm, dishName, brandAliases, applyData, state,
    get ready() { return state.ready; },
  };
})(globalThis);
