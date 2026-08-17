import type { ColorOption } from '../types.ts'

export const DEFAULT_DAYS: string[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export const HOUR_START = 6
export const HOUR_END = 22

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    slots.push(`${h}:00`)
    slots.push(`${h}:30`)
  }
  return slots
})()

export const COLOR_PALETTE: ColorOption[] = [
  { name: 'Rosa', value: '#e6a8d7' },
  { name: 'Verde', value: '#8fbc6f' },
  { name: 'Laranja', value: '#e69a3a' },
  { name: 'Vinho', value: '#5c0d0d' },
  { name: 'Roxo', value: '#9184d9' },
  { name: 'Azul', value: '#4a7fb5' },
]

export type DurationOption = {
  label: string
  slots: number
}

export const DURATIONS: DurationOption[] = [
  { label: '30 min', slots: 1 },
  { label: '1h', slots: 2 },
  { label: '1h30', slots: 3 },
  { label: '2h', slots: 4 },
  { label: '3h', slots: 6 },
]