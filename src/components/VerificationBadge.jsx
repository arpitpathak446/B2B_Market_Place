import { useTranslation } from 'react-i18next'
import { ShieldCheck, ShieldAlert, Hourglass, ShieldOff } from 'lucide-react'

// Renders a verification badge from a supplier or user verification state.
// state values: true | 'verified' | 'pending' | 'under_review' | 'rejected' | false | undefined
export default function VerificationBadge({ state = false, size = 'md' }) {
  const { t } = useTranslation()
  const map = {
    verified: { icon: ShieldCheck, label: t('verifyBadge.verified'), className: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800' },
    under_review: { icon: Hourglass, label: t('verifyBadge.underReview'), className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800' },
    pending: { icon: Hourglass, label: t('verifyBadge.pending'), className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800' },
    rejected: { icon: ShieldOff, label: t('verifyBadge.rejected'), className: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800' },
    docs_required: { icon: ShieldAlert, label: t('verifyBadge.pending'), className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800' },
    default: { icon: ShieldOff, label: t('verifyBadge.rejected'), className: 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700' },
  }
  const resolved = state === true ? map.verified : (map[state] || map.default)
  const Icon = resolved.icon
  const sizes = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5'
  return (
    <span className={`inline-flex items-center rounded-full ring-1 font-medium ${resolved.className} ${sizes}`}>
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} />
      {resolved.label}
    </span>
  )
}
