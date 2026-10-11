import { useTranslation } from 'react-i18next'

// Wraps every page so a title and meta description render in JSX.
// Important: <title> is a single expression so React doesn't ship an empty tag.
export default function PageShell({ title, description, children }) {
  const { t } = useTranslation()
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description || t('brand.tagline')} />
      {children}
    </>
  )
}
