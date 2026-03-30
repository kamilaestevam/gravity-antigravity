/**
 * Testes unitarios — Pedido / importEngine.ts
 *
 * Testa parse e normalizacao de arquivos:
 *   - JSON (array e {data: [...]})
 *   - CSV (virgula, ponto-e-virgula, tab)
 *   - XML (tags <pedido>, <row>, <item>)
 *   - Deteccao automatica de mapeamento de colunas
 *   - Normalizacao: agrupar itens por pedido
 *   - Erros: formato invalido, arquivo vazio
 */

import { describe, it, expect } from 'vitest'
import { importEngine } from '../../../servicos-global/tenant/processos-core/src/services/importEngine'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toBuffer(content: string): Buffer {
  return Buffer.from(content, 'utf-8')
}

// ── Testes: JSON ──────────────────────────────────────────────────────────────

describe('importEngine — JSON', () => {
  it('deve parsear JSON array de pedidos', async () => {
    const json = JSON.stringify([
      { numero_pedido: 'PO-001', tipo_operacao: 'importacao', descricao: 'Item A', ncm: '8542.31.90', part_number: 'SKU-1', quantidade: 100 },
      { numero_pedido: 'PO-001', tipo_operacao: 'importacao', descricao: 'Item B', ncm: '8532.24.10', part_number: 'SKU-2', quantidade: 200 },
      { numero_pedido: 'PO-002', tipo_operacao: 'exportacao', descricao: 'Item C', ncm: '3926.90.90', part_number: 'SKU-3', quantidade: 50 },
    ])

    const result = await importEngine.processarArquivo(toBuffer(json), 'pedidos.json')

    expect(result).toHaveLength(2)
    expect(result[0].numero_pedido).toBe('PO-001')
    expect(result[0].itens).toHaveLength(2)
    expect(result[0].itens[0].part_number).toBe('SKU-1')
    expect(result[0].itens[0].quantidade_inicial).toBe(100)
    expect(result[1].numero_pedido).toBe('PO-002')
    expect(result[1].tipo_operacao).toBe('exportacao')
    expect(result[1].itens).toHaveLength(1)
  })

  it('deve parsear JSON com formato { data: [...] }', async () => {
    const json = JSON.stringify({
      data: [
        { numero_pedido: 'PO-010', descricao: 'Produto X', part_number: 'PX', ncm: '0000.00.00', quantidade: 500 },
      ],
    })

    const result = await importEngine.processarArquivo(toBuffer(json), 'export.json')

    expect(result).toHaveLength(1)
    expect(result[0].numero_pedido).toBe('PO-010')
  })

  it('deve rejeitar JSON sem array', async () => {
    const json = JSON.stringify({ nome: 'invalido' })

    await expect(
      importEngine.processarArquivo(toBuffer(json), 'ruim.json')
    ).rejects.toThrow('JSON deve conter um array')
  })
})

// ── Testes: CSV ───────────────────────────────────────────────────────────────

describe('importEngine — CSV', () => {
  it('deve parsear CSV com virgula', async () => {
    const csv = [
      'numero_pedido,descricao,part_number,ncm,quantidade,valor_unitario',
      'PO-100,Parafuso M8,PRF-M8,7318.15.00,5000,0.15',
      'PO-100,Porca M8,PRC-M8,7318.16.00,5000,0.08',
      'PO-101,Arruela M10,ARR-M10,7318.22.00,2000,0.05',
    ].join('\n')

    const result = await importEngine.processarArquivo(toBuffer(csv), 'pedidos.csv')

    expect(result).toHaveLength(2)
    expect(result[0].numero_pedido).toBe('PO-100')
    expect(result[0].itens).toHaveLength(2)
    expect(result[0].itens[0].valor_unitario).toBe(0.15)
    expect(result[1].itens).toHaveLength(1)
  })

  it('deve parsear CSV com ponto-e-virgula', async () => {
    const csv = [
      'numero_pedido;descricao;part_number;ncm;quantidade',
      'PO-200;Motor 5CV;MOT-5;8501.52.00;10',
    ].join('\n')

    const result = await importEngine.processarArquivo(toBuffer(csv), 'dados.csv')

    expect(result).toHaveLength(1)
    expect(result[0].itens[0].descricao).toBe('Motor 5CV')
  })

  it('deve rejeitar CSV com apenas header', async () => {
    const csv = 'numero_pedido,descricao,ncm'

    await expect(
      importEngine.processarArquivo(toBuffer(csv), 'vazio.csv')
    ).rejects.toThrow('pelo menos header + 1 linha')
  })
})

// ── Testes: XML ───────────────────────────────────────────────────────────────

describe('importEngine — XML', () => {
  it('deve parsear XML com tags <pedido>', async () => {
    const xml = `
      <pedidos>
        <pedido>
          <numero_pedido>PO-300</numero_pedido>
          <descricao>Valvula Industrial</descricao>
          <part_number>VLV-01</part_number>
          <ncm>8481.80.99</ncm>
          <quantidade>25</quantidade>
        </pedido>
      </pedidos>
    `

    const result = await importEngine.processarArquivo(toBuffer(xml), 'pedidos.xml')

    expect(result).toHaveLength(1)
    expect(result[0].numero_pedido).toBe('PO-300')
    expect(result[0].itens[0].quantidade_inicial).toBe(25)
  })

  it('deve parsear XML com tags <row>', async () => {
    const xml = `
      <data>
        <row>
          <numero_pedido>PO-400</numero_pedido>
          <part_number>ABC</part_number>
          <ncm>1234.56.78</ncm>
          <descricao>Teste</descricao>
          <quantidade>100</quantidade>
        </row>
      </data>
    `

    const result = await importEngine.processarArquivo(toBuffer(xml), 'dados.xml')

    expect(result).toHaveLength(1)
  })

  it('deve rejeitar XML sem tags reconhecidas', async () => {
    const xml = '<dados><info>teste</info></dados>'

    await expect(
      importEngine.processarArquivo(toBuffer(xml), 'invalido.xml')
    ).rejects.toThrow('XML deve conter elementos')
  })
})

// ── Testes: TXT ───────────────────────────────────────────────────────────────

describe('importEngine — TXT', () => {
  it('deve parsear TXT tab-separated', async () => {
    const txt = [
      'numero_pedido\tpart_number\tncm\tdescricao\tquantidade',
      'PO-500\tSKU-TXT\t9999.00.00\tItem TXT\t750',
    ].join('\n')

    const result = await importEngine.processarArquivo(toBuffer(txt), 'dados.txt')

    expect(result).toHaveLength(1)
    expect(result[0].itens[0].quantidade_inicial).toBe(750)
  })
})

// ── Testes: Formato invalido ──────────────────────────────────────────────────

describe('importEngine — formato invalido', () => {
  it('deve rejeitar formato .docx', async () => {
    await expect(
      importEngine.processarArquivo(Buffer.from(''), 'documento.docx')
    ).rejects.toThrow('nao suportado')
  })

  it('deve rejeitar formato .pdf', async () => {
    await expect(
      importEngine.processarArquivo(Buffer.from(''), 'arquivo.pdf')
    ).rejects.toThrow('nao suportado')
  })

  it('deve rejeitar Excel (sem biblioteca xlsx instalada)', async () => {
    await expect(
      importEngine.processarArquivo(Buffer.from(''), 'planilha.xlsx')
    ).rejects.toThrow('xlsx')
  })
})

// ── Testes: Normalizacao ──────────────────────────────────────────────────────

describe('importEngine — normalizacao', () => {
  it('deve agrupar itens do mesmo pedido', async () => {
    const json = JSON.stringify([
      { numero_pedido: 'PO-X', part_number: 'A', ncm: '0000', descricao: 'Item A', quantidade: 10 },
      { numero_pedido: 'PO-X', part_number: 'B', ncm: '0001', descricao: 'Item B', quantidade: 20 },
      { numero_pedido: 'PO-X', part_number: 'C', ncm: '0002', descricao: 'Item C', quantidade: 30 },
    ])

    const result = await importEngine.processarArquivo(toBuffer(json), 'agrupado.json')

    expect(result).toHaveLength(1)
    expect(result[0].itens).toHaveLength(3)
    expect(result[0].itens[2].quantidade_inicial).toBe(30)
  })

  it('deve detectar tipo_operacao = exportacao', async () => {
    const json = JSON.stringify([
      { numero_pedido: 'SO-001', tipo_operacao: 'export', part_number: 'EXP', ncm: '0', descricao: 'Export', quantidade: 1 },
    ])

    const result = await importEngine.processarArquivo(toBuffer(json), 'export.json')

    expect(result[0].tipo_operacao).toBe('exportacao')
  })

  it('deve usar importacao como tipo padrao quando nao informado', async () => {
    const json = JSON.stringify([
      { numero_pedido: 'PO-DEFAULT', part_number: 'DEF', ncm: '0', descricao: 'Sem tipo', quantidade: 1 },
    ])

    const result = await importEngine.processarArquivo(toBuffer(json), 'default.json')

    expect(result[0].tipo_operacao).toBe('importacao')
  })

  it('deve pular linhas sem numero_pedido', async () => {
    const json = JSON.stringify([
      { numero_pedido: 'PO-OK', part_number: 'A', ncm: '0', descricao: 'Ok', quantidade: 10 },
      { part_number: 'B', ncm: '0', descricao: 'Sem PO', quantidade: 20 },
    ])

    const result = await importEngine.processarArquivo(toBuffer(json), 'parcial.json')

    expect(result).toHaveLength(1)
    expect(result[0].itens).toHaveLength(1)
  })
})
