import { describe, expect, it } from 'vitest'
import {
  contarCamposPreenchidosAlteradosLeituraSmartRead,
  reconstruirIndiceCamposEditadosLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/reconstruir-indice-campos-editados-leitura-smart-read.ts'

describe('Smart Read — reconstruir índice campos editados', () => {
  it('reconstrói chaves de campos alterados a partir de dados_original', () => {
    const indice = reconstruirIndiceCamposEditadosLeituraSmartRead([
      {
        id_arquivo_local: 'local-1',
        indice_documento: 0,
        dados_original: { porto_embarque: 'Shenzhen', exportador: 'Foo' },
        dados: { porto_embarque: 'Shanghai', exportador: 'Foo' },
      },
    ])

    expect(indice.size).toBe(1)
    expect(indice.has('local-1:0:porto_embarque')).toBe(true)
  })

  it('conta apenas preenchidos alterados', () => {
    const total = contarCamposPreenchidosAlteradosLeituraSmartRead([
      {
        id_arquivo_local: 'local-1',
        indice_documento: 0,
        dados_original: { porto_embarque: 'Shenzhen', observacoes: '' },
        dados: { porto_embarque: 'Shanghai', observacoes: 'nova' },
      },
    ])

    expect(total).toBe(2)
  })
})
