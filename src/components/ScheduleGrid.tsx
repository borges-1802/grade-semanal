import { useState } from 'react'
import { HOUR_START, HOUR_END, TIME_SLOTS } from '../data/constants.ts'
import { getContrastText } from '../utils/color.ts'
import type { Activity } from '../types.ts'
import DayHeader from './DayHeader.tsx'

type ScheduleGridProps = {
  days: string[]
  hourOverrides: Record<number, string>
  activities: Activity[]
  onSlotClick: (day: number, slot: number) => void
  onActivityClick: (activity: Activity) => void
  onRenameDay: (dayIndex: number, name: string) => void
  onRenameHour: (hour: number, label: string) => void
  onDuplicateDay: (sourceDay: number, targetDays: number[]) => void
}

const HOUR_MARKS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)

export default function ScheduleGrid({
  days,
  hourOverrides,
  activities,
  onSlotClick,
  onActivityClick,
  onRenameDay,
  onRenameHour,
  onDuplicateDay,
}: ScheduleGridProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-divider">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `56px repeat(${days.length}, minmax(104px, 1fr))`,
          gridTemplateRows: `44px repeat(${TIME_SLOTS.length}, 24px)`,
        }}
      >
        <div className="bg-bg" style={{ gridColumn: 1, gridRow: 1 }} />

        {days.map((day, i) => (
          <div key={i} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <DayHeader
              name={day}
              allDays={days}
              dayIndex={i}
              onRename={(name) => onRenameDay(i, name)}
              onDuplicate={(targets) => onDuplicateDay(i, targets)}
            />
          </div>
        ))}

        {HOUR_MARKS.map((h, i) => (
          <HourLabel
            key={h}
            label={hourOverrides[h] ?? `${h}h`}
            onRename={(label) => onRenameHour(h, label)}
            style={{ gridColumn: 1, gridRow: `${i * 2 + 2} / span 2` }}
          />
        ))}

        {days.map((_, dayIndex) => (
          <DayColumn
            key={dayIndex}
            dayIndex={dayIndex}
            activities={activities.filter((a) => a.day === dayIndex)}
            onSlotClick={onSlotClick}
            onActivityClick={onActivityClick}
          />
        ))}
      </div>
    </div>
  )
}

function HourLabel({
  label,
  onRename,
  style,
}: {
  label: string
  onRename: (label: string) => void
  style: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) onRename(trimmed)
    else setDraft(label)
  }

  return (
    <div
      className="bg-bg text-neutral-400 text-[12px] font-normal flex items-start justify-center pt-1 border-t border-divider"
      style={style}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="w-10 bg-transparent border-b border-accent text-center outline-none text-[11px]"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="cursor-pointer hover:text-accent">
          {label}
        </button>
      )}
    </div>
  )
}

function DayColumn({
  dayIndex,
  activities,
  onSlotClick,
  onActivityClick,
}: {
  dayIndex: number
  activities: Activity[]
  onSlotClick: (day: number, slot: number) => void
  onActivityClick: (activity: Activity) => void
}) {
  const covered = new Set<number>()
  activities.forEach((a) => {
    for (let i = a.slot; i < a.slot + a.duration; i++) covered.add(i)
  })

  const column = dayIndex + 2

  return (
    <>
      {activities.map((a) => (
        <button
          key={a.id}
          onClick={() => onActivityClick(a)}
          className="text-[12px] font-semibold px-1.5 flex items-center justify-center text-center overflow-hidden cursor-pointer hover:brightness-110 rounded-sm m-px"
          style={{
            gridColumn: column,
            gridRow: `${a.slot + 2} / span ${a.duration}`,
            background: a.color,
            color: getContrastText(a.color),
          }}
        >
          {a.name}
        </button>
      ))}

      {TIME_SLOTS.map((_, i) => {
        if (covered.has(i)) return null
        const isFullHourBoundary = i % 2 === 1
        return (
          <button
            key={i}
            onClick={() => onSlotClick(dayIndex, i)}
            className={`border-l border-divider cursor-pointer hover:bg-accent/10 ${
              isFullHourBoundary ? 'border-b border-divider' : 'border-b border-dashed border-divider'
            }`}
            style={{ gridColumn: column, gridRow: i + 2 }}
          />
        )
      })}
    </>
  )
}