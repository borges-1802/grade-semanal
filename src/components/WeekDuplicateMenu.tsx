import { useState } from 'react'
import type { WeekOption } from '../types.ts'

type WeekDuplicateMenuProps = {
  weeks: WeekOption[]
  currentWeekKey: string
  onDuplicate: (targetWeekKeys: string[]) => void
}

export default function WeekDuplicateMenu({ weeks, currentWeekKey, onDuplicate }: WeekDuplicateMenuProps) {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleConfirm() {
    onDuplicate(Array.from(checked))
    setChecked(new Set())
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border border-accent text-accent rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm cursor-pointer hover:bg-accent/10 shrink-0"
      >
        <span className="sm:hidden">Duplicar ⋯</span>
        <span className="hidden sm:inline">Duplicar semana ⋯</span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-surface border border-divider rounded-md p-2.5 z-30 text-left text-neutral-300 text-xs w-56 shadow-[0_6px_18px_rgba(0,0,0,.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-neutral-400">Duplicar esta semana para:</p>
          <div className="max-h-48 overflow-y-auto flex flex-col">
            {weeks
              .filter((w) => w.key !== currentWeekKey)
              .map((w) => (
                <label key={w.key} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-accent/10 cursor-pointer">
                  <input type="checkbox" checked={checked.has(w.key)} onChange={() => toggle(w.key)} />
                  {w.label} · {w.year}
                </label>
              ))}
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-divider">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-200 px-2 py-1 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={checked.size === 0}
              className="border border-accent text-accent rounded-md px-2.5 py-1 hover:bg-accent/10 disabled:opacity-40 cursor-pointer"
            >
              Duplicar ({checked.size})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}