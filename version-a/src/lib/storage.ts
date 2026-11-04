/**
 * localStorage access that never throws: it can be unavailable (SSR), blocked (privacy settings,
 * sandboxed iframes), full (QuotaExceededError) or disabled (some private modes).
 * Callers get `null` / `false` and keep working in memory.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
