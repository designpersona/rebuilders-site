/* 맥 미니 브리지(집 와이파이): 빠른 입력한 음식 이름을 맥 미니의 리빌더스 브리지(OpenClaw diet 에이전트)로 보내
 * 영양성분(AI 추정)을 받아옵니다. 저장·화면 반영은 app.js 가 합니다.
 * - 보내는 내용: 음식 이름·양·끼니·날짜만(체중·심박수·걸음 수 등은 보내지 않음).
 * - 주소·토큰은 이 기기 localStorage 에만 저장(코드에 넣지 않음).
 * - 연결이 안 되면(집 밖 등) 대기 목록에 넣고, 앱을 열거나 다시 볼 때 자동으로 다시 시도.
 * 앱 번들에서 외부로 요청을 보내는 유일한 파일입니다(사용자가 설정한 주소로만). */
(function rebuildersBridge(global) {
  'use strict';

  const URL_KEY = 'rebuilders-bridge-url';
  const TOKEN_KEY = 'rebuilders-bridge-token';
  const QUEUE_KEY = 'rebuilders-bridge-pending';
  const MAX_JOBS = 30;
  const MAX_ATTEMPTS = 6;
  const TIMEOUT_MS = 75000;
  const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

  const store = () => { try { return global.localStorage; } catch { return null; } };
  const read = key => { try { return store()?.getItem(key) || ''; } catch { return ''; } };
  const write = (key, value) => { try { if (value) store()?.setItem(key, value); else store()?.removeItem(key); } catch { /* ignore */ } };

  /** 'Macui-Macmini.local:3400', '172.30.1.61' 등 → 'http://호스트:포트' (http/https만, 경로 없이) */
  function normalizeUrl(value) {
    let text = String(value || '').trim();
    if (!text) return '';
    if (!/^https?:\/\//i.test(text)) text = `http://${text}`;
    try {
      const u = new URL(text);
      if (!['http:', 'https:'].includes(u.protocol) || !u.hostname || u.username || u.password) return '';
      if (!u.port && u.protocol === 'http:') u.port = '3400';
      return `${u.protocol}//${u.host}`;
    } catch { return ''; }
  }

  function normalizeToken(value) {
    const token = String(value || '').trim();
    return /^[A-Za-z0-9_-]{20,128}$/.test(token) ? token : '';
  }

  function getConfig() {
    return { url: normalizeUrl(read(URL_KEY)), token: normalizeToken(read(TOKEN_KEY)) };
  }
  function setConfig({ url, token }) {
    if (url !== undefined) write(URL_KEY, normalizeUrl(url));
    if (token !== undefined) write(TOKEN_KEY, normalizeToken(token));
    return getConfig();
  }
  function isConfigured() { const c = getConfig(); return Boolean(c.url && c.token); }

  function getQueue() {
    try {
      const list = JSON.parse(read(QUEUE_KEY) || '[]');
      return Array.isArray(list) ? list.filter(job => job && job.id && Array.isArray(job.items)) : [];
    } catch { return []; }
  }
  function saveQueue(list) { write(QUEUE_KEY, list.length ? JSON.stringify(list.slice(-MAX_JOBS)) : ''); }

  function enqueue({ date, meal, items }) {
    const clean = (items || []).map(item => ({
      name: String(item?.name || '').trim().slice(0, 80),
      serving: String(item?.serving || '').trim().slice(0, 40),
    })).filter(item => item.name).slice(0, 8);
    if (!clean.length || !MEALS.includes(meal) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return null;
    const job = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, date, meal, items: clean, attempts: 0, createdAt: Date.now() };
    saveQueue([...getQueue(), job]);
    return job;
  }
  function removeJob(id) { saveQueue(getQueue().filter(job => job.id !== id)); }
  function bumpAttempt(id) {
    const list = getQueue();
    const job = list.find(j => j.id === id);
    if (!job) return 0;
    job.attempts = (job.attempts || 0) + 1;
    saveQueue(job.attempts >= MAX_ATTEMPTS ? list.filter(j => j.id !== id) : list);
    return job.attempts;
  }

  /** 브리지 응답 항목 → 앱 기록 필드. 탄수·단백질·지방·칼로리 중 하나라도 없으면 null */
  function toFoodFields(item) {
    if (!item || typeof item !== 'object') return null;
    const num = (value, max) => {
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 10) / 10 : null;
    };
    const cal = num(item.kcal, 5000), carbs = num(item.carbs_g, 1000), protein = num(item.protein_g, 1000), fat = num(item.fat_g, 1000);
    if ([cal, carbs, protein, fat].some(v => v === null)) return null;
    const out = { cal, carbs, protein, fat, estimate: true, aiEstimate: true, source: 'openclaw', sourceTrust: 'estimate', loggedVia: 'bridge' };
    const serving = String(item.serving || '').trim().slice(0, 40);
    if (serving) out.serving = serving;
    const note = String(item.source_note || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (note) out.sourceNote = note;
    try { const u = new URL(String(item.source_url || '')); if (u.protocol === 'https:') out.sourceUrl = u.href.slice(0, 300); } catch { /* 없음 */ }
    return out;
  }

  class BridgeError extends Error {
    constructor(kind, message) { super(message || kind); this.kind = kind; }
  }

  async function request(path, { method = 'GET', body } = {}) {
    const { url, token } = getConfig();
    if (!url) throw new BridgeError('not_configured');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
    let res;
    try {
      res = await global.fetch(`${url}${path}`, {
        method,
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller?.signal,
        cache: 'no-store',
        credentials: 'omit',
      });
    } catch (error) {
      throw new BridgeError(error?.name === 'AbortError' ? 'timeout' : 'unreachable');
    } finally {
      if (timer) clearTimeout(timer);
    }
    let data = null;
    try { data = await res.json(); } catch { /* 빈 응답 */ }
    if (res.status === 401) throw new BridgeError('unauthorized');
    if (res.status === 504) throw new BridgeError('timeout');
    if (!res.ok || !data?.ok) throw new BridgeError(res.status >= 500 ? 'agent_failed' : 'bad_request');
    return data;
  }

  async function checkHealth() { return request('/health'); }

  /** 주소·토큰 확인: 'ok' | 'unauthorized' | 'unreachable' | 'timeout' | 'not_configured' | 'error'
   *  (빈 요청을 보내 토큰만 확인 — 토큰이 맞으면 브리지가 400(음식 없음)으로 답하고 AI는 부르지 않음) */
  async function checkConnection() {
    try {
      await checkHealth();
      await request('/log', { method: 'POST', body: { items: [] } });
      return 'ok';
    } catch (error) {
      const kind = error?.kind || 'error';
      return kind === 'bad_request' ? 'ok' : kind;
    }
  }

  async function lookup({ date, meal, items }) {
    const data = await request('/log', { method: 'POST', body: { date, meal, items } });
    return { items: Array.isArray(data.items) ? data.items : [], failed: Array.isArray(data.failed) ? data.failed : [] };
  }

  const api = { normalizeUrl, normalizeToken, getConfig, setConfig, isConfigured, getQueue, enqueue, removeJob, bumpAttempt, toFoodFields, checkHealth, checkConnection, lookup, BridgeError, MAX_ATTEMPTS };
  global.RebuildersBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
