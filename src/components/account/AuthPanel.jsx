import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Store, UserCog, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { DEMO_ACCOUNTS, STATES } from '../../data/seed.js'
import {
  hydrateStore, getStore, setStore, readSession, writeSession,
} from '../../data/store.js'
import {
  validateFullName, validateEmail, validateIndianPhone,
  validatePassword, validateGstin, normalizeGstin, normalizeIndianPhone,
} from '../../utils/validation.js'

// Sign in / register / forgot-password panel. Toggled by `mode` query param.
// On a successful sign-in or registration, writes the session and calls
// onSignedIn so the parent can swap to a dashboard.
export default function AuthPanel({ mode, onSignedIn, onModeChange, pushToast }) {
  const { t } = useTranslation()
  useEffect(() => { hydrateStore() }, [])

  function roleIcon(role) {
    if (role === 'buyer') return <User className="size-4" />
    if (role === 'seller') return <Store className="size-4" />
    return <UserCog className="size-4" />
  }

  function useDemo(demoId) {
    const account = DEMO_ACCOUNTS.find((a) => a.id === demoId)
    if (!account) return
    writeSession({ userId: account.id })
    onSignedIn?.()
    pushToast?.(t('errors.signInAs', { name: account.profile.fullName }))
  }

  if (mode === 'reset') return <ResetPanel onModeChange={onModeChange} pushToast={pushToast} />

  if (mode === 'register') return <RegisterPanel onModeChange={onModeChange} onSignedIn={onSignedIn} pushToast={pushToast} />

  return (
    <SignInPanel onModeChange={onModeChange} onSignedIn={onSignedIn} pushToast={pushToast} useDemo={useDemo} roleIcon={roleIcon} />
  )
}

function SignInPanel({ onModeChange, onSignedIn, pushToast, useDemo, roleIcon }) {
  const { t } = useTranslation()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  function submit(e) {
    e.preventDefault()
    const fieldEmpty = !emailOrPhone.trim() ? t('forms.errors.required') : null
    const passwordErr = password ? null : t('forms.errors.required')
    if (fieldEmpty || passwordErr) { setErrors({ first: fieldEmpty, password: passwordErr }); return }
    setErrors({})
    const user = Object.values(getStore().users).find((u) =>
      u.email?.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
      u.phone === emailOrPhone.trim().replace(/\D/g, '').slice(-10)
    )
    if (!user || user.password !== password) {
      setErrors({ first: t('errors.credentials') })
      return
    }
    writeSession({ userId: user.id })
    onSignedIn?.(user.role)
    pushToast?.(t('errors.welcome', { name: user.profile.fullName }))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7 rounded-3xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h1 className="font-['Plus Jakarta Sans'] text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('account.signinTitle')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('account.signinSubtitle')}</p>

        <form noValidate onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label={t('forms.email')}
            value={emailOrPhone}
            onChange={setEmailOrPhone}
            error={errors.first}
            placeholder={t('placeholders.email')}
            autoComplete="email"
            icon={<Mail className="size-4" />}
          />
          <Field
            label={t('forms.password')}
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock className="size-4" />}
          />
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="size-4 accent-teal-600" />
              {t('account.remember')}
            </label>
            <button type="button" onClick={() => onModeChange('reset')} className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300">
              {t('account.forgotPassword')}
            </button>
          </div>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500">
            {t('nav.signin')} <ArrowRight className="size-4" />
          </button>
          <button type="button" onClick={() => onModeChange('register')} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 text-center hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t('account.createOne')}
          </button>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-3">
        <div className="rounded-3xl bg-[#E8F7F4] p-6 ring-1 ring-teal-200 dark:bg-teal-900/20 dark:ring-teal-800">
          <div className="font-['Plus Jakarta Sans'] text-lg font-bold tracking-tight text-[#102A43] dark:text-white">{t('account.addDemoAccount')}</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('errors.demoHint')}</p>
          <ul className="mt-4 space-y-2">
            {DEMO_ACCOUNTS.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => useDemo(d.id)} className="flex w-full items-start gap-3 rounded-xl border border-teal-200 bg-white p-3 text-left hover:border-teal-400 hover:shadow-sm dark:border-teal-700 dark:bg-slate-800 dark:hover:border-teal-500">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">{roleIcon(d.role)}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#102A43] dark:text-white">{d.profile.fullName} · {d.role === 'admin' ? t('account.roleAdmin') : d.role === 'seller' ? t('account.roleSeller') : t('account.roleBuyer')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{d.email}</div>
                    <div className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                      {d.role === 'admin' ? t('account.demoAdminHint') : d.role === 'seller' ? t('account.demoSellerHint') : t('account.demoBuyerHint')}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function RegisterPanel({ onModeChange, onSignedIn, pushToast }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '+91 ', password: '', confirmPassword: '',
    businessName: '', businessType: 'manufacturer', state: 'Maharashtra', city: '',
    address: '', description: '', gstin: '', noGstin: false,
  })
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function next(e) {
    e.preventDefault()
    const errs = {}
    errs.fullName = validateFullName(form.fullName) ? t('forms.errors.' + validateFullName(form.fullName)) : null
    errs.email = validateEmail(form.email) ? t('forms.errors.' + validateEmail(form.email)) : null
    errs.phone = validateIndianPhone(form.phone.replace(/\D/g, '').slice(-10)) ? t('forms.errors.phone') : null
    errs.password = validatePassword(form.password) ? t('forms.errors.password') : null
    errs.confirmPassword = form.confirmPassword !== form.password ? t('forms.errors.passwordMatch') : null
    const bad = Object.values(errs).filter(Boolean)
    if (bad.length) { setErrors(errs); return }
    setErrors({})
    if (role === 'buyer') setStep(3)
    else setStep(2)
  }

  function submit(e) {
    e.preventDefault()
    const gstinErr = form.noGstin ? null : (validateGstin(form.gstin) ? t('forms.errors.gstin') : null)
    const descErr = form.description.length < 10 ? t('forms.errors.minLength', { count: 10 }) : null
    if (gstinErr || descErr) { setErrors({ gstin: gstinErr, description: descErr }); return }
    // Create the user.
    const userId = 'u-' + Math.random().toString(16).slice(2, 10)
    const phone = normalizeIndianPhone(form.phone.replace(/\D/g, '').slice(-10))
    setStore((state) => {
      const next = { ...state, users: { ...state.users } }
      next.users[userId] = {
        id: userId,
        role,
        email: form.email.trim().toLowerCase(),
        phone,
        password: form.password,
        profile: {
          fullName: form.fullName.trim(),
          businessName: form.businessName.trim() || form.fullName.trim(),
          state: form.state,
          city: form.city,
          address: form.address,
          description: form.description,
          type: role === 'buyer' ? null : form.businessType,
        },
        createdAt: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        verification: { stage1: 'pending', stage2: role === 'buyer' ? 'verified' : 'pending' },
        gstinOptional: form.noGstin,
        gstin: form.noGstin ? '' : normalizeGstin(form.gstin),
      }
      if (role === 'seller' || role === 'both') {
        next.businesses = { ...(state.businesses || {}) }
        next.businesses[userId + '-biz'] = {
          ownerId: userId,
          verification: next.users[userId].verification,
        }
      }
      return next
    })
    writeSession({ userId })
    pushToast?.(t('errors.sellerSignedUp'))
    onSignedIn?.(role)
  }

  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => step === 1 ? onModeChange('signin') : setStep(step - 1)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">
          <ArrowLeft className="size-4" />{t('common.back')}
        </button>
        <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">{t('account.step', { step, total: 3 })}</div>
      </div>
      <h1 className="mt-2 font-['Plus Jakarta Sans'] text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('account.registerTitle')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('account.registerSubtitle')}</p>

      {step === 1 && (
        <form noValidate onSubmit={next} className="mt-6 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { id: 'buyer', label: t('account.registerAsBuyer') },
              { id: 'seller', label: t('account.registerAsSeller') },
              { id: 'both', label: t('account.registerAsBoth') },
            ].map((opt) => (
              <label key={opt.id} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${role === opt.id ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-900/30 dark:text-teal-200' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                <input type="radio" name="role" value={opt.id} checked={role === opt.id} onChange={() => setRole(opt.id)} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
          <Field label={t('forms.fullName')} value={form.fullName} onChange={(v) => update('fullName', v)} error={errors.fullName} placeholder={t('placeholders.fullName')} autoComplete="name" />
          <Field label={t('forms.email')} type="email" value={form.email} onChange={(v) => update('email', v)} error={errors.email} placeholder={t('placeholders.email')} autoComplete="email" />
          <Field label={t('forms.phone')} type="tel" value={form.phone} onChange={(v) => update('phone', v)} error={errors.phone || (!form.phone ? t('forms.phoneHint') : null)} placeholder={t('placeholders.phone')} autoComplete="tel" />
          <Field label={t('forms.password')} type="password" value={form.password} onChange={(v) => update('password', v)} error={errors.password} placeholder={t('placeholders.password')} autoComplete="new-password" />
          <Field label={t('forms.confirmPassword')} type="password" value={form.confirmPassword} onChange={(v) => update('confirmPassword', v)} error={errors.confirmPassword} autoComplete="new-password" />
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('forms.consent')}</p>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500">
            {t('forms.next')} <ArrowRight className="size-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form noValidate onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="mt-6 grid gap-4">
          <Field label={t('forms.businessName')} value={form.businessName} onChange={(v) => update('businessName', v)} error={null} autoComplete="organization" />
          <div>
            <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('forms.businessType')}</label>
            <select value={form.businessType} onChange={(e) => update('businessType', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {['manufacturer','wholesaler','trader','retailer','distributor','importer','exporter','service'].map((b) => <option key={b} value={b}>{t(`suppliers.businessTypes.${b}`)}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('forms.state')}</label>
              <select value={form.state} onChange={(e) => update('state', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label={t('forms.city')} value={form.city} onChange={(v) => update('city', v)} error={null} autoComplete="address-level2" />
          </div>
          <Field label={`${t('forms.address')} ${t('forms.addressOptional')}`} value={form.address} onChange={(v) => update('address', v)} error={null} autoComplete="street-address" />
          <div>
            <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{t('forms.description')}</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder={t('forms.descriptionHint')} />
            {errors.description && <div className="mt-1 text-xs text-rose-600">{errors.description}</div>}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Field label={t('forms.gstin')} value={form.gstin} onChange={(v) => update('gstin', v)} error={errors.gstin} placeholder="22AAAAA0000A1Z5" />
            <label className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={form.noGstin} onChange={(e) => update('noGstin', e.target.checked)} className="size-4 accent-teal-600" />
              {t('forms.gstinNoGstin')}
            </label>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">{t('forms.gstinHint')}</div>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500">
            {t('forms.next')} <ArrowRight className="size-4" />
          </button>
        </form>
      )}

      {step === 3 && (
        <form noValidate onSubmit={submit} className="mt-6 space-y-4">
          <div className="rounded-xl bg-[#E8F7F4] p-4 ring-1 ring-teal-200 dark:bg-teal-900/20 dark:ring-teal-800">
            <div className="font-semibold text-[#102A43] dark:text-white">{t('account.readyTitle')}</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('account.readyBody')}</p>
          </div>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500">
            {t('forms.submit')} <ArrowRight className="size-4" />
          </button>
        </form>
      )}
    </div>
  )
}

function ResetPanel({ onModeChange, pushToast }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  function submit(e) {
    e.preventDefault()
    pushToast?.(t('account.resetSent', { email: email || 'you' }))
    onModeChange('signin')
  }
  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <button type="button" onClick={() => onModeChange('signin')} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </button>
      <h1 className="mt-2 font-['Plus Jakarta Sans'] text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('account.resetTitle')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{t('account.resetBody')}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label={t('forms.email')} type="email" value={email} onChange={setEmail} />
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500">
          {t('forms.submit')}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', error, placeholder, autoComplete, icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#102A43] dark:text-white">{label}</label>
      <div className={`mt-1 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ring-1 ring-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 dark:bg-slate-800 dark:ring-slate-700 ${error ? 'border-rose-400 ring-rose-200 dark:border-rose-500 dark:ring-rose-700' : 'border-slate-200'}`}>
        {icon && <span className="text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent py-20 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          style={{ paddingTop: 6, paddingBottom: 6 }}
        />
      </div>
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  )
}
