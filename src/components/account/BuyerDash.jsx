import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link2, Trash2, ShoppingCart, Package, CheckCircle2, X, MapPin } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { formatIndianDate, formatInr } from '../../utils/inr.js'
import { STATES } from '../../data/seed.js'

const STATUS_TABS = [
  { id: 'all', key: 'all' },
  { id: 'pending_seller', key: 'pendingOrders' },
  { id: 'accepted', key: 'confirmed' },
  { id: 'completed', key: 'completed' },
  { id: 'cancelled', key: 'cancelled' },
]

export default function BuyerDash({ userId, store, setStore, pushToast }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('all')
  const user = store.users[userId]
  const orders = Object.values(store.orders).filter((o) => o.userId === userId)
  const filteredOrders = tab === 'all' ? orders : orders.filter((o) => o.status === tab)
  const cart = (store.carts[userId] || {})
  const cartEntries = Object.entries(cart).map(([supplierId, items]) => {
    const supplier = store.catalog.suppliers.find((s) => s.id === supplierId)
    return {
      supplier, supplierId, items,
      subtotal: items.reduce((sum, { productId, quantity }) => {
        const product = store.catalog.products.find((p) => p.id === productId)
        return product && !product.byQuote ? sum + product.price * quantity : sum
      }, 0),
    }
  })
  const cartCount = cartEntries.reduce((s, e) => s + e.items.reduce((q, i) => q + i.quantity, 0), 0)
  const saved = (store.savedSuppliers[userId] || []).map((id) => store.catalog.suppliers.find((s) => s.id === id)).filter(Boolean)
  const verification = user.verification || {}

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <Sidebar user={user} verification={verification} />
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="text-sm font-semibold text-[#102A43] dark:text-white">{t('buyerDash.paymentNote')}</div>
        </div>
      </aside>

      <section className="lg:col-span-9 space-y-4">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="font-['Plus Jakarta Sans'] text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('dash.welcome', { name: user.profile?.fullName?.split(' ')[0] || 'buyer' })}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{user.email} · {user.phone}</p>
        </div>

        <Tabs
          tabs={[
            { id: 'orders', label: t('dash.tabs.orders'), count: orders.length },
            { id: 'cart', label: t('dash.tabs.cart'), count: cartCount },
            { id: 'saved', label: t('dash.tabs.savedSuppliers'), count: saved.length },
            { id: 'settings', label: t('dash.tabs.verification') },
          ]}
          active={'orders'}
          onChange={() => {}}
        />

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button key={s.id} type="button" onClick={() => setTab(s.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === s.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
                {t(`buyerDash.${s.key}`)} {s.id !== 'all' && <span className="font-['Plus Jakarta Sans'] ml-1 text-[10px] tabular-nums opacity-70">{orders.filter((o) => o.status === s.id).length}</span>}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {filteredOrders.length === 0 ? (
              <EmptyState
                title={t('buyerDash.noOrders')}
                cta={{ to: '/products', label: t('buyerDash.browseProducts') }}
              />
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} products={store.catalog.products} onCancel={(id) => {
                  setStore((s) => ({
                    ...s,
                    orders: { ...s.orders, [id]: { ...s.orders[id], status: 'cancelled', events: [...s.orders[id].events, { at: new Date().toISOString(), label: t('buyerDash.cancelledByBuyer') }] } },
                  }))
                  window.dispatchEvent(new Event('ab:orders-changed'))
                  pushToast?.(t('errors.orderCancelled'))
                }} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold tracking-tight text-[#102A43] dark:text-white">{t('dash.tabs.cart')}</h3>
            <Link to="/products" className="text-xs font-semibold text-teal-700 hover:underline">{t('buyerDash.browseProducts')}</Link>
          </div>
          {cartEntries.length === 0 ? (
            <EmptyState title={t('buyerDash.cartEmpty')} body={t('buyerDash.cartEmptyBody')} cta={{ to: '/products', label: t('buyerDash.browseProducts') }} />
          ) : (
            <CartSummary groups={cartEntries} store={store} setStore={setStore} userId={userId} pushToast={pushToast} />
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold tracking-tight text-[#102A43] dark:text-white">{t('dash.tabs.savedSuppliers')}</h3>
          {saved.length === 0 ? (
            <EmptyState title={t('dash.savedSuppliersEmpty')} cta={{ to: '/suppliers', label: t('buyerDash.browseProducts') }} />
          ) : (
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {saved.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"><ShoppingCart className="size-4" /></span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/suppliers?id=${s.id}`} className="line-clamp-1 font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{s.name}</Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400"><MapPin className="inline size-3" /> {s.city}, {s.state}</div>
                  </div>
                  <VerificationBadge state={s.verified} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function Sidebar({ user, verification }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="font-['Plus Jakarta Sans'] text-base font-bold tracking-tight text-[#102A43] dark:text-white">{user.profile?.fullName}</div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
        <ShoppingCart className="size-3.5" /> {t('account.roleBuyer')}
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('dash.profile')}</div>
      <div className="mt-2 space-y-1.5 text-sm">
        <Row label={t('forms.businessName')} value={user.profile?.businessName} />
        <Row label={t('forms.state')} value={user.profile?.state} />
        <Row label={t('forms.city')} value={user.profile?.city} />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('verify.stage1')}</div>
      <div className="mt-1">
        <VerificationBadge state={verification.stage1 === 'verified' ? 'verified' : verification.stage1} size="sm" />
      </div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('verify.stage2')}</div>
      <div className="mt-1">
        <VerificationBadge state={verification.stage2} size="sm" />
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate text-[#102A43] dark:text-white">{value || '—'}</span>
    </div>
  )
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id} onClick={() => onChange(tab.id)} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${active === tab.id ? 'bg-white text-[#102A43] shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:text-[#102A43] dark:text-slate-300 dark:hover:text-white'}`}>
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && <span className="font-['Plus Jakarta Sans'] rounded bg-slate-200 px-1.5 text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-300">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ title, body, cta }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
      <div className="font-semibold text-[#102A43] dark:text-white">{title}</div>
      {body && <p className="mt-1">{body}</p>}
      {cta && <Link to={cta.to} className="mt-3 inline-flex rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">{cta.label}</Link>}
    </div>
  )
}

function OrderCard({ order, products, onCancel }) {
  const { t } = useTranslation()
  const supplierId = order.items[0]?.supplierId
  const supplierName = order.items[0]?.name ? '' : ''
  const subtotal = order.items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0)
  const statusKeys = {
    pending_seller: 'pendingOrders',
    accepted: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled',
    rejected: 'cancelled',
    processing: 'confirmed',
    dispatched: 'confirmed',
    delivered: 'completed',
  }
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('buyerDash.orderRef')}</div>
          <div className="font-['Plus Jakarta Sans'] text-base font-bold tabular-nums text-[#102A43] dark:text-white">{order.reference}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700'}`}>
          {t(`buyerDash.orderStatus.${order.status}`) || t(`buyerDash.${statusKeys[order.status] || 'all'}`)}
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {order.items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm">
            <Package className="mt-0.5 size-4 text-teal-600" />
            <div className="flex-1 min-w-0">
              <Link to={`/products?p=${it.productId}`} className="font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{it.name}</Link>
              <div className="text-xs text-slate-500 dark:text-slate-400">{formatInr(it.quantity)} {it.unit} × {it.price ? formatInr(it.price) : t('productDetail.byQuote')}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t('buyerDash.expectedTotal')}</div>
          <div className="font-['Plus Jakarta Sans'] text-lg font-extrabold tabular-nums text-[#102A43] dark:text-white">{formatInr(subtotal)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t('buyerDash.ordered')}</div>
          <div className="text-sm text-slate-700 dark:text-slate-200">{formatIndianDate(order.placedAt)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t('verify.stage2')}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{order.address}</div>
        </div>
      </div>

      <details className="mt-3 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
        <summary className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">{t('buyerDash.timeline')}</summary>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {order.events.map((event, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-teal-600" />
              {event.label} · {formatIndianDate(event.at)}
            </li>
          ))}
        </ul>
      </details>

      {order.status === 'pending_seller' && (
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={() => onCancel(order.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800">
            <X className="size-3.5" /> {t('buyerDash.cancelOrder')}
          </button>
        </div>
      )}
    </article>
  )
}

const STATUS_STYLES = {
  pending_seller: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800',
  accepted: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800',
  processing: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800',
  dispatched: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800',
  delivered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800',
}

function CartSummary({ groups, store, setStore, userId, pushToast }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [address, setAddress] = useState(groups[0]?.supplier?.city ? '' : '')
  const [notes, setNotes] = useState('')

  function updateQty(group, productId, delta) {
    setStore((state) => {
      const next = { ...state, carts: { ...state.carts } }
      const userCart = { ...(next.carts[userId] || {}) }
      const list = [...(userCart[group.supplierId] || [])]
      const idx = list.findIndex((l) => l.productId === productId)
      if (idx < 0) return state
      const product = state.catalog.products.find((p) => p.id === productId)
      list[idx] = { ...list[idx], quantity: Math.max(product?.moq || 1, list[idx].quantity + delta) }
      userCart[group.supplierId] = list
      next.carts[userId] = userCart
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
  }

  function removeLine(group, productId) {
    setStore((state) => {
      const next = { ...state, carts: { ...state.carts } }
      const userCart = { ...(next.carts[userId] || {}) }
      const list = (userCart[group.supplierId] || []).filter((l) => l.productId !== productId)
      userCart[group.supplierId] = list
      next.carts[userId] = userCart
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
  }

  function placeOrder() {
    if (!address.trim()) { pushToast?.(t('errors.addressRequired')); return }
    const baseId = 'ord-' + Math.random().toString(16).slice(2, 10)
    const refNum = Object.keys(store.orders).length + groups.length
    setStore((state) => {
      const next = { ...state, orders: { ...state.orders }, carts: { ...state.carts } }
      groups.forEach((group, idx) => {
        const orderItems = group.items.map(({ productId, quantity }) => {
          const product = state.catalog.products.find((p) => p.id === productId)
          return {
            productId,
            name: product?.name,
            unit: product?.unit,
            quantity,
            price: product?.byQuote ? null : product?.price,
            supplierId: group.supplierId,
          }
        })
        const reference = `AB-${String(refNum + idx).padStart(4, '0')}`
        const orderId = baseId + '-' + idx
        next.orders[orderId] = {
          id: orderId,
          userId,
          reference,
          status: 'pending_seller',
          items: orderItems,
          address: address.trim(),
          notes: notes.trim(),
          placedAt: new Date().toISOString(),
          events: [{ at: new Date().toISOString(), label: 'Order placed' }],
        }
      })
      next.carts[userId] = {}
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
    window.dispatchEvent(new Event('ab:orders-changed'))
    pushToast?.(t('buyerDash.orderPlaced'))
    navigate('/account?tab=orders')
  }

  const total = groups.reduce((s, g) => s + g.subtotal, 0)
  const hasByQuote = groups.some((g) => g.items.some(({ productId }) => store.catalog.products.find((p) => p.id === productId)?.byQuote))
  return (
    <div>
      {groups.map((group) => (
        <div key={group.supplierId} className="mb-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
          <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#102A43] dark:text-white">
            <span>{t('cart.supplierGroup', { supplier: group.supplier?.name || 'Supplier' })}</span>
            <VerificationBadge state={group.supplier?.verified} size="sm" />
          </div>
          <ul className="mt-3 space-y-2">
            {group.items.map(({ productId, quantity }) => {
              const product = store.catalog.products.find((p) => p.id === productId)
              if (!product) return null
              return (
                <li key={productId} className="flex items-start gap-3 text-sm">
                  <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#102A43] dark:text-white">{product.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{product.byQuote ? t('productDetail.byQuote') : `${formatInr(product.price)} / ${product.unit}`} · MOQ {formatInr(product.moq)} {product.unit}</div>
                  </div>
                  <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => updateQty(group, productId, -1)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">−</button>
                    <span className="grid h-9 w-12 place-items-center bg-white text-sm font-semibold tabular-nums dark:bg-slate-800">{quantity}</span>
                    <button type="button" onClick={() => updateQty(group, productId, 1)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">+</button>
                  </div>
                  <button type="button" onClick={() => removeLine(group, productId)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/30" aria-label={t('common.remove')}><Trash2 className="size-4" /></button>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('common.minOrder')}: {formatInr(group.subtotal)} {hasByQuote ? '+ by-quote items' : ''}</div>
            <Link to={`/suppliers?id=${group.supplierId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
              <Link2 className="size-3.5" /> {t('buyerDash.viewSupplier')}
            </Link>
          </div>
        </div>
      ))}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('buyerDash.deliveryAddress')}</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('placeholders.deliveryAddress')} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('buyerDash.deliveryNotes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('placeholders.deliveryNotes')} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-[#E8F7F4] p-4 ring-1 ring-teal-200 dark:bg-teal-900/20 dark:ring-teal-800">
        <div>
          <div className="text-sm font-semibold text-[#102A43] dark:text-white">{t('cart.subtotal')}</div>
          <div className="font-['Plus Jakarta Sans'] text-2xl font-extrabold text-[#102A43] dark:text-white">{formatInr(total)} <span className="text-sm font-medium text-slate-500">{hasByQuote ? '+ by-quote items' : ''}</span></div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{t('buyerDash.paymentNote')}</div>
        </div>
        <button type="button" onClick={placeOrder} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-500">
          <ShoppingCart className="size-4" /> {t('buyerDash.placeOrder')}
        </button>
      </div>
    </div>
  )
}

// helper to keep the order id naming consistent above
function id() {
  return Math.random().toString(16).slice(2, 10)
}
