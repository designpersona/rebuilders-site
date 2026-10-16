/* 식사 기록 알림 (기기 안 로컬 알림). Capacitor @capacitor/local-notifications 사용.
 * 웹/PWA 에서는 isSupported() 가 false 이고 모든 함수가 아무 것도 하지 않습니다. */
(function initRebuildersReminders(global) {
  'use strict';

  const MEALS = ['breakfast', 'lunch', 'dinner'];
  const IDS = { breakfast: 7101, lunch: 7102, dinner: 7103 };
  const DEFAULT_TIMES = Object.freeze({ breakfast: '08:30', lunch: '12:30', dinner: '19:00' });
  const COPY = {
    ko: {
      title: '리빌더스',
      body: { breakfast: '아침 식사를 기록할 시간이에요.', lunch: '점심 식사를 기록할 시간이에요.', dinner: '저녁 식사를 기록할 시간이에요.' },
    },
    en: {
      title: 'Rebuilders',
      body: { breakfast: 'Time to log your breakfast.', lunch: 'Time to log your lunch.', dinner: 'Time to log your dinner.' },
    },
  };

  function plugin() {
    const cap = global.Capacitor;
    if (!cap?.isNativePlatform?.()) return null;
    // 번들러 없이 쓰므로 네이티브에 등록된 플러그인을 이름으로 연결합니다.
    return cap.Plugins?.LocalNotifications || cap.registerPlugin?.('LocalNotifications') || null;
  }

  function isSupported() { return Boolean(plugin()); }

  function parseTime(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return hour < 24 && minute < 60 ? { hour, minute } : null;
  }

  function normalize(config) {
    const times = {};
    for (const meal of MEALS) times[meal] = parseTime(config?.times?.[meal]) ? config.times[meal] : DEFAULT_TIMES[meal];
    return { enabled: Boolean(config?.enabled), times };
  }

  async function cancelAll() {
    const ln = plugin();
    if (!ln) return;
    await ln.cancel({ notifications: MEALS.map(meal => ({ id: IDS[meal] })) });
  }

  /**
   * 설정을 알림 예약에 반영합니다.
   * options.requestPermission=true 일 때만 권한 팝업을 띄웁니다(앱 시작 시 동기화는 false).
   * 반환 status: 'unsupported' | 'disabled' | 'denied' | 'scheduled'
   */
  async function apply(config, locale = 'ko', options = {}) {
    const ln = plugin();
    if (!ln) return { status: 'unsupported' };
    const cfg = normalize(config);
    try {
      await cancelAll();
      if (!cfg.enabled) return { status: 'disabled' };

      let permission = (await ln.checkPermissions()).display;
      if (permission !== 'granted' && options.requestPermission) permission = (await ln.requestPermissions()).display;
      if (permission !== 'granted') return { status: 'denied' };

      const copy = COPY[locale === 'en' ? 'en' : 'ko'];
      await ln.schedule({
        notifications: MEALS.map(meal => {
          const time = parseTime(cfg.times[meal]);
          return {
            id: IDS[meal],
            title: copy.title,
            body: copy.body[meal],
            schedule: { on: { hour: time.hour, minute: time.minute }, allowWhileIdle: true },
          };
        }),
      });
      return { status: 'scheduled' };
    } catch (error) {
      return { status: 'error', error };
    }
  }

  global.NiliriReminders = { MEALS, IDS, DEFAULT_TIMES, isSupported, normalize, parseTime, apply, cancelAll };
})(globalThis);
