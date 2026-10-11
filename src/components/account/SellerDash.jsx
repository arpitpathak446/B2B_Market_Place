import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Plus, Trash2, Boxes, Archive, ArchiveRestore, FilePlus2, ShieldCheck, AlertTriangle } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { formatIndianDate, formatInr } from '../../utils/inr.js'

const STATUS_FLOW = [
  ['pending_seller', null, null],
  ['accepted', 'accepted', 'sellerDash.accept'],
  ['processing', 'processing', 'sellerDash.markProcessing'],
  ['dispatched', 'dispatched', 'sellerDash.markDispatched'],
  ['delivered', 'delivered', 'sellerDash.markDelivered'],
  ['completed', 'completed', 'sellerDash.markCompleted'],
]

export default function SellerDash({ userId, store, setStore, pushToast }) {
  const { t } = useTranslation()
  const user = store.users[userId]
  const supplier = user.profile?.supplierLink
    ? store.catalog.suppliers.find((s) => s.id === user.profile.supplierLink)
    : Object.values(store.businesses).find((b) => b.ownerId === userId)
        ? store.catalog.suppliers.find((s) => store.businesses[s.id]?.ownerId === userId)
        : null
  const supplierId = supplier?.id
  const products = supplierId ? store.catalog.products.filter((p) => p.supplierId === supplierId) : []
  const orders = Object.values(store.orders).filter((o) => o.items.some((it) => it.supplierId === supplierId))
  const verification = user.verification || {}

  const [tab, setTab] = useState('overview')

  if (!supplier) {
    return (
      <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('sellerDash.setupTitle')}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('errors.sellerNoBusiness')}</p>
        <button type="button" onClick={() => setTab('addProduct')} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">
          <Plus className="size-4" /> {t('sellerDash.addProduct')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="font-['Plus Jakarta Sans'] text-base font-bold tracking-tight text-[#102A43] dark:text-white">{supplier.name}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{supplier.city}, {supplier.state}</div>
          <div className="mt-2"><VerificationBadge state={supplier.verified} /></div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('dash.profile')}</div>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('forms.businessType')}</span><span className="text-[#102A43] dark:text-white">{t(`suppliers.businessTypes.${supplier.type}`)}</span></li>
            <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('sellerDash.activeProducts')}</span><span className="font-['Plus Jakarta Sans'] tabular-nums text-[#102A43] dark:text-white">{products.filter((p) => !p.archived).length}</span></li>
            <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('sellerDash.outOfStockProducts')}</span><span className="font-['Plus Jakarta Sans'] tabular-nums text-[#102A43] dark:text-white">{products.filter((p) => p.stockState === 'out_of_stock').length}</span></li>
          </ul>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('verify.title')}</div>
          <div className="mt-2 text-sm font-semibold text-[#102A43] dark:text-white">{t('verify.stage1')}</div>
          <div className="mt-1"><VerificationBadge state={verification.stage1 === 'verified' ? 'verified' : verification.stage1} size="sm" /></div>
          <div className="mt-3 text-sm font-semibold text-[#102A43] dark:text-white">{t('verify.stage2')}</div>
          <div className="mt-1"><VerificationBadge state={verification.stage2} size="sm" /></div>
          {(verification.stage2 === 'pending' || verification.stage2 === 'rejected' || verification.stage2 === 'docs_required') && (
            <button type="button" onClick={() => submitVerification(store, setStore, userId, supplier.id, pushToast, t)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">
              <ShieldCheck className="size-3.5" /> {t('verificationForm.review')}
            </button>
          )}
        </div>
      </aside>

      <section className="lg:col-span-9 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', key: 'dash.tabs.ordersReceived' },
            { id: 'listings', key: 'dash.tabs.listings' },
            { id: 'addProduct', key: 'dash.tabs.addProduct' },
            { id: 'quotes', key: 'dash.tabs.ordersReceived', label: t('sellerDash.quoteRequests') },
          ].map((it) => (
            <button key={it.id} type="button" onClick={() => setTab(it.id)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === it.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
              {it.label || t(it.key)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <OrdersQueue orders={orders} supplierId={supplierId} store={store} setStore={setStore} pushToast={pushToast} />
        )}
        {tab === 'listings' && (
          <ListingsTable products={products} store={store} setStore={setStore} pushToast={pushToast} />
        )}
        {tab === 'addProduct' && (
          <ProductForm userId={userId} supplierId={supplierId} store={store} setStore={setStore} pushToast={pushToast} onDone={() => setTab('listings')} />
        )}
        {tab === 'quotes' && (
          <QuoteRequests store={store} pushToast={pushToast} />
        )}
      </section>
    </div>
  )
}

function OrdersQueue({ orders, supplierId, store, setStore, pushToast }) {
  const { t } = useTranslation()

  function advance(orderId, newStatus, label) {
    setStore((s) => ({
      ...s,
      orders: { ...s.orders, [orderId]: { ...s.orders[orderId], status: newStatus, events: [...s.orders[orderId].events, { at: new Date().toISOString(), label }] } },
    }))
    window.dispatchEvent(new Event('ab:orders-changed'))
    pushToast?.(t(`sellerDash.orderStatus.${newStatus}`))
  }

  if (orders.length === 0) {
    return <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">{t('sellerDash.noOrders')}</div>
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const stage = STATUS_FLOW.findIndex(([s]) => s === order.status)
        return (
          <article key={order.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('buyerDash.orderRef')}</div>
                <div className="font-['Plus Jakarta Sans'] text-base font-bold tabular-nums text-[#102A43] dark:text-white">{order.reference}</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('buyerDash.ordered', { date: formatIndianDate(order.placedAt) })}</div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {order.items.filter((it) => it.supplierId === supplierId).map((it, i) => (
                <li key={i} className="text-sm">
                  <Link to={`/products?p=${it.productId}`} className="font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{it.name}</Link>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">{formatInr(it.quantity)} {it.unit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <div className="font-semibold text-[#102A43] dark:text-white">{t('verify.stage2')}</div>
                {order.address}
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <div className="font-semibold text-[#102A43] dark:text-white">Stage</div>
                {t(`sellerDash.orderStatus.${order.status}`)}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.status === 'pending_seller' && (
                <>
                  <button type="button" onClick={() => advance(order.id, 'accepted', t('sellerDash.accept'))} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">{t('sellerDash.accept')}</button>
                  <button type="button" onClick={() => advance(order.id, 'rejected', t('sellerDash.reject'))} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:border-rose-400 dark:border-slate-700 dark:bg-slate-800">{t('sellerDash.reject')}</button>
                </>
              )}
              {STATUS_FLOW.find(([s, n]) => s === order.status && n) && (
                (() => {
                  const [, next, labelKey] = STATUS_FLOW.find(([s]) => s === order.status)
                  if (!next) return null
                  return <button type="button" onClick={() => advance(order.id, next, t(labelKey))} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">{t(labelKey)}</button>
                })()
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ListingsTable({ products, store, setStore, pushToast }) {
  const { t } = useTranslation()
  function archive(productId) {
    setStore((s) => {
      const next = { ...s, catalog: { ...s.catalog, products: s.catalog.products.map((p) => p.id === productId ? { ...p, archived: true } : p) } }
      return next
    })
    pushToast?.(t('productForm.archived'))
  }
  function reactivate(productId) {
    setStore((s) => {
      const next = { ...s, catalog: { ...s.catalog, products: s.catalog.products.map((p) => p.id === productId ? { ...p, archived: false } : p) } }
      return next
    })
    pushToast?.(t('productForm.reactivated'))
  }
  function deleteProduct(productId) {
    if (!confirm(t('sellerDash.confirmDelete'))) return
    setStore((s) => ({ ...s, catalog: { ...s.catalog, products: s.catalog.products.filter((p) => p.id !== productId) } }))
    pushToast?.(t('productForm.deleted'))
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
        <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold tracking-tight text-[#102A43] dark:text-white">{t('dash.tabs.listings')}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('sellerDash.productCount', { count: products.length })}</span>
      </div>
      {products.length === 0 ? (
        <div className="p-6 text-sm text-slate-600 dark:text-slate-300">{t('sellerDash.noProducts')}</div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {products.map((p) => (
            <li key={p.id} className="flex items-start gap-3 p-4">
              <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/products?p=${p.id}`} className="font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{p.name}</Link>
                  {p.archived && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">Archived</span>}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(`categories.list.${p.category}`)} · {p.byQuote ? t('productDetail.byQuote') : `${formatInr(p.price)} / ${p.unit}`}</div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {p.archived ? (
                  <button type="button" onClick={() => reactivate(p.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><ArchiveRestore className="size-3.5" />{t('sellerDash.reactivateProduct')}</button>
                ) : (
                  <button type="button" onClick={() => archive(p.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Archive className="size-3.5" />{t('sellerDash.archiveProduct')}</button>
                )}
                <button type="button" onClick={() => deleteProduct(p.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:border-rose-400 dark:border-slate-700 dark:bg-slate-800"><Trash2 className="size-3.5" />{t('sellerDash.deleteProduct')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProductForm({ userId, supplierId, store, setStore, pushToast, onDone }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    category: 'machinery', name: '', shortDescription: '', specs: '', price: '', byQuote: false,
    moq: 1, unit: 'piece', stockState: 'in_stock', inStock: 100, shipping: 'Standard dispatch in 2–4 business days.',
  })
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }
  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { pushToast?.(t('errors.nameRequired')); return }
    const productId = 'p-' + Math.random().toString(16).slice(2, 8)
    const specs = form.specs.split('\n').map((l) => l.trim()).filter(Boolean)
    setStore((s) => {
      const next = { ...s, catalog: { ...s.catalog, products: [...s.catalog.products, {
        id: productId,
        supplierId: supplierId || 's-arvind',
        supplierName: s.catalog.suppliers.find((sp) => sp.id === (supplierId || 's-arvind'))?.name || 'Supplier',
        category: form.category,
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim() || ' ',
        specs: specs.length ? specs : ['—'],
        price: form.byQuote ? null : Number(form.price || 0),
        byQuote: form.byQuote,
        moq: Number(form.moq || 1),
        unit: form.unit || 'piece',
        inStock: Number(form.inStock || 0),
        stockState: form.stockState,
        verified: s.catalog.suppliers.find((sp) => sp.id === (supplierId || 's-arvind'))?.verified === true,
        shipping: form.shipping,
        listedAt: new Date().toISOString().slice(0, 10),
        image: s.catalog.categories.find((c) => c.id === form.category)?.image || '/public/image_d5a16840-c_2026-10-10',
      }] } }
      return next
    })
    pushToast?.(t('productForm.saved'))
    onDone?.()
  }
  const categories = store.catalog.categories
  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold tracking-tight text-[#102A43] dark:text-white">{t('productForm.addTitle')}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('forms.descriptionHint')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <FormField label={t('productForm.name')}>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('productForm.namePlaceholder')} />
        </FormField>
        <FormField label={t('productForm.category')}>
          <select value={form.category} onChange={(e) => update('category', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {categories.map((c) => <option key={c.id} value={c.id}>{t(`categories.list.${c.id}`)}</option>)}
          </select>
        </FormField>
      </div>
      <div className="mt-3">
        <FormField label={t('forms.description')}>
          <textarea rows={3} value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </FormField>
      </div>
      <div className="mt-3">
        <FormField label={t('productForm.specs')} hint={t('productForm.specsHint')}>
          <textarea rows={3} value={form.specs} onChange={(e) => update('specs', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('productForm.specsPlaceholder')} />
        </FormField>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <FormField label={t('productForm.priceInr')} hint={t('productForm.byQuoteHint')}>
          <input disabled={form.byQuote} type="number" inputMode="numeric" value={form.price} onChange={(e) => update('price', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </FormField>
        <FormField label={t('productForm.moq')}>
          <input type="number" inputMode="numeric" min={1} value={form.moq} onChange={(e) => update('moq', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </FormField>
        <FormField label={t('productForm.unit')}>
          <input value={form.unit} onChange={(e) => update('unit', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('productForm.unitPlaceholder')} />
        </FormField>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" checked={form.byQuote} onChange={(e) => update('byQuote', e.target.checked)} className="size-4 accent-teal-600" />
        {t('productForm.byQuote')}
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <FormField label={t('productForm.availability')}>
          <select value={form.stockState} onChange={(e) => update('stockState', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option value="in_stock">{t('productForm.inStock')}</option>
            <option value="low_stock">{t('productForm.lowStock')}</option>
            <option value="out_of_stock">{t('productForm.outOfStock')}</option>
          </select>
        </FormField>
        <FormField label={t('productForm.stockUnits')}>
          <input type="number" inputMode="numeric" value={form.inStock} onChange={(e) => update('inStock', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </FormField>
        <FormField label={t('productForm.shipping')} className="sm:col-span-1">
          <input value={form.shipping} onChange={(e) => update('shipping', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        </FormField>
      </div>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800">
        {t('productForm.imageHint')}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-500"><FilePlus2 className="size-4" /> {t('forms.submit')}</button>
      </div>
    </form>
  )
}

function FormField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#102A43] dark:text-white">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  )
}

function QuoteRequests({ store, pushToast }) {
  const { t } = useTranslation()
  const quotes = store.reports.filter((r) => r.type === 'quote')
  if (quotes.length === 0) return <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">{t('sellerDash.noQuoteRequests')}</div>
  return (
    <ul className="space-y-2">
      {quotes.map((q) => (
        <li key={q.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="text-sm font-semibold text-[#102A43] dark:text-white">{q.note}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{formatIndianDate(q.at)}</div>
        </li>
      ))}
    </ul>
  )
}

function submitVerification(store, setStore, userId, supplierId, pushToast, t) {
  setStore((s) => {
    const next = { ...s, users: { ...s.users } }
    next.users[userId] = { ...next.users[userId], verification: { stage1: 'verified', stage2: 'under_review' } }
    return next
  })
  pushToast?.(t('verificationForm.submitted'))
}
