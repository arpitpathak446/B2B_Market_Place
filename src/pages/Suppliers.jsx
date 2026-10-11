import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import Toaster, { useToasts } from '../components/Toaster.jsx'
import PageShell from '../components/PageShell.jsx'
import SupplierCard from '../components/suppliers/SupplierCard.jsx'
import SupplierProfile from '../components/suppliers/SupplierProfile.jsx'
import { hydrateStore, getStore, setStore, readSession } from '../data/store.js'
import { STATES } from '../data/seed.js'

const BUSINESS_TYPES = ['manufacturer','wholesaler','trader','retailer','distributor','importer','exporter','service']

export default function Suppliers() {
  const { t } = useTranslation()
  const [sp, setSp] = useSearchParams()
  const toasts = useToasts()

  const [query, setQuery] = useState(sp.get('q') || '')
  const [state, setState] = useState('all')
  const [type, setType] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [openId, setOpenId] = useState(sp.get('id') || null)

  useEffect(() => { hydrateStore() }, [])
  useEffect(() => { if (sp.get('id')) setOpenId(sp.get('id')) }, [sp])

  const catalog = getStore().catalog

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.suppliers.filter((s) => {
      if (state !== 'all' && s.state !== state) return false
      if (type !== 'all' && s.type !== type) return false
      if (verifiedOnly && s.verified !== true) return false
      if (q) {
        const hay = [s.name, s.about, s.city, s.state, s.type].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [catalog.suppliers, query, state, type, verifiedOnly])

  const productCountBySupplier = useMemo(() => {
    const counts = {}
    catalog.products.forEach((p) => { counts[p.supplierId] = (counts[p.supplierId] || 0) + 1 })
    return counts
  }, [catalog.products])

  function onReport(supplier) {
    setStore((state) => ({ ...state, reports: [...state.reports, { id: 'rep-' + Math.random().toString(16).slice(2, 8), type: 'supplier', targetId: supplier.id, note: supplier.name, status: 'open', at: new Date().toISOString() }] }))
  }

  function onQuote(supplier) {
    setStore((state) => {
      const session = readSession()
      return {
        ...state,
        reports: [...state.reports, { id: 'qr-' + Math.random().toString(16).slice(2, 8), type: 'quote', targetId: supplier.id, note: `Quote request to ${supplier.name}`, status: 'open', at: new Date().toISOString(), userId: session?.userId }],
      }
    })
    toasts.push(t('errors.quoteSent'))
  }

  return (
    <PageShell title={t('suppliers.seoTitle')} description={t('suppliers.seoDescription')}>
      <Toaster {...toasts} />
      <DemoBanner />
      <Nav />
      <main id="main" className="bg-[#F7F9FC] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-6">
            <h1 className="font-['Plus Jakarta Sans'] text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-4xl">{t('suppliers.title')}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t('suppliers.subtitle')}</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-3 space-y-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="text-sm font-semibold text-[#102A43] dark:text-white">{t('suppliers.filters')}</div>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('suppliers.filterBusinessType')}</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <option value="all">All business types</option>
                      {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{t(`suppliers.businessTypes.${b}`)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('suppliers.filterState')}</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <option value="all">All states</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="size-4 accent-teal-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{t('suppliers.filterVerified')}</span>
                  </label>
                  <button type="button" onClick={() => { setType('all'); setState('all'); setVerifiedOnly(false); setQuery('') }} className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300">
                    {t('suppliers.clearFilters')}
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {t('suppliers.results', { count: filtered.length })}
                </div>
              </div>
            </aside>

            <section className="lg:col-span-9">
              <form className="mb-4">
                <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 ring-1 ring-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-700 sm:max-w-lg">
                  <Search className="size-4 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('suppliers.searchPlaceholder')}
                    aria-label={t('suppliers.searchPlaceholder')}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')} className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <X className="size-3.5" />
                    </button>
                  )}
                </label>
              </form>

              {filtered.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <div className="text-lg font-semibold text-[#102A43] dark:text-white">{t('suppliers.emptyTitle')}</div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('suppliers.emptyBody')}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((s) => (
                    <SupplierCard key={s.id} supplier={s} productCount={productCountBySupplier[s.id] || 0} onOpen={setOpenId} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {openId && (
        <SupplierProfile
          supplierId={openId}
          onClose={() => { setOpenId(null); setSp({}, { replace: true }) }}
          onReport={onReport}
          onQuote={onQuote}
          pushToast={(msg) => toasts.push(msg)}
        />
      )}

      <Footer />
      <ChatWidget />
    </PageShell>
  )
}
