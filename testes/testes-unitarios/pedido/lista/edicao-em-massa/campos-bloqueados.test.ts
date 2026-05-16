// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  CAMPOS_BLOQUEADOS_PEDIDO,
  CAMPOS_BLOQUEADOS_ITEM,
} from '../../../../../servicos-global/produto/pedido/client/src/shared/types'

describe('Edição em Massa — Campos Bloqueados', () => {
  describe('CAMPOS_BLOQUEADOS_PEDIDO', () => {
    it('U14: valor_total_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('valor_total_pedido')).toBe(true)
    })

    it('U15: quantidade_total_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('quantidade_total_pedido')).toBe(true)
    })

    it('U16: peso_liquido_total_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('peso_liquido_total_pedido')).toBe(true)
    })

    it('U17: peso_bruto_total_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('peso_bruto_total_pedido')).toBe(true)
    })

    it('U18: cubagem_total_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('cubagem_total_pedido')).toBe(true)
    })

    it('U19: id está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('id')).toBe(true)
    })

    it('U20: tenant_id está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('tenant_id')).toBe(true)
    })
  })

  describe('CAMPOS_BLOQUEADOS_ITEM', () => {
    it('U21: valor_total_item está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_ITEM.has('valor_total_item')).toBe(true)
    })

    it('U22: quantidade_atual_pedido está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_ITEM.has('quantidade_atual_pedido')).toBe(true)
    })

    it('U23: id está bloqueado', () => {
      expect(CAMPOS_BLOQUEADOS_ITEM.has('id')).toBe(true)
    })
  })

  describe('campos editáveis NÃO estão bloqueados', () => {
    it('incoterm não está bloqueado no pedido', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('incoterm')).toBe(false)
    })

    it('nome_exportador não está bloqueado no pedido', () => {
      expect(CAMPOS_BLOQUEADOS_PEDIDO.has('nome_exportador')).toBe(false)
    })

    it('ncm não está bloqueado no item', () => {
      expect(CAMPOS_BLOQUEADOS_ITEM.has('ncm')).toBe(false)
    })
  })
})
