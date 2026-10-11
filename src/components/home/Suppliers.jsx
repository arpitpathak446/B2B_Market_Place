import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, MapPin, Building2 } from 'lucide-react'
import { Reveal } from '../motion.jsx'
import VerificationBadge from '../VerificationBadge.jsx'
import { getStore } from '../../data/store.js'

export default function Suppliers() {
  const { t } = useTranslation()
  const { suppliers } = getStore().catalog
  const verified = suppliers.filter((s) => s.verified === true).slice(0, 6)

  return (
    <section className="bg-white py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-3xl">{t('home.suppliersTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('home.suppliersSubtitle')}</p>
          </div>
          <Link to="/suppliers" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            {t('home.suppliersViewAll')}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verified.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 0.04}>
              <Link
                to={`/suppliers?id=${s.id}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    <Building2 className="size-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-2 font-semibold text-[#102A43] group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{s.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3.5" />
                      {s.city}, {s.state}
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.about}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <VerificationBadge state={s.verified} />
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:translate-x-1 transition dark:text-teal-300">
                    {t('products.viewSupplier')}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link to="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
            {t('home.suppliersViewAll')} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
