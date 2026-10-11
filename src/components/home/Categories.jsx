import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Reveal } from '../motion.jsx'
import { ChevronRight } from 'lucide-react'
import { getStore } from '../../data/store.js'

export default function Categories() {
  const { t } = useTranslation()
  const { categories } = getStore().catalog
  return (
    <section className="bg-white py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-3xl">{t('home.categoriesTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('home.categoriesSubtitle')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <Reveal key={cat.id} delay={idx * 0.04}>
              <Link
                to={`/products?category=${cat.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <img src={cat.image} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#102A43] dark:text-white">{t(`categories.list.${cat.id}`)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t('home.exploreCta')}</div>
                </div>
                <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
