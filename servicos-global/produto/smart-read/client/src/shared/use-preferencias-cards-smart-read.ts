/**
 * use-preferencias-cards-smart-read.ts — preferências de KPI cards (Lista / Insights)
 * Fonte: Configurações › Cards (`persistencia-configuracoes-smart-read`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CARDS_CATALOGO_KPI_SMART_READ,
  CARDS_PADRAO_KPI_SMART_READ,
  carregarPreferenciasCardsLegadoSmartRead,
  definicaoCardKpiSmartRead,
  normalizarPreferenciasCardsKpi,
  type CardDefinicaoKpiSmartRead,
  type CardPreferenciaKpiSmartRead,
} from './catalogo-cards-kpi-smart-read'
import {
  SYNC_EVENT_CONFIGURACOES_SMART_READ,
  carregarConfiguracoesSmartRead,
} from './persistencia-configuracoes-smart-read'

export type CardDefinicaoSmartRead = CardDefinicaoKpiSmartRead
export type CardPreferenciaSmartRead = CardPreferenciaKpiSmartRead

export const CARDS_CATALOGO_SMART_READ = CARDS_CATALOGO_KPI_SMART_READ
export const CARDS_PADRAO_SMART_READ = CARDS_PADRAO_KPI_SMART_READ.map((c) => c.id)

function carregar(): CardPreferenciaKpiSmartRead[] {
  const cfg = carregarConfiguracoesSmartRead()
  if (cfg.cards.length > 0) {
    return normalizarPreferenciasCardsKpi(cfg.cards, CARDS_PADRAO_KPI_SMART_READ)
  }
  const legado = carregarPreferenciasCardsLegadoSmartRead()
  if (legado) return legado
  return CARDS_PADRAO_KPI_SMART_READ.map((c) => ({ ...c }))
}

export function usePreferenciasCardsSmartRead() {
  const [prefs, setPrefs] = useState(carregar)

  useEffect(() => {
    function sync() {
      setPrefs(carregar())
    }
    window.addEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferenciaKpiSmartRead[]) => {
    setPrefs(next)
    // Escrita direta descontinuada — Configurações é a fonte da verdade.
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_CONFIGURACOES_SMART_READ))
  }, [])

  const visiveis = useMemo(
    () =>
      prefs
        .filter((p) => p.visible)
        .map((p) => definicaoCardKpiSmartRead(p.id))
        .filter((c): c is CardDefinicaoKpiSmartRead => Boolean(c)),
    [prefs],
  )

  return { prefs, visiveis, persistir }
}
