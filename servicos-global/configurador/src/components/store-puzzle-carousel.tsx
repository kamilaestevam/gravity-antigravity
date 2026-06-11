import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

type Props = {
  children: React.ReactNode
  className?: string
}

export function StorePuzzleCarousel({ children, className }: Props) {
  const { t } = useTranslation()
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const syncScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth + 2
    setOverflow(hasOverflow)
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    syncScrollState()
    const ro = new ResizeObserver(syncScrollState)
    ro.observe(el)
    el.addEventListener('scroll', syncScrollState, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', syncScrollState)
    }
  }, [syncScrollState, children])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const isCards = el.closest('.gs-cards-carousel')
    const step = isCards
      ? Math.max(400, Math.floor(el.clientWidth * 0.88))
      : Math.max(360, Math.floor(el.clientWidth * 0.72))
    el.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' })
  }

  const wrapClass = [
    'gs-puzzle-carousel',
    overflow ? 'gs-puzzle-carousel--overflow' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass}>
      <button
        type="button"
        className="gs-puzzle-carousel__btn gs-puzzle-carousel__btn--left"
        onClick={() => scroll('left')}
        disabled={!overflow || atStart}
        aria-label={t('comum.anterior')}
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <div className="gs-puzzle-carousel__track" ref={trackRef}>
        {children}
      </div>
      <button
        type="button"
        className="gs-puzzle-carousel__btn gs-puzzle-carousel__btn--right"
        onClick={() => scroll('right')}
        disabled={!overflow || atEnd}
        aria-label={t('comum.proximo')}
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  )
}
