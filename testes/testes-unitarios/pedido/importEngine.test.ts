/**
 * Testes unitarios — Pedido / importEngine.ts
 *
 * Testa parse de arquivos (retorna linhas planas — Record<string, string>[]):
 *   - CSV (virgula, ponto-e-virgula, tab)
 *   - JSON (array — formato unico suportado)
 *   - XML (tags simples)
 *   - TXT tabulado
 *   - listarPlanilhas (retorna [] para nao-xlsx)
 *   - calcularHashColunas
 *   - Erros: formato invalido, arquivo vazio
 */

import { describe, it, expect } from 'vitest'
import {
  parseArquivo,
  listarPlanilhas,
  calcularHashColunas,
} from '../../../produto/pedido/server/src/services/importEngine'

// ── Helper ────────────────────────────────────────────────────────────────────

function toBuffer(content: string): Buffer {
  return Buffer.from(content, 'utf-8')
}

// ── Testes: CSV ───────────────────────────────────────────────────────────────

describe('parseArquivo — CSV com virgula', () => {
  it('deve retornar linhas planas com cabecalhos como chaves', async () => {
    const csv = [
      'PO Number,Part No.,NCM,Qty,Unit Price',
      'PO-100,SKU-A,7318.15.00,5000,0.15',
      'PO-100,SKU-B,7318.16.00,3000,0.08',
    ].join('\n')

    const rows = await parseArquivo(toBuffer(csv), 'pedidos.csv')

    expect(rows).toHaveLength(2)
    expect(rows[0]['PO Number']).toBe('PO-100')
    expect(rows[0]['Part No.']).toBe('SKU-A')
    expect(rows[0]['Qty']).toBe('5000')
    expect(rows[1]['NCM']).toBe('7318.16.00')
  })

  it('deve retornar linhas planas com CSV ponto-e-virgula', async () => {
    const csv = [
      'numero_pedido;descricao;part_number;ncm;quantidade',
      'PO-200;Motor 5CV;MOT-5;8501.52.00;10',
    ].join('\n')

    const rows = await parseArquivo(toBuffer(csv), 'dados.csv')

    expect(rows).toHaveLength(1)
    expect(rows[0]['numero_pedido']).toBe('PO-200')
    expect(rows[0]['descricao']).toBe('Motor 5CV')
    expect(rows[0]['quantidade']).toBe('10')
  })

  it('deve retornar array vazio para CSV com apenas header', async () => {
    const csv = 'numero_pedido,descricao,ncm'
    const rows = await parseArquivo(toBuffer(csv), 'vazio.csv')
    expect(rows).toHaveLength(0)
  })

  it('deve ignorar linhas em branco', async () => {
    const csv = [
      'PO,Qty',
      'PO-001,10',
      '',
      'PO-002,20',
      '',
    ].join('\n')

    const rows = await parseArquivo(toBuffer(csv), 'linhas_branco.csv')
    expect(rows).toHaveLength(2)
  })

  it('deve preservar valores entre aspas com virgula interna', async () => {
    const csv = [
      'PO,Descricao,Qty',
      'PO-X,"Parafuso, rosca fina",100',
    ].join('\n')

    const rows = await parseArquivo(toBuffer(csv), 'aspas.csv')
    expect(rows[0]['Descricao']).toBe('Parafuso, rosca fina')
  })
})

// ── Testes: TXT tabulado ──────────────────────────────────────────────────────

describe('parseArquivo — TXT tab-separated', () => {
  it('deve parsear TXT com tab como separador', async () => {
    const txt = [
      'numero_pedido\tpart_number\tncm\tdescricao\tquantidade',
      'PO-500\tSKU-TXT\t9999.00.00\tItem TXT\t750',
    ].join('\n')

    const rows = await parseArquivo(toBuffer(txt), 'dados.txt')

    expect(rows).toHaveLength(1)
    expect(rows[0]['numero_pedido']).toBe('PO-500')
    expect(rows[0]['quantidade']).toBe('750')
  })
})

// ── Testes: JSON ──────────────────────────────────────────────────────────────

describe('parseArquivo — JSON', () => {
  it('deve parsear JSON array de objetos em linhas planas', async () => {
    const json = JSON.stringify([
      { PO: 'PO-001', SKU: 'SKU-1', NCM: '8471.30.19', Qty: 100 },
      { PO: 'PO-002', SKU: 'SKU-2', NCM: '8544.42.90', Qty: 200 },
    ])

    const rows = await parseArquivo(toBuffer(json), 'pedidos.json')

    expect(rows).toHaveLength(2)
    expect(rows[0]['PO']).toBe('PO-001')
    expect(rows[0]['Qty']).toBe('100')
    expect(rows[1]['NCM']).toBe('8544.42.90')
  })

  it('deve converter todos os valores para string', async () => {
    const json = JSON.stringify([
      { numero: 42, flag: true, valor: 3.14 },
    ])

    const rows = await parseArquivo(toBuffer(json), 'tipos.json')

    expect(typeof rows[0]['numero']).toBe('string')
    expect(rows[0]['numero']).toBe('42')
    expect(rows[0]['flag']).toBe('true')
    expect(rows[0]['valor']).toBe('3.14')
  })

  it('deve rejeitar JSON nao-array', async () => {
    const json = JSON.stringify({ data: [{ PO: 'PO-001' }] })

    await expect(
      parseArquivo(toBuffer(json), 'objeto.json')
    ).rejects.toThrow('JSON deve ser um array')
  })

  it('deve rejeitar JSON string simples', async () => {
    await expect(
      parseArquivo(Buffer.from('"apenas string"'), 'str.json')
    ).rejects.toThrow()
  })
})

// ── Testes: XML ───────────────────────────────────────────────────────────────

describe('parseArquivo — XML', () => {
  it('deve parsear XML plano (campos direto no root) como chaves', async () => {
    // O parser XML do pedido importEngine suporta estrutura plana:
    // <root><campo1>val1</campo1><campo2>val2</campo2></root>
    const xml = `<registro>
      <numero_pedido>PO-300</numero_pedido>
      <ncm>8481.80.99</ncm>
      <quantidade>25</quantidade>
      <part_number>VLV-01</part_number>
    </registro>`

    const rows = await parseArquivo(toBuffer(xml), 'pedidos.xml')

    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]['numero_pedido']).toBe('PO-300')
    expect(rows[0]['ncm']).toBe('8481.80.99')
    expect(rows[0]['quantidade']).toBe('25')
  })

  it('deve retornar array vazio para XML sem conteudo folha', async () => {
    // Tag vazia sem campos internos
    const xml = '<dados></dados>'
    const rows = await parseArquivo(toBuffer(xml), 'vazio.xml')
    expect(rows).toHaveLength(0)
  })
})

// ── Testes: Formato invalido ──────────────────────────────────────────────────

describe('parseArquivo — formato invalido', () => {
  it('deve rejeitar .docx com mensagem de nao suportado', async () => {
    await expect(
      parseArquivo(Buffer.from(''), 'documento.docx')
    ).rejects.toThrow('nao suportado')
  })

  it('deve rejeitar .zip', async () => {
    await expect(
      parseArquivo(Buffer.from(''), 'arquivo.zip')
    ).rejects.toThrow('nao suportado')
  })

  it('deve processar .pdf via pdf-parse (nao rejeita o formato)', async () => {
    // pdf-parse pode falhar com buffer invalido, mas nunca com erro "nao suportado"
    const resultadoOuErro = await parseArquivo(Buffer.from('%PDF-1.4 fake'), 'arquivo.pdf')
      .then(r => ({ ok: true, rows: r }))
      .catch((e: unknown) => ({ ok: false, msg: (e as Error).message }))

    if (!resultadoOuErro.ok) {
      // Se falhou, nao deve ser por formato nao suportado
      expect((resultadoOuErro as { msg: string }).msg).not.toContain('nao suportado')
    } else {
      // Se teve sucesso, deve retornar algum array
      expect(Array.isArray((resultadoOuErro as { rows: unknown[] }).rows)).toBe(true)
    }
  })
})

// ── Testes: listarPlanilhas ───────────────────────────────────────────────────

describe('listarPlanilhas', () => {
  it('deve retornar array vazio para arquivo CSV', async () => {
    const planilhas = await listarPlanilhas(Buffer.from('col1,col2\nv1,v2'), 'dados.csv')
    expect(planilhas).toEqual([])
  })

  it('deve retornar array vazio para arquivo JSON', async () => {
    const planilhas = await listarPlanilhas(Buffer.from('[{}]'), 'dados.json')
    expect(planilhas).toEqual([])
  })

  it('deve retornar array vazio para arquivo TXT', async () => {
    const planilhas = await listarPlanilhas(Buffer.from('col\tval'), 'dados.txt')
    expect(planilhas).toEqual([])
  })

  it('deve retornar array vazio para extensao desconhecida', async () => {
    const planilhas = await listarPlanilhas(Buffer.from(''), 'arquivo.abc')
    expect(planilhas).toEqual([])
  })
})

// ── Testes: calcularHashColunas ───────────────────────────────────────────────

describe('calcularHashColunas', () => {
  it('deve gerar hash deterministico para mesmos cabecalhos', () => {
    const h1 = calcularHashColunas(['PO Number', 'Supplier', 'NCM'])
    const h2 = calcularHashColunas(['PO Number', 'Supplier', 'NCM'])
    expect(h1).toBe(h2)
  })

  it('deve gerar hash diferente para cabecalhos distintos', () => {
    const h1 = calcularHashColunas(['PO', 'Qty'])
    const h2 = calcularHashColunas(['PO', 'NCM'])
    expect(h1).not.toBe(h2)
  })

  it('deve ser independente da ordem dos cabecalhos', () => {
    const h1 = calcularHashColunas(['A', 'B', 'C'])
    const h2 = calcularHashColunas(['C', 'A', 'B'])
    expect(h1).toBe(h2)
  })

  it('deve retornar string hexadecimal de 8 caracteres', () => {
    const hash = calcularHashColunas(['col1', 'col2'])
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('deve tratar cabecalhos case-insensitive para o hash', () => {
    const h1 = calcularHashColunas(['PO NUMBER', 'NCM'])
    const h2 = calcularHashColunas(['po number', 'ncm'])
    expect(h1).toBe(h2)
  })
})
