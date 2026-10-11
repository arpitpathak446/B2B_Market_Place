import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ArrowRight } from 'lucide-react'
import { Reveal, SplitText } from '../motion.jsx'

const SCOPES = ['products', 'suppliers', 'categories']

export default function Hero({ onSearch }) {
  const { t } = useTranslation()
  const [scope, setScope] = useState('products')
  const [draft, setDraft] = useState('')

  function submit(e) {
    e.preventDefault()
    onSearch?.({ scope, q: draft.trim() })
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#102A43] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-30">
        <img src="/public/image_19561ff2-5_2026-10-10" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102A43] via-[#102A43]/85 to-[#102A43]/55" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300 ring-1 ring-white/15">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              {t('home.heroEyebrow')}
            </span>
          </Reveal>

          <h1 className="mt-5 font-['Plus Jakarta Sans'] text-4xl font-extrabold leading-tight tracking-tight md:text-6xl text-balance">
            <SplitText as="span">{t('home.heroTitle')}</SplitText>
          </h1>

          <Reveal delay={0.15}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">{t('home.heroSubtitle')}</p>
          </Reveal>

          <Reveal delay={0.25}>
            <form onSubmit={submit} className="mt-8 max-w-2xl rounded-2xl bg-white p-2 text-slate-900 shadow-xl ring-1 ring-white/20">
              <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
                {SCOPES.map((s) => (
                  <label key={s} className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${scope === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <input type="radio" name="scope" value={s} checked={scope === s} onChange={() => setScope(s)} className="sr-only" />
                    {t(`home.searchScope.${s}`)}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Search className="ml-3 size-5 text-slate-400" />
                <input
                  type="search"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  aria-label={t('home.searchPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500"
                >
                  <Search className="size-4" />
                  {t('home.exploreCta')}
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/products" className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-[#102A43] transition hover:bg-teal-400">
                {t('home.exploreCta')}
                <ArrowRight className="size-4" />
              </a>
              <a href="/account?mode=register" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15">
                {t('home.sellerCta')}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
