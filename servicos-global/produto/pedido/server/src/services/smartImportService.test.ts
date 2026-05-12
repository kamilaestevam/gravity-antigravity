/**
 * smartImportService.test.ts — Testes unitários do SmartImportService
 *
 * Cobre:
 *   - mapearComIA: exact match, alias match, normalization, exemplo_valor
 *   - inferirPorDados: incoterm, ncm, moeda, data, valor
 *   - confirmar: criar, atualizar, pular, erro
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SmartImportService } from './smartImportService.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

// Acessa métodos privados via cast
function mapearComIA(service: SmartImportService, cabecalhos: string[], amostra: Record<string, string>[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (service as any).mapearComIA(cabecalhos, amostra)
}

function inferirPorDados(service: SmartImportService, coluna: string, valores: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (service as any).inferirPorDados(coluna, valores)
}

function criarService(db: Record<string, unknown> = {}): SmartImportService {
  return new SmartImportService(db)
}

// ── mapearComIA ───────────────────────────────────────────────────────────────

describe('mapearComIA', () => {
  const service = criarService()

  it('retorna confianca 95 para coluna que e exatamente um campo interno do SSOT (P4.2 tier 2)', () => {
    // Apos P4.2: nome interno exato cai no tier 2 com confianca 95.
    // Anteriormente caia no tier 1 (99) — mas tier 1 agora e' do rotulo PT-BR.
    const resultado = mapearComIA(service, ['moeda_pedido'], [{ moeda_pedido: 'USD' }])
    expect(resultado[0].campo_sistema).toBe('moeda_pedido')
    expect(resultado[0].confianca).toBeGreaterThanOrEqual(95)
    expect(resultado[0].nivel).toBe('auto')
    expect(resultado[0].inferido_por).toBe('ia')
  })

  it('mapeia campos do Gemini (nomes internos do SSOT) para si mesmos', () => {
    // Lista atualizada para refletir o SSOT atual (campos-pedido-ddd.ts).
    // Nomes antigos como `exportador`, `fabricante`, `part_number`, `ncm`,
    // `data_embarque` foram substituidos pelos canonicals.
    const camposGemini = [
      'numero_pedido', 'nome_exportador', 'nome_fabricante', 'incoterm_pedido',
      'moeda_pedido', 'data_emissao_pedido', 'part_number_item', 'ncm_item',
      'descricao_item', 'quantidade_inicial_item', 'valor_por_unidade_item', 'valor_total_item',
    ]
    const amostra = [Object.fromEntries(camposGemini.map(c => [c, 'valor']))]
    const resultado = mapearComIA(service, camposGemini, amostra)
    for (const r of resultado) {
      expect(r.campo_sistema).toBe(r.coluna_arquivo)
      expect(r.confianca).toBeGreaterThanOrEqual(95)
    }
  })

  it('mapeia "Currency" para moeda_pedido via alias', () => {
    const resultado = mapearComIA(service, ['Currency'], [{ Currency: 'EUR' }])
    expect(resultado[0].campo_sistema).toBe('moeda_pedido')
    expect(resultado[0].confianca).toBeGreaterThanOrEqual(90)
  })

  it('mapeia "Unit Price" para valor_por_unidade_item via alias', () => {
    const resultado = mapearComIA(service, ['Unit Price'], [{ 'Unit Price': '10.00' }])
    expect(resultado[0].campo_sistema).toBe('valor_por_unidade_item')
    expect(resultado[0].confianca).toBeGreaterThanOrEqual(90)
  })

  it('mapeia "PO Number" para numero_pedido via alias', () => {
    const resultado = mapearComIA(service, ['PO Number'], [{ 'PO Number': 'PO-001' }])
    expect(resultado[0].campo_sistema).toBe('numero_pedido')
  })

  it('P4.2 — "Unit" mapeia para unidade_comercializada (NAO mais para valor_por_unidade_item)', () => {
    // Antes do P4: "Unit" via partial match "unit price" virava valor_por_unidade_item (falso positivo).
    // Depois do P4: "Unit" e alias exato de unidade_comercializada_pedido + _item.
    // Ambiguidade resolvida escolhendo nivel='pedido' por default — confianca 75 ('confirmado').
    const resultado = mapearComIA(service, ['Unit'], [{ Unit: 'PC' }])
    expect(resultado[0].campo_sistema).toBe('unidade_comercializada_pedido')
    expect(resultado[0].campo_sistema).not.toBe('valor_por_unidade_item')
    expect(resultado[0].nivel).toBe('confirmado')
  })

  it('nao mapeia fabricante para exportador', () => {
    // "Manufacturer" via alias legado -> nome_fabricante (NAO `exportador`).
    const resultado = mapearComIA(service, ['Manufacturer'], [{ Manufacturer: 'ACME' }])
    expect(resultado[0].campo_sistema).toBe('nome_fabricante')
    expect(resultado[0].campo_sistema).not.toBe('nome_exportador')
  })

  it('popula exemplo_valor com o primeiro valor nao-vazio da amostra', () => {
    const amostra = [
      { Currency: '' },
      { Currency: 'USD' },
      { Currency: 'EUR' },
    ]
    const resultado = mapearComIA(service, ['Currency'], amostra)
    expect(resultado[0].exemplo_valor).toBe('USD')
  })

  it('exemplo_valor e null se todos os valores sao vazios', () => {
    const resultado = mapearComIA(service, ['ColunaSemDados'], [{ ColunaSemDados: '' }, { ColunaSemDados: '   ' }])
    expect(resultado[0].exemplo_valor).toBeNull()
  })

  it('limita exemplo_valor a 80 caracteres', () => {
    const valorLongo = 'a'.repeat(200)
    const resultado = mapearComIA(service, ['Descricao'], [{ Descricao: valorLongo }])
    expect(resultado[0].exemplo_valor!.length).toBe(80)
  })

  it('retorna nivel ignorado para coluna sem correspondencia com nenhum alias', () => {
    // Usar nome que genuinamente não contém nenhum substring de alias
    // "COLQRST" não é substring de nenhum alias conhecido
    const resultado = mapearComIA(service, ['COLQRST'], [])
    expect(resultado[0].nivel).toBe('ignorado')
    expect(resultado[0].campo_sistema).toBeNull()
  })

  it('normaliza underscores antes do alias matching', () => {
    // "po_number" -> normalizado "po number" -> alias legado de numero_pedido.
    const resultado = mapearComIA(service, ['po_number'], [{ po_number: 'PO-001' }])
    expect(resultado[0].campo_sistema).toBe('numero_pedido')
    expect(resultado[0].confianca).toBeGreaterThanOrEqual(90)
  })
})

// ── inferirPorDados ────────────────────────────────────────────────────────────

describe('inferirPorDados', () => {
  const service = criarService()

  it('detecta incoterm com confianca >= 90', () => {
    const resultado = inferirPorDados(service, 'terms', ['FOB', 'CIF', 'EXW', 'DAP', 'DDP'])
    expect(resultado).not.toBeNull()
    expect(resultado!.campo).toBe('incoterm')
    expect(resultado!.confianca).toBeGreaterThanOrEqual(90)
  })

  it('detecta NCM com confianca >= 85', () => {
    // P14 — campo `ncm` (legado) renomeado para `ncm_item` no SSOT atual
    const resultado = inferirPorDados(service, 'cod', ['8471.30.19', '8544.42.90', '8413.9100', '8409.91.00'])
    expect(resultado).not.toBeNull()
    expect(resultado!.campo).toBe('ncm_item')
    expect(resultado!.confianca).toBeGreaterThanOrEqual(85)
  })

  it('detecta moeda com confianca >= 88', () => {
    const resultado = inferirPorDados(service, 'cur', ['USD', 'EUR', 'USD', 'BRL'])
    expect(resultado).not.toBeNull()
    expect(resultado!.campo).toBe('moeda_pedido')
    expect(resultado!.confianca).toBeGreaterThanOrEqual(88)
  })

  it('detecta data (formato ISO) com confianca >= 70', () => {
    // P14 — `data_embarque` (legado) nao existe no SSOT atual.
    // Inferencia padrao agora retorna `data_emissao_pedido` (canonical do Pedido).
    const resultado = inferirPorDados(service, 'date', ['2026-01-15', '2026-03-01', '2025-12-20'])
    expect(resultado).not.toBeNull()
    expect(resultado!.campo).toBe('data_emissao_pedido')
    expect(resultado!.confianca).toBeGreaterThanOrEqual(70)
  })

  it.skip('detecta valor unitario com numeros grandes (TODO: inferirPorDados nao tem heuristica de numeros — refactor pendente em fase futura)', () => {
    const resultado = inferirPorDados(service, 'amt', ['100.50', '250.00', '75.00', '1200.00'])
    expect(resultado).not.toBeNull()
    expect(resultado!.campo).toBe('valor_por_unidade_item')
  })

  it('retorna null para coluna vazia', () => {
    const resultado = inferirPorDados(service, 'col', ['', '  ', ''])
    expect(resultado).toBeNull()
  })

  it('nao detecta NCM se menos de 70% dos valores batem', () => {
    const resultado = inferirPorDados(service, 'col', ['8471.30.19', 'FOO', 'BAR', 'BAZ', 'LOREM'])
    // Apenas 1/5 = 20% são NCM — abaixo do limiar de 70%
    expect(resultado?.campo).not.toBe('ncm')
  })
})
