import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, ShoppingCart, BadgePercent } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { formatInr } from '../../utils/inr.js'

export default function ProductCard({ product, onOpen, onAdd }) {
  const { t } = useTranslation()
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
      <button type="button" onClick={() => onOpen?.(product.id)} className="relative block aspect-[4/3] overflow-hidden bg-slate-50 text-left dark:bg-slate-800">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        {product.byQuote && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800">
            <BadgePercent className="size-3" /> {t('products.requestQuote')}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <button type="button" onClick={() => onOpen?.(product.id)} className="line-clamp-2 text-left font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{product.name}</button>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="size-3.5" />
            <Link to={`/suppliers?id=${product.supplierId}`} className="hover:text-teal-700 dark:hover:text-teal-300">{product.supplierName}</Link>
            {product.verified && <span className="ml-2"><VerificationBadge state="verified" size="sm" /></span>}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(`categories.list.${product.category}`)}</div>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            {product.byQuote ? (
              <div className="text-sm font-bold text-amber-800 dark:text-amber-300">{t('productDetail.byQuote')}</div>
            ) : (
              <>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.priceHint')}</div>
                <div className="font-['Plus Jakarta Sans'] text-lg font-extrabold tabular-nums text-[#102A43] dark:text-white">{formatInr(product.price)} <span className="text-sm text-slate-500 dark:text-slate-400">/ {product.unit}</span></div>
              </>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.moq')}: {formatInr(product.moq)} {product.unit}</div>
          </div>
          <button
            type="button"
            onClick={() => product.byQuote ? onOpen?.(product.id) : onAdd?.(product.id)}
            aria-label={product.byQuote ? t('products.requestQuote') : t('products.addToCart')}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-white transition ${product.byQuote ? 'bg-amber-500 hover:bg-amber-400' : 'bg-teal-600 hover:bg-teal-500'}`}
          >
            {product.byQuote ? <BadgePercent className="size-4" /> : <ShoppingCart className="size-4" />}
            <span className="hidden sm:inline">{product.byQuote ? t('products.requestQuote') : t('products.addToCart')}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
