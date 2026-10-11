import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Store, Boxes, ShieldCheck, Activity, Receipt, RefreshCw } from 'lucide-react'
import { Reveal } from '../motion.jsx'
import { getMarketplaceCounts, hydrateStore } from '../../data/store.js'
import { formatTimeAgo } from '../../utils/inr.js'

const TICK_MS = 30_000

export default function Stats() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState(() => {
    hydrateStore()
    return getMarketplaceCounts()
  })
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toISOString())

  useEffect(() => {
    const refresh = () => {
      const next = getMarketplaceCounts()
      setCounts(next)
      setUpdatedAt(new Date().toISOString())
    }
    const id = setInterval(refresh, TICK_MS)
    window.addEventListener('ab:cart-changed', refresh)
    window.addEventListener('ab:orders-changed', refresh)
    return () => {
      clearInterval(id)
      window.removeEventListener('ab:cart-changed', refresh)
      window.removeEventListener('ab:orders-changed', refresh)
    }
  }, [])

  const items = [
    { icon: Users, label: t('home.stats.buyers'), value: counts.buyers, accent: 'text-teal-700 dark:text-teal-300' },
    { icon: Store, label: t('home.stats.sellers'), value: counts.sellers, accent: 'text-teal-700 dark:text-teal-300' },
    { icon: Boxes, label: t('home.stats.products'), value: counts.products, accent: 'text-[#102A43] dark:text-white' },
    { icon: ShieldCheck, label: t('home.stats.verifiedSellers'), value: counts.verified, accent: 'text-teal-700 dark:text-teal-300' },
    { icon: Activity, label: t('home.stats.activeBusinesses'), value: counts.buyers + counts.sellers, accent: 'text-[#102A43] dark:text-white' },
    { icon: Receipt, label: t('home.stats.ordersToday'), value: counts.ordersToday, accent: 'text-[#102A43] dark:text-white' },
  ]

  return (
    <section className="bg-[#F7F9FC] py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-3xl">{t('home.statsTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('home.statsLastUpdated', { when: formatTimeAgo(updatedAt) })}</p>
          </div>
          <button
            type="button"
            onClick={() => { setCounts(getMarketplaceCounts()); setUpdatedAt(new Date().toISOString()) }}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300"
          >
            <RefreshCw className="size-4" />
            {t('home.statsRefresh')}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {items.map((item, idx) => (
            <Reveal key={item.label} delay={idx * 0.05}>
              <div className="checkpoint-tile rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    <item.icon className="size-5" />
                  </span>
                  <div className={`font-['Plus Jakarta Sans'] text-3xl font-extrabold tabular-nums tracking-tight ${item.accent}`}>{item.value}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">{t('demo.statsNote')}</p>
      </div>
    </section>
  )
}
