/** Small wrappers around localStorage that never throw (private windows, blocked storage). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`solsurvivor.${key}`)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(`solsurvivor.${key}`, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the game still works, it just forgets.
  }
}

export function drop(key: string) {
  try {
    localStorage.removeItem(`solsurvivor.${key}`)
  } catch {
    // ignore
  }
}
