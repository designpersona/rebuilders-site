(function initNiliriStorage(global) {
  'use strict';

  const DEFAULT_DAY = Object.freeze({ breakfast: [], lunch: [], snack: [], dinner: [] });
  const DEFAULT_DB_VERSION = 1;

  const MIGRATIONS = {
    1(db, storeName) {
      if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
    },
  };

  function clone(value) {
    if (value === undefined) return undefined;
    if (typeof global.structuredClone === 'function') return global.structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function emptyDay() {
    return clone(DEFAULT_DAY);
  }

  /*
   * 장보기·창고 데이터(state.shopping). 예전 버전에는 이 키가 없었으므로 없으면 빈 목록으로 봅니다.
   * { items: [{ id, name, group, status, bought, note?, nameEn?, noteEn?, essential?, createdAt?, boughtAt? }],
   *   stock: [{ id, name, amount?, createdAt? }] }
   */
  const SHOPPING_GROUPS = Object.freeze(['priority', 'make', 'compare', 'hold']);
  let shoppingIdSequence = 0;

  function shoppingId(prefix = 's') {
    shoppingIdSequence += 1;
    return `${prefix}-${Date.now().toString(36)}-${shoppingIdSequence.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function normalizeShopping(value) {
    const src = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const text = (input, max = 200) => (typeof input === 'string' ? input.trim().slice(0, max) : '');
    const time = input => (typeof input === 'number' && Number.isFinite(input) ? input : undefined);
    const seen = new Set();
    const uniqueId = (input, prefix) => {
      let id = text(input, 100);
      if (!id || seen.has(id) || id === '__proto__') id = shoppingId(prefix);
      seen.add(id);
      return id;
    };
    const items = [];
    for (const item of Array.isArray(src.items) ? src.items : []) {
      if (!item || typeof item !== 'object' || !text(item.name)) continue;
      const out = {
        id: uniqueId(item.id, 'item'),
        name: text(item.name),
        group: SHOPPING_GROUPS.includes(item.group) ? item.group : 'priority',
        status: Number.isInteger(item.status) && item.status >= 0 && item.status < 10 ? item.status : 0,
        bought: item.bought === true,
      };
      for (const key of ['nameEn', 'note', 'noteEn']) if (text(item[key])) out[key] = text(item[key]);
      if (item.essential === true) out.essential = true;
      if (time(item.createdAt) !== undefined) out.createdAt = time(item.createdAt);
      if (out.bought && time(item.boughtAt) !== undefined) out.boughtAt = time(item.boughtAt);
      items.push(out);
    }
    const stock = [];
    for (const item of Array.isArray(src.stock) ? src.stock : []) {
      if (!item || typeof item !== 'object' || !text(item.name)) continue;
      const out = { id: uniqueId(item.id, 'stock'), name: text(item.name) };
      if (text(item.amount, 100)) out.amount = text(item.amount, 100);
      if (time(item.createdAt) !== undefined) out.createdAt = time(item.createdAt);
      stock.push(out);
    }
    return { items, stock };
  }

  class StorageRepository {
    async initialize() { throw new Error('StorageRepository.initialize() must be implemented'); }
    close() { throw new Error('StorageRepository.close() must be implemented'); }
    async getAll() { throw new Error('StorageRepository.getAll() must be implemented'); }
    async replaceAll(_data) { throw new Error('StorageRepository.replaceAll() must be implemented'); }
    async getDay(_dateKey) { throw new Error('StorageRepository.getDay() must be implemented'); }
    async saveDay(_dateKey, _day) { throw new Error('StorageRepository.saveDay() must be implemented'); }
    async getProfile() { throw new Error('StorageRepository.getProfile() must be implemented'); }
    async saveProfile(_profile) { throw new Error('StorageRepository.saveProfile() must be implemented'); }
    async getCustomFoods() { throw new Error('StorageRepository.getCustomFoods() must be implemented'); }
    async saveCustomFood(_name, _food, _previousName) { throw new Error('StorageRepository.saveCustomFood() must be implemented'); }
    async deleteCustomFood(_name) { throw new Error('StorageRepository.deleteCustomFood() must be implemented'); }
    async getRecentFoods() { throw new Error('StorageRepository.getRecentFoods() must be implemented'); }
    async saveRecentFood(_food) { throw new Error('StorageRepository.saveRecentFood() must be implemented'); }
    async saveDayAndRecent(_dateKey, _day, _food) { throw new Error('StorageRepository.saveDayAndRecent() must be implemented'); }
    async getShopping() { throw new Error('StorageRepository.getShopping() must be implemented'); }
    async saveShopping(_shopping) { throw new Error('StorageRepository.saveShopping() must be implemented'); }
    async resolveFood(_food, _options) { throw new DOMException('자동 영양 분석은 로컬 모드에서만 사용할 수 있습니다.', 'NotSupportedError'); }
  }

  class IndexedDbStorage extends StorageRepository {
    constructor(options = {}) {
      super();
      this.indexedDB = Object.prototype.hasOwnProperty.call(options, 'indexedDB')
        ? options.indexedDB
        : global.indexedDB;
      this.dbName = options.dbName || 'niliri-public-pwa';
      this.dbVersion = options.dbVersion || DEFAULT_DB_VERSION;
      this.storeName = options.storeName || 'app-data';
      this.recordKey = options.recordKey || 'state';
      this._dbPromise = null;
      this._writeQueue = Promise.resolve();
    }

    async initialize() {
      await this._open();
      return this;
    }

    close() {
      const openPromise = this._dbPromise;
      this._dbPromise = null;
      if (openPromise) openPromise.then(db => db.close()).catch(() => {});
    }

    _open() {
      if (this._dbPromise) return this._dbPromise;
      if (!this.indexedDB?.open) {
        return Promise.reject(new DOMException('IndexedDB를 사용할 수 없습니다.', 'NotSupportedError'));
      }

      const openPromise = new Promise((resolve, reject) => {
        let settled = false;
        let request;
        try {
          request = this.indexedDB.open(this.dbName, this.dbVersion);
        } catch (error) {
          reject(error);
          return;
        }

        request.onupgradeneeded = event => {
          const db = request.result;
          for (let version = event.oldVersion + 1; version <= event.newVersion; version += 1) {
            const migrate = MIGRATIONS[version];
            if (!migrate) throw new Error(`IndexedDB ${version} 마이그레이션이 없습니다.`);
            migrate(db, this.storeName, request.transaction);
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          if (settled) {
            db.close();
            return;
          }
          settled = true;
          db.onversionchange = () => {
            db.close();
            if (this._dbPromise === openPromise) this._dbPromise = null;
          };
          resolve(db);
        };
        request.onerror = () => {
          settled = true;
          reject(request.error || new Error('IndexedDB를 열지 못했습니다.'));
        };
        request.onblocked = () => {
          settled = true;
          reject(new DOMException('다른 탭이 IndexedDB 업데이트를 차단하고 있습니다.', 'InvalidStateError'));
        };
      });

      this._dbPromise = openPromise;
      openPromise.catch(() => {
        if (this._dbPromise === openPromise) this._dbPromise = null;
      });
      return openPromise;
    }

    async getAll() {
      await this._writeQueue;
      const db = await this._open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const request = tx.objectStore(this.storeName).get(this.recordKey);
        request.onsuccess = () => resolve(clone(request.result || {}));
        request.onerror = () => reject(request.error || new Error('데이터를 불러오지 못했습니다.'));
        tx.onabort = () => reject(tx.error || new Error('데이터 읽기가 중단됐습니다.'));
      });
    }

    async replaceAll(data) {
      return this._update(() => clone(data || {}));
    }

    _update(mutator) {
      const write = async () => {
        const db = await this._open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const request = store.get(this.recordKey);
          let nextState;

          request.onsuccess = () => {
            try {
              const current = clone(request.result || {});
              nextState = mutator(current);
              store.put(clone(nextState || {}), this.recordKey);
            } catch (error) {
              reject(error);
              tx.abort();
            }
          };
          request.onerror = () => reject(request.error || new Error('저장 전 데이터를 읽지 못했습니다.'));
          tx.oncomplete = () => resolve(clone(nextState || {}));
          tx.onerror = () => reject(tx.error || new Error('데이터를 저장하지 못했습니다.'));
          tx.onabort = () => reject(tx.error || new Error('데이터 저장이 중단됐습니다.'));
        });
      };

      const result = this._writeQueue.then(write, write);
      this._writeQueue = result.catch(() => {});
      return result;
    }

    async getDay(dateKey) {
      const all = await this.getAll();
      return clone(all[dateKey] || emptyDay());
    }

    async saveDay(dateKey, day) {
      const nextDay = {
        breakfast: clone(day?.breakfast || []),
        lunch: clone(day?.lunch || []),
        snack: clone(day?.snack || []),
        dinner: clone(day?.dinner || []),
      };
      if (Object.prototype.hasOwnProperty.call(day || {}, 'mealTimes')) {
        nextDay.mealTimes = clone(day.mealTimes || {});
      }
      await this._update(all => ({ ...all, [dateKey]: nextDay }));
      return clone(nextDay);
    }

    async getProfile() {
      return clone((await this.getAll()).settings || null);
    }

    async saveProfile(profile) {
      let saved;
      await this._update(all => {
        saved = { ...(all.settings || {}), ...clone(profile || {}) };
        return { ...all, settings: saved };
      });
      return clone(saved);
    }

    async getCustomFoods() {
      return clone((await this.getAll()).customFoods || {});
    }

    async saveCustomFood(name, food, previousName = null) {
      let saved;
      await this._update(all => {
        saved = { ...(all.customFoods || {}) };
        if (previousName && previousName !== name) delete saved[previousName];
        saved[name] = clone(food);
        return { ...all, customFoods: saved };
      });
      return clone(saved);
    }

    async deleteCustomFood(name) {
      let saved;
      await this._update(all => {
        saved = { ...(all.customFoods || {}) };
        delete saved[name];
        return { ...all, customFoods: saved };
      });
      return clone(saved);
    }

    async getRecentFoods() {
      return clone((await this.getAll()).recentFoods || []);
    }

    async saveRecentFood(food) {
      const nextFood = clone(food);
      let saved;
      await this._update(all => {
        const recent = (all.recentFoods || []).filter(item => item.name !== nextFood.name);
        saved = [nextFood, ...recent].slice(0, 12);
        return { ...all, recentFoods: saved };
      });
      return clone(saved);
    }

    async saveDayAndRecent(dateKey, day, food) {
      const nextDay = {
        breakfast: clone(day?.breakfast || []),
        lunch: clone(day?.lunch || []),
        snack: clone(day?.snack || []),
        dinner: clone(day?.dinner || []),
      };
      if (Object.prototype.hasOwnProperty.call(day || {}, 'mealTimes')) {
        nextDay.mealTimes = clone(day.mealTimes || {});
      }
      const nextFood = clone(food);
      let recentFoods;
      await this._update(all => {
        const recent = (all.recentFoods || []).filter(item => item.name !== nextFood.name);
        recentFoods = [nextFood, ...recent].slice(0, 12);
        return { ...all, [dateKey]: nextDay, recentFoods };
      });
      return { day: clone(nextDay), recentFoods: clone(recentFoods) };
    }

    async getShopping() {
      return normalizeShopping((await this.getAll()).shopping);
    }

    async saveShopping(shopping) {
      const saved = normalizeShopping(shopping);
      await this._update(all => ({ ...all, shopping: saved }));
      return clone(saved);
    }

    async resolveFood(_food, _options = {}) {
      throw new DOMException('자동 영양 분석은 로컬 모드에서만 사용할 수 있습니다.', 'NotSupportedError');
    }
  }

  class LocalApiStorage extends StorageRepository {
    constructor(options = {}) {
      super();
      this.baseUrl = options.baseUrl || '';
      this.fetchImpl = options.fetchImpl || global.fetch?.bind(global);
      this._initialized = false;
    }

    async initialize() {
      if (!this.fetchImpl) throw new DOMException('로컬 API를 사용할 수 없습니다.', 'NotSupportedError');
      await this._request('/api/agent/health');
      this._initialized = true;
      return this;
    }

    close() { this._initialized = false; }

    async _request(path, options = {}) {
      let response;
      try {
        response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          ...options,
          headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
        });
      } catch (error) {
        const wrapped = new Error('로컬 서버에 연결하지 못했습니다.');
        wrapped.name = 'LocalApiUnavailableError';
        wrapped.cause = error;
        throw wrapped;
      }
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(body.error || '로컬 서버 요청이 실패했습니다.');
        error.name = body.code || 'LocalApiError';
        error.status = response.status;
        throw error;
      }
      return body;
    }

    async getAll() {
      return (await this._request('/api/data')).data || {};
    }

    async replaceAll(data) {
      await this._request('/api/data', { method: 'PUT', body: JSON.stringify(data || {}) });
      return clone(data || {});
    }

    async getDay(dateKey) {
      return (await this._request(`/api/day?date=${encodeURIComponent(dateKey)}`)).day || emptyDay();
    }

    async saveDay(dateKey, day) {
      const nextDay = { breakfast: clone(day?.breakfast || []), lunch: clone(day?.lunch || []), snack: clone(day?.snack || []), dinner: clone(day?.dinner || []) };
      if (Object.prototype.hasOwnProperty.call(day || {}, 'mealTimes')) nextDay.mealTimes = clone(day.mealTimes || {});
      const result = await this._request(`/api/day/${encodeURIComponent(dateKey)}`, { method: 'PUT', body: JSON.stringify({ day: nextDay }) });
      return clone(result.day || nextDay);
    }

    async getProfile() { return (await this.getAll()).settings || null; }
    async saveProfile(profile) {
      const all = await this.getAll();
      all.settings = { ...(all.settings || {}), ...clone(profile || {}) };
      await this.replaceAll(all);
      return clone(all.settings);
    }
    async getCustomFoods() { return (await this.getAll()).customFoods || {}; }
    async saveCustomFood(name, food, previousName = null) {
      const all = await this.getAll();
      all.customFoods = { ...(all.customFoods || {}) };
      if (previousName && previousName !== name) delete all.customFoods[previousName];
      all.customFoods[name] = clone(food);
      await this.replaceAll(all);
      return clone(all.customFoods);
    }
    async deleteCustomFood(name) {
      const all = await this.getAll();
      all.customFoods = { ...(all.customFoods || {}) };
      delete all.customFoods[name];
      await this.replaceAll(all);
      return clone(all.customFoods);
    }
    async getRecentFoods() { return (await this.getAll()).recentFoods || []; }
    async saveRecentFood(food) {
      const all = await this.getAll();
      all.recentFoods = [clone(food), ...(all.recentFoods || []).filter(item => item.name !== food.name)].slice(0, 12);
      await this.replaceAll(all);
      return clone(all.recentFoods);
    }
    async saveDayAndRecent(dateKey, day, food) {
      const savedDay = await this.saveDay(dateKey, day);
      const recentFoods = await this.saveRecentFood(food);
      return { day: savedDay, recentFoods };
    }
    async getShopping() { return normalizeShopping((await this.getAll()).shopping); }
    async saveShopping(shopping) {
      const all = await this.getAll();
      all.shopping = normalizeShopping(shopping);
      await this.replaceAll(all);
      return clone(all.shopping);
    }
    async resolveFood(food, options = {}) {
      const result = await this._request('/api/resolve', {
        method: 'POST',
        body: JSON.stringify({ ...clone(food || {}), register: Boolean(options.register) }),
      });
      return { food: clone(result.food), discovered: Boolean(result.discovered) };
    }
  }

  /*
   * 저장소 교체 지점.
   * 앱은 StorageRepository 인터페이스(위 메서드들)에만 의존합니다. 이후 Capacitor SQLite 로
   * 옮길 때는 StorageRepository 를 구현한 클래스(예: SqliteStorage)를 만들고
   * registerRepository('sqlite', options => new SqliteStorage(options)) 로 등록한 뒤
   * createRepository('sqlite') 를 쓰면 됩니다. 이번 버전은 IndexedDB 를 그대로 씁니다.
   * 데이터 형태는 getAll()/replaceAll() 이 주고받는 단일 상태 객체이며 백업 파일(backup.js)도
   * 같은 형태를 쓰므로, 저장소를 바꿔도 백업 파일은 호환됩니다.
   */
  const REPOSITORY_FACTORIES = {
    indexeddb: options => new IndexedDbStorage(options),
    localapi: options => new LocalApiStorage(options),
  };

  function registerRepository(kind, factory) {
    if (typeof factory !== 'function') throw new TypeError('factory must be a function');
    REPOSITORY_FACTORIES[kind] = factory;
  }

  function createRepository(kind = 'indexeddb', options = {}) {
    const factory = REPOSITORY_FACTORIES[kind];
    if (!factory) throw new Error(`알 수 없는 저장소 종류: ${kind}`);
    return factory(options);
  }

  /** 브라우저가 저장 공간을 임의로 지우지 않도록 요청합니다. 실패해도 앱은 계속 동작합니다. */
  async function requestPersistentStorage() {
    try {
      const storage = global.navigator?.storage;
      if (!storage?.persist) return { supported: false, persisted: false };
      if (storage.persisted && await storage.persisted()) return { supported: true, persisted: true };
      return { supported: true, persisted: Boolean(await storage.persist()) };
    } catch (error) {
      return { supported: true, persisted: false, error };
    }
  }

  global.NiliriStorage = {
    StorageRepository, IndexedDbStorage, LocalApiStorage, emptyDay, MIGRATIONS,
    SHOPPING_GROUPS, normalizeShopping, shoppingId,
    registerRepository, createRepository, requestPersistentStorage,
  };
})(globalThis);
