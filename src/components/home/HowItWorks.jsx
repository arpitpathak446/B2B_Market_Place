import { useTranslation } from 'react-i18next'
import { Search, ShieldCheck, MessageCircle, ShoppingBag, Banknote } from 'lucide-react'
import { Reveal } from '../motion.jsx'

const STEPS = [
  { id: 'discover', icon: Search },
  { id: 'verify',   icon: ShieldCheck },
  { id: 'connect',  icon: MessageCircle },
  { id: 'order',    icon: ShoppingBag },
  { id: 'pay',      icon: Banknote },
]

export default function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section className="bg-[#102A43] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight md:text-3xl">{t('home.howTitle')}</h2>
          <p className="mt-3 text-slate-200">{t('home.howSubtitle')}</p>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-5">
          {STEPS.map((step, idx) => (
            <Reveal key={step.id} delay={idx * 0.05}>
              <li className="h-full rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30">
                    <step.icon className="size-5" />
                  </span>
                  <span aria-hidden="true" className="font-['Plus Jakarta Sans'] text-xl font-extrabold tabular-nums text-teal-300">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <div className="mt-4 font-semibold text-white">{t(`home.how.${step.id}.title`)}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{t(`home.how.${step.id}.body`)}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
