// Indian-locale formatters used across every page. Pure functions, safe to
// call from JSX directly.

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const inrPriceFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatInr(value, { decimals = false } = {}) {
  if (value == null) return '—'
  const formatter = decimals ? inrPriceFormatter : inrFormatter
  return formatter.format(value)
}

export function formatIndianDate(isoOrDate) {
  if (!isoOrDate) return ''
  try {
    const value = typeof isoOrDate === 'string' ? isoOrDate : isoOrDate.toISOString()
    return dateFormatter.format(new Date(value))
  } catch {
    return ''
  }
}

export function formatTimeAgo(isoOrDate) {
  if (!isoOrDate) return ''
  try {
    const ms = Date.now() - new Date(isoOrDate).getTime()
    const minutes = Math.round(ms / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours} hr ago`
    const days = Math.round(hours / 24)
    if (days < 30) return `${days} d ago`
    return formatIndianDate(isoOrDate)
  } catch {
    return ''
  }
}
