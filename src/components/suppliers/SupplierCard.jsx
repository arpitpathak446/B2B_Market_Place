import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, MapPin, ShieldCheck, Boxes, Calendar } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { formatIndianDate } from '../../utils/inr.js'

export default function SupplierCard({ supplier, productCount, onOpen }) {
  const { t } = useTranslation()
  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
          <Building2 className="size-6" />
        </span>
        <div className="flex-1 min-w-0">
          <button type="button" onClick={() => onOpen?.(supplier.id)} className="line-clamp-2 text-left font-semibold text-[#102A43] group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{supplier.name}</button>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="size-3.5" /> {supplier.city}, {supplier.state}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{supplier.about}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <VerificationBadge state={supplier.verified} size="sm" />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{t(`suppliers.businessTypes.${supplier.type}`)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1"><Boxes className="size-3.5" /> {productCount} {t('supplierProfile.productsCount')}</span>
        <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {t('supplierProfile.joined')} {formatIndianDate(supplier.since)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onOpen?.(supplier.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 hover:border-teal-500 hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-200">
          {t('suppliers.viewProfile')}
        </button>
        {supplier.verified === true && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <ShieldCheck className="size-3.5" />
            {t('supplierProfile.verified')}
          </span>
        )}
      </div>
    </article>
  )
}
