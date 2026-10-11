import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

// Banner that travels with every page and clearly says where the experience
// ends: data is on this device, AI chat is FAQ-backed, full verification and
// real account sync will arrive with the next platform release.
export default function DemoBanner() {
  const { t } = useTranslation()
  return (
    <div className="bg-amber-50 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2 sm:px-6 lg:px-8 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">{t('demo.banner')}</p>
      </div>
    </div>
  )
}
