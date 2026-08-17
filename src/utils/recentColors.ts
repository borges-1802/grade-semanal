const STORAGE_KEY = 'grade-recent-colors'
const MAX_RECENT = 8

export function getRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentColor(color: string): string[] {
  const withoutDuplicate = getRecentColors().filter((c) => c !== color)
  const next = [color, ...withoutDuplicate].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}