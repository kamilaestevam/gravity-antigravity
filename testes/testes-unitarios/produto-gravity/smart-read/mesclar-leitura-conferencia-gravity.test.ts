import { describe, expect, it } from 'vitest'
import { mesclarLeituraComConferenciaGravity } from '../../../../servicos-global/produto/smart-read/server/src/lib/mesclar-leitura-conferencia-gravity-smart-read.ts'
import type { Leitura } from '../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

const leituraBase = (dados: Record<string, unknown>): Leitura => ({
  id_leitura: 'leitura-1',
  nome_leitura: 'Teste',
  status_leitura: 'COMPLETED',
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'arq-1',
      nome_arquivo: 'doc.pdf',
      status_arquivo: 'COMPLETED',
      resultado_extracao: [{ tipo_documento: 'Invoice', dados }],
    },
  ],
})

describe('Smart Read — mesclar leitura com conferência Gravity', () => {
  it('usa snapshot quando legado tem arquivo sem extracao', () => {
    const base: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: 'Legado shell',
      status_leitura: 'COMPLETED',
      total_arquivos: 1,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: 'arq-legado',
          nome_arquivo: 'BL.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: null,
        },
      ],
    }
    const conferencia = leituraBase({ exportador: 'Foo Ltda', numero: '100' })

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)

    expect(mesclada.arquivos).toHaveLength(1)
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({
      exportador: 'Foo Ltda',
      numero: '100',
    })
  })

  it('usa snapshot quando legado vem sem arquivos', () => {
    const base: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: 'Legado vazio',
      status_leitura: 'COMPLETED',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    }
    const conferencia = leituraBase({ exportador: 'Foo Ltda', numero: '100' })

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)

    expect(mesclada.arquivos).toHaveLength(1)
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({
      exportador: 'Foo Ltda',
      numero: '100',
    })
  })

  it('injeta dados_original quando snapshot tem dados editados sem original', () => {
    const base = leituraBase({ exportador: 'Foo Ltda', numero: '100' })
    const conferencia = leituraBase({ exportador: 'Foo Ltda', numero: '200' })

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)
    const item = mesclada.arquivos[0]?.resultado_extracao?.[0]

    expect(item?.dados_original).toEqual({ exportador: 'Foo Ltda', numero: '100' })
    expect(item?.dados).toEqual({ exportador: 'Foo Ltda', numero: '200' })
  })

  it('placeholder de vínculo não rebaixa status COMPLETED do legado (regressão 16/07)', () => {
    // Cenário real: POST /leituras grava progresso placeholder (PROCESSING, zero
    // arquivos) via registrarVinculoLeituraUsuarioSmartRead; o DATI conclui o OCR
    // e o GET mescla o progresso. O merge não pode rebaixar o status nem apagar nome.
    const base = leituraBase({ numero_documento: 'PHI0021643' })
    const placeholder: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    }

    const mesclada = mesclarLeituraComConferenciaGravity(base, placeholder)

    expect(mesclada.status_leitura).toBe('COMPLETED')
    expect(mesclada.nome_leitura).toBe('Teste')
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({
      numero_documento: 'PHI0021643',
    })
  })

  it('progresso sem extração mas com nome mescla nome sem rebaixar status', () => {
    const base = leituraBase({ numero: '1' })
    const conferencia: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: 'Nome escolhido pelo usuário',
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    }

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)

    expect(mesclada.nome_leitura).toBe('Nome escolhido pelo usuário')
    expect(mesclada.status_leitura).toBe('COMPLETED')
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({ numero: '1' })
  })

  it('snapshot PROCESSING congelado no PATCH do passo 2 não rebaixa COMPLETED do legado (regressão 16/07 — leitura de 8s durando minutos)', () => {
    // Cenário real: wizard salva progresso durante a análise; o PATCH persiste
    // snapshot com motivo 'conferencia_usuario' (pula elegibilidade) carregando
    // status PROCESSING + extração parcial. Quando o DATI conclui, o GET mescla
    // o snapshot e o status congelado não pode vencer o COMPLETED fresco.
    const base: Leitura = {
      id_leitura: 'leitura-510',
      nome_leitura: 'Leitura 510',
      status_leitura: 'COMPLETED',
      total_arquivos: 2,
      arquivos_processados: 2,
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'invoice_ficticio_teste.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [{ tipo_documento: 'Invoice', dados: { numero: 'INV-77' } }],
        },
        {
          id_arquivo: 'arq-2',
          nome_arquivo: 'packing_list_ficticio.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [{ tipo_documento: 'Packing List', dados: { volumes: '10' } }],
        },
      ],
    }
    const snapshotCongelado: Leitura = {
      id_leitura: 'leitura-510',
      nome_leitura: 'Leitura 510',
      status_leitura: 'PROCESSING',
      total_arquivos: 2,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: 'arq-2',
          nome_arquivo: 'packing_list_ficticio.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [{ tipo_documento: 'Packing List', dados: { volumes: '10' } }],
        },
      ],
    }

    const mesclada = mesclarLeituraComConferenciaGravity(base, snapshotCongelado)

    expect(mesclada.status_leitura).toBe('COMPLETED')
    expect(mesclada.arquivos).toHaveLength(2)
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({ numero: 'INV-77' })
  })

  it('snapshot COMPLETED continua vencendo base PROCESSING (retomar leitura expirada)', () => {
    const base: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    }
    const conferencia = leituraBase({ numero: '1' })

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)

    expect(mesclada.status_leitura).toBe('COMPLETED')
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados).toEqual({ numero: '1' })
  })

  it('snapshot FAILED não é rebaixado nem rebaixa: FAILED do legado prevalece sobre PROCESSING', () => {
    const base: Leitura = {
      ...leituraBase({ numero: '1' }),
      status_leitura: 'FAILED',
    }
    const conferencia: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: 'Com nome',
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    }

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)
    expect(mesclada.status_leitura).toBe('FAILED')
  })

  it('preserva dados_original já gravado no snapshot', () => {
    const base = leituraBase({ exportador: 'Antigo' })
    const conferencia: Leitura = {
      ...leituraBase({ exportador: 'Novo' }),
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'doc.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [
            {
              tipo_documento: 'Invoice',
              dados: { exportador: 'Novo' },
              dados_original: { exportador: 'Original IA' },
            },
          ],
        },
      ],
    }

    const mesclada = mesclarLeituraComConferenciaGravity(base, conferencia)
    expect(mesclada.arquivos[0]?.resultado_extracao?.[0]?.dados_original).toEqual({
      exportador: 'Original IA',
    })
  })
})
