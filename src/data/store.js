// Store that wraps localStorage. Reads return defensive defaults; writes are
// synchronous so the UI updates immediately.
//
// All cross-page data lives here: a single account + a single cart, one active
// session, a marketplace catalog that's seeded once and then read-only, and
// an orders list keyed to the user. The marketplace counts are derived from
// local data so the home stats card reflects real numbers on this device.
//
// CRITICAL: this module is imported by code that runs at render time, so it
// must not touch `window`, `document`, `localStorage` or `matchMedia` outside
// useEffect guards. The helper getters below are pure computations over the
// in-memory cache that hydrateStore() repopulates inside an effect.

import { CATEGORIES, PRODUCTS, SUPPLIERS, DEMO_ACCOUNTS } from './seed.js'

const STORAGE_KEY = 'pd:allbusinesses:v1'
const SESSION_KEY = 'pd:allbusinesses:session'

// In-memory cache, populated by hydrateStore() once on the client. Re-reading
// the storage on every render would be both slow and unsafe at pre-render time.
let cache = null

export function defaultState() {
  return {
    catalog: {
      categories: CATEGORIES,
      suppliers: SUPPLIERS,
      products: PRODUCTS,
    },
    businesses: {},           // supplierId -> { verified state, verification document names, etc. }
    users: {},                // userId -> account record
    orders: {},               // orderId -> order
    carts: {},                // userId -> { supplierId -> [{ productId, quantity }] }
    savedSuppliers: {},       // userId -> [supplierId]
    reports: [],              // { id, type, targetId, note, status }
    announcements: [],
    auditLogs: [],
    seedVersion: 1,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // We trust the schema; if it doesn't match, fall back to defaults.
      if (parsed && parsed.seedVersion === 1) return parsed
    }
  } catch {}
  return defaultState()
}

function persist(next) {
  cache = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {}
}

// Runs once on mount inside every shell component that uses the store.
// Safe to call multiple times — it just refreshes `cache`.
export function hydrateStore() {
  cache = load()
  seedDemoAccountsIfMissing()
  ensureCartForDemoAccount()
  return cache
}

export function getStore() {
  if (!cache) cache = load()
  return cache
}

export function setStore(updater) {
  const current = getStore()
  const next = typeof updater === 'function' ? updater(current) : updater
  persist(next)
  return next
}

export function resetStore() {
  const fresh = defaultState()
  persist(fresh)
  seedDemoAccountsIfMissing()
  ensureCartForDemoAccount()
  return cache
}

// --- Sessions --------------------------------------------------------------

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.userId) return null
    return parsed
  } catch {
    return null
  }
}

export function writeSession(value) {
  try {
    if (!value) localStorage.removeItem(SESSION_KEY)
    else localStorage.setItem(SESSION_KEY, JSON.stringify(value))
  } catch {}
}

// --- Helpers ---------------------------------------------------------------

function seedDemoAccountsIfMissing() {
  if (!cache.users) cache.users = {}
  DEMO_ACCOUNTS.forEach((account) => {
    if (!cache.users[account.id]) {
      cache.users[account.id] = {
        id: account.id,
        role: account.role,
        email: account.email,
        password: account.password,
        profile: account.profile,
        createdAt: new Date().toISOString(),
        emailVerified: true,                                 // demo accounts skip OTP
        phoneVerified: true,
        phone: '98' + account.id.replace(/\D/g, '').padEnd(8, '0').slice(0, 8),
        verification: account.role === 'admin'
          ? { stage1: 'verified', stage2: 'verified' }
          : account.role === 'seller' && account.profile.supplierLink !== 's-pacflex'
            ? { stage1: 'verified', stage2: 'verified' }
            : { stage1: 'verified', stage2: 'under_review' },
        gstinOptional: true,
      }
      if (account.profile.supplierLink) {
        cache.businesses[account.profile.supplierLink] = {
          ownerId: account.id,
          verification: cache.users[account.id].verification,
        }
      }
    }
  })
  persist(cache)
}

function ensureCartForDemoAccount() {
  if (!cache.carts) cache.carts = {}
  // Buyer's cart pre-loaded with one box product from a verified supplier so
  // the cart drawer has something visible on first open.
  if (!cache.carts['demo-buyer-1']) {
    cache.carts['demo-buyer-1'] = {
      's-pacflex': [
        { productId: 'p-008', quantity: 200 },
      ],
    }
    persist(cache)
  }
  if (!cache.savedSuppliers) cache.savedSuppliers = {}
  if (!cache.savedSuppliers['demo-buyer-1']) {
    cache.savedSuppliers['demo-buyer-1'] = ['s-arvind', 's-granary']
    persist(cache)
  }
  if (!cache.orders) cache.orders = {}
  // Seed a completed buyer order and one awaiting-seller order.
  if (!Object.values(cache.orders).some((o) => o.userId === 'demo-buyer-1')) {
    const placed = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    cache.orders['demo-order-1'] = {
      id: 'demo-order-1',
      userId: 'demo-buyer-1',
      reference: 'AB-0001',
      status: 'completed',
      items: [
        { productId: 'p-014', name: 'Premium Basmati Rice — 1121 Steam', unit: 'kg', quantity: 1000, price: 118, supplierId: 's-granary' },
      ],
      address: 'Brightline Textiles, 23, Residency Road, Bengaluru 560025',
      notes: 'Standard packaging please.',
      placedAt: placed,
      events: [
        { at: placed, label: 'Order placed' },
        { at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), label: 'Accepted' },
        { at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), label: 'Dispatched' },
        { at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), label: 'Delivered' },
        { at: new Date().toISOString(), label: 'Completed' },
      ],
    }
    cache.orders['demo-order-2'] = {
      id: 'demo-order-2',
      userId: 'demo-buyer-1',
      reference: 'AB-0002',
      status: 'pending_seller',
      items: [
        { productId: 'p-016', name: 'A4 Copier Paper 80 GSM — Carton', unit: 'carton', quantity: 5, price: 2380, supplierId: 's-workhive' },
      ],
      address: 'Brightline Textiles, 23, Residency Road, Bengaluru 560025',
      notes: '',
      placedAt: new Date().toISOString(),
      events: [{ at: new Date().toISOString(), label: 'Order placed' }],
    }
    persist(cache)
  }
  if (!cache.orders['demo-order-seller-1']) {
    cache.orders['demo-order-seller-1'] = {
      id: 'demo-order-seller-1',
      userId: 'demo-buyer-1',
      reference: 'AB-0003',
      status: 'pending_seller',
      items: [
        { productId: 'p-007', name: 'Custom-Printed Mailer Box (10x8x4 in)', unit: 'box', quantity: 800, price: 28, supplierId: 's-pacflex' },
      ],
      address: 'Brightline Textiles, 23, Residency Road, Bengaluru 560025',
      notes: 'Two-colour outside print.',
      placedAt: new Date().toISOString(),
      events: [{ at: new Date().toISOString(), label: 'Order placed' }],
    }
    persist(cache)
  }
}

// --- Selectors -------------------------------------------------------------

export function getMarketplaceCounts() {
  const state = getStore()
  const buyers = Object.values(state.users).filter((u) => ['buyer', 'both'].includes(u.role)).length
  const sellers = Object.values(state.users).filter((u) => ['seller', 'both'].includes(u.role)).length
  let verified = 0
  let underReview = 0
  Object.values(state.users).forEach((u) => {
    if (u.verification?.stage2 === 'verified') verified++
    else if (u.verification?.stage2 === 'under_review' || u.verification?.stage2 === 'pending') underReview++
  })
  const activeProducts = state.catalog.products.filter((p) => p.stockState !== 'archived').length
  const ordersToday = Object.values(state.orders).filter((o) => {
    const today = new Date().toISOString().slice(0, 10)
    return o.placedAt && o.placedAt.slice(0, 10) === today
  }).length
  return {
    buyers,
    sellers,
    verified,
    pendingVerification: underReview,
    products: activeProducts,
    ordersToday,
  }
}

export function getCartCount(userId) {
  if (!userId) return 0
  const state = getStore()
  const cart = state.carts[userId] || {}
  return Object.values(cart).reduce((sum, items) => sum + items.reduce((s, i) => s + i.quantity, 0), 0)
}

export function getCartDetails(userId) {
  if (!userId) return []
  const state = getStore()
  const cart = state.carts[userId] || {}
  const suppliers = Object.entries(cart)
  return suppliers.map(([supplierId, items]) => {
    const products = items.map((line) => {
      const product = state.catalog.products.find((p) => p.id === line.productId)
      return { ...line, product }
    })
    const supplier = state.catalog.suppliers.find((s) => s.id === supplierId)
    const subtotal = products.reduce((sum, { product, quantity }) => {
      if (!product || product.byQuote) return sum
      return sum + product.price * quantity
    }, 0)
    return { supplierId, supplier, items: products, subtotal }
  })
}

export function nextOrderReference() {
  const state = getStore()
  const count = Object.keys(state.orders).length + 1
  return `AB-${String(count).padStart(4, '0')}`
}
