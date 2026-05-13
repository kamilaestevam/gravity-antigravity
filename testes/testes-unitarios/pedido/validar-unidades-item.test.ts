/**
 * validar-unidades-item.test.ts — Cobre a validação cruzada de unidades de
 * item contra cadastros.unidade (Mandamentos 06+09).
 *
 * Estratégia: o helper aceita `buscador` injetável — passamos um stub que
 * simula respostas do Cadastros, evitando dependência de rede.
 */
import { describe, it, expect } from 'vitest'
import {
  validarUnidadesItem,
  UNIDADES_CATEGORIAS_VALIDAS,
} from '../../../servicos-global/produto/processos-core/src/services/validarUnidadesItem'
import type { CadastrosRequestContext } from '../../../servicos-global/produto/processos-core/src/services/cadastrosClient'

const ctx: CadastrosRequestContext = { id_organizacao: 'org_teste', correlation_id: 'corr_teste' }

/** Catálogo mockado de cadastros.unidade para os testes. */
const CATALOGO: Record<string, { codigo_unidade: string; nome_unidade: string; tipo_unidade: string; ativo_unidade: boolean }> = {
  KG:  { codigo_unidade: 'KG',  nome_unidade: 'Quilograma',          tipo_unidade: 'peso',        ativo_unidade: true },
  G:   { codigo_unidade: 'G',   nome_unidade: 'Grama',               tipo_unidade: 'peso',        ativo_unidade: true },
  TON: { codigo_unidade: 'TON', nome_unidade: 'Tonelada',            tipo_unidade: 'peso',        ativo_unidade: true },
  M3:  { codigo_unidade: 'M3',  nome_unidade: 'Metro cúbico',        tipo_unidade: 'volume',      ativo_unidade: true },
  CM:  { codigo_unidade: 'CM',  nome_unidade: 'Centímetro',          tipo_unidade: 'comprimento', ativo_unidade: true },
  M2:  { codigo_unidade: 'M2',  nome_unidade: 'Metro quadrado',      tipo_unidade: 'area',        ativo_unidade: true },
  UN:  { codigo_unidade: 'UN',  nome_unidade: 'Unidade',             tipo_unidade: 'contagem',    ativo_unidade: true },
  LT:  { codigo_unidade: 'LT',  nome_unidade: 'Litro',               tipo_unidade: 'volume',      ativo_unidade: true },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buscador = async (codigo: string): Promise<any> => CATALOGO[codigo] ?? null

describe('validarUnidadesItem', () => {
  it('aceita payload sem campos de unidade (no-op)', async () => {
    await expect(validarUnidadesItem({}, ctx, buscador)).resolves.toBeUndefined()
  })

  it('aceita unidades válidas para todos os campos', async () => {
    await expect(
      validarUnidadesItem(
        {
          peso_liquido_unidade_item: 'KG',
          peso_bruto_unidade_item: 'TON',
          cubagem_unidade_item: 'M3',
          unidade_comercializada_item: 'UN',
        },
        ctx,
        buscador,
      ),
    ).resolves.toBeUndefined()
  })

  it('rejeita peso_liquido_unidade_item="M3" (volume, não peso)', async () => {
    await expect(
      validarUnidadesItem({ peso_liquido_unidade_item: 'M3' }, ctx, buscador),
    ).rejects.toThrowError(/peso_liquido_unidade_item aceita peso/)
  })

  it('rejeita peso_bruto_unidade_item="UN" (contagem, não peso)', async () => {
    await expect(
      validarUnidadesItem({ peso_bruto_unidade_item: 'UN' }, ctx, buscador),
    ).rejects.toThrowError(/peso_bruto_unidade_item aceita peso/)
  })

  it('aceita cubagem_unidade_item="CM" (comprimento) — decisão UX 2026-05-12', async () => {
    await expect(
      validarUnidadesItem({ cubagem_unidade_item: 'CM' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('aceita cubagem_unidade_item="M2" (area) — decisão UX 2026-05-12', async () => {
    await expect(
      validarUnidadesItem({ cubagem_unidade_item: 'M2' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('aceita cubagem_unidade_item="LT" (volume) — decisão UX 2026-05-12', async () => {
    await expect(
      validarUnidadesItem({ cubagem_unidade_item: 'LT' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('rejeita cubagem_unidade_item="KG" (peso, fora das 3 categorias permitidas)', async () => {
    await expect(
      validarUnidadesItem({ cubagem_unidade_item: 'KG' }, ctx, buscador),
    ).rejects.toThrowError(/cubagem_unidade_item aceita comprimento\|area\|volume/)
  })

  it('rejeita unidade inexistente em cadastros', async () => {
    await expect(
      validarUnidadesItem({ peso_liquido_unidade_item: 'INVALIDA' }, ctx, buscador),
    ).rejects.toThrowError(/Unidade "INVALIDA" nao existe/)
  })

  it('unidade_comercializada_item aceita qualquer categoria (peso)', async () => {
    await expect(
      validarUnidadesItem({ unidade_comercializada_item: 'KG' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('unidade_comercializada_item aceita qualquer categoria (contagem)', async () => {
    await expect(
      validarUnidadesItem({ unidade_comercializada_item: 'UN' }, ctx, buscador),
    ).resolves.toBeUndefined()
  })

  it('unidade_comercializada_item rejeita sigla inexistente', async () => {
    await expect(
      validarUnidadesItem({ unidade_comercializada_item: 'XYZ' }, ctx, buscador),
    ).rejects.toThrowError(/Unidade "XYZ" nao existe/)
  })

  it('ignora campos com valor null/undefined/string vazia', async () => {
    await expect(
      validarUnidadesItem(
        {
          peso_liquido_unidade_item: null,
          peso_bruto_unidade_item: undefined,
          cubagem_unidade_item: '',
        },
        ctx,
        buscador,
      ),
    ).resolves.toBeUndefined()
  })

  it('mensagem de erro inclui correlation_id do ctx', async () => {
    await expect(
      validarUnidadesItem({ peso_liquido_unidade_item: 'INVALIDA' }, ctx, buscador),
    ).rejects.toThrowError(/corr=corr_teste/)
  })
})

describe('UNIDADES_CATEGORIAS_VALIDAS — contrato', () => {
  it('peso_liquido_unidade_item exige categoria peso', () => {
    expect(UNIDADES_CATEGORIAS_VALIDAS.peso_liquido_unidade_item).toEqual(['peso'])
  })

  it('peso_bruto_unidade_item exige categoria peso', () => {
    expect(UNIDADES_CATEGORIAS_VALIDAS.peso_bruto_unidade_item).toEqual(['peso'])
  })

  it('cubagem_unidade_item aceita comprimento|area|volume (decisão UX 2026-05-12)', () => {
    expect(UNIDADES_CATEGORIAS_VALIDAS.cubagem_unidade_item).toEqual([
      'comprimento',
      'area',
      'volume',
    ])
  })

  it('unidade_comercializada_item aceita qualquer categoria (array vazio)', () => {
    expect(UNIDADES_CATEGORIAS_VALIDAS.unidade_comercializada_item).toEqual([])
  })
})
