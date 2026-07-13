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
