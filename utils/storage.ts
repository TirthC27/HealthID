export function save(key: string, value: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  }
  return fallback;
}

export function pushItem(key: string, item: any) {
  const arr = load<any[]>(key, []);
  arr.push(item);
  save(key, arr);
}

export function updateItem<T extends { id: string }>(key: string, itemId: string, updates: Partial<T>) {
  const arr = load<T[]>(key, []);
  const index = arr.findIndex(item => item.id === itemId);
  if (index !== -1) {
    arr[index] = { ...arr[index], ...updates };
    save(key, arr);
  }
}

export function removeItem(key: string, itemId: string) {
  const arr = load<any[]>(key, []);
  const filtered = arr.filter(item => item.id !== itemId);
  save(key, filtered);
}

export function findItem<T extends { id: string }>(key: string, itemId: string): T | null {
  const arr = load<T[]>(key, []);
  return arr.find(item => item.id === itemId) || null;
}

export function findItemBy<T>(key: string, predicate: (item: T) => boolean): T | null {
  const arr = load<T[]>(key, []);
  return arr.find(predicate) || null;
}

export function filterItems<T>(key: string, predicate: (item: T) => boolean): T[] {
  const arr = load<T[]>(key, []);
  return arr.filter(predicate);
}
