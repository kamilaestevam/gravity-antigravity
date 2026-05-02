/**
 * idGenerator.test.ts — Testes unitarios para geracao de IDs corporativos LPCO
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { gerarId, PREFIXOS } from '../idGenerator.js'

describe('gerarId', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Formato basico ────────────────────────────────────────────────────────

  describe('formato', () => {
    it('deve gerar ID no formato prefixo + 7 digitos + /AA', () => {
      const id = gerarId('lpco_id_', 1)
      expect(id).toMatch(/^lpco_id_\d{7}\/\d{2}$/)
    })

    it('deve zero-pad o sequencial para 7 digitos', () => {
      expect(gerarId('lpco_id_', 1)).toContain('0000001')
      expect(gerarId('lpco_id_', 42)).toContain('0000042')
      expect(gerarId('lpco_id_', 12345)).toContain('0012345')
      expect(gerarId('lpco_id_', 9999999)).toContain('9999999')
    })

    it('deve usar os dois ultimos digitos do ano', () => {
      const anoAtual = new Date().getFullYear().toString().slice(-2)
      const id = gerarId('test_', 1)
      expect(id).toEndWith(`/${anoAtual}`)
    })
  })

  // ── Prefixos ──────────────────────────────────────────────────────────────

  describe('prefixos', () => {
    it('deve funcionar com prefixo LPCO', () => {
      const id = gerarId(PREFIXOS.LPCO, 1)
      expect(id).toMatch(/^lpco_id_0000001\/\d{2}$/)
    })

    it('deve funcionar com prefixo ITEM', () => {
      const id = gerarId(PREFIXOS.ITEM, 5)
      expect(id).toMatch(/^lpit_id_0000005\/\d{2}$/)
    })

    it('deve funcionar com prefixo EXIGENCIA', () => {
      const id = gerarId(PREFIXOS.EXIGENCIA, 100)
      expect(id).toMatch(/^lpex_id_0000100\/\d{2}$/)
    })

    it('deve funcionar com prefixo VINCULO', () => {
      const id = gerarId(PREFIXOS.VINCULO, 999)
      expect(id).toMatch(/^lpvc_id_0000999\/\d{2}$/)
    })
  })

  // ── Valores de sequencial ─────────────────────────────────────────────────

  describe('sequencial', () => {
    it('deve funcionar com sequencial 0', () => {
      const id = gerarId('test_', 0)
      expect(id).toContain('0000000')
    })

    it('deve funcionar com sequencial maximo de 7 digitos', () => {
      const id = gerarId('test_', 9999999)
      expect(id).toContain('9999999')
    })

    it('deve gerar IDs unicos para sequenciais diferentes', () => {
      const ids = new Set<string>()
      for (let i = 1; i <= 100; i++) {
        ids.add(gerarId('lpco_id_', i))
      }
      expect(ids.size).toBe(100)
    })
  })

  // ── Ano mockado ───────────────────────────────────────────────────────────

  describe('ano', () => {
    it('deve usar ano correto quando mockado para 2026', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026)
      const id = gerarId('lpco_id_', 1)
      expect(id).toBe('lpco_id_0000001/26')
    })

    it('deve usar ano correto quando mockado para 2030', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2030)
      const id = gerarId('lpco_id_', 42)
      expect(id).toBe('lpco_id_0000042/30')
    })

    it('deve usar ano correto quando mockado para 2099', () => {
      vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2099)
      const id = gerarId('lpco_id_', 1)
      expect(id).toBe('lpco_id_0000001/99')
    })
  })

  // ── PREFIXOS constantes ───────────────────────────────────────────────────

  describe('PREFIXOS', () => {
    it('LPCO deve ser lpco_id_', () => {
      expect(PREFIXOS.LPCO).toBe('lpco_id_')
    })

    it('ITEM deve ser lpit_id_', () => {
      expect(PREFIXOS.ITEM).toBe('lpit_id_')
    })

    it('EXIGENCIA deve ser lpex_id_', () => {
      expect(PREFIXOS.EXIGENCIA).toBe('lpex_id_')
    })

    it('VINCULO deve ser lpvc_id_', () => {
      expect(PREFIXOS.VINCULO).toBe('lpvc_id_')
    })

    it('deve ter exatamente 4 prefixos', () => {
      expect(Object.keys(PREFIXOS)).toHaveLength(4)
    })
  })
})
