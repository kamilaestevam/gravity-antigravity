import { describe, expect, it } from 'vitest'
import {
  DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_PREVIEW_CATALOGO_LOGISTICA_BID,
  MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID,
} from '../../../../../servicos-global/produto/bid-frete-internacional/shared/limites-catalogo-logistica-bid-frete-internacional'

describe('limites-catalogo-logistica-bid-frete-internacional', () => {
  it('preview menor que busca — evita carregar catálogo inteiro no browser', () => {
    expect(LIMITE_PREVIEW_CATALOGO_LOGISTICA_BID).toBeLessThan(LIMITE_BUSCA_CATALOGO_LOGISTICA_BID)
  })

  it('busca exige ao menos 2 caracteres antes de consultar Cadastros', () => {
    expect(MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID).toBeGreaterThanOrEqual(2)
  })

  it('debounce dentro de SLA de interação (< 500ms)', () => {
    expect(DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID).toBeLessThanOrEqual(500)
  })
})
