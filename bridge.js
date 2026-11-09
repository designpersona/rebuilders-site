/* 맥 미니 브리지(집 와이파이): 빠른 입력한 음식 이름을 맥 미니의 리빌더스 브리지(OpenClaw diet 에이전트)로 보내
 * 영양성분(AI 추정)을 받아옵니다. 저장·화면 반영은 app.js 가 합니다.
 * - 보내는 내용: 음식 이름·양·끼니·날짜만(체중·심박수·걸음 수 등은 보내지 않음).
 * - 주소·토큰은 이 기기 localStorage 에만 저장(코드에 넣지 않음).
 * - 연결이 안 되면(집 밖 등) 대기 목록에 넣고, 앱을 열거나 다시 볼 때 자동으로 다시 시도.
 * - 오래 기다리지 않음: POST /jobs 로 맡기고(바로 답) GET /jobs/<id> 로 나중에 결과만 받아옴.
 *   예전 브리지(/jobs 없음)면 POST /log(답을 기다림)로 대신함.
 * 앱 번들에서 외부로 요청을 보내는 유일한 파일입니다(사용자가 설정한 주소로만). */
(function rebuildersBridge(global) {
  'use strict';

  const URL_KEY = 'rebuilders-bridge-url';
  const TOKEN_KEY = 'rebuilders-bridge-token';
  const QUEUE_KEY = 'rebuilders-bridge-pending';
  const MAX_JOBS = 30;
  const MAX_ATTEMPTS = 6;
  const TIMEOUT_MS = 75000;
  const SUBMIT_TIMEOUT_MS = 15000; // /jobs 맡기기·결과 묻기는 바로 답하므로 짧게
  const POLL_TIMEOUT_MS = 10000;
  const JOB_ID_RE = /^[0-9a-f]{32}$/;
  // 맥 미니가 꺼져 있으면 iOS fetch가 연결을 오래(수십 초) 붙잡음 → 긴 요청 전에 /health 를 3초만 기다려 보고,
  // 안 되면 잠깐(45초) 바로 '연결 안 됨'으로 끝냄(키 입력·화면 복귀마다 다시 기다리지 않게)
  const CONNECT_TIMEOUT_MS = 3000;
  const OFFLINE_COOLDOWN_MS = 45000;
  const ONLINE_TRUST_MS = 20000;
  let offlineUntil = 0;
  let onlineAt = 0;
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
    offlineUntil = 0; onlineAt = 0; // 주소·토큰이 바뀌면 연결 상태를 새로 확인
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
  function setJobItems(id, items) { saveQueue(getQueue().map(job => (job.id === id ? { ...job, items } : job))); }
  /** 맥 미니에 맡긴 작업 번호(나중에 결과만 받아옴). 빈 값이면 다음에 다시 맡김 */
  function setJobRemote(id, remoteId) {
    const value = JOB_ID_RE.test(String(remoteId || '')) ? String(remoteId) : '';
    saveQueue(getQueue().map(job => {
      if (job.id !== id) return job;
      const { remoteId: _old, ...rest } = job;
      return value ? { ...rest, remoteId: value, submittedAt: job.remoteId === value ? job.submittedAt : Date.now() } : rest;
    }));
  }
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
    const sugar = item.sugar_g === null || item.sugar_g === undefined ? null : num(item.sugar_g, 1000);
    const sodium = item.sodium_mg === null || item.sodium_mg === undefined ? null : num(item.sodium_mg, 50000);
    if (sugar !== null) out.sugar = sugar;
    if (sodium !== null) out.sodium = sodium;
    // 찾은 곳 종류(공식/공공DB/블로그·앱/추정) — 기록 표시는 그대로 '추정'(AI가 찾은 값)
    if (['공식', '공공DB', '블로그·앱', '추정'].includes(item.source_type)) out.sourceType = item.source_type;
    // 이름은 공식 브랜드+메뉴명만, 양은 따로(괄호 없이)
    const noParen = text => String(text || '').replace(/\s*[([（［][^)\]）］]*[)\]）］]/g, ' ').replace(/[()[\]（）［］]/g, ' ').replace(/\s+/g, ' ').trim();
    const displayName = noParen(item.display_name).slice(0, 60);
    if (displayName) out.displayName = displayName;
    const serving = noParen(item.serving).split(/\s*[·,/]\s*/)[0].slice(0, 20);
    if (serving) out.serving = serving;
    const note = String(item.source_note || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (note) out.sourceNote = note;
    try { const u = new URL(String(item.source_url || '')); if (u.protocol === 'https:') out.sourceUrl = u.href.slice(0, 300); } catch { /* 없음 */ }
    return out;
  }

  class BridgeError extends Error {
    constructor(kind, message) { super(message || kind); this.kind = kind; }
  }

  function markOffline() { offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS; onlineAt = 0; }
  function isOffline() { return Date.now() < offlineUntil; }
  function resetOffline() { offlineUntil = 0; }

  /** 긴 요청 전 연결 확인(최근에 됐으면 건너뜀). 쉬는 중이면 네트워크 없이 바로 'unreachable' */
  async function ensureReachable() {
    if (isOffline()) throw new BridgeError('unreachable');
    if (Date.now() - onlineAt < ONLINE_TRUST_MS) return;
    try {
      await request('/health', { timeoutMs: CONNECT_TIMEOUT_MS, preflight: false });
    } catch (error) {
      if (error?.kind === 'unreachable' || error?.kind === 'timeout') { markOffline(); throw new BridgeError('unreachable'); }
      throw error;
    }
  }

  async function request(path, { method = 'GET', body, timeoutMs = TIMEOUT_MS, preflight = path !== '/health' } = {}) {
    const { url, token } = getConfig();
    if (!url) throw new BridgeError('not_configured');
    if (preflight) await ensureReachable();
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
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
      const kind = error?.name === 'AbortError' ? 'timeout' : 'unreachable';
      if (kind === 'unreachable') markOffline();
      throw new BridgeError(kind);
    } finally {
      if (timer) clearTimeout(timer);
    }
    onlineAt = Date.now();
    offlineUntil = 0;
    let data = null;
    try { data = await res.json(); } catch { /* 빈 응답 */ }
    if (res.status === 401) throw new BridgeError('unauthorized');
    if (res.status === 404) throw new BridgeError('not_found');
    if (res.status === 504) throw new BridgeError('timeout');
    if (!res.ok || !data?.ok) throw new BridgeError(res.status >= 500 ? 'agent_failed' : 'bad_request');
    return data;
  }

  async function checkHealth() { return request('/health', { timeoutMs: CONNECT_TIMEOUT_MS }); }

  /** 주소·토큰 확인: 'ok' | 'unauthorized' | 'unreachable' | 'timeout' | 'not_configured' | 'error'
   *  (빈 요청을 보내 토큰만 확인 — 토큰이 맞으면 브리지가 400(음식 없음)으로 답하고 AI는 부르지 않음) */
  async function checkConnection() {
    resetOffline();
    try {
      await checkHealth();
      await request('/log', { method: 'POST', body: { items: [] } });
      return 'ok';
    } catch (error) {
      const kind = error?.kind || 'error';
      return kind === 'bad_request' ? 'ok' : kind;
    }
  }

  /** 브리지 캐시에서 이 이름들 지우기(잘못 찾은 음식을 다음엔 새로 찾게). 실패해도 무시 */
  async function forget(names) {
    const clean = [...new Set((names || []).map(n => String(n || '').trim().slice(0, 80)).filter(Boolean))].slice(0, 8);
    if (!clean.length || !isConfigured()) return false;
    try { await request('/forget', { method: 'POST', body: { names: clean } }); return true; } catch { return false; }
  }

  /** 사진(JPEG base64, 2MB 이하) → 맥 미니가 음식 인식 + 영양 찾기 */
  async function lookupPhoto({ image, date, meal }) {
    if (typeof image !== 'string' || !image || image.length > 2900000) throw new BridgeError('bad_request');
    // 브리지에서 사진이 꺼져 있으면 403(photo_disabled) → bad_request 로 처리됨
    const data = await request('/photo', { method: 'POST', body: { image, date, meal } });
    return { items: Array.isArray(data.items) ? data.items : [], failed: Array.isArray(data.failed) ? data.failed : [] };
  }

  /** 한 번 묻기(오래 기다리지 않음): remoteId 가 있으면 결과만 받아오고, 없거나 사라졌으면 새로 맡김.
   *  반환: { items(찾은 것), failed(못 찾은 이름), pending(아직 찾는 이름), remoteId(pending 이 있을 때 작업 번호) } */
  async function lookup({ date, meal, items, remoteId }) {
    let data = null;
    if (JOB_ID_RE.test(String(remoteId || ''))) {
      try { data = await request(`/jobs/${remoteId}`, { timeoutMs: POLL_TIMEOUT_MS }); } catch (error) {
        if (error?.kind !== 'not_found') throw error; // 맥 미니가 다시 켜져 작업이 사라졌으면 새로 맡김(찾은 건 캐시에 남아 바로 옴)
      }
    }
    if (!data) {
      try { data = await request('/jobs', { method: 'POST', body: { date, meal, items }, timeoutMs: SUBMIT_TIMEOUT_MS }); } catch (error) {
        if (error?.kind !== 'not_found') throw error;
        data = await request('/log', { method: 'POST', body: { date, meal, items } }); // 예전 브리지
      }
    }
    const pending = Array.isArray(data.pending) ? data.pending.filter(name => typeof name === 'string') : [];
    return {
      items: Array.isArray(data.items) ? data.items : [],
      failed: Array.isArray(data.failed) ? data.failed : [],
      pending,
      remoteId: pending.length && JOB_ID_RE.test(String(data.job_id || '')) ? data.job_id : '',
    };
  }

  /** 바로 결과가 필요할 때(음식 찾기 'AI로 찾기'): 맡기고 짧게 여러 번 물어봄(긴 요청 하나로 기다리지 않음) */
  async function lookupAndWait(job, { maxMs = 100000, intervalMs = 2500 } = {}) {
    const end = Date.now() + maxMs;
    let result = await lookup(job);
    const items = [...result.items];
    while (result.pending.length && result.remoteId && Date.now() < end) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      result = await lookup({ ...job, remoteId: result.remoteId });
      result.items.forEach(item => { if (!items.some(seen => seen?.name === item?.name)) items.push(item); });
    }
    return { ...result, items, failed: [...result.failed, ...(Date.now() >= end ? result.pending : [])] };
  }

  const api = { normalizeUrl, normalizeToken, getConfig, setConfig, isConfigured, getQueue, enqueue, removeJob, setJobItems, setJobRemote, bumpAttempt, toFoodFields, checkHealth, checkConnection, lookup, lookupAndWait, lookupPhoto, forget, BridgeError, MAX_ATTEMPTS, isOffline, resetOffline, CONNECT_TIMEOUT_MS, OFFLINE_COOLDOWN_MS };
  global.RebuildersBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
