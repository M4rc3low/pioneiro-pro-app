const CURRENT_USER_KEY = 'pioneiropro_current_user';

function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  if (saved) return JSON.parse(saved);

  const user = {
    id: 'local-user',
    email: 'local@pioneiropro.app',
    full_name: 'Pioneiro Pro',
    role: 'admin',
    created_date: new Date().toISOString()
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * @param {string} entityName
 * @returns {string}
 */
function getCollectionKey(entityName) {
  return `pioneiropro_${entityName}`;
}



/**
 * @param {string} entityName
 * @returns {any[]}
 */
function readCollection(entityName) {
  const raw = localStorage.getItem(getCollectionKey(entityName));
  return raw ? JSON.parse(raw) : [];
}

/**
 * @param {string} entityName
 * @param {any[]} data
 */
function writeCollection(entityName, data) {
  localStorage.setItem(getCollectionKey(entityName), JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(`pioneiropro:${entityName}:changed`));
}

/**
 * @param {any[]} items
 * @param {string} sortBy
 * @returns {any[]}
 */
function sortItems(items, sortBy) {
  if (!sortBy) return items;

  const desc = sortBy.startsWith('-');
  const field = desc ? sortBy.slice(1) : sortBy;

  return [...items].sort((a, b) => {
    const av = a?.[field] || '';
    const bv = b?.[field] || '';
    return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
  });
}

/**
 * @param {any} item
 * @param {object} filters
 * @returns {boolean}
 */
function matchesFilter(item, filters = {}) {
  return Object.entries(filters).every(([key, value]) => item?.[key] === value);
}

/**
 * @param {string} entityName
 * @returns {object}
 */
function createEntityApi(entityName) {
  return {
    async list(sortBy = '', limit = undefined) {
      const items = sortItems(readCollection(entityName), sortBy);
      return typeof limit === 'number' ? items.slice(0, limit) : items;
    },

    async filter(filters = {}, sortBy = '', limit = undefined) {
      const items = readCollection(entityName).filter(item => matchesFilter(item, filters));
      const sorted = sortItems(items, sortBy);
      return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
    },

    /**
 * @param {Record<string, any>} data
 * @returns {Promise<Record<string, any>>}
 */
async create(data = {}) {
  const user = getCurrentUser();
  const items = readCollection(entityName);

  const item = {
    id: crypto.randomUUID(),
    created_by: data.created_by || user.email,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...data
  };

  items.push(item);
  writeCollection(entityName, items);
  return item;
},

    /**
 * @param {string} id
 * @param {Record<string, any>} data
 * @returns {Promise<Record<string, any>>}
 */
/**
 * @param {string} id
 * @param {Record<string, any>} data
 * @returns {Promise<Record<string, any> | null>}
 */
async update(id, data = {}) {
  const items = readCollection(entityName);
  const updated = items.map(item =>
    item.id === id ? { ...item, ...data, updated_date: new Date().toISOString() } : item
  );

  writeCollection(entityName, updated);
  return updated.find(item => item.id === id) || null;
},

    async delete(id) {
      writeCollection(entityName, readCollection(entityName).filter(item => item.id !== id));
      return true;
    },

    /**
     * @param {Function} callback
     * @returns {Function}
     */
    subscribe(callback) {
      const handler = () => callback();
      window.addEventListener(`pioneiropro:${entityName}:changed`, handler);
      return () => window.removeEventListener(`pioneiropro:${entityName}:changed`, handler);
    }
  };
}

const entitiesProxy = new Proxy({}, {
  get(_target, entityName) {
    return createEntityApi(String(entityName));
  }
});

export const pioneiroApi = {
  auth: {
    async me() {
      return getCurrentUser();
    },
    logout() {
      localStorage.removeItem(CURRENT_USER_KEY);
    },
    redirectToLogin() {
      return getCurrentUser();
    }
  },
  entities: entitiesProxy
};
