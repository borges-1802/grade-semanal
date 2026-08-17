import { useState } from 'react'
import { COLOR_PALETTE, DURATIONS, TIME_SLOTS } from '../data/constants.ts'
import type { Activity } from '../types.ts'

type ActivityModalProps = {
  dayName: string
  slot: number
  existing?: Activity
  recentColors: string[]
  onSave: (data: { name: string; color: string; duration: number }) => void
  onDelete?: () => void
  onClose: () => void
}

export default function ActivityModal({
  dayName,
  slot,
  existing,
  recentColors,
  onSave,
  onDelete,
  onClose,
}: ActivityModalProps) {
  const [name, setName] = useState(existing?.name || '')
  const [color, setColor] = useState(existing?.color || COLOR_PALETTE[0].value)
  const [duration, setDuration] = useState(existing?.duration || DURATIONS[1].slots)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color, duration })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <form
        className="bg-surface border border-divider rounded-lg p-5 w-80 flex flex-col gap-1.5 shadow-[0_16px_40px_rgba(0,0,0,.65)]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-medium m-0 text-text">{existing ? 'Editar atividade' : 'Nova atividade'}</h2>
        <p className="text-sm text-neutral-400 m-0 mb-2">
          {dayName}, {TIME_SLOTS[slot]}
        </p>

        <label className="text-xs text-neutral-400">Atividade</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Cálculo 1"
          className="bg-bg border border-divider text-text rounded-md px-2.5 py-2 text-sm outline-none focus:border-accent"
        />

        <div className="flex gap-3 mt-2">
          <div className="flex-1">
            <label className="text-xs text-neutral-400 block mb-1">Cor</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-9 bg-bg border border-divider rounded-md cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-neutral-400 block mb-1">Duração</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-9 bg-bg border border-divider text-text rounded-md px-2 text-sm cursor-pointer outline-none focus:border-accent"
            >
              {DURATIONS.map((d) => (
                <option key={d.slots} value={d.slots}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {recentColors.length > 0 && (
          <div className="mt-2">
            <label className="text-xs text-neutral-400 block mb-1">Usadas recentemente</label>
            <div className="flex flex-wrap gap-1.5">
              {recentColors.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`w-5 h-5 rounded-full border-2 cursor-pointer ${
                    color === value ? 'border-accent' : 'border-transparent'
                  }`}
                  style={{ background: value }}
                  onClick={() => setColor(value)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-2">
          <label className="text-xs text-neutral-400 block mb-1">Paleta</label>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                type="button"
                key={c.value}
                className={`w-5 h-5 rounded-full border-2 cursor-pointer ${
                  color === c.value ? 'border-accent' : 'border-transparent'
                }`}
                style={{ background: c.value }}
                title={c.name}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {existing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-neutral-400 hover:text-red-400 rounded-md px-3.5 py-2 text-[13px] cursor-pointer"
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-accent hover:bg-accent/10 rounded-md px-3.5 py-2 text-[13px] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="border border-accent text-accent rounded-md px-3.5 py-2 text-[13px] cursor-pointer hover:bg-accent/10"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}