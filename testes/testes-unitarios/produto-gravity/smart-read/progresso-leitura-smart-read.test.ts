import { describe, expect, it } from 'vitest'
import { escolherLeituraEfetivaRetomarSmartRead } from '../../../../servicos-global/produto/smart-read/shared/escolher-leitura-efetiva-retomar-smart-read.ts'
import { escolherProgressoSalvoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/shared/escolher-progresso-salvo-leitura-smart-read.ts'
import {
  normalizarPassoRegistroProgressoLeituraSmartRead,
  resolverPassoRetomarLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/resolver-passo-retomar-leitura-smart-read.ts'
import {
  extrairDadosSessaoProgressoLeitura,
  montarRespostaProgressoLeitura,
} from '../../../../servicos-global/produto/smart-read/server/src/schemas/progresso-leitura-smart-read.ts'
import {
  extrairCacheAnaliseRiscosProgresso,
  mesclarCacheAnaliseRiscosProgresso,
} from '../../../../servicos-global/produto/smart-read/shared/analise-riscos-cache-progresso-smart-read.ts'

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

  it('normaliza passo 1 legado no GET para COMPLETED → passo 4', () => {
    const resposta = montarRespostaProgressoLeitura(1, {
      nome: 'DANIEL01',
      leitura: leituraMinima,
    })
    expect(resposta.passo).toBe(4)
  })

  it('normaliza passo 1 legado no GET para PROCESSING → passo 2', () => {
    const resposta = montarRespostaProgressoLeitura(1, {
      nome: 'Em andamento',
      leitura: { ...leituraMinima, status_leitura: 'PROCESSING' },
    })
    expect(resposta.passo).toBe(2)
  })

  it('COMPLETED respeita passo salvo (Conferência) e cai em 4 sem progresso', () => {
    expect(resolverPassoRetomarLeituraSmartRead('COMPLETED', 3)).toBe(3)
    expect(resolverPassoRetomarLeituraSmartRead('COMPLETED', 2)).toBe(2)
    expect(resolverPassoRetomarLeituraSmartRead('COMPLETED', null)).toBe(4)
  })

  it('PROCESSING retoma no passo salvo ou 2', () => {
    expect(resolverPassoRetomarLeituraSmartRead('PROCESSING', 3)).toBe(3)
    expect(resolverPassoRetomarLeituraSmartRead('PROCESSING', 1)).toBe(2)
    expect(resolverPassoRetomarLeituraSmartRead('PROCESSING', null)).toBe(2)
  })

  it('normalizarPassoRegistroProgresso cobre passo fora do intervalo', () => {
    expect(normalizarPassoRegistroProgressoLeituraSmartRead(1, 'COMPLETED')).toBe(4)
    expect(normalizarPassoRegistroProgressoLeituraSmartRead(0, 'PROCESSING')).toBe(2)
    expect(normalizarPassoRegistroProgressoLeituraSmartRead(3, 'COMPLETED')).toBe(3)
  })

  it('extrai dados_sessao do JSON do banco', () => {
    const dados = extrairDadosSessaoProgressoLeitura({
      nome: 'Teste',
      leitura: leituraMinima,
    })
    expect(dados?.nome).toBe('Teste')
    expect(dados?.leitura.arquivos).toHaveLength(1)
  })

  it('propaga analise_riscos_cache na resposta de progresso', () => {
    const cacheMinimo = {
      'leitura|doc:0:INVOICE': {
        resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
        contexto_v1: { regras: [], ncms_encontrados: [], cnpj_oficial: null, tributos_ncm: [] },
        llm_ativo: false,
        aviso: null,
        uso_llm_chamada: null,
        uso_llm_leitura: null,
      },
    }
    const resposta = montarRespostaProgressoLeitura(3, {
      nome: 'Embarque BL',
      leitura: leituraMinima,
      analise_riscos_cache: cacheMinimo,
    })
    expect(resposta.analise_riscos_cache).toEqual(cacheMinimo)
    expect(extrairCacheAnaliseRiscosProgresso({ analise_riscos_cache: cacheMinimo })).toEqual(cacheMinimo)
  })

  it('mescla entradas no cache de progresso por chave', () => {
    const resposta = {
      resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
      contexto_v1: { regras: [], ncms_encontrados: [], cnpj_oficial: null, tributos_ncm: [] },
      llm_ativo: true,
      aviso: null,
      uso_llm_chamada: null,
      uso_llm_leitura: null,
    }
    const mesclado = mesclarCacheAnaliseRiscosProgresso({}, 'chave-a', resposta)
    expect(extrairCacheAnaliseRiscosProgresso(mesclado)?.['chave-a']?.llm_ativo).toBe(true)
  })

  it('rejeita sessão inválida', () => {
    expect(extrairDadosSessaoProgressoLeitura({ foo: 'bar' })).toBeNull()
  })

  it('prefere passo local quando remoto está defasado', () => {
    const base = { nome: 'Leitura', leitura: leituraMinima }
    const escolhido = escolherProgressoSalvoLeituraSmartRead(
      { ...base, passo: 2 },
      { ...base, passo: 3 },
    )
    expect(escolhido?.passo).toBe(3)
  })

  it('mescla analise_riscos_cache quando passo local vence sem cache', () => {
    const base = { nome: 'Leitura', leitura: leituraMinima }
    const cacheRemoto = {
      'id|doc:0:INVOICE': {
        resumo: { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 },
        contexto_v1: { regras: [], ncms_encontrados: [], cnpj_oficial: null, tributos_ncm: [] },
        llm_ativo: true,
        aviso: null,
        uso_llm_chamada: null,
        uso_llm_leitura: null,
      },
    }
    const escolhido = escolherProgressoSalvoLeituraSmartRead(
      { ...base, passo: 2, analise_riscos_cache: cacheRemoto },
      { ...base, passo: 3 },
    )
    expect(escolhido?.passo).toBe(3)
    expect(escolhido?.analise_riscos_cache).toEqual(cacheRemoto)
  })

  it('prefere leitura da API quando progresso salvo está vazio', () => {
    const api = {
      ...leituraMinima,
      arquivos: [
        {
          id_arquivo: 'arq-api',
          nome_arquivo: 'Invoice.pdf',
          status_arquivo: 'COMPLETED' as const,
          resultado_extracao: [{ tipo_documento: 'INVOICE', dados: { total: '1' } }],
        },
      ],
    }
    const salva = {
      ...leituraMinima,
      arquivos: [],
    }
    const escolhida = escolherLeituraEfetivaRetomarSmartRead(api, salva)
    expect(escolhida?.arquivos).toHaveLength(1)
    expect(escolhida?.arquivos[0]).toMatchObject({ id_arquivo: 'arq-api' })
  })

  it('prefere progresso salvo quando API retorna leitura sem arquivos', () => {
    const api = {
      ...leituraMinima,
      arquivos: [],
    }
    const salva = {
      ...leituraMinima,
      arquivos: [
        {
          id_arquivo: 'arq-salvo',
          nome_arquivo: 'BL.pdf',
          status_arquivo: 'COMPLETED' as const,
          resultado_extracao: [{ tipo_documento: 'BL', dados: { numero: '1' } }],
        },
      ],
    }
    const escolhida = escolherLeituraEfetivaRetomarSmartRead(api, salva)
    expect(escolhida?.arquivos).toHaveLength(1)
    expect(escolhida?.arquivos[0]).toMatchObject({ id_arquivo: 'arq-salvo' })
  })
})
