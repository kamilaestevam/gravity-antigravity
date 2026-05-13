/**
 * validar-incoterm.test.ts — Cobre validação cruzada de Incoterm
 * contra cadastros.incoterm (Mandamentos 06+09).
 *
 * Estratégia: o helper aceita `buscador` injetável — stub simula respostas
 * do Cadastros sem dependência de rede.
 */
import { describe, it, expect } from 'vitest'
import {
  validarIncotermPedidoItem,
  CAMPOS_INCOTERM,
} from '../../../servicos-global/produto/processos-core/src/services/validarIncotermPedidoItem'
import type { CadastrosRequestContext } from '../../../servicos-global/produto/processos-core/src/services/cadastrosClient'

const ctx: CadastrosRequestContext = { id_organizacao: 'org_teste', correlation_id: 'corr_teste' }

/** Catálogo mockado de cadastros.incoterm para os testes. */
const CATALOGO: Record<string, { codigo_incoterm: string; nome_incoterm: string; descricao_incoterm: string | null; modal_transporte: string; versao_incoterm: string; ativo_incoterm: boolean }> = {
  FOB: { codigo_incoterm: 'FOB', nome_incoterm: 'Free On Board',                  descricao_incoterm: null, modal_transporte: 'maritimo', versao_incoterm: '2020', ativo_incoterm: true },
  CIF: { codigo_incoterm: 'CIF', nome_incoterm: 'Cost Insurance and Freight',     descricao_incoterm: null, modal_transporte: 'maritimo', versao_incoterm: '2020', ativo_incoterm: true },
  EXW: { codigo_incoterm: 'EXW', nome_incoterm: 'Ex Works',                       descricao_incoterm: null, modal_transporte: 'qualquer', versao_incoterm: '2020', ativo_incoterm: true },
  OLD: { codigo_incoterm: 'OLD', nome_incoterm: 'Termo antigo desativado',        descricao_incoterm: null, modal_transporte: 'maritimo', versao_incoterm: '2010', ativo_incoterm: false },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buscador = async (codigo: string): Promise<any> => CATALOGO[codigo] ?? null

describe('validarIncotermPedidoItem', () => {
  it('aceita payload sem campos de incoterm (no-op)', async () => {
    await expect(validarIncotermPedidoItem({}, ctx, buscador)).resolves.toBeUndefined()
  })

  it('aceita incoterm válido em campo do item', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm: 'FOB' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('aceita incoterm válido em campo do pedido', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm_pedido: 'CIF' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('aceita ambos os campos válidos no mesmo payload', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm: 'EXW', incoterm_pedido: 'FOB' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('rejeita incoterm inexistente em campo do item', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm: 'XYZ' }, ctx, buscador),
    ).rejects.toThrowError(/Incoterm "XYZ" nao existe/)
  })

  it('rejeita incoterm inexistente em campo do pedido', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm_pedido: 'ABC' }, ctx, buscador),
    ).rejects.toThrowError(/Incoterm "ABC" nao existe/)
  })

  it('rejeita incoterm inativo (ativo_incoterm = false)', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm: 'OLD' }, ctx, buscador),
    ).rejects.toThrowError(/Incoterm "OLD" esta inativo/)
  })

  it('ignora campos com valor null/undefined/string vazia', async () => {
    await expect(
      validarIncotermPedidoItem({
        incoterm: null,
        incoterm_pedido: undefined,
      }, ctx, buscador),
    ).resolves.toBeUndefined()

    await expect(
      validarIncotermPedidoItem({ incoterm: '' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('mensagem de erro inclui correlation_id do ctx', async () => {
    await expect(
      validarIncotermPedidoItem({ incoterm: 'XYZ' }, ctx, buscador),
    ).rejects.toThrowError(/corr=corr_teste/)
  })
})

describe('CAMPOS_INCOTERM — contrato', () => {
  it('cobre incoterm (item) e incoterm_pedido (pedido)', () => {
    expect(CAMPOS_INCOTERM).toEqual(['incoterm', 'incoterm_pedido'])
  })
})
