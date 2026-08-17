import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, ALLOWED_EMAILS, DISPLAY_NAMES } from './firebase.ts'
import ScheduleGrid from './components/ScheduleGrid.tsx'
import ActivityModal from './components/ActivityModal.tsx'
import LoginScreen from './components/LoginScreen.tsx'
import WeekDuplicateMenu from './components/WeekDuplicateMenu.tsx'
import { DEFAULT_DAYS } from './data/constants.ts'
import { generateWeeks, currentWeekKey, type WeekOption } from './data/weeks.ts'
import type { Activity } from './types.ts'

const WEEKS: WeekOption[] = generateWeeks()

const WEEK_KEY_STORAGE = 'grade-last-week'

function getCachedWeekKey(): string {
  const saved = localStorage.getItem(WEEK_KEY_STORAGE)
  const isValid = saved && WEEKS.some((w) => w.key === saved)
  return isValid ? saved : currentWeekKey(WEEKS)
}

type DocData = {
  days: string[]
  hourOverrides: Record<string, string>
  activitiesByWeek: Record<string, Activity[]>
}

const DEFAULT_DOC: DocData = {
  days: DEFAULT_DAYS,
  hourOverrides: {},
  activitiesByWeek: {},
}

type ModalState = { day: number; slot: number; existing?: Activity } | null

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [docData, setDocData] = useState<DocData>(DEFAULT_DOC)
  const [weekKey, setWeekKey] = useState<string>(getCachedWeekKey)
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    localStorage.setItem(WEEK_KEY_STORAGE, weekKey)
  }, [weekKey])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !ALLOWED_EMAILS.includes(firebaseUser.email ?? '')) {
        signOut(auth)
        setUser(null)
        setAuthLoading(false)
        return
      }
      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) {
      setDocData(DEFAULT_DOC)
      return
    }
    const ref = doc(db, 'schedules', user.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setDocData(DEFAULT_DOC)
        return
      }
      const data = snap.data()
      setDocData({
        days: data.days ?? DEFAULT_DAYS,
        hourOverrides: data.hourOverrides ?? {},
        activitiesByWeek: data.activitiesByWeek ?? {},
      })
    })
    return unsubscribe
  }, [user])

  async function persist(next: DocData) {
    setDocData(next)
    if (!user) return
    const ref = doc(db, 'schedules', user.uid)
    await setDoc(ref, next, { merge: false })
  }

  const activities = docData.activitiesByWeek[weekKey] || []
  const hourOverridesAsNumberKeys: Record<number, string> = Object.fromEntries(
    Object.entries(docData.hourOverrides).map(([k, v]) => [Number(k), v])
  )

  function handleLogout() {
    signOut(auth)
    setModal(null)
  }

  function setActivitiesForWeek(nextActivities: Activity[]) {
    persist({ ...docData, activitiesByWeek: { ...docData.activitiesByWeek, [weekKey]: nextActivities } })
  }

  function handleSaveActivity(data: { name: string; color: string; duration: number }) {
    if (!modal) return
    if (modal.existing) {
      setActivitiesForWeek(
        activities.map((a) => (a.id === modal.existing!.id ? { ...a, ...data } : a))
      )
    } else {
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        day: modal.day,
        slot: modal.slot,
        ...data,
      }
      setActivitiesForWeek([...activities, newActivity])
    }
    setModal(null)
  }

  function handleDeleteActivity() {
    if (!modal?.existing) return
    setActivitiesForWeek(activities.filter((a) => a.id !== modal.existing!.id))
    setModal(null)
  }

  function handleRenameDay(dayIndex: number, name: string) {
    const nextDays = [...docData.days]
    nextDays[dayIndex] = name
    persist({ ...docData, days: nextDays })
  }

  function handleRenameHour(hour: number, label: string) {
    persist({ ...docData, hourOverrides: { ...docData.hourOverrides, [hour]: label } })
  }

  function handleDuplicateDay(sourceDay: number, targetDays: number[]) {
    const sourceActivities = activities.filter((a) => a.day === sourceDay)
    const withoutTargets = activities.filter((a) => !targetDays.includes(a.day))
    const duplicated = targetDays.flatMap((targetDay) =>
      sourceActivities.map((a) => ({ ...a, id: crypto.randomUUID(), day: targetDay }))
    )
    setActivitiesForWeek([...withoutTargets, ...duplicated])
  }

  function handleDuplicateWeek(targetWeekKeys: string[]) {
    const nextActivitiesByWeek = { ...docData.activitiesByWeek }
    targetWeekKeys.forEach((wk) => {
      nextActivitiesByWeek[wk] = activities.map((a) => ({ ...a, id: crypto.randomUUID() }))
    })
    persist({ ...docData, activitiesByWeek: nextActivitiesByWeek })
  }

  function goToWeek(offset: number) {
    const idx = WEEKS.findIndex((w) => w.key === weekKey)
    const nextIdx = Math.min(Math.max(idx + offset, 0), WEEKS.length - 1)
    setWeekKey(WEEKS[nextIdx].key)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-neutral-400">Carregando…</div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  const displayName = (user.email && DISPLAY_NAMES[user.email]) || user.displayName || user.email?.split('@')[0] || ''

  const navButtonClass = 'border border-accent text-accent rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm cursor-pointer hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed shrink-0'

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-350 mx-auto px-3 sm:px-4 pt-6 pb-16">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h1 className="text-[22px] font-medium m-0">Grade Semanal</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-400">Olá, {displayName}</span>
            <button
              onClick={handleLogout}
              className="text-accent hover:bg-accent/10 rounded-md px-3 py-1.5 text-sm cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
          <button onClick={() => goToWeek(-1)} disabled={weekKey === WEEKS[0].key} className={navButtonClass}>
            <span className="sm:hidden">‹</span>
            <span className="hidden sm:inline">‹ Semana anterior</span>
          </button>

          <select
            value={weekKey}
            onChange={(e) => setWeekKey(e.target.value)}
            className="border border-accent text-accent bg-transparent rounded-md px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm cursor-pointer shrink-0"
          >
            {WEEKS.map((w) => (
              <option key={w.key} value={w.key} className="bg-surface text-text">
                {w.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => goToWeek(1)}
            disabled={weekKey === WEEKS[WEEKS.length - 1].key}
            className={navButtonClass}
          >
            <span className="sm:hidden">›</span>
            <span className="hidden sm:inline">Próxima semana ›</span>
          </button>
          <WeekDuplicateMenu weeks={WEEKS} currentWeekKey={weekKey} onDuplicate={handleDuplicateWeek} />
        </div>

        <ScheduleGrid
          days={docData.days}
          hourOverrides={hourOverridesAsNumberKeys}
          activities={activities}
          onSlotClick={(day, slot) => setModal({ day, slot })}
          onActivityClick={(activity) => setModal({ day: activity.day, slot: activity.slot, existing: activity })}
          onRenameDay={handleRenameDay}
          onRenameHour={handleRenameHour}
          onDuplicateDay={handleDuplicateDay}
        />

        {modal && (
          <ActivityModal
            dayName={docData.days[modal.day]}
            slot={modal.slot}
            existing={modal.existing}
            onSave={handleSaveActivity}
            onDelete={modal.existing ? handleDeleteActivity : undefined}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  )
}