import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal } from 'lucide-react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import Toaster, { useToasts } from '../components/Toaster.jsx'
import PageShell from '../components/PageShell.jsx'
import ProductFilters from '../components/products/ProductFilters.jsx'
import ProductCard from '../components/products/ProductCard.jsx'
import ProductDetail from '../components/products/ProductDetail.jsx'
import {
  hydrateStore, getStore, setStore, readSession,
} from '../data/store.js'
import { STATES } from '../data/seed.js'

const DEFAULT_STATE = { category: 'all', state: 'all', verifiedOnly: false, priceMax: 100000, moqMax: 100000, availability: 'any', sort: 'relevance' }

export default function Products() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toasts = useToasts()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({ ...DEFAULT_STATE, sort: 'newest', category: searchParams.get('category') || 'all' })
  const [openId, setOpenId] = useState(searchParams.get('p') || null)

  useEffect(() => { hydrateStore() }, [])

  useEffect(() => {
    if (searchParams.get('p')) setOpenId(searchParams.get('p'))
  }, [searchParams])

  const catalog = getStore().catalog

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = catalog.products
    if (filters.category !== 'all') list = list.filter((p) => p.category === filters.category)
    if (filters.state !== 'all') list = list.filter((p) => {
      const supplier = catalog.suppliers.find((s) => s.id === p.supplierId)
      return supplier?.state === filters.state
    })
    if (filters.verifiedOnly) list = list.filter((p) => p.verified)
    if (filters.availability === 'inStock') list = list.filter((p) => p.stockState === 'in_stock' || p.stockState === 'low_stock')
    if (filters.availability === 'byQuote') list = list.filter((p) => p.byQuote)
    list = list.filter((p) => !p.price || p.price <= filters.priceMax)
    list = list.filter((p) => p.moq <= filters.moqMax)
    if (q) {
      list = list.filter((p) => {
        const supplier = catalog.suppliers.find((s) => s.id === p.supplierId)
        return [p.name, p.shortDescription, supplier?.name, ...(p.specs || [])].some((v) => String(v || '').toLowerCase().includes(q))
      })
    }
    const sortFns = {
      newest: (a, b) => String(b.listedAt).localeCompare(a.listedAt),
      priceAsc: (a, b) => (a.price || Infinity) - (b.price || Infinity),
      priceDesc: (a, b) => (b.price || 0) - (a.price || 0),
      moqAsc: (a, b) => a.moq - b.moq,
      relevance: () => 0,
    }
    return [...list].sort(sortFns[filters.sort] || sortFns.relevance)
  }, [catalog, filters, query])

  function addToCart(productId) {
    const product = catalog.products.find((p) => p.id === productId)
    if (!product) return
    const session = readSession()
    if (!session) {
      navigate('/account?mode=register')
      return
    }
    setStore((state) => {
      const next = { ...state, carts: { ...state.carts } }
      const userCart = { ...(next.carts[session.userId] || {}) }
      const items = [...(userCart[product.supplierId] || [])]
      const idx = items.findIndex((l) => l.productId === productId)
      if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 }
      else items.push({ productId, quantity: Math.max(1, product.moq) })
      userCart[product.supplierId] = items
      next.carts[session.userId] = userCart
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
    toasts.push(t('productDetail.addedToCart'))
  }

  function onReport(product) {
    setStore((state) => ({ ...state, reports: [...state.reports, { id: 'rep-' + Math.random().toString(16).slice(2, 8), type: 'product', targetId: product.id, note: product.name, status: 'open', at: new Date().toISOString() }] }))
  }

  function onQuoteRequest(product) {
    const session = readSession()
    if (!session) {
      navigate('/account?mode=register')
      return
    }
    setStore((state) => {
      const next = { ...state, reports: [...state.reports] }
      next.reports.push({ id: 'qr-' + Math.random().toString(16).slice(2, 8), type: 'quote', targetId: product.id, note: `Quote for ${product.name}`, status: 'open', at: new Date().toISOString(), userId: session.userId })
      return next
    })
    toasts.push(t('errors.quoteSent'))
  }

  return (
    <PageShell title={t('products.seoTitle')} description={t('products.seoDescription')}>
      <Toaster {...toasts} />
      <DemoBanner />
      <Nav />

      <main id="main" className="bg-[#F7F9FC] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-6">
            <h1 className="font-['Plus Jakarta Sans'] text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-4xl">{t('products.title')}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t('products.subtitle')}</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <ProductFilters state={filters} onChange={setFilters} options={{ categories: catalog.categories.map((c) => c.id), states: STATES }} total={catalog.products.length} filtered={filtered.length} />
            </aside>

            <section className="lg:col-span-9">
              <form
                onSubmit={(e) => { e.preventDefault() }}
                className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 ring-1 ring-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:ring-slate-700 sm:max-w-md">
                  <Search className="size-4 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('products.searchPlaceholder')}
                    aria-label={t('products.searchPlaceholder')}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <SlidersHorizontal className="size-4 text-teal-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('products.sort.label')}</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="relevance">{t('products.sort.relevance')}</option>
                    <option value="newest">{t('products.sort.newest')}</option>
                    <option value="priceAsc">{t('products.sort.priceAsc')}</option>
                    <option value="priceDesc">{t('products.sort.priceDesc')}</option>
                    <option value="moqAsc">{t('products.sort.moqAsc')}</option>
                  </select>
                </label>
              </form>

              {filtered.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <div className="text-lg font-semibold text-[#102A43] dark:text-white">{t('products.emptyTitle')}</div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('products.emptyBody')}</p>
                  <button type="button" onClick={() => setFilters({ ...DEFAULT_STATE, sort: filters.sort })} className="mt-4 inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white">{t('products.clearFilters')}</button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} onOpen={setOpenId} onAdd={addToCart} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {openId && (
        <ProductDetail
          productId={openId}
          onClose={() => { setOpenId(null); setSearchParams({}, { replace: true }) }}
          onAdd={(id) => { setOpenId(null); setSearchParams({}, { replace: true }) }}
          onReport={onReport}
          onQuote={onQuoteRequest}
          pushToast={(msg) => toasts.push(msg)}
        />
      )}

      <Footer />
      <ChatWidget />
    </PageShell>
  )
}
