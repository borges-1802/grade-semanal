const MONTHS_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const RANGE_START = new Date(2026, 7, 10)
const RANGE_END = new Date(2026, 11, 19)

function mondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const start = `${monday.getDate()} ${MONTHS_ABBR[monday.getMonth()]}`
  const end = `${sunday.getDate()} ${MONTHS_ABBR[sunday.getMonth()]}`
  return `${start} – ${end}`
}

export type WeekOption = {
  key: string
  monday: Date
  label: string
  year: number
}

export function generateWeeks(): WeekOption[] {
  const weeks: WeekOption[] = []
  let cur = mondayOf(RANGE_START)
  while (cur <= RANGE_END) {
    weeks.push({
      key: cur.toISOString().slice(0, 10),
      monday: new Date(cur),
      label: formatWeekLabel(cur),
      year: cur.getFullYear(),
    })
    cur = new Date(cur)
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

export function currentWeekKey(weeks: WeekOption[]): string {
  const today = mondayOf(new Date())
  const match = weeks.find((w) => w.monday.getTime() === today.getTime())
  if (match) return match.key
  if (today < weeks[0].monday) return weeks[0].key
  return weeks[weeks.length - 1].key
}