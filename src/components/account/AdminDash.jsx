import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CheckCircle2, X, Users, Store, ShieldCheck, Boxes, Flag, ScrollText, Megaphone } from 'lucide-react'
import VerificationBadge from '../VerificationBadge.jsx'
import { formatIndianDate, formatInr } from '../../utils/inr.js'

export default function AdminDash({ store, setStore, pushToast }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('overview')
  const counts = computeCounts(store)

  function approveUser(userId, stage2) {
    setStore((s) => {
      const next = { ...s, users: { ...s.users }, auditLogs: [...(s.auditLogs || [])] }
      next.users[userId] = { ...next.users[userId], verification: { ...next.users[userId].verification, stage2 } }
      next.auditLogs.push({ id: 'a-' + Math.random().toString(16).slice(2, 8), at: new Date().toISOString(), actor: 'admin', action: `verification_${stage2}`, targetId: userId })
      return next
    })
    window.dispatchEvent(new Event('ab:counts-changed'))
    pushToast?.(stage2 === 'verified' ? t('admin.approved') : t('admin.updated'))
  }
  function closeReport(reportId) {
    setStore((s) => ({ ...s, reports: s.reports.map((r) => r.id === reportId ? { ...r, status: 'closed', closedAt: new Date().toISOString() } : r) }))
    pushToast?.(t('errors.reportClosed'))
  }
  function publishAnnouncement(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const title = String(data.get('title') || '').trim()
    const body = String(data.get('body') || '').trim()
    if (!title || !body) return
    setStore((s) => ({ ...s, announcements: [{ id: 'an-' + Math.random().toString(16).slice(2, 8), title, body, at: new Date().toISOString() }, ...(s.announcements || [])] }))
    pushToast?.(t('admin.settingsSaved'))
    e.target.reset()
  }

  const tabs = [
    { id: 'overview', label: t('dash.tabs.admin') },
    { id: 'queue', label: t('dash.tabs.reviewQueue') },
    { id: 'reports', label: t('dash.tabs.reported') },
    { id: 'announce', label: t('dash.tabs.announcements') },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="font-['Plus Jakarta Sans'] text-base font-bold tracking-tight text-[#102A43] dark:text-white">{t('admin.title')}</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('admin.subtitle')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label={t('admin.counts.buyers')} value={counts.buyers} />
            <Stat label={t('admin.counts.sellers')} value={counts.sellers} />
            <Stat label={t('admin.counts.verified')} value={counts.verified} />
            <Stat label={t('admin.counts.pendingVerification')} value={counts.pending} />
            <Stat label={t('admin.counts.products')} value={counts.products} />
            <Stat label={t('admin.counts.orders')} value={counts.orders} />
          </div>
        </div>
      </aside>

      <section className="lg:col-span-9 space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((it) => (
            <button key={it.id} type="button" onClick={() => setTab(it.id)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === it.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>{it.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold text-[#102A43] dark:text-white">{t('admin.recentOrders')}</h3>
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {Object.values(store.orders).slice(-6).reverse().map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div>
                      <div className="font-['Plus Jakarta Sans'] font-bold tabular-nums text-[#102A43] dark:text-white">{o.reference}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{o.items.map((it) => it.name).join(', ')}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      o.status === 'completed' || o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800'
                      : o.status === 'rejected' || o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800'
                      : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800'
                    }`}>{o.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'queue' && (
          <ReviewQueue store={store} onDecision={approveUser} />
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            <h3 className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('dash.tabs.reported')}</h3>
            {store.reports.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">{t('admin.reportedEmpty')}</div>
            ) : (
              <ul className="space-y-2">
                {store.reports.map((r) => {
                  const target = r.type === 'product' ? store.catalog.products.find((p) => p.id === r.targetId)
                    : r.type === 'supplier' ? store.catalog.suppliers.find((s) => s.id === r.targetId)
                    : r
                  return (
                    <li key={r.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-semibold uppercase tracking-wide text-xs text-slate-500 dark:text-slate-400">{t('admin.' + r.type + 'Report')}</span>
                          <div className="text-base font-semibold text-[#102A43] dark:text-white">{r.note}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{formatIndianDate(r.at)}</div>
                        </div>
                        {target && (
                          <Link to={r.type === 'product' ? `/products?p=${target.id}` : `/suppliers?id=${target.id}`} className="text-sm font-semibold text-teal-700 hover:underline">
                            {t('admin.openTarget')}
                          </Link>
                        )}
                        <button type="button" onClick={() => closeReport(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                          <CheckCircle2 className="size-3.5" />{t('admin.close')}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {tab === 'announce' && (
          <form onSubmit={publishAnnouncement} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="font-['Plus Jakarta Sans'] text-lg font-bold text-[#102A43] dark:text-white">{t('dash.tabs.announcements')}</h3>
            <div className="mt-3 grid gap-3">
              <label className="block">
                <span className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('admin.announcementTitle')}</span>
                <input name="title" required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('admin.announcementBody')}</span>
                <textarea name="body" rows={3} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              <button type="submit" className="justify-self-start inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white"><Megaphone className="size-4" />{t('admin.publish')}</button>
            </div>
            <div className="mt-4">
              <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('admin.published')}</h4>
              <ul className="mt-2 space-y-2">
                {(store.announcements || []).map((a) => (
                  <li key={a.id} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="text-sm font-semibold text-[#102A43] dark:text-white">{a.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{a.body}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatIndianDate(a.at)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-['Plus Jakarta Sans'] text-xl font-extrabold tabular-nums text-[#102A43] dark:text-white">{value}</div>
    </div>
  )
}

function ReviewQueue({ store, onDecision }) {
  const { t } = useTranslation()
  const queue = Object.values(store.users).filter((u) => u.verification?.stage2 === 'pending' || u.verification?.stage2 === 'under_review' || u.verification?.stage2 === 'docs_required')

  if (queue.length === 0) {
    return <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">{t('admin.reviewQueueEmpty')}</div>
  }
  return (
    <ul className="space-y-3">
      {queue.map((u) => (
        <li key={u.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-['Plus Jakarta Sans'] text-base font-bold tracking-tight text-[#102A43] dark:text-white">{u.profile?.fullName} <span className="text-sm font-normal text-slate-500">/ {u.profile?.businessName}</span></div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{u.email} · {u.phone}</div>
            </div>
            <VerificationBadge state={u.verification.stage2} />
          </div>
          <div className="mt-3 grid flex-wrap gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => onDecision(u.id, 'verified')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="size-3.5" />{t('admin.actions.approve')}</button>
            <button type="button" onClick={() => onDecision(u.id, 'docs_required')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><ScrollText className="size-3.5" />{t('admin.actions.requestDocs')}</button>
            <button type="button" onClick={() => onDecision(u.id, 'rejected')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:border-rose-400 dark:border-slate-700 dark:bg-slate-800"><X className="size-3.5" />{t('admin.actions.reject')}</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function computeCounts(store) {
  const users = Object.values(store.users)
  const orders = Object.values(store.orders)
  return {
    buyers: users.filter((u) => ['buyer', 'both'].includes(u.role)).length,
    sellers: users.filter((u) => ['seller', 'both'].includes(u.role)).length,
    verified: users.filter((u) => u.verification?.stage2 === 'verified').length,
    pending: users.filter((u) => u.verification?.stage2 === 'pending' || u.verification?.stage2 === 'under_review' || u.verification?.stage2 === 'docs_required').length,
    products: store.catalog.products.length,
    orders: orders.length,
  }
}
