import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Menu, X, ShoppingCart, User, ChevronRight } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.jsx'
import { hydrateStore, getCartCount, readSession, getStore } from '../data/store.js'

export default function Nav() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    hydrateStore()
    setSession(readSession())
  }, [])

  useEffect(() => {
    setSession(readSession())
    setCartCount(getCartCount(readSession()?.userId))
  }, [location.pathname])

  // Refresh cart count whenever the cart changes (cross-tab too).
  useEffect(() => {
    function refresh() {
      const s = readSession()
      setSession(s)
      setCartCount(getCartCount(s?.userId))
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('ab:cart-changed', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('ab:cart-changed', refresh)
    }
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/suppliers', label: t('nav.suppliers') },
    { to: '/account', label: t('nav.account') },
  ]

  const initials = session?.userId
    ? (function () {
        const user = getStore().users[session.userId]
        const name = user?.profile?.fullName || user?.email || '?'
        return name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('') || '·'
      })()
    : null

  return (
    <header className="sticky top-0 z-40 bg-[#102A43] text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-md bg-teal-500/20 ring-1 ring-teal-400/40">
              <span className="text-lg font-extrabold tracking-tight text-teal-300">A</span>
            </span>
            <span className="font-['Plus Jakarta Sans'] text-lg font-extrabold tracking-tight">{t('brand.name')}</span>
          </Link>

          <nav aria-label={t('common.primary')} className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `nav-link rounded-md px-3 py-2 text-sm font-medium transition hover:text-teal-300 ${isActive ? 'text-teal-300' : 'text-slate-200'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/account?mode=cart"
              aria-label={t('nav.cart')}
              className="relative grid h-11 w-11 place-items-center rounded-md text-slate-100 transition hover:bg-white/5 hover:text-teal-300"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-teal-500 px-1 text-[11px] font-bold text-[#102A43]">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
              className="grid h-11 w-11 place-items-center rounded-md text-slate-100 transition hover:bg-white/5 hover:text-teal-300"
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            {session ? (
              <Link
                to="/account"
                className="hidden sm:flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-teal-500 text-xs font-extrabold text-[#102A43]">{initials}</span>
                <span className="hidden lg:inline">{t('account.signedInAs', { name: getStore().users[session.userId]?.profile?.fullName?.split(' ')[0] || 'account' })}</span>
              </Link>
            ) : (
              <Link to="/account" className="hidden sm:inline-flex items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-bold text-[#102A43] transition hover:bg-teal-400">
                {t('nav.signin')}
                <ChevronRight className="size-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={open}
              className="md:hidden grid h-11 w-11 place-items-center rounded-md text-slate-100 transition hover:bg-white/5"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <nav aria-label={t('common.mobile')} className="grid gap-1 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-base font-medium ${isActive ? 'bg-white/10 text-teal-300' : 'text-slate-100 hover:bg-white/5'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-1 flex flex-col gap-2 border-t border-white/10 pt-2">
                {session ? (
                  <Link to="/account" className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-3 text-sm font-semibold text-white">
                    <User className="size-4" />
                    {t('account.signedInAs', { name: getStore().users[session.userId]?.profile?.fullName?.split(' ')[0] || t('nav.account') })}
                  </Link>
                ) : (
                  <Link to="/account" className="rounded-lg bg-teal-500 px-3 py-3 text-sm font-bold text-center text-[#102A43]">{t('nav.signin')}</Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
