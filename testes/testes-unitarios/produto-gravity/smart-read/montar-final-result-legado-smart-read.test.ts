/**
 * montar-final-result-legado-smart-read.test.ts
 */

import { describe, expect, it } from 'vitest'
import {
  arquivoGravityTemConferencia,
  montarFinalResultArquivoParaLegado,
} from '../../../../servicos-global/produto/smart-read/server/src/lib/montar-final-result-legado-smart-read.ts'

describe('montarFinalResultArquivoParaLegado', () => {
  it('monta finalResult com ids do legado e dados da conferência Gravity', () => {
    const finalResult = montarFinalResultArquivoParaLegado({
      itensLegado: [
        { id: 42, fileType: 'INVOICE', data: { exporter: { name: 'Antigo' } } },
      ],
      arquivoGravity: {
        id_arquivo: 'arq-1',
        nome_arquivo: 'invoice.pdf',
        status_arquivo: 'COMPLETED',
        resultado_extracao: [
          {
            tipo_documento: 'INVOICE',
            dados: { exporter: { name: 'Corrigido' } },
            dados_original: { exporter: { name: 'Antigo' } },
          },
        ],
      },
    })

    expect(finalResult).toEqual([
      {
        id: 42,
        fileType: 'INVOICE',
        data: { exporter: { name: 'Corrigido' } },
      },
    ])
  })

  it('detecta conferência quando há dados_original', () => {
    expect(
      arquivoGravityTemConferencia({
        id_arquivo: 'a',
        nome_arquivo: null,
        status_arquivo: 'COMPLETED',
        resultado_extracao: [{ tipo_documento: 'BL', dados: {}, dados_original: {} }],
      }),
    ).toBe(true)
  })
})
