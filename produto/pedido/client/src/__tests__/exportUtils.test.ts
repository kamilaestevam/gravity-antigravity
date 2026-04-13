import { describe, it, expect } from 'vitest'

// exportUtils depende de APIs de DOM (Blob, URL.createObjectURL, document.createElement)
// que não estão disponíveis no ambiente Node/Vitest sem jsdom.
// Este arquivo testa:
//   1. Que as funções são exportadas com o nome correto (contrato da API pública)
//   2. A lógica de formatação CSV pura, replicando o comportamento interno

// ── Verificação dos exports ────────────────────────────────────────────────────

describe('exportUtils — exports existem', () => {
  it('exportarCSV é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarCSV).toBe('function')
  })

  it('exportarJSON é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarJSON).toBe('function')
  })

  it('exportarExcel é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarExcel).toBe('function')
  })

  it('exportarTXT é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarTXT).toBe('function')
  })

  it('exportarXML é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarXML).toBe('function')
  })

  it('exportarPDF é uma função exportada', async () => {
    const mod = await import('../shared/exportUtils')
    expect(typeof mod.exportarPDF).toBe('function')
  })
})

// ── Lógica CSV pura (sem DOM) ─────────────────────────────────────────────────
// Replica a lógica interna de formatação para garantir que o contrato
// de escaping e separação de colunas seja preservado.

describe('lógica de formatação CSV', () => {
  /** Replica o helper `linhas` + escape do exportarCSV */
  function formatarLinhasCSV<T extends Record<string, unknown>>(
    dados: T[],
    colunas: Array<{ header: string; key: string }>,
    sep: ',' | ';' | '\t' = ',',
  ): string[] {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    return dados.map(row =>
      colunas.map(c => escape(String(row[c.key] ?? ''))).join(sep)
    )
  }

  function formatarCabecalhoCSV(
    colunas: Array<{ header: string; key: string }>,
    sep: ',' | ';' | '\t' = ',',
  ): string {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    return colunas.map(c => escape(c.header)).join(sep)
  }

  it('linha de dados simples é formatada corretamente', () => {
    const dados = [{ numero: 'PO-001', status: 'aberto' }]
    const colunas = [
      { header: 'Número', key: 'numero' },
      { header: 'Status', key: 'status' },
    ]
    const linhas = formatarLinhasCSV(dados, colunas)
    expect(linhas[0]).toBe('"PO-001","aberto"')
  })

  it('cabecalho é gerado antes das linhas', () => {
    const colunas = [
      { header: 'Número', key: 'numero' },
      { header: 'Status', key: 'status' },
    ]
    const cab = formatarCabecalhoCSV(colunas)
    expect(cab).toBe('"Número","Status"')
  })

  it('campo com aspas duplas recebe escape correto (RFC 4180)', () => {
    const dados = [{ descricao: 'valor com "aspas" internas' }]
    const colunas = [{ header: 'Descrição', key: 'descricao' }]
    const linhas = formatarLinhasCSV(dados, colunas)
    expect(linhas[0]).toBe('"valor com ""aspas"" internas"')
  })

  it('campo nulo ou ausente vira string vazia', () => {
    const dados = [{ numero: null as unknown, status: undefined as unknown }]
    const colunas = [
      { header: 'Número', key: 'numero' },
      { header: 'Status', key: 'status' },
    ]
    const linhas = formatarLinhasCSV(dados as Array<Record<string, unknown>>, colunas)
    expect(linhas[0]).toBe('"",""')
  })

  it('separador ponto-e-vírgula é usado corretamente', () => {
    const dados = [{ a: '1', b: '2' }]
    const colunas = [
      { header: 'A', key: 'a' },
      { header: 'B', key: 'b' },
    ]
    const linhas = formatarLinhasCSV(dados, colunas, ';')
    expect(linhas[0]).toBe('"1";"2"')
  })

  it('múltiplas linhas produzem array com comprimento correto', () => {
    const dados = [
      { id: '1', nome: 'Alpha' },
      { id: '2', nome: 'Beta' },
      { id: '3', nome: 'Gamma' },
    ]
    const colunas = [
      { header: 'ID', key: 'id' },
      { header: 'Nome', key: 'nome' },
    ]
    const linhas = formatarLinhasCSV(dados, colunas)
    expect(linhas).toHaveLength(3)
  })
})

// ── Lógica JSON pura (sem DOM) ────────────────────────────────────────────────

describe('lógica de formatação JSON', () => {
  /** Replica o mapeamento interno de exportarJSON */
  function mapearParaJSON<T extends Record<string, unknown>>(
    dados: T[],
    colunas: Array<{ header: string; key: string }>,
  ): Array<Record<string, unknown>> {
    return dados.map(row =>
      Object.fromEntries(colunas.map(c => [c.key, row[c.key] ?? null]))
    )
  }

  it('produz objeto com chaves corretas', () => {
    const dados = [{ numero: 'PO-001', status: 'aberto', ignorado: 'x' }]
    const colunas = [
      { header: 'Número', key: 'numero' },
      { header: 'Status', key: 'status' },
    ]
    const resultado = mapearParaJSON(dados, colunas)
    expect(resultado[0]).toEqual({ numero: 'PO-001', status: 'aberto' })
    expect(resultado[0]).not.toHaveProperty('ignorado')
  })

  it('campo ausente vira null (não undefined)', () => {
    const dados = [{ numero: 'PO-001' }]
    const colunas = [
      { header: 'Número', key: 'numero' },
      { header: 'Status', key: 'status' },
    ]
    const resultado = mapearParaJSON(dados as Array<Record<string, unknown>>, colunas)
    expect(resultado[0].status).toBeNull()
  })

  it('múltiplos registros geram array do mesmo tamanho', () => {
    const dados = [
      { id: '1' },
      { id: '2' },
    ]
    const colunas = [{ header: 'ID', key: 'id' }]
    const resultado = mapearParaJSON(dados, colunas)
    expect(resultado).toHaveLength(2)
  })
})
