# Project

## Structure
- `index.html` loads `src/main.jsx`, the entry: it imports `index.css` and `App.css` and renders `App`. Its `<head>` is the deployed page's head — put the site-wide `<title>`, description and `og:` tags there. For a per-page title or description, render `<title>` and `<meta>` inside that page's component; React hoists them and they replace the site-wide ones.
- `src/App.jsx` — routes only (react-router-dom). No page content here.
- `src/pages/` — one component per route. `Main.jsx` is `/`.
- `src/components/` — sections and reusable UI. `motion.jsx` provides `Reveal` and `SplitText`.
- `src/hooks/` — `useTheme` (dark mode) already lives here.
- `src/i18n.js` — loads the translations. `languages` lists one entry per language; the first is the main one. `useLanguage()` gives `{ language, languages, setLanguage }` for a language switch.
- `src/locales/<code>.json` — every word a visitor reads, one file per language (`es.json`, `ca.json`, `en.json`…).
- `src/index.css` — Tailwind setup only (`@import "tailwindcss"`, safelist). No custom classes or keyframes.
- `src/App.css` — all custom CSS: `@keyframes`, animation classes, anything Tailwind can't express.

## Rules
- Every file under `src/` must be reachable through imports from `src/main.jsx`. When a page or component stops being used, delete it; never edit a file the site does not render.
- Adding a page: create it in `src/pages/`, add a `<Route>` in `App.jsx`, link it from the nav if there is one, and update Routes below. Keep every `<Route>` in `App.jsx` and use the `<Route path=…>` component form: the published build reads that file to learn which URLs exist, and a route it cannot see gets no static page and no server-side rule.
- Per-page `<title>` and `<meta name="description">`: render them as JSX inside the page component. React hoists them into the head. **Never set them from an effect** — `document.title = …` inside `useEffect` looks like it works in the preview, but the published build renders each page to HTML ahead of time and effects do not run then, so every page ships the site-wide title instead of its own. Write:

  ```jsx
  export default function About() {
    return (
      <>
        <title>Qui som — Nom del lloc</title>
        <meta name="description" content="Una frase sobre aquesta pàgina." />
        …
      </>
    )
  }
  ```

  A shared `<Page>` wrapper is fine, as long as it *renders* the tags rather than assigning them: `{title && <title>{title}</title>}`.

  A `<title>` must have **exactly one child**. `<title>{name} — El meu lloc</title>` is two (an expression and a text run), and React cannot turn that into one string: it warns and renders an empty `<title></title>`, so the page ships with no title. Put the whole thing in one expression: `` <title>{`${name} — El meu lloc`}</title> ``.
- Never read `window`, `document`, `localStorage` or `matchMedia` while rendering. The published build renders each page to HTML ahead of time, where none of them exist: a component that touches one during render loses its static page, and one that branches on `typeof window` renders the wrong branch and then contradicts itself in the browser. Read the browser in `useEffect` and keep the value in state, so the first render is the same in both places.
- Styling: Tailwind classes. Custom CSS only in `src/App.css`.
- Scroll position on route change is handled by the platform — every navigation starts at the top, the back button restores where the visitor was, and in-page `#anchor` links still work. Don't add a `ScrollToTop` component or call `window.scrollTo` on navigation; it is already done in both the preview and the published build.
- Animations: `Reveal` for blocks and `SplitText` for letter-by-letter or word-by-word text, from `src/components/motion.jsx`. They play once when scrolled into view and respect reduced motion. Don't hand-split text into spans.
- Words: every text a visitor reads lives in `src/locales/<code>.json` and is shown with `t('section.key')` (`const { t } = useTranslation()` from `react-i18next`), even on a one-language site. Write keys out in full as plain strings. The file is named by the site's language: for a site that is not in English, write `src/locales/<code>.json`, delete `en.json`, and change the import and `languages` in `src/i18n.js`.
- Repeated content (cards, team, prices, menu links): a plain list next to the component holding an `id` and whatever is not words (image path, icon, link), read as `item.field` inside `.map()`. Its words go in the locale file under that id: ``t(`services.${item.id}.title`)``.
- Adding a language: a new `src/locales/<code>.json` with every key translated, imported in `src/i18n.js` and added to `languages`, plus a visible language switch built on `useLanguage()`.
- Images: `local_image_list` first, then `find_stock_images`. Never placeholder URLs. Write the `/public/<name>` path exactly as the tool returns it, as a plain string: `src="/public/<name>"` on the tag, or `image: '/public/<name>'` in a list. Never import an image file.
- Keep components under 200 lines. Split into smaller components if larger.
- Dark mode: write `dark:` variants (class-driven, works in preview and production). For a toggle use `useTheme()` from `src/hooks/useTheme` — `const { isDark, toggleTheme, setTheme } = useTheme()`. Don't build another theme system.

## Design System
_Updated by the agent after first build. Tracks colors, fonts, spacing conventions._

## Routes
- `/` → `src/pages/Main.jsx` — Home, marketplace stats, categories, featured products, verified suppliers, how-it-works, seller CTA
- `/products` → `src/pages/Products.jsx` — Searchable, filterable catalog with detail drawer and add-to-cart
- `/suppliers` → `src/pages/Suppliers.jsx` — Verified-supplier directory with profile drawer, business-type and state filters
- `/account` → `src/pages/Account.jsx` — Sign in / register / forgot-password; per-role dashboards (buyer, seller, admin)

## Design system
- **Brand:** navy `#102A43` deep navy `#163A5F`, teal accent `#0F9D8A`, light teal background `#E8F7F4`, page surface `#F7F9FC`, white surfaces.
- **Text colours:** `#243447` main, `#64748B` muted.
- **Status colours:** success `#15803D`, warning `#B45309`, error `#B91C1C`. Accessibility-coupled to text labels and icons; never colour alone.
- **Fonts:** Plus Jakarta Sans (display, 500/600/700/800) and Inter (body, 400–700) loaded via `src/App.css`.
- **Tailwind classes only** for colour, spacing, type. Custom CSS (Google Fonts import, keyframes for chat pop and nav underline) lives in `src/App.css`.
- **Light/dark:** both shipped. Header stays navy in both themes for brand consistency; body surfaces swap between white/`stone` and `slate-900`. Use `dark:` variants; theme switch is in the navbar.

## Notes
- **Storage:** all cross-page state (users, products, orders, carts, verifications, reports, audit logs) lives in `localStorage` under `pd:allbusinesses:v1`. Seeded on first visit with 18 suppliers and 36 products, plus demo accounts for buyer / seller / admin.
- **Counts:** the "Live marketplace" stats tile and admin counts are derived from device-local data and refresh every 30s or on cart/order events. They will move to live aggregates when the backend lands.
- **AI chat:** the floating assistant is FAQ-backed (`matchQuestion` in `src/components/ChatWidget.jsx`). It never invents platform facts; for questions it can't match, it points to the verified-supplier directory. Production wiring (server-side key + per-user context) is not yet integrated.
- **Verification:** two-stage. Stage 1 is email + phone OTP; stage 2 is administrator review of business information. The "verified" badge is rendered from data, never assumed by presence of email alone.
- **Cart & orders:** a real cart with supplier grouping, MOQ enforcement, and order placement. Payment is never charged — orders are "pending supplier confirmation" and the seller walks the status through accepted → processing → dispatched → delivered → completed. Order totals come from indicative prices, snapshot at checkout.
- **No backend:** the platform runs entirely in the visitor's browser. Real authentication, network OTPs, document storage and cross-device orders depend on the backend release that's part of the next deliverable. The demo banner is shown on every page.
