import { useSyncExternalStore } from 'react'

/**
 * Dark mode.
 *
 *   const { theme, isDark, toggleTheme, setTheme } = useTheme()
 *
 *   <button onClick={toggleTheme}>{isDark ? 'Light' : 'Dark'}</button>
 *   <button onClick={() => setTheme('dark')}>Dark</button>
 *
 * Style with Tailwind's `dark:` variant — the platform binds it to a class on
 * <html>, not to the OS media query, so toggling actually works:
 *
 *   <div className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
 *
 * The choice is stored in localStorage and re-applied before first paint, so a
 * reload never flashes the wrong theme. Until the user picks one, the app
 * follows the OS setting and keeps following it if the OS setting changes.
 *
 * The store is a module singleton, so every component using this hook stays in
 * sync and no provider has to wrap the tree.
 */

const STORAGE_KEY = 'pd:theme'
const listeners = new Set()

// Storage is partitioned (and sometimes blocked) inside the cross-origin
// preview iframe, so every access is guarded and a failure is non-fatal.
function stored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

function systemTheme() {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

let current = stored() || systemTheme()

function apply() {
  // Guarded so importing this module is safe where there is no DOM. The
  // production build pre-renders pages with react-dom/server, and this module
  // is reached from every page carrying a theme switch — an unguarded
  // `document` here throws at import time and takes that page's pre-render
  // with it.
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // The class is the switch that matters — it drives every `dark:` utility.
  root.classList.toggle('dark', current === 'dark')
  // Native scrollbars, form controls and caret follow this.
  root.style.colorScheme = current
}

/** Switch to 'light' or 'dark' and remember the choice. */
export function setTheme(next, remember = true) {
  if (next !== 'light' && next !== 'dark') {
    console.warn(`[theme] setTheme expects "light" or "dark", got`, next)
    return
  }
  if (next === current) return
  current = next
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }
  apply()
  listeners.forEach((fn) => fn())
}

export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot() {
  return current
}

// The published build pre-renders pages with no browser to read a stored
// choice from, so the server always renders the light tree. Reporting the real
// theme during hydration would therefore contradict the HTML that arrived, and
// React throws away that subtree and logs a hydration error (#418) for every
// dark-mode visitor.
//
// Returning the same value the server used keeps hydration exact; React then
// re-renders with the real theme immediately afterwards, which is what this
// third argument is for. Nothing flashes: the colours come from the `dark`
// class that the inline script in index.html sets before first paint, not from
// this value — only theme-dependent markup (a Sun/Moon icon, its label) settles
// one frame later.
function getServerSnapshot() {
  return 'light'
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { theme, isDark: theme === 'dark', setTheme, toggleTheme }
}

export default useTheme

// The inline script in index.html has already applied the same result before
// first paint; this only matters if that script is missing.
apply()

// Follow the OS while the user has not chosen for themselves.
try {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!stored()) setTheme(event.matches ? 'dark' : 'light', false)
  })
} catch {}
