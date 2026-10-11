import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { hydrateStore } from '../data/store.js'

// FAQ-backed chat. The question is matched (case-insensitive, trims,
// keeps simple words) to one of the suggested keys and returns the
// pre-written fallback answer from translations. Always labelled
// "AI support in demo mode" so visitors know this is local.

const STORAGE_KEY = 'pd:ab:chat-history'

function getInitialHistory() {
  return []
}

function recordHistory(history) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)) } catch {}
}

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function matchQuestion(message, suggestedKeys) {
  const text = (message || '').toLowerCase()
  if (!text.trim()) return null
  let best = null
  let bestScore = 0
  suggestedKeys.forEach((key) => {
    const labels = [key.label, ...(key.aliases || [])]
    labels.forEach((label) => {
      const tokens = label.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
      let hits = 0
      tokens.forEach((token) => { if (text.includes(token)) hits++ })
      const score = hits / Math.max(tokens.length, 1)
      if (score > bestScore) { bestScore = score; best = key.id }
    })
  })
  return bestScore >= 0.4 ? best : null
}

const SUGGESTED_KEYS = [
  { id: 'suppliers',     label: 'find verified suppliers',           aliases: ['supplier', 'suppliers', 'verified', 'directory'] },
  { id: 'registerBuyer', label: 'register my business',              aliases: ['register', 'sign up', 'signup', 'buyer'] },
  { id: 'verifySeller',  label: 'become a verified seller',          aliases: ['verify', 'verified', 'seller', 'verification'] },
  { id: 'listProduct',   label: 'list a product',                    aliases: ['list product', 'add product', 'listing'] },
  { id: 'placeOrder',    label: 'place an order',                    aliases: ['order', 'place order', 'checkout'] },
  { id: 'offlinePay',    label: 'offline payment work',              aliases: ['offline', 'payment', 'pay'] },
  { id: 'contactSeller', label: 'contact a supplier',                aliases: ['contact', 'supplier', 'message'] },
  { id: 'accountIssue',  label: 'account issue',                     aliases: ['account', 'issue', 'problem', 'help'] },
]

export default function ChatWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(getInitialHistory)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => { hydrateStore() }, [])

  useEffect(() => {
    if (open) {
      setMessages(readHistory().length ? readHistory() : [
        { from: 'assistant', body: t('chat.intro') }
      ])
    }
  }, [open, t])

  useEffect(() => {
    recordHistory(messages)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  function send(text) {
    const value = (text ?? draft).trim()
    if (!value) return
    setMessages((prev) => [...prev, { from: 'user', body: value }])
    setDraft('')
    setSending(true)
    setTimeout(() => {
      const id = matchQuestion(value, SUGGESTED_KEYS)
      const reply = id ? t(`chat.fallback.${id}`) : t('chat.fallback.suppliers')
      setMessages((prev) => [...prev, { from: 'assistant', body: reply }])
      setSending(false)
    }, 480)
  }

  function clearChat() {
    const initial = [{ from: 'assistant', body: t('chat.intro') }]
    setMessages(initial)
  }

  const suggested = [
    'suggestedQuestions.suppliers',
    'suggestedQuestions.registerBuyer',
    'suggestedQuestions.verifySeller',
    'suggestedQuestions.listProduct',
    'suggestedQuestions.placeOrder',
    'suggestedQuestions.offlinePay',
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('chat.open')}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-teal-600 text-white shadow-lg shadow-slate-900/20 transition hover:bg-teal-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40"
      >
        <MessageCircle className="size-6" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('chat.title')}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[min(80vh,640px)] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200 chat-pop dark:bg-slate-900 dark:ring-slate-800 md:bottom-5 md:right-5 md:left-auto md:h-[min(85vh,640px)] md:w-[min(420px,calc(100vw-40px))] md:rounded-2xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                <Sparkles className="size-4" />
              </span>
              <div>
                <div className="font-['Plus Jakarta Sans'] text-base font-bold text-[#102A43] dark:text-white">{t('chat.title')}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('chat.subtitle')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                aria-label={t('chat.clear')}
                className="rounded-md px-2 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {t('chat.clear')}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('chat.close')}
                className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-100 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-slate-800 dark:bg-amber-900/30 dark:text-amber-200">
            {t('chat.fallbackNotice')}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-teal-600 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t('common.loading')}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="mb-2 flex flex-wrap gap-01.5">
              {suggested.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(t(`chat.${key}`))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:text-teal-300"
                >
                  {t(`chat.${key}`)}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-800"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                aria-label={t('chat.placeholder')}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                aria-label={t('chat.send')}
                className="grid h-10 w-10 place-items-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-500 disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
