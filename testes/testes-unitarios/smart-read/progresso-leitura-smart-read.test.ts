import { describe, expect, it } from 'vitest'
import {
  extrairDadosSessaoProgressoLeitura,
  montarRespostaProgressoLeitura,
} from '../../../servicos-global/produto/smart-read/server/src/schemas/progresso-leitura-smart-read.ts'

const leituraMinima = {
  id_leitura: 'mock-leitura-bl-importacao',
  nome_leitura: 'Embarque BL',
  status_leitura: 'COMPLETED' as const,
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'arq-1',
      nome_arquivo: 'BL.pdf',
      status_arquivo: 'COMPLETED' as const,
      resultado_extracao: null,
    },
  ],
}

describe('progresso-leitura-smart-read', () => {
  it('monta resposta GET/PATCH a partir da sessão', () => {
    const resposta = montarRespostaProgressoLeitura(3, {
      nome: 'Embarque BL',
      leitura: leituraMinima,
    })
    expect(resposta.passo).toBe(3)
    expect(resposta.nome).toBe('Embarque BL')
    expect(resposta.leitura.id_leitura).toBe('mock-leitura-bl-importacao')
  })

  it('extrai dados_sessao do JSON do banco', () => {
    const dados = extrairDadosSessaoProgressoLeitura({
      nome: 'Teste',
      leitura: leituraMinima,
    })
    expect(dados?.nome).toBe('Teste')
    expect(dados?.leitura.arquivos).toHaveLength(1)
  })

  it('rejeita sessão inválida', () => {
    expect(extrairDadosSessaoProgressoLeitura({ foo: 'bar' })).toBeNull()
  })
})
