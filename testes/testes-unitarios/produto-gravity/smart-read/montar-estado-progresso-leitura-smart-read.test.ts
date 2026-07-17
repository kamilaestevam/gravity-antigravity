import { describe, expect, it } from 'vitest'
import { montarEstadoProgressoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/client/src/shared/montar-estado-progresso-leitura-smart-read.ts'
import type { ArquivoLocalNovaLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read.ts'

function arquivoAnalisando(idLeitura: string): ArquivoLocalNovaLeitura {
  return {
    id_arquivo_local: 'local-1',
    arquivo: new File(['x'], 'invoice.pdf'),
    status_arquivo_local: 'analisando',
    id_leitura: idLeitura,
    id_arquivo: 'arq-1',
    leitura: null,
    mensagem_erro: null,
    expandido: false,
  }
}

describe('montarEstadoProgressoLeituraSmartRead', () => {
  it('persiste passo 2 com upload em andamento (sem analise completa)', () => {
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos: [arquivoAnalisando('leitura-950')],
      passo: 2,
      nomeLeitura: 'Leitura 950',
      idLeituraExistente: null,
    })
    expect(estado?.passo).toBe(2)
    expect(estado?.leitura.id_leitura).toBe('leitura-950')
    expect(estado?.leitura.arquivos).toHaveLength(1)
    expect(estado?.leitura.status_leitura).toBe('PROCESSING')
  })

  it('nao monta passo 2 sem id_leitura nos arquivos', () => {
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos: [
        {
          ...arquivoAnalisando('leitura-950'),
          id_leitura: null,
          id_arquivo: null,
          status_arquivo_local: 'anexado',
        },
      ],
      passo: 2,
      nomeLeitura: 'Leitura 950',
      idLeituraExistente: null,
    })
    expect(estado).toBeNull()
  })
})
