/* JSON 백업 내보내기/가져오기. 서버 통신 없이 기기 안에서만 동작합니다. */
(function initRebuildersBackup(global) {
  'use strict';

  const FORMAT = 'rebuilders-backup';
  const APP_ID = 'rebuilders-food-tracker';
  const VERSION = 1;
  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
  const NUTRIENT_KEYS = ['cal', 'carbs', 'protein', 'fat', 'sugar', 'fiber', 'saturatedFat', 'transFat',
    'cholesterol', 'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'vitaminD', 'vitaminC'];
  const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
  const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const deepCopy = value => JSON.parse(JSON.stringify(value));

  function pad(n) { return String(n).padStart(2, '0'); }
  function localDate(now) { return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; }

  function isRealDate(key) {
    if (!DATE_KEY.test(key)) return false;
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }

  function backupFileName(now = new Date()) {
    return `rebuilders-backup-v${VERSION}-${localDate(now)}.json`;
  }

  /** 저장소의 전체 상태(날짜별 식단, settings, customFoods, recentFoods, shopping)를 파일 구조로 감쌉니다. */
  function buildBackup(state, now = new Date()) {
    return {
      format: FORMAT,
      app: APP_ID,
      version: VERSION,
      exportedAt: now.toISOString(),
      data: deepCopy(state || {}),
    };
  }

  function validateFood(food, where, errors) {
    if (!isObject(food)) { errors.push(`${where}: 음식 항목 형식이 올바르지 않아요.`); return false; }
    if (typeof food.name !== 'string' || !food.name.trim() || food.name.length > 200) {
      errors.push(`${where}: 음식 이름이 올바르지 않아요.`);
      return false;
    }
    for (const key of NUTRIENT_KEYS) {
      if (food[key] !== undefined && food[key] !== null && (typeof food[key] !== 'number' || !Number.isFinite(food[key]))) {
        errors.push(`${where}: ${food.name}의 ${key} 값이 숫자가 아니에요.`);
        return false;
      }
    }
    return true;
  }

  function sanitizeDay(day, key, errors) {
    if (!isObject(day)) { errors.push(`${key}: 하루 기록 형식이 올바르지 않아요.`); return null; }
    const out = {};
    for (const meal of MEALS) {
      const list = day[meal] === undefined ? [] : day[meal];
      if (!Array.isArray(list)) { errors.push(`${key}: ${meal} 목록 형식이 올바르지 않아요.`); return null; }
      for (const food of list) if (!validateFood(food, `${key} ${meal}`, errors)) return null;
      out[meal] = deepCopy(list);
    }
    if (day.mealTimes !== undefined) {
      if (!isObject(day.mealTimes)) { errors.push(`${key}: 섭취 시간 형식이 올바르지 않아요.`); return null; }
      out.mealTimes = deepCopy(day.mealTimes);
    }
    return out;
  }

  function sanitizeSettings(settings, errors) {
    if (!isObject(settings)) { errors.push('settings 형식이 올바르지 않아요.'); return null; }
    for (const key of ['height', 'weight', 'targetCal']) {
      if (settings[key] !== undefined && (typeof settings[key] !== 'number' || !Number.isFinite(settings[key]))) {
        errors.push(`settings.${key} 값이 숫자가 아니에요.`);
        return null;
      }
    }
    if (settings.locale !== undefined && settings.locale !== 'ko' && settings.locale !== 'en') {
      errors.push('settings.locale 값이 올바르지 않아요.');
      return null;
    }
    const out = {};
    for (const [key, value] of Object.entries(settings)) if (!BLOCKED_KEYS.has(key)) out[key] = deepCopy(value);
    return out;
  }

  /** 장보기·창고(shopping). storage.js 의 normalizeShopping 과 같은 규칙으로 정리합니다. */
  function sanitizeShopping(value, errors) {
    if (!isObject(value)) { errors.push('shopping 형식이 올바르지 않아요.'); return null; }
    if ((value.items !== undefined && !Array.isArray(value.items)) || (value.stock !== undefined && !Array.isArray(value.stock))) {
      errors.push('장보기 목록 형식이 올바르지 않아요.');
      return null;
    }
    const normalize = global.NiliriStorage?.normalizeShopping;
    return normalize ? normalize(value) : { items: deepCopy(value.items || []), stock: deepCopy(value.stock || []) };
  }

  function summarize(state) {
    const dates = Object.keys(state).filter(key => DATE_KEY.test(key)).sort();
    let meals = 0;
    for (const key of dates) for (const meal of MEALS) meals += (state[key][meal] || []).length;
    return {
      days: dates.length,
      foods: meals,
      customFoods: Object.keys(state.customFoods || {}).length,
      recentFoods: (state.recentFoods || []).length,
      hasSettings: Boolean(state.settings),
      shoppingItems: (state.shopping?.items || []).length,
      stockItems: (state.shopping?.stock || []).length,
      firstDate: dates[0] || null,
      lastDate: dates[dates.length - 1] || null,
    };
  }

  /** 백업 객체를 검증하고 앱 상태로 정리합니다. 알 수 없는 최상위 키는 버립니다. */
  function validateBackup(backup) {
    const errors = [];
    const warnings = [];
    if (!isObject(backup)) return { ok: false, errors: ['백업 파일 형식이 올바르지 않아요.'] };
    if (backup.format !== FORMAT || backup.app !== APP_ID) {
      return { ok: false, errors: ['리빌더스에서 내보낸 백업 파일이 아니에요.'] };
    }
    if (!Number.isInteger(backup.version) || backup.version < 1) {
      return { ok: false, errors: ['백업 파일 버전을 확인할 수 없어요.'] };
    }
    if (backup.version > VERSION) {
      return { ok: false, errors: [`더 새로운 버전(v${backup.version})의 백업 파일이에요. 앱을 업데이트한 뒤 다시 시도해 주세요.`] };
    }
    if (!isObject(backup.data)) return { ok: false, errors: ['백업 파일에 데이터가 없어요.'] };

    const state = {};
    let ignored = 0;
    for (const [key, value] of Object.entries(backup.data)) {
      if (BLOCKED_KEYS.has(key)) { ignored += 1; continue; }
      if (DATE_KEY.test(key)) {
        if (!isRealDate(key)) { errors.push(`${key}: 존재하지 않는 날짜예요.`); continue; }
        const day = sanitizeDay(value, key, errors);
        if (day) state[key] = day;
      } else if (key === 'settings') {
        const settings = sanitizeSettings(value, errors);
        if (settings) state.settings = settings;
      } else if (key === 'customFoods') {
        if (!isObject(value)) { errors.push('customFoods 형식이 올바르지 않아요.'); continue; }
        const foods = {};
        for (const [name, food] of Object.entries(value)) {
          if (BLOCKED_KEYS.has(name)) { ignored += 1; continue; }
          if (isObject(food) && validateFood({ name, ...food }, `내 음식 ${name}`, errors)) foods[name] = deepCopy(food);
          else if (!isObject(food)) errors.push(`내 음식 ${name}: 형식이 올바르지 않아요.`);
        }
        state.customFoods = foods;
      } else if (key === 'shopping') {
        const shopping = sanitizeShopping(value, errors);
        if (shopping) state.shopping = shopping;
      } else if (key === 'recentFoods') {
        if (!Array.isArray(value)) { errors.push('recentFoods 형식이 올바르지 않아요.'); continue; }
        const list = [];
        for (const food of value) if (validateFood(food, '최근 음식', errors)) list.push(deepCopy(food));
        state.recentFoods = list.slice(0, 12);
      } else {
        ignored += 1;
      }
    }
    if (ignored) warnings.push(`알 수 없는 항목 ${ignored}개는 가져오지 않아요.`);
    if (errors.length) return { ok: false, errors: errors.slice(0, 5), moreErrors: Math.max(0, errors.length - 5) };
    return { ok: true, state, summary: summarize(state), exportedAt: backup.exportedAt || null, version: backup.version, warnings };
  }

  function parseBackup(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      return { ok: false, errors: ['JSON 파일을 읽을 수 없어요. 내보낸 백업 파일이 맞는지 확인해 주세요.'] };
    }
    return validateBackup(parsed);
  }

  function mergeById(current, incoming) {
    const map = new Map();
    for (const item of current || []) map.set(item.id, item);
    for (const item of incoming || []) map.set(item.id, item);
    return [...map.values()];
  }

  /** 합치기: 같은 날짜는 백업 우선, customFoods 는 백업 우선, recentFoods 는 백업 항목을 앞에 둡니다.
   *  shopping 은 같은 id 항목은 백업 우선으로 합칩니다. */
  function mergeStates(current, incoming) {
    const next = { ...(current || {}) };
    for (const [key, value] of Object.entries(incoming)) {
      if (key === 'customFoods') next.customFoods = { ...(current?.customFoods || {}), ...value };
      else if (key === 'settings') next.settings = { ...(current?.settings || {}), ...value };
      else if (key === 'shopping') {
        next.shopping = {
          items: mergeById(current?.shopping?.items, value.items),
          stock: mergeById(current?.shopping?.stock, value.stock),
        };
      }
      else if (key === 'recentFoods') {
        const seen = new Set();
        next.recentFoods = [...value, ...(current?.recentFoods || [])]
          .filter(food => (seen.has(food.name) ? false : seen.add(food.name))).slice(0, 12);
      } else next[key] = value;
    }
    return next;
  }

  function downloadFile(file) {
    const url = global.URL.createObjectURL(file);
    const link = global.document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.rel = 'noopener';
    global.document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => global.URL.revokeObjectURL(url), 10000);
  }

  function nativePlugins() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.()) return null;
    const get = name => cap.Plugins?.[name] || cap.registerPlugin?.(name);
    const Filesystem = get('Filesystem');
    const Share = get('Share');
    return Filesystem && Share ? { Filesystem, Share } : null;
  }

  /**
   * 파일을 사용자에게 건넵니다. 우선순위:
   * 1) 앱(Capacitor): 임시 파일로 쓴 뒤 iOS 공유 시트(파일 앱·iCloud Drive 저장 가능)
   * 2) Web Share API(files)  3) 다운로드 폴백
   * 반환: { method: 'native-share'|'share'|'download'|'cancelled', fileName }
   */
  async function exportBackup(state, options = {}) {
    const now = options.now || new Date();
    const fileName = backupFileName(now);
    const text = JSON.stringify(buildBackup(state, now), null, 2);

    const native = nativePlugins();
    if (native) {
      try {
        const written = await native.Filesystem.writeFile({ path: fileName, data: text, directory: 'CACHE', encoding: 'utf8' });
        await native.Share.share({ title: '리빌더스 백업', url: written.uri, dialogTitle: '백업 파일 저장' });
        return { method: 'native-share', fileName };
      } catch (error) {
        if (/cancel/i.test(`${error?.message || ''} ${error?.name || ''}`)) return { method: 'cancelled', fileName };
        // 네이티브 공유 실패 시 아래 웹 방식으로 계속 시도
      }
    }

    const file = new global.File([text], fileName, { type: 'application/json' });
    const nav = global.navigator;
    if (nav?.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: '리빌더스 백업' });
        return { method: 'share', fileName };
      } catch (error) {
        if (error?.name === 'AbortError') return { method: 'cancelled', fileName };
        // 공유 실패 → 다운로드 폴백
      }
    }
    downloadFile(file);
    return { method: 'download', fileName };
  }

  global.NiliriBackup = {
    FORMAT, APP_ID, VERSION, MAX_FILE_BYTES,
    backupFileName, buildBackup, validateBackup, parseBackup, summarize, mergeStates, exportBackup,
  };
})(globalThis);
