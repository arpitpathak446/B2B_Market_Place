import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import Toaster, { useToasts } from '../components/Toaster.jsx'
import PageShell from '../components/PageShell.jsx'
import AuthPanel from '../components/account/AuthPanel.jsx'
import BuyerDash from '../components/account/BuyerDash.jsx'
import SellerDash from '../components/account/SellerDash.jsx'
import AdminDash from '../components/account/AdminDash.jsx'
import { hydrateStore, getStore, setStore, readSession, writeSession } from '../data/store.js'

export default function Account() {
  const { t } = useTranslation()
  const [sp, setSp] = useSearchParams()
  const toasts = useToasts()
  const [, force] = useState(0)
  const [mode, setMode] = useState(sp.get('mode') || 'signin')

  useEffect(() => {
    hydrateStore()
    force((n) => n + 1)
  }, [])

  const [session, setSession] = useState(() => readSession())

  useEffect(() => {
    if (sp.get('mode')) setMode(sp.get('mode'))
  }, [sp])

  const store = getStore()
  const user = session ? store.users[session.userId] : null
  const role = user?.role

  function changeMode(next) {
    setMode(next)
    if (next === 'signin') setSp({}, { replace: true })
    else setSp({ mode: next }, { replace: true })
  }

  function signOut() {
    writeSession(null)
    setSession(null)
    setMode('signin')
    setSp({}, { replace: true })
    toasts.push(t('errors.signedOut'))
  }

  function signedIn() {
    const s = readSession()
    setSession(s)
    force((n) => n + 1)
  }

  return (
    <PageShell
      title={user ? `${user.profile?.fullName} — ${t('nav.account')}` : t('account.seoTitle')}
      description={t('account.seoDescription')}
    >
      <Toaster {...toasts} />
      <DemoBanner />
      <Nav />
      <main id="main" className="bg-[#F7F9FC] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {!user ? (
            <AuthPanel mode={mode} onModeChange={changeMode} onSignedIn={signedIn} pushToast={(msg) => toasts.push(msg)} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[#102A43] px-5 py-4 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wide text-teal-300">{role === 'admin' ? t('account.roleAdmin') : role === 'seller' ? t('account.roleSeller') : role === 'both' ? 'Buyer + Seller' : t('account.roleBuyer')}</div>
                  <div className="font-['Plus Jakarta Sans'] text-xl font-extrabold tracking-tight">{t('account.signedInAs', { name: user.profile?.fullName })}</div>
                  <div className="text-xs text-slate-300">{user.email}</div>
                </div>
                <button type="button" onClick={signOut} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">{t('nav.signout')}</button>
              </div>
              {role === 'admin' ? (
                <AdminDash store={store} setStore={setStore} pushToast={(msg) => toasts.push(msg)} />
              ) : role === 'seller' || role === 'both' ? (
                <SellerDash userId={user.id} store={store} setStore={setStore} pushToast={(msg) => toasts.push(msg)} />
              ) : (
                <BuyerDash userId={user.id} store={store} setStore={setStore} pushToast={(msg) => toasts.push(msg)} />
              )}
              {role === 'both' && (
                <BuyerDash userId={user.id} store={store} setStore={setStore} pushToast={(msg) => toasts.push(msg)} />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </PageShell>
  )
}
