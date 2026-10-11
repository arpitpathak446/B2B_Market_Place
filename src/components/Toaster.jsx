import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ICON = {
  success: <CheckCircle2 className="size-5 text-teal-600" />,
  error: <AlertCircle className="size-5 text-rose-600" />,
  info: <Info className="size-5 text-slate-600" />,
}

export function useToasts() {
  const [toasts, setToasts] = useState([])
  function push(message, kind = 'success', durationMs = 4000) {
    const id = String(Math.random())
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), durationMs)
  }
  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }
  return { toasts, push, dismiss }
}

export default function Toaster({ toasts, dismiss }) {
  const { t } = useTranslation()
  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-800 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
          {ICON[t.kind]}
          <span className="leading-relaxed">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="ml-2 grid h-6 w-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('common.dismiss')}>
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
