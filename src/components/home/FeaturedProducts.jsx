import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, MapPin, ShoppingCart, BadgePercent } from 'lucide-react'
import { Reveal } from '../motion.jsx'
import VerificationBadge from '../VerificationBadge.jsx'
import { getStore } from '../../data/store.js'
import { formatInr } from '../../utils/inr.js'

export default function FeaturedProducts({ onAdd, productLimit = 8 }) {
  const { t } = useTranslation()
  const { products } = getStore().catalog
  const items = products.slice(0, productLimit)

  return (
    <section className="bg-[#F7F9FC] py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-3xl">{t('home.productsTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('home.productsSubtitle')}</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            {t('home.productsViewAll')}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 0.04}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
                <Link to={`/products?p=${p.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  {p.byQuote && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800">
                      <BadgePercent className="size-3" /> {t('products.requestQuote')}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <Link to={`/products?p=${p.id}`} className="line-clamp-2 font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{p.name}</Link>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3.5" />
                      {p.supplierName}
                      {p.verified && <span className="ml-2"><VerificationBadge state="verified" size="sm" /></span>}
                    </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      {p.byQuote ? (
                        <div className="text-sm font-bold text-amber-800 dark:text-amber-300">{t('productDetail.byQuote')}</div>
                      ) : (
                        <>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.priceHint')}</div>
                          <div className="font-['Plus Jakarta Sans'] text-lg font-extrabold tabular-nums text-[#102A43] dark:text-white">{formatInr(p.price)} <span className="text-sm text-slate-500 dark:text-slate-400">/ {p.unit}</span></div>
                        </>
                      )}
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.moq')}: {formatInr(p.moq)} {p.unit}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdd?.(p.id)}
                      aria-label={t('products.addToCart')}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-teal-500 disabled:opacity-50"
                      disabled={p.byQuote}
                    >
                      <ShoppingCart className="size-4" />
                      <span className="hidden sm:inline">{t('products.addToCart')}</span>
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
            {t('home.productsViewAll')} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
