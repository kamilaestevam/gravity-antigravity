import { describe, expect, it } from 'vitest'
import { QaLeituraRequestSchema } from '../../../../servicos-global/produto/smart-read/shared/qa-leitura-smart-read'
import { montarPromptUsuarioQaLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/server/src/lib/prompt-qa-leitura-smart-read'

describe('qa-leitura-smart-read', () => {
  it('valida payload minimo com documentos e pergunta', () => {
    const payload = QaLeituraRequestSchema.parse({
      documentos: [
        {
          nome_arquivo: 'invoice.pdf',
          tipo_documento: 'INVOICE',
          indice: 0,
          dados: { document: { incoterm: 'EXW' } },
        },
      ],
      pergunta: 'Resumo do exportador',
    })
    expect(payload.historico).toEqual([])
    expect(payload.pergunta).toBe('Resumo do exportador')
  })

  it('monta prompt com historico e pergunta atual', () => {
    const prompt = montarPromptUsuarioQaLeituraSmartRead({
      documentos: [
        {
          nome_arquivo: 'invoice.pdf',
          tipo_documento: 'INVOICE',
          indice: 0,
          dados: { exporter: { name: 'ACME' } },
        },
      ],
      contextoV1: {
        regras: [{ id: 'A1', passou: true, detalhe: 'ok' }],
        ncms_encontrados: ['84713012'],
        tributos_ncm: [],
      },
      pergunta: 'Quem e o exportador?',
      historico: [{ papel: 'usuario', conteudo: 'Ola' }],
    })
    expect(prompt).toContain('PERGUNTA ATUAL DO USUARIO')
    expect(prompt).toContain('Quem e o exportador?')
    expect(prompt).toContain('HISTORICO DA CONVERSA')
    expect(prompt).toContain('ACME')
  })
})
