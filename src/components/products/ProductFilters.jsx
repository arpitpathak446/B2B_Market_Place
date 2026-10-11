import { useTranslation } from 'react-i18next'
import { Filter, X } from 'lucide-react'

// Pure filter component for the products page. `state` shape:
// { category, state, verifiedOnly, priceMax, moqMax, availability, sort }
// `onChange` is called with the next state object.
export default function ProductFilters({ state, onChange, options, total, filtered }) {
  const { t } = useTranslation()
  const categories = options.categories
  const states = options.states

  function update(next) {
    onChange({ ...state, ...next })
  }

  const activeChips = [
    state.category !== 'all' && { key: 'category', value: categories.includes(state.category) ? t(`categories.list.${state.category}`) : state.category },
    state.state !== 'all' && { key: 'state', value: state.state },
    state.verifiedOnly && { key: 'verifiedOnly', value: t('products.filterVerified') },
    state.availability !== 'any' && { key: 'availability', value: t(`products.availability.${state.availability}`) },
    (state.priceMax < 100000) && { key: 'priceMax', value: `≤ ${t('common.rupees')}${state.priceMax}` },
    (state.moqMax < 100000) && { key: 'moqMax', value: `${t('productDetail.moq')} ≤ ${state.moqMax}` },
  ].filter(Boolean)

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#102A43] dark:text-white">
          <Filter className="size-4 text-teal-600" />
          {t('products.filters')}
        </div>
        <button
          type="button"
          onClick={() => onChange({ category: 'all', state: 'all', verifiedOnly: false, priceMax: 100000, moqMax: 100000, availability: 'any', sort: state.sort })}
          className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
        >
          {t('products.clearFilters')}
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('products.filterCategory')}</label>
          <select
            value={state.category}
            onChange={(e) => update({ category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{t(`categories.list.${c}`)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('products.filterState')}</label>
          <select
            value={state.state}
            onChange={(e) => update({ state: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('products.filterAvailability')}</label>
          <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {['any', 'inStock', 'byQuote'].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => update({ availability: a })}
                className={`rounded-md px-2 py-1.5 text-xs font-semibold ${state.availability === a ? 'bg-white text-[#102A43] shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t(`products.availability.${a}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('products.filterPrice')}
            <span className="text-[#102A43] dark:text-white tabular-nums">≤ {t('common.rupees')}{state.priceMax.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="range" min="500" max="100000" step="500"
            value={state.priceMax}
            onChange={(e) => update({ priceMax: Number(e.target.value) })}
            className="mt-1 w-full accent-teal-600"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('products.filterMoq')}
            <span className="text-[#102A43] dark:text-white tabular-nums">≤ {state.moqMax.toLocaleString('en-IN')}</span>
          </label>
          <input
            type="range" min="1" max="100000" step="1"
            value={state.moqMax}
            onChange={(e) => update({ moqMax: Number(e.target.value) })}
            className="mt-1 w-full accent-teal-600"
          />
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
          <input type="checkbox" checked={state.verifiedOnly} onChange={(e) => update({ verifiedOnly: e.target.checked })} className="size-4 accent-teal-600" />
          <span className="text-sm text-slate-700 dark:text-slate-200">{t('products.filterVerified')}</span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => update({ [chip.key]: chip.key === 'verifiedOnly' ? false : (chip.key === 'priceMax' || chip.key === 'moqMax') ? 100000 : 'all' })}
            className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-200 dark:hover:bg-teal-900/60"
          >
            {chip.value}
            <X className="size-3" />
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t('products.results', { count: filtered })} {filtered !== total ? `(${total} ${t('common.from')} marketplace)` : ''}
      </div>
    </div>
  )
}
