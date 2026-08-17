# Handoff: Grade Semanal (weekly schedule builder)

## Overview
A weekly-schedule builder. Each user picks a week (from a fixed semester range) and fills a Mon–Sun grid, 6:00–22:00 in 30-min slots, with named/colored activity blocks. Includes a placeholder login, day/hour renaming, day duplication, and a light/dark toggle.

## About the design files
The bundled file (`Grade Semanal.dc.html`) is a **design reference** — an interactive HTML prototype showing the intended look and behavior, not production code to copy directly. The task is to recreate this in your existing React + TypeScript + Tailwind codebase, using Tailwind utilities (or a small `tailwind.config` theme extension for the color tokens below) instead of the inline styles used in the prototype.

## Fidelity
**High-fidelity.** Colors, spacing, type and interactions below are final — implement pixel-close using Tailwind.

## Design tokens (Nocturne design system)
Dark ground, one accent, Inter typeface. Suggest adding to `tailwind.config.js` under `theme.extend.colors`:

```js
colors: {
  bg: '#161826',
  surface: '#232532',
  text: '#e9e9ed',
  accent: {
    DEFAULT: '#9184d9',
    100: '#f5f4ff', 200: '#e7e5fe', 300: '#d2cefd', 400: '#b5abfc',
    500: '#968ae0', 600: '#796cbf', 700: '#5d5294', 800: '#423a6a', 900: '#2b2741',
  },
  neutral: {
    100: '#f3f5fe', 200: '#e4e7f5', 300: '#cfd3e5', 400: '#b2b6ca', 500: '#9397ab',
    600: '#75798c', 700: '#595d6c', 800: '#3f424d', 900: '#292b31',
  },
  divider: 'rgba(233,233,237,0.16)',
}
```

- Font: Inter (headings weight 500, body 400). Load via `next/font` or a Google Fonts `<link>`.
- Radius: sm 4px, md 8px, lg 14px.
- Spacing scale (0.70× density): 2.8 / 5.6 / 8.4 / 11.2 / 16.8 / 22.4 px — or just use Tailwind's default scale, it's close enough.
- Shadows: sm `0 0 0 1px #3f424d`; md adds `0 6px 18px rgba(0,0,0,.55)`; lg uses a lighter ring + `0 16px 40px rgba(0,0,0,.65)`.
- Buttons are **outlined**, never solid-filled (accent border, transparent background, accent text). Ghost buttons: accent text, no border, tinted hover.
- Light mode: swap `bg`→`#f3f5fe`, `surface`→`#ffffff`, `text`→`#292b31`, keep the same accent.

## Suggested component structure
- `types.ts` — `Activity { id, day: 0-6, slot: 0-33, duration: number, name: string, color: string }`, `Week { key: string, start: Date, end: Date }`, `User { name: string }`
- `useSchedule.ts` — hook owning: user, theme, days[] (names), hourOverrides, activitiesByWeek (Record<weekKey, Activity[]>), weekIndex, modal state. Persist to `localStorage` for now; swap for your backend/API later (see State management below).
- `LoginScreen.tsx` — name input, "Entrar" button.
- `GradeSemanal.tsx` — page shell: nav bar (brand, user name, theme toggle, logout) + `WeekNav` + `ScheduleGrid` + `ActivityModal`.
- `WeekNav.tsx` — prev/next buttons (disabled at range bounds) + a `<select>` of all weeks, label `"10 ago – 16 ago"`.
- `DayHeader.tsx` — editable day name (click → input, blur/Enter saves) + "⋯" menu → checklist of other days → "Duplicar" copies that day's activities into the checked days for the current week.
- `ScheduleGrid.tsx` — CSS grid, columns `72px repeat(7, 1fr)`, `grid-auto-rows: 24px`, 34 rows (30-min slots, 6:00–22:00). Renders: hour labels (left column, editable, each spans 2 rows), empty clickable slot cells (click → open "add" modal at that day/slot), and `ActivityBlock`s positioned via `grid-column`/`grid-row: start / span duration`.
- `ActivityBlock.tsx` — colored block, background = activity color, text color computed for contrast (luminance check: light bg → dark text, else light text). Click → open "edit" modal.
- `ActivityModal.tsx` — dialog with name text field, color picker (native `<input type="color">`), duration `<select>` (30min/1h/1h30/2h/3h → 1/2/3/4/6 slots). Edit mode adds a "Excluir" button.

## Interactions & behavior
- **Login**: type a name, Enter or click "Entrar" logs in (no real auth — see State management).
- **Add activity**: click any empty grid cell → modal opens pre-filled with that day/time; fill name + pick color + duration → Salvar appends a block spanning `duration` slots from the clicked slot.
- **Edit/delete**: click an existing block → same modal, pre-filled, plus "Excluir".
- **Rename day**: click the day name text → becomes a text input → save on blur or Enter.
- **Rename hour label**: same pattern on the left-column hour labels.
- **Duplicate day**: "⋯" on a day header opens a small popover listing the other 6 days as checkboxes; "Duplicar" copies the source day's activities (for the *current week only*) into every checked day, replacing what was there.
- **Theme toggle**: swaps the color tokens (bg/surface/text/divider) between the dark and light values above; button label reflects the *target* mode ("Modo claro" while dark, "Modo escuro" while light).
- **Week navigation**: fixed range of Mondays from **10/08/2026** to the week containing **19/12/2026** (~19 weeks). Prev/next step one week; the dropdown jumps directly. Each week keeps its own activities, keyed by the week's Monday date (ISO `yyyy-mm-dd`).
- No drag/resize of blocks in the prototype — duration is chosen in the modal, not by dragging edges. Worth asking the user if that's wanted later.

## State management
Prototype state (all client-side, no backend):
- `user: { name } | null`
- `theme: 'dark' | 'light'`
- `days: string[7]` — display names, defaults Segunda…Domingo
- `hourOverrides: Record<hour, string>` — custom labels for 6..22
- `activitiesByWeek: Record<weekKey, Activity[]>`
- `weekIndex: number`
- `modal: null | { isEdit, id?, day, slot, name, color, duration }`

Persisted today via `localStorage` (key `grade_semanal_v1`). The user wants real login + cloud sync — that needs an actual backend (e.g. your existing auth + a `schedules` table keyed by `userId` + `weekKey`). Recommend: keep the same shape, replace the `localStorage` read/write with API calls (e.g. React Query) on the same triggers (login, and on every activity/day/hour mutation).

## Assets
None — no images/icons in this design. Prototype uses text glyphs ("⋯", "‹", "›") instead of an icon set; feel free to swap in your icon library (the reference design system specifies Phosphor icons).

## Files
- `Grade Semanal.dc.html` — the full interactive prototype (view source for exact markup/logic/handlers).
