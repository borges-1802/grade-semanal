import { useState } from 'react'

type DayHeaderProps = {
  name: string
  allDays: string[]
  dayIndex: number
  onRename: (newName: string) => void
  onDuplicate: (targetIndexes: number[]) => void
}

export default function DayHeader({ name, allDays, dayIndex, onRename, onDuplicate }: DayHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [menuOpen, setMenuOpen] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function commitRename() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    else setDraft(name)
  }

  function toggleChecked(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function handleDuplicate() {
    onDuplicate(Array.from(checked))
    setChecked(new Set())
    setMenuOpen(false)
  }

  return (
    <div className="relative flex items-center justify-between gap-1 p-1.5 border-l border-divider bg-surface text-text text-sm font-medium text-center">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setDraft(name)
              setEditing(false)
            }
          }}
          className="w-full bg-transparent border-b border-accent text-center outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="cursor-pointer hover:text-accent">
          {name}
        </button>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="text-xs text-neutral-500 hover:text-accent cursor-pointer"
      >
        ...
      </button>

      {menuOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-surface border border-divider rounded-md p-2.5 z-20 text-left text-neutral-300 text-xs w-44 normal-case font-normal shadow-[0_6px_18px_rgba(0,0,0,.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-neutral-400">Duplicar {name} para:</p>
          {allDays.map(
            (d, i) =>
              i !== dayIndex && (
                <label key={d} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-accent/10 cursor-pointer">
                  <input type="checkbox" checked={checked.has(i)} onChange={() => toggleChecked(i)} />
                  {d}
                </label>
              )
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-neutral-400 hover:text-neutral-200 px-2 py-1 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={checked.size === 0}
              className="border border-accent text-accent rounded-md px-2.5 py-1 hover:bg-accent/10 disabled:opacity-40 cursor-pointer"
            >
              Duplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}