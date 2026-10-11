import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { X, MapPin, Minus, Plus, Flag, MessageCircle, BadgePercent } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { getStore, setStore, readSession } from '../../data/store.js'
import { formatInr } from '../../utils/inr.js'

// Drawer that overlays the page when a product is opened from the catalog.
export default function ProductDetail({ productId, onClose, onAdd, onReport, onQuote, pushToast }) {
  const { t } = useTranslation()
  const product = getStore().catalog.products.find((p) => p.id === productId)
  const [quantity, setQuantity] = useState(product?.moq || 1)

  useEffect(() => {
    setQuantity(product?.moq || 1)
  }, [productId])

  if (!product) {
    return (
      <Drawer onClose={onClose}>
        <div className="p-6 text-sm text-slate-600 dark:text-slate-300">{t('productDetail.notFound')}</div>
      </Drawer>
    )
  }

  const availability = {
    in_stock: { label: t('productDetail.inStock'), className: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800' },
    low_stock: { label: t('productDetail.lowStock'), className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800' },
    out_of_stock: { label: t('productDetail.outOfStock'), className: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800' },
    by_quote: { label: t('productDetail.byQuote'), className: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800' },
  }[product.stockState]

  function increment(delta) {
    setQuantity((q) => {
      const next = q + delta
      if (next < product.moq) return product.moq
      return next
    })
  }

  function add() {
    setStore((state) => {
      const next = { ...state, carts: { ...state.carts } }
      const session = readSession()
      const userId = session?.userId || 'guest'
      const userCart = { ...(next.carts[userId] || {}) }
      const supplierItems = [...(userCart[product.supplierId] || [])]
      const idx = supplierItems.findIndex((l) => l.productId === product.id)
      if (idx >= 0) {
        supplierItems[idx] = { ...supplierItems[idx], quantity: supplierItems[idx].quantity + quantity }
      } else {
        supplierItems.push({ productId: product.id, quantity })
      }
      userCart[product.supplierId] = supplierItems
      next.carts[userId] = userCart
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
    pushToast?.(t('productDetail.addedToCart'))
    onAdd?.(product.id, quantity)
  }

  function report() {
    onReport?.(product)
    pushToast?.(t('productDetail.reportedSent'))
  }

  return (
    <Drawer onClose={onClose}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-['Plus Jakarta Sans'] text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{product.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link to={`/suppliers?id=${product.supplierId}`} className="hover:text-teal-700 dark:hover:text-teal-300">{product.supplierName}</Link>
            {product.verified && <VerificationBadge state="verified" size="sm" />}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${availability.className}`}>{availability.label}</span>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('productDetail.close')} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="size-4" />
        </button>
      </div>

      <div className="grid items-start gap-1 px-5 py-4 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{product.shortDescription}</p>
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            {product.byQuote ? (
              <>
                <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300">{t('productDetail.byQuote')}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.priceHint')}</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold tabular-nums text-[#102A43] dark:text-white">{formatInr(product.price)} <span className="text-sm font-medium text-slate-500">/ {product.unit}</span></div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.priceHint')}</div>
              </>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.moq')}</div>
                <div className="font-semibold text-[#102A43] dark:text-white">{formatInr(product.moq)} {product.unit}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('productDetail.unit')}</div>
                <div className="font-semibold capitalize text-[#102A43] dark:text-white">{product.unit}</div>
              </div>
            </div>
          </div>

          {!product.byQuote && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('productDetail.quantityLabel')}</div>
              <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => increment(-1)} aria-label={t('common.decrease')} className="grid h-10 w-10 place-items-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Minus className="size-4" /></button>
                <input type="number" inputMode="numeric" min={product.moq} value={quantity} onChange={(e) => setQuantity(Math.max(product.moq, Number(e.target.value) || product.moq))} className="h-10 w-20 border-x border-slate-200 bg-white text-center text-base font-semibold tabular-nums text-[#102A43] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                <button type="button" onClick={() => increment(1)} aria-label={t('common.increase')} className="grid h-10 w-10 place-items-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Plus className="size-4" /></button>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('buyerDash.moqNote', { moq: formatInr(product.moq), unit: product.unit })}</div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {!product.byQuote ? (
              <button type="button" onClick={add} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500">
                {t('products.addToCart')}
              </button>
            ) : (
              <button type="button" onClick={() => onQuote?.(product)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-400">
                <BadgePercent className="size-4" />
                {t('products.requestQuote')}
              </button>
            )}
            <button type="button" onClick={() => onQuote?.(product)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300">
              <MessageCircle className="size-4" />
              {t('suppliers.contactSeller')}
            </button>
            <button type="button" onClick={report} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <Flag className="size-4" />
              {t('products.reportListing')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <section>
          <h3 className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('productDetail.specs')}</h3>
          <ul className="mt-2 grid gap-1.5 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:grid-cols-2">
            {product.specs.map((spec, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span aria-hidden="true" className="text-teal-600">•</span>
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('productDetail.shippingInfo')}</h3>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{product.shipping}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="size-3.5" />
            {t('productDetail.seller')} <Link to={`/suppliers?id=${product.supplierId}`} className="font-semibold text-[#102A43] hover:text-teal-700 dark:text-white dark:hover:text-teal-300">{product.supplierName}</Link>
          </p>
        </section>
      </div>
    </Drawer>
  )
}

function Drawer({ children, onClose }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex">
      <button type="button" aria-label={t('common.close')} onClick={onClose} className="flex-1 bg-slate-900/40 backdrop-blur-sm" />
      <div className="chat-pop relative flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-slate-900">
        {children}
      </div>
    </div>
  )
}
