/**
 * TASK-000424 — contrato mensagem_erro (fim do ponto cego de erro):
 * o errorMessage do DATI atravessa normalizarLeitura, o merge com snapshot e
 * a transação da lista, em vez de ser descartado no polling.
 */
import { describe, expect, it } from 'vitest'
import {
  LeituraSchema,
  normalizarLeitura,
} from '../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read'
import { mesclarLeituraComConferenciaGravity } from '../../../../servicos-global/produto/smart-read/server/src/lib/mesclar-leitura-conferencia-gravity-smart-read'
import { normalizarTransacaoDeLeitura } from '../../../../servicos-global/produto/smart-read/server/src/lib/normalizar-transacao-leitura-smart-read'

function legadoFalho(overrides?: Record<string, unknown>) {
  return {
    _id: 'leitura-falha-001',
    name: 'Leitura 934',
    status: 'failed',
    totalFiles: 1,
    processedFiles: 0,
    files: [
      {
        fileReferenceId: 'arq-1',
        filename: 'invoices.pdf',
        processingStatus: 'failed',
        errorMessage: 'soffice binary not found ao converter o arquivo',
      },
    ],
    ...overrides,
  }
}

describe('normalizarLeitura — mensagem_erro do DATI', () => {
  it('propaga o errorMessage do arquivo falho para leitura e arquivo', () => {
    const leitura = normalizarLeitura(legadoFalho())
    expect(leitura.status_leitura).toBe('FAILED')
    expect(leitura.mensagem_erro).toBe('soffice binary not found ao converter o arquivo')
    expect(leitura.arquivos[0].mensagem_erro).toBe('soffice binary not found ao converter o arquivo')
  })

  it('errorMessage no nível da leitura tem precedência sobre o do arquivo', () => {
    const leitura = normalizarLeitura(
      legadoFalho({ errorMessage: 'Falha geral reportada pelo motor' }),
    )
    expect(leitura.mensagem_erro).toBe('Falha geral reportada pelo motor')
  })

  it('leitura sem erro fica com mensagem_erro null e o contrato aceita', () => {
    const leitura = normalizarLeitura({
      _id: 'leitura-ok-001',
      status: 'completed',
      files: [{ fileReferenceId: 'arq-1', processingStatus: 'completed' }],
    })
    expect(leitura.mensagem_erro).toBeNull()
    expect(() => LeituraSchema.parse(leitura)).not.toThrow()
  })

  it('mensagem vazia/espacos vira null (sem lixo no contrato)', () => {
    const leitura = normalizarLeitura(
      legadoFalho({ files: [{ fileReferenceId: 'arq-1', processingStatus: 'failed', errorMessage: '   ' }] }),
    )
    expect(leitura.mensagem_erro).toBeNull()
  })
})

describe('mesclarLeituraComConferenciaGravity — mensagem_erro sobrevive ao merge', () => {
  it('mensagem fresca do legado vence e snapshot sem mensagem não a apaga', () => {
    const base = normalizarLeitura(legadoFalho())
    const snapshot = LeituraSchema.parse({
      id_leitura: 'leitura-falha-001',
      nome_leitura: 'Leitura 934',
      status_leitura: 'PROCESSING',
      total_arquivos: 1,
      arquivos_processados: 0,
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'invoices.pdf',
          status_arquivo: 'PROCESSING',
          resultado_extracao: [{ tipo_documento: 'INVOICE', dados: { campo: 'x' } }],
        },
      ],
    })

    const mesclada = mesclarLeituraComConferenciaGravity(base, snapshot)
    expect(mesclada.mensagem_erro).toBe('soffice binary not found ao converter o arquivo')
    // Regra existente preservada: status terminal do legado não regride.
    expect(mesclada.status_leitura).toBe('FAILED')
  })

  it('snapshot com mensagem preenche quando o legado não trouxe', () => {
    const base = normalizarLeitura({
      _id: 'leitura-x',
      status: 'processing',
      files: [{ fileReferenceId: 'arq-1', processingStatus: 'processing' }],
    })
    const snapshot = LeituraSchema.parse({
      id_leitura: 'leitura-x',
      nome_leitura: 'Leitura X',
      status_leitura: 'FAILED',
      total_arquivos: 1,
      arquivos_processados: 0,
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'doc.pdf',
          status_arquivo: 'FAILED',
          resultado_extracao: [{ tipo_documento: 'INVOICE', dados: { campo: 'x' } }],
        },
      ],
      mensagem_erro: 'Erro congelado no snapshot',
    })

    const mesclada = mesclarLeituraComConferenciaGravity(base, snapshot)
    expect(mesclada.mensagem_erro).toBe('Erro congelado no snapshot')
  })
})

describe('normalizarTransacaoDeLeitura — mensagem_erro na lista', () => {
  it('a transação carrega a mensagem da leitura (persistida no snapshot)', () => {
    const leitura = normalizarLeitura(legadoFalho())
    const transacao = normalizarTransacaoDeLeitura(leitura)
    expect(transacao.mensagem_erro).toBe('soffice binary not found ao converter o arquivo')
  })
})
