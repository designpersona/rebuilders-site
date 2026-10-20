/* 아이폰 건강 앱(HealthKit) 심박수·걸음 수 읽기. @capgo/capacitor-health 네이티브 플러그인('Health') 사용.
 * - 읽기 권한(heartRate, steps)만 요청하고, 쓰기는 요청하지 않습니다. 체중은 읽지 않습니다.
 * - 읽은 값은 화면 표시용으로 메모리(아래 cache)에만 두고, 기기 저장소·백업 JSON·외부로 보내지 않습니다.
 * - 어떤 권한을 요청했는지(연결 단계 '1'=심박만, '2'=심박+걸음)만 localStorage 에 둡니다(건강 데이터 아님, 백업에도 없음).
 * - 웹/PWA 에서는 isSupported() 가 false 이고 모든 함수가 아무 것도 하지 않습니다. */
(function initRebuildersHealth(global) {
  'use strict';

  const FLAG_KEY = 'rebuilders-health-connected';
  const CURRENT_LEVEL = '2';
  const READ_TYPES = ['heartRate', 'steps'];
  const RECENT_DAYS = 7;
  const CACHE_MS = 2 * 60_000;
  let cache = { at: 0, days: new Map(), level: null };

  function plugin() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.() || cap.getPlatform?.() !== 'ios') return null;
    return cap.Plugins?.Health || cap.registerPlugin?.('Health') || null;
  }

  function isSupported() { return Boolean(plugin()); }

  function level() {
    try { return global.localStorage?.getItem(FLAG_KEY) || null; } catch { return null; }
  }

  function isConnected() { return isSupported() && Boolean(level()); }

  /** 예전에 심박수만 연결한 사용자: 걸음 수 권한을 새로 요청해야 함 */
  function needsStepsPermission() { return isConnected() && level() !== CURRENT_LEVEL; }

  function setLevel(value) {
    try {
      if (value) global.localStorage?.setItem(FLAG_KEY, value);
      else global.localStorage?.removeItem(FLAG_KEY);
    } catch { /* 저장 실패해도 동작에는 영향 없음 */ }
    clearCache();
  }

  function clearCache() { cache = { at: 0, days: new Map(), level: null }; }

  async function isAvailable() {
    const health = plugin();
    if (!health) return { available: false, reason: 'not-native' };
    try { return await health.isAvailable(); } catch (error) { return { available: false, reason: String(error?.message || error) }; }
  }

  /** 사용자가 버튼을 눌렀을 때만 호출: iOS 권한 시트를 띄웁니다(읽기 전용, 심박수+걸음 수).
   *  이미 심박수만 연결한 경우에도 같은 함수로 걸음 수 권한을 추가 요청합니다. */
  async function connect() {
    const health = plugin();
    if (!health) throw new Error('건강 앱 연결은 아이폰 앱에서만 사용할 수 있어요.');
    const availability = await isAvailable();
    if (!availability.available) throw new Error('이 기기에서는 건강 앱을 사용할 수 없어요.');
    await health.requestAuthorization({ read: READ_TYPES, write: [] });
    setLevel(CURRENT_LEVEL);
    return true;
  }

  /** 앱 안 연결만 해제합니다. iOS 권한 자체는 설정 > 건강 > 데이터 접근 및 기기에서 끌 수 있어요. */
  function disconnect() { setLevel(null); }

  function startOfDay(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
  function dayKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function emptyDay() { return { heartAverage: null, heartLatest: null, heartLatestAt: null, heartCount: 0, steps: null }; }

  /** 최근 7일(오늘 포함) 일별 값: Map(dateKey → { heartAverage, heartLatest, heartLatestAt, heartCount, steps }) */
  async function readRecentDays(now = new Date(), { force = false } = {}) {
    const health = plugin();
    if (!health || !isConnected()) return new Map();
    if (!force && cache.days.size && cache.level === level() && Date.now() - cache.at < CACHE_MS) return cache.days;
    const first = startOfDay(now);
    first.setDate(first.getDate() - (RECENT_DAYS - 1));
    const startDate = first.toISOString();
    const endDate = now.toISOString();
    const days = new Map();
    for (let i = 0; i < RECENT_DAYS; i += 1) {
      const d = new Date(first); d.setDate(first.getDate() + i);
      days.set(dayKey(d), emptyDay());
    }

    // 심박수: 최근 7일 샘플(최신순)로 일별 평균·최근값
    const { samples = [] } = await health.readSamples({ dataType: 'heartRate', startDate, endDate, limit: 5000, ascending: false });
    const sums = new Map();
    samples.forEach(sample => {
      const value = Number(sample.value);
      if (!Number.isFinite(value)) return;
      const key = dayKey(sample.startDate || sample.endDate);
      const day = days.get(key);
      if (!day) return;
      if (day.heartLatest === null) { day.heartLatest = Math.round(value); day.heartLatestAt = sample.endDate || sample.startDate || null; }
      const s = sums.get(key) || { total: 0, count: 0 };
      s.total += value; s.count += 1; sums.set(key, s);
    });
    sums.forEach((s, key) => { const day = days.get(key); day.heartCount = s.count; day.heartAverage = Math.round(s.total / s.count); });
    try {
      // 샘플이 많으면(5000개 초과) HealthKit 일 평균이 더 정확해요(실패하면 샘플 평균 사용).
      const aggregated = await health.queryAggregated({ dataType: 'heartRate', startDate, endDate, bucket: 'day', aggregation: 'average' });
      (aggregated?.samples || []).forEach(bucket => {
        const day = days.get(dayKey(bucket.startDate));
        const value = Number(bucket.value);
        if (day && day.heartCount && Number.isFinite(value) && value > 0) day.heartAverage = Math.round(value);
      });
    } catch { /* 샘플 평균 사용 */ }

    // 걸음 수: 일별 합계(걸음 권한을 요청한 경우에만)
    if (!needsStepsPermission()) {
      try {
        const aggregated = await health.queryAggregated({ dataType: 'steps', startDate, endDate, bucket: 'day', aggregation: 'sum' });
        days.forEach(day => { day.steps = 0; });
        (aggregated?.samples || []).forEach(bucket => {
          const day = days.get(dayKey(bucket.startDate));
          const value = Number(bucket.value);
          if (day && Number.isFinite(value)) day.steps = Math.round(value);
        });
      } catch { days.forEach(day => { day.steps = null; }); }
    }

    cache = { at: Date.now(), days, level: level() };
    return days;
  }

  /** 선택한 날짜 값. 최근 7일 밖이면 { outOfRange: true } */
  async function readDay(date, now = new Date()) {
    const days = await readRecentDays(now);
    const key = dayKey(date);
    if (!days.has(key)) return { outOfRange: true, ...emptyDay() };
    return { outOfRange: false, ...days.get(key) };
  }

  /** (이전 버전 호환) 오늘 심박수 */
  async function readTodayHeartRate(now = new Date()) {
    if (!isConnected()) return null;
    const day = await readDay(now, now);
    return { average: day.heartAverage, latest: day.heartLatest, latestAt: day.heartLatestAt, count: day.heartCount };
  }

  global.RebuildersHealth = {
    isSupported, isConnected, needsStepsPermission, isAvailable, connect, disconnect,
    readRecentDays, readDay, readTodayHeartRate, clearCache, RECENT_DAYS,
  };
})(globalThis);
