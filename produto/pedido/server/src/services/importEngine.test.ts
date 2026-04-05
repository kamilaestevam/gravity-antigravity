/**
 * importEngine.test.ts — Testes unitários do importEngine
 *
 * Cobre parseArquivo para formatos: csv, txt, json, xml
 * xlsx/xls omitido por depender de SheetJS com Buffer binário real
 * pdf omitido por depender de Gemini (variável de ambiente + rede)
 */

import { describe, it, expect } from 'vitest'
import { parseArquivo, calcularHashColunas, listarPlanilhas } from './importEngine.js'

// ── parseArquivo — CSV ────────────────────────────────────────────────────────

describe('parseArquivo — csv', () => {
  it('parseia CSV com separador virgula', async () => {
    const csv = 'PO Number,Currency,Qty\nPO-001,USD,100\nPO-002,EUR,50'
    const { linhas, extrator_usado } = await parseArquivo(Buffer.from(csv), 'arquivo.csv')
    expect(extrator_usado).toBe('csv')
    expect(linhas).toHaveLength(2)
    expect(linhas[0]['PO Number']).toBe('PO-001')
    expect(linhas[0]['Currency']).toBe('USD')
    expect(linhas[1]['Qty']).toBe('50')
  })

  it('parseia CSV com separador ponto-e-virgula', async () => {
    const csv = 'Numero;Moeda;Qtd\nPO-001;USD;100'
    const { linhas } = await parseArquivo(Buffer.from(csv), 'arquivo.csv')
    expect(linhas[0]['Numero']).toBe('PO-001')
    expect(linhas[0]['Moeda']).toBe('USD')
  })

  it('parseia CSV com separador tab', async () => {
    const csv = 'Part\tQty\nPART-001\t50'
    const { linhas } = await parseArquivo(Buffer.from(csv), 'arquivo.csv')
    expect(linhas[0]['Part']).toBe('PART-001')
    expect(linhas[0]['Qty']).toBe('50')
  })

  it('respeita aspas duplas em campos com virgula interna', async () => {
    const csv = 'Desc,Qty\n"Produto, com virgula",10'
    const { linhas } = await parseArquivo(Buffer.from(csv), 'arquivo.csv')
    expect(linhas[0]['Desc']).toBe('Produto, com virgula')
  })

  it('ignora linhas vazias', async () => {
    const csv = 'A,B\nval1,val2\n\n\nval3,val4'
    const { linhas } = await parseArquivo(Buffer.from(csv), 'arquivo.csv')
    expect(linhas).toHaveLength(2)
  })

  it('retorna extrator_usado=txt para arquivo .txt', async () => {
    const txt = 'A\tB\nval1\tval2'
    const { extrator_usado } = await parseArquivo(Buffer.from(txt), 'arquivo.txt')
    expect(extrator_usado).toBe('txt')
  })
})

// ── parseArquivo — JSON ───────────────────────────────────────────────────────

describe('parseArquivo — json', () => {
  it('parseia array JSON de objetos', async () => {
    const json = JSON.stringify([
      { po: 'PO-001', qty: 100 },
      { po: 'PO-002', qty: 50 },
    ])
    const { linhas, extrator_usado } = await parseArquivo(Buffer.from(json), 'arquivo.json')
    expect(extrator_usado).toBe('json')
    expect(linhas).toHaveLength(2)
    expect(linhas[0]['po']).toBe('PO-001')
    expect(linhas[0]['qty']).toBe('100')
  })

  it('converte todos os valores para string', async () => {
    const json = JSON.stringify([{ num: 42, bool: true, nulo: null }])
    const { linhas } = await parseArquivo(Buffer.from(json), 'arquivo.json')
    expect(linhas[0]['num']).toBe('42')
    expect(linhas[0]['bool']).toBe('true')
    expect(linhas[0]['nulo']).toBe('')
  })

  it('lanca erro se JSON nao for array', async () => {
    const json = JSON.stringify({ nao: 'e array' })
    await expect(parseArquivo(Buffer.from(json), 'arquivo.json')).rejects.toThrow('JSON deve ser um array')
  })
})

// ── parseArquivo — XML ────────────────────────────────────────────────────────

describe('parseArquivo — xml', () => {
  it('parseia XML simples de um nivel (tags folha direto no root)', async () => {
    // O parser XML atual é simples: funciona com tags folha direto abaixo do root
    const xml = `<root><numero>PO-001</numero><moeda>USD</moeda></root>`
    const { linhas, extrator_usado } = await parseArquivo(Buffer.from(xml), 'arquivo.xml')
    expect(extrator_usado).toBe('xml')
    expect(linhas.length).toBeGreaterThan(0)
    expect(linhas[0]['numero']).toBe('PO-001')
  })

  it('retorna array vazio para XML sem conteudo reconhecivel', async () => {
    const xml = '<root></root>'
    const { linhas } = await parseArquivo(Buffer.from(xml), 'arquivo.xml')
    expect(linhas).toHaveLength(0)
  })
})

// ── parseArquivo — formato desconhecido ──────────────────────────────────────

describe('parseArquivo — formato desconhecido', () => {
  it('lanca erro para extensao nao suportada', async () => {
    await expect(parseArquivo(Buffer.from(''), 'arquivo.docx')).rejects.toThrow('nao suportado')
  })
})

// ── calcularHashColunas ───────────────────────────────────────────────────────

describe('calcularHashColunas', () => {
  it('retorna string de 16 chars (SHA-256 truncado)', () => {
    const hash = calcularHashColunas(['A', 'B', 'C'])
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('e determinístico para a mesma entrada', () => {
    const h1 = calcularHashColunas(['PO Number', 'Currency', 'Qty'])
    const h2 = calcularHashColunas(['PO Number', 'Currency', 'Qty'])
    expect(h1).toBe(h2)
  })

  it('e independente da ordem dos cabecalhos', () => {
    const h1 = calcularHashColunas(['A', 'B', 'C'])
    const h2 = calcularHashColunas(['C', 'A', 'B'])
    expect(h1).toBe(h2)
  })

  it('e diferente para entradas diferentes', () => {
    const h1 = calcularHashColunas(['A', 'B'])
    const h2 = calcularHashColunas(['X', 'Y'])
    expect(h1).not.toBe(h2)
  })

  it('e case-insensitive', () => {
    const h1 = calcularHashColunas(['PO Number'])
    const h2 = calcularHashColunas(['po number'])
    expect(h1).toBe(h2)
  })
})

// ── listarPlanilhas ───────────────────────────────────────────────────────────

describe('listarPlanilhas', () => {
  it('retorna array vazio para arquivo nao-excel', async () => {
    const planilhas = await listarPlanilhas(Buffer.from(''), 'arquivo.csv')
    expect(planilhas).toEqual([])
  })
})
