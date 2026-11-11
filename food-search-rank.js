/* 음식 추가 시트·식도감 검색 결과의 순서와 중복 정리. DOM·저장소에 의존하지 않는 순수 함수입니다. */
(function rebuildersFoodSearchRank(global) {
  'use strict';

  function compactName(value) {
    return String(value || '').toLowerCase().normalize('NFC').replace(/[\s·.,()\[\]\-_/]+/g, '');
  }

  function brandOf(data) {
    return String(data?.maker || data?.brand || '').trim();
  }

  function isUserFood(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.sourceTrust === 'user' || data.nutritionCustom || data.source === 'user-entry') return true;
    if (data.sourceLabel === '내 음식' && !data.aiEstimate) return true;
    if (data.discoveryOrigin === 'confirmed') return true;
    return false;
  }

  function isEstimateFood(data) {
    if (!data || typeof data !== 'object' || isUserFood(data)) return false;
    return Boolean(data.aiEstimate || data.sourceTrust === 'estimate' || data.source === 'openclaw' || data.sourceLabel === '추정');
  }

  function isOfficialFood(data) {
    if (!data || typeof data !== 'object') return false;
    if (isUserFood(data) || isEstimateFood(data)) return false;
    if (data.source === '식약처' || data.mfds || data.mfdsKind) return true;
    const provider = String(data.nutritionSource?.provider || '');
    if (/식품의약품안전처|식약처|USDA|FoodData/i.test(provider)) return true;
    if (data.sourceTrust === 'reference' || data.source === 'Open Food Facts') return true;
    return !data.aiEstimate;
  }

  function isGenericOfficial(item) {
    const data = item?.data || {};
    if (brandOf(data)) return false;
    if (data.mfdsKind === '가공식품') return false;
    if (item.plain || data.genericHint) return true;
    if (item.mfds && data.mfdsKind === '원재료') return true;
    if (!item.mfds && !brandOf(data)) return true;
    return !brandOf(data) && data.mfdsKind !== '가공식품';
  }

  function dedupeKey(item, aliasMap) {
    const raw = String(item?.name || '');
    const data = item?.data || {};
    let name = compactName(raw);
    if (aliasMap && aliasMap[name]) name = aliasMap[name];
    return `${name}|${compactName(brandOf(data))}`;
  }

  function dataScore(item) {
    const data = item?.data || {};
    if (isUserFood(data) || item.section === 'mine' && !isEstimateFood(data)) return 0;
    if (isOfficialFood(data) && !isEstimateFood(data)) return isGenericOfficial(item) ? 1 : 2;
    if (isEstimateFood(data) || item.section === 'estimate') return 4;
    return 3;
  }

  function sectionScore(section) {
    return { mine: 0, recent: 1, db: 2, estimate: 3 }[section] ?? 4;
  }

  function mergeItems(a, b) {
    const dataWinner = dataScore(a) <= dataScore(b) ? a : b;
    const section = sectionScore(a.section) <= sectionScore(b.section) ? a.section : b.section;
    const lastServing = a.lastServing || b.lastServing || dataWinner.lastServing;
    const count = Math.max(Number(a.count) || 0, Number(b.count) || 0);
    const last = (a.last || '') >= (b.last || '') ? (a.last || b.last) : b.last;
    const similar = [...(a.similar || []), ...(b.similar || [])];
    return { ...dataWinner, section, lastServing, count: count || dataWinner.count, last: last || dataWinner.last, similar };
  }

  function preferItem(a, b) {
    return mergeItems(a, b);
  }

  function buildAliasCanon(groups) {
    const map = Object.create(null);
    const lists = [groups.mine, groups.recent, groups.db, groups.estimate];
    lists.forEach(list => {
      (list || []).forEach(item => {
        const canon = compactName(item.name);
        if (!canon) return;
        (item.aliases || []).forEach(alias => {
          const key = compactName(alias);
          if (key && !map[key]) map[key] = canon;
        });
      });
    });
    return map;
  }

  function sortDbItems(items) {
    return items.slice().sort((a, b) => {
      const ta = Number.isFinite(Number(a.tier)) ? Number(a.tier) : 99;
      const tb = Number.isFinite(Number(b.tier)) ? Number(b.tier) : 99;
      if (ta !== tb) return ta - tb;
      const ga = isGenericOfficial(a) ? 0 : 1;
      const gb = isGenericOfficial(b) ? 0 : 1;
      if (ga !== gb) return ga - gb;
      const kindA = a.data?.mfdsKind === '가공식품' ? 2 : a.data?.mfdsKind === '음식' ? 1 : 0;
      const kindB = b.data?.mfdsKind === '가공식품' ? 2 : b.data?.mfdsKind === '음식' ? 1 : 0;
      if (kindA !== kindB) return kindA - kindB;
      const la = compactName(a.name).length;
      const lb = compactName(b.name).length;
      if (la !== lb) return la - lb;
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    });
  }

  /**
   * @param {{ mine?: object[], recent?: object[], db?: object[], estimate?: object[] }} groups
   * @returns {{ key: string, items: object[] }[]}
   */
  function organizeSearchSections(groups = {}) {
    const aliasMap = buildAliasCanon(groups);
    const buckets = {
      mine: groups.mine || [],
      recent: groups.recent || [],
      db: groups.db || [],
      estimate: groups.estimate || [],
    };
    const tagged = [];
    ['mine', 'recent', 'db', 'estimate'].forEach(section => {
      buckets[section].forEach(item => {
        if (!item?.name) return;
        tagged.push({ ...item, section: item.section || section });
      });
    });
    const winners = new Map();
    tagged.forEach(item => {
      const key = dedupeKey(item, aliasMap);
      const prev = winners.get(key);
      winners.set(key, prev ? preferItem(prev, item) : item);
    });
    const out = { mine: [], recent: [], db: [], estimate: [] };
    winners.forEach(item => {
      let section = item.section;
      if (isUserFood(item.data) && (section === 'recent' || section === 'estimate' || section === 'db')) section = 'mine';
      else if (section === 'mine' && isEstimateFood(item.data) && !isUserFood(item.data)) section = 'estimate';
      if (!out[section]) section = 'db';
      out[section].push(item);
    });
    out.db = sortDbItems(out.db);
    return [
      { key: 'mine', items: out.mine },
      { key: 'recent', items: out.recent },
      { key: 'db', items: out.db },
      { key: 'estimate', items: out.estimate },
    ];
  }

  const api = {
    compactName,
    brandOf,
    isUserFood,
    isEstimateFood,
    isOfficialFood,
    isGenericOfficial,
    dedupeKey,
    preferItem,
    organizeSearchSections,
    sortDbItems,
  };
  global.RebuildersFoodSearchRank = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
