export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getOrCreateUserId(): string {
  const userIdKey = 'plant_exchange_user_id';
  let userId = getItem<string>(userIdKey);
  if (!userId) {
    userId = generateId();
    setItem(userIdKey, userId);
  }
  return userId;
}
