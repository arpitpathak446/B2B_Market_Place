import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { X, MapPin, Calendar, Flag, MessageCircle, BadgePercent, Boxes, ShieldCheck, Building2 } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { getStore } from '../../data/store.js'
import { formatIndianDate, formatInr } from '../../utils/inr.js'

export default function SupplierProfile({ supplierId, onClose, onReport, onQuote, pushToast }) {
  const { t } = useTranslation()
  const supplier = getStore().catalog.suppliers.find((s) => s.id === supplierId)
  if (!supplier) return null
  const products = getStore().catalog.products.filter((p) => p.supplierId === supplier.id)

  function report() {
    onReport?.(supplier)
    pushToast?.(t('supplierProfile.reportSent'))
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex">
      <button type="button" aria-label={t('common.close')} onClick={onClose} className="flex-1 bg-slate-900/40 backdrop-blur-sm" />
      <div className="chat-pop relative flex h-full w-full max-w-3xl flex-col bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
              <Building2 className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-['Plus Jakarta Sans'] text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{supplier.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="size-3.5" /> {supplier.city}, {supplier.state} · {t(`suppliers.businessTypes.${supplier.type}`)}
              </div>
              <div className="mt-2"><VerificationBadge state={supplier.verified} /></div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('productDetail.close')} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-1 px-5 py-4 md:grid-cols-3">
          <Stat icon={Calendar} label={t('supplierProfile.joined')} value={formatIndianDate(supplier.since)} />
          <Stat icon={Boxes} label={t('supplierProfile.productsCount')} value={products.length} />
          <Stat icon={ShieldCheck} label={supplier.verified === true ? t('supplierProfile.verified') : (supplier.verified ? t('supplierProfile.verifiedPending') : t('supplierProfile.notVerified'))} value={supplier.verified === true ? formatIndianDate(supplier.since) : '—'} />
        </div>

        <div className="px-5 py-4">
          <h3 className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('supplierProfile.about')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{supplier.about}</p>
        </div>

        <div className="px-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <strong className="block">{t('verify.explanation').split('.')[0]}.</strong>
            {t('verify.explanation').split('.').slice(1).join('.').trim()}
          </div>
        </div>

        <div className="mt-4 px-5">
          <h3 className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('dash.tabs.listings')}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {products.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">No products listed.</div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => (
                <li key={p.id}>
                  <Link to={`/products?p=${p.id}`} onClick={onClose} className="flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-teal-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-500">
                    <img src={p.image} alt={p.name} className="h-20 w-20 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="line-clamp-2 font-semibold text-[#102A43] dark:text-white">{p.name}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.byQuote ? t('productDetail.byQuote') : <>{formatInr(p.price)} / {p.unit}</>}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.moq')}: {formatInr(p.moq)} {p.unit}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${supplier.id}@allbusinesses.example?subject=${encodeURIComponent('Enquiry — ' + supplier.name)}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500">
              <MessageCircle className="size-4" />
              {t('suppliers.contactSeller')}
            </a>
            <button type="button" onClick={() => { onQuote?.(supplier); onClose() }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <BadgePercent className="size-4" />
              {t('suppliers.requestQuote')}
            </button>
            <Link to="/products" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Boxes className="size-4" />
              {t('suppliers.viewProducts')}
            </Link>
          </div>
          <button type="button" onClick={report} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Flag className="size-4" />
            {t('suppliers.reportBusiness')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Icon className="size-3.5 text-teal-600" /> {label}
      </div>
      <div className="mt-1 text-base font-bold text-[#102A43] dark:text-white">{value}</div>
    </div>
  )
}
