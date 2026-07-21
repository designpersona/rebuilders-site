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
    async resolveFood(food, options = {}) {
      const result = await this._request('/api/resolve', {
        method: 'POST',
        body: JSON.stringify({ ...clone(food || {}), register: Boolean(options.register) }),
      });
      return { food: clone(result.food), discovered: Boolean(result.discovered) };
    }
  }

  global.NiliriStorage = { StorageRepository, IndexedDbStorage, LocalApiStorage, emptyDay, MIGRATIONS };
})(globalThis);
