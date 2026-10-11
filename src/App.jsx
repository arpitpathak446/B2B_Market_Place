import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from './pages/Main'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Account from './pages/Account'
import { useLanguage } from './i18n'

// Routes only. Page content lives in src/pages/, one component per route.
export default function App() {
  useLanguage()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  )
}
