export type Activity = {
  id: string
  day: number
  slot: number
  duration: number
  name: string
  color: string
}

export type ColorOption = {
  name: string
  value: string
}

export type WeekOption = {
  key: string
  monday: Date
  label: string
  year: number
}