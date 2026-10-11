import { Children, cloneElement, isValidElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Entrance animations that play once, when the element scrolls into view.
 *
 *   <Reveal>…any block…</Reveal>
 *   <Reveal as="section" delay={0.2}>…</Reveal>
 *
 *   <SplitText as="h2" className="text-4xl">Qué es Komunika360</SplitText>
 *   <SplitText as="p" by="word">
 *     Ayudamos a <strong className="text-sky-700">analizar y mejorar</strong> la comunicación.
 *   </SplitText>
 *
 * SplitText animates letter by letter (or word by word) in reading order.
 * Inline markup inside it (<strong>, <span className=…>, <em>) keeps its
 * styling, words never break across lines, screen readers get the plain
 * sentence, and the whole reveal is capped at `maxDuration` seconds however
 * long the text is. Both components render static content when the visitor
 * prefers reduced motion.
 */

const EASE = [0.2, 0.7, 0.2, 1]

// Opacity and movement must run on the same clock. framer-motion hands
// `opacity` and a `transform` STRING to the browser's compositor, but drives
// `y`/`x` from JavaScript every frame. Mixing the two desyncs them: any CSS
// transition on `transform` (the preview adds one to every element) or a busy
// main thread makes the element fully visible first and slide up afterwards.
// So every movement below is a `transform` string, never `y`.
const rise = (distance) => `translateY(${distance})`
const SETTLED = 'translateY(0px)'

// Transforms do nothing on inline boxes, so an inline tag would only fade.
const INLINE_TAGS = new Set(['span', 'a', 'em', 'strong', 'small', 'b', 'i', 'label'])

// "Some pixels visible, 10% above the bottom edge". A ratio threshold
// (amount: 0.5) never fires for blocks taller than the viewport.
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' }

export function Reveal({ as = 'div', delay = 0, y = 16, style, children, ...props }) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Tag = as
    return <Tag style={style} {...props}>{children}</Tag>
  }
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, transform: rise(`${y}px`) }}
      whileInView={{ opacity: 1, transform: SETTLED }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={INLINE_TAGS.has(as) ? { display: 'inline-block', ...style } : style}
      {...props}
    >
      {children}
    </Tag>
  )
}

// 0.25em reads as a lift on body text and stays restrained on display type
// (a 120px headline rises 30px, not 48px).
const unit = {
  hidden: { opacity: 0, transform: rise('0.25em') },
  show: ({ delay }) => ({ opacity: 1, transform: SETTLED, transition: { duration: 0.5, ease: EASE, delay } }),
}

function plainText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(plainText).join('')
  if (isValidElement(node)) return plainText(node.props.children)
  return ''
}

function splitUnits(text, by) {
  // Keep whitespace as its own token so lines wrap exactly like normal text.
  return text.split(/(\s+)/).filter(Boolean).map((token) =>
    /^\s+$/.test(token) ? token : by === 'word' ? [token] : Array.from(token),
  )
}

function countUnits(node, by) {
  if (typeof node === 'string' || typeof node === 'number') {
    return splitUnits(String(node), by).reduce((n, t) => n + (typeof t === 'string' ? 0 : t.length), 0)
  }
  if (Array.isArray(node)) return node.reduce((n, child) => n + countUnits(child, by), 0)
  if (isValidElement(node)) return countUnits(node.props.children, by)
  return 0
}

export function SplitText({
  as = 'span',
  by = 'letter',
  delay = 0,
  stagger = by === 'word' ? 0.06 : 0.03,
  maxDuration = 1.2,
  children,
  ...props
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Tag = as
    return <Tag {...props}>{children}</Tag>
  }

  const total = countUnits(children, by)
  const step = total > 1 ? Math.min(stagger, maxDuration / (total - 1)) : 0
  let index = 0

  const render = (node) =>
    Children.map(node, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return splitUnits(String(child), by).map((token, ti) =>
          typeof token === 'string' ? (
            token
          ) : (
            <span key={ti} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {token.map((piece, pi) => (
                <motion.span
                  key={pi}
                  variants={unit}
                  custom={{ delay: delay + index++ * step }}
                  style={{ display: 'inline-block' }}
                >
                  {piece}
                </motion.span>
              ))}
            </span>
          ),
        )
      }
      if (isValidElement(child) && child.props.children != null) {
        return cloneElement(child, undefined, render(child.props.children))
      }
      return child
    })

  const Tag = motion[as]
  return (
    <Tag initial="hidden" whileInView="show" viewport={VIEWPORT} {...props}>
      <span className="sr-only">{plainText(children)}</span>
      <span aria-hidden="true">{render(children)}</span>
    </Tag>
  )
}
