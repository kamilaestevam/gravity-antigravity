// TST-UNIT-SHELL-001 — buildEntityLink
// Valida que a factory de links do Shell monta URLs corretas a partir de
// target_entity + target_id (Pilar 2 da refatoração de mensageria).
//
// Cobertura: caminho feliz, case insensitivity, fallback, preservação de ID.

// Sem import de 'vitest' — globals injetados pelo runner (vi, describe, it, expect)
// para evitar resolução para a versão 4.x do root do monorepo.
/// <reference types="vitest/globals" />
import { buildEntityLink } from '../../../../servicos-global/shell/entityLinkFactory.js'

describe('buildEntityLink', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Entidades conhecidas ─────────────────────────────────────────────────────
  describe('entidades conhecidas — caminho feliz', () => {
    it('PEDIDO monta URL de edição', () => {
      expect(buildEntityLink('PEDIDO', 'PED-2024-089'))
        .toBe('/produto/pedido/pedidos/PED-2024-089/editar')
    })

    it('ITEM usa a mesma rota que PEDIDO', () => {
      expect(buildEntityLink('ITEM', 'PED-2024-001'))
        .toBe('/produto/pedido/pedidos/PED-2024-001/editar')
    })

    it('SIMULACUSTO monta URL de resultado', () => {
      expect(buildEntityLink('SIMULACUSTO', '123'))
        .toBe('/produto/simulacusto/resultado/123')
    })

    it('PROCESSO monta URL de processo', () => {
      expect(buildEntityLink('PROCESSO', 'PROC-001'))
        .toBe('/produto/processo/PROC-001')
    })

    it('FINANCEIRO monta URL de financeiro', () => {
      expect(buildEntityLink('FINANCEIRO', 'FIN-001'))
        .toBe('/produto/financeiro/FIN-001')
    })

    it('NF_IMPORTACAO monta URL de NF de importação', () => {
      expect(buildEntityLink('NF_IMPORTACAO', 'NF-2024-001'))
        .toBe('/produto/nf-importacao/NF-2024-001')
    })
  })

  // ── Normalização de case ─────────────────────────────────────────────────────
  describe('normalização de entidade (case insensitive)', () => {
    it('minúsculas → mesma URL que maiúsculas para PEDIDO', () => {
      expect(buildEntityLink('pedido', 'PED-001'))
        .toBe(buildEntityLink('PEDIDO', 'PED-001'))
    })

    it('capitalização mista → mesma URL para SIMULACUSTO', () => {
      expect(buildEntityLink('Simulacusto', '456'))
        .toBe(buildEntityLink('SIMULACUSTO', '456'))
    })

    it('upper+lower misto → mesma URL para NF_IMPORTACAO', () => {
      expect(buildEntityLink('nf_importacao', 'NF-001'))
        .toBe(buildEntityLink('NF_IMPORTACAO', 'NF-001'))
    })
  })

  // ── Entidade desconhecida ────────────────────────────────────────────────────
  describe('entidade desconhecida — fallback seguro', () => {
    it('entidade desconhecida retorna "/" e emite console.warn', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      expect(buildEntityLink('DESCONHECIDO', '123')).toBe('/')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Entidade desconhecida')
      )
    })

    it('string vazia retorna "/"', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      expect(buildEntityLink('', 'abc')).toBe('/')
    })

    it('tipo não mapeado (CLIENTE) retorna "/"', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      expect(buildEntityLink('CLIENTE', 'CLI-001')).toBe('/')
    })
  })

  // ── Preservação do ID ────────────────────────────────────────────────────────
  describe('preservação do ID (sem transformação)', () => {
    it('ID com hífens e números é preservado exato', () => {
      const url = buildEntityLink('PEDIDO', 'PED-2024-089')
      expect(url).toContain('PED-2024-089')
    })

    it('ID puramente numérico é preservado', () => {
      const url = buildEntityLink('SIMULACUSTO', '98765')
      expect(url).toContain('98765')
    })

    it('ID com maiúsculas não sofre lowercase', () => {
      const url = buildEntityLink('PROCESSO', 'PROC-ABC-001')
      expect(url).toContain('PROC-ABC-001')
    })

    it('ID com underscores é preservado', () => {
      const url = buildEntityLink('FINANCEIRO', 'FIN_2024_Q1')
      expect(url).toContain('FIN_2024_Q1')
    })
  })
})
