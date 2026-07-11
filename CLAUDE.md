# CLAUDE.md

## Project
DnD 2024 racing machine builder. React + TypeScript, Vite, no backend, no database.
All data is static. One live external call: Claude API for narrative summary.

## Package manager
npm

## Stack
- React 18, TypeScript 5, Vite
- Start with useState/useReducer — do not add a state management library unless
  complexity clearly demands it
- No CSS framework decided yet — use plain CSS modules until one is needed

## Folder conventions
- types/       — one file per component type (chassis.ts, engine.ts, suspension.ts,
                 armor.ts, addon.ts, machine.ts)
- data/        — one file per component type, each exports a typed array of options
- lib/         — pure functions only, no React imports (calculate.ts, summarize.ts)
- components/  — React components only

## Type conventions
- types/ files are the source of truth for the data model
- Do not modify type files as a side effect of another task
- If a type change is needed, make it explicitly in its own focused change and update
  any affected data/ and lib/ files in the same session
- statModifier field names are intentionally identical to base stat names — they are
  deltas, not base values
- All stat and statModifier values are whole integers

## Stat calculation rules
- Base stats come from chassis.stats only
- All other components contribute via optional statModifiers (omit fields if zero)
- Final stat = chassis base + sum of all statModifiers across all selected components
- Mounting Points are chassis-defined only — no component may modify them via statModifiers
- Power = engine.powerCapacity − sum(suspension.powerDraw, armor.powerDraw)
           − sum(addon.powerRequirement)
- Mounting Points remaining = chassis.stats.mountingPoints − sum(addon.mountingPointsCost)
- Warn (inline) if either resource goes negative

## URL / shareable config
- Each component selection is stored as a query param, e.g.:
  ?chassis=<id>&engine=<id>&suspension=<id>&armor=<id>&addon=<id>&summary=true
- Chassis is the root. If chassis param is missing or invalid, reset to base URL
  (no params) and start from scratch — do not attempt to restore other params
- If any non-chassis param is present but its ID does not exist in the static data,
  silently drop that param and continue with what remains valid
- A URL may contain any subset of params — partial configs are valid for sharing,
  just not for summarizing

## Component selection UX
- Single page. All component selectors are visible once a chassis is selected.
  Before chassis selection, only the chassis selector is shown.
- Every component slot (including chassis) has a "None" option.
  Selecting None on chassis resets all other slots and clears the URL.
  Selecting None on any other slot clears only that slot and its URL param.
- Components can be changed freely but not cleared except via the None option.
- Add-ons: multiple may be selected (or none). No "required" constraint.

## Summarize button rules
Block the Summarize button (show it as disabled with a tooltip) if ANY of:
  1. Chassis is not selected
  2. Engine is not selected
  3. Suspension is not selected
  4. Armor is not selected
  5. Power pool is negative
  6. Mounting Points remaining is negative
Add-ons are not required — a machine with no add-ons can still be summarized.

## Claude API integration
- Model: claude-sonnet-4-6
- Only fires when Summarize button is enabled and clicked
- System prompt: briefly explain the DnD 2024 racing campaign context
- User message: final stat block + list of selected components by name
- Expected response: 2–3 sentence narrative of the vehicle's strengths and weaknesses
- Handle loading and error states in the UI

## Do not
- Import React in lib/ files
- Modify multiple type files in a single session without an explicit request to do so
- Add backend, database, or server-side logic of any kind
- Use localStorage or sessionStorage — URL params are the only persistence mechanism
