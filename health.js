/* 아이폰 건강 앱(HealthKit) 심박수 읽기. @capgo/capacitor-health 네이티브 플러그인('Health') 사용.
 * - 읽기 권한(heartRate)만 요청하고, 쓰기는 요청하지 않습니다.
 * - 읽은 심박수는 화면 표시용으로 메모리에만 두고, 기기 저장소·백업 JSON·외부로 보내지 않습니다.
 * - '연결했음' 표시(true/false)만 localStorage 에 둡니다(건강 데이터 아님, 백업에도 포함 안 됨).
 * - 웹/PWA 에서는 isSupported() 가 false 이고 모든 함수가 아무 것도 하지 않습니다. */
(function initRebuildersHealth(global) {
  'use strict';

  const FLAG_KEY = 'rebuilders-health-connected';
  const READ_TYPES = ['heartRate'];

  function plugin() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.() || cap.getPlatform?.() !== 'ios') return null;
    return cap.Plugins?.Health || cap.registerPlugin?.('Health') || null;
  }

  function isSupported() { return Boolean(plugin()); }

  function isConnected() {
    try { return isSupported() && global.localStorage?.getItem(FLAG_KEY) === '1'; } catch { return false; }
  }

  function setConnected(value) {
    try {
      if (value) global.localStorage?.setItem(FLAG_KEY, '1');
      else global.localStorage?.removeItem(FLAG_KEY);
    } catch { /* 저장 실패해도 동작에는 영향 없음 */ }
  }

  async function isAvailable() {
    const health = plugin();
    if (!health) return { available: false, reason: 'not-native' };
    try { return await health.isAvailable(); } catch (error) { return { available: false, reason: String(error?.message || error) }; }
  }

  /** 사용자가 버튼을 눌렀을 때만 호출: iOS 권한 시트를 띄웁니다(읽기 전용). */
  async function connect() {
    const health = plugin();
    if (!health) throw new Error('건강 앱 연결은 아이폰 앱에서만 사용할 수 있어요.');
    const availability = await isAvailable();
    if (!availability.available) throw new Error('이 기기에서는 건강 앱을 사용할 수 없어요.');
    await health.requestAuthorization({ read: READ_TYPES, write: [] });
    setConnected(true);
    return true;
  }

  /** 앱 안 연결만 해제합니다. iOS 권한 자체는 설정 > 건강 > 데이터 접근 및 기기에서 끌 수 있어요. */
  function disconnect() { setConnected(false); }

  function startOfToday(now = new Date()) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** 오늘 0시~지금 심박수: { average, latest, latestAt, count }. 데이터가 없으면 null. */
  async function readTodayHeartRate(now = new Date()) {
    const health = plugin();
    if (!health || !isConnected()) return null;
    const startDate = startOfToday(now).toISOString();
    const endDate = now.toISOString();
    const { samples = [] } = await health.readSamples({ dataType: 'heartRate', startDate, endDate, limit: 2000, ascending: false });
    const values = samples.map(sample => Number(sample.value)).filter(Number.isFinite);
    if (!values.length) return { average: null, latest: null, latestAt: null, count: 0 };
    let average = values.reduce((sum, value) => sum + value, 0) / values.length;
    try {
      // 샘플이 많으면 HealthKit 일 평균이 더 정확해요(실패하면 샘플 평균 사용).
      const aggregated = await health.queryAggregated({ dataType: 'heartRate', startDate, endDate, bucket: 'day', aggregation: 'average' });
      const value = Number(aggregated?.samples?.[aggregated.samples.length - 1]?.value);
      if (Number.isFinite(value) && value > 0) average = value;
    } catch { /* 샘플 평균 사용 */ }
    return {
      average: Math.round(average),
      latest: Math.round(values[0]),
      latestAt: samples[0]?.endDate || samples[0]?.startDate || null,
      count: values.length,
    };
  }

  global.RebuildersHealth = { isSupported, isConnected, isAvailable, connect, disconnect, readTodayHeartRate };
})(globalThis);
