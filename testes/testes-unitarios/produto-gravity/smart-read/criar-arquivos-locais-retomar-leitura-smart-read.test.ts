import { describe, expect, it } from 'vitest'
import { criarArquivosLocaisRetomarDeLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read.ts'
import type { Leitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

function leituraSemDetalheArquivos(total: number): Leitura {
  return {
    id_leitura: 'leitura-950',
    nome_leitura: 'Leitura 950',
    status_leitura: 'PROCESSING',
    total_arquivos: total,
    arquivos_processados: 0,
    arquivos: [],
  }
}

describe('criarArquivosLocaisRetomarDeLeitura', () => {
  it('cria placeholders quando total_arquivos > 0 e arquivos vazio', () => {
    const locais = criarArquivosLocaisRetomarDeLeitura(leituraSemDetalheArquivos(2))
    expect(locais).toHaveLength(2)
    expect(locais[0]?.id_leitura).toBe('leitura-950')
    expect(locais[0]?.status_arquivo_local).toBe('analisando')
    expect(locais[0]?.arquivo.name).toBe('Leitura 950-1')
  })

  it('retorna vazio quando nao ha arquivos nem total e status COMPLETED', () => {
    expect(
      criarArquivosLocaisRetomarDeLeitura({
        ...leituraSemDetalheArquivos(0),
        status_leitura: 'COMPLETED',
      }),
    ).toEqual([])
  })

  it('cria 1 placeholder quando PROCESSING com total 0 e arquivos vazio', () => {
    const locais = criarArquivosLocaisRetomarDeLeitura(leituraSemDetalheArquivos(0))
    expect(locais).toHaveLength(1)
    expect(locais[0]?.status_arquivo_local).toBe('analisando')
    expect(locais[0]?.id_leitura).toBe('leitura-950')
  })

  it('usa nome_arquivo da lista no placeholder unico', () => {
    const locais = criarArquivosLocaisRetomarDeLeitura(leituraSemDetalheArquivos(0), {
      nome_arquivo: 'invoice.pdf',
      total_arquivos: 1,
    })
    expect(locais).toHaveLength(1)
    expect(locais[0]?.arquivo.name).toBe('invoice.pdf')
  })
})
