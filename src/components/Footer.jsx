import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck, FileText, Truck, ScrollText } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-['Plus Jakarta Sans'] text-xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{t('brand.name')}</div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('foot.aboutBody')}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="size-4" />
              <a href="mailto:support@allbusinesses.example" className="hover:text-teal-700 dark:hover:text-teal-400">{t('foot.supportEmail')}</a>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">{t('foot.legalEntity')}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">{t('foot.registeredOffice')}</div>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-semibold text-[#102A43] dark:text-white">{t('foot.goto')}</div>
            <ul className="mt-3 grid gap-2 text-sm">
              <li><Link to="/products" className="text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">{t('foot.products')}</Link></li>
              <li><Link to="/suppliers" className="text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">{t('foot.suppliers')}</Link></li>
              <li><Link to="/account" className="text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">{t('foot.account')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-sm font-semibold text-[#102A43] dark:text-white">{t('foot.policies')}</div>
            <ul className="mt-3 grid gap-2 text-sm">
              <li><a href="#terms" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"><FileText className="size-4" />{t('foot.policyLinks.terms')}</a></li>
              <li><a href="#privacy" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"><ShieldCheck className="size-4" />{t('foot.policyLinks.privacy')}</a></li>
              <li><a href="#shipping" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"><Truck className="size-4" />{t('foot.policyLinks.shipping')}</a></li>
              <li><a href="#transactions" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"><ScrollText className="size-4" />{t('foot.policyLinks.transactions')}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {t('brand.name')}</span>
          <span>{t('demo.banner')}</span>
        </div>
      </div>
    </footer>
  )
}
