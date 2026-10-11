import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '../motion.jsx'

export default function SellerCTA() {
  const { t } = useTranslation()
  return (
    <section id="sell" className="bg-[#E8F7F4] py-12 dark:bg-teal-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid items-center gap-6 rounded-3xl bg-white p-8 ring-1 ring-teal-200 dark:bg-slate-900 dark:ring-teal-800 md:grid-cols-12 md:p-10">
            <div className="md:col-span-8">
              <h2 className="font-['Plus Jakarta Sans'] text-2xl font-extrabold tracking-tight text-[#102A43] dark:text-white md:text-3xl">{t('home.sellCtaTitle')}</h2>
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{t('home.sellCtaBody')}</p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                to="/account?mode=register"
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-500"
              >
                {t('home.sellCtaButton')}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
