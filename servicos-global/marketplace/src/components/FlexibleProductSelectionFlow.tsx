import { useEffect, useRef } from 'react'
import '../styles/flexible-product-flow-embed.css'

const FLOW_ENTRY_URL = '/flexible-product-selection-flow/Sequencia%20Gravity.dc.html'

function ajustarAlturaIframe(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument
  if (!doc) return
  const altura = Math.max(
    doc.documentElement.scrollHeight,
    doc.body?.scrollHeight ?? 0,
  )
  if (altura > 0) {
    iframe.style.height = `${altura}px`
  }
}

export function FlexibleProductSelectionFlow() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let observer: MutationObserver | null = null
    let intervalo: ReturnType<typeof setInterval> | null = null

    const redimensionar = () => ajustarAlturaIframe(iframe)

    const aoCarregar = () => {
      redimensionar()
      const doc = iframe.contentDocument
      if (doc?.body) {
        observer = new MutationObserver(redimensionar)
        observer.observe(doc.body, {
          childList: true,
          subtree: true,
          attributes: true,
        })
      }
      intervalo = setInterval(redimensionar, 1200)
      setTimeout(redimensionar, 400)
      setTimeout(redimensionar, 2000)
      setTimeout(redimensionar, 5000)
    }

    iframe.addEventListener('load', aoCarregar)
    window.addEventListener('resize', redimensionar)

    return () => {
      iframe.removeEventListener('load', aoCarregar)
      window.removeEventListener('resize', redimensionar)
      observer?.disconnect()
      if (intervalo) clearInterval(intervalo)
    }
  }, [])

  return (
    <section className="flexible-product-flow-embed" aria-label="Monte sua solução — fluxo modular Gravity">
      <iframe
        ref={iframeRef}
        className="flexible-product-flow-embed__frame"
        src={FLOW_ENTRY_URL}
        title="Monte sua solução — seleção modular de produtos Gravity"
        scrolling="no"
        loading="lazy"
      />
    </section>
  )
}
