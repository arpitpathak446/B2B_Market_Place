import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import Toaster, { useToasts } from '../components/Toaster.jsx'
import PageShell from '../components/PageShell.jsx'
import Hero from '../components/home/Hero.jsx'
import Stats from '../components/home/Stats.jsx'
import Categories from '../components/home/Categories.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'
import Suppliers from '../components/home/Suppliers.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import SellerCTA from '../components/home/SellerCTA.jsx'
import { hydrateStore, getStore, setStore, readSession } from '../data/store.js'

export default function Main() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toasts = useToasts()

  useEffect(() => { hydrateStore() }, [])

  function addToCart(productId) {
    const product = getStore().catalog.products.find((p) => p.id === productId)
    if (!product) return
    const session = readSession()
    if (!session) {
      navigate('/account?mode=register')
      return
    }
    setStore((state) => {
      const next = { ...state, carts: { ...state.carts } }
      const userCart = { ...(next.carts[session.userId] || {}) }
      const supplierItems = [...(userCart[product.supplierId] || [])]
      const lineIndex = supplierItems.findIndex((l) => l.productId === productId)
      if (lineIndex >= 0) {
        supplierItems[lineIndex] = { ...supplierItems[lineIndex], quantity: supplierItems[lineIndex].quantity + 1 }
      } else {
        supplierItems.push({ productId, quantity: Math.max(1, product.moq) })
      }
      userCart[product.supplierId] = supplierItems
      next.carts[session.userId] = userCart
      return next
    })
    window.dispatchEvent(new Event('ab:cart-changed'))
    toasts.push(t('productDetail.addedToCart'))
  }

  function onSearch({ scope, q }) {
    const query = q ? `&q=${encodeURIComponent(q)}` : ''
    const scopeParam = `scope=${scope}`
    navigate(`/products?${scopeParam}${query}`)
  }

  return (
    <PageShell title={t('home.seoTitle')} description={t('home.seoDescription')}>
      <Toaster {...toasts} />
      <DemoBanner />
      <Nav />
      <main id="main">
        <Hero onSearch={onSearch} />
        <Stats />
        <Categories />
        <FeaturedProducts productLimit={8} onAdd={addToCart} />
        <Suppliers />
        <HowItWorks />
        <SellerCTA />
      </main>
      <Footer />
      <ChatWidget />
    </PageShell>
  )
}
