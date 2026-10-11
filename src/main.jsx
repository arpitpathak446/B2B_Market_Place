import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'

const root = document.getElementById('root')
const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// The published build renders each page to static HTML ahead of time, so the
// markup is already here on first load: adopt it instead of throwing it away
// and re-rendering, which would blank the page for a frame. Anywhere else —
// the preview, a page that could not be pre-rendered — #root is empty and this
// is an ordinary client render.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, tree)
} else {
  ReactDOM.createRoot(root).render(tree)
}
